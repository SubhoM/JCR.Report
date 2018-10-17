using JCR.Reports.Common;
using JCR.Reports.Models;
using JCR.Reports.ViewModels;
using Kendo.Mvc.UI;
using Kendo.Mvc.Extensions;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using System.Configuration;
using System.Web;
using Microsoft.Reporting.WebForms;
using JCR.Reports.Services;
using JCR.Reports.Areas.Tracer.ViewModels;
using JCR.Reports.Areas.Tracer.Models;
using JCR.Reports.Models.Enums;

namespace JCR.Reports.Areas.Tracer.Services
{
    public class MonthlyBreakdownService : BaseService
    {

        ExceptionService _exceptionService = new ExceptionService();

        public DataSourceResult TracerBreakdownExcel([DataSourceRequest]DataSourceRequest request, Search search)
        {
            SearchFormat sf = new SearchFormat();

            sf.CheckInputs(search);

            List<TracerBreakdownExcel> tracerBreakdownExcel = new List<TracerBreakdownExcel>();
            DataTable dt = new DataTable();

            DataSourceResult result = new DataSourceResult();
            try
            {

                dt = this.GetTracerMonthlyBreakdownData(search).Tables[0];

                var tracerTransform = dt.ToList<TracerByMonthTransform>();
                //convert datatable to list       
                tracerBreakdownExcel = TransformTracerBreakdown(tracerTransform, search);

                result = tracerBreakdownExcel.ToDataSourceResult(request, tc => new TracerBreakdownExcel
                {
                    // TO DO Get Excel View DataSet
                     TracerName = tc.TracerName,
                     MonthwiseTracer = tc.MonthwiseTracer

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
                        PageName = "MonthlyBreakdownService",
                        MethodName = "TracerBreakdownExcel",
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


        public DataSourceResult QuestionBreakdownExcel([DataSourceRequest]DataSourceRequest request, Search search)
        {
            SearchFormat sf = new SearchFormat();

            sf.CheckInputs(search);

            List<TracerBreakdownExcel> tracerBreakdownExcel = new List<TracerBreakdownExcel>();
            DataTable dt = new DataTable();

            DataSourceResult result = new DataSourceResult();
            try
            {

                dt = this.GetQuestionMonthlyBreakdownData(search).Tables[0];

                var tracerTransform = dt.ToList<TracerByMonthTransform>();
                //convert datatable to list       
                tracerBreakdownExcel = TransformQuestionBreakdown(tracerTransform, search);

                var columnCount = tracerBreakdownExcel[0].MonthwiseTracer.Count;
                var returntracerBreakdownExcel = tracerBreakdownExcel.OrderBy(item => item.MonthwiseTracer[columnCount - 1].CompliancePercentage).
                    ThenByDescending(item2 => item2.MonthwiseTracer[columnCount - 1].Denominator).ToList<TracerBreakdownExcel>();
                result = returntracerBreakdownExcel.ToDataSourceResult(request, tc => new TracerBreakdownExcel
                {
                    // TO DO Get Excel View DataSet
                    TracerName = tc.TracerName.ReplaceNewline(),
                    MonthwiseTracer = tc.MonthwiseTracer

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
                        PageName = "MonthlyBreakdownService",
                        MethodName = "QuestionBreakdownExcel",
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

        public List<MonthlyBreakdownGraph> QuestionBreakdownChart([DataSourceRequest]DataSourceRequest request, Search search)
        {
            SearchFormat sf = new SearchFormat();

            sf.CheckInputs(search);

            List<MonthlyBreakdownGraph> dsMonthlyCompData = new List<MonthlyBreakdownGraph>();
            try
            {
                DataSet dsData = null;
                switch (search.MonthlyReportType)
                {
                    case "Question":
                        int topLeastDropdownValue = 0;
                        int.TryParse(search.TopLeastCompliantQuestions, out topLeastDropdownValue);

                        if(topLeastDropdownValue > 0)
                            search.TopLeastCompliantQuestions = (topLeastDropdownValue - 1).ToString();

                        dsData = this.GetQuestionMonthlyBreakdownData(search);
                        break;
                    case "Tracer":
                        dsData = this.GetTracerMonthlyBreakdownData(search);
                        break;
                    default: break;
                }
                var monthslist = HelperClasses.GetMonthsList(search.StartDate, search.EndDate);

                monthslist.Remove("Total");
                dsMonthlyCompData = GetMonthlyComplianceData(dsData, monthslist);

            }
            catch (Exception ex)
            {
                if (ex.Message.ToString() != "No Data" && ex.Message.ToString() != "Limit")
                {
                    ExceptionLog exceptionLog = new ExceptionLog
                    {
                        ExceptionText = "Reports: " + ex.Message,
                        PageName = "MonthlyBreakdownService",
                        MethodName = "MOnthlyBreakdown Chart " + search.MonthlyReportType,
                        UserID = Convert.ToInt32(AppSession.UserID),
                        SiteId = Convert.ToInt32(AppSession.SelectedSiteId),
                        TransSQL = "",
                        HttpReferrer = null
                    };
                    _exceptionService.LogException(exceptionLog);
                }
            }
            return dsMonthlyCompData;
        }

        public Search GetReportValuesForSearch(Search search)
        {
            SearchFormat sf = new SearchFormat();

            sf.CheckInputs(search);



            if (AppSession.ReportScheduleID > 0)
                search.ReportTitle = String.Concat(search.ReportTitle, " - Report ID: ", AppSession.ReportScheduleID);

            if (search.StartDate != null && search.EndDate != null)
            {
                search.ReportDateTitle = "Observation updates for " + search.StartDate.Value.ToShortDateString() + " - " + search.EndDate.Value.ToShortDateString();
                search.EndDate = search.EndDate.Value.Date.AddHours(23).AddMinutes(29).AddSeconds(59);
            }
            else if (search.StartDate != null && search.EndDate == null)
            {
                search.ReportDateTitle = "Observation  updates since " + search.StartDate.Value.ToShortDateString();
            }
            else if (search.StartDate == null && search.EndDate != null)
            {
                search.ReportDateTitle = "Observation updates through " + search.EndDate.Value.ToShortDateString();
                search.EndDate = search.EndDate.Value.Date.AddHours(23).AddMinutes(29).AddSeconds(59);
            }
            else
            {
                search.ReportDateTitle = "All Observation Dates";
            }


            //Get the Organization Types header for the column header in RDLC
            CommonService oService = new CommonService();
            string sCategoryTitle = oService.OrganizationTypesHeader();

            string[] stringSeparators = new string[] { " > " };
            string[] result;

            // Split a string delimited by another string and return all elements.
            result = sCategoryTitle.Split(stringSeparators, StringSplitOptions.None);
            Array.Reverse(result);

            if (result.Length >= 1) { AppSession.OrgRanking1Name = result[0].ToString(); } else { AppSession.OrgRanking1Name = ""; }
            if (result.Length >= 2) { AppSession.OrgRanking2Name = result[1].ToString(); } else { AppSession.OrgRanking2Name = ""; }
            if (result.Length >= 3) { AppSession.OrgRanking3Name = result[2].ToString(); } else { AppSession.OrgRanking3Name = ""; }

            search.OrgRanking1Header = AppSession.OrgRanking1Name;
            search.OrgRanking2Header = AppSession.OrgRanking2Name;
            search.OrgRanking3Header = AppSession.OrgRanking3Name;

            return search;
        }

        public ReportViewer MonthlyBreakdownRDLC(Search search, Email emailInput)
        {
            int actionTypeId = 0;
            search = GetReportValuesForSearch(search);

            string msg = string.Empty;
            string rdlcName = string.Empty;
            string dsName = string.Empty; ;

            ReportViewer reportViewer = new ReportViewer();
            reportViewer.ProcessingMode = ProcessingMode.Local;
            reportViewer.SizeToReportContent = true;


            try
            {

                rdlcName = @"Areas\Tracer\Reports\rptMonthlyBreakdownGraph.rdlc";
                dsName = "dsMonthlyBreakdownGraph";
                reportViewer.LocalReport.DisplayName = search.ReportTitle;
                reportViewer.LocalReport.ReportPath = HttpContext.Current.Request.MapPath(HttpContext.Current.Request.ApplicationPath) + rdlcName;
                var allTracersLabel = string.Empty;
                var allTracersValue = string.Empty;

                DataSet dsData = null;
                switch (search.MonthlyReportType)
                {
                    case "Question":
                        int topLeastDropdownValue = 0;
                        int.TryParse(search.TopLeastCompliantQuestions, out topLeastDropdownValue);

                        if(topLeastDropdownValue > 0)
                        {
                            allTracersLabel = "Top Least Compliant Questions Value";
                            allTracersValue = search.TopLeastCompliantQuestions;
                            search.TopLeastCompliantQuestions = (topLeastDropdownValue - 1).ToString();
                        }
                        else
                        {
                            allTracersLabel = "Selected Questions - Across All Tracers";
                            allTracersValue = search.AllTracers ? "True" : "False";
                        }

                        dsData = this.GetQuestionMonthlyBreakdownData(search);
                        search.TracerCategoryNames = string.Empty;
                        actionTypeId = (int)ActionTypeEnum.MonthlyQuestionBreakdownReport;
                        break;
                    case "Tracer":
                        dsData = this.GetTracerMonthlyBreakdownData(search);
                        allTracersLabel = "Tracers";
                        allTracersValue = search.TracerListNames;
                        actionTypeId = (int)ActionTypeEnum.MonthlyTracerBreakdownReport;
                        break;
                    default: break;
                }
                var monthslist = HelperClasses.GetMonthsList(search.StartDate, search.EndDate);

                monthslist.Remove("Total");
                var monthlyList = GetMonthlyComplianceData(dsData, monthslist);

                reportViewer.LocalReport.DataSources.Add(new ReportDataSource(dsName, monthlyList));
                

                
                var totalCompliance = GetTotalCompliance(monthlyList);
                ReportParameter p1 = new ReportParameter("ReportTitle", search.ReportTitle);
                ReportParameter p2 = new ReportParameter("SiteName", AppSession.SelectedSiteName);
                ReportParameter p3 = new ReportParameter("ProgramName", AppSession.SelectedProgramName);
                ReportParameter p4 = new ReportParameter("ReportDateTitle", search.ReportDateTitle.ToString());
                ReportParameter p5 = new ReportParameter("Copyright", "© " + DateTime.Now.Year.ToString() + WebConstants.Tracer_Copyright.ToString());
                ReportParameter p6 = new ReportParameter("CategoryNames", search.TracerCategoryNames.ToString());

                ReportParameter p7 = new ReportParameter("OrgType1Header", search.OrgRanking1Header);                 // Provide OrgType Rank 1 Name header (e.g., Department)
                ReportParameter p8 = new ReportParameter("OrgType2Header", search.OrgRanking2Header);                 // Provide OrgType Rank 2 Name column header or blank if none
                ReportParameter p9 = new ReportParameter("OrgType3Header", search.OrgRanking3Header);                 // Provide OrgType Rank 2 Name column header or blank if none
                ReportParameter p10 = new ReportParameter("OrgRank1Names", search.OrgTypeLevel1Names.ToString());                   // Filtered Rank 1 Org Names or blank string for all
                ReportParameter p11 = new ReportParameter("OrgRank2Names", search.OrgTypeLevel2Names.ToString());                   // Filtered Rank 2 Org Names or blank string for all
                ReportParameter p12 = new ReportParameter("OrgRank3Names", search.OrgTypeLevel3Names.ToString());
                ReportParameter p13 = new ReportParameter("TotalCompliance", totalCompliance.ToString());
                ReportParameter p14 = new ReportParameter("MinimalDenomValue", search.MinimalDenomValue.ToString());
                ReportParameter p15 = new ReportParameter("AllTracersLabel", allTracersLabel);
                ReportParameter p16 = new ReportParameter("AllTracersValue", allTracersValue);
                ReportParameter p17 = new ReportParameter("IsCMSProgram", AppSession.IsCMSProgram ? "1" : "0");
                ReportParameter p18 = new ReportParameter("HavingComplianceValue", search.HavingComplianceValue.ToString());
                ReportParameter p19 = new ReportParameter("HavingComplianceOperator", search.HavingComplianceOperator);

                ReportParameterCollection reportParameterCollection = new ReportParameterCollection { p1, p2, p3, p4, p5, p6, p7, p8, p9, p10, p11, p12, p13, p14, p15, p16, p17, p18, p19 };
                reportViewer.LocalReport.SetParameters(reportParameterCollection);



                if (emailInput.To != null)
                {
                    CommonService emailService = new CommonService();
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
            catch(Exception ex)
            {
                if (ex.Message.ToString() != "No Data" && ex.Message.ToString() != "Limit")
                {
                    ExceptionLog exceptionLog = new ExceptionLog
                    {
                        ExceptionText = "Reports: " + ex.Message,
                        PageName = "Monthly Question Breakdown Report",
                        MethodName = "Monthly Question Breakdown RDLC",
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

        public byte[] MonthlyBreakdownChartIE(Search search)
        {
            byte[] fileContents  = null;
            try
            {
                var reportViewer = this.MonthlyBreakdownRDLC(search, new Email());
                Warning[] warnings;
                string[] streamIds;
                string mimeType = string.Empty;
                string encoding = string.Empty;
                string extension = string.Empty;
                fileContents = reportViewer.LocalReport.Render("PDF", null, out mimeType, out encoding, out extension, out streamIds, out warnings);
            }
            catch (Exception ex)
            {
                #region Exception Handling
                if (ex.Message.ToString() != "No Data" && ex.Message.ToString() != "Limit")
                {
                    ExceptionLog exceptionLog = new ExceptionLog
                    {
                        ExceptionText = "Reports: " + ex.Message,
                        PageName = "Monthly Question Breakdown Report",
                        MethodName = "MonthlyBreakdownChartIE",
                        UserID = Convert.ToInt32(AppSession.UserID),
                        SiteId = Convert.ToInt32(AppSession.SelectedSiteId),
                        TransSQL = "",
                        HttpReferrer = null
                    };
                    _exceptionService.LogException(exceptionLog);
                }
                throw ex; 
                #endregion
            }
            return fileContents;
        }

        public byte[] TracerMonthlyBreakdownDataIE(Search search)
        {
            SearchFormat sf = new SearchFormat();
            sf.CheckInputs(search);

            byte[] fileContents = null;
            string reportDateTitle = "";

            string rdlcName = "rptMonthlyBreakdownExcel.rdlc";
            string dsName = "dsReport_MonthlyBreakdown";                            
            DataView dv = null;
            int numberofMonths = 1;
            string matchMessage = String.Empty;


            try
            {

                if (AppSession.ReportScheduleID > 0)
                    search.ReportTitle = String.Concat(search.ReportTitle, " - Report ID: ", AppSession.ReportScheduleID);

                reportDateTitle = CommonService.InitializeReportDateTitle("Observation", search.StartDate, search.EndDate);
                search.EndDate = (search.EndDate != null && search.EndDate.ToString() != "") ? search.EndDate.Value.Date.AddHours(23).AddMinutes(29).AddSeconds(59) : search.EndDate;

                DataSet ds1 = new DataSet();
                ds1 = this.GetTracerMonthlyBreakdownData(search);

                DataSet ds2 = new DataSet();
                ds2 = ConvertToMonthlyBuckets(ds1, search.StartDate, search.EndDate, (int) WebConstants.MonthlyReportType.ByTracer, ref numberofMonths);

                dv = new DataView(ds2.Tables[0]);
               
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
                reportParameters.Tables[0].Rows.Add(WebConstants.PARAM_TracerCategories, search.TracerCategoryNames.ToString(), "1");
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

                ReportParameter p1 = new ReportParameter("NumberofMonths", numberofMonths.ToString());
                ReportParameter p2 = new ReportParameter("EndDate", search.EndDate.ToString());
                ReportParameter p3 = new ReportParameter("TitleCaption", "Tracer");
                ReportParameter p4 = new ReportParameter("Message", matchMessage.ToString());
              
                ReportParameterCollection reportParameterCollection = new ReportParameterCollection { p1, p2, p3, p4};
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
               ExceptionLog exceptionLog = new ExceptionLog
                    {
                        ExceptionText = "Reports: " + ex.Message,
                        PageName = "TracerMonthlyBreakdownDataIE",
                        MethodName = "TracerMonthlyBreakdownDataIE",
                        UserID = Convert.ToInt32(AppSession.UserID),
                        SiteId = Convert.ToInt32(AppSession.SelectedSiteId),
                        TransSQL = "",
                        HttpReferrer = null
                    };
                    _exceptionService.LogException(exceptionLog);
            }

            return fileContents;
        }

        public byte[] QuestionMonthlyBreakdownDataIE(Search search)
        {
            SearchFormat sf = new SearchFormat();
            sf.CheckInputs(search);
            byte[] fileContents = null;

            string reportDateTitle = "";

            string rdlcName = "rptMonthlyBreakdownExcel.rdlc";
            string dsName = "dsReport_MonthlyBreakdown";
            DataView dv = null;
            int numberofMonths = 1;
            string matchMessage = String.Empty;
            string idColumnName = "QID";
            string complianceColumnName = "OverallCompliance";


            try
            {

                if (AppSession.ReportScheduleID > 0)
                    search.ReportTitle = String.Concat(search.ReportTitle, " - Report ID: ", AppSession.ReportScheduleID);

                reportDateTitle = CommonService.InitializeReportDateTitle("Observation", search.StartDate, search.EndDate);
                search.EndDate = (search.EndDate != null && search.EndDate.ToString() != "") ? search.EndDate.Value.Date.AddHours(23).AddMinutes(29).AddSeconds(59) : search.EndDate;

                DataSet ds1 = new DataSet();
                ds1 = this.GetQuestionMonthlyBreakdownData(search);

                int topLeastCompliantQuestions = Convert.ToInt32(search.TopLeastCompliantQuestions);
                if (topLeastCompliantQuestions > 0)
                    ds1 = CommonService.TopNData(ds1, topLeastCompliantQuestions, idColumnName, complianceColumnName, ref  matchMessage);

                DataSet ds2 = new DataSet();
                ds2 = ConvertToMonthlyBuckets(ds1, search.StartDate, search.EndDate, (int)WebConstants.MonthlyReportType.ByQuestion, ref numberofMonths);

                dv = new DataView(ds2.Tables[0]);

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
                if (AppSession.IsCMSProgram)
                    reportParameters.Tables[0].Rows.Add(WebConstants.PARAM_TracerType, "TJC", "1");
                if (search.TopLeastCompliantQuestions == "0")
                {
                    reportParameters.Tables[0].Rows.Add(WebConstants.PARAM_SelectedQuestions, "", "1");
                    reportParameters.Tables[0].Rows.Add(WebConstants.PARAM_Keyword, search.Keyword.ToString(), "1");
                }
                else
                    reportParameters.Tables[0].Rows.Add(WebConstants.PARAM_TopLeastCompliantQuestionsValue, search.TopLeastCompliantQuestions.ToString(), "1");

                reportParameters.Tables[0].Rows.Add(WebConstants.PARAM_AllQuestions, search.AllTracers ? "True" : "False", "1");
                reportParameters.Tables[0].Rows.Add(WebConstants.PARAM_TracerCategories, search.TracerCategoryNames.ToString(), "1");
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

                ReportParameter p1 = new ReportParameter("NumberofMonths", numberofMonths.ToString());
                ReportParameter p2 = new ReportParameter("EndDate", search.EndDate.ToString());
                ReportParameter p3 = new ReportParameter("TitleCaption", "Tracer");
                ReportParameter p4 = new ReportParameter("Message", matchMessage.ToString());

                ReportParameterCollection reportParameterCollection = new ReportParameterCollection { p1, p2, p3, p4};
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
                ExceptionLog exceptionLog = new ExceptionLog
                {
                    ExceptionText = "Reports: " + ex.Message,
                    PageName = "QuestionMonthlyBreakdownDataIE",
                    MethodName = "QuestionMonthlyBreakdownDataIE",
                    UserID = Convert.ToInt32(AppSession.UserID),
                    SiteId = Convert.ToInt32(AppSession.SelectedSiteId),
                    TransSQL = "",
                    HttpReferrer = null
                };
                _exceptionService.LogException(exceptionLog);
            }

            return fileContents;
        }

        private List<TracerBreakdownExcel> TransformTracerBreakdown(List<TracerByMonthTransform> tracerTransform, Search search)
        {
            List<TracerBreakdownExcel> tracerBreakdownExcel = new List<TracerBreakdownExcel>();

            //List<string> monthsList = tracerTransform.Select(item => item.MonthYear).Distinct().OrderBy(item => DateTime.Parse(item)).ToList();
            var monthsList = HelperClasses.GetMonthsList(search.StartDate, search.EndDate);

            foreach(var tracer in tracerTransform)
            {
                if (tracerBreakdownExcel.Any(item => tracer.ID == item.ID))
                {
                    var newTracer = tracerBreakdownExcel.First(item => string.Equals(tracer.Title, item.TracerName, StringComparison.CurrentCultureIgnoreCase));
                    AddMonthwiseTracer(newTracer, tracer);

                }
                else
                {
                    var newTracer = PopulateMonthwiseInfo(monthsList);
                    newTracer.TracerName = tracer.Title;
                    newTracer.ID = tracer.ID;
                    tracerBreakdownExcel.Add(AddMonthwiseTracer(newTracer, tracer));
                }
            }

            tracerBreakdownExcel = AddMonthlyTotals(tracerBreakdownExcel);
            return tracerBreakdownExcel;
        }

        private List<TracerBreakdownExcel> TransformQuestionBreakdown(List<TracerByMonthTransform> tracerTransform, Search search)
        {
            List<TracerBreakdownExcel> tracerBreakdownExcel = new List<TracerBreakdownExcel>();

            //List<string> monthsList = tracerTransform.Select(item => item.MonthYear).Distinct().OrderBy(item => DateTime.Parse(item)).ToList();
            var monthsList = HelperClasses.GetMonthsList(search.StartDate, search.EndDate);

            foreach (var tracer in tracerTransform)
            {
                if (tracerBreakdownExcel.Any(item => string.Equals(tracer.Title.Trim(), item.TracerName.Trim(), StringComparison.CurrentCultureIgnoreCase)))
                {
                    var newTracer = tracerBreakdownExcel.First(item => string.Equals(tracer.Title.Trim(), item.TracerName.Trim(), StringComparison.CurrentCultureIgnoreCase));
                    AddMonthwiseTracer(newTracer, tracer);

                }
                else
                {
                    var newTracer = PopulateMonthwiseInfo(monthsList);
                    newTracer.TracerName = tracer.Title.Trim();
                    tracerBreakdownExcel.Add(AddMonthwiseTracer(newTracer, tracer));
                }
            }

            tracerBreakdownExcel = AddMonthlyTotals(tracerBreakdownExcel);
            // Commneted out this code. Felt not required. Doing some more research.
            //int topLeastDropdownValue = 0;
            //int.TryParse(search.TopLeastCompliantQuestions, out topLeastDropdownValue);
            //if (topLeastDropdownValue != 0)
            //    tracerBreakdownExcel = tracerBreakdownExcel.Where(item => item.MonthwiseTracer.Any(item2 => item2.Month == "Total" && (item2.CompliancePercentage < 1))).ToList<TracerBreakdownExcel>();
            return tracerBreakdownExcel;
        }

        private List<TracerBreakdownExcel> AddMonthlyTotals(List<TracerBreakdownExcel> tracerBreakdownExcel)
        {
            foreach(var item in tracerBreakdownExcel)
            {
                if (item.MonthwiseTracer.Any(val => string.Equals(val.Month, "Total", StringComparison.CurrentCultureIgnoreCase)))
                {
                    var tracerMonthInfo = item.MonthwiseTracer.First(val => string.Equals(val.Month, "Total", StringComparison.CurrentCultureIgnoreCase));
                    tracerMonthInfo.Numerator = item.MonthwiseTracer.Select(val => val.Numerator).Sum();
                    tracerMonthInfo.Denominator = item.MonthwiseTracer.Select(val => val.Denominator).Sum();
                    tracerMonthInfo.ObservationsCount = item.MonthwiseTracer.Select(val => val.ObservationsCount).Sum();
                }
            }
            return tracerBreakdownExcel;
        }

        public decimal GetTotalCompliance(List<MonthlyBreakdownGraph> monthlyBreakdown)
        {
            var num = monthlyBreakdown.Select(item => item.TotalNum).Sum();
            var den = monthlyBreakdown.Select(item => item.TotalDen).Sum();

            var val = 0.0f;
            if (den != 0)
            {
                val = (float)num / (float)den;
            }

            return Math.Round((decimal)val * 100, 1);
        }

        private TracerBreakdownExcel PopulateMonthwiseInfo(List<string> months)
        {
            TracerBreakdownExcel tbe = new TracerBreakdownExcel();

            foreach(var s in months)
            {
                tbe.MonthwiseTracer.Add(new MonthwiseTracerInfo
                {
                    Month = s,
                    Denominator = 0,
                    Numerator = 0,
                    ObservationsCount = 0
                });
            }

            return tbe;
        }

        private TracerBreakdownExcel AddMonthwiseTracer(TracerBreakdownExcel newTracer, TracerByMonthTransform tracerTransform)
        {
            if (newTracer.MonthwiseTracer.Any(item => string.Equals(item.Month, tracerTransform.MonthYear, StringComparison.CurrentCultureIgnoreCase)))
            {
                var tracerMonthInfo = newTracer.MonthwiseTracer.First(item => string.Equals(item.Month, tracerTransform.MonthYear, StringComparison.CurrentCultureIgnoreCase));
                tracerMonthInfo.Numerator = tracerTransform.NUM;
                tracerMonthInfo.Denominator = tracerTransform.DEN;
                tracerMonthInfo.ObservationsCount = tracerTransform.Observations;
            }
            return newTracer;
        }

        private DataSet GetTracerMonthlyBreakdownData(Search searchParams)
        {
            DataSet ds = new DataSet();
            if (searchParams.StartDate == null)
                searchParams.StartDate = DateTime.Now.AddYears(-1);
            if (searchParams.EndDate == null)
                searchParams.EndDate = DateTime.Now;
            try
            {
                using (SqlConnection cn = new SqlConnection(this.ConnectionString))
                {
                    cn.Open();
                    SqlCommand cmd = new SqlCommand("ustReport_TracerMonthlyBreakdown", cn);
                    cmd.CommandTimeout = 900;
                    cmd.CommandType = System.Data.CommandType.StoredProcedure;

                    cmd.Parameters.AddWithValue("SiteID", AppSession.SelectedSiteId);
                    cmd.Parameters.AddWithValue("ProgramID", AppSession.SelectedProgramId);
                    cmd.Parameters.AddWithValue("TracerCategoryIDs", searchParams.TracerCategoryIDs);
                    cmd.Parameters.AddWithValue("TracerIDs", searchParams.TracerListIDs);
                    cmd.Parameters.AddWithValue("OrgIDs_Rank1_Depts", searchParams.OrgTypeLevel1IDs);
                    cmd.Parameters.AddWithValue("OrgIDs_Rank2", searchParams.OrgTypeLevel2IDs);
                    cmd.Parameters.AddWithValue("OrgIDs_Rank3", searchParams.OrgTypeLevel3IDs);
                    cmd.Parameters.AddWithValue("OrgActive", searchParams.InActiveOrgTypes ? -1 : 1);
                    cmd.Parameters.AddWithValue("ResponseStartDate", searchParams.StartDate);
                    cmd.Parameters.AddWithValue("ResponseEndDate", searchParams.EndDate);
                    cmd.Parameters.AddWithValue("MinDenominator", searchParams.IncludeMinimalDenomValue ? searchParams.MinimalDenomValue : 0);

                    //Get the SQL statement for logging
                    CreateSQLExecuted("ustReport_TracerMonthlyBreakdown", cmd);

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

            //If no data exists, throw an exception to display the no rows found message in the UI
            if (ds.Tables[0].Rows.Count == 0)
                throw (new Exception("No Data"));

            return ds;
        }

        private DataSet GetQuestionMonthlyBreakdownData(Search searchParams)
        {
            DataSet ds = new DataSet();
            int topLeastDropdownValue = 0;
            int.TryParse(searchParams.TopLeastCompliantQuestions, out topLeastDropdownValue);

            if (searchParams.StartDate == null)
                searchParams.StartDate = DateTime.Now.AddYears(-1);
            if (searchParams.EndDate == null)
                searchParams.EndDate = DateTime.Now;

            var minCompliance = 0;
            var maxCompliance = 100;

            if (searchParams.IncludeHavingComplianceValue)
                if (string.Equals(searchParams.HavingComplianceOperator, "lt"))
                    maxCompliance = searchParams.HavingComplianceValue - 1;
                else
                    minCompliance = searchParams.HavingComplianceValue + 1;


            try
            {
                using (SqlConnection cn = new SqlConnection(this.ConnectionString))
                {
                    cn.Open();
                    SqlCommand cmd;
                    
                    if (topLeastDropdownValue == 0)
                    {
                        if (searchParams.AllTracers)
                            searchParams.TracerListIDs = string.Empty;
                        cmd = new SqlCommand("ustReport_QuestionMonthlyBreakdown", cn);
                        cmd.Parameters.AddWithValue("TracerQuestionIDs", searchParams.TracerQuestionIDs);

                    }
                    else
                    {
                        cmd = new SqlCommand("ustReport_QuestionMonthlyBreakdown_ByTop", cn);
                        cmd.Parameters.AddWithValue("TopN", topLeastDropdownValue + 1);

                    }

                    cmd.CommandTimeout = 900;
                    cmd.CommandType = System.Data.CommandType.StoredProcedure;


                    cmd.Parameters.AddWithValue("TracerIDs", searchParams.TracerListIDs);
                    cmd.Parameters.AddWithValue("All", searchParams.AllTracers ? 1 : 0);

                    cmd.Parameters.AddWithValue("SiteID", AppSession.SelectedSiteId);
                    cmd.Parameters.AddWithValue("ProgramID", AppSession.SelectedProgramId);
                    cmd.Parameters.AddWithValue("CycleID", AppSession.CycleID);

                    cmd.Parameters.AddWithValue("OrgIDs_Rank1_Depts", searchParams.OrgTypeLevel1IDs);
                    cmd.Parameters.AddWithValue("OrgIDs_Rank2", searchParams.OrgTypeLevel2IDs);
                    cmd.Parameters.AddWithValue("OrgIDs_Rank3", searchParams.OrgTypeLevel3IDs);
                    cmd.Parameters.AddWithValue("OrgActive", searchParams.InActiveOrgTypes ? -1 : 1);
                    cmd.Parameters.AddWithValue("StartDate", searchParams.StartDate);
                    cmd.Parameters.AddWithValue("EndDate", searchParams.EndDate);
                    cmd.Parameters.AddWithValue("MinDenominator", searchParams.IncludeMinimalDenomValue ? searchParams.MinimalDenomValue : 0);
                    cmd.Parameters.AddWithValue("MinCompliance", minCompliance);
                    cmd.Parameters.AddWithValue("MaxCompliance", maxCompliance);

                    //Get the SQL statement for logging
                    CreateSQLExecuted("ustReport_QuestionMonthlyBreakdown", cmd);

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

            //If no data exists, throw an exception to display the no rows found message in the UI
            if (ds.Tables[0].Rows.Count == 0)
                throw (new Exception("No Data"));

            return ds;
        }

        public static List<MonthlyBreakdownGraph> GetMonthlyComplianceData(DataSet dsInput, List<string> months)
        {
            string currentMonth = string.Empty;
            List<MonthlyBreakdownGraph> graphData = new List<MonthlyBreakdownGraph>();

            foreach (var item in months)
                graphData.Add(new MonthlyBreakdownGraph { Month = item });

            try
            {
                DataView dvInput = new DataView(dsInput.Tables[0]);
                if (dvInput != null)
                {
                    foreach (DataRowView dvRow in dvInput)
                    {
                        currentMonth = dvRow["MonthYear"].ToString();
                        int num = Convert.ToInt32(dvRow["NUM"]);
                        int den = Convert.ToInt32(dvRow["DEN"]);
                        int observation = Convert.ToInt32(dvRow["Observations"]);

                        var graphMonth = graphData.FirstOrDefault(item => item.Month == currentMonth);
                        if (graphMonth != null)
                        {
                            graphMonth.TotalDen += den;
                            graphMonth.TotalNum += num;
                            graphMonth.Observations += observation;
                        }
                    }
                }
            }
            catch(Exception ex)
            {
                throw ex;
            }
            return graphData;
        }

        public static DataSet ConvertToMonthlyBuckets(DataSet dsInput, DateTime? startdate, DateTime? enddate, int monthlyReportType, ref int numberMonths)
        {


            DataSet ds = new DataSet();
            int id = 0;
            int idNext = 0;
            int status = 0;
            MonthlyBreakDownData buckets = null;

            try
            {
                if (startdate != null && enddate != null)
                {
                    DateTime dateBegin = Convert.ToDateTime(startdate);
                    DateTime dateEnd = Convert.ToDateTime(enddate);

                    numberMonths = ((dateEnd.Year - dateBegin.Year) * 12) + dateEnd.Month - dateBegin.Month + 1;

                    ds.ReadXml(HttpContext.Current.Server.MapPath("~/App_Data/dsReport_MonthlyBreakDown.xsd"));

                    DataView dvInput = new DataView(dsInput.Tables[0]);
                    if (dvInput != null)
                    {
                        foreach (DataRowView dvRow in dvInput)
                        {
                            if (monthlyReportType == (int)WebConstants.MonthlyReportType.ByTracer)
                                idNext = Convert.ToInt32(dvRow["ID"]);
                            else
                                idNext = Convert.ToInt32(dvRow["QID"]);

                            string title = dvRow["Title"].ToString();
                            int observations = Convert.ToInt32(dvRow["Observations"]);
                            string monthyear = dvRow["MonthYear"].ToString();
                            int num = Convert.ToInt32(dvRow["NUM"]);
                            int den = Convert.ToInt32(dvRow["DEN"]);


                            if (idNext != id)
                            {
                                if (id != 0)
                                {
                                    status = AddRowToDataSet(buckets,  ref ds);
                                }
                                // Allocate a new row since we have a new ID
                                buckets = new MonthlyBreakDownData(idNext, title);
                                id = idNext;        // This is now our active ID

                            }
                            if (monthyear != "Mon-YYYY" && monthyear != "Mmm-YYYY")
                            {
                                try
                                {
                                    DateTime monthyeardate = Convert.ToDateTime(monthyear);
                                    int bucketNumber = ((dateEnd.Year - monthyeardate.Year) * 12) + dateEnd.Month - monthyeardate.Month + 1;
                                    status = StoreMonthlyBucket(bucketNumber, observations, num, den, ref buckets);

                                    status = 1;

                                }
                                catch
                                {
                                    status = 0;
                                }

                            }
                        }
                        status = AddRowToDataSet(buckets, ref ds);
                    }
                }
            }
            catch (Exception)
            {
            }
            return ds;

        }

        static int AddRowToDataSet(MonthlyBreakDownData buckets, ref DataSet ds)
        {
            int status = 0;

            try
            {
                ds.Tables[0].Rows.Add();
                int iptr = ds.Tables[0].Rows.Count - 1;

                ds.Tables[0].Rows[iptr]["ID"] = buckets.ID;
                ds.Tables[0].Rows[iptr]["Title"] = buckets.Title;
                ds.Tables[0].Rows[iptr]["TotalNum"] = buckets.TotalNum;
                ds.Tables[0].Rows[iptr]["TotalObserv"] = buckets.TotalObserv;
                ds.Tables[0].Rows[iptr]["TotalNum"] = buckets.TotalNum;
                ds.Tables[0].Rows[iptr]["TotalDen"] = buckets.TotalDen;
                ds.Tables[0].Rows[iptr]["TotalCompl"] = buckets.TotalCompl;
                ds.Tables[0].Rows[iptr]["M01Observ"] = buckets.M01Observ;
                ds.Tables[0].Rows[iptr]["M01Num"] = buckets.M01Num;
                ds.Tables[0].Rows[iptr]["M01Den"] = buckets.M01Den;
                ds.Tables[0].Rows[iptr]["M01Compl"] = buckets.M01Compl;
                ds.Tables[0].Rows[iptr]["M02Observ"] = buckets.M02Observ;
                ds.Tables[0].Rows[iptr]["M02Num"] = buckets.M02Num;
                ds.Tables[0].Rows[iptr]["M02Den"] = buckets.M02Den;
                ds.Tables[0].Rows[iptr]["M02Compl"] = buckets.M02Compl;
                ds.Tables[0].Rows[iptr]["M03Observ"] = buckets.M03Observ;
                ds.Tables[0].Rows[iptr]["M03Num"] = buckets.M03Num;
                ds.Tables[0].Rows[iptr]["M03Den"] = buckets.M03Den;
                ds.Tables[0].Rows[iptr]["M03Compl"] = buckets.M03Compl;
                ds.Tables[0].Rows[iptr]["M04Observ"] = buckets.M04Observ;
                ds.Tables[0].Rows[iptr]["M04Num"] = buckets.M04Num;
                ds.Tables[0].Rows[iptr]["M04Den"] = buckets.M04Den;
                ds.Tables[0].Rows[iptr]["M04Compl"] = buckets.M04Compl;
                ds.Tables[0].Rows[iptr]["M05Observ"] = buckets.M05Observ;
                ds.Tables[0].Rows[iptr]["M05Num"] = buckets.M05Num;
                ds.Tables[0].Rows[iptr]["M05Den"] = buckets.M05Den;
                ds.Tables[0].Rows[iptr]["M05Compl"] = buckets.M05Compl;
                ds.Tables[0].Rows[iptr]["M06Observ"] = buckets.M06Observ;
                ds.Tables[0].Rows[iptr]["M06Num"] = buckets.M06Num;
                ds.Tables[0].Rows[iptr]["M06Den"] = buckets.M06Den;
                ds.Tables[0].Rows[iptr]["M06Compl"] = buckets.M06Compl;
                ds.Tables[0].Rows[iptr]["M07Observ"] = buckets.M07Observ;
                ds.Tables[0].Rows[iptr]["M07Num"] = buckets.M07Num;
                ds.Tables[0].Rows[iptr]["M07Den"] = buckets.M07Den;
                ds.Tables[0].Rows[iptr]["M07Compl"] = buckets.M07Compl;
                ds.Tables[0].Rows[iptr]["M08Observ"] = buckets.M08Observ;
                ds.Tables[0].Rows[iptr]["M08Num"] = buckets.M08Num;
                ds.Tables[0].Rows[iptr]["M08Den"] = buckets.M08Den;
                ds.Tables[0].Rows[iptr]["M08Compl"] = buckets.M08Compl;
                ds.Tables[0].Rows[iptr]["M09Observ"] = buckets.M09Observ;
                ds.Tables[0].Rows[iptr]["M09Num"] = buckets.M09Num;
                ds.Tables[0].Rows[iptr]["M09Den"] = buckets.M09Den;
                ds.Tables[0].Rows[iptr]["M09Compl"] = buckets.M09Compl;
                ds.Tables[0].Rows[iptr]["M10Observ"] = buckets.M10Observ;
                ds.Tables[0].Rows[iptr]["M10Num"] = buckets.M10Num;
                ds.Tables[0].Rows[iptr]["M10Den"] = buckets.M10Den;
                ds.Tables[0].Rows[iptr]["M10Compl"] = buckets.M10Compl;
                ds.Tables[0].Rows[iptr]["M11Observ"] = buckets.M11Observ;
                ds.Tables[0].Rows[iptr]["M11Num"] = buckets.M11Num;
                ds.Tables[0].Rows[iptr]["M11Den"] = buckets.M11Den;
                ds.Tables[0].Rows[iptr]["M11Compl"] = buckets.M11Compl;
                ds.Tables[0].Rows[iptr]["M12Observ"] = buckets.M12Observ;
                ds.Tables[0].Rows[iptr]["M12Num"] = buckets.M12Num;
                ds.Tables[0].Rows[iptr]["M12Den"] = buckets.M12Den;
                ds.Tables[0].Rows[iptr]["M12Compl"] = buckets.M12Compl;
                ds.Tables[0].Rows[iptr]["M13Observ"] = buckets.M13Observ;
                ds.Tables[0].Rows[iptr]["M13Num"] = buckets.M13Num;
                ds.Tables[0].Rows[iptr]["M13Den"] = buckets.M13Den;
                ds.Tables[0].Rows[iptr]["M13Compl"] = buckets.M13Compl;


                status = 1;
            }
            catch (Exception)
            {
                status = 0;
            }
            return status;
        }

        static int StoreMonthlyBucket(int bucketNumber, int observations, int num, int den, ref MonthlyBreakDownData buckets)
        {
            int status = 0;

            try
            {
                switch (bucketNumber)
                {
                    case 1:
                        {
                            buckets.M01Observ = observations;
                            buckets.M01Num = num;
                            buckets.M01Den = den;
                            if (den > 0)
                                buckets.M01Compl = (decimal)(100 * num) / (decimal)den;
                            status = 1;
                            break;
                        }
                    case 2:
                        {
                            buckets.M02Observ = observations;
                            buckets.M02Num = num;
                            buckets.M02Den = den;
                            if (den > 0)
                                buckets.M02Compl = (decimal)(100 * num) / (decimal)den;
                            status = 1;
                            break;
                        }

                    case 3:
                        {
                            buckets.M03Observ = observations;
                            buckets.M03Num = num;
                            buckets.M03Den = den;
                            if (den > 0)
                                buckets.M03Compl = (decimal)(100 * num) / (decimal)den;
                            status = 1;
                            break;
                        }

                    case 4:
                        {
                            buckets.M04Observ = observations;
                            buckets.M04Num = num;
                            buckets.M04Den = den;
                            if (den > 0)
                                buckets.M04Compl = (decimal)(100 * num) / (decimal)den;
                            status = 1;
                            break;
                        }
                    case 5:
                        {
                            buckets.M05Observ = observations;
                            buckets.M05Num = num;
                            buckets.M05Den = den;
                            if (den > 0)
                                buckets.M05Compl = (decimal)(100 * num) / (decimal)den;
                            status = 1;
                            break;
                        }

                    case 6:
                        {
                            buckets.M06Observ = observations;
                            buckets.M06Num = num;
                            buckets.M06Den = den;
                            if (den > 0)
                                buckets.M06Compl = (decimal)(100 * num) / (decimal)den;
                            status = 1;
                            break;
                        }
                    case 7:
                        {
                            buckets.M07Observ = observations;
                            buckets.M07Num = num;
                            buckets.M07Den = den;
                            if (den > 0)
                                buckets.M07Compl = (decimal)(100 * num) / (decimal)den;
                            status = 1;
                            break;
                        }
                    case 8:
                        {
                            buckets.M08Observ = observations;
                            buckets.M08Num = num;
                            buckets.M08Den = den;
                            if (den > 0)
                                buckets.M08Compl = (decimal)(100 * num) / (decimal)den;
                            status = 1;
                            break;
                        }
                    case 9:
                        {
                            buckets.M09Observ = observations;
                            buckets.M09Num = num;
                            buckets.M09Den = den;
                            if (den > 0)
                                buckets.M09Compl = (decimal)(100 * num) / (decimal)den;
                            status = 1;
                            break;
                        }
                    case 10:
                        {
                            buckets.M10Observ = observations;
                            buckets.M10Num = num;
                            buckets.M10Den = den;
                            if (den > 0)
                                buckets.M10Compl = (decimal)(100 * num) / (decimal)den;
                            status = 1;
                            break;
                        }
                    case 11:
                        {
                            buckets.M11Observ = observations;
                            buckets.M11Num = num;
                            buckets.M11Den = den;
                            if (den > 0)
                                buckets.M11Compl = (decimal)(100 * num) / (decimal)den;
                            status = 1;
                            break;
                        }
                    case 12:
                        {
                            buckets.M12Observ = observations;
                            buckets.M12Num = num;
                            buckets.M12Den = den;
                            if (den > 0)
                                buckets.M12Compl = (decimal)(100 * num) / (decimal)den;
                            status = 1;
                            break;
                        }
                    case 13:
                        {
                            buckets.M13Observ = observations;
                            buckets.M13Num = num;
                            buckets.M13Den = den;
                            if (den > 0)
                                buckets.M13Compl = (decimal)(100 * num) / (decimal)den;
                            status = 1;
                            break;
                        }
                    default:
                        {
                            status = 0;
                            break;
                        }
                }
                if (status == 1)
                {
                    // Add to sum
                    buckets.TotalObserv = buckets.TotalObserv + observations;
                    buckets.TotalNum = buckets.TotalNum + num;
                    buckets.TotalDen = buckets.TotalDen + den;
                    if (buckets.TotalDen > 0)
                        buckets.TotalCompl = (decimal)(buckets.TotalNum * 100) / (decimal)buckets.TotalDen;
                }


                status = 1;
            }
            catch (Exception)
            {
                status = 0;
            }
            return status;
        }
    }
}