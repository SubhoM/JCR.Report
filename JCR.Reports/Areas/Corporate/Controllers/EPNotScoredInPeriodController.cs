using JCR.Reports.Areas.Corporate.Services;
using JCR.Reports.Areas.Corporate.ViewModels;
using JCR.Reports.Common;
using JCR.Reports.Models;
using JCR.Reports.Models.Enums;
using JCR.Reports.Services;
using JCR.Reports.ViewModels;
using Microsoft.Reporting.WebForms;
using System;
using System.Collections.Generic;
using System.Web.Mvc;

namespace JCR.Reports.Areas.Corporate.Controllers
{
    public class EPNotScoredInPeriodController : Controller
    {
        ExceptionService exceptionService = new ExceptionService();
        // GET: Corporate/EPNotScoredInPeriod
        public ActionResult Index(int id, int? actionType)
        {
            try
            {
                HelperClasses.SetReportOrScheduleID(id, (int)ReportsListEnum.EPsNotScoredinPeriod);

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

                    return View(reportservice.GetCorpSearchListsForSavedParameters(AppSession.ReportScheduleID, savedParameters, WebConstants.AMP_EP_NOT_SCORED_IN_PERIOD_REPORT));
                }
                else
                    return View(reportservice.GetCorpSearchLists(WebConstants.AMP_EP_NOT_SCORED_IN_PERIOD_REPORT));
            }
            catch (Exception ex)
            {

                ExceptionLog exceptionLog = new ExceptionLog
                {
                    ExceptionText = "Reports: " + ex.Message,
                    PageName = "EPNotScoredInPeriodSummary",
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

        public PartialViewResult _GetEPNotScoredInPeriodRDLCData(SearchEPNotScoredInPeriodParams search, Email emailInput, string ReportType = "Summary")
        {
            ReportViewer reportViewer = new ReportViewer();
            try
            {
                if (String.IsNullOrEmpty(search.ScoreValueList))
                    search.ScoreValueList = "";

                var findingsService = new EPNotScoredInPeriod();
                if (emailInput.To != null)
                {
                    ViewBag.FromEmail = true;
                    ViewBag.FromEmailSuccess = WebConstants.Email_Success;
                }

                reportViewer = findingsService.EPNotScoredInPeriodRDLC(search, emailInput, ReportType);
                if (Session["EmailSuccess"] != null)
                {
                    if (Session["EmailSuccess"].ToString() == "false")
                    {
                        ViewBag.FromEmailSuccess = WebConstants.Email_Failed;
                    }
                }
            }
            catch (Exception ex)
            {
                if (ex.Message.ToString() != "Email")
                {
                    if (ex.Message.ToString() == "No Data")
                    {
                        ModelState.AddModelError("Error", WebConstants.NO_DATA_FOUND_RDLC_VIEW_TSR);
                    }
                }
                else
                {
                    ViewBag.FromEmail = true;
                    ModelState.AddModelError("Error", WebConstants.Email_Failed);
                }
            }
            finally
            {
                if (Session["EmailSuccess"] != null)
                    Session.Remove("EmailSuccess");
            }

            Session["MyReportViewer"] = reportViewer;
            return PartialView("_ReportViewer");
        }

        public ActionResult _GetEPNotScoredInPeriodExcelData(SearchEPNotScoredInPeriodParams search)
        {
            JsonResult jr = new JsonResult();
            List<EPNotScoredInPeriodExcel> EpExcelData = new List<EPNotScoredInPeriodExcel>();
            try
            {
                var findingsService = new EPNotScoredInPeriod();
                EpExcelData = findingsService.GetEPNotScoredInPeriodExcel(search);
                jr = Json(EpExcelData, JsonRequestBehavior.AllowGet);
                jr.MaxJsonLength = Int32.MaxValue;
                jr.RecursionLimit = 100;
                return jr;
            }
            catch (Exception ex)
            {
                if (ex.Message.ToString() == "No Data")
                {
                    jr = Json(EpExcelData, JsonRequestBehavior.AllowGet);
                    return jr;
                }
                else
                {
                    ExceptionLog exceptionLog = new ExceptionLog
                    {
                        ExceptionText = "Reports: " + ex.Message,
                        PageName = "EPNotScoredInPeriodSummary",
                        MethodName = "_GetEPNotScoredInPeriodExcelData",
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
}