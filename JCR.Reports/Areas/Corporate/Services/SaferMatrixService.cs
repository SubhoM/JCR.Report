using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

using JCR.Reports.Common;
using JCR.Reports.DataModel;
using JCR.Reports.Models;
using JCR.Reports.Services;
using Microsoft.Reporting.WebForms;
using System.Data;

namespace JCR.Reports.Areas.Corporate.Services
{
    public class SaferMatrixService : BaseService
    {
        public SaferMatrixService()
            : base()
        {
        }


        ExceptionService _exceptionService = new ExceptionService();

        public byte[] SaferReportRDLC(SearchCorporateER search, int reportType, string SortBy = "", string SortOrder = "")
        {

            byte[] fileContents = null;
            string reportDateTitle = "";

            string rdlcName = String.Empty;
            string dsName = String.Empty;
            string reportSubTitle = String.Empty;
            string stdDetail = string.Empty;
            string findingDetails = string.Empty;
            DataView dv = null;

            ReportParameterCollection reportParameterCollection = null;

            try
            {
                if (AppSession.ReportScheduleID > 0 && !string.IsNullOrEmpty(search.ReportTitle))
                    search.ReportTitle = String.Concat(search.ReportTitle, " - Report ID: ", AppSession.ReportScheduleID);
                else
                    search.ReportTitle = "Safer Matrix Report";
                reportDateTitle = CommonService.InitializeReportDateTitle("Score", search.StartDate, search.EndDate);
                search.EndDate = (search.EndDate != null && search.EndDate.ToString() != "") ? search.EndDate.Value.Date.AddHours(23).AddMinutes(29).AddSeconds(59) : search.EndDate;

                // Setup ReportViewer 
                ReportViewer reportViewer = new ReportViewer();
                reportViewer.ProcessingMode = ProcessingMode.Local;
                reportViewer.SizeToReportContent = true;
                reportViewer.LocalReport.DisplayName = search.ReportTitle;
                var scope = string.Empty;
                var like = string.Empty;
                // LevelIdentifier references the specific RDLC report requested
                switch (search.LevelIdentifier)
                {
                    case (int)WebConstants.SaferMatrixLevels.Level1_Program:
                    default:
                        {
                            rdlcName = "rptCorporate_Findings.rdlc";
                            dsName = "dsSafer";
                            dv = new DataView(SaferMatrix.GetSaferMatrixRDLC(search).ToDataTable());
                            reportSubTitle = "Safer Findings by Program";
                            break;
                        }

                    case (int)WebConstants.SaferMatrixLevels.Level2_Site:
                        {
                            scope = GetScope(search.MatrixID);
                            like = GetLikelihood(search.MatrixID);
                            rdlcName = "rptSaferMatrix_BySite.rdlc";
                            dsName = "dsSaferMatrixBySite";
                            dv = new DataView(SaferMatrix.GetSaferMatrixSummaryBySite(search).ToDataTable());
                            reportSubTitle = "Safer Findings by Site";
                            break;
                        }
                    case (int)WebConstants.SaferMatrixLevels.Level3_Chapter:
                        {
                            scope = GetScope(search.MatrixID);
                            like = GetLikelihood(search.MatrixID);
                            rdlcName = "rptSaferMatrix_ByChapter.rdlc";
                            dsName = "dsSaferMatrixByChapter";
                            dv = new DataView(SaferMatrix.GetSaferMatrixSummaryByChapter(search).ToDataTable());
                            reportSubTitle = "Safer Findings by Chapter";
                            break;
                        }
                }

                bool isFalse = false;

                var showSaferMatrix = search.ScoreType == "4" ? true : false;

                var scoreType = string.Empty;
                //Score
                switch(search.ScoreType.ToString())
                {
                    case "1":
                        scoreType = "Individual";
                        break;
                    case "2":
                        scoreType = "Preliminary";
                        break;
                    case "3":
                        scoreType = "Final";
                        break;
                    case "4":
                        scoreType = "Mock Survey";
                        break;
                }

                // Setup Report Parmaeters common to all reports
                ReportParameter p1 = new ReportParameter("ReportTitle", search.ReportTitle.ToString());
                ReportParameter p2 = new ReportParameter("ReportProductName", string.Empty);
                ReportParameter p3 = new ReportParameter("Copyright", "© " + DateTime.Now.Year.ToString() + WebConstants.Copyright.ToString());
                ReportParameter p4 = new ReportParameter("ProgramName", search.ProgramNames.ToString());
                ReportParameter p5 = new ReportParameter("SiteName", string.Empty);
                ReportParameter p6 = new ReportParameter("SiteAddress", string.Empty);
                ReportParameter p7 = new ReportParameter("HCOID", search.SelectedSiteHCOIDs.ToString());
                ReportParameter p8 = new ReportParameter("GreaterThanLimit", isFalse.ToString());
                ReportParameter p9 = new ReportParameter("showSaferMatrix", showSaferMatrix.ToString());
                ReportParameter p10 = new ReportParameter("Chapters", search.SelectedChapterNames.ToString());
                ReportParameter p11 = new ReportParameter("Standards", search.SelectedStandardNames.ToString());
                ReportParameter p12 = new ReportParameter("EPs", search.SelectedEPLabels.ToString());
                ReportParameter p13 = new ReportParameter("IsDraft", isFalse.ToString());
                ReportParameter p14 = new ReportParameter("ReportDateTitle", reportDateTitle.ToString());
                ReportParameter p15 = new ReportParameter("ReportType", search.ReportType.ToString());
                ReportParameter p16 = new ReportParameter("FSA", search.IncludeFsa ? "1" : "0");
                ReportParameter p17 = new ReportParameter("ScoreType", scoreType);

                if (search.LevelIdentifier == 2 || search.LevelIdentifier == 3)
                {
                    ReportParameter p18 = new ReportParameter("Scope", scope);
                    ReportParameter p19 = new ReportParameter("Like", like);

                    reportParameterCollection = new ReportParameterCollection { p1, p2, p3, p4, p5, p6, p7, p8, p9, p10, p11, p12, p13, p14, p15, p16, p17, p18, p19 };

                }
                else
                    reportParameterCollection = new ReportParameterCollection { p1, p2, p3, p4, p5, p6, p7, p8, p9, p10, p11, p12, p13, p14, p15, p16, p17 };


                if (SortBy != "")
                { dv.Sort = SortBy + " " + SortOrder; }
                // Setup Data sources for report
                reportViewer.LocalReport.DataSources.Clear();
                reportViewer.LocalReport.ReportPath = HttpContext.Current.Request.MapPath(HttpContext.Current.Request.ApplicationPath) + @"Areas\Corporate\Reports\" + rdlcName.ToString();
                reportViewer.LocalReport.DataSources.Add(new ReportDataSource(dsName, dv));

                reportViewer.LocalReport.SetParameters(reportParameterCollection);
                Warning[] warnings;
                string[] streamIds;
                string mimeType = string.Empty;
                string encoding = string.Empty;
                string extension = string.Empty;

                string format = WebConstants.REPORT_FORMAT_PDF;
                fileContents = reportViewer.LocalReport.Render(format, null, out mimeType, out encoding, out extension, out streamIds, out warnings);
            }
            catch (Exception ex)
            {
                ExceptionLog exceptionLog = new ExceptionLog
                {
                    ExceptionText = "Reports: " + ex.Message,
                    PageName = "SaferMatrixService",
                    MethodName = "SaferMatrixRDLC",
                    UserID = Convert.ToInt32(AppSession.UserID),
                    SiteId = Convert.ToInt32(AppSession.SelectedSiteId),
                    TransSQL = "",
                    HttpReferrer = null
                };
                _exceptionService.LogException(exceptionLog);
            }

            return fileContents;
        }

        private string GetLikelihood(int matrixID)
        {
            switch(matrixID)
            {
                case 1000:
                    return "ITL";
                case 1121:
                case 1122:
                case 1123:
                    return "Low";
                case 1221:
                case 1222:
                case 1223:
                    return "Moderate";
                case 1321:
                case 1322:
                case 1323:
                    return "High";
                default:
                    return string.Empty;
            }            
        }

        private string GetScope(int matrixID)
        {
            switch (matrixID)
            {
                case 1000:
                    return string.Empty;
                case 1121:
                case 1221:
                case 1321:
                    return "Limited";
                case 1122:
                case 1222:
                case 1322:
                    return "Pattern";
                case 1123:
                case 1223:
                case 1323:
                    return "WideSpread";
                default:
                    return string.Empty;
            }
        }

    }
}