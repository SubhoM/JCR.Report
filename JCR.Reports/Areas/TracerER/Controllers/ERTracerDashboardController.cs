using System;
using System.Linq;
using System.Web.Mvc;
using JCR.Reports.Services;
using JCR.Reports.Common;
using JCR.Reports.Models.Enums;
using JCR.Reports.Models;
using JCR.Reports.ViewModels;
using System.Collections.Generic;
using JCR.Reports.Areas.TracerER.Services;
using JCR.Reports.Areas.TracerER.ViewModels;
using Kendo.Mvc.UI;
using Kendo.Mvc.Extensions;
using System.Configuration;

namespace JCR.Reports.Areas.TracerER.Controllers
{
    public class ERTracerDashboardController : Controller
    {
        ExceptionService exceptionService = new ExceptionService();
        // GET: TracerER/ERTracerDashboard
        public ActionResult Index(int id, int? actionType)
        {
            try
            {
                if (!AppSession.HasValidSession)
                {
                    return RedirectToAction("IndexER", "Transfer", new { area = "" });
                }

                HelperClasses.SetReportOrScheduleID(id, (int)ReportsListEnum.ERTracerDashboard);

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
                }

                ERSearchList list = new ERSearchList();
                list = reportservice.GetERComplianceByTracer(WebConstants.ERTRACER_REPORT_TITLE_Tracer_Dashboard_Report);

                return View(list);
            }
            catch (Exception ex)
            {

                ExceptionLog exceptionLog = new ExceptionLog
                {
                    ExceptionText = "ER Reports: " + ex.Message,
                    PageName = "ERTracerDashboard",
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

        public ActionResult LoadTracerHeatMap(SearchER search/*, string tracerName*/)
        {
            
            ERSearchInputService reportservice = new ERSearchInputService();
            var tcList = Array.ConvertAll(search.TracerListNames.Split('€'), p => p.Trim()).ToList();
            if (tcList.Any(i => string.Equals("All", i, StringComparison.CurrentCultureIgnoreCase)))
            {
                tcList = null;
                tcList = reportservice.GetMultiSiteTracersList(search.SelectedSiteIDs, search.ProgramIDs).TracersLists.Select(x => x.TracerCustomName).ToList();
                tcList.RemoveAt(0);
            }
            ViewBag.Header = tcList;
            return PartialView("HeatMapGraph");
        }

        public ActionResult TracerDashordHeatMap([DataSourceRequest]DataSourceRequest request, SearchER search)
        {
            var tcService = new ERTracerDashboard();
            DataSourceResult result = tcService.TracerDashboardHeatMap(request, search);
            if (result.Errors != null && result.Errors.ToString() != "")
                ModelState.AddModelError("Error", result.Errors.ToString());
            var val = Json(result, JsonRequestBehavior.AllowGet);
            val.MaxJsonLength = int.MaxValue;

            return val;

        }

        public ActionResult LoadTracerDetailts(SearchER search)
        {
            ERSearchInputService reportservice = new ERSearchInputService();
            var siteList = reportservice.GetSitesList(search.SelectedSiteIDs);
            ViewBag.Header = siteList;
            return PartialView("TracerDetails");
        }
        public ActionResult TracerDetails([DataSourceRequest]DataSourceRequest request, SearchER search)
        {
            var tcService = new ERTracerDashboard();

            DataSourceResult result = tcService.TracerComplianceDetails(request, search);

            if (result.Errors != null && result.Errors.ToString() != "")
                ModelState.AddModelError("Error", result.Errors.ToString());

            var val = Json(result, JsonRequestBehavior.AllowGet);
            val.MaxJsonLength = int.MaxValue;

            return val;
        }

        public ActionResult createErExcel(string base64,string title)
        {
            var emailService = new CommonService();
            string fileGuid = "";

            try
            {
                byte[] fileContents = Convert.FromBase64String(base64);
                fileGuid = emailService.SaveExcel(title, fileContents);
            }
            catch (Exception ex)
            {
                ExceptionLog exceptionLog = new ExceptionLog
                {
                    ExceptionText = "Reports: " + ex.Message,
                    PageName = "ERTracerDashboardController",
                    MethodName = "createErExcel",
                    UserID = Convert.ToInt32(AppSession.UserID),
                    SiteId = Convert.ToInt32(AppSession.SelectedSiteId),
                    TransSQL = "",
                    HttpReferrer = null
                };
                exceptionService.LogException(exceptionLog);
            }
            return Json(new { fileGuid = fileGuid });
        }
    }
}