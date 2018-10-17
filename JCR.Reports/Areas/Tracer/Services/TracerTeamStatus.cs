using System;
using System.Linq;
using System.Web;
using System.Data;
using System.Data.SqlClient;
using JCR.Reports.Models;
using JCR.Reports.ViewModels;
using JCR.Reports.Common;
using Microsoft.Reporting.WebForms;
using JCR.Reports.Services;
using JCR.Reports.Areas.Tracer.ViewModels;
using System.Configuration;
using JCR.Reports.Models.Enums;

namespace JCR.Reports.Areas.Tracer.Services
{
    public class TracerTeamStatus : BaseService
    {
        ExceptionService _exceptionService = new ExceptionService();
        public ReportViewer _TracerTeamStatusRDLC(Search search, Email emailInput)
        {
            SearchFormat searchoutput = new SearchFormat();
            searchoutput.CheckInputs(search);
            searchoutput.CheckInputs_TracerObsEnteredBy(search);

            string msg = String.Empty;

            if (AppSession.ReportScheduleID > 0)
                search.ReportTitle = String.Concat(search.ReportTitle, " - Report ID: ", AppSession.ReportScheduleID);

            if (search.StartDate != null && search.EndDate != null)
            {
                search.ReportDateTitle = "Tracer updates for " + search.StartDate.Value.ToShortDateString() + " - " + search.EndDate.Value.ToShortDateString();
                search.EndDate = search.EndDate.Value.Date.AddHours(23).AddMinutes(29).AddSeconds(59);
            }
            else if (search.StartDate != null && search.EndDate == null)
            {
                search.ReportDateTitle = "Tracer  updates since " + search.StartDate.Value.ToShortDateString();
            }
            else if (search.StartDate == null && search.EndDate != null)
            {
                search.ReportDateTitle = "Tracers updates through " + search.EndDate.Value.ToShortDateString();
                search.EndDate = search.EndDate.Value.Date.AddHours(23).AddMinutes(29).AddSeconds(59);
            }
            else
            {
                search.ReportDateTitle = "All Tracer Dates";

            }


            ReportViewer reportViewer = new ReportViewer();
            reportViewer.ProcessingMode = ProcessingMode.Local;
            reportViewer.SizeToReportContent = true;
            try
            {

                reportViewer.LocalReport.DisplayName = search.ReportTitle;
                reportViewer.LocalReport.ReportPath = HttpContext.Current.Request.MapPath(HttpContext.Current.Request.ApplicationPath) + @"Areas\Tracer\Reports\rptReportTracerTeamStatus.rdlc";
                reportViewer.LocalReport.DataSources.Add(new ReportDataSource("dsReport_TracerTeamStatus", TracerTeamStatusData(search).Tables[0]));
                
                // ReportParameter p1 = new ReportParameter("ReportDisplayType", ((int)Enum.Parse(typeof(ReportType), search.ReportType)).ToString());
                ReportParameter p1 = new ReportParameter("ProgramName", AppSession.SelectedProgramName);
                ReportParameter p2 = new ReportParameter("SiteName", AppSession.SelectedSiteName);
                ReportParameter p3 = new ReportParameter("TracerCategories", search.TracerCategoryNames.ToString());       // Filterd Tracercategories or blank for all
                ReportParameter p4 = new ReportParameter("TracerName", search.TracerListNames.ToString());
                ReportParameter p5 = new ReportParameter("ReportTitle", search.ReportTitle.ToString());
                ReportParameter p6 = new ReportParameter("ReportDateTitle", search.ReportDateTitle.ToString());                 // Computed start/end date string for date range title
                ReportParameter p7 = new ReportParameter("Copyright", "© " + DateTime.Now.Year.ToString() + WebConstants.Tracer_Copyright.ToString());
                ReportParameter p8 = new ReportParameter("OrgType1Header", AppSession.OrgRanking1Name.ToString());                // Provide OrgType Rank 1 Name header (e.g., Department)
                ReportParameter p9 = new ReportParameter("OrgType2Header", AppSession.OrgRanking2Name.ToString());
                ReportParameter p10 = new ReportParameter("OrgType3Header", AppSession.OrgRanking3Name.ToString());
                ReportParameter p11 = new ReportParameter("OrgRank1Names", search.OrgTypeLevel1Names.ToString());    // Filtered Rank 1 Org Names or blank string for all
                ReportParameter p12 = new ReportParameter("OrgRank2Names", search.OrgTypeLevel2Names.ToString());    // Filtered Rank 2 Org Names or blank string for all
                ReportParameter p13 = new ReportParameter("OrgRank3Names", search.OrgTypeLevel3Names.ToString());    // Filtered Rank 3 Org Names or blank string for all         
                ReportParameter p14 = new ReportParameter("IsCMSProgram", AppSession.IsCMSProgram ? "1" : "0");

                ReportParameterCollection reportParameterCollection = new ReportParameterCollection {  p1, p2, p3, p4, p5, p6, p7, p8, p9, p10, p10, p11, p12, p13, p14 };
                reportViewer.LocalReport.SetParameters(reportParameterCollection);
                if (emailInput.To != null)
                {
                    CommonService emailService = new CommonService();
                    int actionTypeId = (int)ActionTypeEnum.TracerTeamStatusReport;
                    if (emailService.SendReportEmail(emailInput, actionTypeId, emailService.SetRdlcEmail(reportViewer)))
                    {
                        // do nothing // left place holder for any other actions.
                    }
                    else
                    {
                        throw (new Exception("Email"));
                    }
                }
            }
            catch (Exception ex)
            {

                if (ex.Message.ToString() != "No Data" && ex.Message.ToString() != "Limit")
                {
                    ExceptionLog exceptionLog = new ExceptionLog
                    {
                        ExceptionText = "Reports: " + ex.Message,
                        PageName = "TracerTeamStatus",
                        MethodName = "_TracerTeamStatusRDLC",
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

        private DataSet TracerTeamStatusData(Search search)
        {
            string msg = String.Empty;
            DataSet ds = new DataSet();

            try
            {
                using (SqlConnection cn = new SqlConnection(this.ConnectionString))
                {
                    cn.Open();
                    SqlCommand cmd = new SqlCommand("ustReport_TracerTeamStatus", cn);
                    cmd.CommandTimeout = Convert.ToInt32(ConfigurationManager.AppSettings["SPCmdTimeout"].ToString());
                    cmd.CommandType = System.Data.CommandType.StoredProcedure;
                    cmd.Parameters.AddWithValue("SiteID", AppSession.SelectedSiteId);
                    cmd.Parameters.AddWithValue("ProgramID", AppSession.SelectedProgramId);
                    cmd.Parameters.AddWithValue("TracerIDs", search.TracerListIDs);
                    cmd.Parameters.AddWithValue("TracerCategoryIDs", search.TracerCategoryIDs);
                    cmd.Parameters.AddWithValue("OrgIDs_Rank3", search.OrgTypeLevel3IDs);
                    cmd.Parameters.AddWithValue("OrgIDs_Rank2", search.OrgTypeLevel2IDs);
                    cmd.Parameters.AddWithValue("OrgIDs_Rank1_Depts", search.OrgTypeLevel1IDs);
                    cmd.Parameters.AddWithValue("@EnteredByIDs", search.EnteredByIDs);         
                    cmd.Parameters.AddWithValue("OrgActive", search.InActiveOrgTypes ? -1 : 1);                               //     -1 => All Active/Inactive Orgs;  1 = => Only Active Orgs; 0 => Only Inactive Orgs
                    cmd.Parameters.AddWithValue("ResponseStartDate", search.StartDate);
                    cmd.Parameters.AddWithValue("ResponseEndDate", search.EndDate);
                    CreateSQLExecuted("uspExceptionLogInsert", cmd);
#if DEBUG
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

            //if (ds.Tables[0].Rows.Count == 0)
            //    throw (new Exception("No Data"));
            return ds;


        }
    }
}