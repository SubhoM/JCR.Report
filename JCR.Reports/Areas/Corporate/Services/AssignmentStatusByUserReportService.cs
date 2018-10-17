using System;
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
    public class AssignmentStatusByUserReportService
    {
        ExceptionService _exceptionService = new ExceptionService();
        public byte[] AssignmentStatusByUserReportRDLC(SearchAssignmentStatusByUser search, int reportType, string SortBy = "", string SortOrder = "")
        {

            byte[] fileContents = null;
            string reportDateTitle = "";

            string rdlcName = String.Empty;
            string dsName = String.Empty;
            string reportSubTitle = String.Empty;
            string stdDetail = string.Empty;
            string findingDetails = string.Empty;
            DataView dv = null;

            ReportParameterCollection reportParameterCollection = new ReportParameterCollection();

            try
            {
                if (AppSession.ReportScheduleID > 0 && search.ReportTitle != null)
                    search.ReportTitle = String.Concat(search.ReportTitle, " - Report ID: ", AppSession.ReportScheduleID);
                else
                    search.ReportTitle = "Assignment Status by User Report";
                //reportDateTitle = CommonService.InitializeReportDateTitle("Due", search.StartDate, search.EndDate);

                if (search.StartDate != null && search.EndDate != null)
                {
                    reportDateTitle = "Due Date for " + search.StartDate.Value.ToShortDateString() + " - " + search.EndDate.Value.ToShortDateString();
                }
                else if (search.StartDate != null && search.EndDate == null)
                {
                    reportDateTitle = "Due Date since " + search.StartDate.Value.ToShortDateString();
                }
                else if (search.StartDate == null && search.EndDate != null)
                {
                    reportDateTitle = "Due Date through " + search.EndDate.Value.ToShortDateString();
                }
                else
                {
                    reportDateTitle = "Due Date: All";
                }

                search.EndDate = (search.EndDate != null && search.EndDate.ToString() != "") ? search.EndDate.Value.Date.AddHours(23).AddMinutes(29).AddSeconds(59) : search.EndDate;

                // Setup ReportViewer 
                ReportViewer reportViewer = new ReportViewer();
                reportViewer.ProcessingMode = ProcessingMode.Local;
                reportViewer.SizeToReportContent = true;
                reportViewer.LocalReport.DisplayName = search.ReportTitle;

                switch ((AssignmentStatusByUserSummaryLevels)search.LevelIdentifier)
                {
                    case AssignmentStatusByUserSummaryLevels.Level1_ByUser:
                        rdlcName = "rptReportAssignmentStatusByUser_UserLevel.rdlc";
                        dsName = "dsReport_AssignmentStatusByUser_UserLevel";
                        dv = new DataView(AssignmentService.GetAssignmentStatusByUser_UserData(search).ToDataTable());
                        reportSubTitle = "Status by User";
                        break;

                    case AssignmentStatusByUserSummaryLevels.Level2_ByChapter:
                        rdlcName = "rptReportAssignmentStatusByUser_ChapterLevel.rdlc";
                        dsName = "dsReport_AssignmentStatusByUser_ChapterLevel";
                        dv = new DataView(AssignmentService.GetAssignmentStatusByUser_ChapterData(search).ToDataTable());
                        reportSubTitle = "Status by Chapter";
                        break;

                    case AssignmentStatusByUserSummaryLevels.Level3_ByStandard:
                        rdlcName = "rptReportAssignmentStatusByUser_StandardLevel.rdlc";
                        dsName = "dsReport_AssignmentStatusByUser_StandardLevel";
                        dv = new DataView(AssignmentService.GetAssignmentStatusByUser_StandardData(search).ToDataTable());
                        reportSubTitle = "Status by Standard";
                        break;
                }

                // Setup Report Parmaeters common to all reports
                reportParameterCollection.Add(new ReportParameter("ReportTitle", search.ReportTitle.ToString()));
                reportParameterCollection.Add(new ReportParameter("Programs", search.ProgramNames.ToString()));
                reportParameterCollection.Add(new ReportParameter("Chapters", search.SelectedChapterNames.ToString()));
                reportParameterCollection.Add(new ReportParameter("Standards", search.SelectedStandardNames.ToString()));
                reportParameterCollection.Add(new ReportParameter("ReportDateTitle", reportDateTitle.ToString()));
                reportParameterCollection.Add(new ReportParameter("HCOID", search.SelectedSiteHCOIDs.ToString()));
                reportParameterCollection.Add(new ReportParameter("Copyright", "© " + DateTime.Now.Year.ToString() + WebConstants.Copyright.ToString()));
                reportParameterCollection.Add(new ReportParameter("ReportSubTitle", reportSubTitle.ToString()));
                reportParameterCollection.Add(new ReportParameter("ScoreType", search.SelectedScoreTypeName));
                reportParameterCollection.Add(new ReportParameter("AssignedTo", search.SelectedAssignedToNames));
                reportParameterCollection.Add(new ReportParameter("ScoreValue", search.ScoreValueNameList));


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
                    PageName = "AssignmentStatusByUserReport",
                    MethodName = "AssignmentStatusByUserReportRDLC",
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