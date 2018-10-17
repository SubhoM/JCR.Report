using JCR.Reports.Common;
using JCR.Reports.Models;
using JCR.Reports.Services;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using System.Web;
using Microsoft.Reporting.WebForms;
using JCR.Reports.ViewModels;
using JCR.Reports.Areas.Corporate.ViewModels;
using JCR.Reports.Models.Enums;
using Kendo.Mvc.UI;
using Kendo.Mvc.Extensions;

namespace JCR.Reports.Areas.Corporate.Services
{
    public class TaskReport : BaseService
    {
        ExceptionService _exceptionService = new ExceptionService();
        public List<AssignedUser> GetUserDetails(string selectedSiteIDs,int askID)
        {
            var list = new List<AssignedUser>();
            DataSet ds = new DataSet();
            DataTable dt = new DataTable();
            try
            {
                using (SqlConnection cn = new SqlConnection(ConfigurationManager.ConnectionStrings["DBMEdition01"].ToString()))
                {
                    cn.Open();

                    SqlCommand cmd = new SqlCommand("amp.usmGetTaskUsersBySite", cn);
                    cmd.CommandType = System.Data.CommandType.StoredProcedure;
                    cmd.Parameters.AddWithValue("@selectedSiteIDs", selectedSiteIDs);
                    cmd.Parameters.AddWithValue("@askID", askID);


                    SqlDataAdapter da = new SqlDataAdapter(cmd);

                    using (cn)
                    using (cmd)
                    using (da)
                    {
                        da.Fill(ds);
                    }
                }
                dt = ds.Tables[0];

                if (dt.Rows.Count > 0)
                {
                    list = dt.ToList<AssignedUser>();
                    list.Insert(0, new AssignedUser
                    {
                        UserID = Convert.ToInt32(-1),
                        FullName = "All",


                    });
                }
                else
                {
                    list.Insert(0, new AssignedUser
                    {
                        UserID = Convert.ToInt32(-1),
                        FullName = "All",

                    });
                }


            }
            catch (Exception ex)
            {
                ex.Data.Add(TSQL, _SQLExecuted);
                throw ex;
            }

            return list;
        }


