﻿using System;
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
using System.Collections.Generic;
using System.Text.RegularExpressions;
using JCR.Reports.Models.Enums;
using JCR.Reports.Areas.Corporate.ViewModels;

namespace JCR.Reports.Areas.Corporate.Services
{
    public class EPNotScoredInPeriod : BaseService
    {
        ExceptionService _exceptionService = new ExceptionService();
        public ReportViewer EPNotScoredInPeriodRDLC(SearchEPNotScoredInPeriodParams searchParams, Email emailInput, string reportType = "Summary")
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
                {
                    if (reportType == "Summary")
                        searchParams.ReportTitle = "EPs Not Scored in Period - Summary";
                    else
                        searchParams.ReportTitle = "EPs Not Scored in Period - Detail";
                }

                string rdlcfilename = string.Empty;
                string dsName = string.Empty;

                if (reportType == "Summary")
                {
                    rdlcfilename = "rptEP_Not_Scored_In_Period_Summary.rdlc";
                    dsName = "dsEPNotScoredInPeriodSummaryView";
                }

                else
                {
                    rdlcfilename = "rptEP_Not_Scored_In_Period_Detail.rdlc";
                    dsName = "dsEPNotScoredInPeriodDetail";
                }

                DataView dvReportResultForEPScoring = new DataView(GetReportDataView(searchParams, reportType).Tables[0]);
                reportViewer.LocalReport.DisplayName = searchParams.ReportTitle;
                reportViewer.LocalReport.ReportPath = HttpContext.Current.Request.MapPath(HttpContext.Current.Request.ApplicationPath) + @"Areas\Corporate\Reports\" + rdlcfilename;

                if (searchParams.ScoreType == 3)//for Final View Type
                {
                    reportViewer.LocalReport.DataSources.Add(new ReportDataSource(dsName, new DataView()));
                    reportViewer.LocalReport.DataSources.Add(new ReportDataSource(dsName + "_Final", dvReportResultForEPScoring));
                }
                else
                {
                    reportViewer.LocalReport.DataSources.Add(new ReportDataSource(dsName, dvReportResultForEPScoring));
                    reportViewer.LocalReport.DataSources.Add(new ReportDataSource(dsName + "_Final", new DataView()));
                }
                
                string filterBy = string.Empty;
                if (searchParams.FSA == 1) { filterBy = "\nInclude FSA Eps"; }
                if (searchParams.DocRequiredValue == 1) { filterBy += "\nDocumentation Required"; }
                if (searchParams.NewChangedEPs == 1) { filterBy += "\nNew Eps"; }

                searchParams.ScoreTypeNameList = string.Empty;
                if (searchParams.ScoreType == 1) { searchParams.ScoreTypeNameList = "Individual"; }
                if (searchParams.ScoreType == 2) { searchParams.ScoreTypeNameList = "Preliminary"; }
                if (searchParams.ScoreType == 3) { searchParams.ScoreTypeNameList = "Final"; }

                ReportParameter p1 = new ReportParameter("ReportTitle", searchParams.ReportTitle);
                ReportParameter p2 = new ReportParameter("Copyright", "© " + DateTime.Now.Year.ToString() + WebConstants.Copyright.ToString());
                ReportParameter p3 = new ReportParameter("ProgramName", searchParams.ProgramName);
                ReportParameter p4 = new ReportParameter("SiteName", searchParams.SiteName);
                ReportParameter p5 = new ReportParameter("ReportDateTitle", DateTime.Now.ToString());
                ReportParameter p6 = new ReportParameter("ChapterNameList", searchParams.ChapterNameList);
                ReportParameter p7 = new ReportParameter("StandardNameList", searchParams.StandardNameList);
                ReportParameter p9 = new ReportParameter("ScoreDateRange", reportDate);
                ReportParameter p11 = new ReportParameter("ScoreTypeNameList", Regex.Replace(searchParams.ScoreTypeNameList, ", $", ""));
                ReportParameter p12 = new ReportParameter("FilterByList", filterBy == "" ? "None" : filterBy);

