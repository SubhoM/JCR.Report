using System;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using System.Web;
using JCR.Reports.Common;
using JCR.Reports.Models;
using Microsoft.Reporting.WebForms;
using JCR.Reports.ViewModels;
using JCR.Reports.Services;
using System.Configuration;
using System.Collections.Generic;
using System.Text.RegularExpressions;
using JCR.Reports.Models.Enums;
using JCR.Reports.Areas.Corporate.ViewModels;
using JCR.Reports.DataModel;

namespace JCR.Reports.Areas.Corporate.Services
{
    public class ComprehensiveScoring : BaseService
    {
        ExceptionService _exceptionService = new ExceptionService();
        public ReportViewer ComprehensiveScoringRDLC(SearchComprehensiveScoringParams searchParams, Email emailInput, string reportType = "Summary", string applicationPath = "")
        {
            DateTime? startDate = null;
            DateTime? endDate = null;
            string reportDate = "All Dates";

            SearchFormat searchoutput = new SearchFormat();

            if (searchParams.DateStart != null)
            {
                startDate = searchParams.DateStart;
                if (searchParams.DateEnd != null)
                    reportDate = searchParams.DateStart.Value.ToShortDateString() + " - " + searchParams.DateEnd.Value.ToShortDateString();
                else
                    reportDate = "since " + searchParams.DateStart.Value.ToShortDateString();
            }

            if (searchParams.DateEnd != null)
            {
                endDate = searchParams.DateEnd.Value.Date.AddHours(23).AddMinutes(59).AddSeconds(59);
                if (searchParams.DateStart == null)
                    reportDate = "through " + searchParams.DateEnd.Value.ToShortDateString();
            }

            ReportViewer reportViewer = new ReportViewer();
            reportViewer.ProcessingMode = ProcessingMode.Local;
            reportViewer.SizeToReportContent = true;
            try
            {
                if (AppSession.ReportScheduleID > 0 && searchParams.ReportTitle != null)
                    searchParams.ReportTitle = String.Concat(searchParams.ReportTitle, " - Report ID: ", AppSession.ReportScheduleID);
                else
                {
                    searchParams.ReportTitle = WebConstants.AMP_COMPREHENSIVE_SCORING_REPORT;
                }

                string rdlcfilename = string.Empty;
                string dsName = string.Empty;

                rdlcfilename = "rptComprehensiveScoring_Detail.rdlc";
                dsName = "dsComprehensiveScoringDetail";

                DataTable dtblResult = GetReportDataView(searchParams).Tables[0];

                bool showMockSurveyNameColumn = searchParams.IsCorporateAccess;

                showMockSurveyNameColumn = dtblResult.AsEnumerable().Count(a => a.Field<int>("ScoreTypeID") == 4) > 0;

                DataView dvReportResultForEPScoring = new DataView(dtblResult);

                reportViewer.LocalReport.DisplayName = searchParams.ReportTitle;
                reportViewer.LocalReport.ReportPath = applicationPath + @"Areas\Corporate\Reports\" + rdlcfilename;

                if (showMockSurveyNameColumn)//for Mock Survey score Type
                {
                    reportViewer.LocalReport.DataSources.Add(new ReportDataSource(dsName, dvReportResultForEPScoring));
                    reportViewer.LocalReport.DataSources.Add(new ReportDataSource(dsName + "_Final", new DataView()));
                }
                else
                {
                    reportViewer.LocalReport.DataSources.Add(new ReportDataSource(dsName, new DataView()));
                    reportViewer.LocalReport.DataSources.Add(new ReportDataSource(dsName + "_Final", dvReportResultForEPScoring));
                }
                
                ReportParameter p1 = new ReportParameter("ReportTitle", searchParams.ReportTitle);
                ReportParameter p2 = new ReportParameter("Copyright", "© " + DateTime.Now.Year.ToString() + WebConstants.Copyright.ToString());
                ReportParameter p3 = new ReportParameter("ProgramName", searchParams.ProgramName);
                ReportParameter p4 = new ReportParameter("SiteName", searchParams.SiteName);
                ReportParameter p5 = new ReportParameter("ReportDateTitle", DateTime.Now.ToString());
                ReportParameter p6 = new ReportParameter("ChapterNameList", searchParams.ChapterName);
                ReportParameter p7 = new ReportParameter("ScoreDateRange", reportDate);
                ReportParameter p8 = new ReportParameter("ProgramID", searchParams.ProgramID.ToString());
                ReportParameter p9 = new ReportParameter("IncludeCMS", searchParams.chkIncludeCMS.ToString());

                ReportParameterCollection reportParameterCollection = new ReportParameterCollection { p1, p2, p3, p4, p5, p6, p7, p8, p9 };

                reportParameterCollection.Add(new ReportParameter("ScoreType", showMockSurveyNameColumn == true ? "4" : "3"));

                reportViewer.LocalReport.SetParameters(reportParameterCollection);

                if (emailInput.To != null)
                {

                    CommonService emailService = new CommonService();
                    int actionTypeId = (int)ActionTypeEnum.ComprehensiveScoringReport;
                    if (emailService.SendReportEmail(emailInput, actionTypeId, emailService.SetRdlcEmail(reportViewer)))
                    {
                        HttpContext.Current.Session["EmailSuccess"] = "true";
                    }
                    else
                    { HttpContext.Current.Session["EmailSuccess"] = "false"; }

                }

            }
            catch (Exception ex)
            {
                if (ex.Message.ToString() != "No Data")
                {
                    ExceptionLog exceptionLog = new ExceptionLog
                    {
                        ExceptionText = "Reports: " + ex.Message + ";" + ex.InnerException.Message,
                        PageName = "ComprehensiveScoringSummary",
                        MethodName = "ComprehensiveScoringSummaryRDLC",
                        UserID = Convert.ToInt32(AppSession.UserID),
                        SiteId = Convert.ToInt32(AppSession.SelectedSiteId),
                        TransSQL = "",
                        HttpReferrer = null
                    };
                    _exceptionService.LogException(exceptionLog);
                }
                throw ex;
            }

            return reportViewer;
        }
        
