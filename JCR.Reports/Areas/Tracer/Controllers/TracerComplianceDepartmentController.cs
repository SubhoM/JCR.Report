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
using JCR.Reports.Areas.Tracer.Models;

namespace JCR.Reports.Areas.Tracer.Controllers
{
    public class TracerComplianceDepartmentController : Controller
    {
        ExceptionService exceptionService = new ExceptionService();
        private string ExceedLimt = string.Empty;
        // GET: Tracer/TracerComplianceDepartment
        public ActionResult Index(int id, int? actionType)
        {
            try
            {
                HelperClasses.SetReportOrScheduleID(id, (int)ReportsListEnum.TracerComplianceDepartment);
                ViewBag.ShowCMSRadio = true;

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

                    return View(reportservice.GetSearchListsForSavedParameters(AppSession.ReportScheduleID, savedParameters, WebConstants.TRACER_REPORT_TITLE_TRACER_COMPLIANCE_DEPARTMENT));
                }
                else
                    return View(reportservice.GetSearchLists(WebConstants.TRACER_REPORT_TITLE_TRACER_COMPLIANCE_DEPARTMENT));
            }
            catch (Exception ex)
            {

                ExceptionLog exceptionLog = new ExceptionLog
                {
                    ExceptionText = "Reports: " + ex.Message,
                    PageName = "TracerComplianceDepartment",
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

        public ActionResult LoadTracerComplianceDepartmentGraph(Search search)
        {
            var tcService = new TracerDepartmentDashboard();
            try
            {
                var departments = new List<string>();
                if(search.OrgTypeLevel1IDs == "-1")
                {
                    departments = Array.ConvertAll(search.DepartmentNames.Split('€'), p => p.Trim()).ToList();
                    departments.RemoveAt(0);
                }
                else
                {
                    departments = Array.ConvertAll(search.OrgTypeLevel1SpecialCaseNames.Split('€'), p => p.Trim()).ToList();
                }
                if(departments.Count() > 100)
                {
                    ExceedLimt = "TRUE";
                    departments = departments.Select(i => i).OrderBy(x => tcService.PadNumbers(x)).Distinct().Take(100).ToList();
                }
                if(departments.Count() == 0)
                {
                    throw new Exception("No Data");
                }
                else
                {
                    ViewBag.Header = departments;
                    TempData["ExceedLimt"] = ExceedLimt;
                    return PartialView("TracerComplianceDepartmentGraph");
                }
            }
            catch (Exception ex)
            {
                if (ex.Message.ToString() == "No Data")
                {
                    ModelState.AddModelError("Error",WebConstants.NO_DATA_FOUND_EXCEL_VIEW.ToString());
                }
                else
                {
                    ExceptionLog exceptionLog = new ExceptionLog
                    {
                        ExceptionText = "Reports: " + ex.Message,
                        PageName = "_TracerComplianceDepartmentGraph",
                        MethodName = "LoadTracerComplianceDepartmentGraph",
                        UserID = Convert.ToInt32(AppSession.UserID),
                        SiteId = Convert.ToInt32(AppSession.SelectedSiteId),
                        TransSQL = "",
                        HttpReferrer = null
                    };
                    exceptionService.LogException(exceptionLog);
                }
                return RedirectToAction("Error", "Transfer");
            }
        }
        
        public ActionResult LoadTracerComplianceDepartmentGrid([DataSourceRequest]DataSourceRequest request, Search search)
        {
            var tcService = new TracerDepartmentDashboard();

            DataSourceResult result = tcService.DynamicGroupByTracerDepartmentColumns(request, search);

            if (result.Errors != null && result.Errors.ToString() != "")
                ModelState.AddModelError("Error", result.Errors.ToString());

            var val = Json(result, JsonRequestBehavior.AllowGet);
            val.MaxJsonLength = int.MaxValue;
            val.RecursionLimit = 100;
            return val;
        }
        
        public ActionResult _TracerComplianceDepartmentExcel([DataSourceRequest]DataSourceRequest request, Search search)
        {
            var dcaService = new TracerDepartmentDashboard();

            DataSourceResult result = dcaService._tracerComplianceDepartmentExcel(request, search);
            JsonResult jr = new JsonResult();

            jr = Json(result, JsonRequestBehavior.AllowGet);
            jr.MaxJsonLength = Int32.MaxValue;
            jr.RecursionLimit = 100;
            return jr;


        }
        public ActionResult LoadTracerComplianceDeptDetail()
        {
            return PartialView("TracerComplianceDepartmentDetail");
        }
    }
}