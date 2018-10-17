using System;
using System.Collections.Generic;
using System.Web.Mvc;
using Kendo.Mvc.UI;
using JCR.Reports.Services;
using JCR.Reports.Models;
using JCR.Reports.Common;
using JCR.Reports.Models.Enums;
using System.IO;
namespace JCR.Reports.Controllers
{
    public class SaveandScheduledReportsController : Controller
    {
        private const string EMAILPLACEHOLDER = "abc@example.com;xyz@etc.com";

        // GET: /SaveandScheduledReports/
        public ActionResult Index()
        {
            AppSession.ReportID = 0;
            AppSession.ReportScheduleID = 0;
            AppSession.ReportScheduleName = string.Empty;
            AppSession.ReportScheduleDesc = string.Empty;
            return View();
        }

        public ActionResult _SaveandScheduledReportsExcel([DataSourceRequest]DataSourceRequest request, SearchSavedReportsInput search)
        {
            var SaveandScheduleReportsCall = new SaveandScheduledReports();
            //if (search.MyReportsView)
            //{ }
            //else
            //{ }
            DataSourceResult result = SaveandScheduleReportsCall._saveandscheduledReportsExcel(request, search);
            JsonResult jr = new JsonResult();

            jr = Json(result, JsonRequestBehavior.AllowGet);
            jr.MaxJsonLength = Int32.MaxValue;
            jr.RecursionLimit = 100;
            return jr;

        }
        public ActionResult _ERSaveandScheduledReportsExcel([DataSourceRequest]DataSourceRequest request, SearchSavedReportsInput search)
        {
            var SaveandScheduleReportsCall = new SaveandScheduledReports();

            DataSourceResult result = SaveandScheduleReportsCall._saveandscheduledReportsExcel(request, search, (int)WebConstants.ProductID.TracerER);
            JsonResult jr = new JsonResult();

            jr = Json(result, JsonRequestBehavior.AllowGet);
            jr.MaxJsonLength = Int32.MaxValue;
            jr.RecursionLimit = 100;
            return jr;

        }

        public ActionResult DeleteSavedReport(string ERReportUserScheduleID)
        {
            var SaveandScheduleReportsCall = new SaveandScheduledReports();
            SaveandScheduleReportsCall.DeleteUserSchedule(Convert.ToInt32(ERReportUserScheduleID));
            return Json(new { success = true }, JsonRequestBehavior.AllowGet);
        }

