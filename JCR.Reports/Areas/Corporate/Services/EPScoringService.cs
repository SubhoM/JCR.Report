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
using JCR.Reports.Models.Enums;

namespace JCR.Reports.Areas.Corporate.Services
{
    public class EPScoringService : BaseService
    {
        ExceptionService _exceptionService = new ExceptionService();
        public ReportViewer EPScoringSummaryRDLC(SearchEPScoringParams searchParams, Email emailInput)
        {
            DateTime? startDate = null;
            DateTime? endDate = null;
            string reportDate = "All Dates";

            SearchFormat searchoutput = new SearchFormat();

            if (searchParams.DateStart != null)
            {
                startDate = searchParams.DateStart;
                if (searchParams.DateEnd != null)
                    reportDate = searchParams.DateStart.Value.ToShortDateString() + " - " + searchParams.DateEnd.Value.ToShortDateString();
                else
                    reportDate = "since " + searchParams.DateStart.Value.ToShortDateString();
            }

            if (searchParams.DateEnd != null)
            {
                endDate = searchParams.DateEnd.Value.Date.AddHours(23).AddMinutes(59).AddSeconds(59);
                if (searchParams.DateStart == null)
                    reportDate = "through " + searchParams.DateEnd.Value.ToShortDateString();
            }

            ReportViewer reportViewer = new ReportViewer();
            reportViewer.ProcessingMode = ProcessingMode.Local;
            reportViewer.SizeToReportContent = true;
            try
            {
                if (AppSession.ReportScheduleID > 0 && searchParams.ReportTitle != null)
                    searchParams.ReportTitle = String.Concat(searchParams.ReportTitle, " - Report ID: ", AppSession.ReportScheduleID);
                else
                    searchParams.ReportTitle = "EP Scoring Report - Summary";

                DataView dvReportResultForEPScoring = new DataView(GetReportDataForSummaryView(searchParams).Tables[0]);
                reportViewer.LocalReport.DisplayName = searchParams.ReportTitle;
                reportViewer.LocalReport.ReportPath = HttpContext.Current.Request.MapPath(HttpContext.Current.Request.ApplicationPath) + @"Areas\Corporate\Reports\rptEP_Scoring_Consolidated_Summary.rdlc";
                reportViewer.LocalReport.DataSources.Add(new ReportDataSource("dsEPScoreConsolidatedSummary", dvReportResultForEPScoring));

                string filterBy = string.Empty;
                if(searchParams.FSA == 1) { filterBy = "\nInclude FSA Eps"; }
                if(searchParams.DocRequired == "Y") { filterBy += "\nDocumentation Required"; }
                if(searchParams.NewChangedEPs == 1) { filterBy += "\nNew Eps"; }

                searchParams.ScoreTypeNameList = string.Empty;
                if (searchParams.ScoreTypeList.Contains("1")) { searchParams.ScoreTypeNameList = "Individual, "; }
                if (searchParams.ScoreTypeList.Contains("2")) { searchParams.ScoreTypeNameList += "Preliminary, "; }
                if (searchParams.ScoreTypeList.Contains("3")) { searchParams.ScoreTypeNameList += "Final"; }

                searchParams.ScoreValueNameList = string.Empty;
                if (searchParams.ScoreValueList.Contains("2")) { searchParams.ScoreValueNameList = "Satisfactory, "; }
                if (searchParams.ScoreValueList.Contains("0")) { searchParams.ScoreValueNameList += "Insufficient, "; }
                if (searchParams.ScoreValueList.Contains("6")) { searchParams.ScoreValueNameList += "Not Applicable, "; }
                if (searchParams.ScoreValueList.Contains("99")) { searchParams.ScoreValueNameList += "Not Scored"; }
                if (searchParams.NotScoredInPeriod == 1) { searchParams.ScoreValueNameList += "Not Scored In Period"; }
               
                ReportParameter p1 = new ReportParameter("ReportTitle", searchParams.ReportTitle);
                ReportParameter p2 = new ReportParameter("Copyright", "© " + DateTime.Now.Year.ToString() + WebConstants.Copyright.ToString());
                ReportParameter p3 = new ReportParameter("ProgramName", searchParams.ProgramName);
                ReportParameter p4 = new ReportParameter("SiteName", searchParams.SiteName);
                ReportParameter p5 = new ReportParameter("ReportDateTitle", DateTime.Now.ToString());
                ReportParameter p6 = new ReportParameter("ChapterNameList", searchParams.ChapterNameList);
                ReportParameter p7 = new ReportParameter("StandardNameList", searchParams.StandardNameList);
                ReportParameter p8 = new ReportParameter("ScoredByNameList", searchParams.ScoredByNameList);
                ReportParameter p9 = new ReportParameter("ScoringPeriod", reportDate);
                if (searchParams.ChapterAll == 1)
                {
                    p6 = new ReportParameter("ChapterNameList", "All");
                }

                if (searchParams.StandardAll == 1)
                {
                    p7 = new ReportParameter("StandardNameList", "All");
                }

                if (searchParams.ScoredByAll == 1)
                {
                    p8 = new ReportParameter("ScoredByNameList", "All");
                }

                ReportParameter p10 = new ReportParameter("ScoreValueNameList", Regex.Replace(searchParams.ScoreValueNameList, ", $", ""));
                ReportParameter p11 = new ReportParameter("ScoreTypeNameList", Regex.Replace(searchParams.ScoreTypeNameList, ", $", ""));
                ReportParameter p12 = new ReportParameter("FilterByList", filterBy == "" ? "None" : filterBy);

                string DocumentationList = string.Empty;
                if(searchParams.OrgFindings == 1) { DocumentationList = "All Organizational Findings\n"; }
                else if(searchParams.OrgFindings == 2) { DocumentationList = "Presence of Organizational Findings\n"; }
                else if (searchParams.OrgFindings == 3) { DocumentationList = "Absence of Organizational Findings\n"; }
                if (searchParams.PlanOfAction == 1) { DocumentationList = DocumentationList + "All Plan of Action\n"; }
                else if (searchParams.PlanOfAction == 2) { DocumentationList = DocumentationList + "Presence of Plan of Action\n"; }
                else if (searchParams.PlanOfAction == 3) { DocumentationList = DocumentationList + "Absence of Plan of Action\n"; }
                if (searchParams.OrgNotes == 1) { DocumentationList = DocumentationList + "All Org Notes\n"; }
                else if (searchParams.OrgNotes == 2) { DocumentationList = DocumentationList + "Presence of Org Notes\n"; }
                else if (searchParams.OrgNotes == 3) { DocumentationList = DocumentationList + "Absence of Org Notes\n"; }
                if (searchParams.LinkedDocs == 1) { DocumentationList = DocumentationList + "All Linked Documents\n"; }
                else if (searchParams.LinkedDocs == 2) { DocumentationList = DocumentationList + "Presence of Linked Documents\n"; }
                else if (searchParams.LinkedDocs == 3) { DocumentationList = DocumentationList + "Absence of Linked Documents"; }

                ReportParameter p13 = new ReportParameter("DocumentationList", DocumentationList);

                ReportParameterCollection reportParameterCollection = new ReportParameterCollection { p1, p2, p3, p4, p5, p6, p7, p8, p9, p10, p11, p12, p13};
                reportViewer.LocalReport.SetParameters(reportParameterCollection);

              
                if (emailInput.To != null)
                {

                    CommonService emailService = new CommonService();
                    int actionTypeId = (int)ActionTypeEnum.EPScoringReport;
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
                        PageName = "EPScoringSummary",
                        MethodName = "EPScoringSummaryRDLC",
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

        private DataSet GetReportDataForSummaryView(SearchEPScoringParams searchParams)
        {
            DataSet ds = new DataSet();
            
            try
            {
                using (SqlConnection cn = new SqlConnection(this.ConnectionString))
                {
                    cn.Open();
                    SqlCommand cmd = new SqlCommand("amp.usmReportGetEpSummary", cn);
                    cmd.CommandTimeout = Convert.ToInt32(ConfigurationManager.AppSettings["SPCmdTimeout"].ToString());
                    cmd.CommandType = System.Data.CommandType.StoredProcedure;

                    cmd.Parameters.AddWithValue("SiteID", searchParams.SiteID);
                    cmd.Parameters.AddWithValue("ProgramID", searchParams.ProgramID);

                    if (searchParams.ChapterList == "-1")
                    { cmd.Parameters.AddWithValue("ChapterList", null); }
                    else
                    { cmd.Parameters.AddWithValue("ChapterList", searchParams.ChapterList); }


                    if (searchParams.StandardList == "-1")
                    { cmd.Parameters.AddWithValue("StandardList", null); }
                    else
                    { cmd.Parameters.AddWithValue("StandardList", searchParams.StandardList); }

                    cmd.Parameters.AddWithValue("ScoreTypeList", searchParams.ScoreTypeList);
                    cmd.Parameters.AddWithValue("ScoreValueList", searchParams.ScoreValueList);

                    if (searchParams.ScoredByList == "-1")
                    { cmd.Parameters.AddWithValue("ScoredByList", null); }
                    else
                    { cmd.Parameters.AddWithValue("ScoredByList", searchParams.ScoredByList); }

                    cmd.Parameters.AddWithValue("NotScoredInPeriodFlag", searchParams.NotScoredInPeriod);

                    cmd.Parameters.AddWithValue("IncludeFSA", searchParams.FSA);
                                        
                    cmd.Parameters.AddWithValue("DocRequired", searchParams.DocRequiredValue);
                    cmd.Parameters.AddWithValue("NewChangedEPs", searchParams.NewChangedEPs);
                    cmd.Parameters.AddWithValue("PlanOfAction", searchParams.PlanOfAction);

                    cmd.Parameters.AddWithValue("OrgFindings", searchParams.OrgFindings);
                    
                    cmd.Parameters.AddWithValue("OrgNotes", searchParams.OrgNotes);
                    cmd.Parameters.AddWithValue("LinkedDocs", searchParams.LinkedDocs);
                    cmd.Parameters.AddWithValue("DateStart", searchParams.DateStart);
                    cmd.Parameters.AddWithValue("DateEnd", searchParams.DateEnd);
                    cmd.Parameters.AddWithValue("StandardEffBeginDate", null);
                    cmd.Parameters.AddWithValue("CertificationItemID", null);

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

        public ReportViewer EPScoringDetailRDLC(SearchEPScoringParams searchParams, Email emailInput)
        {
            DateTime? startDate = null;
            DateTime? endDate = null;
            string reportDate = "All Dates";

            SearchFormat searchoutput = new SearchFormat();

            if (searchParams.DateStart != null)
            {
                startDate = searchParams.DateStart;
                if (searchParams.DateEnd != null)
                    reportDate = searchParams.DateStart.Value.ToShortDateString() + " - " + searchParams.DateEnd.Value.ToShortDateString();
                else
                    reportDate = "since " + searchParams.DateStart.Value.ToShortDateString();
            }

            if (searchParams.DateEnd != null)
            {
                endDate = searchParams.DateEnd.Value.Date.AddHours(23).AddMinutes(59).AddSeconds(59);
                if (searchParams.DateStart == null)
                    reportDate = "through " + searchParams.DateEnd.Value.ToShortDateString();
            }

            ReportViewer reportViewer = new ReportViewer();
            reportViewer.ProcessingMode = ProcessingMode.Local;
            reportViewer.SizeToReportContent = true;
            try
            {
                if (AppSession.ReportScheduleID > 0 && searchParams.ReportTitle != null)
                    searchParams.ReportTitle = String.Concat(searchParams.ReportTitle, " - Report ID: ", AppSession.ReportScheduleID);
                else
                    searchParams.ReportTitle = "EP Scoring Report - Detail";
                DataView dvReportResultForEPScoring = new DataView(GetReportDataForDetailView(searchParams).Tables[0]);
                reportViewer.LocalReport.DisplayName = searchParams.ReportTitle;
                reportViewer.LocalReport.ReportPath = HttpContext.Current.Request.MapPath(HttpContext.Current.Request.ApplicationPath) + @"Areas\Corporate\Reports\rptEP_Scoring_Consolidated_Detail.rdlc";
                reportViewer.LocalReport.DataSources.Add(new ReportDataSource("dsEPScoreConsolidatedDetail", dvReportResultForEPScoring));

                string filterBy = string.Empty;
                if (searchParams.FSA == 1) { filterBy = "\nInclude FSA Eps"; }
                if (searchParams.DocRequired == "Y") { filterBy += "\nDocumentation Required"; }
                if (searchParams.NewChangedEPs == 1) { filterBy += "\nNew Eps"; }

                searchParams.ScoreTypeNameList = string.Empty;
                if (searchParams.ScoreTypeList.Contains("1")) { searchParams.ScoreTypeNameList = "Individual, "; }
                if (searchParams.ScoreTypeList.Contains("2")) { searchParams.ScoreTypeNameList += "Preliminary, "; }
                if (searchParams.ScoreTypeList.Contains("3")) { searchParams.ScoreTypeNameList += "Final"; }

                searchParams.ScoreValueNameList = string.Empty;
                if (searchParams.ScoreValueList.Contains("2")) { searchParams.ScoreValueNameList = "Satisfactory, "; }
                if (searchParams.ScoreValueList.Contains("0")) { searchParams.ScoreValueNameList += "Insufficient, "; }
                if (searchParams.ScoreValueList.Contains("6")) { searchParams.ScoreValueNameList += "Not Applicable, "; }
                if (searchParams.ScoreValueList.Contains("99")) { searchParams.ScoreValueNameList += "Not Scored"; }
                if (searchParams.NotScoredInPeriod == 1) { searchParams.ScoreValueNameList += "Not Scored In Period"; }

                ReportParameter p1 = new ReportParameter("ReportTitle", searchParams.ReportTitle);
                ReportParameter p2 = new ReportParameter("Copyright", "© " + DateTime.Now.Year.ToString() + WebConstants.Copyright.ToString());
                ReportParameter p3 = new ReportParameter("ProgramName", searchParams.ProgramName);
                ReportParameter p4 = new ReportParameter("SiteName", searchParams.SiteName);
                ReportParameter p5 = new ReportParameter("ReportDateTitle", DateTime.Now.ToString());
                ReportParameter p6 = new ReportParameter("ChapterNameList", searchParams.ChapterNameList);
                ReportParameter p7 = new ReportParameter("StandardNameList", searchParams.StandardNameList);
                ReportParameter p8 = new ReportParameter("ScoredByNameList", searchParams.ScoredByNameList);
                ReportParameter p9 = new ReportParameter("ScoringPeriod", reportDate);
                if (searchParams.ChapterAll == 1)
                {
                    p6 = new ReportParameter("ChapterNameList", "All");
                }

                if (searchParams.StandardAll == 1)
                {
                    p7 = new ReportParameter("StandardNameList", "All");
                }

                if (searchParams.ScoredByAll == 1)
                {
                    p8 = new ReportParameter("ScoredByNameList", "All");
                }

                ReportParameter p10 = new ReportParameter("ScoreValueNameList", Regex.Replace(searchParams.ScoreValueNameList, ", $", ""));
                ReportParameter p11 = new ReportParameter("ScoreTypeNameList", Regex.Replace(searchParams.ScoreTypeNameList, ", $", ""));
                ReportParameter p12 = new ReportParameter("FilterByList", filterBy == "" ? "None" : filterBy);

                string DocumentationList = string.Empty;
                if (searchParams.OrgFindings == 1) { DocumentationList = "All Organizational Findings\n"; }
                else if (searchParams.OrgFindings == 2) { DocumentationList = "Presence of Organizational Findings\n"; }
                else if (searchParams.OrgFindings == 3) { DocumentationList = "Absence of Organizational Findings\n"; }
                if (searchParams.PlanOfAction == 1) { DocumentationList = DocumentationList + "All Plan of Action\n"; }
                else if (searchParams.PlanOfAction == 2) { DocumentationList = DocumentationList + "Presence of Plan of Action\n"; }
                else if (searchParams.PlanOfAction == 3) { DocumentationList = DocumentationList + "Absence of Plan of Action\n"; }
                if (searchParams.OrgNotes == 1) { DocumentationList = DocumentationList + "All Internal Org Notes\n"; }
                else if (searchParams.OrgNotes == 2) { DocumentationList = DocumentationList + "Presence of Internal Org Notes\n"; }
                else if (searchParams.OrgNotes == 3) { DocumentationList = DocumentationList + "Absence of Internal Org Notes\n"; }
                if (searchParams.LinkedDocs == 1) { DocumentationList = DocumentationList + "All Linked Documents\n"; }
                else if (searchParams.LinkedDocs == 2) { DocumentationList = DocumentationList + "Presence of Linked Documents\n"; }
                else if (searchParams.LinkedDocs == 3) { DocumentationList = DocumentationList + "Absence of Linked Documents"; }

                ReportParameter p13 = new ReportParameter("DocumentationList", DocumentationList);
                ReportParameter p14 = new ReportParameter("ProgramID", searchParams.ProgramID.ToString());
                ReportParameter p15 = new ReportParameter("IncludeCMS", searchParams.chkIncludeCMS.ToString());

                ReportParameterCollection reportParameterCollection = new ReportParameterCollection { p1, p2, p3, p4, p5, p6, p7, p8, p9, p10, p11, p12, p12, p13, p14, p15 };
                reportViewer.LocalReport.SetParameters(reportParameterCollection);

                if (emailInput.To != null)
                {

                    CommonService emailService = new CommonService();
                    int actionTypeId = (int)ActionTypeEnum.EPScoringReport;
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
                        PageName = "EPScoringReportDetail",
                        MethodName = "EPScoringDetailRDLC",
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
        private DataSet GetReportDataForDetailView(SearchEPScoringParams searchParams)
        {
            DataSet ds = new DataSet();
            try
            {
                using (SqlConnection cn = new SqlConnection(this.ConnectionString))
                {
                    cn.Open();
                    SqlCommand cmd = new SqlCommand("amp.usmReportEPScoringDetail", cn);
                    cmd.CommandTimeout = Convert.ToInt32(ConfigurationManager.AppSettings["SPCmdTimeout"].ToString());
                    cmd.CommandType = System.Data.CommandType.StoredProcedure;

                    cmd.Parameters.AddWithValue("SiteID", searchParams.SiteID);
                    cmd.Parameters.AddWithValue("ProgramID", searchParams.ProgramID);
                    if(searchParams.ChapterList == "-1")
                    { cmd.Parameters.AddWithValue("ChapterList", null); }
                    else
                    { cmd.Parameters.AddWithValue("ChapterList", searchParams.ChapterList); }
                    
                    if(searchParams.StandardList == "-1")
                    { cmd.Parameters.AddWithValue("StandardList", null); }
                    else
                    { cmd.Parameters.AddWithValue("StandardList", searchParams.StandardList); }
                    

                    cmd.Parameters.AddWithValue("ScoreTypeList", searchParams.ScoreTypeList);
                    cmd.Parameters.AddWithValue("ScoreValueList", searchParams.ScoreValueList);

                    if (searchParams.ScoredByList == "-1")
                    { cmd.Parameters.AddWithValue("ScoredByList", null); }
                    else
                    { cmd.Parameters.AddWithValue("ScoredByList", searchParams.ScoredByList); }
                    cmd.Parameters.AddWithValue("NotScoredInPeriodFlag", searchParams.NotScoredInPeriod);
                    cmd.Parameters.AddWithValue("IncludeFSA", searchParams.FSA);

                    cmd.Parameters.AddWithValue("DocRequired", searchParams.DocRequiredValue);
                    cmd.Parameters.AddWithValue("NewChangedEPs", searchParams.NewChangedEPs);
                    
                    cmd.Parameters.AddWithValue("PlanOfAction", searchParams.PlanOfAction);
                    cmd.Parameters.AddWithValue("OrgFindings", searchParams.OrgFindings);

                    cmd.Parameters.AddWithValue("OrgNotes", searchParams.OrgNotes);
                    cmd.Parameters.AddWithValue("LinkedDocs", searchParams.LinkedDocs);
                    cmd.Parameters.AddWithValue("DateStart", searchParams.DateStart);
                    cmd.Parameters.AddWithValue("DateEnd", searchParams.DateEnd);
                    cmd.Parameters.AddWithValue("StandardEffBeginDate", null);
                    cmd.Parameters.AddWithValue("CertificationItemID", null);
                    cmd.Parameters.AddWithValue("IncludeCMS", searchParams.chkIncludeCMS);
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
            {
                throw (new Exception("No Data"));
            }
            

            return ds;
        }

    }

    
}