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
    public class ERComplianceByTracerController : Controller
    {
        ExceptionService exceptionService = new ExceptionService();
        // GET: TracerER/ERComplianceByTracer
        public ActionResult Index(int id, int? actionType)
        {
            try
            {
                if (!AppSession.HasValidSession)
                {
                    return RedirectToAction("IndexER", "Transfer", new { area = "" });
                }

                HelperClasses.SetReportOrScheduleID(id, (int)ReportsListEnum.ERComplianceByTracer);

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
                list = reportservice.GetERComplianceByTracer(WebConstants.ERTRACER_REPORT_TITLE_Compliance_By_Tracer_Report);

                return View(list);
            }
            catch (Exception ex)
            {

                ExceptionLog exceptionLog = new ExceptionLog
                {
                    ExceptionText = "ER Reports: " + ex.Message,
                    PageName = "ERComplianceByTracer",
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

        public ActionResult TracerComplianceHeatMap([DataSourceRequest]DataSourceRequest request, SearchER search)
        {
            /*
            ERSearchInputService reportservice = new ERSearchInputService();
            var tcList = reportservice.GetUHSTracersList(search.SelectedSiteIDs, search.ProgramIDs).TracersLists.ToList();
            tcList.RemoveAt(0);
            ViewBag.Header = tcList.Where(x=>x.TracerCategoryID == tracerCategoryID).Select(x => x.TracerCustomName).Distinct().ToList();
            */
            var tcService = new ERComplianceByTracer();
            DataSourceResult result = tcService.TracerComplianceHeatMap(request, search);
            if (result.Errors != null && result.Errors.ToString() != "")
                ModelState.AddModelError("Error", result.Errors.ToString());
            var val = Json(result, JsonRequestBehavior.AllowGet);
            val.MaxJsonLength = int.MaxValue;
            
            return val;
            
        }

        public ActionResult LoadHeatMap(SearchER search)
        {
            
            ERSearchInputService reportservice = new ERSearchInputService();
            var tcList = reportservice.GetUHSTracersList(search.SelectedSiteIDs, search.ProgramIDs).TracersLists.ToList();
            tcList.RemoveAt(0);
            if(search.TracerListIDs != "-1")
            {
                var stList = search.TracerListNames.Split(',').ToList();
                var tDicList = tcList.Distinct().ToDictionary(x => x.TracerCustomName, x => x.TracerCategoryID);
                foreach (var tracer in tcList.Select(x=>x.TracerCustomName.ToString()).ToList())
                {
                    if (!(stList.Any(x=>x.ToString().Contains(tracer.ToString()))))
                    {
                        tDicList.Remove(tracer);
                    }
                }
                ViewBag.Header = tDicList;
            }
            else
            {
                var tDicList = tcList.Distinct().ToDictionary(x => x.TracerCustomName, x => x.TracerCategoryID);
                ViewBag.Header = tDicList;
            }
            //ViewBag.Header = tcList.Select(x=>x.TracerCustomName).Distinct().ToList();

            return PartialView("HeatMap");
        }

        public ActionResult HierarchyBinding_Category([DataSourceRequest] DataSourceRequest request, SearchER search)
        {
            ERSearchInputService reportservice = new ERSearchInputService();
            var tcList = reportservice.GetUHSTracersList(search.SelectedSiteIDs, search.ProgramIDs).TracersLists.DistinctBy(x=>x.TracerCategoryName).ToList();
            tcList.RemoveAt(0);
            //var tDicList = tcList.Where(x=>x.TracerCategoryID == i).Select(x=>x.TracerCustomName).Distinct().ToList();
            //ViewBag.Header = tDicList;
            //i++;

            DataSourceResult result = tcList.ToDataSourceResult(request, tc => new Tracers
            {
                TracerCategoryName = tc.TracerCategoryName,
                TracerCategoryID = tc.TracerCategoryID
            });
            var val = Json(result, JsonRequestBehavior.AllowGet);
            val.MaxJsonLength = int.MaxValue;
            return val;
        }

        public ActionResult LoadSummary()
        {
            List<string> categoryList = new List<string>();
            categoryList.Add("Documentation");
            categoryList.Add("Infection Control");
            ViewBag.Header = categoryList;
            return PartialView("Summary");
        }

        public ActionResult TracerComplianceSummary([DataSourceRequest]DataSourceRequest request, SearchER search)
        {
            var tcService = new ERComplianceByTracer();

            DataSourceResult result = tcService.TracerComplianceSummary(request, search);

            if (result.Errors != null && result.Errors.ToString() != "")
                ModelState.AddModelError("Error", result.Errors.ToString());

            var val = Json(result, JsonRequestBehavior.AllowGet);
            val.MaxJsonLength = int.MaxValue;

            return val;
        }
    
        public ActionResult LoadTracerResults(SearchER search)
        {
            ERSearchInputService reportservice = new ERSearchInputService();
            var siteList = reportservice.GetSitesList(search.SelectedSiteIDs);
            ViewBag.Header = siteList;
            return PartialView("TracerResults");
        }
        public ActionResult TracerComplianceDetails([DataSourceRequest]DataSourceRequest request, SearchER search)
        {
            var tcService = new ERComplianceByTracer();

            DataSourceResult result = tcService.TracerComplianceDetails(request, search);

            if (result.Errors != null && result.Errors.ToString() != "")
                ModelState.AddModelError("Error", result.Errors.ToString());

            var val = Json(result, JsonRequestBehavior.AllowGet);
            val.MaxJsonLength = int.MaxValue;

            return val;
        }

    }
}