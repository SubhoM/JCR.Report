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
using System.Configuration;
using JCR.Reports.DataModel;
using System.Collections.Generic;
using System.Text.RegularExpressions;
using JCR.Reports.Areas.Corporate.ViewModels;
using JCR.Reports.Models.Enums;

namespace JCR.Reports.Areas.Corporate.Services
{
    public class CMSCompliance : BaseService
    {
        ExceptionService _exceptionService = new ExceptionService();
        public ReportViewer CMSComplianceRDLC(SearchCMSCompliance searchParams, Email emailInput, string reportType = "Summary")
        {
            DateTime? startDate = null;
            DateTime? endDate = null;
            string reportDate = "All Dates";

            SearchFormat searchoutput = new SearchFormat();

            if (searchParams.StartDate != null)
            {
                startDate = searchParams.StartDate;
                if (searchParams.EndDate != null)
                    reportDate = searchParams.StartDate.Value.ToShortDateString() + " - " + searchParams.EndDate.Value.ToShortDateString();
                else
                    reportDate = "since " + searchParams.StartDate.Value.ToShortDateString();
            }

            if (searchParams.EndDate != null)
            {
                endDate = searchParams.EndDate.Value.Date.AddHours(23).AddMinutes(59).AddSeconds(59);
                if (searchParams.StartDate == null)
                    reportDate = "through " + searchParams.EndDate.Value.ToShortDateString();
            }

            ReportViewer reportViewer = new ReportViewer();
            reportViewer.ProcessingMode = ProcessingMode.Local;
            reportViewer.SizeToReportContent = true;
            try
            {
                if (AppSession.ReportScheduleID > 0 && searchParams.ReportTitle != null)
                    searchParams.ReportTitle = String.Concat(searchParams.ReportTitle, " - Report ID: ", AppSession.ReportScheduleID);
                else
                {
                    if (reportType == "Summary")
                        searchParams.ReportTitle = "CMS Compliance Report - Summary";
                    else
                        searchParams.ReportTitle = "CMS Compliance Report - Detail";
                }

                string rdlcfilename = string.Empty;
                string dsName = string.Empty;

                if (reportType == "Summary")
                {
                    rdlcfilename = "rptCMSCompliance_Summary.rdlc";
                    dsName = "dstCMSComplianceSummary";
                }
                else
                {
                    rdlcfilename = "rptCMSCompliance_Detail.rdlc";
                    dsName = "dstCMSComplianceDetail";
                }

                ReportParameterCollection reportParameterCollection = new ReportParameterCollection();

                DataTable dtblReportForCMSCompliance = GetReportDataView(searchParams, reportType).Tables[0];

                DataView dvReportResultForCMSCompliance = new DataView(dtblReportForCMSCompliance);
                reportViewer.LocalReport.DisplayName = searchParams.ReportTitle;
                reportViewer.LocalReport.ReportPath = HttpContext.Current.Request.MapPath(HttpContext.Current.Request.ApplicationPath) + @"Areas\Corporate\Reports\" + rdlcfilename;
                reportViewer.LocalReport.DataSources.Add(new ReportDataSource(dsName, dvReportResultForCMSCompliance));

                reportParameterCollection.Add(new ReportParameter("ReportTitle", searchParams.ReportTitle));
                reportParameterCollection.Add(new ReportParameter("Copyright", "© " + DateTime.Now.Year.ToString() + WebConstants.Copyright.ToString()));
                reportParameterCollection.Add(new ReportParameter("ProgramName", searchParams.ProgramNames));
                reportParameterCollection.Add(new ReportParameter("SiteName", searchParams.SelectedSiteNames));
                reportParameterCollection.Add(new ReportParameter("ReportDateTitle", DateTime.Now.ToString()));
                reportParameterCollection.Add(new ReportParameter("CoPNameList", searchParams.SelectedCoPNames));
                reportParameterCollection.Add(new ReportParameter("TagNameList", searchParams.SelectedTagNames));
                reportParameterCollection.Add(new ReportParameter("IdentifiedByNameList", searchParams.SelectedIdentifiedByNames));
                reportParameterCollection.Add(new ReportParameter("CompliancePeriod", reportDate));
                reportParameterCollection.Add(new ReportParameter("ComplianceValueNameList", searchParams.ComplianceValueNameList));
                reportParameterCollection.Add(new ReportParameter("DocumentationNameList", searchParams.DocumentationNameList));

                switch (reportType)
                {
                    case "Summary":

                        var autoCitationArray = dtblReportForCMSCompliance.AsEnumerable()
                                            .Where(a => string.IsNullOrEmpty(a.Field<string>("AutoCitationText")) == false)
                                            .GroupBy(a => new { AutoCitationText = a.Field<string>("AutoCitationText"), AutoCitationSortOrder = a.Field<int>("AutoCitationSortOrder") })
                                            .Select(g => g.First())
                                            .OrderBy(a => a.Field<int>("AutoCitationSortOrder"))
                                            .Select(a => a.Field<string>("AutoCitationText")).ToArray();
                        var autoCitationText = string.Join("<br />", autoCitationArray);
                        
                        reportParameterCollection.Add(new ReportParameter("CitedLegends", autoCitationText));
                        break;
                    case "Detail":
                        reportParameterCollection.Add(new ReportParameter("IncludeTJC", searchParams.chkIncludeTJC.ToString()));
                        break;
                }

                reportViewer.LocalReport.SetParameters(reportParameterCollection);


                if (emailInput.To != null)
                {

                    CommonService emailService = new CommonService();
                    int actionTypeId = (int)ActionTypeEnum.CMSComplianceReport;
                    if (emailService.SendReportEmail(emailInput, actionTypeId, emailService.SetRdlcEmail(reportViewer)))
                    {
                        HttpContext.Current.Session["EmailSuccess"] = "true";
                    }
                    else
                    { HttpContext.Current.Session["EmailSuccess"] = "false"; }

                }

            }
            catch (Exception ex)
            {
                if (ex.Message.ToString() != "No Data")
                {
                    ExceptionLog exceptionLog = new ExceptionLog
                    {
                        ExceptionText = "Reports: " + ex.Message,
                        PageName = "CMSComplianceSummary",
                        MethodName = "CMSComplianceSummaryRDLC",
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

        public List<CMSComplianceExcel> GetCMSComplianceExcel(SearchCMSCompliance searchParams)
        {
            var result = new List<CMSComplianceExcel>();

            using (var dbmEntityContainter = new DBMEdition01_Entities())
            {
                result = dbmEntityContainter.GetCMSComplianceExcel(int.Parse(searchParams.SelectedSiteIDs), int.Parse(searchParams.ProgramIDs), searchParams.ComplianceValueList,
                    searchParams.SelectedCoPIDs, searchParams.SelectedTagIDs, searchParams.SelectedIdentifiedByIDs, searchParams.PlanOfCorrection,
                    searchParams.OrgCMSFindings, searchParams.CMSSurveyorFindings, searchParams.LinkedDocs, searchParams.StartDate, searchParams.EndDate,
                    searchParams.StandardEffBeginDate, searchParams.CertificationID, Convert.ToBoolean(searchParams.chkIncludeTJC)).ToList();

            }

            return result;
        }

        private DataSet GetReportDataView(SearchCMSCompliance searchParams, string reportType = "Summary")
        {
            DataSet ds = new DataSet();

            try
            {
                using (SqlConnection cn = new SqlConnection(this.ConnectionString))
                {
                    cn.Open();

                    string spname = string.Empty;

                    if (reportType == "Summary")
                        spname = "cms.usmReportCMSComplianceSummary";
                    else if (reportType == "Detail")
                        spname = "cms.usmReportCMSComplianceDetail";
                    else
                        return null;

                    SqlCommand cmd = new SqlCommand(spname, cn);
                    cmd.CommandTimeout = Convert.ToInt32(ConfigurationManager.AppSettings["SPCmdTimeout"].ToString());
                    cmd.CommandType = System.Data.CommandType.StoredProcedure;

                    cmd.Parameters.AddWithValue("SiteID", searchParams.SelectedSiteIDs);
                    cmd.Parameters.AddWithValue("ProgramID", searchParams.ProgramIDs);
                    cmd.Parameters.AddWithValue("CoPIDs", searchParams.SelectedCoPIDs);
                    cmd.Parameters.AddWithValue("TagIDs", searchParams.SelectedTagIDs);
                    cmd.Parameters.AddWithValue("IdentifiedByIDs", searchParams.SelectedIdentifiedByIDs);
                    cmd.Parameters.AddWithValue("ComplianceValueList", searchParams.ComplianceValueList);
                    cmd.Parameters.AddWithValue("PlanOfCorrection", searchParams.PlanOfCorrection);
                    cmd.Parameters.AddWithValue("OrgCMSFindings", searchParams.OrgCMSFindings);
                    cmd.Parameters.AddWithValue("CMSSurveyorFindings", searchParams.CMSSurveyorFindings);
                    cmd.Parameters.AddWithValue("LinkedDocs", searchParams.LinkedDocs);
                    cmd.Parameters.AddWithValue("StartDate", searchParams.StartDate);
                    cmd.Parameters.AddWithValue("EndDate", searchParams.EndDate);
                    cmd.Parameters.AddWithValue("StandardEffBeginDate", null);
                    cmd.Parameters.AddWithValue("CertificationItemID", null);

                    if (reportType == "Detail" || reportType == "Excel")
                    { cmd.Parameters.AddWithValue("IncludeTJC", searchParams.chkIncludeTJC); }

                    CreateSQLExecuted(spName: spname, cmd: cmd);
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
            int rowsCount = ds.Tables[0].Rows.Count;
            if (rowsCount == 0)
                throw (new Exception("No Data"));


            return ds;
        }
    }
}