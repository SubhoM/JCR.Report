using System;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using System.Web;
using JCR.Reports.Common;
using JCR.Reports.Models;
using JCR.Reports.ViewModels;
using Microsoft.Reporting.WebForms;
using JCR.Reports.Services;
using JCR.Reports.Areas.Tracer.ViewModels;
using System.Configuration;
using JCR.Reports.Models.Enums;

namespace JCR.Reports.Areas.Tracer.Services
{
    public class TracerObservationStatus : BaseService {

        ExceptionService _exceptionService = new ExceptionService();

        public ReportViewer _TracerObservationStatusRDLC(Search search, Email emailInput) {

            SearchFormat searchoutput = new SearchFormat();
            searchoutput.CheckInputs(search);
            searchoutput.CheckInputs_TracerObsEnteredBy(search);

            string msg = String.Empty;

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
                // Mark Orlando: Regarding the SPs: dsReport_TracerObservationStatus and dsReport_TracerObservationStatusByMonth
                // 1. Both SPs have the exact same set of input parameters.
                // 2. dsReport_TracerObservationStatus        returns 1 result set.
                // 3. dsReport_TracerObservationStatusByMonth returns 2 result sets.
                
                ReportParameter p1  = new ReportParameter("Copyright", "© " + DateTime.Now.Year.ToString() +  WebConstants.Tracer_Copyright.ToString());                  
                ReportParameter p2  = new ReportParameter("EnteredByNames",     search.EnteredByNames);
                ReportParameter p3  = new ReportParameter("OrgType1Header",     AppSession.OrgRanking1Name.ToString());
                ReportParameter p4  = new ReportParameter("OrgType2Header",     AppSession.OrgRanking2Name.ToString());                    
                ReportParameter p5  = new ReportParameter("OrgType3Header",     AppSession.OrgRanking3Name.ToString());
                ReportParameter p6  = new ReportParameter("OrgTypeLeveI1Names", search.OrgTypeLevel1Names.ToString());
                ReportParameter p7  = new ReportParameter("OrgTypeLevel2Names", search.OrgTypeLevel2Names.ToString());
                ReportParameter p8  = new ReportParameter("OrgTypeLevel3Names", search.OrgTypeLevel3Names.ToString());
                ReportParameter p9  = new ReportParameter("ProgramName",        AppSession.SelectedProgramName);                     
                ReportParameter p10 = new ReportParameter("ReportDateTitle",    search.ReportDateTitle);
                ReportParameter p11 = new ReportParameter("ReportTitle",        search.ReportTitle);
                ReportParameter p12 = new ReportParameter("ResponseStatusName", search.ObservationStatusName);
                ReportParameter p13 = new ReportParameter("SiteName",           AppSession.SelectedSiteName);
                ReportParameter p14 = new ReportParameter("TracerCategories",   search.TracerCategoryNames.ToString());
                ReportParameter p15 = new ReportParameter("TracerName",         search.TracerListNames);  // search.TracerListNames.ToString()); 

                var reportType = (ObservationStatusReportType) Enum.Parse(typeof (ObservationStatusReportType), search.ObservationStatusReportType);
                reportViewer.LocalReport.DisplayName = search.ReportTitle;

                if (reportType == ObservationStatusReportType.Monthly) {
                    reportViewer.LocalReport.ReportPath = HttpContext.Current.Request.MapPath(HttpContext.Current.Request.ApplicationPath) + @"Areas\Tracer\Reports\rptReportTracerObservationStatusByMonth.rdlc";
                    int maxResponseCount = 0;
                    DataSet ds = ReportTracerObservationStatusByMonth(search, out maxResponseCount);
                    ReportParameter p16  = new ReportParameter("MaxTracerResponseCount", maxResponseCount.ToString());
                    ReportParameter p17 = new ReportParameter("IsCMSProgram", AppSession.IsCMSProgram ? "1" : "0");

                    reportViewer.LocalReport.DataSources.Add(new ReportDataSource("dsReport_TracerObservationStatusByMonth", ds.Tables[0]));

                    ReportParameterCollection reportParameterCollection = new ReportParameterCollection { p1, p2, p3, p4, p5, p6, p7, p8, p9, p10, p11, p12, p13, p14, p15, p16, p17};
                    reportViewer.LocalReport.SetParameters(reportParameterCollection);                
                } else {
                    ReportParameter p16 = new ReportParameter("IsCMSProgram", AppSession.IsCMSProgram ? "1" : "0");
                    reportViewer.LocalReport.ReportPath = HttpContext.Current.Request.MapPath(HttpContext.Current.Request.ApplicationPath) + @"Areas\Tracer\Reports\rptReportTracerObservationStatus.rdlc";
                    reportViewer.LocalReport.DataSources.Add(new ReportDataSource("dsReport_TracerObservationStatus", ReportTracerObservationStatus(search).Tables[0]));
                    ReportParameterCollection reportParameterCollection = new ReportParameterCollection { p1, p2, p3, p4, p5, p6, p7, p8, p9, p10, p11, p12, p13, p14, p15, p16};
                    reportViewer.LocalReport.SetParameters(reportParameterCollection);
                }            
    
                CommonService setRdlcEmail = new CommonService();
                setRdlcEmail.SetRdlcEmail(reportViewer);

                if (emailInput.To != null)
                {
                    CommonService emailService = new CommonService();
                    int actionTypeId = (int)ActionTypeEnum.ObservationStatusReport;
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
     
        private DataSet ReportTracerObservationStatusByMonth(Search search, out int maxResponseCount) {
            string msg = String.Empty;
            DataSet ds = new DataSet();

            try
            {
                using (SqlConnection cn = new SqlConnection(this.ConnectionString)) {
                    cn.Open();
                    SqlCommand cmd = new SqlCommand("ustReport_TracerObservationStatusByMonth", cn);
                    cmd.CommandTimeout = Convert.ToInt32(ConfigurationManager.AppSettings["SPCmdTimeout"].ToString());

                    cmd.CommandType = System.Data.CommandType.StoredProcedure;
                    cmd.Parameters.AddWithValue("SiteID", AppSession.SelectedSiteId);
                    cmd.Parameters.AddWithValue("ProgramID", AppSession.SelectedProgramId);
                    cmd.Parameters.AddWithValue("ResponseStatus", search.ObservationStatus);
                    cmd.Parameters.AddWithValue("CategoryIDs", search.TracerCategoryIDs);
                    cmd.Parameters.AddWithValue("TracerIDs", search.TracerListIDs);
                    cmd.Parameters.AddWithValue("OrgIDs_Rank1_Depts", search.OrgTypeLevel1IDs);
                    cmd.Parameters.AddWithValue("OrgIDs_Rank2", search.OrgTypeLevel2IDs);                    
                    cmd.Parameters.AddWithValue("OrgIDs_Rank3", search.OrgTypeLevel3IDs);                    
                    cmd.Parameters.AddWithValue("OrgActive", search.InActiveOrgTypes ? -1 : 1); 
                    cmd.Parameters.AddWithValue("EnteredBy", search.EnteredByIDs); 
                    cmd.Parameters.AddWithValue("StartDate", search.StartDate);
                    cmd.Parameters.AddWithValue("EndDate", search.EndDate);

                    CreateSQLExecuted("ustReport_TracerObservationStatusByMonth", cmd);

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
                maxResponseCount = ds.Tables[1].Rows.Count > 0 ? Convert.ToInt32(ds.Tables[1].Rows[0]["MaxTracerResponseCount"]) : 0;
            }
            catch (SqlException)
            {
                throw (new Exception("Limit"));
            }
            catch (Exception ex) {
                ex.Data.Add(TSQL, _SQLExecuted);
                throw ex;               
            }
            if (ds.Tables[0].Rows.Count == 0)
                throw (new Exception("No Data")); 
            return ds;
        }

        private DataSet ReportTracerObservationStatus(Search search) {

            string msg = String.Empty;
            DataSet ds = new DataSet();

            try {        
                using (SqlConnection cn = new SqlConnection(this.ConnectionString)) {
                    cn.Open();
                    SqlCommand cmd = new SqlCommand("ustReport_TracerObservationStatus", cn);
                    cmd.CommandType = System.Data.CommandType.StoredProcedure;
                    cmd.CommandTimeout = Convert.ToInt32(ConfigurationManager.AppSettings["SPCmdTimeout"].ToString());
                    cmd.Parameters.AddWithValue("SiteID", AppSession.SelectedSiteId);
                    cmd.Parameters.AddWithValue("ProgramID", AppSession.SelectedProgramId);
                    cmd.Parameters.AddWithValue("ResponseStatus", search.ObservationStatus);
                    cmd.Parameters.AddWithValue("CategoryIDs", search.TracerCategoryIDs);
                    cmd.Parameters.AddWithValue("TracerIDs", search.TracerListIDs);
                    cmd.Parameters.AddWithValue("OrgIDs_Rank3", search.OrgTypeLevel3IDs);   
                    cmd.Parameters.AddWithValue("OrgIDs_Rank2", search.OrgTypeLevel2IDs);                    
                    cmd.Parameters.AddWithValue("OrgIDs_Rank1_Depts", search.OrgTypeLevel1IDs);                 
                    cmd.Parameters.AddWithValue("OrgActive", search.InActiveOrgTypes ? -1 : 1); 
                    cmd.Parameters.AddWithValue("EnteredBy", search.EnteredByIDs); 
                    cmd.Parameters.AddWithValue("StartDate", search.StartDate);
                    cmd.Parameters.AddWithValue("EndDate", search.EndDate);

                    CreateSQLExecuted("ustReport_TracerObservationStatus", cmd);

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
            //if (ds.Tables[0].Rows.Count == 0)
            //    throw (new Exception("No Data")); 
            return ds;
        }
    }
}