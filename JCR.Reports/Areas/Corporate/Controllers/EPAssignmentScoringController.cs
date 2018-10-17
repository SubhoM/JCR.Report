using System;
using System.Collections.Generic;
using System.Web.Mvc;
using JCR.Reports.Common;
using JCR.Reports.Models;
using JCR.Reports.Models.Enums;
using JCR.Reports.Services;
using JCR.Reports.ViewModels;
using JCR.Reports.Areas.Corporate.Models;
using Microsoft.Reporting.WebForms;
using JCR.Reports.Areas.Corporate.Services;
using JCR.Reports.Areas.Corporate.ViewModels;
using System.Configuration;

namespace JCR.Reports.Areas.Corporate.Controllers
{
    public class EPAssignmentScoringController : Controller
    {
        ExceptionService exceptionService = new ExceptionService();
        // GET: Corporate/EPAssignmentScoring
        public ActionResult Index(int id, int? actionType)
        {
            try
            {
                HelperClasses.SetReportOrScheduleID(id, (int)ReportsListEnum.EPAssignmentScoring);

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

                    return View(reportservice.GetCorpSearchListsForSavedParameters(AppSession.ReportScheduleID, savedParameters, WebConstants.AMP_EP_ASSIGNMENT_SCORING_REPORT));
                }
                else
                    return View(reportservice.GetCorpSearchLists(WebConstants.AMP_EP_ASSIGNMENT_SCORING_REPORT));
            }
            catch (Exception ex)
            {

                ExceptionLog exceptionLog = new ExceptionLog
                {
                    ExceptionText = "Reports: " + ex.Message,
                    PageName = "EPAssignmentScoring",
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

        public PartialViewResult _GetEPAssignmentScoringRDLCData(SearchEPAssignmentScoringParams search, Email emailInput, string ReportType = "Summary")
        {
            ReportViewer reportViewer = new ReportViewer();
            try
            {
                if (String.IsNullOrEmpty(search.ScoreValueList))
                    search.ScoreValueList = "";

                var findingsService = new EPAssignmentScoring();
                if (emailInput.To != null)
                {
                    ViewBag.FromEmail = true;
                    ViewBag.FromEmailSuccess = WebConstants.Email_Success;
                }

                reportViewer = findingsService.EPAssignmentScoringRDLC(search, emailInput, ReportType);
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

        public ActionResult _GetEPAssignmentScoringExcelData(SearchEPAssignmentScoringParams search)
        {

            JsonResult jr = new JsonResult();
            List<EpAssignmentScoringExcel> EpExcelData = new List<EpAssignmentScoringExcel>();

            try
            {
                if (String.IsNullOrEmpty(search.ScoreValueList))
                    search.ScoreValueList = "";

                var findingsService = new EPAssignmentScoring();
                EpExcelData = findingsService.GetEpAssignmentScoringExcel(search);
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
                        PageName = "EP Assignment Scoring Report",
                        MethodName = "_GetEPAssignmentScoringExcelData",
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