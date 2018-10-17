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
using JCR.Reports.Models.Enums;
namespace JCR.Reports.Areas.Tracer.Services
{
    public class TracerComprehensive : BaseService
    {
        ExceptionService _exceptionService = new ExceptionService();
        public DataSourceResult TracerComprehensiveExcel([DataSourceRequest]DataSourceRequest request, Search search)
        {
            DataSourceResult result = new DataSourceResult();
            try
            {
                SearchFormat sf = new SearchFormat();
                sf.CheckInputs(search);

                List<TracerComprehensiveExcel> tracerComprehensiveExcel = new List<TracerComprehensiveExcel>();
                DataTable dt = new DataTable();
                var tcService = new TracerComprehensive();
                dt = tcService.TracerComprehensiveData(search).Tables[0];
                //int rowsCount = dt.Rows.Count;
                //if (rowsCount > 65000)
                //{
                //    result.Errors = WebConstants.DATA_LIMIT_EXCEL_VIEW + rowsCount.ToString();
                //}
                //else
                //{
                //convert datatable to list       
                tracerComprehensiveExcel = dt.ToList<TracerComprehensiveExcel>();


                result = tracerComprehensiveExcel.ToDataSourceResult(request, tc => new TracerComprehensiveExcel
                {
                    // Get Excel View DataSet
                    //SiteID = tc.SiteID,
                    TracerCustomName = tc.TracerCustomName,
                    //TracerCustomID = tc.TracerCustomID,
                    TracerResponseTitle = tc.TracerResponseTitle,
                    //TracerResponseID = tc.TracerResponseID,
                    OrgName_Rank3 = tc.OrgName_Rank3,
                    OrgName_Rank2 = tc.OrgName_Rank2,
                    OrgName_Rank1_Dept = tc.OrgName_Rank1_Dept,
                    //OrgID_Rank1_Dept = tc.OrgID_Rank1_Dept,
                    //OrgID_Rank2 = tc.OrgID_Rank2,
                    //OrgID_Rank3 = tc.OrgID_Rank3,
                    SurveyTeam = tc.SurveyTeam.ReplaceNewline(),
                    MedicalStaffInvolved = tc.MedicalStaffInvolved.ReplaceNewline(),
                    Location = tc.Location.ReplaceNewline(),
                    MedicalRecordNumber = tc.MedicalRecordNumber.ReplaceNewline(),
                    EquipmentObserved = tc.EquipmentObserved.ReplaceNewline(),
                    ContractedService = tc.ContractedService.ReplaceNewline(),
                    StaffInterviewed = tc.StaffInterviewed.ReplaceNewline(),
                    TracerNote = tc.TracerNote.ReplaceNewline(),
                    UpdatedById = tc.UpdatedById,
                    UpdatedByUserName = tc.UpdatedByUserName,
                    QuestionAnswer = tc.QuestionAnswer,
                    ObservationDate = tc.ObservationDate,
                    UpdatedDate = tc.UpdatedDate,
                    Numerator = tc.Numerator,
                    Denominator = tc.Denominator,
                    CompliancePercent = tc.CompliancePercent,
                    TracerQuestionNumber = tc.TracerQuestionNumber,
                    TracerQuestionID = tc.TracerQuestionID,
                    QuestionText = tc.QuestionText.ReplaceSpecialCharacters(),
                    //TotalNumerator = tc.TotalNumerator,
                    //TotalDenominator = tc.TotalDenominator,
                    //TotalCompliancePercent = tc.TotalCompliancePercent,
                    FollowUpRequired = tc.FollowUpRequired,
                    TracerQuestionNote = tc.TracerQuestionNote.ReplaceNewline(),
                    StandardEP = tc.StandardEP.ReplaceNewline(),
                    TotalObservationsCount = tc.TotalObservationsCount
                });
                // }

            }
            catch (Exception ex)
            {
                if (ex.Message.ToString() == "No Data")
                {
                    result.Errors = WebConstants.NO_DATA_FOUND_EXCEL_VIEW;
                }
                else if (ex.Message.ToString() == "Limit")
                {
                    if (search.ReportTypeSumDet == "ExcelView")
                        result.Errors = "Maximum limit of " + ConfigurationManager.AppSettings["ReportOutputLimitExcelView"].ToString() + " records reached. Refine your criteria to narrow the result.";
                    else
                        result.Errors = "Maximum limit of " + ConfigurationManager.AppSettings["ReportOutputLimit"].ToString() + " records reached. Refine your criteria to narrow the result.";
                }


                if (ex.Message.ToString() != "No Data" && ex.Message.ToString() != "Limit")
                {

                    ExceptionLog exceptionLog = new ExceptionLog
                    {
                        ExceptionText = "Reports: " + ex.Message,
                        PageName = "TracerComprehensive",
                        MethodName = "_TracerComprehensiveDataExcel",
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

        public byte[] TracerComprehensiveDataIE(Search search)
        {

            string rdlcName = String.Empty;
            string dsName = String.Empty;
            string reportTitleAdder = String.Empty;

            SearchFormat sf = new SearchFormat();
            sf.CheckInputs(search);
            byte[] fileContents = null;

            try
            {
                var fulldt = TracerComprehensiveData(search).Tables[0];
                DataView dv = new DataView(fulldt);

                if (AppSession.ReportScheduleID > 0)
                    search.ReportTitle = String.Concat(search.ReportTitle, " - Report ID: ", AppSession.ReportScheduleID);

                search.ReportDateTitle = CommonService.InitializeReportDateTitle("Tracer", search.StartDate, search.EndDate);
                search.EndDate = (search.EndDate != null && search.EndDate.ToString() != "") ? search.EndDate.Value.Date.AddHours(23).AddMinutes(29).AddSeconds(59) : search.EndDate;


                // Setup ReportViewer 
                ReportViewer reportViewer = new ReportViewer();
                reportViewer.ProcessingMode = ProcessingMode.Local;
                reportViewer.SizeToReportContent = true;
                reportViewer.LocalReport.DisplayName = search.ReportTitle;

                if (search.GroupByObsQues == "Observation")
                {
                    rdlcName = "rptReportTracerComprehensiveByResponsesDetailExport.rdlc";
                    dsName = "dsReport_TracerComprehensiveDetailByResponseExport";
                    reportTitleAdder = " - Detail By Observations";
                }
                else
                {
                    rdlcName = "rptReportTracerComprehensiveByQuestionsDetailExport.rdlc";
                    dsName = "dsReport_TracerComprehensiveDetailByQuestionExport";
                    reportTitleAdder = " - Detail By Questions";

                }

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
                reportParameters.Tables[0].Rows.Add(WebConstants.PARAM_TracerCategories, search.TracerCategoryNames.ToString(), "1");
                reportParameters.Tables[0].Rows.Add(WebConstants.PARAM_TracerName, search.TracerListNames.ToString(), "1");
                reportParameters.Tables[0].Rows.Add(WebConstants.PARAM_ReportType, search.ReportTypeSumDet.ToString(), "1");
                reportParameters.Tables[0].Rows.Add(WebConstants.PARAM_ReportGroupByType, search.GroupByObsQues.ToString(), "1");
                reportParameters.Tables[0].Rows.Add(WebConstants.PARAM_StartDate, search.StartDate == null ? "" : Convert.ToDateTime(search.StartDate).ToShortDateString(), "1");
                reportParameters.Tables[0].Rows.Add(WebConstants.PARAM_EndDate, search.EndDate == null ? "" : Convert.ToDateTime(search.EndDate).ToShortDateString(), "1");
                reportParameters.Tables[0].Rows.Add(WebConstants.PARAM_IncludeCompliancePercent, search.IncludeNonCompliantOpportunities ? "True" : "False", "1");
                reportParameters.Tables[0].Rows.Add(WebConstants.PARAM_CompliancePercent, search.OpportunitiesValue.ToString(), "1");
                reportParameters.Tables[0].Rows.Add(WebConstants.PARAM_FollowupRequired, search.IncludeFollowup ? "True" : "False", "1");
                reportParameters.Tables[0].Rows.Add(WebConstants.PARAM_IncludeNA, search.IncludeNA ? "True" : "False", "1");
                reportParameters.Tables[0].Rows.Add(WebConstants.PARAM_FSA, search.IncludeFsa ? "True" : "False", "1");
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

                ReportParameter p1 = new ReportParameter("ReportTitle", search.ReportTitle.ToString() + reportTitleAdder.ToString());
                ReportParameter p2 = new ReportParameter("SiteName", AppSession.SelectedSiteName);
                ReportParameter p3 = new ReportParameter("ProgramName", AppSession.SelectedProgramName);
                ReportParameter p4 = new ReportParameter("ReportDateTitle", search.ReportDateTitle.ToString());
                ReportParameter p5 = new ReportParameter("Copyright", "© " + DateTime.Now.Year.ToString() + WebConstants.Tracer_Copyright.ToString());
                ReportParameter p6 = new ReportParameter("CategoryNames", search.TracerCategoryNames.ToString());
                ReportParameter p7 = new ReportParameter("FollowupRequired", search.IncludeFollowup ? "1" : "0");
                ReportParameter p8 = new ReportParameter("IncludeNA", search.IncludeNA ? "1" : "0");
                ReportParameter p9 = new ReportParameter("FSA", search.IncludeFsa ? "1" : "0");
                ReportParameter p10 = new ReportParameter("TracerNames", search.TracerListNames.ToString());
                ReportParameter p11 = new ReportParameter("OrgType1Header", AppSession.OrgRanking1Name.ToString());                 // Provide OrgType Rank 1 Name header (e.g., Department)
                ReportParameter p12 = new ReportParameter("OrgType2Header", AppSession.OrgRanking2Name.ToString());                 // Provide OrgType Rank 2 Name column header or blank if none
                ReportParameter p13 = new ReportParameter("OrgType3Header", AppSession.OrgRanking3Name.ToString());                 // Provide OrgType Rank 2 Name column header or blank if none
                ReportParameter p14 = new ReportParameter("OrgRank1Names", search.OrgTypeLevel1Names.ToString());                   // Filtered Rank 1 Org Names or blank string for all
                ReportParameter p15 = new ReportParameter("OrgRank2Names", search.OrgTypeLevel2Names.ToString());                   // Filtered Rank 2 Org Names or blank string for all
                ReportParameter p16 = new ReportParameter("OrgRank3Names", search.OrgTypeLevel3Names.ToString());                   // Filtered Rank 3 Org Names or blank string for all
                ReportParameter p17 = new ReportParameter("IncludeCompliancePercent", search.IncludeNonCompliantOpportunities ? "1" : "0");
                ReportParameter p18 = new ReportParameter("CompliancePercent", search.OpportunitiesValue.ToString());

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


        public ReportViewer TracerComprehensiveRDLC(Search search, Email emailInput)
        {

            SearchFormat sf = new SearchFormat();
            sf.CheckInputs(search);

            string msg = String.Empty;
            string rdlcName = String.Empty;
            string dsName = String.Empty;
            string reportTitleAdder = String.Empty;

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

                switch (search.ReportTypeSumDet)
                {
                    case "Detail":
                        {

                            if (search.GroupByObsQues == "Observation")
                            {
                                // Detail by Observation
                                rdlcName = @"Areas\Tracer\Reports\rptReportTracerComprehensiveByResponsesDetail.rdlc";
                                dsName = "dsReport_TracerComprehensiveDetailByResponse";
                                reportTitleAdder = " - Detail By Observations";
                            }
                            else
                            {
                                // Detail By Question
                                rdlcName = @"Areas\Tracer\Reports\rptReportTracerComprehensiveByQuestionsDetail.rdlc";
                                dsName = "dsReport_TracerComprehensiveDetailByQuestion";
                                reportTitleAdder = " - Detail By Questions";
                            }
                            break;
                        }

                    case "Summary":
                    default:
                        {
                            if (search.GroupByObsQues == "Observation")
                            {
                                // Summary By Observation
                                rdlcName = @"Areas\Tracer\Reports\rptReportTracerComprehensiveByResponsesSummary.rdlc";
                                dsName = "dsReport_TracerComprehensiveSummaryByResponse";
                                reportTitleAdder = " - Summary By Observations";
                            }
                            else
                            {
                                // Summary By Question
                                rdlcName = @"Areas\Tracer\Reports\rptReportTracerComprehensiveByQuestionsSummary.rdlc";
                                dsName = "dsReport_TracerComprehensiveSummaryByQuestion";
                                reportTitleAdder = " - Summary By Questions";
                            }
                            break;
                        }


                }

                if (AppSession.ReportScheduleID > 0)
                    reportTitleAdder = String.Concat(reportTitleAdder, " - Report ID: ", AppSession.ReportScheduleID);

                reportViewer.LocalReport.DisplayName = search.ReportTitle;
                reportViewer.LocalReport.ReportPath = HttpContext.Current.Request.MapPath(HttpContext.Current.Request.ApplicationPath) + rdlcName;
                reportViewer.LocalReport.DataSources.Add(new ReportDataSource(dsName, TracerComprehensiveData(search).Tables[0]));

                ReportParameter p1 = new ReportParameter("ReportTitle", search.ReportTitle.ToString() + reportTitleAdder.ToString());
                ReportParameter p2 = new ReportParameter("SiteName", AppSession.SelectedSiteName);
                ReportParameter p3 = new ReportParameter("ProgramName", AppSession.SelectedProgramName);
                ReportParameter p4 = new ReportParameter("ReportDateTitle", search.ReportDateTitle.ToString());
                ReportParameter p5 = new ReportParameter("Copyright", "© " + DateTime.Now.Year.ToString() + WebConstants.Tracer_Copyright.ToString());
                ReportParameter p6 = new ReportParameter("CategoryNames", search.TracerCategoryNames.ToString());
                ReportParameter p7 = new ReportParameter("FollowupRequired", search.IncludeFollowup ? "1" : "0");
                ReportParameter p8 = new ReportParameter("IncludeNA", search.IncludeNA ? "1" : "0");
                ReportParameter p9 = new ReportParameter("FSA", search.IncludeFsa ? "1" : "0");
                ReportParameter p10 = new ReportParameter("TracerNames", search.TracerListNames.ToString());
                ReportParameter p11 = new ReportParameter("OrgType1Header", AppSession.OrgRanking1Name.ToString());                 // Provide OrgType Rank 1 Name header (e.g., Department)
                ReportParameter p12 = new ReportParameter("OrgType2Header", AppSession.OrgRanking2Name.ToString());                 // Provide OrgType Rank 2 Name column header or blank if none
                ReportParameter p13 = new ReportParameter("OrgType3Header", AppSession.OrgRanking3Name.ToString());                 // Provide OrgType Rank 2 Name column header or blank if none
                ReportParameter p14 = new ReportParameter("OrgRank1Names", search.OrgTypeLevel1Names.ToString());                   // Filtered Rank 1 Org Names or blank string for all
                ReportParameter p15 = new ReportParameter("OrgRank2Names", search.OrgTypeLevel2Names.ToString());                   // Filtered Rank 2 Org Names or blank string for all
                ReportParameter p16 = new ReportParameter("OrgRank3Names", search.OrgTypeLevel3Names.ToString());                   // Filtered Rank 3 Org Names or blank string for all
                ReportParameter p17 = new ReportParameter("IncludeCompliancePercent", search.IncludeNonCompliantOpportunities ? "1" : "0");
                ReportParameter p18 = new ReportParameter("CompliancePercent", search.OpportunitiesValue.ToString());
                ReportParameter p19 = new ReportParameter("TracerTypeID", search.TracerTypeID < 1 ? "1" : search.TracerTypeID.ToString());
                ReportParameter p20 = new ReportParameter("IsCMSEnabled", AppSession.IsCMSProgram ? "1" : "0");
                ReportParameterCollection reportParameterCollection = new ReportParameterCollection { p1, p2, p3, p4, p5, p6, p7, p8, p9, p10, p11, p12, p13, p14, p15, p16, p17, p18, p19, p20 };
                reportViewer.LocalReport.SetParameters(reportParameterCollection);
                if (emailInput.To != null)
                {
                    CommonService emailService = new CommonService();
                    int actionTypeId = (int)ActionTypeEnum.ComprehensiveTracerReport;
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
                        PageName = "TracerComprehensive",
                        MethodName = "_TracerComprehensiveRDLC",
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

        public DataSet TracerComprehensiveData(Search search)
        {
            string msg = String.Empty;
            DataSet ds = new DataSet();
            string spName = "ustReport_TracerComprehensiveSummaryByQuestion";       // default
            try
            {

                switch (search.ReportTypeSumDet)
                {
                    case "Detail":
                    default:
                        {
                            if (search.GroupByObsQues == "Observation")
                                spName = "ustReport_TracerComprehensiveDetailByResponse";
                            else
                                spName = "ustReport_TracerComprehensiveDetailByQuestion";
                            break;
                        }

                    case "Summary":
                        {
                            if (search.GroupByObsQues == "Observation")
                                spName = "ustReport_TracerComprehensiveSummaryByResponse";
                            else
                                spName = "ustReport_TracerComprehensiveSummaryByQuestion";
                            break;
                        }

                    case "ExcelView":
                        {
                            if (search.GroupByObsQues == "Observation")
                                spName = "ustReport_TracerComprehensiveDetailByResponseExport";
                            else
                                spName = "ustReport_TracerComprehensiveDetailByQuestionExport";
                            break;
                        }
                }


                using (SqlConnection cn = new SqlConnection(ConfigurationManager.ConnectionStrings["DBMEdition01"].ToString()))
                {
                    cn.Open();
                    SqlCommand cmd = new SqlCommand(spName, cn);
                    cmd.CommandTimeout = Convert.ToInt32(ConfigurationManager.AppSettings["SPCmdTimeout"].ToString());
                    cmd.CommandType = System.Data.CommandType.StoredProcedure;
                    cmd.Parameters.AddWithValue("SiteID", AppSession.SelectedSiteId);
                    cmd.Parameters.AddWithValue("ProgramID", AppSession.SelectedProgramId);
                    cmd.Parameters.AddWithValue("TracerCategoryIDs", search.TracerCategoryIDs);
                    cmd.Parameters.AddWithValue("TracerIDs", search.TracerListIDs);
                    cmd.Parameters.AddWithValue("OrgIDs_Rank3", search.OrgTypeLevel3IDs);
                    cmd.Parameters.AddWithValue("OrgIDs_Rank2", search.OrgTypeLevel2IDs);
                    cmd.Parameters.AddWithValue("OrgIDs_Rank1_Depts", search.OrgTypeLevel1IDs);
                    cmd.Parameters.AddWithValue("FollowupRequired", search.IncludeFollowup ? 1 : 0);
                    cmd.Parameters.AddWithValue("CompliancePercent", search.IncludeNonCompliantOpportunities ? search.OpportunitiesValue : -1);
                    cmd.Parameters.AddWithValue("OrgActive", search.InActiveOrgTypes ? -1 : 1);
                    cmd.Parameters.AddWithValue("IncludeNA", search.IncludeNA ? 1 : 0);
                    cmd.Parameters.AddWithValue("FSA", search.IncludeFsa ? 1 : 0);
                    cmd.Parameters.AddWithValue("CycleID", AppSession.CycleID);
                    cmd.Parameters.AddWithValue("ResponseStartDate", search.StartDate);
                    cmd.Parameters.AddWithValue("ResponseEndDate", search.EndDate);
                    cmd.Parameters.AddWithValue("TracerTypeID", search.TracerTypeID);

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

            if (search.ReportTypeSumDet == "ExcelView")
            {
                if (rowsCount > Convert.ToInt32(ConfigurationManager.AppSettings["ReportOutputLimitExcelView"].ToString()))
                    throw (new Exception("Limit"));
            }
            else
            {
                if (rowsCount > Convert.ToInt32(ConfigurationManager.AppSettings["ReportOutputLimit"].ToString()))
                    throw (new Exception("Limit"));
            }

            // Adjust totals so we do nt double dip
            if (search.ReportTypeSumDet.ToString() == "Detail")
                ds = AdjustTotalsByDetail(ds);
            else if ((search.ReportTypeSumDet.ToString() == "Summary") && (search.GroupByObsQues != "Observation"))
                ds = AdjustTotalsByQuestionSummary(ds);


            return ds;
        }

        private DataSet AdjustTotalsByDetail(DataSet ds)
        {

            DataSet returnDS = new DataSet();

            try
            {
                returnDS = ds;
                if ((returnDS != null) && (returnDS.Tables[0].Rows.Count > 0))
                {

                    // By Tracer Response
                    bool first = true;
                    int tracerCustomID = 0;
                    int tracerResponseID = 0;
                    int tracerQuestionNumber = 0;

                    foreach (DataRow row in returnDS.Tables[0].Rows)
                    {
                        if (first == true)
                        {
                            tracerCustomID = Convert.ToInt32(row["TracerCustomID"]);
                            tracerResponseID = Convert.ToInt32(row["TracerResponseID"]);
                            tracerQuestionNumber = Convert.ToInt32(row["TracerQuestionNumber"]);
                            first = false;
                        }
                        else
                        {
                            if ((Convert.ToInt32(row["TracerCustomID"]) == tracerCustomID) &&
                                (Convert.ToInt32(row["TracerResponseID"]) == tracerResponseID) &&
                                (Convert.ToInt32(row["TracerQuestionNumber"]) == tracerQuestionNumber))
                            {
                                // We clear out counts on redundant records per this record group
                                row["Numerator"] = 0;
                                row["Denominator"] = 0;
                                //row["IncludeTotalCount"] = 0;
                                //row["Compliance"] = 0;
                            }
                            else
                            {
                                // We found a new record group
                                tracerCustomID = Convert.ToInt32(row["TracerCustomID"]);
                                tracerResponseID = Convert.ToInt32(row["TracerResponseID"]);
                                tracerQuestionNumber = Convert.ToInt32(row["TracerQuestionNumber"]);
                            }
                        }
                    }
                }

            }
            catch (Exception ex)
            {
                string msg = ex.Message.ToString();
                ExceptionLog exceptionLog = new ExceptionLog
                {
                    ExceptionText = "Reports: " + msg.ToString(),
                    PageName = "TracerComprehensive",
                    MethodName = "AdjustTotalsByDetail",
                    UserID = Convert.ToInt32(AppSession.UserID),
                    SiteId = Convert.ToInt32(AppSession.SelectedSiteId),
                    TransSQL = "",
                    HttpReferrer = null
                };
                _exceptionService.LogException(exceptionLog);
            }

            return returnDS;
        }
        private DataSet AdjustTotalsByQuestionSummary(DataSet ds)
        {
            DataSet returnDS = new DataSet();
            try
            {
                returnDS = ds;
                if ((returnDS != null) && (returnDS.Tables[0].Rows.Count > 0))
                {

                    // By Tracer Response
                    bool first = true;
                    int tracerCustomID = 0;
                    // int tracerResponseID = 0;
                    int tracerQuestionNumber = 0;

                    foreach (DataRow row in returnDS.Tables[0].Rows)
                    {
                        if (first == true)
                        {
                            tracerCustomID = Convert.ToInt32(row["TracerCustomID"]);
                            //tracerResponseID = Convert.ToInt32(row["TracerResponseID"]);
                            tracerQuestionNumber = Convert.ToInt32(row["TracerQuestionNumber"]);
                            first = false;
                        }
                        else
                        {
                            if ((Convert.ToInt32(row["TracerCustomID"]) == tracerCustomID) &&
                                (Convert.ToInt32(row["TracerQuestionNumber"]) == tracerQuestionNumber))
                            {
                                // We clear out counts on redundant records per this record group
                                row["TotalNumerator"] = 0;
                                row["TotalDenominator"] = 0;
                                //row["IncludeTotalCount"] = 0;
                                //row["Compliance"] = 0;
                            }
                            else
                            {
                                // We found a new record group
                                tracerCustomID = Convert.ToInt32(row["TracerCustomID"]);
                                //tracerResponseID = Convert.ToInt32(row["TracerResponseID"]);
                                tracerQuestionNumber = Convert.ToInt32(row["TracerQuestionNumber"]);
                            }
                        }
                    }
                }

            }
            catch (Exception ex)
            {

                string msg = ex.Message.ToString();
                ExceptionLog exceptionLog = new ExceptionLog
                {
                    ExceptionText = "Reports: " + msg.ToString(),
                    PageName = "TracerComprehensive",
                    MethodName = "AdjustTotalsByQuestionSummary",
                    UserID = Convert.ToInt32(AppSession.UserID),
                    SiteId = Convert.ToInt32(AppSession.SelectedSiteId),
                    TransSQL = "",
                    HttpReferrer = null
                };
                _exceptionService.LogException(exceptionLog);



            }
            return returnDS;
        }
    }



}