        public SearchList GetOrgnizationTypeList(SearchList searchlist, Search search, int selectedSiteID, int selectedProgramID)
        {
            SearchInputService searchService = new SearchInputService();
            searchlist = searchService.GetOrgnizationTypeList(searchlist, search, selectedSiteID, selectedProgramID);

            return searchlist;
        }
        public ReportViewer TaskReportRDLC(SearchTaskReport searchParams, Email emailInput, string reportType)
        {
            string reportDueDate = "All Dates";
            string reportAssignDate = "All Dates";

            SearchFormat searchoutput = new SearchFormat();

            if (searchParams.DueFromDate != null)
            {
                if (searchParams.DueToDate != null)
                    reportDueDate = searchParams.DueFromDate.Value.ToShortDateString() + " - " + searchParams.DueToDate.Value.ToShortDateString();
                else
                    reportDueDate = "since " + searchParams.DueFromDate.Value.ToShortDateString();
            }
            if (searchParams.DueToDate != null)
            {
                if (searchParams.DueFromDate == null)
                    reportDueDate = "through " + searchParams.DueToDate.Value.ToShortDateString();
            }
            if (searchParams.AssignFromDate != null)
            {
                if (searchParams.AssignToDate != null)
                    reportAssignDate = searchParams.AssignFromDate.Value.ToShortDateString() + " - " + searchParams.AssignToDate.Value.ToShortDateString();
                else
                    reportAssignDate = "since " + searchParams.AssignFromDate.Value.ToShortDateString();
            }
            if (searchParams.AssignToDate != null)
            {
                if (searchParams.AssignFromDate == null)
                    reportAssignDate = "through " + searchParams.AssignToDate.Value.ToShortDateString();
            }

            ReportViewer reportViewer = new ReportViewer();
            reportViewer.ProcessingMode = ProcessingMode.Local;
            reportViewer.SizeToReportContent = true;
            try
            {
                if (AppSession.ReportScheduleID > 0 && searchParams.ReportTitle != null)
                    searchParams.ReportTitle = String.Concat(searchParams.ReportTitle, " - Report ID: ", AppSession.ReportScheduleID);
                else
                    searchParams.ReportTitle = reportType == "Summary" ? "Task Report - Summary" : "Task Report - Detail";
                
                string rdlcfilename = reportType == "Summary" ? "rptTaskReportSummary.rdlc" : "rptTaskReportDetail.rdlc";
                string dsName = "dsTaskReport";
                DataView dvTaskReport = new DataView(TaskReportData(searchParams).Tables[0]);
                reportViewer.LocalReport.DisplayName = searchParams.ReportTitle;
                reportViewer.LocalReport.ReportPath = HttpContext.Current.Request.MapPath(HttpContext.Current.Request.ApplicationPath) + @"Areas\Corporate\Reports\" + rdlcfilename;

                reportViewer.LocalReport.DataSources.Add(new ReportDataSource(dsName, dvTaskReport));
                
                ReportParameter p1 = new ReportParameter("ReportTitle", searchParams.ReportTitle);
                ReportParameter p2 = new ReportParameter("Copyright", "© " + DateTime.Now.Year.ToString() + WebConstants.Copyright.ToString());
                ReportParameter p3 = new ReportParameter("ProgramName", AppSession.SelectedProgramName);
                ReportParameter p4 = new ReportParameter("SiteName", searchParams.SelectedSiteNames);
                ReportParameter p5 = new ReportParameter("ReportDateTitle", DateTime.Now.ToString());
                ReportParameter p6 = new ReportParameter("Status", searchParams.SelectedTaskStatusNames);
                ReportParameter p7 = new ReportParameter("AssignedToNames", searchParams.SelectedAssignedToNames);
                ReportParameter p8 = new ReportParameter("AssignedByNames", searchParams.SelectedAssignedByNames);
                ReportParameter p9 = new ReportParameter("EmailCcedToName", searchParams.SelectedEmailCcedNames);
                ReportParameter p10 = new ReportParameter("DueDate", reportDueDate);
                ReportParameter p11 = new ReportParameter("AssignDate", reportAssignDate);

                ReportParameterCollection reportParameterCollection = new ReportParameterCollection { p1, p2, p3, p4, p5, p6, p7, p8, p9, p10, p11 };

                if(reportType != "Summary")
                {
                    ReportParameter p12 = new ReportParameter("OrgType3Header", AppSession.OrgRanking3Name.ToString());
                    ReportParameter p13 = new ReportParameter("OrgType2Header", AppSession.OrgRanking2Name.ToString());
                    ReportParameter p14 = new ReportParameter("OrgType1Header", AppSession.OrgRanking1Name.ToString());
                    reportParameterCollection.Add(p12);
                    reportParameterCollection.Add(p13);
                    reportParameterCollection.Add(p14);
                }

                reportViewer.LocalReport.SetParameters(reportParameterCollection);

                if (emailInput.To != null)
                {

                    CommonService emailService = new CommonService();
                    int actionTypeId = (int)ActionTypeEnum.TaskReport;
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
                        PageName = "TaskReport",
                        MethodName = "TaskReportRDLC",
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
        public DataSourceResult _taskReportExcel([DataSourceRequest]DataSourceRequest request, SearchTaskReport search)
        {
            DataSourceResult result = new DataSourceResult();
            try
            {
               
                List<TaskReportExcelView> TaskReportExcelList = new List<TaskReportExcelView>();
                DataTable dt = new DataTable();

                dt = TaskReportData(search).Tables[0];

                TaskReportExcelList = dt.ToList<TaskReportExcelView>();
                
                result = TaskReportExcelList.ToDataSourceResult(request, cqc => new TaskReportExcelView
                {
                    StatusName = cqc.StatusName,
                    TaskID = cqc.TaskID,
                    TaskName = cqc.TaskName,
                    TaskDescription = cqc.TaskDescription,
                    AssignedBy = cqc.AssignedBy,
                    AssignedTo = cqc.AssignedTo,
                    CcedTo = cqc.CcedTo,
                    AssignedDate = cqc.AssignedDate,
                    DueDate = cqc.DueDate,
                    CompleteDate = cqc.CompleteDate,
                    TaskResolution = cqc.TaskResolution,
                    StandardEp = cqc.StandardEp.ReplaceNewline(),
                    CmsStandard = cqc.CmsStandard,
                    TracerCustomName = cqc.TracerCustomName,
                    QuestionText = cqc.QuestionText.ReplaceNewline(),
                    Observation = cqc.Observation.ReplaceNewline(),
                    OrgName_Rank3 = cqc.OrgName_Rank3,
                    OrgName_Rank2 = cqc.OrgName_Rank2,
                    OrgName_Rank1_Dept = cqc.OrgName_Rank1_Dept
                });
            }
            catch (Exception ex)
            {
                if (ex.Message.ToString() == "No Data")
                {
                    result.Errors = WebConstants.NO_DATA_FOUND_TASK_REPORT;
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

        private DataSet TaskReportData(SearchTaskReport search)
        {
            DataSet ds = new DataSet();
            string spName = String.Empty;
         
            search.OrgTypeLevel1IDs = (search.OrgTypeLevel1IDs != null && search.OrgTypeLevel1IDs != "-1") ? search.OrgTypeLevel1IDs : "";
            search.OrgTypeLevel2IDs = (search.OrgTypeLevel2IDs != null && search.OrgTypeLevel2IDs != "-1") ? search.OrgTypeLevel2IDs : "";
            search.OrgTypeLevel3IDs = (search.OrgTypeLevel3IDs != null && search.OrgTypeLevel3IDs != "-1") ? search.OrgTypeLevel3IDs : "";
            search.TracerListIDs = (search.TracerListIDs != null && search.TracerListIDs != "-1") ? search.TracerListIDs : "";
            search.SelectedChapterIDs = (search.SelectedChapterIDs != null && search.SelectedChapterIDs != "-1") ? search.SelectedChapterIDs : "";
            search.SelectedCoPIDs = (search.SelectedCoPIDs != null && search.SelectedCoPIDs != "-1") ? search.SelectedCoPIDs : "";
            search.SelectedEPIDs = (search.SelectedEPIDs != null && search.SelectedEPIDs != "-1") ? search.SelectedEPIDs : "";
            search.SelectedTagIDs = (search.SelectedTagIDs != null && search.SelectedTagIDs != "-1") ? search.SelectedTagIDs : "";
            search.SelectedStandardIDs = (search.SelectedStandardIDs != null && search.SelectedStandardIDs != "-1") ? search.SelectedStandardIDs : "";
            search.SelectedAssignedByIDs = (search.SelectedAssignedByIDs != null && search.SelectedAssignedByIDs != "-1") ? search.SelectedAssignedByIDs : "";
            search.SelectedAssignedToIDs = (search.SelectedAssignedToIDs != null && search.SelectedAssignedToIDs != "-1") ? search.SelectedAssignedToIDs : "";
            search.SelectedEmailCcedIds = (search.SelectedEmailCcedIds != null && search.SelectedEmailCcedIds != "-1") ? search.SelectedEmailCcedIds : "";
            search.DueToDate = (search.DueToDate != null && search.DueToDate.ToString() != "") ? search.DueToDate.Value.Date.AddHours(23).AddMinutes(29).AddSeconds(59) : search.DueToDate;
            search.AssignToDate = (search.AssignToDate != null && search.AssignToDate.ToString() != "") ? search.AssignToDate.Value.Date.AddHours(23).AddMinutes(29).AddSeconds(59) : search.AssignToDate;
            search.SelectedTaskStatusIDs = (search.SelectedTaskStatusIDs != null && search.SelectedTaskStatusIDs != "-1") ? search.SelectedTaskStatusIDs : "";
            try
            {
                using (SqlConnection cn = new SqlConnection(this.ConnectionString))
                {
                    cn.Open();
                    SqlCommand cmd;

                    spName = "ustReport_TaskReport";
                    cmd = new SqlCommand(spName, cn);
                    cmd.CommandTimeout = 900;//Convert.ToInt32(ConfigurationManager.AppSettings["SPCmdTimeout"].ToString());

                    cmd.CommandType = System.Data.CommandType.StoredProcedure;
                    cmd.Parameters.AddWithValue("SiteID", search.SelectedSiteIDs);
                    cmd.Parameters.AddWithValue("ProgramID", AppSession.SelectedProgramId);
                    cmd.Parameters.AddWithValue("OrgIDs_Rank3", search.OrgTypeLevel3IDs);
                    cmd.Parameters.AddWithValue("OrgIDs_Rank2", search.OrgTypeLevel2IDs);
                    cmd.Parameters.AddWithValue("OrgIDs_Rank1_Depts", search.OrgTypeLevel1IDs);
                    cmd.Parameters.AddWithValue("CycleID", AppSession.CycleID);
                    cmd.Parameters.AddWithValue("DueFrom", search.DueFromDate);
                    cmd.Parameters.AddWithValue("DueTo", search.DueToDate);
                    cmd.Parameters.AddWithValue("AssignFrom", search.AssignFromDate);
                    cmd.Parameters.AddWithValue("AssignTo", search.AssignToDate);
                    cmd.Parameters.AddWithValue("StatusIds", search.SelectedTaskStatusIDs);
                    cmd.Parameters.AddWithValue("AssignedToIds", search.SelectedAssignedToIDs);
                    cmd.Parameters.AddWithValue("AssignedByIds", search.SelectedAssignedByIDs);
                    cmd.Parameters.AddWithValue("EmailCcedIds", search.SelectedEmailCcedIds);
                    cmd.Parameters.AddWithValue("TracerIDs", search.TracerListIDs);
                    cmd.Parameters.AddWithValue("ChapterIds", search.SelectedChapterIDs);
                    cmd.Parameters.AddWithValue("StandardIds", search.SelectedStandardIDs);
                    cmd.Parameters.AddWithValue("EpIds", search.SelectedEPIDs);
                    cmd.Parameters.AddWithValue("CopIds", search.SelectedCoPIDs);
                    cmd.Parameters.AddWithValue("TagIds", search.SelectedTagIDs);
                    cmd.Parameters.AddWithValue("IncludePastDue", search.IncludePastDue==true?1:0);

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

        public List<Tracers> SelectAllTaskTracers(int siteid, int programid)
        {
            var list = new List<Tracers>();
            
            DataSet ds = new DataSet();
            DataTable dt = new DataTable();
            try
            {
                using (SqlConnection cn = new SqlConnection(this.ConnectionString))
                {
                    cn.Open();
                    SqlCommand cmd = new SqlCommand("ustReport_SelectTaskTracers", cn);
                    cmd.CommandTimeout = Convert.ToInt32(ConfigurationManager.AppSettings["SPCmdTimeout"].ToString());
                    cmd.CommandType = System.Data.CommandType.StoredProcedure;
                    cmd.Parameters.AddWithValue("@SiteID", siteid);
                    cmd.Parameters.AddWithValue("@ProgramID", programid);
                    SqlDataAdapter da = new SqlDataAdapter(cmd);

                #if DEBUG
                    CreateSQLExecuted("ustReport_SelectTracers", cmd);
                    System.Diagnostics.Debug.WriteLine(_SQLExecuted);
                #endif

                    using (cn)
                    using (cmd)
                    using (da)
                    {
                        da.Fill(ds);
                    }
                }
                dt = ds.Tables[0];
                if (dt.Rows.Count > 0)
                {
                    list = dt.ToList<Tracers>();
                    list.Insert(0, new Tracers
                    {
                        TracerCustomID = Convert.ToInt32(-1),
                        TracerCustomName = "All",

                    });
                }
                else
                {
                    list.Insert(0, new Tracers
                    {
                        TracerCustomID = Convert.ToInt32(-1),
                        TracerCustomName = "All",

                    });
                }
            }
            catch (Exception ex)
            {
                ex.Data.Add(TSQL, _SQLExecuted);
                throw ex;
            }

            return list;
        }
    }
}