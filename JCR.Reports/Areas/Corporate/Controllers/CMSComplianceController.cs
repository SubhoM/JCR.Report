using JCR.Reports.Areas.Corporate.Services;
using JCR.Reports.Common;
using JCR.Reports.Models;
using JCR.Reports.Models.Enums;
using JCR.Reports.Services;
using JCR.Reports.ViewModels;
using Microsoft.Reporting.WebForms;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace JCR.Reports.Areas.Corporate.Controllers
{
    public class CMSComplianceController : Controller
    {
        ExceptionService exceptionService = new ExceptionService();

        // GET: Corporate/CMSCompliance
        public ActionResult Index(int id, int? actionType)
        {
            try
            {
                HelperClasses.SetReportOrScheduleID(id, (int)ReportsListEnum.CMSCompliance);

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

                    return View(reportservice.GetCorpSearchListsForSavedParameters(AppSession.ReportScheduleID, savedParameters, WebConstants.AMP_CMS_COMPLIANCE_REPORT));
                }
                else
                    return View(reportservice.GetCorpSearchLists(WebConstants.AMP_CMS_COMPLIANCE_REPORT));
            }
            catch (Exception ex)
            {

                ExceptionLog exceptionLog = new ExceptionLog
                {
                    ExceptionText = "Reports: " + ex.Message,
                    PageName = "CMSComplianceScoring",
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

        private static void ValidateSearchCriteria(SearchCMSCompliance search)
        {
            if (search.ProgramIDs == "-1") { search.ProgramIDs = null; search.ProgramNames = "All"; }
            if (search.SelectedCoPIDs == "-1") { search.SelectedCoPIDs = null; search.SelectedCoPNames = "All"; }
            if (search.SelectedTagIDs == "-1") { search.SelectedTagIDs = null; search.SelectedTagNames = "All"; }
            if (search.SelectedIdentifiedByIDs == "-1") { search.SelectedIdentifiedByIDs = null; search.SelectedIdentifiedByNames = "All"; }
        }

        public PartialViewResult _GetCMSComplianceRDLCData(SearchCMSCompliance search, Email emailInput, string ReportType = "Summary")
        {
            ReportViewer reportViewer = new ReportViewer();
            try
            {
                ValidateSearchCriteria(search);
                var cmsComplianceService = new CMSCompliance();
                if (emailInput.To != null)
                {
                    ViewBag.FromEmail = true;
                    ViewBag.FromEmailSuccess = WebConstants.Email_Success;
                }

                reportViewer = cmsComplianceService.CMSComplianceRDLC(search, emailInput, ReportType);
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

        public ActionResult _GetCMSComplianceExcelData(SearchCMSCompliance search)
        {
            try
            {
                ValidateSearchCriteria(search);
                var cmsComplianceService = new CMSCompliance();

                JsonResult jr = new JsonResult();
                var excelData = cmsComplianceService.GetCMSComplianceExcel(search);
                jr = Json(excelData, JsonRequestBehavior.AllowGet);
                jr.MaxJsonLength = Int32.MaxValue;
                jr.RecursionLimit = 100;
                return jr;
            }
            catch (Exception ex)
            {
                ExceptionLog exceptionLog = new ExceptionLog
                {
                    ExceptionText = "Reports: " + ex.Message,
                    PageName = "CMS Compliance Report",
                    MethodName = "_GetCMSComplianceExcelData",
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