        public JsonResult SaveReport(List<Dictionary<string, string>> objDictionary)
        {
            string message = string.Empty;
            try
            {
                int reportID = AppSession.ReportID;
                SaveAndSchedule oSaveModel = new SaveAndSchedule();

                //Set the schedule information
                if (AppSession.ReportScheduleID > 0 && Convert.ToInt16(objDictionary.Find(p => p.ContainsKey("ReportDelete"))["ReportDelete"]) != 1)
                {
                    oSaveModel.ReportUserScheduleID = AppSession.ReportScheduleID;

                    SaveAndScheduleService oScheduleService = new SaveAndScheduleService();
                    oSaveModel = oScheduleService.LoadUserSchedule(AppSession.ReportScheduleID);
                }
                else
                {
                    oSaveModel.LastRunStatus = (int)LastRunStatus.NotRun;
                    oSaveModel.UserID = AppSession.UserID;
                }
                oSaveModel.ReportParameters.Clear();

                oSaveModel.ReportID = AppSession.ReportID;

                //Get all the selected sites
                var selectedSites = objDictionary.Find(d => d.ContainsKey("SelectedSites")) != null ?
                                                objDictionary.Find(d => d.ContainsKey("SelectedSites"))["SelectedSites"].ToString() : string.Empty;
                oSaveModel.ReportSiteMaps.Clear();
                if (!String.IsNullOrWhiteSpace(selectedSites))
                {
                    foreach (var site in selectedSites.Trim(',').Split(','))
                    {
                        oSaveModel.ReportSiteMaps.Add(new ReportUserScheduleSiteMap { SiteID = Convert.ToInt32(site) });
                    }
                }
                else
                    oSaveModel.ReportSiteMaps.Add(new ReportUserScheduleSiteMap { SiteID = AppSession.SelectedSiteId });

                var scheduledReportName = objDictionary.Find(d => d.ContainsKey("ScheduledReportName"));
                if (scheduledReportName != null && scheduledReportName.Count > 0)
                {
                    oSaveModel.ReportNameOverride = scheduledReportName["ScheduledReportName"];
                    AppSession.ReportScheduleName = scheduledReportName["ScheduledReportName"];
                }

                var scheduledReportDesc = objDictionary.Find(d => d.ContainsKey("ScheduledReportDesc"));
                if (scheduledReportDesc != null && scheduledReportDesc.Count > 0)
                {
                    oSaveModel.ReportDescription = scheduledReportDesc["ScheduledReportDesc"];
                    AppSession.ReportScheduleDesc = scheduledReportDesc["ScheduledReportDesc"];
                }

                var reportType = objDictionary.Find(d => d.ContainsKey("ReportType"));
                if (reportType != null && reportType.Count > 0)
                {
                    if (string.Equals(reportType["ReportType"], "ExcelView"))
                        oSaveModel.RenderFormatTypeID = (int)RenderFormatType.Excel;
                    else
                        if (reportID == (int)ReportsListEnum.ComplianceByDepartment || reportID == (int)ReportsListEnum.TracerComplianceDepartment)
                            oSaveModel.RenderFormatTypeID = (int)RenderFormatType.Excel;
                        else
                            oSaveModel.RenderFormatTypeID = (int)RenderFormatType.PDF;
                }
                else
                {
                    //Only excel format for Monthly breakdowns reports
                    if (reportID == (int)ReportsListEnum.MonthlyQuestionBreakdown || reportID == (int)ReportsListEnum.MonthlyTracerBreakdown || reportID == (int)ReportsListEnum.ComplianceByDepartment)
                        oSaveModel.RenderFormatTypeID = (int)RenderFormatType.Excel;
                    else
                        oSaveModel.RenderFormatTypeID = (int)RenderFormatType.PDF;
                }
                oSaveModel.Priority = 1;

                //Recurrence information
                oSaveModel.EmailTo = objDictionary.Find(d => d.ContainsKey("EmailTo")) != null ? objDictionary.Find(d => d.ContainsKey("EmailTo"))["EmailTo"].ToString() : String.Concat(AppSession.EmailAddress, "; ");

                //Check for Email place holder texts
                oSaveModel.EmailCC = objDictionary.Find(d => d.ContainsKey("EmailCC")) != null ? objDictionary.Find(d => d.ContainsKey("EmailCC"))["EmailCC"].ToString() : String.Empty;
                if (!String.IsNullOrWhiteSpace(oSaveModel.EmailCC) && oSaveModel.EmailCC == EMAILPLACEHOLDER)
                { oSaveModel.EmailCC = string.Empty; }

                oSaveModel.EmailBCC = objDictionary.Find(d => d.ContainsKey("EmailBCC")) != null ? objDictionary.Find(d => d.ContainsKey("EmailBCC"))["EmailBCC"].ToString() : String.Empty;
                if (!String.IsNullOrWhiteSpace(oSaveModel.EmailBCC) && oSaveModel.EmailBCC == EMAILPLACEHOLDER)
                { oSaveModel.EmailBCC = string.Empty; }

                oSaveModel.ReplyTo = string.Empty;
                oSaveModel.Subject = objDictionary.Find(d => d.ContainsKey("Subject")) != null ? objDictionary.Find(d => d.ContainsKey("Subject"))["Subject"].ToString() : String.Empty;
                oSaveModel.Comment = objDictionary.Find(d => d.ContainsKey("Comment")) != null ? objDictionary.Find(d => d.ContainsKey("Comment"))["Comment"].ToString() : String.Empty;

                var scheduleTypeID = objDictionary.Find(p => p.ContainsKey("ScheduleTypeID")) == null ? 0 : Convert.ToInt16(objDictionary.Find(p => p.ContainsKey("ScheduleTypeID"))["ScheduleTypeID"]);

                oSaveModel.DaysOfWeek = null;
                oSaveModel.DaysOfMonth = null;

                if (scheduleTypeID == (int)ScheduleType.Weekly)
                {
                    oSaveModel.ScheduleTypeID = (int)ScheduleType.Weekly;
                    oSaveModel.DaysOfWeek = objDictionary.Find(p => p.ContainsKey("DaysOfWeek"))["DaysOfWeek"].ToString().TrimEnd(',');
                    oSaveModel.ReportScheduleStatusID = (int)ScheduleStatus.Scheduled;
                }
                else if (scheduleTypeID == (int)ScheduleType.Monthly)
                {
                    oSaveModel.ScheduleTypeID = (int)ScheduleType.Monthly;
                    oSaveModel.DaysOfMonth = Convert.ToInt16(objDictionary.Find(p => p.ContainsKey("DaysOfMonth"))["DaysOfMonth"]);
                    oSaveModel.ReportScheduleStatusID = (int)ScheduleStatus.Scheduled;
                }
                else if (scheduleTypeID == (int)ScheduleType.Quarterly)
                {
                    oSaveModel.ScheduleTypeID = (int)ScheduleType.Quarterly;
                    oSaveModel.DaysOfQuarter = Convert.ToInt16(objDictionary.Find(p => p.ContainsKey("PeriodOfQuarter"))["PeriodOfQuarter"]);
                    oSaveModel.ReportScheduleStatusID = (int)ScheduleStatus.Scheduled;
                }
                else if (scheduleTypeID == (int)ScheduleType.Daily)
                {
                    oSaveModel.ScheduleTypeID = (int)ScheduleType.Daily;
                    oSaveModel.ReportScheduleStatusID = (int)ScheduleStatus.Scheduled;
                }
                else
                {
                    oSaveModel.ScheduleTypeID = (int)ScheduleType.None;
                    oSaveModel.ReportScheduleStatusID = (int)ScheduleStatus.Complete;
                }
                if (Convert.ToInt16(objDictionary.Find(p => p.ContainsKey("ReportDelete"))["ReportDelete"]) == 1)
                {
                    // We hit report limit issue and want ReportLauncher to generate report for us
                        oSaveModel.ReportDelete = 1;
                        oSaveModel.DaysOfWeek = null;
                        oSaveModel.DaysOfMonth = null;
                        oSaveModel.ScheduleTypeID = (int)ScheduleType.None;     // Should not be rescheduled
                   
                    // Launch report immediately
                    oSaveModel.ReportScheduleStatusID = (int)ScheduleStatus.Pending;
                }
                else
                {
                    oSaveModel.ReportDelete = 0;
                }
            

                oSaveModel.NextRunScheduled = HelperClasses.CalculateNextRunDate(oSaveModel.ScheduleTypeID, oSaveModel.DaysOfWeek, oSaveModel.DaysOfMonth, oSaveModel.DaysOfQuarter);

                oSaveModel.UpdateByUserId = AppSession.UserID;
                oSaveModel.ReportLauncherID = 1;

                //Set the parameters
                SaveAndScheduleService objSaveService = new SaveAndScheduleService();
                var lstReportParameters = objSaveService.GetReportParameters(reportID);

                foreach (var parameter in lstReportParameters)
                {
                    var param = objDictionary.Find(d => d.ContainsKey(parameter.ParameterName));
                    if (param != null && param.Count > 0)
                    {
                        oSaveModel.ReportParameters.Add(new ReportUserScheduleParameter
                        {
                            ReportParameterID = parameter.ReportParameterID,
                            ParameterValue = param[parameter.ParameterName],
                            DisplayTextOverride = parameter.DisplayText
                        });
                    }
                }

                SaveAndScheduleService oService = new SaveAndScheduleService();
              //  AppSession.ReportScheduleID = oService.SaveUserSchedule(oSaveModel);
                int ReportScheduleID = oService.SaveUserSchedule(oSaveModel);
                if (ReportScheduleID > 0)
                {
                    if (oSaveModel.ReportDelete == 0)
                    {
                        AppSession.ReportScheduleID = ReportScheduleID;
                        message = string.Format("{0} has been saved successfully!!", AppSession.ReportScheduleName);
                    }
                    else {
                       
                        message = "The report will be delivered to the recipient email addresses. It may take a few minutes for the report to show up in your email inbox.";
                    }
                }
            }
            catch(Exception ex)
            {
                ModelState.AddModelError("Error", "Error saving the report");
                message = "Error saving the report";
            }

            return Json(message);
        }

