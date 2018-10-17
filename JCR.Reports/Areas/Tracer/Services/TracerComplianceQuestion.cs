using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Data;
using System.Data.SqlClient;
using System.Configuration;
using JCR.Reports.Models;
using JCR.Reports.ViewModels;
using JCR.Reports.Common;
using Microsoft.Reporting.WebForms;
using Kendo.Mvc.UI;
using Kendo.Mvc.Extensions;
using JCR.Reports.Services;
using JCR.Reports.Areas.Tracer.ViewModels;
namespace JCR.Reports.Areas.Tracer.Services
{
    public class TracerComplianceQuestion : BaseService
    {
        ExceptionService _exceptionService = new ExceptionService();
        public DataSourceResult _complianceQuestionChartExcel([DataSourceRequest]DataSourceRequest request, TracerComplianceQuestionInput search)
        {
            DataSourceResult result = new DataSourceResult();
            try
            {

                search.EndDate = (search.EndDate != null && search.EndDate.ToString() != "") ? search.EndDate.Value.Date.AddHours(23).AddMinutes(29).AddSeconds(59) : search.EndDate;
                search.OrgTypeLevel1IDs = (search.OrgTypeLevel1IDs != null && search.OrgTypeLevel1IDs != "-1") ? search.OrgTypeLevel1IDs : "";
                search.OrgTypeLevel2IDs = (search.OrgTypeLevel2IDs != null && search.OrgTypeLevel2IDs != "-1") ? search.OrgTypeLevel2IDs : "";
                search.OrgTypeLevel3IDs = (search.OrgTypeLevel3IDs != null && search.OrgTypeLevel3IDs != "-1") ? search.OrgTypeLevel3IDs : "";
                //SearchFormat searchoutput = new SearchFormat();
                // searchoutput.CheckInputs(search);

                List<ComplianceQuestionChart> ComplianceQuestionChartList = new List<ComplianceQuestionChart>();
                DataTable dt = new DataTable();

                //  DataTable dt = new DataTable();


                dt = ReportComplianceQuestionChart(search).Tables[0];

                ComplianceQuestionChartList = dt.ToList<ComplianceQuestionChart>();
                
                if (search.TracerListNames.Split(',').ToArray().Count() == 1)
                {
                    if (search.TracerListNames.Contains("All"))
                    {
                        ComplianceQuestionChartList = ComplianceQuestionChartList.OrderBy(i => i.Compliance).ToList();
                    }
                    else
                    {
                        ComplianceQuestionChartList = ComplianceQuestionChartList.OrderBy(i => i.QuesNo).ToList();
                    }

                }
                
                result = ComplianceQuestionChartList.ToDataSourceResult(request, cqc => new ComplianceQuestionChart
                {
                    QID = cqc.QID,
                    QuesNo = cqc.QuesNo,
                    QuestionID = cqc.QuestionID,
                    QuestionText = cqc.QuestionText.ReplaceSpecialCharacters(),
                    TotalNumerator = cqc.TotalNumerator,
                    TotalDenominator = cqc.TotalDenominator,
                    Compliance = cqc.Compliance
                });


            }
            catch (Exception ex)
            {
                if (ex.Message.ToString() == "No Data")
                {
                    result.Errors = WebConstants.NO_DATA_FOUND_EXCEL_VIEW;
                }
                else if (ex.Message.ToString() == "Limit")
                {
                    result.Errors = "Maximum limit of " + ConfigurationManager.AppSettings["ReportOutputLimit"].ToString() + " records reached. Refine your criteria to narrow the result.";
                }

                if (ex.Message.ToString() != "No Data" && ex.Message.ToString() != "Limit")
                {
                    ExceptionLog exceptionLog = new ExceptionLog
                    {
                        ExceptionText = "Reports: " + ex.Message,
                        PageName = "TracerComplianceQuestion",
                        MethodName = "_complianceQuestionChartExcel",
                        UserID = Convert.ToInt32(AppSession.UserID),
                        SiteId = Convert.ToInt32(AppSession.SelectedSiteId),
                        TransSQL = "",
                        HttpReferrer = null
                    };
                    _exceptionService.LogException(exceptionLog);
                }
            }


            return result;

        }
        public DataSourceResult _complianceQuestionDetailExcel([DataSourceRequest]DataSourceRequest request, TracerComplianceQuestionInput search)
        {
            DataSourceResult result = new DataSourceResult();
            try
            {
                search.EndDate = (search.EndDate != null && search.EndDate.ToString() != "") ? search.EndDate.Value.Date.AddHours(23).AddMinutes(29).AddSeconds(59) : search.EndDate;
                search.OrgTypeLevel1IDs = (search.OrgTypeLevel1IDs != null && search.OrgTypeLevel1IDs != "-1") ? search.OrgTypeLevel1IDs : "";
                search.OrgTypeLevel2IDs = (search.OrgTypeLevel2IDs != null && search.OrgTypeLevel2IDs != "-1") ? search.OrgTypeLevel2IDs : "";
                search.OrgTypeLevel3IDs = (search.OrgTypeLevel3IDs != null && search.OrgTypeLevel3IDs != "-1") ? search.OrgTypeLevel3IDs : "";
   
                List<ComplianceQuestionDetail> ComplianceQuestionDetailList = new List<ComplianceQuestionDetail>();
                DataTable dt = new DataTable();

                dt = ReportComplianceQuestionDetail(search).Tables[0];
                
                ComplianceQuestionDetailList = dt.ToList<ComplianceQuestionDetail>();
                if (search.TracerListNames.Split(',').ToArray().Count() == 1)
                {
                    if (search.TracerListNames.Contains("All"))
                    {
                        ComplianceQuestionDetailList = ComplianceQuestionDetailList.OrderBy(i => i.OverallCompliance).ToList();
                    }
                    else
                    {
                        ComplianceQuestionDetailList = ComplianceQuestionDetailList.OrderBy(i => i.QuesNo).ToList();
                    }

                }
                result = ComplianceQuestionDetailList.ToDataSourceResult(request, cqc => new ComplianceQuestionDetail
                {

                    QuestionText = cqc.QuestionText.ReplaceSpecialCharacters(),
                    TotalNumerator = cqc.TotalNumerator,
                    TotalDenominator = cqc.TotalDenominator,
                    OverallCompliance = cqc.OverallCompliance,
                    TracerCustomName = cqc.TracerCustomName,
                    TracerSection = cqc.TracerSection,
                    QuesNo = cqc.QuesNo,
                    StandardEPs = cqc.StandardEPs.ReplaceNewline(),
                    Observation = cqc.Observation.ReplaceNewline(),
                    Num = cqc.Num,
                    Den = cqc.Den,
                    Compliance = cqc.Compliance,
                    OrgName_Rank3 = cqc.OrgName_Rank3,
                    OrgName_Rank2 = cqc.OrgName_Rank2,
                    OrgName_Rank1_Dept = cqc.OrgName_Rank1_Dept,
                    SurveyTeam = cqc.SurveyTeam.ReplaceNewline(),
                    MedicalStaffInvolved = cqc.MedicalStaffInvolved.ReplaceNewline(),
                    Location = cqc.Location.ReplaceNewline(),
                    MedicalRecordNumber = cqc.MedicalRecordNumber.ReplaceNewline(),
                    EquipmentObserved = cqc.EquipmentObserved.ReplaceNewline(),
                    ContractedService = cqc.ContractedService.ReplaceNewline(),
                    StaffInterviewed = cqc.StaffInterviewed.ReplaceNewline(),
                    TracerNote = cqc.TracerNote.ReplaceNewline(),
                    UpdatedByName = cqc.UpdatedByName,
                    ObservationDate = cqc.ObservationDate,
                    LastUpdated = cqc.LastUpdated,
                    QuestionNotes = cqc.QuestionNotes.ReplaceNewline(),
                    QID = cqc.QID

                });


            }
            catch (Exception ex)
            {
                if (ex.Message.ToString() == "No Data")
                {
                    result.Errors = WebConstants.NO_DATA_FOUND_EXCEL_VIEW;
                }
                else if (ex.Message.ToString() == "Limit")
                {
                    result.Errors = "Maximum limit of " + ConfigurationManager.AppSettings["ReportOutputLimit"].ToString() + " records reached. Refine your criteria to narrow the result.";
                }

                if (ex.Message.ToString() != "No Data" && ex.Message.ToString() != "Limit")
                {
                    ExceptionLog exceptionLog = new ExceptionLog
                    {
                        ExceptionText = "Reports: " + ex.Message,
                        PageName = "TracerComplianceQuestion",
                        MethodName = "_ComplianceQuestionDetailExcel",
                        UserID = Convert.ToInt32(AppSession.UserID),
                        SiteId = Convert.ToInt32(AppSession.SelectedSiteId),
                        TransSQL = "",
                        HttpReferrer = null
                    };
                    _exceptionService.LogException(exceptionLog);
                }
            }


            return result;

        }

