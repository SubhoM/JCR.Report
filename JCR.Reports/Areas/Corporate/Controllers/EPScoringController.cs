using System;
using System.Web.Mvc;
using JCR.Reports.Services;
using JCR.Reports.ViewModels;
using JCR.Reports.Common;
using JCR.Reports.Models;
using JCR.Reports.Models.Enums;
using Microsoft.Reporting.WebForms;
using JCR.Reports.Areas.Corporate.Services;
using System.Configuration;
using JCR.Reports.DataModel;
using System.Collections.Generic;

namespace JCR.Reports.Areas.Corporate.Controllers
{
    public class EPScoringController : Controller
    {
        ExceptionService exceptionService = new ExceptionService();

        // GET: Corporate/EPScoring
        public ActionResult Index(int id, int? actionType)
        {
            HelperClasses.SetReportOrScheduleID(id, (int)ReportsListEnum.EPScoringReport);

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

                return View(reportservice.GetCorpSearchListsForSavedParameters(AppSession.ReportScheduleID, savedParameters, WebConstants.AMP_EP_SCORING_REPORT));
            }
            else
                return View(reportservice.GetCorpSearchLists(WebConstants.AMP_EP_SCORING_REPORT));
        }

        public ActionResult GetScoredByForEPs(int? siteID, int? selectedProgramID, string selectedChapterIDs, string selectedStandardIDs, string selectedScoreType)
        {
            try
            {
                CorporateSearchInputService reportservice = new CorporateSearchInputService();
                var epsScoredBy = new List<ScoredByUser>();

                if (!siteID.HasValue)
                    return new EmptyResult();

                if (selectedProgramID.HasValue)
                    epsScoredBy = reportservice.GetScoredByForEPs((int)siteID, (int)selectedProgramID, selectedChapterIDs, selectedStandardIDs, selectedScoreType);
                else
                {
                    epsScoredBy.Insert(0, new ScoredByUser
                    {
                        UserID = Convert.ToInt32(-1),
                        UserName = "All",
                    });
                }

                return PartialView("Search/_EpScoredBy", epsScoredBy);
            }
            catch (Exception ex)
            {
                ExceptionLog exceptionLog = new ExceptionLog
                {
                    ExceptionText = "Reports: " + ex.Message,
                    PageName = "EP Scoring Report",
                    MethodName = "GetScoredByForEPs",
                    UserID = Convert.ToInt32(AppSession.UserID),
                    SiteId = Convert.ToInt32(AppSession.SelectedSiteId),
                    TransSQL = "",
                    HttpReferrer = null
                };
                exceptionService.LogException(exceptionLog);

                return RedirectToAction("Error", "Transfer");
            }
        }

        public PartialViewResult _GetEPScoringSummaryData(SearchEPScoringParams search, Email emailInput)
        {
            ReportViewer reportViewer = new ReportViewer();
            try
            {
                if (String.IsNullOrEmpty(search.ScoreValueList))
                    search.ScoreValueList = "";

                var findingsService = new EPScoringService();
                if (emailInput.To != null)
                {
                    ViewBag.FromEmail = true;
                    ViewBag.FromEmailSuccess = WebConstants.Email_Success;
                }

                reportViewer = findingsService.EPScoringSummaryRDLC(search, emailInput);
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

        public PartialViewResult _GetEPScoringDetailData(SearchEPScoringParams search, Email emailInput)
        {
            ReportViewer reportViewer = new ReportViewer();
            try
            {
                if (String.IsNullOrEmpty(search.ScoreValueList))
                    search.ScoreValueList = "";

                var findingsService = new EPScoringService();
                if (emailInput.To != null)
                {
                    ViewBag.FromEmail = true;
                    ViewBag.FromEmailSuccess = WebConstants.Email_Success;
                }

                reportViewer = findingsService.EPScoringDetailRDLC(search, emailInput);
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
            finally
            {
                if (Session["EmailSuccess"] != null)
                    Session.Remove("EmailSuccess");
            }

            Session["MyReportViewer"] = reportViewer;
            return PartialView("_ReportViewer");
        }

        public ActionResult _GetEPScoringExcelData(SearchEPScoringParams search)
        {
            try
            {
                if (String.IsNullOrEmpty(search.ScoreValueList))
                    search.ScoreValueList = "";

                JsonResult jr = new JsonResult();
                List<EpExcelDetails> EpExcelData = new List<EpExcelDetails>();
                EpExcelData = EPScoringReport.GetEPExcelDetails(search);
                jr = Json(EpExcelData, JsonRequestBehavior.AllowGet);
                jr.MaxJsonLength = Int32.MaxValue;
                jr.RecursionLimit = 100;
                return jr;
            }
            catch (Exception ex)
            {
                ExceptionLog exceptionLog = new ExceptionLog
                {
                    ExceptionText = "Reports: " + ex.Message,
                    PageName = "EP Scoring Report",
                    MethodName = "_GetEPScoringExcelData",
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