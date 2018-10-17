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
    public class TracerControlChart : BaseService {

        ExceptionService _exceptionService = new ExceptionService();

        public ReportViewer _TracerControlChartRDLC(Search search, Email emailInput) {
            SearchFormat searchoutput = new SearchFormat();
            searchoutput.CheckInputs(search);

            if (AppSession.ReportScheduleID > 0)
                search.ReportTitle = String.Concat(search.ReportTitle, " - Report ID: ", AppSession.ReportScheduleID);

            #region Start and End Dates are Queried to Derive Report Date Title
            if (search.StartDate != null && search.EndDate != null) {
                search.ReportDateTitle = "Tracer updates for " + search.StartDate.Value.ToShortDateString() + " - " + search.EndDate.Value.ToShortDateString();
                search.EndDate = search.EndDate.Value.Date.AddHours(23).AddMinutes(29).AddSeconds(59);
            } else if (search.StartDate != null && search.EndDate == null) {
                search.ReportDateTitle = "Tracer  updates since " + search.StartDate.Value.ToShortDateString();
            } else if (search.StartDate == null && search.EndDate != null) {
                search.ReportDateTitle = "Tracers updates through " + search.EndDate.Value.ToShortDateString();
                search.EndDate = search.EndDate.Value.Date.AddHours(23).AddMinutes(29).AddSeconds(59);
            } else {
                search.ReportDateTitle = "All Tracer Dates";
            }
            #endregion

            ReportViewer reportViewer = new ReportViewer();
            reportViewer.ProcessingMode = ProcessingMode.Local;
            reportViewer.SizeToReportContent = true;
            try {
                reportViewer.LocalReport.DisplayName = search.ReportTitle;
                reportViewer.LocalReport.ReportPath = HttpContext.Current.Request.MapPath(HttpContext.Current.Request.ApplicationPath) + @"Areas\Tracer\Reports\rptReportTracerControlChart.rdlc";
                reportViewer.LocalReport.DataSources.Add(new ReportDataSource("dsReport_TracerControlChart", ReportTracerControlChart(search).Tables[0]));              
             
                ReportParameter p1  = new ReportParameter("FSA", search.IncludeFsa ? "1" : "0");
                ReportParameter p2  = new ReportParameter("GroupBy", ((int)Enum.Parse(typeof(TracerComplianceGroupBy), search.GroupByObsQues)).ToString());
                ReportParameter p3  = new ReportParameter("SiteName", AppSession.SelectedSiteName);
                ReportParameter p4  = new ReportParameter("ProgramName", AppSession.SelectedProgramName);                
                ReportParameter p5  = new ReportParameter("ReportDateTitle", search.ReportDateTitle);
                ReportParameter p6  = new ReportParameter("Copyright", "© " + DateTime.Now.Year.ToString() +  WebConstants.Tracer_Copyright.ToString());
                ReportParameter p7  = new ReportParameter("CategoryNames", search.TracerCategoryNames);                                
                ReportParameter p8  = new ReportParameter("ReportDisplayType", ((int)Enum.Parse(typeof(ReportTypeNoExcel), search.ReportType)).ToString());
                ReportParameter p9  = new ReportParameter("ReportTitle", search.ReportTitle); 
                ReportParameter p10 = new ReportParameter("OrgTypeLevel1Names", search.OrgTypeLevel1Names);
                ReportParameter p11 = new ReportParameter("OrgTypeLevel2Names", search.OrgTypeLevel2Names);
                ReportParameter p12 = new ReportParameter("OrgTypeLevel3Names", search.OrgTypeLevel3Names); 
                ReportParameter p13 = new ReportParameter("OrgType1Header", AppSession.OrgRanking1Name); 
                ReportParameter p14 = new ReportParameter("OrgType2Header", AppSession.OrgRanking2Name); 
                ReportParameter p15 = new ReportParameter("OrgType3Header", AppSession.OrgRanking3Name);
                ReportParameter p16 = new ReportParameter("IsCMSProgram", AppSession.IsCMSProgram ? "1" : "0");

                ReportParameterCollection reportParameterCollection = new ReportParameterCollection { p1, p2, p3, p4, p5, p6, p7, p8, p9, p10, p10, p11, p12, p13, p14, p15, p16 };
                reportViewer.LocalReport.SetParameters(reportParameterCollection);

                CommonService setRdlcEmail = new CommonService();
                setRdlcEmail.SetRdlcEmail(reportViewer);

                if (emailInput.To != null) {
                    CommonService emailService = new CommonService();
                    int actionTypeId = (int)ActionTypeEnum.TracerControlChartReport;
                    if (emailService.SendReportEmail(emailInput, actionTypeId, emailService.SetRdlcEmail(reportViewer)))
                    {
                        // Do Nothing
                    }
                    else
                    {
                        throw (new Exception("Email"));
                    }
                }
            }
            catch (Exception ex) {
                if (ex.Message.ToString() != "No Data" && ex.Message.ToString() != "Limit") {
                    ExceptionLog exceptionLog = new ExceptionLog {
                        ExceptionText = "Reports: " + ex.Message,
                        PageName = "TracerObservationStatus",
                        MethodName = "_tracerobservationstatusRDLC",
                        UserID = Convert.ToInt32(AppSession.UserID),
                        SiteId = Convert.ToInt32(AppSession.SelectedSiteId),
                        TransSQL = "",
                        HttpReferrer = null
                    };
                    _exceptionService.LogException(exceptionLog);
                }
                throw;
            }
            return reportViewer;
        }
     
        private DataSet ReportTracerControlChart(Search search) {
            string msg = String.Empty;
            DataSet ds = new DataSet();

            try {
                using (SqlConnection cn = new SqlConnection(this.ConnectionString)) {
                    cn.Open();
                    SqlCommand cmd = new SqlCommand("ustReport_TracerControlChart", cn);
                    cmd.CommandTimeout = Convert.ToInt32(ConfigurationManager.AppSettings["SPCmdTimeout"].ToString());
                    cmd.CommandType = System.Data.CommandType.StoredProcedure;
                    cmd.Parameters.AddWithValue("SiteID", AppSession.SelectedSiteId);
                    cmd.Parameters.AddWithValue("ProgramID", AppSession.SelectedProgramId);
                    cmd.Parameters.AddWithValue("TracerCategoryIDs", search.TracerCategoryIDs);
                    cmd.Parameters.AddWithValue("TracerCustomIDs", search.TracerListIDs);
                    cmd.Parameters.AddWithValue("OrgIDs_Rank1_Depts", search.OrgTypeLevel1IDs);                    
                    cmd.Parameters.AddWithValue("OrgIDs_Rank2", search.OrgTypeLevel2IDs);
                    cmd.Parameters.AddWithValue("OrgIDs_Rank3", search.OrgTypeLevel3IDs);
                    cmd.Parameters.AddWithValue("OrgActive", search.InActiveOrgTypes ? -1 : 1);
                    cmd.Parameters.AddWithValue("FSA", search.IncludeFsa ? 1 : 0);
                    cmd.Parameters.AddWithValue("GroupBy", (int) Enum.Parse(typeof (TracerComplianceGroupBy), search.GroupByObsQues));                   
                    cmd.Parameters.AddWithValue("StartDate", search.StartDate);
                    cmd.Parameters.AddWithValue("EndDate", search.EndDate);

                    CreateSQLExecuted("ustReport_TracerControlChart", cmd);

                    #if DEBUG
                    System.Diagnostics.Debug.WriteLine(_SQLExecuted);
                    #endif

                    SqlDataAdapter da = new SqlDataAdapter(cmd);

                    using (cn)
                    using (cmd)
                    using (da) {
                        da.Fill(ds);
                    }
                }
            }
            catch (SqlException)
            {
                throw (new Exception("Limit"));
            }
            catch (Exception ex) {
                ex.Data.Add(TSQL, _SQLExecuted);
                throw ex;               
            }
            int rowsCount = ds.Tables[0].Rows.Count;
            if (rowsCount == 0)
                throw (new Exception("No Data"));
            else if (rowsCount > Convert.ToInt32(ConfigurationManager.AppSettings["ReportOutputLimit"].ToString()))
                throw (new Exception("Limit"));
            return ds;
        }
    }
}