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
    public class ComplianceDepartmentController : Controller
    {
        ExceptionService exceptionService = new ExceptionService();
        //
        // GET: Tracer/ComplianceDepartment
        public ActionResult Index(int id, int? actionType)
        {

            try
            {
                HelperClasses.SetReportOrScheduleID(id, (int)ReportsListEnum.ComplianceByDepartment);
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

                    return View(reportservice.GetSavedParameters_ComplianceDepartment(AppSession.ReportScheduleID, savedParameters, WebConstants.TRACER_REPORT_TITLE_COMPLIANCE_BY_DEPARTMENT));
                }
                else
                    return View(reportservice.GetSearchLists_ComplianceDepartment(WebConstants.TRACER_REPORT_TITLE_COMPLIANCE_BY_DEPARTMENT));
            }
            catch (Exception ex)
            {

                ExceptionLog exceptionLog = new ExceptionLog
                {
                    ExceptionText = "Reports: " + ex.Message,
                    PageName = "ComplianceDepartment",
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

        public ActionResult LoadComplianceDepartmentPivot()
        {
            TracerComplianceDepartmentInput model = new TracerComplianceDepartmentInput();
            try
            {
                return PartialView("ComplianceDepartmentPivot", model);
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
        public ActionResult LoadComplianceDepartmentGrid(Search search)
        {
            var tcService = new TracerComplianceDepartment();

            DataTable tPivotTable = new DataTable();
            tPivotTable = tcService.DynamicGroupByDepartmentColumns(search);

            try
            {

                string JSONString = string.Empty;
                JsonResult jr = new JsonResult();
                JSONString = JsonConvert.SerializeObject(tPivotTable);
                var _result = new
                {
                    outputData = JSONString,
                    ExceedFlag = tcService.ExceedLimit,
                    RecordStatus = tcService.RecordStatus,
                    OutputDepartmentList = tcService.OutputDepartmentIds
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
                    PageName = "_ComplianceDepartmentChart",
                    MethodName = "LoadComplianceDepartmentGrid",
                    UserID = Convert.ToInt32(AppSession.UserID),
                    SiteId = Convert.ToInt32(AppSession.SelectedSiteId),
                    TransSQL = "",
                    HttpReferrer = null
                };
                exceptionService.LogException(exceptionLog);
                return RedirectToAction("Error", "Transfer");
            }
        }

        public ActionResult _ComplianceDepartmentExcel([DataSourceRequest]DataSourceRequest request, Search search)
        {
            var dcaService = new TracerComplianceDepartment();

            DataSourceResult result = dcaService._complianceDepartmentExcel(request, search);
            JsonResult jr = new JsonResult();

            jr = Json(result, JsonRequestBehavior.AllowGet);
            jr.MaxJsonLength = Int32.MaxValue;
            jr.RecursionLimit = 100;
            return jr;


        }
        public ActionResult LoadComplianceDeptDetail()
        {
            return PartialView("ComplianceDepartmentDetail");
        }
    }
}