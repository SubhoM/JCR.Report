using System;
using System.Data;
using System.Linq;
using System.Web;
using JCR.Reports.Common;
using JCR.Reports.Models;
using Microsoft.Reporting.WebForms;
using System.Data.SqlClient;
using JCR.Reports.ViewModels;
using JCR.Reports.Services;
using JCR.Reports.Areas.Tracer.ViewModels;
using System.Configuration;
using JCR.Reports.Models.Enums;

namespace JCR.Reports.Areas.Tracer.Services
{
    public class OrganizationPriorityFindings : BaseService
    {
        ExceptionService _exceptionService = new ExceptionService();

        public ReportViewer OrganizationPriorityFindingsRDLC(Search searchParams, Email emailInput)
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
            int TopN = Convert.ToInt32(searchParams.TopFindings);
            if (TopN == 0)
                reportDateTitle = "All Organization Questions - " + reportDateTitle.ToString();
            else
                reportDateTitle = "Top " + TopN.ToString() + " Organization Questions  - " + reportDateTitle.ToString();

            ReportViewer reportViewer = new ReportViewer();
            reportViewer.ProcessingMode = ProcessingMode.Local;
            reportViewer.SizeToReportContent = true;
            try
            {
                DataView dvReportResult = new DataView(GetOrgFindingsReportData(searchParams).Tables[0]);
                dvReportResult = this.AdjustTotals(dvReportResult);  // Adjust totals to not double dip count if multiple standards for the same question
                reportViewer.LocalReport.DisplayName = searchParams.ReportTitle;
                reportViewer.LocalReport.ReportPath = HttpContext.Current.Request.MapPath(HttpContext.Current.Request.ApplicationPath) + @"Areas\Tracer\Reports\rptReportOrgFindingsByQuestion.rdlc";
                reportViewer.LocalReport.DataSources.Add(new ReportDataSource("dsReport_OrgFindingsByQuestion", dvReportResult));

                //Get the Organization Types header for the column header in RDLC
                CommonService oService = new CommonService();
                string sCategoryTitle = oService.OrganizationTypesHeader();

                ReportParameter p1 = new ReportParameter("SiteID", AppSession.SelectedSiteId.ToString());
                ReportParameter p2 = new ReportParameter("ProgramID", AppSession.SelectedProgramId.ToString());
                ReportParameter p3 = new ReportParameter("TracerCategoryIDs", searchParams.TracerCategoryIDs);
                ReportParameter p4 = new ReportParameter("ReportTitle", searchParams.ReportTitle);
                ReportParameter p5 = new ReportParameter("SiteName", AppSession.SelectedSiteName);
                ReportParameter p6 = new ReportParameter("ProgramName", AppSession.SelectedProgramName);
                ReportParameter p7 = new ReportParameter("ReportDateTitle", reportDateTitle.ToString());
                ReportParameter p8 = new ReportParameter("Copyright", "© " + DateTime.Now.Year.ToString() + WebConstants.Tracer_Copyright.ToString());
                ReportParameter p9 = new ReportParameter("OrgTypesHeader", sCategoryTitle);
                ReportParameter p10 = new ReportParameter("CategoryNames", searchParams.TracerCategoryNames);
                ReportParameter p11 = new ReportParameter("ReportStyle", ((int)Enum.Parse(typeof(ReportTypeNoExcel), searchParams.ReportType)).ToString());
                ReportParameter p12 = new ReportParameter("ShowCMS", searchParams.IncludeCMS ? "1" : "0");
                ReportParameter p13 = new ReportParameter("IsCMSProgram", AppSession.IsCMSProgram ? "1" : "0");

                ReportParameterCollection reportParameterCollection = new ReportParameterCollection { p1, p2, p3, p4, p5, p6, p7, p8, p9, p10, p11, p12, p13 };
                reportViewer.LocalReport.SetParameters(reportParameterCollection);

                if (emailInput.To != null)
                {
                    CommonService emailService = new CommonService();
                    int actionTypeId = (int)ActionTypeEnum.OrganizationPriorityFindingsReportOrganizationPriorityFindingsReport;
                    if (emailService.SendReportEmail(emailInput, actionTypeId, emailService.SetRdlcEmail(reportViewer)))
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
                        PageName = "OrganizationPriorityFindings",
                        MethodName = "OrganizationPriorityFindingsRDLC",
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

        private DataView AdjustTotals(DataView dv)
        {
            DataView returnDV = new DataView();
            returnDV = dv;
            if ((returnDV != null) && (returnDV.Count > 0))
            {
                // By Question
                // By Tracer Response
                bool first = true;
                int tracerQuestionID = 0;
                int tracerResponseID = 0;
                int? standardTextID = 0;
                bool stdChanged = false;

                foreach (DataRowView row in returnDV)
                {
                    // Only process Level 1 rows
                    if (Convert.ToInt32(row["Level"]) == 1)
                    {
                        if (first == true)
                        {
                            tracerQuestionID = Convert.ToInt32(row["TracerQuestionID"]);
                            tracerResponseID = Convert.ToInt32(row["TracerResponseID"]);
                            if (row["StandardTextID"] != DBNull.Value)
                                standardTextID = Convert.ToInt32(row["StandardTextID"]);
                            else
                                standardTextID = null;
                            first = false;
                        }
                        else
                        {
                            if ((Convert.ToInt32(row["TracerQuestionID"]) == tracerQuestionID) &&
                                (Convert.ToInt32(row["TracerResponseID"]) == tracerResponseID) &&
                                ((row["StandardTextID"] == DBNull.Value && standardTextID == null) || (row["StandardTextID"] != DBNull.Value && Convert.ToInt32(row["StandardTextID"]) == standardTextID)))
                            {
                                // We clear out counts on redundant records per this record group
                                row["Numerator"] = 0;
                                row["Denominator"] = 0;
                                row["IncludeTotalCount"] = 0;
                                row["Compliance"] = 0;
                            }
                            else
                            {
                                // If question and tracer response is the same and detect first time standard has changed = we zero out the totals related fields
                                if ((Convert.ToInt32(row["TracerQuestionID"]) == tracerQuestionID) && (Convert.ToInt32(row["TracerResponseID"]) == tracerResponseID))
                                {
                                    stdChanged = false;
                                    if (row["StandardTextID"] == DBNull.Value)
                                    {
                                        if (standardTextID != null)
                                            stdChanged = true;
                                    }
                                    else
                                    {
                                        if (Convert.ToInt32(row["StandardTextID"]) != standardTextID)
                                            stdChanged = true;
                                    }
                                }
                                else
                                    stdChanged = false;

                                if (stdChanged == true)
                                {
                                    row["Numerator"] = 0;
                                    row["Denominator"] = 0;
                                    row["IncludeTotalCount"] = 0;
                                    row["Compliance"] = 0;
                                }
                            }
                            // Get latest record identity
                            tracerQuestionID = Convert.ToInt32(row["TracerQuestionID"]);
                            tracerResponseID = Convert.ToInt32(row["TracerResponseID"]);
                            if (row["StandardTextID"] != DBNull.Value)
                                standardTextID = Convert.ToInt32(row["StandardTextID"]);
                            else
                                standardTextID = null;
                            //}
                        }
                    }
                }
            }
            return returnDV;
        }

        private DataSet GetOrgFindingsReportData(Search searchParams)
        {
            DataSet ds = new DataSet();
            try
            {
                using (SqlConnection cn = new SqlConnection(this.ConnectionString))
                {
                    cn.Open();
                    SqlCommand cmd = new SqlCommand("ustReport_OrgFindingsByQuestion", cn);
                    cmd.CommandTimeout = Convert.ToInt32(ConfigurationManager.AppSettings["SPCmdTimeout"].ToString());
                    cmd.CommandType = System.Data.CommandType.StoredProcedure;

                    cmd.Parameters.AddWithValue("SiteID", AppSession.SelectedSiteId);
                    cmd.Parameters.AddWithValue("ProgramID", AppSession.SelectedProgramId);

                    if (String.IsNullOrWhiteSpace(searchParams.TracerCategoryIDs))
                        cmd.Parameters.AddWithValue("TracerCategoryIds", DBNull.Value);
                    else
                        cmd.Parameters.AddWithValue("TracerCategoryIds", searchParams.TracerCategoryIDs);

                    cmd.Parameters.AddWithValue("TopN", searchParams.TopFindings);
                    cmd.Parameters.AddWithValue("ShowCMS", searchParams.IncludeCMS == true ? 1 : 0);
                    cmd.Parameters.AddWithValue("CycleID", AppSession.CycleID);
                    cmd.Parameters.AddWithValue("StartDate", searchParams.StartDate);
                    cmd.Parameters.AddWithValue("EndDate", searchParams.EndDate);

                    //Get the SQL statement for logging
                    CreateSQLExecuted("ustReport_OrgFindingsByQuestion", cmd);

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