using System;

using System.Web.Mvc;
using JCR.Reports.Models;
using JCR.Reports.Services;

using Kendo.Mvc.UI;
using JCR.Reports.Common;

using JCR.Reports.Models.Enums;

using JCR.Reports.Areas.Tracer.Services;

namespace JCR.Reports.Areas.Tracer.Controllers
{
    public class NewEPController : Controller
    {
        // GET: Tracer/QuesEPRelation
        ExceptionService exceptionService = new ExceptionService();
        [SessionExpireFilter]
        public ActionResult Index(int id, int? actionType)
        {
            try
            {


                HelperClasses.SetReportOrScheduleID(id, (int)ReportsListEnum.NewEP);

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

                    return View(reportservice.GetSavedParameters_QuestionEPRelation(AppSession.ReportScheduleID, savedParameters, WebConstants.TRACER_REPORT_TITLE_NEW_EP_REPORT));
                }
                else
                    return View(reportservice.GetSearchLists_QuestionEPRelation(WebConstants.TRACER_REPORT_TITLE_NEW_EP_REPORT));
            }
            catch (Exception ex)
            {

                ExceptionLog exceptionLog = new ExceptionLog
                {
                    ExceptionText = "Reports: " + ex.Message,
                    PageName = "New EP",
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

        public ActionResult LoadNewEP()
        {
            return PartialView("NewEP");
        }

        public ActionResult _NewEPDataExcel([DataSourceRequest]DataSourceRequest request, Search search)
        {
            var newEPService = new NewEP();
            DataSourceResult result = newEPService.NewEPExcel(request, search);
            JsonResult jr = new JsonResult();

            jr = Json(result, JsonRequestBehavior.AllowGet);
            jr.MaxJsonLength = Int32.MaxValue;
            jr.RecursionLimit = 100;
            return jr;
         

        }

        public ActionResult GetCycleInfoNewEP()
        {
            SearchInputService reportservice = new SearchInputService();
            return PartialView("Search/_EPMigrationChangeDate", reportservice.GetCycleInfoNewEP());
        }

 

    
    }
}