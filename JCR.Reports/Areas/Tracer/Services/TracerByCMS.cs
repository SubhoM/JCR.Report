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
    public class TracerByCMS : BaseService
    {
        ExceptionService _exceptionService = new ExceptionService();

        public DataSourceResult TracerByCMSExcel([DataSourceRequest]DataSourceRequest request, Search search)
        {
            SearchFormat sf = new SearchFormat();

            sf.CheckInputs(search);

            List<TracerByCMSExcel> tracerByCMSExcel = new List<TracerByCMSExcel>();
            DataTable dt = new DataTable();
            var tcService = new TracerByCMS();

            DataSourceResult result = new DataSourceResult();
            try
            {

                dt = tcService.TracerByCMSData(search).Tables[0];
            
                    //convert datatable to list       
                tracerByCMSExcel = dt.ToList<TracerByCMSExcel>().Where(item => !string.IsNullOrEmpty(item.TracerResponseTitle)).ToList<TracerByCMSExcel>();



                result = tracerByCMSExcel.ToDataSourceResult(request, tc => new TracerByCMSExcel
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
                        OrgName_Rank1_Dept = tc.OrgName_Rank1_Dept,
                        TagCode = tc.TagCode,
                        TagID = tc.TagID,
                        CopText =  tc.RequirementName.Trim().ToString() + " - " + tc.CopText

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

        /// <summary>
        /// 
        /// </summary>
        /// <param name="search"></param>
        /// <param name="reporttype">1 = Chart, 2 = Data</param>
        /// <returns></returns>
        public byte[] TracerByCMSIE(Search search, int reportType, string filtereddataTag = "", string SortBy = "", string SortOrder = "")
        {
            string rdlcName = String.Empty;
            string dsName = String.Empty;
            ReportParameterCollection reportParameterCollection = null;

            DataView dv = null;

            SearchFormat sf = new SearchFormat();
            sf.CheckInputs(search);
            byte[] fileContents = null;

           
            try
            {

                if (AppSession.ReportScheduleID > 0)
                    search.ReportTitle = String.Concat(search.ReportTitle, " - Report ID: ", AppSession.ReportScheduleID);

                search.ReportDateTitle = CommonService.InitializeReportDateTitle("Tracer", search.StartDate, search.EndDate);
                search.EndDate = (search.EndDate != null && search.EndDate.ToString() != "") ? search.EndDate.Value.Date.AddHours(23).AddMinutes(29).AddSeconds(59) : search.EndDate;

                // Setup ReportViewer 
                ReportViewer reportViewer = new ReportViewer();
                reportViewer.ProcessingMode = ProcessingMode.Local;
                reportViewer.SizeToReportContent = true;
                reportViewer.LocalReport.DisplayName = search.ReportTitle;

                switch (reportType)
                {
                    case 1:     // By Chart (with Graph)
                    default:
                        {
                            rdlcName = "rptReportTracerByCMSChart.rdlc";
                            if (reportType == (int) WebConstants.ReportFormat.EXCEL)
                                rdlcName = "rptReportTracerByCMSChartExcel.rdlc";
                            dsName = "dsReport_TracerByCMSChart";        // Will pick this data set for Excel
                            dv = new DataView(TracerByCMSGraph(search).Tables[0]);

                            if (filtereddataTag == "")
                            {
                                filtereddataTag = "0";
                            }
                           // DataView dv = new DataView(dt);
                            dv.RowFilter = "TagID IN (" + filtereddataTag + ")";
                            if (SortBy != "")
                            { dv.Sort = SortBy + " " + SortOrder; }

                            break;
                        }


                    case 2:     // By Detail Data 
                        {
                            rdlcName = "rptReportTracerByCMSExcel.rdlc";
                            dsName = "dsReport_TracerByCMS";        // Will pick this data set for Excel
                            dv = new DataView(TracerByCMSData(search).Tables[0]);
                            break;
                        }
                }
                

                // Setup Data sources for report
                reportViewer.LocalReport.DataSources.Clear();
                reportViewer.LocalReport.ReportPath = HttpContext.Current.Request.MapPath(HttpContext.Current.Request.ApplicationPath) + @"Areas\Tracer\Reports\" + rdlcName.ToString();
                reportViewer.LocalReport.DataSources.Add(new ReportDataSource(dsName, dv));

                if (reportType == (int)WebConstants.ReportFormat.EXCEL)
                {
                    // Setup Parameter DataSet
                    DataSet reportParameters = CommonService.ReportParameters();
                    // Excel view here
                    // Add Parameter Data Set
                    reportParameters.Tables[0].Rows.Add(WebConstants.PARAM_SiteName, AppSession.SelectedSiteName, "1");
                    reportParameters.Tables[0].Rows.Add(WebConstants.PARAM_ProgramName, AppSession.SelectedProgramName, "1");
                    if (AppSession.IsCMSProgram)
                        reportParameters.Tables[0].Rows.Add(WebConstants.PARAM_TracerType, "TJC", "1");
                    reportParameters.Tables[0].Rows.Add(WebConstants.PARAM_TracerCategories, search.TracerCategoryNames.ToString(), "1");
                    reportParameters.Tables[0].Rows.Add(WebConstants.PARAM_ChapterNames, search.TracerChapterNames.ToString(), "1");
                    reportParameters.Tables[0].Rows.Add(WebConstants.PARAM_ReportType, search.ReportType.ToString(), "1");
                    reportParameters.Tables[0].Rows.Add(WebConstants.PARAM_CMSTagNames, search.TracerCMSTagsNames.ToString(), "1");
                    reportParameters.Tables[0].Rows.Add(WebConstants.PARAM_StartDate, search.StartDate == null ? "" : Convert.ToDateTime(search.StartDate).ToShortDateString(), "1");
                    reportParameters.Tables[0].Rows.Add(WebConstants.PARAM_IncludeCompliancePercent, search.IncludeNonCompliantOpportunities ? "True" : "False", "1");
                    reportParameters.Tables[0].Rows.Add(WebConstants.PARAM_CompliancePercent, search.OpportunitiesValue.ToString(), "1");



                    // Add Parameters as Data source
                    DataView dvReport2 = new DataView(reportParameters.Tables[0]);
                    ReportDataSource datasource2 = new ReportDataSource("dsReport_Parameters", dvReport2);
                    reportViewer.LocalReport.DataSources.Add(datasource2);

                }


                ReportParameter p1 = new ReportParameter("ReportTitle", search.ReportTitle);
                ReportParameter p2 = new ReportParameter("SiteName", AppSession.SelectedSiteName);
                ReportParameter p3 = new ReportParameter("ProgramName", AppSession.SelectedProgramName);
                ReportParameter p4 = new ReportParameter("ReportDateTitle", search.ReportDateTitle.ToString());
                ReportParameter p5 = new ReportParameter("Copyright", "© " + DateTime.Now.Year.ToString() + WebConstants.Tracer_Copyright.ToString());
                ReportParameter p6 = new ReportParameter("OrgType1Header", AppSession.OrgRanking1Name.ToString());                 // Provide OrgType Rank 1 Name header (e.g., Department)
                ReportParameter p7 = new ReportParameter("OrgType2Header", AppSession.OrgRanking2Name.ToString());                 // Provide OrgType Rank 2 Name column header or blank if none
                ReportParameter p8 = new ReportParameter("OrgType3Header", AppSession.OrgRanking3Name.ToString());                 // Provide OrgType Rank 2 Name column header or blank if none
                ReportParameter p9 = new ReportParameter("OrgRank1Names", search.OrgTypeLevel1Names.ToString());                   // Filtered Rank 1 Org Names or blank string for all
                ReportParameter p10 = new ReportParameter("OrgRank2Names", search.OrgTypeLevel2Names.ToString());                   // Filtered Rank 2 Org Names or blank string for all
                ReportParameter p11 = new ReportParameter("OrgRank3Names", search.OrgTypeLevel3Names.ToString());                   // Filtered Rank 3 Org Names or blank string for all

                ReportParameter p17 = new ReportParameter("IsCMSProgram", AppSession.IsCMSProgram ? "1" : "0");

                if (reportType == (int) WebConstants.ReportFormat.PDF) {
                    // Add extra Parameters for PDF version - these go to header of report; If Excel they are in second data set
                    ReportParameter p12 = new ReportParameter("CategoryNames", search.TracerCategoryNames.ToString());
                    ReportParameter p13 = new ReportParameter("ChapterNames", search.TracerChapterNames.ToString());
                    ReportParameter p14 = new ReportParameter("TagNames", search.TracerCMSTagsNames.ToString());
                    ReportParameter p15 = new ReportParameter("IncludeCompliancePercent", search.IncludeNonCompliantOpportunities ? "1" : "0");
                    ReportParameter p16 = new ReportParameter("CompliancePercent", search.OpportunitiesValue.ToString());
                    
                    reportParameterCollection = new ReportParameterCollection { p1, p2, p3, p4, p5, p6, p7, p8, p9, p10, p11, p12, p13, p14, p15, p16, p17 };
                } else {
                    reportParameterCollection = new ReportParameterCollection { p1, p2, p3, p4, p5, p6, p7, p8, p9, p10, p11, p17 };
                }

                reportViewer.LocalReport.SetParameters(reportParameterCollection);
                Warning[] warnings;
                string[] streamIds;
                string mimeType = string.Empty;
                string encoding = string.Empty;
                string extension = string.Empty;

                string format = "PDF";      // PDF is default
                if (reportType == (int) WebConstants.ReportFormat.EXCEL)
                    format = "EXCELOPENXML";        // If Excel option chosen
                fileContents = reportViewer.LocalReport.Render(format, null, out mimeType, out encoding, out extension, out streamIds, out warnings);
            }
            catch (Exception ex)
            {
                throw ex;
            }

            return fileContents;
        }
        public DataSourceResult TracerByCMSChart([DataSourceRequest]DataSourceRequest request, Search search)
        {
            SearchFormat sf = new SearchFormat();

            sf.CheckInputs(search);

            List<TracerByCMSGraph> tracerByCMSExcel = new List<TracerByCMSGraph>();
            DataTable dt = new DataTable();
            var tcService = new TracerByCMS();

            DataSourceResult result = new DataSourceResult();
            try
            {

                dt = tcService.TracerByCMSGraph(search).Tables[0];

                //convert datatable to list       
                tracerByCMSExcel = dt.ToList<TracerByCMSGraph>().Where(item => !string.IsNullOrEmpty(item.CMSTag)).ToList<TracerByCMSGraph>();



                result = tracerByCMSExcel.ToDataSourceResult(request, tc => new TracerByCMSGraph
                {
                    CMSTag = tc.CMSTag,
                    Compliance = tc.Compliance,
                    TotalDenominator = tc.TotalDenominator,
                    TotalNumerator = tc.TotalNumerator,
                    TagID = tc.TagID
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


        public DataSet TracerByCMSData(Search search)
        {
            string msg = String.Empty;
            DataSet ds = new DataSet();
            string spName = "ustReport_TracerByCMS";

            try
            {

                using (SqlConnection cn = new SqlConnection(ConfigurationManager.ConnectionStrings["DBMEdition01"].ToString()))
                {
                    cn.Open();
                    SqlCommand cmd = new SqlCommand(spName, cn);
                    cmd.CommandTimeout = 900;//Convert.ToInt32(ConfigurationManager.AppSettings["SPCmdTimeout"].ToString());
                    cmd.CommandType = System.Data.CommandType.StoredProcedure;
                    cmd.Parameters.AddWithValue("SiteID", AppSession.SelectedSiteId);
                    cmd.Parameters.AddWithValue("ProgramID", AppSession.SelectedProgramId);
                    cmd.Parameters.AddWithValue("TracerCategoryIDs", search.TracerCategoryIDs);
                    cmd.Parameters.AddWithValue("CMSTags", search.CMSTags);
                    if (string.Equals(search.TracerChapterIDs, "-1"))
                        cmd.Parameters.AddWithValue("ChapterID", DBNull.Value);
                    else
                        cmd.Parameters.AddWithValue("ChapterID", search.TracerChapterIDs);
                    cmd.Parameters.AddWithValue("CycleID", AppSession.CycleID);
                    cmd.Parameters.AddWithValue("CompliancePercent", search.IncludeNonCompliantOpportunities ? search.OpportunitiesValue : -1);
                    cmd.Parameters.AddWithValue("IncludeNA", search.IncludeNA ? 1 : 0);
                    cmd.Parameters.AddWithValue("ResponseStartDate", search.StartDate);
                    cmd.Parameters.AddWithValue("ResponseEndDate", search.EndDate);

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


        public DataSet TracerByCMSGraph(Search search)
        {
            string msg = String.Empty;
            DataSet ds = new DataSet();
            string spName = "ustReport_TracerByCMSChart";

            try
            {

                using (SqlConnection cn = new SqlConnection(ConfigurationManager.ConnectionStrings["DBMEdition01"].ToString()))
                {
                    cn.Open();
                    SqlCommand cmd = new SqlCommand(spName, cn);
                    cmd.CommandTimeout = 900; // Convert.ToInt32(ConfigurationManager.AppSettings["SPCmdTimeout"].ToString());
                    cmd.CommandType = System.Data.CommandType.StoredProcedure;
                    cmd.Parameters.AddWithValue("SiteID", AppSession.SelectedSiteId);
                    cmd.Parameters.AddWithValue("ProgramID", AppSession.SelectedProgramId);
                    cmd.Parameters.AddWithValue("TracerCategoryIDs", search.TracerCategoryIDs);
                    cmd.Parameters.AddWithValue("CMSTags", search.CMSTags);
                    if (string.Equals(search.TracerChapterIDs, "-1"))
                        cmd.Parameters.AddWithValue("ChapterID", DBNull.Value);
                    else
                        cmd.Parameters.AddWithValue("ChapterID", search.TracerChapterIDs);
                    cmd.Parameters.AddWithValue("CycleID", AppSession.CycleID);
                    cmd.Parameters.AddWithValue("CompliancePercent", search.IncludeNonCompliantOpportunities ? search.OpportunitiesValue : -1);
                    cmd.Parameters.AddWithValue("IncludeNA", search.IncludeNA ? 1 : 0);
                    cmd.Parameters.AddWithValue("ResponseStartDate", search.StartDate);
                    cmd.Parameters.AddWithValue("ResponseEndDate", search.EndDate);

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

        public DataSet ProgramCMSTagMap(string programID = "")
        {
            string msg = String.Empty;
            DataSet ds = new DataSet();
            string spName = "ustReport_BaseCopFilterDeemingMap";

            try
            {

                using (SqlConnection cn = new SqlConnection(ConfigurationManager.ConnectionStrings["DBMEdition01"].ToString()))
                {
                    cn.Open();
                    SqlCommand cmd = new SqlCommand(spName, cn);
                    cmd.CommandTimeout = Convert.ToInt32(ConfigurationManager.AppSettings["SPCmdTimeout"].ToString());
                    cmd.CommandType = System.Data.CommandType.StoredProcedure;
                    cmd.Parameters.AddWithValue("ProgramID", programID);

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
    }
}