        public DataSet GetReportDataView(SearchComprehensiveScoringParams searchParams)
        {
            DataSet ds = new DataSet();

            try
            {
                using (SqlConnection cn = new SqlConnection(this.ConnectionString))
                {
                    cn.Open();

                    string spname = string.Empty;

                    spname = "amp.usmReportComprehensiveScoringDetail";

                    SqlCommand cmd = new SqlCommand(spname, cn);
                    cmd.CommandTimeout = Convert.ToInt32(ConfigurationManager.AppSettings["SPCmdTimeout"].ToString());
                    cmd.CommandType = System.Data.CommandType.StoredProcedure;

                    cmd.Parameters.AddWithValue("SiteID", searchParams.SiteID);
                    cmd.Parameters.AddWithValue("ProgramID", searchParams.ProgramID);
                    cmd.Parameters.AddWithValue("ChapterID", searchParams.ChapterID);

                    //Mock Survey Status Variable. Corporate Reports displays data after Mock Survey Recommendations are approved.
                    var MockSurveyStatusID = (int)MockSurveyStatus.Publish_CCA_Recommendation;
                    cmd.Parameters.AddWithValue("MockSurveyStatusID", MockSurveyStatusID);

                    cmd.Parameters.AddWithValue("DateStart", searchParams.DateStart);
                    cmd.Parameters.AddWithValue("DateEnd", searchParams.DateEnd);
                    cmd.Parameters.AddWithValue("StandardEffBeginDate", null);
                    cmd.Parameters.AddWithValue("CertificationItemID", null);
                    cmd.Parameters.AddWithValue("IncludeCMS", searchParams.chkIncludeCMS);
                    cmd.Parameters.AddWithValue("IsCorporateAccess", Convert.ToInt16(searchParams.IsCorporateAccess).ToString());

#if DEBUG
                    CreateSQLExecuted(spname, cmd);
                    System.Diagnostics.Debug.WriteLine(_SQLExecuted);
#endif
                    SqlDataAdapter da = new SqlDataAdapter(cmd);

                    using (cn)
                    using (cmd)
                    using (da)
                    {
                        da.Fill(ds);
                    }
                }
            }
            catch (Exception ex)
            {
                ex.Data.Add(TSQL, _SQLExecuted);
                throw ex;
            }
            int rowsCount = ds.Tables[0].Rows.Count;
            if (rowsCount == 0)
                throw (new Exception("No Data"));


            return ds;
        }

    }
}