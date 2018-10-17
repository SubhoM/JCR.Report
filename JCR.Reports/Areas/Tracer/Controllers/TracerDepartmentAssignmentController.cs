using JCR.Reports.Services;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using JCR.Reports.Models;
using JCR.Reports.Common;
using JCR.Reports.Models.Enums;
using Kendo.Mvc.UI;
using JCR.Reports.Areas.Tracer.ViewModels;
using JCR.Reports.Areas.Tracer.Services;
using System.Data;
using Newtonsoft.Json;
namespace JCR.Reports.Areas.Tracer.Controllers
{
    public class TracerDepartmentAssignmentController : Controller
    {
        ExceptionService exceptionService = new ExceptionService();

        /// <summary>
        /// Get frequency list based on category id
        /// </summary>
        /// <returns>PartialView</returns>
        public ActionResult GetTracersDepartmentFrequency(string TracerCategoryIDs)
        {
            //SearchList search = new SearchList();
            SearchInputService reportservice = new SearchInputService();

            return PartialView("Search/_TracerFrequency", reportservice.GetTracerFreqencyLists(TracerCategoryIDs));
        }


        /// <summary>
        /// Get tracers list based on selected site id or tracer category change
        /// </summary>
        /// <returns>PartialView</returns>
        public ActionResult GetTracersList(string TracerCategoryIDs, string TracerFrequencyIDs)
        {

            SearchInputService reportservice = new SearchInputService();

            return PartialView("Search/_TracersList", reportservice.GetAllTracerScheduleFrequencyList(TracerFrequencyIDs,
                TracerCategoryIDs));
        }




        public ActionResult LoadDepartmentAssigmentTab(Search search)
        {
            TracerDepartmentAssignmentInput model = new TracerDepartmentAssignmentInput();
            
            try
            {

                var tcService = new DepartmentAssignmentService();
                List<TracerFrequency> result = tcService.GetValidFrequencyForDepartmentAssignmentData(search);

                if (result.Count > 0)
                {
                    model.DefaultFrequencyNames = result.Select(x => x.TracerObsFrequencyTypeName).ToList();

                    model.ActiveFrequencyName = model.DefaultFrequencyNames.First();
                    model.FrequencyName = string.Join(",", model.DefaultFrequencyNames);
                }

                return PartialView("_TracerDepartmentAssignment", model);
            }

            catch (Exception ex)
            {

                ExceptionLog exceptionLog = new ExceptionLog
                {
                    ExceptionText = "Reports: " + ex.Message,
                    PageName = "_TracerDepartmentAssignment",
                    MethodName = "LoadDepartmentAssigmentTab",
                    UserID = Convert.ToInt32(AppSession.UserID),
                    SiteId = Convert.ToInt32(AppSession.SelectedSiteId),
                    TransSQL = "",
                    HttpReferrer = null
                };
                exceptionService.LogException(exceptionLog);
                return RedirectToAction("Error", "Transfer");
            }
        }


        public ActionResult LoadDepartmentAssigmentgridControl(Search search)
        {
            var tcService = new DepartmentAssignmentService();

            DataTable tPivotTable = new DataTable();
            tPivotTable = tcService.DynamicGroupByTracerColumns(search);

            try
            {

                string JSONString = string.Empty;
                JsonResult jr = new JsonResult();
                JSONString = JsonConvert.SerializeObject(tPivotTable);
                var _result = new
                {
                    outputData = JSONString,
                    ExceedFlag = tcService.ExceedLimit,
                    RecordStatus = tcService.RecordStatus
                };
                jr = Json(_result, JsonRequestBehavior.AllowGet);
                jr.MaxJsonLength = Int32.MaxValue;
                jr.RecursionLimit = 100;
                return jr;

            }

            catch (Exception ex)
            {

                ExceptionLog exceptionLog = new ExceptionLog
                {
                    ExceptionText = "Reports: " + ex.Message,
                    PageName = "_TracerDepartmentAssignment",
                    MethodName = "LoadDepartmentAssigmentgridControl",
                    UserID = Convert.ToInt32(AppSession.UserID),
                    SiteId = Convert.ToInt32(AppSession.SelectedSiteId),
                    TransSQL = "",
                    HttpReferrer = null
                };
                exceptionService.LogException(exceptionLog);
                return RedirectToAction("Error", "Transfer");
            }
        }

        // GET: Tracer/TracerDepartmentAssignment
        public ActionResult Index(int id, int? actionType)
        {
            try
            {

                HelperClasses.SetReportOrScheduleID(id, (int)ReportsListEnum.TracerDepartmentAssignment);

                // NEVER SET THIS VARIABLE TO FALSE. The value is set based on licensing for selected site and program. - Mark Orlando.
                // AppSession.IsCMSProgram = false;  

                ViewBag.ScheduledTracerReport = true;
                SearchInputService reportservice = new SearchInputService();
                if (AppSession.ReportScheduleID > 0)
                {
                    //Load the saved parameters
                    var oSaveAndScheduleService = new SaveAndScheduleService();
                    var savedParameters = oSaveAndScheduleService.LoadUserSchedule(AppSession.ReportScheduleID);
                    TempData["SavedParameters"] = savedParameters; //This tempdata will be used by the Ajax call to avoid loading the saved parameters again from DB
                    TempData["ActionType"] = actionType;

                    //Show/Hide Save to my reports button
                    ViewBag.HideSaveReport = HelperClasses.HideSaveToMyReports(AppSession.RoleID, savedParameters.UserID, AppSession.UserID, actionType);

                    return View(reportservice.GetSavedParameters_DepartmentAssignment(AppSession.ReportScheduleID, savedParameters, WebConstants.TRACER_REPORT_TITLE_TRACERDEPARTMENT_ASSIGNMENT_REPORT));
                }
                else
                    return View(reportservice.GetSearchLists_DepartmentAssignment(WebConstants.TRACER_REPORT_TITLE_TRACERDEPARTMENT_ASSIGNMENT_REPORT));
            }
            catch (Exception ex)
            {

                ExceptionLog exceptionLog = new ExceptionLog
                {
                    ExceptionText = "Reports: " + ex.Message,
                    PageName = "_TracerDepartmentAssignment",
                    MethodName = "Index",
                    UserID = Convert.ToInt32(AppSession.UserID),
                    SiteId = Convert.ToInt32(AppSession.SelectedSiteId),
                    TransSQL = "",
                    HttpReferrer = null
                };
                exceptionService.LogException(exceptionLog);

                return RedirectToAction("Error", "Transfer");
            }
        }
    }
}