        public JsonResult LoadSavedParameters(int reportScheduleId)
        {
            var savedParameters = new SaveAndScheduleService();
            var oScheduleDate = new SaveAndSchedule();
            int actionTypeId = (int)WebConstants.ActionType.Edit;

            if (TempData["SavedParameters"] != null)
                oScheduleDate = (SaveAndSchedule)TempData["SavedParameters"];
            else
                oScheduleDate = savedParameters.LoadUserSchedule(reportScheduleId);

            if (TempData["ActionType"] != null && int.TryParse(TempData["ActionType"].ToString(), out actionTypeId))
            {
                if (actionTypeId == (int)WebConstants.ActionType.Copy)
                {
                    AppSession.ReportScheduleID = 0;
                    AppSession.ReportScheduleName = String.Concat("Copy of ", oScheduleDate.ReportNameOverride);
                    AppSession.ReportScheduleDesc = oScheduleDate.ReportDescription != "" ? String.Concat("Copy of ", oScheduleDate.ReportDescription) : "";
                }
            }

            oScheduleDate.ReportMode = actionTypeId;

            return Json(oScheduleDate);
        }

        /// <summary>
        /// Updates the Report Schedule ID partial view
        /// </summary>
        /// <param name="clearSession"></param>
        /// <returns></returns>
        public PartialViewResult UpdateReportID(bool clearSession = false)
        {
            if (clearSession)
            {
                AppSession.ReportScheduleID = 0;
                AppSession.ReportScheduleName = string.Empty;
                AppSession.ReportScheduleDesc = string.Empty;
            }
            return PartialView("Search/_ScheduledReportName");
        }
    }
}