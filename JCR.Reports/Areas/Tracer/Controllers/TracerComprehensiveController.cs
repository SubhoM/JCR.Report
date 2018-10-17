using System;
using System.Linq;
using System.Web.Mvc;
using JCR.Reports.Models;
using JCR.Reports.Services;
using Microsoft.Reporting.WebForms;
using Kendo.Mvc.UI;
using JCR.Reports.Common;
using JCR.Reports.ViewModels;
using System.Configuration;
using JCR.Reports.Models.Enums;
using JCR.Reports.Areas.Tracer.ViewModels;
using JCR.Reports.Areas.Tracer.Services;


namespace JCR.Reports.Areas.Tracer.Controllers
{
    public class TracerComprehensiveController : Controller
    {

        ExceptionService exceptionService = new ExceptionService();
        [SessionExpireFilter]
        public ActionResult Index(int id, int? actionType)
        {
            try
            {

            
            HelperClasses.SetReportOrScheduleID(id, (int)ReportsListEnum.ComprehensiveTracerReport);
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

                return View(reportservice.GetSearchListsForSavedParameters(AppSession.ReportScheduleID, savedParameters, WebConstants.TRACER_REPORT_TITLE_TRACER_COMPREHENSIVE_REPORT));
            }
            else
                return View(reportservice.GetSearchLists(WebConstants.TRACER_REPORT_TITLE_TRACER_COMPREHENSIVE_REPORT));
            }
            catch (Exception ex)
            {

                ExceptionLog exceptionLog = new ExceptionLog
                {
                    ExceptionText = "Reports: " + ex.Message,
                    PageName = "TracerComprehensive",
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

        /// <summary>
        /// If session expired redirect to the transfer page.
        /// </summary>
        /// <returns>Redirect </returns>
        private ActionResult SessionExpired()
        {
            return RedirectToAction("Index", "Transfer");
        }
        public ActionResult _TracerComprehensiveDetailByQuestionExcel([DataSourceRequest]DataSourceRequest request, Search search)
        {

            var tcService = new TracerComprehensive();
            DataSourceResult result = tcService.TracerComprehensiveExcel(request, search);
            if (result.Errors != null && result.Errors.ToString() != "")
            {
                ModelState.AddModelError("Error", result.Errors.ToString());

            }
            JsonResult jr = new JsonResult();

            jr = Json(result, JsonRequestBehavior.AllowGet);
            jr.MaxJsonLength = Int32.MaxValue;
            jr.RecursionLimit = 100;
            return jr;

        }

        public ActionResult _TracerComprehensiveDetailByResponseExcel([DataSourceRequest]DataSourceRequest request, Search search)
        {

            var tcService = new TracerComprehensive();
            DataSourceResult result = tcService.TracerComprehensiveExcel(request, search);
            if (result.Errors != null && result.Errors.ToString() != "")
            {
                ModelState.AddModelError("Error", result.Errors.ToString());

            }
            JsonResult jr = new JsonResult();

            jr = Json(result, JsonRequestBehavior.AllowGet);
            jr.MaxJsonLength = Int32.MaxValue;
            jr.RecursionLimit = 100;
            return jr;

        }

        public PartialViewResult _TracerComprehensive(Search search, Email emailInput)
        {
               
            ReportViewer reportViewer = new ReportViewer();
            try
            {
               
                var tcService = new TracerComprehensive();
                if (emailInput.To != null)
                {
                    ViewBag.FromEmail = true;
                    ViewBag.FromEmailSuccess = WebConstants.Email_Success;
                }
                reportViewer = tcService.TracerComprehensiveRDLC(search, emailInput);
               
                Session["MyReportViewer"] = reportViewer;

            }
            catch (Exception ex)
            {
                if (ex.Message.ToString() != "Email")
                {
                    if (ex.Message.ToString() == "No Data")
                    {
                        ModelState.AddModelError("Error", WebConstants.NO_DATA_FOUND_RDLC_VIEW);
                    }
                    else
                    {
                        ViewBag.DataLimit = true;
                        ModelState.AddModelError("Error", "Maximum limit of " + ConfigurationManager.AppSettings["ReportOutputLimit"].ToString() + " records reached. Refine your criteria to narrow the result.");

                    }
                        

                }
                else
                {
                    ViewBag.FromEmail = true;
                    ModelState.AddModelError("Error", WebConstants.Email_Failed);
                }
            }
       
            return PartialView("_ReportViewer");

        }

        public ActionResult LoadTracerComprehensiveByQuestion()
        {
            return PartialView("TracerComprehensiveByQuestion");
        }

        public ActionResult LoadTracerComprehensiveByResponse()
        {
            return PartialView("TracerComprehensiveByResponse");
        }

        public ActionResult LoadTracerComprehensiveByQuestionIE8()
        {
            return PartialView("TracerComprehensiveByQuestionIE8");
        }

        public ActionResult LoadTracerComprehensiveByResponseIE8()
        {
            return PartialView("TracerComprehensiveByResponseIE8");
        }
    }
}