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
    public class TracerByEP : BaseService
    {
        ExceptionService _exceptionService = new ExceptionService();

        public DataSourceResult TracerByEPExcel([DataSourceRequest]DataSourceRequest request, Search search)
        {
            SearchFormat sf = new SearchFormat();

            sf.CheckInputs(search);

            List<TracerByEPExcel> tracerByEPExcel = new List<TracerByEPExcel>();
            DataTable dt = new DataTable();
            var tcService = new TracerByEP();

            DataSourceResult result = new DataSourceResult();
            try
            {

                dt = tcService.TracerByEPData(search).Tables[0];
            
                    //convert datatable to list       
                    tracerByEPExcel = dt.ToList<TracerByEPExcel>().Where(item => !string.IsNullOrEmpty(item.TracerResponseTitle)).ToList<TracerByEPExcel>();



                    result = tracerByEPExcel.ToDataSourceResult(request, tc => new TracerByEPExcel
                    {
                        // TO DO Get Excel View DataSet
                        SiteID = tc.SiteID,
                        ChapterName = tc.ChapterName,
                        CompliancePercent = tc.CompliancePercent,
                        Denominator = tc.Denominator,
                        EPLabel = tc.EPLabel,
                        EPText = tc.EPText.ReplaceNewline(),
                        EPTextID = tc.EPTextID,
                        Numerator = tc.Numerator,
                        ObservationDate = tc.ObservationDate,
                        QuestionText = tc.QuestionText.ReplaceNewline(),
                        ReportDataType = tc.ReportDataType,
                        StandardLabel = tc.StandardLabel,
                        StandardText = tc.StandardText.ReplaceNewline(),
                        TracerCustomName = tc.TracerCustomName,
                        TracerQuestionNote = tc.TracerQuestionNote.ReplaceNewline(),
                        TracerResponseNote = tc.TracerResponseNote.ReplaceNewline(),
                        TracerResponseTitle = tc.TracerResponseTitle,
                        UpdatedByUserName = tc.UpdatedByUserName,
                        UpdatedDate = tc.UpdatedDate,
                        OrgName_Rank3 = tc.OrgName_Rank3,
                        OrgName_Rank2 = tc.OrgName_Rank2,
                        OrgName_Rank1_Dept = tc.OrgName_Rank1_Dept

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
                        PageName = "OrganizationPriorityFindings",
                        MethodName = "OrganizationPriorityFindingsRDLC",
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

        public byte[] TracerByEPDataIE(Search search)
        {
          
            string complianceHeader = string.Empty;
            SearchFormat sf = new SearchFormat();
            sf.CheckInputs(search);
            byte[] fileContents = null;


            try
            {

                string rdlcName = rdlcName = @"Areas\Tracer\Reports\rptReportTracerByEPGroupByEPExcel.rdlc";
                string dsName = "dsReport_TracerByEPGroupByEP";

                var fulldt = TracerByEPData(search).Tables[0];
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


                switch (search.ReportGroupByType)
                {
                    case "Standard":
                    default:
                        {
                            complianceHeader = search.ReportGroupByType + ", ";
                            break;
                        }

                    case "EP":
                        {
                            complianceHeader = search.ReportGroupByType + ", ";
                            break;
                        }

                    case "EpWithDepartment":
                        {
                            complianceHeader = "EP with Department, ";
                            break;
                        }

                    case "EPWithQuestions":
                        {
                            complianceHeader = "EP with Questions, ";
                            break;
                        }

                }
                switch (search.ReportType)
                {
                    case "GraphOnly":
                        complianceHeader = complianceHeader + "Graph only";
                        break;
                    case "DataOnly":
                        complianceHeader = complianceHeader + "Data only";
                        break;
                    case "GraphandData":
                        complianceHeader = complianceHeader + "Graph & Data";
                        break;
                    case "ExcelView":
                        complianceHeader = complianceHeader + "Excel View";
                        break;
                }
                reportViewer.LocalReport.DisplayName = search.ReportTitle;
                reportViewer.LocalReport.ReportPath = HttpContext.Current.Request.MapPath(HttpContext.Current.Request.ApplicationPath) + rdlcName;
                reportViewer.LocalReport.DataSources.Add(new ReportDataSource(dsName, TracerByEPData(search).Tables[0]));

                // Setup Parameter DataSet
                DataSet reportParameters = CommonService.ReportParameters();
                // Excel view here
                // Add Parameter Data Set
                reportParameters.Tables[0].Rows.Add(WebConstants.PARAM_SiteName, AppSession.SelectedSiteName, "1");
                reportParameters.Tables[0].Rows.Add(WebConstants.PARAM_ProgramName, AppSession.SelectedProgramName, "1");
                if (AppSession.IsCMSProgram)
                    reportParameters.Tables[0].Rows.Add(WebConstants.PARAM_TracerType, "TJC", "1");
                reportParameters.Tables[0].Rows.Add(WebConstants.PARAM_TracerCategories, search.TracerCategoryNames.ToString(), "1");
                reportParameters.Tables[0].Rows.Add(WebConstants.PARAM_ReportType, search.ReportType.ToString(), "1");
                reportParameters.Tables[0].Rows.Add(WebConstants.PARAM_ReportGroupByType, search.ReportGroupByType.ToString(), "1");
                reportParameters.Tables[0].Rows.Add(WebConstants.PARAM_StartDate, search.StartDate == null ? "" : Convert.ToDateTime(search.StartDate).ToShortDateString(), "1");
                reportParameters.Tables[0].Rows.Add(WebConstants.PARAM_EndDate, search.EndDate == null ? "" : Convert.ToDateTime(search.EndDate).ToShortDateString(), "1");
                reportParameters.Tables[0].Rows.Add(WebConstants.PARAM_ChapterNames, search.TracerChapterNames.ToString(), "1");
                reportParameters.Tables[0].Rows.Add(WebConstants.PARAM_StandardLabels, search.TracerStandardNames.ToString(), "1");
                reportParameters.Tables[0].Rows.Add(WebConstants.PARAM_EPLabels, search.StandardLabelAndEPLabels.ToString(), "1");
                reportParameters.Tables[0].Rows.Add(WebConstants.PARAM_IncludeCompliancePercent, search.IncludeNonCompliantOpportunities ? "True" : "False", "1");
                reportParameters.Tables[0].Rows.Add(WebConstants.PARAM_CompliancePercent, search.OpportunitiesValue.ToString(), "1");
                reportParameters.Tables[0].Rows.Add(WebConstants.PARAM_ShowCMS, search.IncludeCMS ? "True" : "False", "1");
                reportParameters.Tables[0].Rows.Add(CommonService.GetOrgHeader(), search.InActiveOrgTypes ? "True" : "False", "1");
                reportParameters.Tables[0].Rows.Add(AppSession.OrgRanking1Name, search.OrgTypeLevel1Names, "1");
                if (AppSession.OrgRanking2Name != "")
                    reportParameters.Tables[0].Rows.Add(AppSession.OrgRanking2Name, search.OrgTypeLevel2Names, "1");
                if (AppSession.OrgRanking3Name != "")
                    reportParameters.Tables[0].Rows.Add(AppSession.OrgRanking3Name, search.OrgTypeLevel3Names, "1");
                reportParameters.Tables[0].Rows.Add(CommonService.GetOrgHeader(), search.InActiveOrgTypes ? "True" : "False", "1");
                // Add Parameters as Data source
                DataView dvReport2 = new DataView(reportParameters.Tables[0]);
                ReportDataSource datasource2 = new ReportDataSource("dsReport_Parameters", dvReport2);
                reportViewer.LocalReport.DataSources.Add(datasource2);

                string standardHeader = "All";

                if (search.TracerStandardIDs != "-1" || search.EPTextIDs != "-1")
                {
                    DataView dvStandardHeader = new DataView(GetEPStandardHeader((int)AppSession.CycleID, AppSession.SelectedProgramId, search.TracerStandardIDs, search.EPTextIDs).Tables[0]);
                    if (dvStandardHeader != null && dvStandardHeader.Count > 0)
                        standardHeader = dvStandardHeader[0]["StandardEPReportHeader"].ToString();
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


                ReportParameter p1 = new ReportParameter("ReportTitle", search.ReportTitle);
                ReportParameter p2 = new ReportParameter("SiteName", AppSession.SelectedSiteName);
                ReportParameter p3 = new ReportParameter("ProgramName", AppSession.SelectedProgramName);
                ReportParameter p4 = new ReportParameter("ReportDateTitle", search.ReportDateTitle.ToString());
                ReportParameter p5 = new ReportParameter("Copyright", "© " + DateTime.Now.Year.ToString() + WebConstants.Tracer_Copyright.ToString());
                ReportParameter p6 = new ReportParameter("CategoryNames", search.TracerCategoryNames.ToString());
                ReportParameter p7 = new ReportParameter("ReportDisplay", ((int)Enum.Parse(typeof(ReportType), search.ReportType)).ToString());
                ReportParameter p8 = new ReportParameter("ShowCMS", search.IncludeCMS ? "1" : "0");
                ReportParameter p9 = new ReportParameter("Not100PercentCompliance", search.IncludeNonCompliantOpportunities ? "1" : "0");
                ReportParameter p10 = new ReportParameter("ComplianceHeader", complianceHeader);
                ReportParameter p11 = new ReportParameter("StandardEPReportHeader", standardHeader);
                ReportParameter p12 = new ReportParameter("OrgType1Header", AppSession.OrgRanking1Name.ToString());                 // Provide OrgType Rank 1 Name header (e.g., Department)
                ReportParameter p13 = new ReportParameter("OrgType2Header", AppSession.OrgRanking2Name.ToString());                 // Provide OrgType Rank 2 Name column header or blank if none
                ReportParameter p14 = new ReportParameter("OrgType3Header", AppSession.OrgRanking3Name.ToString());                 // Provide OrgType Rank 2 Name column header or blank if none
                ReportParameter p15 = new ReportParameter("OrgRank1Names", search.OrgTypeLevel1Names.ToString());                   // Filtered Rank 1 Org Names or blank string for all
                ReportParameter p16 = new ReportParameter("OrgRank2Names", search.OrgTypeLevel2Names.ToString());                   // Filtered Rank 2 Org Names or blank string for all
                ReportParameter p17 = new ReportParameter("OrgRank3Names", search.OrgTypeLevel3Names.ToString());                   // Filtered Rank 3 Org Names or blank string for all
                ReportParameter p18 = new ReportParameter("CompliancePercent", search.OpportunitiesValue.ToString());
                ReportParameter p19 = new ReportParameter("InActiveOrgTypes", search.InActiveOrgTypes ? "0" : "1");
                ReportParameter p20 = new ReportParameter("IsCMSProgram", AppSession.IsCMSProgram ? "1" : "0");
                ReportParameterCollection reportParameterCollection = new ReportParameterCollection { p1, p2, p3, p4, p5, p6, p7, p8, p9, p10, p11, p12, p13, p14, p15, p16, p17, p18 ,p19, p20 };
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

       
        public ReportViewer TracerByEPRDLC(Search search, Email emailInput)
        {

            SearchFormat sf = new SearchFormat();

            sf.CheckInputs(search);

            string msg = String.Empty;
            string rdlcName = String.Empty;
            string dsName = String.Empty;

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

            string complianceHeader = string.Empty;

            try
            {


                switch (search.ReportGroupByType)
                {
                    case "Standard":
                    default:
                        {
                            rdlcName = @"Areas\Tracer\Reports\rptReportTracerByEPGroupByStandard.rdlc";
                            dsName = "dsReport_TracerByEPGroupByStandard";
                            complianceHeader = search.ReportGroupByType + ", ";
                            break;
                        }

                    case "EP":
                        {
                            rdlcName = @"Areas\Tracer\Reports\rptReportTracerByEPGroupByEP.rdlc";
                            dsName = "dsReport_TracerByEPGroupByEP";
                            complianceHeader = search.ReportGroupByType + ", ";
                            break;
                        }

                    case "EpWithDepartment":
                        {
                            rdlcName = @"Areas\Tracer\Reports\rptReportTracerByEPGroupByEPDept.rdlc";
                            dsName = "dsReport_TracerByEPGroupByEPDept";
                            complianceHeader = "EP with Department, ";
                            break;
                        }

                    case "EPWithQuestions":
                        {
                            rdlcName = @"Areas\Tracer\Reports\rptReportTracerByEPGroupByEPQuestion.rdlc";
                            dsName = "dsReport_TracerByEPGroupByEPQuestion";
                            complianceHeader = "EP with Questions, ";
                            break;
                        }

                }
                switch(search.ReportType)
                {
                    case "GraphOnly":
                        complianceHeader = complianceHeader + "Graph only";
                        break;
                    case "DataOnly":
                        complianceHeader = complianceHeader + "Data only";
                        break;
                    case "GraphandData":
                    complianceHeader = complianceHeader + "Graph & Data";
                        break;
                    case "ExcelView":
                    complianceHeader = complianceHeader + "Excel View";
                        break;
                }
                reportViewer.LocalReport.DisplayName = search.ReportTitle;
                reportViewer.LocalReport.ReportPath = HttpContext.Current.Request.MapPath(HttpContext.Current.Request.ApplicationPath) + rdlcName;
                reportViewer.LocalReport.DataSources.Add(new ReportDataSource(dsName, TracerByEPData(search).Tables[0]));

                

                string standardHeader = "All";

                if (search.TracerStandardIDs != "-1" || search.EPTextIDs != "-1")
                {
                    DataView dvStandardHeader = new DataView(GetEPStandardHeader((int)AppSession.CycleID, AppSession.SelectedProgramId, search.TracerStandardIDs, search.EPTextIDs).Tables[0]);
                    if (dvStandardHeader != null && dvStandardHeader.Count > 0)
                        standardHeader = dvStandardHeader[0]["StandardEPReportHeader"].ToString();
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


                ReportParameter p1 = new ReportParameter("ReportTitle", search.ReportTitle);
                ReportParameter p2 = new ReportParameter("SiteName", AppSession.SelectedSiteName);
                ReportParameter p3 = new ReportParameter("ProgramName", AppSession.SelectedProgramName);
                ReportParameter p4 = new ReportParameter("ReportDateTitle", search.ReportDateTitle.ToString());
                ReportParameter p5 = new ReportParameter("Copyright", "© " + DateTime.Now.Year.ToString() + WebConstants.Tracer_Copyright.ToString());
                ReportParameter p6 = new ReportParameter("CategoryNames", search.TracerCategoryNames.ToString());
                ReportParameter p7 = new ReportParameter("ReportDisplay", ((int)Enum.Parse(typeof(ReportType), search.ReportType)).ToString());
                ReportParameter p8 = new ReportParameter("ShowCMS", search.IncludeCMS ? "1" : "0");
                ReportParameter p9 = new ReportParameter("Not100PercentCompliance", search.IncludeNonCompliantOpportunities ? "1" : "0");
                ReportParameter p10 = new ReportParameter("ComplianceHeader", complianceHeader);
                ReportParameter p11 = new ReportParameter("StandardEPReportHeader", standardHeader);
                ReportParameter p12 = new ReportParameter("OrgType1Header", AppSession.OrgRanking1Name.ToString());                 // Provide OrgType Rank 1 Name header (e.g., Department)
                ReportParameter p13 = new ReportParameter("OrgType2Header", AppSession.OrgRanking2Name.ToString());                 // Provide OrgType Rank 2 Name column header or blank if none
                ReportParameter p14 = new ReportParameter("OrgType3Header", AppSession.OrgRanking3Name.ToString());                 // Provide OrgType Rank 2 Name column header or blank if none
                ReportParameter p15 = new ReportParameter("OrgRank1Names", search.OrgTypeLevel1Names.ToString());                   // Filtered Rank 1 Org Names or blank string for all
                ReportParameter p16 = new ReportParameter("OrgRank2Names", search.OrgTypeLevel2Names.ToString());                   // Filtered Rank 2 Org Names or blank string for all
                ReportParameter p17 = new ReportParameter("OrgRank3Names", search.OrgTypeLevel3Names.ToString());                   // Filtered Rank 3 Org Names or blank string for all
                ReportParameter p18 = new ReportParameter("CompliancePercent", search.OpportunitiesValue.ToString());
                ReportParameter p19 = new ReportParameter("InActiveOrgTypes", search.InActiveOrgTypes ? "0" : "1");
                ReportParameter p20 = new ReportParameter("IsCMSProgram", AppSession.IsCMSProgram ? "1" : "0");
                ReportParameterCollection reportParameterCollection = new ReportParameterCollection { p1, p2, p3, p4, p5, p6, p7, p8, p9, p10, p11, p12, p13, p14, p15, p16, p17, p18, p19, p20};
                reportViewer.LocalReport.SetParameters(reportParameterCollection);

                if (emailInput.To != null)
                {
                    CommonService emailService = new CommonService();
                    int actionTypeId = (int)ActionTypeEnum.TracerByEPReport;
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
                        PageName = "TracerByEP",
                        MethodName = "TracerByEPRDLC",
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

        public DataSet TracerByEPData(Search search)
        {
            string msg = String.Empty;
            DataSet ds = new DataSet();
            string spName = String.Empty;

            switch (search.ReportGroupByType)
            {
                case "Standard":
                default:
                    {
                        spName = "ustReport_TracerByEPGroupByStandard";
                        break;
                    }

                case "EP":
                    {
                        spName = "ustReport_TracerByEPGroupByEP";
                        break;
                    }

                case "EpWithDepartment":
                    {
                        spName = "ustReport_TracerByEPGroupByEPDept";
                        break;
                    }

                case "EPWithQuestions":
                    {
                        spName = "ustReport_TracerByEPGroupByEPQuestion";
                        break;
                    }

            }

            try
            {

                using (SqlConnection cn = new SqlConnection(ConfigurationManager.ConnectionStrings["DBMEdition01"].ToString()))
                {
                    cn.Open();
                    SqlCommand cmd = new SqlCommand(spName, cn);
                    cmd.CommandTimeout = Convert.ToInt32(ConfigurationManager.AppSettings["SPCmdTimeout"].ToString());
                    cmd.CommandType = System.Data.CommandType.StoredProcedure;
                    cmd.Parameters.AddWithValue("SiteID", AppSession.SelectedSiteId);
                    cmd.Parameters.AddWithValue("ProgramID", AppSession.SelectedProgramId);
                    cmd.Parameters.AddWithValue("TracerCategoryIDs", search.TracerCategoryIDs);
                    cmd.Parameters.AddWithValue("ShowCMS", search.IncludeCMS ? 1 : 0);
                    if (string.Equals(search.TracerChapterIDs, "-1"))
                        cmd.Parameters.AddWithValue("ChapterID", DBNull.Value);
                    else
                        cmd.Parameters.AddWithValue("ChapterID", search.TracerChapterIDs);
                    cmd.Parameters.AddWithValue("Standards", string.Equals(search.TracerStandardIDs, "-1") ? "" : search.TracerStandardIDs);
                    cmd.Parameters.AddWithValue("EPs", string.Equals(search.EPTextIDs, "-1") ? "" : search.EPTextIDs);
                    cmd.Parameters.AddWithValue("CycleID", AppSession.CycleID);
                    cmd.Parameters.AddWithValue("CompliancePercent", search.IncludeNonCompliantOpportunities ? search.OpportunitiesValue : -1);
                    cmd.Parameters.AddWithValue("IncludeNA", search.IncludeNA ? 1 : 0);
                    cmd.Parameters.AddWithValue("ResponseStartDate", search.StartDate);
                    cmd.Parameters.AddWithValue("ResponseEndDate", search.EndDate);
                    cmd.Parameters.AddWithValue("OrgIDs_Rank3", search.OrgTypeLevel3IDs);
                    cmd.Parameters.AddWithValue("OrgIDs_Rank2", search.OrgTypeLevel2IDs);
                    cmd.Parameters.AddWithValue("OrgIDs_Rank1_Depts", search.OrgTypeLevel1IDs);
                    cmd.Parameters.AddWithValue("OrgActive", search.InActiveOrgTypes ? -1 : 1);                               //     -1 => All Active/Inactive Orgs;  1 = => Only Active Orgs; 0 => Only Inactive Orgs

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
            catch(Exception ex)
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

        public DataSet GetEPStandardHeader(int cycleID, int pProgramID, string pStandards, string pEPs)
        {
            using (SqlConnection cn = new SqlConnection(ConfigurationManager.ConnectionStrings["DBMEdition01"].ToString()))
            {
                DataSet ds = new DataSet();

                cn.Open();
                SqlCommand cmd = new SqlCommand("ustReport_Select_StandardEPReportHeader", cn);
                cmd.CommandTimeout = 900;
                cmd.CommandType = System.Data.CommandType.StoredProcedure;                

                cmd.Parameters.AddWithValue("CycleID", cycleID);
                cmd.Parameters.AddWithValue("ProgramID", pProgramID);
                if (string.Equals(pStandards, "-1"))
                    cmd.Parameters.AddWithValue("Standards", DBNull.Value);
                else
                    cmd.Parameters.AddWithValue("Standards", pStandards);
                if (string.Equals(pEPs, "-1"))
                    cmd.Parameters.AddWithValue("EPs", DBNull.Value);
                else
                    cmd.Parameters.AddWithValue("EPs", pEPs);


                SqlDataAdapter da = new SqlDataAdapter(cmd);

                using (cn)
                using (cmd)
                using (da)
                {
                    da.Fill(ds);
                }
                return ds;
            }
            
        }

    }
}