                string DocumentationList = string.Empty;
                if (searchParams.OrgFindings == 1) { DocumentationList = "All Organizational Findings\n"; }
                else if (searchParams.OrgFindings == 2) { DocumentationList = "Presence of Organizational Findings\n"; }
                else if (searchParams.OrgFindings == 3) { DocumentationList = "Absence of Organizational Findings\n"; }
                if (searchParams.PlanOfAction == 1) { DocumentationList = DocumentationList + "All Plan of Action\n"; }
                else if (searchParams.PlanOfAction == 2) { DocumentationList = DocumentationList + "Presence of Plan of Action\n"; }
                else if (searchParams.PlanOfAction == 3) { DocumentationList = DocumentationList + "Absence of Plan of Action\n"; }
                if (searchParams.OrgNotes == 1) { DocumentationList = DocumentationList + "All Internal Notes\n"; }
                else if (searchParams.OrgNotes == 2) { DocumentationList = DocumentationList + "Presence of Internal Notes\n"; }
                else if (searchParams.OrgNotes == 3) { DocumentationList = DocumentationList + "Absence of Internal Notes\n"; }
                if (searchParams.LinkedDocs == 1) { DocumentationList = DocumentationList + "All Linked Documents\n"; }
                else if (searchParams.LinkedDocs == 2) { DocumentationList = DocumentationList + "Presence of Linked Documents\n"; }
                else if (searchParams.LinkedDocs == 3) { DocumentationList = DocumentationList + "Absence of Linked Documents"; }

                ReportParameter p13 = new ReportParameter("DocumentationList", DocumentationList);
                ReportParameter p15 = new ReportParameter("ProgramID", searchParams.ProgramID.ToString());
                ReportParameter p16 = new ReportParameter("IncludeCMS", searchParams.chkIncludeCMS.ToString());

                ReportParameterCollection reportParameterCollection = new ReportParameterCollection { p1, p2, p3, p4, p5, p6, p7, p9, p11, p12, p13, p15, p16 };

                reportParameterCollection.Add(new ReportParameter("ScoreType", searchParams.ScoreType.ToString()));
                reportViewer.LocalReport.SetParameters(reportParameterCollection);

                if (emailInput.To != null)
                {

                    CommonService emailService = new CommonService();
                    int actionTypeId = (int)ActionTypeEnum.EPAssignmentReport;
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
                        ExceptionText = "Reports: " + ex.Message + ";" + ex.InnerException.Message,
                        PageName = "EPNotScoredInPeriodSummary",
                        MethodName = "EPNotScoredInPeriodSummaryRDLC",
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

        public List<EPNotScoredInPeriodExcel> GetEPNotScoredInPeriodExcel(SearchEPNotScoredInPeriodParams search)
        {
            var GetEPNotScoredInPeriodData = new List<EPNotScoredInPeriodExcel>();
            GetEPNotScoredInPeriodData = GetReportDataView(search, "Excel").Tables[0].ToList<EPNotScoredInPeriodExcel>();
            GetEPNotScoredInPeriodData.ForEach(a => a.CoPHTML = string.IsNullOrEmpty(a.CoPHTML) == false ? a.CoPHTML.Replace("&lt;", "<").Replace("&gt;", ">") : null);
            GetEPNotScoredInPeriodData.ForEach(a => a.CoPExcel = string.IsNullOrEmpty(a.CoPExcel) == false ? a.CoPExcel.Trim().TrimEnd(';') : null);

            return GetEPNotScoredInPeriodData;
        }

        private DataSet GetReportDataView(SearchEPNotScoredInPeriodParams searchParams, string reportType = "Summary")
        {
            DataSet ds = new DataSet();

            try
            {
                using (SqlConnection cn = new SqlConnection(this.ConnectionString))
                {
                    cn.Open();

                    string spname = string.Empty;

                    if (reportType == "Summary")
                        spname = "amp.usmReportEPNotScoredInPeriodSummary";
                    else if (reportType == "Detail")
                        spname = "amp.usmReportEPNotScoredInPeriodDetail";
                    else
                        spname = "amp.usmReportEPNotScoredInPeriodExcel";

                    SqlCommand cmd = new SqlCommand(spname, cn);
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

                    cmd.Parameters.AddWithValue("ScoreType", searchParams.ScoreType);
                    
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
                    if (reportType == "Detail" || reportType == "Excel")
                    { cmd.Parameters.AddWithValue("IncludeCMS", searchParams.chkIncludeCMS); }
#if DEBUG
                    CreateSQLExecuted(spname, cmd);
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