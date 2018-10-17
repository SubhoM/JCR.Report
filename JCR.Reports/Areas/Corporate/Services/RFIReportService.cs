﻿using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Web;
using JCR.Reports.Common;
using JCR.Reports.DataModel;
using JCR.Reports.Models;
using JCR.Reports.Services;
using Microsoft.Reporting.WebForms;

namespace JCR.Reports.Areas.Corporate.Services
{
    public class RFIReportService : BaseService
    {
        public RFIReportService()
            : base()
        {
        }
        ExceptionService _exceptionService = new ExceptionService();
        public byte[] RFIReportRDLC(SearchCorporateER search, int reportType, string SortBy = "", string SortOrder = "")
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
                if (AppSession.ReportScheduleID > 0 && search.ReportTitle != null)
                    search.ReportTitle = String.Concat(search.ReportTitle, " - Report ID: ", AppSession.ReportScheduleID);
                else
                    search.ReportTitle = "Priority Findings RFI Report";
                reportDateTitle = CommonService.InitializeReportDateTitle("Observation", search.StartDate, search.EndDate);
                search.EndDate = (search.EndDate != null && search.EndDate.ToString() != "") ? search.EndDate.Value.Date.AddHours(23).AddMinutes(29).AddSeconds(59) : search.EndDate;

                // Setup ReportViewer 
                ReportViewer reportViewer = new ReportViewer();
                reportViewer.ProcessingMode = ProcessingMode.Local;
                reportViewer.SizeToReportContent = true;
                reportViewer.LocalReport.DisplayName = search.ReportTitle;

                int maxRowCount = 0;

                // LevelIdentifier references the specific RDLC report requested
                switch (search.LevelIdentifier)
                {
                    case (int)WebConstants.CorporateSummaryLevels.Level1_Program:
                    default:
                        {
                            rdlcName = "rptReportRFIFindingsByProgram.rdlc";
                            dsName = "dsReport_RFIFindingsbyProgram";
                            var result = TJCRFIFinding.GetRFIFindingByProgram(search);

                            maxRowCount = (from l in result
                                           group l by new
                                           {
                                               l.ProgramID
                                           } into g
                                           select new
                                           {
                                               totalCount = g.Sum(a => a.PSCount + a.RFICount + a.FSCount)
                                           }).Max(a => a.totalCount);

                            dv = new DataView(result.ToDataTable());
                            reportSubTitle = "Findings by Program";
                            //stdDetail = "*This graph represents 100% of the total findings for selected sites and criteria.";
                            stdDetail = "  ";
                            break;
                        }

                    case (int)WebConstants.CorporateSummaryLevels.Level2_Chapter:
                        {
                            rdlcName = "rptReportRFIFindingsPareto.rdlc";
                            dsName = "dsReport_RFIFindingsPareto";
                            var result = TJCRFIFinding.GetRFIFindingByChapter(search);

                            maxRowCount = (from l in result
                                           group l by new
                                           {
                                               l.ChapterID
                                           } into g
                                           select new
                                           {
                                               totalCount = g.Sum(a => a.PSCount + a.RFICount + a.FSCount)
                                           }).Max(a => a.totalCount);

                            dv = new DataView(result.ToDataTable());
                            reportSubTitle = "Findings by Chapter";
                            //  stdDetail = "*This graph represents 100% of the total findings for selected sites and criteria.";
                            stdDetail = "  ";
                            break;
                        }
                    case (int)WebConstants.CorporateSummaryLevels.Level3_Standard:
                        {
                            rdlcName = "rptReportRFIFindingsPareto.rdlc";
                            dsName = "dsReport_RFIFindingsPareto";
                            var result = TJCRFIFinding.GetRFIFindingByStandard(search);

                            maxRowCount = (from l in result
                                           group l by new
                                           {
                                               l.StandardID
                                           } into g
                                           select new
                                           {
                                               totalCount = g.Sum(a => a.PSCount + a.RFICount + a.FSCount)
                                           }).Max(a => a.totalCount);

                            dv = new DataView(result.ToDataTable());
                            reportSubTitle = "Findings by Standard";
                            stdDetail = "*This graph represents " + HttpContext.Current.Session["MaxStandardCount"] + "% of the total findings for selected sites and criteria.";
                            break;
                        }
                }

                // Setup Report Parmaeters common to all reports
                ReportParameter p1 = new ReportParameter("ReportTitle", search.ReportTitle.ToString());
                ReportParameter p2 = new ReportParameter("Programs", search.ProgramNames.ToString());
                ReportParameter p3 = new ReportParameter("Chapters", search.SelectedChapterNames.ToString());
                ReportParameter p4 = new ReportParameter("Standards", search.SelectedStandardNames.ToString());
                ReportParameter p5 = new ReportParameter("ReportDateTitle", reportDateTitle.ToString());
                ReportParameter p6 = new ReportParameter("HCOID", search.SelectedSiteHCOIDs.ToString());
                ReportParameter p7 = new ReportParameter("Copyright", "© " + DateTime.Now.Year.ToString() + WebConstants.Copyright.ToString());
                ReportParameter p8 = new ReportParameter("ReportType", search.ReportType.ToString());
                ReportParameter p9 = new ReportParameter("ReportSubTitle", reportSubTitle.ToString());
                ReportParameter p10 = new ReportParameter("FSA", search.IncludeFsa ? "1" : "0");
                ReportParameter p11 = new ReportParameter("RFI", search.IncludeRFI ? "1" : "0");
                ReportParameter p12 = new ReportParameter("PreScore", search.IncludePre ? "1" : "0");
                ReportParameter p13 = new ReportParameter("FinScore", search.IncludeFin ? "1" : "0");

                if (search.LevelIdentifier != (int)WebConstants.CorporateSummaryLevels.Level1_Program)
                {
                    ReportParameter p14 = new ReportParameter("StandardDetail", stdDetail);
                    // reportParameterCollection = new ReportParameterCollection { p1, p2, p3, p4, p5, p6, p7, p8, p9, p10, p11, p12, p13, p14, p15 };
                    reportParameterCollection = new ReportParameterCollection { p1, p2, p3, p4, p5, p6, p7, p8, p9, p10, p11, p12, p13, p14 };
                }
                else
                    //reportParameterCollection = new ReportParameterCollection { p1, p2, p3, p4, p5, p6, p7, p8, p9, p10, p11, p12, p13, p14 };
                    reportParameterCollection = new ReportParameterCollection { p1, p2, p3, p4, p5, p6, p7, p8, p9, p10, p11, p12, p13 };

                reportParameterCollection.Add(new ReportParameter("MaxRowCount", maxRowCount.ToString()));

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

                string format = WebConstants.REPORT_FORMAT_PDF;      // PDF is default
                if (reportType == (int)WebConstants.ReportFormat.EXCEL)
                    format = WebConstants.REPORT_FORMAT_EXCEL;        // If Excel option chosen
                fileContents = reportViewer.LocalReport.Render(format, null, out mimeType, out encoding, out extension, out streamIds, out warnings);
            }
            catch (Exception ex)
            {
                ExceptionLog exceptionLog = new ExceptionLog
                {
                    ExceptionText = "Reports: " + ex.Message,
                    PageName = "RFIReportRDLC",
                    MethodName = "RFIReportRDLC",
                    UserID = Convert.ToInt32(AppSession.UserID),
                    SiteId = Convert.ToInt32(AppSession.SelectedSiteId),
                    TransSQL = "",
                    HttpReferrer = null
                };
                _exceptionService.LogException(exceptionLog);
            }

            return fileContents;
        }



    }
}