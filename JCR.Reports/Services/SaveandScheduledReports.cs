using System;
using System.Collections.Generic;
using System.Linq;
using Kendo.Mvc.UI;
using JCR.Reports.Models;
using JCR.Reports.ViewModels;
using System.Data;
using System.Data.SqlClient;
using JCR.Reports.Common;
using Kendo.Mvc.Extensions;
using System.Configuration;

namespace JCR.Reports.Services
{
    public class SaveandScheduledReports : BaseService
    {
        ExceptionService _exceptionService = new ExceptionService();
        public DataSourceResult _saveandscheduledReportsExcel([DataSourceRequest]DataSourceRequest request, SearchSavedReportsInput search, int EProductID = 1 )
        {
            DataSourceResult result = new DataSourceResult();
            try
            {
                //System.Diagnostics.Debug.WriteLine("EProductID:" + EProductID);
                //System.Diagnostics.Debug.WriteLine("AppSession.LinkType:" + AppSession.LinkType);
                //System.Diagnostics.Debug.WriteLine("AppSession.PageID:" + AppSession.PageID);

                List<SaveandScheduledDetails> SaveandScheduledDetailsList = new List<SaveandScheduledDetails>();
                DataTable dt = new DataTable();

                if (EProductID == (int)WebConstants.ProductID.TracerER || AppSession.LinkType == (int)WebConstants.LinkType.AMPCorporateReports || AppSession.LinkType == (int)WebConstants.LinkType.AmpHome)
                {
                    List<int> siteIDList = new List<int>();

                    int eProductId;
                    int ERReportCategoryID;
                    if (AppSession.LinkType == (int)WebConstants.LinkType.AMPCorporateReports || AppSession.LinkType == (int)WebConstants.LinkType.AmpHome)
                    {
                        // Mark Orlando: It appears AMP Reports should go through here.
                        siteIDList = AppSession.Sites.Select(m => m.SiteID).ToList();
                        eProductId = (int)WebConstants.ProductID.AMP;
                        ERReportCategoryID = (int)WebConstants.ReportCategoryID.AMP;
                    } else {
                        // M.Orlando 09/27/2017: Updated for TEN
                        siteIDList = AppSession.Sites.Where(m => m.RoleID.In((int) (WebConstants.Role.ProgramAdministrator),
                                                                             (int) (WebConstants.Role.MockSurveyUser),
                                                                             (int) (WebConstants.Role.MockSurveyReviewer))).Select(m => m.SiteID).ToList();
                        eProductId = (int)WebConstants.ProductID.TracerER;
                        ERReportCategoryID = (int)WebConstants.ReportCategoryID.TracerER;
                    }
                    // Mark Orlando: Requests to get ER Tracer Reports runs here and executes SP ustReport_GetSavedandScheduledERReports.
                    dt = ERSearchSaveandScheduleddataset(string.Join(",", siteIDList.ToArray()), search.SearchSelectedSites == null ? string.Join(",", siteIDList.ToArray()) : search.SearchSelectedSites,eProductId, ERReportCategoryID).Tables[0];
                } else {
                    // Mark Orlando: Requests to get Tracer Reports runs here and executes SP ustReport_GetSavedandScheduledReports.
                    dt = SaveandScheduleddataset(EProductID).Tables[0];
                }
                SaveandScheduledDetailsList = dt.ToList<SaveandScheduledDetails>();

                // to do filter data
                if (search.MyReportsView)
                {
                    SaveandScheduledDetailsList = SaveandScheduledDetailsList.Where(s => s.UserID == AppSession.UserID).ToList();
                }
                else
                {
                    if (search.ReportUserScheduleID > 0)
                    {

                        SaveandScheduledDetailsList = SaveandScheduledDetailsList.Where(s => s.ERReportUserScheduleID == search.ReportUserScheduleID).ToList();
                    }
                    else if (search.ERMyReportIDs != null && search.ERMyReportIDs != "-1" && search.ERMyReportIDs != "")
                    {
                        SaveandScheduledDetailsList = SaveandScheduledDetailsList.Where(s => GetSearchIds(search.ERMyReportIDs)
                                .Contains(s.ERReportUserScheduleID.ToString()))
                                .ToList();
                    }
                    else
                    {
                        search.CreatedByIDs = (search.CreatedByIDs != null && search.CreatedByIDs != "-1") ? search.CreatedByIDs : "";
                        search.ERReportIDs = (search.ERReportIDs != null && search.ERReportIDs != "-1") ? search.ERReportIDs : "";
                        search.ERRecurrenceIDs = (search.ERRecurrenceIDs != null && search.ERRecurrenceIDs != "-1") ? search.ERRecurrenceIDs : "";
                        // filter by user
                        if (!String.IsNullOrEmpty(search.CreatedByIDs))
                        {
                            SaveandScheduledDetailsList = SaveandScheduledDetailsList.Where(s => GetSearchIds(search.CreatedByIDs)
                                .Contains(s.UserID.ToString()))
                                .ToList();
                        }

                        // filter by Report Name
                        if (!String.IsNullOrEmpty(search.ERReportIDs))
                        {
                            SaveandScheduledDetailsList = SaveandScheduledDetailsList.Where(s => GetSearchIds(search.ERReportIDs)
                                .Contains(s.ERReportID.ToString()))
                                .ToList();
                        }

                        // filter by Report Frequency / Schedule Type
                        if (!String.IsNullOrEmpty(search.ERRecurrenceIDs))
                        {
                            SaveandScheduledDetailsList = SaveandScheduledDetailsList.Where(s => GetSearchIds(search.ERRecurrenceIDs)
                                .Contains(s.ERScheduleTypeID.ToString()))
                                .ToList();
                        }

                        // filter by Create Date
                        if (search.CreateDateFrom.HasValue && search.CreateDateFrom.Value > DateTime.MinValue)
                        {
                            DateTime maxDate = DateTime.MaxValue;
                            if (search.CreateDateTo.HasValue)
                            {
                                maxDate = search.CreateDateTo.Value.AddDays(1).Date;
                            }
                            SaveandScheduledDetailsList = SaveandScheduledDetailsList.Where(s =>
                                s.CreateDate >= search.CreateDateFrom && s.CreateDate < maxDate)
                                .ToList();
                        }
                    }
                
                }

                result = SaveandScheduledDetailsList.ToDataSourceResult(request, cqc => new SaveandScheduledDetails
                {
                   
                    ERReportUserScheduleID = cqc.ERReportUserScheduleID,
                    ERReportID = cqc.ERReportID,
                    UserID = cqc.UserID,
                    ERReportScheduleStatusID = cqc.ERReportScheduleStatusID,
                    EmailTo = cqc.EmailTo,
                    LastRundate = cqc.LastRundate,
                    LastRunStatus = cqc.LastRunStatus,
                    ReportNameOverride = cqc.ReportNameOverride,
                    ReportDescription = cqc.ReportDescription,
                    ERScheduleTypeID = cqc.ERScheduleTypeID,
                    NextRunScheduled = cqc.NextRunScheduled,
                    CreateDate = cqc.CreateDate,
                    UpdateDate = cqc.UpdateDate,
                    ERReportName = cqc.ERReportName,
                    SiteID = cqc.SiteID,
                    FirstName = cqc.FirstName,
                    LastName = cqc.LastName,
                    CreatedBy = cqc.FirstName.ToString() + " " + cqc.LastName.ToString(),
                    UpdatedBy =  cqc.UpdateByUserFirstName.ToString() + " " + cqc.UpdateByUserLastName.ToString(),
                    UpdateByUserID = cqc.UpdateByUserID,
                  //  UpdateByUserFirstName = cqc.UpdateByUserFirstName,
                   // UpdateByUserLastName = cqc.UpdateByUserLastName,
                    CC = cqc.CC,
                    BCC = cqc.BCC,
                    ReplyTo = cqc.ReplyTo,
                    Subject = cqc.Subject,
                    RenderFormatTypeID = cqc.RenderFormatTypeID,
                    Comment = cqc.Comment,
                    ERReportScheduleStatusName = cqc.ERReportScheduleStatusName,
                    ERReportScheduleStatusDescription = cqc.ERReportScheduleStatusDescription == "Complete" ? "None" : cqc.ERReportScheduleStatusDescription,
                    ERScheduleName = cqc.ERScheduleName,
                    ERScheduleDescription = cqc.ERScheduleDescription == "One-time" ? "None" : cqc.ERScheduleDescription,
                    LastRunMessage = cqc.LastRunMessage == "" ? "None" : cqc.LastRunMessage,
                    ReportSource = cqc.ReportSource,
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
                        PageName = "_saveandscheduledReportsExcel",
                        MethodName = "_saveandscheduledReportsExcel",
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
        /// GetSearchIds: return a string array of an comma separated item list
        /// </summary>
        /// <param name="items">comma separated list</param>
        /// <returns>array of items</returns>
        private string[] GetSearchIds(string items)
        {
            char[] sep = { ',' };
            return items.Split(sep, StringSplitOptions.RemoveEmptyEntries);
        }
        /// <summary>
        /// DeleteUserSchedule: Delete user schedule its navigation property tables sites and parameters
        /// </summary>
        /// <param name="userScheduleID">the schedule ID to delete</param>
        /// <returns>true if successful, false if not</returns>
        public bool DeleteUserSchedule(int userScheduleID)
        {
            bool rc = false;

            try
            {
                using (SqlConnection cn = new SqlConnection(ConfigurationManager.ConnectionStrings["DBAMP"].ToString()))
                {
                    cn.Open();

                    SqlCommand cmd = new SqlCommand("usmERReportUserScheduleDelete", cn);
                    cmd.CommandType = System.Data.CommandType.StoredProcedure;
                    cmd.Parameters.AddWithValue("@ERReportUserScheduleID", userScheduleID);

                    CreateSQLExecuted("usmERReportUserScheduleDelete", cmd);
#if DEBUG
                    System.Diagnostics.Debug.WriteLine(_SQLExecuted);
#endif

                    if (cmd.ExecuteNonQuery() > -1)
                    {
                        rc = true;
                    }
                }
            }
            catch (Exception ex)
            {
                ex.Data.Add(TSQL, _SQLExecuted);
                throw ex;
            }

            return rc;
        }

        private DataSet SaveandScheduleddataset(int EProductID)
        {

            DataSet ds = new DataSet();
         

            try
            {

                using (SqlConnection cn = new SqlConnection(ConfigurationManager.ConnectionStrings["DBAMP"].ToString()))
               
                {
                    cn.Open();
                    SqlCommand cmd;
                    cmd = new SqlCommand("ustReport_GetSavedandScheduledReports", cn);
                    cmd.CommandType = System.Data.CommandType.StoredProcedure;
                    cmd.CommandTimeout = Convert.ToInt32(ConfigurationManager.AppSettings["SPCmdTimeout"].ToString());
                    cmd.Parameters.AddWithValue("@UserID", AppSession.UserID);
                    cmd.Parameters.AddWithValue("@SiteID", AppSession.SelectedSiteId);
                    cmd.Parameters.AddWithValue("@ProgramID", AppSession.SelectedProgramId);


                    CreateSQLExecuted("ustReport_GetSavedandScheduledReports", cmd);
#if DEBUG
                    // System.Diagnostics.Debug.WriteLine(_SQLExecuted);
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
       
            return ds;


        }

        private DataSet ERSearchSaveandScheduleddataset(string userSiteList, string searchSiteList, int eProductID, int ERReportCategoryID)
        {

            DataSet ds = new DataSet();
           try
            {

                using (SqlConnection cn = new SqlConnection(ConfigurationManager.ConnectionStrings["DBAMP"].ToString()))
                {
                    cn.Open();
                    SqlCommand cmd;

                  //  AppSession.Sites
                    //if (userSiteList == "")
                    //{

                    //    foreach (var site in AppSession.Sites)
                    //    {
                    //        userSiteList += site.SiteID + ",";
                    //    }
                    //    userSiteList.TrimEnd(',');
                    
                    //}

                    cmd = new SqlCommand("ustReport_GetSavedandScheduledERReports", cn);
                    cmd.CommandType = System.Data.CommandType.StoredProcedure;
                    cmd.CommandTimeout = Convert.ToInt32(ConfigurationManager.AppSettings["SPCmdTimeout"].ToString());
                    cmd.Parameters.AddWithValue("@UserSiteList", userSiteList);
                    cmd.Parameters.AddWithValue("@SearchSiteList", searchSiteList);
                    cmd.Parameters.AddWithValue("@EProductID", eProductID);
                    cmd.Parameters.AddWithValue("@ERReportCategoryID", ERReportCategoryID);

                    CreateSQLExecuted("ustReport_GetSavedandScheduledERReports", cmd);
#if DEBUG
                    // System.Diagnostics.Debug.WriteLine(_SQLExecuted);
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

            return ds;


        }

    }
}