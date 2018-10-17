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
using JCR.Reports.Areas.Tracer.ViewModels;
using System.Configuration;
using JCR.Reports.Models.Enums;

namespace JCR.Reports.Areas.Tracer.Services
{
    public class TJCPriorityFindings : BaseService
    {
        ExceptionService _exceptionService = new ExceptionService();

        public ReportViewer TJCPriorityFindingsRDLC(Search searchParams, Email emailInput)
        {
            DateTime? startDate = null;
            DateTime? endDate = null;
            string reportDateTitle = "All Tracer Dates";

            SearchFormat searchoutput = new SearchFormat();
            searchoutput.CheckInputs(searchParams);

            if (AppSession.ReportScheduleID > 0)
                searchParams.ReportTitle = String.Concat(searchParams.ReportTitle, " - Report ID: ", AppSession.ReportScheduleID);

            if (searchParams.StartDate != null)
            {
                startDate = searchParams.StartDate;
                if (searchParams.EndDate != null)
                    reportDateTitle = "Tracer updates for " + searchParams.StartDate.Value.ToShortDateString() + " - " + searchParams.EndDate.Value.ToShortDateString();
                else
                    reportDateTitle = "Tracer  updates since " + searchParams.StartDate.Value.ToShortDateString();
            }

            if (searchParams.EndDate != null)
            {
                endDate = searchParams.EndDate.Value.Date.AddHours(23).AddMinutes(59).AddSeconds(59);
                if (searchParams.StartDate == null)
                    reportDateTitle = "Tracers updates through " + searchParams.EndDate.Value.ToShortDateString();
            }

            if ((searchParams.TracerCategoryIDs != null) && (searchParams.TracerCategoryIDs.Contains("-1")))
                searchParams.TracerCategoryIDs = null;

            // Get Number of Standards to matchup between TJC Standards and Organizational Standards
            int TopN = 10;
            searchParams.TopFindings = TopN;

            // Add top N to report sub-caption
            reportDateTitle = "Top " + TopN.ToString() + " TJC Standards - " + reportDateTitle.ToString();

            ReportViewer reportViewer = new ReportViewer();
            reportViewer.ProcessingMode = ProcessingMode.Local;
            reportViewer.SizeToReportContent = true;
            try
            {
                DataView dvReportResult = new DataView(GetFindingsReportData(searchParams).Tables[0]);
                reportViewer.LocalReport.DisplayName = searchParams.ReportTitle;
                reportViewer.LocalReport.ReportPath = HttpContext.Current.Request.MapPath(HttpContext.Current.Request.ApplicationPath) + @"Areas\Tracer\Reports\rptReportTracerTJCStandardswithGraph.rdlc";
                reportViewer.LocalReport.DataSources.Add(new ReportDataSource("dsReport_TJCStandards", dvReportResult));

                //Get the Organization Types header for the column header in RDLC
                CommonService oService = new CommonService();
                string sCategoryTitle = oService.OrganizationTypesHeader();

                ReportParameter p1 = new ReportParameter("SiteID", AppSession.SelectedSiteId.ToString());
                ReportParameter p2 = new ReportParameter("ProgramID", AppSession.SelectedProgramId.ToString());
                ReportParameter p3 = new ReportParameter("ReportTitle", searchParams.ReportTitle);
                ReportParameter p4 = new ReportParameter("SiteName", AppSession.SelectedSiteName);
                ReportParameter p5 = new ReportParameter("ProgramName", AppSession.SelectedProgramName);
                ReportParameter p6 = new ReportParameter("ReportDateTitle", reportDateTitle.ToString());
                ReportParameter p7 = new ReportParameter("Copyright", "© " + DateTime.Now.Year.ToString() + WebConstants.Tracer_Copyright.ToString());
                ReportParameter p8 = new ReportParameter("OrgTypesHeader", sCategoryTitle);
                ReportParameter p9 = new ReportParameter("CategoryNames", searchParams.TracerCategoryNames);
                ReportParameter p10 = new ReportParameter("IsCMSProgram", AppSession.IsCMSProgram ? "1" : "0");

                ReportParameterCollection reportParameterCollection = new ReportParameterCollection { p1, p2, p3, p4, p5, p6, p7, p8, p9, p10 };
                reportViewer.LocalReport.SetParameters(reportParameterCollection);

                if (emailInput.To != null)
                {
                    CommonService emailService = new CommonService();
                    int actionType = (int)ActionTypeEnum.TJCPriorityFindingsReport;
                    if (emailService.SendReportEmail(emailInput, actionType, emailService.SetRdlcEmail(reportViewer)))
                    {
                        // do nothing // left place holder for any other actions.
                    }
                    else
                        throw (new Exception("Email"));
                }
            }
            catch (Exception ex)
            {
                if (ex.Message.ToString() != "No Data" && ex.Message.ToString() != "Limit")
                {
                    ExceptionLog exceptionLog = new ExceptionLog
                    {
                        ExceptionText = "Reports: " + ex.Message,
                        PageName = "TJCPriorityFindings",
                        MethodName = "TJCPriorityFindingsRDLC",
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

        private DataSet GetFindingsReportData(Search searchParams)
        {
            DataSet ds = new DataSet();
            try
            {
                using (SqlConnection cn = new SqlConnection(this.ConnectionString))
                {
                    cn.Open();
                    SqlCommand cmd = new SqlCommand("ustReport_TJCStandards", cn);
                    cmd.CommandTimeout = Convert.ToInt32(ConfigurationManager.AppSettings["SPCmdTimeout"].ToString());
                    cmd.CommandType = System.Data.CommandType.StoredProcedure;

                    cmd.Parameters.AddWithValue("SiteID", AppSession.SelectedSiteId);
                    cmd.Parameters.AddWithValue("ProgramID", AppSession.SelectedProgramId);

                    if (String.IsNullOrWhiteSpace(searchParams.TracerCategoryIDs))
                        cmd.Parameters.AddWithValue("TracerCategoryIds", DBNull.Value);
                    else
                        cmd.Parameters.AddWithValue("TracerCategoryIds", searchParams.TracerCategoryIDs);

                    cmd.Parameters.AddWithValue("TopN", searchParams.TopFindings);
                    cmd.Parameters.AddWithValue("CycleID", AppSession.CycleID);
                    cmd.Parameters.AddWithValue("StartDate", searchParams.StartDate);
                    cmd.Parameters.AddWithValue("EndDate", searchParams.EndDate);

                    //Get the SQL statement for logging
                    CreateSQLExecuted("ustReport_TJCStandards", cmd);

                    SqlDataAdapter da = new SqlDataAdapter(cmd);

                    using (cn)
                    using (cmd)
                    using (da)
                    {
                        da.Fill(ds);
                    }
                }
            }
            catch (SqlException)
            {
                throw (new Exception("Limit"));
            }
            catch (Exception ex)
            {
                ex.Data.Add(TSQL, _SQLExecuted);
                throw ex;
            }
            int rowsCount = ds.Tables[0].Rows.Count;
            if (rowsCount == 0)
                throw (new Exception("No Data"));
            else if (rowsCount > Convert.ToInt32(ConfigurationManager.AppSettings["ReportOutputLimit"].ToString()))
                throw (new Exception("Limit"));
            ////If no data exists, throw an exception to display the no rows found message in the UI
            //if (ds.Tables[0].Rows.Count == 0)
            //    throw (new Exception("No Data"));

            return ds;
        }
    }
}