        public byte[] _complianceQuestionChartRDLC(TracerComplianceQuestionInput search, string filtereddataQID, string SortBy, string SortOrder)
        {
            byte[] fileContents = null;
            string matchMessage = String.Empty;
            string idColumnName = "QID";
            string complianceColumn = "Compliance";
            DataView dv = null;

            search.OrgTypeLevel1IDs = (search.OrgTypeLevel1IDs != null && search.OrgTypeLevel1IDs != "-1") ? search.OrgTypeLevel1IDs : "";
            search.OrgTypeLevel2IDs = (search.OrgTypeLevel2IDs != null && search.OrgTypeLevel2IDs != "-1") ? search.OrgTypeLevel2IDs : "";
            search.OrgTypeLevel3IDs = (search.OrgTypeLevel3IDs != null && search.OrgTypeLevel3IDs != "-1") ? search.OrgTypeLevel3IDs : "";

            string reportDateTitle = CommonService.InitializeReportDateTitle("Tracer", search.StartDate, search.EndDate);
            search.EndDate = (search.EndDate != null && search.EndDate.ToString() != "") ? search.EndDate.Value.Date.AddHours(23).AddMinutes(29).AddSeconds(59) : search.EndDate;
            int topLeastDropdownValue = Convert.ToInt32(search.TopLeastCompliantQuestions);

            search.ReportTitle = (search.ReportName !="" && search.ReportName != null ) ? search.ReportName : search.ReportTitle + " - Summary";

            if (AppSession.ReportScheduleID > 0)
                search.ReportTitle = String.Concat(search.ReportTitle, " - Report ID: ", AppSession.ReportScheduleID);

            //if (search.ReportName != "")
            //    search.ReportTitle = AppSession.ReportScheduleName;


            ReportViewer reportViewer = new ReportViewer();
            reportViewer.ProcessingMode = ProcessingMode.Local;
            reportViewer.SizeToReportContent = true;
            try
            {
                var tracerType = string.Empty;

                if (AppSession.IsCMSProgram)
                    tracerType = search.TracerTypeID == 1 ? "TJC Tracers" : "CMS Tracers";
              
                dv = new DataView(ReportComplianceQuestionChart(search).Tables[0]);
                // Trim for top N and get necessary message

                if (topLeastDropdownValue > 0)
                    dv = CommonService.TopNData(dv, topLeastDropdownValue, idColumnName, complianceColumn, ref matchMessage);


                if (filtereddataQID == "")
                    filtereddataQID = "0";
                dv.RowFilter = "QID IN (" + filtereddataQID + ")";

                if (SortBy != "")
                    { dv.Sort = SortBy + " " + SortOrder; }
                else
                {
                    if (search.TracerListNames.Split(',').ToArray().Count() == 1)
                    {
                        if (search.TracerListNames.Contains("All"))
                        {
                            dv.Sort = "Compliance" + " " + "asc";
                        }
                        else
                        {
                            dv.Sort = "QuesNo" + " " + "asc";
                        }

                    }
                }

                // to do // rdlc name change and parameters change.
                reportViewer.LocalReport.DisplayName = "Compliance By Question";
                reportViewer.LocalReport.ReportPath = HttpContext.Current.Request.MapPath(HttpContext.Current.Request.ApplicationPath) + @"Areas\Tracer\Reports\rptReportComplianceByQuestionSummary.rdlc";
                reportViewer.LocalReport.DataSources.Add(new ReportDataSource("dsReport_ComplianceByQuestionSummary", dv));

                ReportParameter p1 = new ReportParameter("ReportTitle", search.ReportTitle.ToString());
                ReportParameter p2 = new ReportParameter("SiteName", AppSession.SelectedSiteName);
                ReportParameter p3 = new ReportParameter("ProgramName", AppSession.SelectedProgramName);
                ReportParameter p4 = new ReportParameter("ReportDateTitle", reportDateTitle.ToString());
                ReportParameter p5 = new ReportParameter("Copyright", "© " + DateTime.Now.Year.ToString() + WebConstants.Tracer_Copyright.ToString());
                ReportParameter p6 = new ReportParameter("OrgType1Header", AppSession.OrgRanking1Name.ToString());                 // Provide OrgType Rank 1 Name header (e.g., Department)
                ReportParameter p7 = new ReportParameter("OrgType2Header", AppSession.OrgRanking2Name.ToString());                 // Provide OrgType Rank 2 Name column header or blank if none
                ReportParameter p8 = new ReportParameter("OrgType3Header", AppSession.OrgRanking3Name.ToString());                 // Provide OrgType Rank 2 Name column header or blank if none
                ReportParameter p9 = new ReportParameter("OrgRank1Names", search.OrgTypeLevel1Names.ToString());                   // Filtered Rank 1 Org Names or blank string for all
                ReportParameter p10 = new ReportParameter("OrgRank2Names", search.OrgTypeLevel2Names.ToString());                   // Filtered Rank 2 Org Names or blank string for all
                ReportParameter p11 = new ReportParameter("OrgRank3Names", search.OrgTypeLevel3Names.ToString());                   // Filtered Rank 3 Org Names or blank string for all
                ReportParameter p12 = new ReportParameter("TopLeastCompliantQuestions", topLeastDropdownValue.ToString());
                ReportParameter p13 = new ReportParameter("AllTracers", search.AllTracers ? "1" : "0");
                ReportParameter p14 = new ReportParameter("InActiveOrgTypes", search.InActiveOrgTypes ? "0" : "1");
                ReportParameter p15 = new ReportParameter("Keyword", search.Keyword == null ? "" : search.Keyword.ToString());
                ReportParameter p16 = new ReportParameter("TracerNames", search.TracerListNames == null ? "" : search.TracerListNames.ToString());
                ReportParameter p17 = new ReportParameter("TracerSections", search.TracerSectionListNames == null ? "" : search.TracerSectionListNames.ToString());
                ReportParameter p18 = new ReportParameter("Message", matchMessage.ToString());
                ReportParameter p19 = new ReportParameter("MinimalDenomValue", search.MinimalDenomValue.ToString());
                ReportParameter p20 = new ReportParameter("TracerType", tracerType);
                ReportParameter p21 = new ReportParameter("HavingComplianceValue", search.HavingComplianceValue.ToString());
                ReportParameter p22 = new ReportParameter("HavingComplianceOperator", search.HavingComplianceOperator);
                ReportParameter p23 = new ReportParameter("ReportDescription", search.ReportDescription == null ? "" : search.ReportDescription.ToString());
                
                ReportParameterCollection reportParameterCollection = new ReportParameterCollection { p1, p2, p3, p4, p5, p6, p7, p8, p9, p10, p11, p12, p13, p14, p15, p16, p17, p18, p19, p20, p21, p22, p23};
                reportViewer.LocalReport.SetParameters(reportParameterCollection);
                Warning[] warnings;
                string[] streamIds;
                string mimeType = string.Empty;
                string encoding = string.Empty;
                string extension = string.Empty;
                fileContents = reportViewer.LocalReport.Render("PDF", null, out mimeType, out encoding, out extension, out streamIds, out warnings);
            }
            catch (Exception ex)
            {

                if (ex.Message.ToString() != "No Data" && ex.Message.ToString() != "Limit")
                {
                    ExceptionLog exceptionLog = new ExceptionLog
                    {
                        ExceptionText = "Reports: " + ex.Message,
                        PageName = "_complianceQuestionChartRDLC",
                        MethodName = "_complianceQuestionChartRDLC",
                        UserID = Convert.ToInt32(AppSession.UserID),
                        SiteId = Convert.ToInt32(AppSession.SelectedSiteId),
                        TransSQL = "",
                        HttpReferrer = null
                    };
                    _exceptionService.LogException(exceptionLog);
                }
                throw;
            }

            return fileContents;
        }
        private DataSet ReportComplianceQuestionChart(TracerComplianceQuestionInput search)
        {

            DataSet ds = new DataSet();
            int topLeastDropdownValue = Convert.ToInt32(search.TopLeastCompliantQuestions);
            string spName = String.Empty;
            var minCompliance = 0;
            var maxCompliance = 100;

            if (search.IncludeHavingComplianceValue)
                if (string.Equals(search.HavingComplianceOperator, "lt"))
                    maxCompliance = search.HavingComplianceValue - 1;
                else
                    minCompliance = search.HavingComplianceValue + 1;

            try
            {


                using (SqlConnection cn = new SqlConnection(this.ConnectionString))
                {
                    cn.Open();
                    SqlCommand cmd;
                    if (topLeastDropdownValue == 0)
                    {
                        spName = "ustReport_ComplianceByQuestionSummary_ByQuestion";
                        cmd = new SqlCommand(spName, cn);
                        cmd.Parameters.AddWithValue("TracerQuestionIDs", search.SelectedQuestionIDs);
                        cmd.CommandTimeout = Convert.ToInt32(ConfigurationManager.AppSettings["SPCmdTimeout"].ToString());
                    }
                    else
                    {
                        spName = "ustReport_ComplianceByQuestionSummary_ByTop";
                        cmd = new SqlCommand(spName, cn);
                        cmd.Parameters.AddWithValue("TopN", topLeastDropdownValue + 1);
                        cmd.CommandTimeout = 900; //Convert.ToInt32(ConfigurationManager.AppSettings["SPCmdTimeout"].ToString());

                    }
                    cmd.CommandType = System.Data.CommandType.StoredProcedure;

                    cmd.Parameters.AddWithValue("All", search.AllTracers ? 1 : 0);
                    cmd.Parameters.AddWithValue("TracerIDs", search.SelectedQuestionTracerIDs);
                    cmd.Parameters.AddWithValue("SiteID", AppSession.SelectedSiteId);
                    cmd.Parameters.AddWithValue("ProgramID", AppSession.SelectedProgramId);
                    cmd.Parameters.AddWithValue("OrgIDs_Rank3", search.OrgTypeLevel3IDs);
                    cmd.Parameters.AddWithValue("OrgIDs_Rank2", search.OrgTypeLevel2IDs);
                    cmd.Parameters.AddWithValue("OrgIDs_Rank1_Depts", search.OrgTypeLevel1IDs);
                    cmd.Parameters.AddWithValue("OrgActive", search.InActiveOrgTypes ? -1 : 1);
                    cmd.Parameters.AddWithValue("CycleID", AppSession.CycleID);
                    cmd.Parameters.AddWithValue("StartDate", search.StartDate);
                    cmd.Parameters.AddWithValue("EndDate", search.EndDate);
                    cmd.Parameters.AddWithValue("MinDenominator", search.IncludeMinimalDenomValue ? search.MinimalDenomValue : -1);
                    cmd.Parameters.AddWithValue("MinCompliance", minCompliance);
                    cmd.Parameters.AddWithValue("MaxCompliance", maxCompliance);
                    cmd.Parameters.AddWithValue("TracerTypeID", search.TracerTypeID);

                    CreateSQLExecuted(spName, cmd);
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
            return ds;


        }
        private DataSet ReportComplianceQuestionDetail(TracerComplianceQuestionInput search)
        {

            DataSet ds = new DataSet();
            int topLeastDropdownValue = Convert.ToInt32(search.TopLeastCompliantQuestions);
            string spName = String.Empty;
            var minCompliance = 0;
            var maxCompliance = 100;

            if (search.IncludeHavingComplianceValue)
                if (string.Equals(search.HavingComplianceOperator, "lt"))
                    maxCompliance = search.HavingComplianceValue - 1;
                else
                    minCompliance = search.HavingComplianceValue + 1;
            try
            {
                using (SqlConnection cn = new SqlConnection(this.ConnectionString))
                {
                    cn.Open();
                    SqlCommand cmd;

                    if (topLeastDropdownValue == 0)
                    {
                        spName = "ustReport_ComplianceByQuestionDetail_ByQuestion";
                        cmd = new SqlCommand(spName, cn);
                        cmd.Parameters.AddWithValue("TracerQuestionIDs", search.SelectedQuestionIDs);
                        cmd.CommandTimeout = Convert.ToInt32(ConfigurationManager.AppSettings["SPCmdTimeout"].ToString());
                    }
                    else
                    {
                        spName = "ustReport_ComplianceByQuestionDetail_ByTop";
                        cmd = new SqlCommand(spName, cn);
                        cmd.Parameters.AddWithValue("TopN", topLeastDropdownValue + 1);
                        cmd.CommandTimeout = 900;//Convert.ToInt32(ConfigurationManager.AppSettings["SPCmdTimeout"].ToString());
                    }

                    cmd.CommandType = System.Data.CommandType.StoredProcedure;
                    cmd.Parameters.AddWithValue("TracerIDs", search.TracerIds);
                    cmd.Parameters.AddWithValue("All", search.AllTracers ? 1 : 0);
                    cmd.Parameters.AddWithValue("SiteID", AppSession.SelectedSiteId);
                    cmd.Parameters.AddWithValue("ProgramID", AppSession.SelectedProgramId);
                    cmd.Parameters.AddWithValue("QuestionID", search.QuestionID);
                    cmd.Parameters.AddWithValue("OrgIDs_Rank3", search.OrgTypeLevel3IDs);
                    cmd.Parameters.AddWithValue("OrgIDs_Rank2", search.OrgTypeLevel2IDs);
                    cmd.Parameters.AddWithValue("OrgIDs_Rank1_Depts", search.OrgTypeLevel1IDs);
                    cmd.Parameters.AddWithValue("OrgActive", search.InActiveOrgTypes ? -1 : 1);
                    cmd.Parameters.AddWithValue("CycleID", AppSession.CycleID);
                    cmd.Parameters.AddWithValue("StartDate", search.StartDate);
                    cmd.Parameters.AddWithValue("EndDate", search.EndDate);
                    cmd.Parameters.AddWithValue("MinDenominator", search.IncludeMinimalDenomValue ? search.MinimalDenomValue : -1);
                    cmd.Parameters.AddWithValue("MinCompliance", minCompliance);
                    cmd.Parameters.AddWithValue("MaxCompliance", maxCompliance);
                    cmd.Parameters.AddWithValue("TracerTypeID", search.TracerTypeID);

                    CreateSQLExecuted(spName, cmd);
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
            return ds;


        }

        public byte[] ReportComplianceQuestionDetailExcelIE8(TracerComplianceQuestionInput search)
        {
            byte[] fileContents = null;
            string matchMessage = String.Empty;
            string idColumnName = "QID";
            string complianceColumnName = "OverallCompliance";

            search.OrgTypeLevel1IDs = (search.OrgTypeLevel1IDs != null && search.OrgTypeLevel1IDs != "-1") ? search.OrgTypeLevel1IDs : "";
            search.OrgTypeLevel2IDs = (search.OrgTypeLevel2IDs != null && search.OrgTypeLevel2IDs != "-1") ? search.OrgTypeLevel2IDs : "";
            search.OrgTypeLevel3IDs = (search.OrgTypeLevel3IDs != null && search.OrgTypeLevel3IDs != "-1") ? search.OrgTypeLevel3IDs : "";
            string reportDateTitle = "";


            string rdlcName = "rptReportComplianceByQuestionDetailExcel.rdlc";
            string dsName = "dsReport_ComplianceByQuestionDetail";
            DataView dv = null;

            try
            {
                var fulldt = ReportComplianceQuestionDetail(search).Tables[0];
                dv = new DataView(fulldt);

                int topLeastDropdownValue = Convert.ToInt32(search.TopLeastCompliantQuestions);
                if (topLeastDropdownValue > 0)
                    dv = CommonService.TopNData(dv, topLeastDropdownValue, idColumnName, complianceColumnName, ref matchMessage);

                
                if (AppSession.ReportScheduleID > 0)
                    search.ReportTitle = String.Concat(search.ReportTitle, " - Report ID: ", AppSession.ReportScheduleID);

                reportDateTitle = CommonService.InitializeReportDateTitle("Tracer", search.StartDate, search.EndDate);
                search.EndDate = (search.EndDate != null && search.EndDate.ToString() != "") ? search.EndDate.Value.Date.AddHours(23).AddMinutes(29).AddSeconds(59) : search.EndDate;


                // Setup ReportViewer 
                ReportViewer reportViewer = new ReportViewer();
                reportViewer.ProcessingMode = ProcessingMode.Local;
                reportViewer.SizeToReportContent = true;
                reportViewer.LocalReport.DisplayName = search.ReportTitle;

                // Setup Data sources for report
                reportViewer.LocalReport.DataSources.Clear();
                reportViewer.LocalReport.ReportPath = HttpContext.Current.Request.MapPath(HttpContext.Current.Request.ApplicationPath) + @"Areas\Tracer\Reports\" + rdlcName.ToString();
                reportViewer.LocalReport.DataSources.Add(new ReportDataSource(dsName, dv));

                // Setup Parameter DataSet
                DataSet reportParameters = CommonService.ReportParameters();
                // Excel view here
                // Add Parameter Data Set
                reportParameters.Tables[0].Rows.Add(WebConstants.PARAM_SiteName, AppSession.SelectedSiteName, "1");
                reportParameters.Tables[0].Rows.Add(WebConstants.PARAM_ProgramName, AppSession.SelectedProgramName, "1");
                if (search.TopLeastCompliantQuestions == "0")
                {
                    reportParameters.Tables[0].Rows.Add(WebConstants.PARAM_SelectedQuestions, "", "1");
                    reportParameters.Tables[0].Rows.Add(WebConstants.PARAM_Keyword, search.Keyword.ToString(), "1");
                }
                else
                    reportParameters.Tables[0].Rows.Add(WebConstants.PARAM_TopLeastCompliantQuestionsValue, search.TopLeastCompliantQuestions.ToString(), "1");

                reportParameters.Tables[0].Rows.Add(WebConstants.PARAM_AllQuestions, search.AllTracers ? "True" : "False", "1");
                reportParameters.Tables[0].Rows.Add(WebConstants.PARAM_StartDate, search.StartDate == null ? "" : Convert.ToDateTime(search.StartDate).ToShortDateString(), "1");
                reportParameters.Tables[0].Rows.Add(WebConstants.PARAM_EndDate, search.EndDate == null ? "" : Convert.ToDateTime(search.EndDate).ToShortDateString(), "1");
                reportParameters.Tables[0].Rows.Add(WebConstants.PARAM_IncludeMinimalDenominator, search.IncludeMinimalDenomValue ? "True" : "False", "1");
                reportParameters.Tables[0].Rows.Add(WebConstants.PARAM_IncludeMinimalDenominatorValue, search.MinimalDenomValue, "1");

                reportParameters.Tables[0].Rows.Add(CommonService.GetOrgHeader(), search.InActiveOrgTypes ? "True" : "False", "1");
                reportParameters.Tables[0].Rows.Add(AppSession.OrgRanking1Name, search.OrgTypeLevel1Names, "1");
                if (AppSession.OrgRanking2Name != "")
                    reportParameters.Tables[0].Rows.Add(AppSession.OrgRanking2Name, search.OrgTypeLevel2Names, "1");
                if (AppSession.OrgRanking3Name != "")
                    reportParameters.Tables[0].Rows.Add(AppSession.OrgRanking3Name, search.OrgTypeLevel3Names, "1");

                // Add Parameters as Data source
                DataView dvReport2 = new DataView(reportParameters.Tables[0]);
                ReportDataSource datasource2 = new ReportDataSource("dsReport_Parameters", dvReport2);
                reportViewer.LocalReport.DataSources.Add(datasource2);


                ReportParameter p1 = new ReportParameter("ReportTitle", search.ReportTitle.ToString() + " - Detail");
                ReportParameter p2 = new ReportParameter("SiteName", AppSession.SelectedSiteName);
                ReportParameter p3 = new ReportParameter("ProgramName", AppSession.SelectedProgramName);
                ReportParameter p4 = new ReportParameter("ReportDateTitle", reportDateTitle.ToString());
                ReportParameter p5 = new ReportParameter("Copyright", "© " + DateTime.Now.Year.ToString() + WebConstants.Tracer_Copyright.ToString());
                ReportParameter p6 = new ReportParameter("OrgType1Header", AppSession.OrgRanking1Name.ToString());                 // Provide OrgType Rank 1 Name header (e.g., Department)
                ReportParameter p7 = new ReportParameter("OrgType2Header", AppSession.OrgRanking2Name.ToString());                 // Provide OrgType Rank 2 Name column header or blank if none
                ReportParameter p8 = new ReportParameter("OrgType3Header", AppSession.OrgRanking3Name.ToString());                 // Provide OrgType Rank 2 Name column header or blank if none
                ReportParameter p9 = new ReportParameter("OrgRank1Names", search.OrgTypeLevel1Names.ToString());                   // Filtered Rank 1 Org Names or blank string for all
                ReportParameter p10 = new ReportParameter("OrgRank2Names", search.OrgTypeLevel2Names.ToString());                   // Filtered Rank 2 Org Names or blank string for all
                ReportParameter p11 = new ReportParameter("OrgRank3Names", search.OrgTypeLevel3Names.ToString());                   // Filtered Rank 3 Org Names or blank string for all
                ReportParameter p12 = new ReportParameter("TopLeastCompliantQuestions", search.TopLeastCompliantQuestions.ToString());
                ReportParameter p13 = new ReportParameter("AllTracers", search.AllTracers ? "1" : "0");
                ReportParameter p14 = new ReportParameter("InActiveOrgTypes", search.InActiveOrgTypes ? "0" : "1");
                ReportParameter p15 = new ReportParameter("Keyword", search.Keyword == null ? "" : search.Keyword.ToString());
                ReportParameter p16 = new ReportParameter("TracerNames", search.TracerListNames == null ? "" : search.TracerListNames.ToString());
                ReportParameter p17 = new ReportParameter("Message", matchMessage.ToString());
                ReportParameter p18 = new ReportParameter("MinimalDenomValue", search.MinimalDenomValue.ToString());
                ReportParameterCollection reportParameterCollection = new ReportParameterCollection { p1, p2, p3, p4, p5, p6, p7, p8, p9, p10, p11, p12, p13, p14, p15, p16, p17, p18 };
                reportViewer.LocalReport.SetParameters(reportParameterCollection);
                Warning[] warnings;
                string[] streamIds;
                string mimeType = string.Empty;
                string encoding = string.Empty;
                string extension = string.Empty;
                fileContents = reportViewer.LocalReport.Render("EXCELOPENXML", null, out mimeType, out encoding, out extension, out streamIds, out warnings);

            }
            catch (Exception ex)
            {
                throw ex;
            }

            return fileContents;
        }
    }
}