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
    public class DepartmentComparativeAnalysis : BaseService
    {
        ExceptionService _exceptionService = new ExceptionService();
        public DataSourceResult _departmentcomparativeanalysisDataExcel([DataSourceRequest]DataSourceRequest request, Search search)
        {
            DataSourceResult result = new DataSourceResult();
            try
            {
                SearchFormat searchoutput = new SearchFormat();
                searchoutput.CheckInputs(search);

                List<DepartmentComparativeAnalysisData> DepartmentComparativeAnalysis = new List<DepartmentComparativeAnalysisData>();
                DataTable dt = new DataTable();
                //    var DCAService = new DepartmentComparativeAnalysis();
                dt = ReportDepartmentComparativeAnalysisData(search).Tables[0];
                //convert datatable to list       
                DepartmentComparativeAnalysis = dt.ToList<DepartmentComparativeAnalysisData>();


                result = DepartmentComparativeAnalysis.ToDataSourceResult(request, dca => new DepartmentComparativeAnalysisData
                {
                    //SiteID = dca.SiteID,
                    OrgName_Rank3 = dca.OrgName_Rank3,
                    OrgName_Rank2 = dca.OrgName_Rank2,
                    OrgName_Rank1_Dept = dca.OrgName_Rank1_Dept,
                    NumeratorTotal = dca.NumeratorTotal,
                    DenominatorTotal = dca.DenominatorTotal,
                    TotalNotApplicableCount = dca.TotalNotApplicableCount,
                    TracerResponseCount = dca.TracerResponseCount,
                    TracerCount = dca.TracerCount,
                    NDCompliancePercent = dca.NDCompliancePercent
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
                        PageName = "DepartmentComparativeAnalysis",
                        MethodName = "_departmentcomparativeanalysisDataExcel",
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
        public DataSourceResult _departmentcomparativeanalysisOppExcel([DataSourceRequest]DataSourceRequest request, Search search)
        {
            DataSourceResult result = new DataSourceResult();
            try
            {
                SearchFormat searchoutput = new SearchFormat();
                searchoutput.CheckInputs(search);

                List<DepartmentComparativeAnalysisOPP> DepartmentComparativeAnalysis = new List<DepartmentComparativeAnalysisOPP>();
                DataTable dt = new DataTable();

                dt = ReportDepartmentComparativeAnalysisOpportunities(search).Tables[0];

                //convert datatable to list       
                DepartmentComparativeAnalysis = dt.ToList<DepartmentComparativeAnalysisOPP>();


                result = DepartmentComparativeAnalysis.ToDataSourceResult(request, dca => new DepartmentComparativeAnalysisOPP
                {

                    OrgName_Rank3 = dca.OrgName_Rank3,
                    OrgName_Rank2 = dca.OrgName_Rank2,
                    OrgName_Rank1_Dept = dca.OrgName_Rank1_Dept,
                    QuestionText = dca.QuestionText.ReplaceNewline(),
                    StandardEPs = dca.StandardEPs.ReplaceNewline(),
                    TracerCustomName = dca.TracerCustomName,
                    TracerResponseTitle = dca.TracerResponseTitle,
                    ObservationDate = dca.ObservationDate,
                    Numerator = dca.Numerator,
                    Denominator = dca.Denominator,
                    CompliancePercent = dca.CompliancePercent,
                    TracerQuestionNote = dca.TracerQuestionNote.ReplaceNewline(),


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
                        PageName = "DepartmentComparativeAnalysis",
                        MethodName = "_departmentcomparativeanalysisOppExcel",
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
        public ReportViewer _departmentcomparativeanalysisRDLC(Search search, Email emailInput)
        {

            SearchFormat searchoutput = new SearchFormat();
            searchoutput.CheckInputs(search);

            if (AppSession.ReportScheduleID > 0)
                search.ReportTitle = String.Concat(search.ReportTitle, " - Report ID: ", AppSession.ReportScheduleID);

            if (search.StartDate != null && search.EndDate != null)
            {
                search.ReportDateTitle = "Tracer updates for " + search.StartDate.Value.ToShortDateString() + " - " + search.EndDate.Value.ToShortDateString();
            }
            else if (search.StartDate != null && search.EndDate == null)
            {
                search.ReportDateTitle = "Tracer  updates since " + search.StartDate.Value.ToShortDateString();
            }
            else if (search.StartDate == null && search.EndDate != null)
            {
                search.ReportDateTitle = "Tracers updates through " + search.EndDate.Value.ToShortDateString();
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
                reportViewer.LocalReport.ReportPath = HttpContext.Current.Request.MapPath(HttpContext.Current.Request.ApplicationPath) + @"Areas\Tracer\Reports\rptReportDepartmentComparativeAnalysis.rdlc";
                reportViewer.LocalReport.DataSources.Add(new ReportDataSource("dsReport_DepartmentComparativeAnalysisData", ReportDepartmentComparativeAnalysisData(search).Tables[0]));
                if (search.IncludeNonCompliantOpportunities)
                    // We wish to get Opportunities her eso read the data set.
                    reportViewer.LocalReport.DataSources.Add(new ReportDataSource("dsReport_DepartmentComparativeAnalysisOpportunities", ReportDepartmentComparativeAnalysisOpportunities(search, false).Tables[0]));
                else
                {
                    // We pass a blank dataset if NonCompliant Opportunities are not required for this report
                    DataSet ds = new DataSet();
                    ds.ReadXml(HttpContext.Current.Server.MapPath("~/App_Data/dsReport_DepartmentComparativeAnalysisOpportunities.xsd"));
                    reportViewer.LocalReport.DataSources.Add(new ReportDataSource("dsReport_DepartmentComparativeAnalysisOpportunities", ds.Tables[0]));
                }

                ReportParameter p1 = new ReportParameter("ReportDisplayType", ((int)Enum.Parse(typeof(ReportType), search.ReportType)).ToString());
                ReportParameter p2 = new ReportParameter("ProgramName", AppSession.SelectedProgramName);
                ReportParameter p3 = new ReportParameter("SiteName", AppSession.SelectedSiteName);
                ReportParameter p4 = new ReportParameter("OrgType1Header", AppSession.OrgRanking1Name.ToString());                // Provide OrgType Rank 1 Name header (e.g., Department)
                ReportParameter p5 = new ReportParameter("OrgType2Header", AppSession.OrgRanking2Name.ToString());                          //  Provide OrgType Rank 2 Name column header or blank if none
                ReportParameter p6 = new ReportParameter("OrgType3Header", AppSession.OrgRanking3Name.ToString());                          //   Provide OrgType Rank 2 Name column header or blank if none
                ReportParameter p7 = new ReportParameter("OrgRank1Names", search.OrgTypeLevel1Names.ToString());    // Filtered Rank 1 Org Names or blank string for all
                ReportParameter p8 = new ReportParameter("OrgRank2Names", search.OrgTypeLevel2Names.ToString());    // Filtered Rank 2 Org Names or blank string for all
                ReportParameter p9 = new ReportParameter("OrgRank3Names", search.OrgTypeLevel3Names.ToString());    // Filtered Rank 3 Org Names or blank string for all
                ReportParameter p10 = new ReportParameter("TracerCategories", search.TracerCategoryNames.ToString());       // Filterd Tracercategories or blank for all
                ReportParameter p11 = new ReportParameter("TracerName", search.TracerListNames.ToString());                 // Filtered Tracer Names or blank for all
                ReportParameter p12 = new ReportParameter("ReportTitle", search.ReportTitle);                     // Report title from DB
                ReportParameter p13 = new ReportParameter("ReportDateTitle", search.ReportDateTitle.ToString());                 // Computed start/end date string for date range title
                ReportParameter p14 = new ReportParameter("Copyright", "© " + DateTime.Now.Year.ToString() + WebConstants.Tracer_Copyright.ToString());
                ReportParameter p15 = new ReportParameter("IncludeCompliancePercent", search.IncludeNonCompliantOpportunities ? "1" : "0");
                ReportParameter p16 = new ReportParameter("CompliancePercent", search.OpportunitiesValue.ToString());
                ReportParameter p17 = new ReportParameter("IncludeDeptNoCompObs", search.IncludeDeptNoCompObs ? "1" : "0");
                ReportParameter p18 = new ReportParameter("TracerTypeID", search.TracerTypeID < 1 ? "1" : search.TracerTypeID.ToString());
                ReportParameter p19 = new ReportParameter("IsCMSEnabled", AppSession.IsCMSProgram ? "1" : "0");


                ReportParameterCollection reportParameterCollection = new ReportParameterCollection { p1, p2, p3, p4, p5, p6, p7, p8, p9, p10, p11, p12, p13, p14, p15, p16, p17, p18, p19 };
                reportViewer.LocalReport.SetParameters(reportParameterCollection);
                if (emailInput.To != null)
                {
                    CommonService emailService = new CommonService();
                    int actionTypeId = (int)ActionTypeEnum.DepartmentComparativeAnalysisReport;
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
                        PageName = "DepartmentComparativeAnalysis",
                        MethodName = "_departmentcomparativeanalysisRDLC",
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
        public byte[] DepartmentComparativeAnalysisDataExcelIE8(Search search)
        {
            SearchFormat sf = new SearchFormat();
            sf.CheckInputs(search);
            search.EndDate = (search.EndDate != null && search.EndDate.ToString() != "") ? search.EndDate.Value.Date.AddHours(23).AddMinutes(29).AddSeconds(59) : search.EndDate;
            byte[] fileContents = null;

            try
            {
                var fulldt = ReportDepartmentComparativeAnalysisData(search).Tables[0];
                DataView dv = new DataView(fulldt);

                if (AppSession.ReportScheduleID > 0)
                    search.ReportTitle = String.Concat(search.ReportTitle, " - Report ID: ", AppSession.ReportScheduleID);

                search.ReportDateTitle = CommonService.InitializeReportDateTitle("Tracer", search.StartDate, search.EndDate);


                // Setup ReportViewer 
                ReportViewer reportViewer = new ReportViewer();
                reportViewer.ProcessingMode = ProcessingMode.Local;
                reportViewer.SizeToReportContent = true;
                reportViewer.LocalReport.DisplayName = search.ReportTitle;

                // Setup Data sources for report
                reportViewer.LocalReport.DataSources.Clear();
                reportViewer.LocalReport.ReportPath = HttpContext.Current.Request.MapPath(HttpContext.Current.Request.ApplicationPath) + @"Areas\Tracer\Reports\rptReportDepartmentComparativeDataExcel.rdlc";
                reportViewer.LocalReport.DataSources.Add(new ReportDataSource("dsReport_DepartmentComparativeAnalysisData", dv));

                // Setup Parameter DataSet
                DataSet reportParameters = CommonService.ReportParameters();
                // Excel view here
                // Add Parameter Data Set
                reportParameters.Tables[0].Rows.Add(WebConstants.PARAM_SiteName, AppSession.SelectedSiteName, "1");
                reportParameters.Tables[0].Rows.Add(WebConstants.PARAM_ProgramName, AppSession.SelectedProgramName, "1");
                reportParameters.Tables[0].Rows.Add(WebConstants.PARAM_TracerCategories, search.TracerCategoryNames.ToString(), "1");
                reportParameters.Tables[0].Rows.Add(WebConstants.PARAM_TracerName, search.TracerListNames.ToString(), "1");
                reportParameters.Tables[0].Rows.Add(WebConstants.PARAM_StartDate, search.StartDate == null ? "" : Convert.ToDateTime(search.StartDate).ToShortDateString(), "1");
                reportParameters.Tables[0].Rows.Add(WebConstants.PARAM_EndDate, search.EndDate == null ? "" : Convert.ToDateTime(search.EndDate).ToShortDateString(), "1");
                reportParameters.Tables[0].Rows.Add(WebConstants.PARAM_IncludeCompliancePercent, search.IncludeNonCompliantOpportunities ? "True" : "False", "1");
                reportParameters.Tables[0].Rows.Add(WebConstants.PARAM_CompliancePercent, search.OpportunitiesValue.ToString(), "1");
                reportParameters.Tables[0].Rows.Add(WebConstants.PARAM_IncludeDeptNoCompObs, search.IncludeDeptNoCompObs ? "True" : "False", "1");
                reportParameters.Tables[0].Rows.Add(WebConstants.PARAM_TracerType, search.TracerTypeID == 1 ? "TJC" : "CMS", "1");
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

                ReportParameter p1 = new ReportParameter("ReportDisplayType", ((int)Enum.Parse(typeof(ReportType), search.ReportType)).ToString());
                ReportParameter p2 = new ReportParameter("ProgramName", AppSession.SelectedProgramName);
                ReportParameter p3 = new ReportParameter("SiteName", AppSession.SelectedSiteName);
                ReportParameter p4 = new ReportParameter("OrgType1Header", AppSession.OrgRanking1Name.ToString());                // Provide OrgType Rank 1 Name header (e.g., Department)
                ReportParameter p5 = new ReportParameter("OrgType2Header", AppSession.OrgRanking2Name.ToString());                          //  Provide OrgType Rank 2 Name column header or blank if none
                ReportParameter p6 = new ReportParameter("OrgType3Header", AppSession.OrgRanking3Name.ToString());                          //   Provide OrgType Rank 2 Name column header or blank if none
                ReportParameter p7 = new ReportParameter("OrgRank1Names", search.OrgTypeLevel1Names.ToString());    // Filtered Rank 1 Org Names or blank string for all
                ReportParameter p8 = new ReportParameter("OrgRank2Names", search.OrgTypeLevel2Names.ToString());    // Filtered Rank 2 Org Names or blank string for all
                ReportParameter p9 = new ReportParameter("OrgRank3Names", search.OrgTypeLevel3Names.ToString());    // Filtered Rank 3 Org Names or blank string for all
                ReportParameter p10 = new ReportParameter("TracerCategories", search.TracerCategoryNames.ToString());       // Filterd Tracercategories or blank for all
                ReportParameter p11 = new ReportParameter("TracerName", search.TracerListNames.ToString());                 // Filtered Tracer Names or blank for all
                ReportParameter p12 = new ReportParameter("ReportTitle", search.ReportTitle);                     // Report title from DB
                ReportParameter p13 = new ReportParameter("ReportDateTitle", search.ReportDateTitle.ToString());                 // Computed start/end date string for date range title
                ReportParameter p14 = new ReportParameter("Copyright", "© " + DateTime.Now.Year.ToString() + WebConstants.Tracer_Copyright.ToString());
                ReportParameter p15 = new ReportParameter("IncludeCompliancePercent", search.IncludeNonCompliantOpportunities ? "1" : "0");
                ReportParameter p16 = new ReportParameter("CompliancePercent", search.OpportunitiesValue.ToString());
                ReportParameter p17 = new ReportParameter("IncludeDeptNoCompObs", search.IncludeDeptNoCompObs ? "1" : "0");
                ReportParameter p18 = new ReportParameter("TracerTypeID", search.TracerTypeID < 1 ? "1" : search.TracerTypeID.ToString());
                ReportParameter p19 = new ReportParameter("IsCMSEnabled", AppSession.IsCMSProgram ? "1" : "0");

                ReportParameterCollection reportParameterCollection = new ReportParameterCollection { p1, p2, p3, p4, p5, p6, p7, p8, p9, p10, p11, p12, p13, p14, p15, p16, p17, p18, p19 };
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

        public byte[] DepartmentComparativeAnalysisOppExcelIE8(Search search)
        {
            SearchFormat sf = new SearchFormat();
            sf.CheckInputs(search);
            byte[] fileContents = null;

            try
            {
                var fulldt = ReportDepartmentComparativeAnalysisOpportunities(search, false).Tables[0];
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




                // Setup Data sources for report
                reportViewer.LocalReport.DataSources.Clear();
                reportViewer.LocalReport.ReportPath = HttpContext.Current.Request.MapPath(HttpContext.Current.Request.ApplicationPath) + @"Areas\Tracer\Reports\rptReportDepartmentComparativeDetailsExcel.rdlc";
                reportViewer.LocalReport.DataSources.Add(new ReportDataSource("dsReport_DepartmentComparativeAnalysisOpportunities", dv));

                // Setup Parameter DataSet
                DataSet reportParameters = CommonService.ReportParameters();
                // Excel view here
                // Add Parameter Data Set
                reportParameters.Tables[0].Rows.Add(WebConstants.PARAM_SiteName, AppSession.SelectedSiteName, "1");
                reportParameters.Tables[0].Rows.Add(WebConstants.PARAM_ProgramName, AppSession.SelectedProgramName, "1");
                reportParameters.Tables[0].Rows.Add(WebConstants.PARAM_TracerCategories, search.TracerCategoryNames.ToString(), "1");
                reportParameters.Tables[0].Rows.Add(WebConstants.PARAM_TracerName, search.TracerListNames.ToString(), "1");
                reportParameters.Tables[0].Rows.Add(WebConstants.PARAM_StartDate, search.StartDate == null ? "" : Convert.ToDateTime(search.StartDate).ToShortDateString(), "1");
                reportParameters.Tables[0].Rows.Add(WebConstants.PARAM_EndDate, search.EndDate == null ? "" : Convert.ToDateTime(search.EndDate).ToShortDateString(), "1");
                reportParameters.Tables[0].Rows.Add(WebConstants.PARAM_IncludeCompliancePercent, search.IncludeNonCompliantOpportunities ? "True" : "False", "1");
                reportParameters.Tables[0].Rows.Add(WebConstants.PARAM_CompliancePercent, search.OpportunitiesValue.ToString(), "1");
                reportParameters.Tables[0].Rows.Add(WebConstants.PARAM_IncludeDeptNoCompObs, search.IncludeDeptNoCompObs ? "True" : "False", "1");
                reportParameters.Tables[0].Rows.Add(WebConstants.PARAM_TracerType, search.TracerTypeID == 1 ? "TJC" : "CMS", "1");
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

                ReportParameter p1 = new ReportParameter("ReportDisplayType", ((int)Enum.Parse(typeof(ReportType), search.ReportType)).ToString());
                ReportParameter p2 = new ReportParameter("ProgramName", AppSession.SelectedProgramName);
                ReportParameter p3 = new ReportParameter("SiteName", AppSession.SelectedSiteName);
                ReportParameter p4 = new ReportParameter("OrgType1Header", AppSession.OrgRanking1Name.ToString());                // Provide OrgType Rank 1 Name header (e.g., Department)
                ReportParameter p5 = new ReportParameter("OrgType2Header", AppSession.OrgRanking2Name.ToString());                          //  Provide OrgType Rank 2 Name column header or blank if none
                ReportParameter p6 = new ReportParameter("OrgType3Header", AppSession.OrgRanking3Name.ToString());                          //   Provide OrgType Rank 2 Name column header or blank if none
                ReportParameter p7 = new ReportParameter("OrgRank1Names", search.OrgTypeLevel1Names.ToString());    // Filtered Rank 1 Org Names or blank string for all
                ReportParameter p8 = new ReportParameter("OrgRank2Names", search.OrgTypeLevel2Names.ToString());    // Filtered Rank 2 Org Names or blank string for all
                ReportParameter p9 = new ReportParameter("OrgRank3Names", search.OrgTypeLevel3Names.ToString());    // Filtered Rank 3 Org Names or blank string for all
                ReportParameter p10 = new ReportParameter("TracerCategories", search.TracerCategoryNames.ToString());       // Filterd Tracercategories or blank for all
                ReportParameter p11 = new ReportParameter("TracerName", search.TracerListNames.ToString());                 // Filtered Tracer Names or blank for all
                ReportParameter p12 = new ReportParameter("ReportTitle", search.ReportTitle);                     // Report title from DB
                ReportParameter p13 = new ReportParameter("ReportDateTitle", search.ReportDateTitle.ToString());                 // Computed start/end date string for date range title
                ReportParameter p14 = new ReportParameter("Copyright", "© " + DateTime.Now.Year.ToString() + WebConstants.Tracer_Copyright.ToString());
                ReportParameter p15 = new ReportParameter("IncludeCompliancePercent", search.IncludeNonCompliantOpportunities ? "1" : "0");
                ReportParameter p16 = new ReportParameter("CompliancePercent", search.OpportunitiesValue.ToString());
                ReportParameter p17 = new ReportParameter("IncludeDeptNoCompObs", search.IncludeDeptNoCompObs ? "1" : "0");
                ReportParameter p18 = new ReportParameter("TracerTypeID", search.TracerTypeID < 1 ? "1" : search.TracerTypeID.ToString());
                ReportParameter p19 = new ReportParameter("IsCMSEnabled", AppSession.IsCMSProgram ? "1" : "0");

                ReportParameterCollection reportParameterCollection = new ReportParameterCollection { p1, p2, p3, p4, p5, p6, p7, p8, p9, p10, p11, p12, p13, p14, p15, p16, p17, p18, p19 };
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
        private DataSet ReportDepartmentComparativeAnalysisData(Search search)
        {

            DataSet ds = new DataSet();

            try
            {


                using (SqlConnection cn = new SqlConnection(this.ConnectionString))
                {
                    cn.Open();
                    SqlCommand cmd = new SqlCommand("ustReport_DepartmentComparativeAnalysisData", cn);
                    cmd.CommandTimeout = Convert.ToInt32(ConfigurationManager.AppSettings["SPCmdTimeout"].ToString());
                    cmd.CommandType = System.Data.CommandType.StoredProcedure;
                    cmd.Parameters.AddWithValue("SiteID", AppSession.SelectedSiteId);
                    cmd.Parameters.AddWithValue("ProgramID", AppSession.SelectedProgramId);
                    cmd.Parameters.AddWithValue("TracerIDs", search.TracerListIDs);
                    cmd.Parameters.AddWithValue("TracerCategoryIDs", search.TracerCategoryIDs);
                    cmd.Parameters.AddWithValue("OrgIDs_Rank3", search.OrgTypeLevel3IDs);
                    cmd.Parameters.AddWithValue("OrgIDs_Rank2", search.OrgTypeLevel2IDs);
                    cmd.Parameters.AddWithValue("OrgIDs_Rank1_Depts", search.OrgTypeLevel1IDs);
                    cmd.Parameters.AddWithValue("OrgActive", search.InActiveOrgTypes ? -1 : 1);                               //     -1 => All Active/Inactive Orgs;  1 = => Only Active Orgs; 0 => Only Inactive Orgs
                    cmd.Parameters.AddWithValue("ShowAllDepts", search.IncludeDeptNoCompObs ? 1 : 0);
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
            else if (rowsCount > Convert.ToInt32(ConfigurationManager.AppSettings["ReportOutputLimit"].ToString()))
                throw (new Exception("Limit"));
            return ds;


        }

        private DataSet ReportDepartmentComparativeAnalysisOpportunities(Search search, bool CheckRecords = true)
        {

            DataSet ds = new DataSet();
            try
            {
                using (SqlConnection cn = new SqlConnection(this.ConnectionString))
                {
                    cn.Open();
                    SqlCommand cmd = new SqlCommand("ustReport_DepartmentComparativeAnalysisOpportunities", cn);
                    cmd.CommandTimeout = Convert.ToInt32(ConfigurationManager.AppSettings["SPCmdTimeout"].ToString());
                    cmd.CommandType = System.Data.CommandType.StoredProcedure;
                    cmd.Parameters.AddWithValue("SiteID", AppSession.SelectedSiteId);
                    cmd.Parameters.AddWithValue("ProgramID", AppSession.SelectedProgramId);
                    cmd.Parameters.AddWithValue("TracerIDs", search.TracerListIDs);
                    cmd.Parameters.AddWithValue("TracerCategoryIDs", search.TracerCategoryIDs);
                    cmd.Parameters.AddWithValue("OrgIDs_Rank3", search.OrgTypeLevel3IDs);
                    cmd.Parameters.AddWithValue("OrgIDs_Rank2", search.OrgTypeLevel2IDs);
                    cmd.Parameters.AddWithValue("OrgIDs_Rank1_Depts", search.OrgTypeLevel1IDs);
                    cmd.Parameters.AddWithValue("OrgActive", search.InActiveOrgTypes ? -1 : 1);                               //  -1 => All Active/Inactive Orgs;  1 = => Only Active Orgs; 0 => Only Inactive Orgs
                    cmd.Parameters.AddWithValue("CycleID", AppSession.CycleID);                                 // Get active scoring cycle
                    cmd.Parameters.AddWithValue("CompliancePercent", search.OpportunitiesValue);                  // Pass Compliance percent
                    cmd.Parameters.AddWithValue("ResponseStartDate", search.StartDate);
                    cmd.Parameters.AddWithValue("ResponseEndDate", search.EndDate);
                    cmd.Parameters.AddWithValue("TracerTypeID", search.TracerTypeID);
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
            //Show first part of the rdlc if second part has no data. Do not show any part if second part has more than limit.
            int rowsCount = ds.Tables[0].Rows.Count;
            if (CheckRecords)
            {
                if (rowsCount == 0)
                    throw (new Exception("No Data"));
                else if (rowsCount > Convert.ToInt32(ConfigurationManager.AppSettings["ReportOutputLimit"].ToString()))
                    throw (new Exception("Limit"));

            }
            else
            {
                if (rowsCount > Convert.ToInt32(ConfigurationManager.AppSettings["ReportOutputLimit"].ToString()))
                    throw (new Exception("Limit"));

            }
            return ds;
        }


    }
}