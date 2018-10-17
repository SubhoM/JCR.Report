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
    public class QuesEPRelationController : Controller
    {
        // GET: Tracer/QuesEPRelation
        ExceptionService exceptionService = new ExceptionService();
        [SessionExpireFilter]
        public ActionResult Index(int id, int? actionType)
        {
            try
            {


                HelperClasses.SetReportOrScheduleID(id, (int)ReportsListEnum.QuestionEpRelation);

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
                    ViewBag.IsGlobalAdmin = AppSession.RoleID == (int)Role.GlobalAdmin;
                    return View(reportservice.GetSavedParameters_QuestionEPRelation(AppSession.ReportScheduleID, savedParameters, WebConstants.TRACER_REPORT_TITLE_Question_EP_Relation_REPORT));
                }
                else
                {
                    //ViewBag.HideSaveReport = AppSession.RoleID == (int)Role.GlobalAdmin;
                    return View(reportservice.GetSearchLists_QuestionEPRelation(WebConstants.TRACER_REPORT_TITLE_Question_EP_Relation_REPORT));
                }
            }
            catch (Exception ex)
            {

                ExceptionLog exceptionLog = new ExceptionLog
                {
                    ExceptionText = "Reports: " + ex.Message,
                    PageName = "Question - EP relation",
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

        public ActionResult LoadQuestionEPRelation()
        {
            ViewBag.IsGlobalAdmin = AppSession.RoleID == (int)Role.GlobalAdmin;
            return PartialView("QuestionEPRelation");
        }

        public ActionResult _QuestionEpRelationDataExcel([DataSourceRequest]DataSourceRequest request, Search search)
        {
            var questionEPService = new QuestionEPRelation();
            DataSourceResult result = questionEPService.QuestionEPRelationExcel(request, search);
            JsonResult jr = new JsonResult();
            ViewBag.IsGlobalAdmin = AppSession.RoleID == (int)Role.GlobalAdmin;
            jr = Json(result, JsonRequestBehavior.AllowGet);
            jr.MaxJsonLength = Int32.MaxValue;
            jr.RecursionLimit = 100;
            return jr;
         

        }

        public ActionResult GetCycleInfo()
        {
            SearchInputService reportservice = new SearchInputService();
            return PartialView("Search/_EPMigrationChangeDate", reportservice.GetCycleInfo());
        }

        /// <summary>
        /// Get tracers list based on selected site id or tracer category change
        /// </summary>
        /// <returns>PartialView</returns>
        public ActionResult GetTracersList(int selectedsiteid, string selectedsitename, string TracerStatus)
        {
            CheckSession(selectedsiteid, selectedsitename);
            SearchInputService reportservice = new SearchInputService();

            if (AppSession.RoleID == (int)Role.GlobalAdmin)
            {
                return PartialView("Search/_TemplatesList", reportservice.GetAllTracersList(TracerStatus));
            }
            else
            {
                return PartialView("Search/_TracersList", reportservice.GetAllTracersList(TracerStatus));
            }
        }

        [SessionExpireFilter]
        private void CheckSession(int selectedsiteid, string selectedsitename, int selectedProgramId = 0, string selectedProgramName = "")
        {
            if (selectedsiteid > 0)
            {
                AppSession.SelectedSiteId = selectedsiteid;
                AppSession.SelectedSiteName = selectedsitename;
            }

            if (selectedProgramId > 0)
            {
                AppSession.SelectedProgramId = selectedProgramId;
                AppSession.SelectedProgramName = selectedProgramName;
            }
        }
    }
}