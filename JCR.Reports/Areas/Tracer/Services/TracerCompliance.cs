using JCR.Reports.Common;
using JCR.Reports.Models;
using JCR.Reports.ViewModels;
using Microsoft.Reporting.WebForms;
using System;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using System.Web;
using JCR.Reports.Services;
using JCR.Reports.Areas.Tracer.ViewModels;
using System.Configuration;
using JCR.Reports.Models.Enums;

namespace JCR.Reports.Areas.Tracer.Services
{
    public class TracerCompliance : BaseService
    {
        ExceptionService _exceptionService = new ExceptionService();

        public ReportViewer TracerComplianceRDLC(Search searchParams, Email emailInput)
        {
            string reportDateTitle = "All Tracer Dates";
            DateTime? startDate = null;
            DateTime? endDate = null;

            ReportViewer reportViewer = new ReportViewer();
            reportViewer.ProcessingMode = ProcessingMode.Local;
            reportViewer.SizeToReportContent = true;

            SearchFormat searchoutput = new SearchFormat();
            searchoutput.CheckInputs(searchParams);

            try
            {

                if (AppSession.ReportScheduleID > 0)
                    searchParams.ReportTitle = String.Concat(searchParams.ReportTitle, " - Report ID: ", AppSession.ReportScheduleID);

                if (searchParams.StartDate != null)
                {
                    startDate = searchParams.StartDate.Value;
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

                DataView dvReportResult = new DataView(GetTracerComplianceSummary(searchParams).Tables[0]);
                reportViewer.LocalReport.DisplayName = searchParams.ReportTitle;
                reportViewer.LocalReport.ReportPath = HttpContext.Current.Request.MapPath(HttpContext.Current.Request.ApplicationPath) + @"Areas\Tracer\Reports\rptReportTracerComplianceSummary.rdlc";
                reportViewer.LocalReport.DataSources.Add(new ReportDataSource("dsReport_TracerComplianceSummary", dvReportResult));

                ReportParameter p1 = new ReportParameter("SiteID", AppSession.SelectedSiteId.ToString());
                ReportParameter p2 = new ReportParameter("ProgramID", AppSession.SelectedProgramId.ToString());
                ReportParameter p3 = new ReportParameter("TracerCategoryIDs", searchParams.TracerCategoryIDs);
                ReportParameter p4 = new ReportParameter("TracerCustomIDs", searchParams.TracerListIDs);
                ReportParameter p5 = new ReportParameter("FSA", searchParams.IncludeFsa ? "1" : "0");
                ReportParameter p6 = new ReportParameter("GroupBy", ((int)Enum.Parse(typeof(TracerComplianceGroupBy), searchParams.GroupByObsQues)).ToString());
                ReportParameter p7 = new ReportParameter("CycleID", AppSession.CycleID.ToString());
                ReportParameter p8 = new ReportParameter("SiteName", AppSession.SelectedSiteName);
                ReportParameter p9 = new ReportParameter("ProgramName", AppSession.SelectedProgramName);
                ReportParameter p10 = new ReportParameter("ReportDateTitle", reportDateTitle.ToString());
                ReportParameter p11 = new ReportParameter("Copyright", "© " + DateTime.Now.Year.ToString() + WebConstants.Tracer_Copyright.ToString());
                ReportParameter p12 = new ReportParameter("CategoryNames", searchParams.TracerCategoryNames);
                ReportParameter p13 = new ReportParameter("ReportDisplayType", ((int)Enum.Parse(typeof(ReportTypeNoExcel), searchParams.ReportType)).ToString());
                ReportParameter p14 = new ReportParameter("ReportTitle", searchParams.ReportTitle);
                ReportParameter p15 = new ReportParameter("OrgTypeLevel1Names", searchParams.OrgTypeLevel1Names);
                ReportParameter p16 = new ReportParameter("OrgTypeLevel2Names", searchParams.OrgTypeLevel2Names);
                ReportParameter p17 = new ReportParameter("OrgTypeLevel3Names", searchParams.OrgTypeLevel3Names);
                ReportParameter p18 = new ReportParameter("OrgType1Header", AppSession.OrgRanking1Name.ToString());
                ReportParameter p19 = new ReportParameter("OrgType2Header", AppSession.OrgRanking2Name.ToString());
                ReportParameter p20 = new ReportParameter("OrgType3Header", AppSession.OrgRanking3Name.ToString());
                ReportParameter p21 = new ReportParameter("IsCMSProgram", AppSession.IsCMSProgram ? "1" : "0");

                ReportParameterCollection reportParameterCollection = new ReportParameterCollection { p1, p2, p3, p4, p5, p6, p7, p8, p9, p10, p11, p12, p13, p14, p15, p16, p17, p18, p19, p20, p21 };
                reportViewer.LocalReport.SetParameters(reportParameterCollection);

                if (emailInput.To != null)
                {
                    CommonService emailService = new CommonService();
                    int actionType = (int)ActionTypeEnum.TracerComplianceSummaryReport;
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
                        PageName = "TracerCompliance",
                        MethodName = "TracerComplianceRDLC",
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

        private DataSet GetTracerComplianceSummary(Search searchParams)
        {
            DataSet ds = new DataSet();
            try
            {
                using (SqlConnection cn = new SqlConnection(this.ConnectionString))
                {
                    cn.Open();
                    SqlCommand cmd = new SqlCommand("ustReport_TracerComplianceSummary", cn);
                    cmd.CommandTimeout = Convert.ToInt32(ConfigurationManager.AppSettings["SPCmdTimeout"].ToString());
                    cmd.CommandType = System.Data.CommandType.StoredProcedure;

                    cmd.Parameters.AddWithValue("SiteID", AppSession.SelectedSiteId);
                    cmd.Parameters.AddWithValue("ProgramID", AppSession.SelectedProgramId);
                    cmd.Parameters.AddWithValue("TracerCategoryIDs", searchParams.TracerCategoryIDs);
                    cmd.Parameters.AddWithValue("TracerCustomIDs", searchParams.TracerListIDs);
                    cmd.Parameters.AddWithValue("OrgIDs_Rank1_Depts", searchParams.OrgTypeLevel1IDs);
                    cmd.Parameters.AddWithValue("OrgIDs_Rank2", searchParams.OrgTypeLevel2IDs);
                    cmd.Parameters.AddWithValue("OrgIDs_Rank3", searchParams.OrgTypeLevel3IDs);
                    cmd.Parameters.AddWithValue("OrgActive", searchParams.InActiveOrgTypes ? 0 : 1);
                    cmd.Parameters.AddWithValue("FSA", searchParams.IncludeFsa ? 1 : 0);
                    cmd.Parameters.AddWithValue("GroupBy", ((int)Enum.Parse(typeof(TracerComplianceGroupBy), searchParams.GroupByObsQues)).ToString());
                    cmd.Parameters.AddWithValue("CycleID", AppSession.CycleID);
                    cmd.Parameters.AddWithValue("StartDate", searchParams.StartDate);
                    cmd.Parameters.AddWithValue("EndDate", searchParams.EndDate);

                    //Get the SQL statement for logging
                    CreateSQLExecuted("ustReport_TracerComplianceSummary", cmd);

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