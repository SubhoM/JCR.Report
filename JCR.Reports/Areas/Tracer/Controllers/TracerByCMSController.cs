using System;
using System.Linq;
using System.Web.Mvc;
using JCR.Reports.Models;
using JCR.Reports.Services;
using Kendo.Mvc.UI;
using JCR.Reports.Common;
using JCR.Reports.Models.Enums;
using JCR.Reports.Areas.Tracer.ViewModels;
using JCR.Reports.Areas.Tracer.Services;
namespace JCR.Reports.Areas.Tracer.Controllers
{
    public class TracerByCMSController : Controller
    {
        ExceptionService exceptionService = new ExceptionService();
        [SessionExpireFilter]
        public ActionResult Index(int id, int? actionType)
        {
            
            try
            {

           
            if (!AppSession.HasValidSession)
            {
                SessionExpired();
            }

            HelperClasses.SetReportOrScheduleID(id, (int)ReportsListEnum.TracerByCMS);

            SearchInputService reportservice = new SearchInputService();
            var list = reportservice.GetSearchLists(WebConstants.TRACER_REPORT_TITLE_TRACE_BY_CMS_REPORT);
            list.TracersChapters = reportservice.GetTracersChapters().TracersChapters;
            ViewBag.allSites = false;
            if (AppSession.ReportScheduleID > 0)
            {
                //Load the saved parameters
                var oSaveAndScheduleService = new SaveAndScheduleService();
                var savedParameters = oSaveAndScheduleService.LoadUserSchedule(AppSession.ReportScheduleID);
                TempData["SavedParameters"] = savedParameters; //This tempdata will be used by the Ajax call to avoid loading the saved parameters again from DB
                TempData["ActionType"] = actionType;

                //Show/Hide Save to my reports button
                ViewBag.HideSaveReport = HelperClasses.HideSaveToMyReports(AppSession.RoleID, savedParameters.UserID, AppSession.UserID, actionType);

                int? chapterID = null;
                if (savedParameters.ReportParameters.Find(param => param.ReportParameterName == WebConstants.TRACERS_CHAPTER) != null)
                    chapterID = Convert.ToInt32(savedParameters.ReportParameters.Find(param => param.ReportParameterName == WebConstants.TRACERS_CHAPTER).ParameterValue);

                list.CMSTags = reportservice.GetTracersCMS(chapterID == -1 ? null : chapterID).CMSTags;
            }
            else
                list.CMSTags = reportservice.GetTracersCMS(null).CMSTags;

            return View(list);
            }
            catch (Exception ex)
            {

                ExceptionLog exceptionLog = new ExceptionLog
                {
                    ExceptionText = "Reports: " + ex.Message,
                    PageName = "TracerByCMS",
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


        public ActionResult _TracerByCMSExcel([DataSourceRequest]DataSourceRequest request, Search search)
        {

            var tcService = new TracerByCMS();

            DataSourceResult result = tcService.TracerByCMSExcel(request, search);

            if (result.Errors != null && result.Errors.ToString() != "")
                ModelState.AddModelError("Error", result.Errors.ToString());

            var val = Json(result, JsonRequestBehavior.AllowGet);
            val.MaxJsonLength = int.MaxValue;

            return val;
        }

        public ActionResult _TracerByCMSGraph([DataSourceRequest]DataSourceRequest request, Search search)
        {

            var tcService = new TracerByCMS();

            DataSourceResult result = tcService.TracerByCMSChart(request, search);

            if (result.Errors != null && result.Errors.ToString() != "")
                ModelState.AddModelError("Error", result.Errors.ToString());

            var val = Json(result, JsonRequestBehavior.AllowGet);
            val.MaxJsonLength = int.MaxValue;

            return val;
        }

        public ActionResult LoadTracerByCMS()
        {
            return PartialView("TracerByCMS");
        }

        public ActionResult LoadTracerByCMSIE8()
        {
            return PartialView("TracerByCMSIE8");
        }

        public ActionResult LoadTracerByCMSGraph()
        {
            return PartialView("TracerByCMSGraph");
        }
        public ActionResult CMSPDF_Export(string SortBy, string SortOrder)
        {
            Search searchcriteria = Session["searchcriteria"] as Search;
            Session.Remove("searchcriteria");
            var cmsService = new TracerByCMS();
           
            string filtereddataTag = Session["filtereddataCMS"].ToString();
            Session.Remove("filtereddataCMS");
            byte[] fileContents = cmsService.TracerByCMSIE(searchcriteria, 1, filtereddataTag, SortBy, SortOrder);
            string dtNow = DateTime.Now.ToString("MM-dd-yyyy_hhmmssfff_tt");
            string filename = string.Format("{0}_{1}.pdf", "Tracer by CMS", dtNow.ToString());
            return File(fileContents, "application/pdf", filename);

        }
    }
}