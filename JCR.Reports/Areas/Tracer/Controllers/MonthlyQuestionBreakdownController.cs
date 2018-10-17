using System.Web.Mvc;
using JCR.Reports.Models;
using JCR.Reports.Services;
using Kendo.Mvc.UI;
using JCR.Reports.Common;
using System;
using JCR.Reports.Models.Enums;
using JCR.Reports.Areas.Tracer.ViewModels;
using JCR.Reports.Areas.Tracer.Services;
using Microsoft.Reporting.WebForms;
using System.Configuration;
using JCR.Reports.ViewModels;
using System.Collections.Generic;
namespace JCR.Reports.Areas.Tracer.Controllers
{
    public class MonthlyQuestionBreakdownController : Controller
    {
        ExceptionService exceptionService = new ExceptionService();
        //
        // GET: /MonthlyQuestionBreakdown/
        public ActionResult Index(int id, int? actionType)
        {
            
            try
            {

           
            HelperClasses.SetReportOrScheduleID(id, (int)ReportsListEnum.MonthlyQuestionBreakdown);

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

                return View(reportservice.GetSavedParameters_ComplianceQuestion(AppSession.ReportScheduleID, savedParameters, WebConstants.TRACER_REPORT_TITLE_MONTHLY_QUESTION_BREAKDOWN));
            }
            else
                return View(reportservice.GetSearchLists_ComplianceQuestion(WebConstants.TRACER_REPORT_TITLE_MONTHLY_QUESTION_BREAKDOWN));
            }
            catch (Exception ex)
            {

                ExceptionLog exceptionLog = new ExceptionLog
                {
                    ExceptionText = "Reports: " + ex.Message,
                    PageName = "MonthlyQuestionBreakdown",
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


        public ActionResult MonthlyQuestionBreakdownExcel([DataSourceRequest]DataSourceRequest request, Search search)
        {
            var tcService = new MonthlyBreakdownService();

            DataSourceResult result = tcService.QuestionBreakdownExcel(request, search);

            if (result.Errors != null && result.Errors.ToString() != "")
                ModelState.AddModelError("Error", result.Errors.ToString());

            var val = Json(result, JsonRequestBehavior.AllowGet);
            val.MaxJsonLength = int.MaxValue;

            return val;
        }

        public ActionResult _MonthlyQuestionBreakdownChart([DataSourceRequest]DataSourceRequest request, Search search)
        {
            var tcService = new MonthlyBreakdownService();
            Session["TotalQuestionCompliance"] = null;
            search.MonthlyReportType = "Question";

            //DataSourceResult result = tcService.QuestionBreakdownChart(request, search);
            var result = tcService.QuestionBreakdownChart(request, search);
            Session["TotalQuestionCompliance"] = tcService.GetTotalCompliance(result);
            if (result.Count == 0)
                return Json(new { Errors = WebConstants.NO_DATA_FOUND_EXCEL_VIEW });
            
            var val = Json(result, JsonRequestBehavior.AllowGet);
            val.MaxJsonLength = int.MaxValue;

            return val;
        }

        public ActionResult _GetTotalCompliance()
        {
            string returnVal = "0.0";
            if (Session["TotalQuestionCompliance"] != null)
            {
                returnVal = Session["TotalQuestionCompliance"].ToString();
                Session["TotalQuestionCompliance"] = null;
            }
            return Content(returnVal);
        }

        public ActionResult LoadMonthlyQuestionBreakdown(DateTime? StartDate, DateTime? EndDate)
        {
            ViewBag.Header = HelperClasses.GetMonthsList(StartDate, EndDate);

            return PartialView("MonthlyQuestionBreakdown");
        }

        public ActionResult LoadMonthlyQuestionBreakdownChart(Search search)
        {
            
            try
            {
                var tcService = new MonthlyBreakdownService();
                search = tcService.GetReportValuesForSearch(search);
                return PartialView("MonthlyQuestionBreakdownChart", search);
            }
            catch (Exception ex)
            {

                ExceptionLog exceptionLog = new ExceptionLog
                {
                    ExceptionText = "Reports: " + ex.Message,
                    PageName = "MonthlyQuestionBreakdown",
                    MethodName = "LoadMonthlyQuestionBreakdownChart",
                    UserID = Convert.ToInt32(AppSession.UserID),
                    SiteId = Convert.ToInt32(AppSession.SelectedSiteId),
                    TransSQL = "",
                    HttpReferrer = null
                };
                exceptionService.LogException(exceptionLog);

                return RedirectToAction("Error", "Transfer");
            }
        }

        public PartialViewResult _MonthlyQuestionBreakdown(Search search, Email emailInput)
        {

           ReportViewer reportViewer = new ReportViewer();
            try
            {
                var tcService = new MonthlyBreakdownService();
                if (emailInput.To != null)
                {

                    ViewBag.FromEmail = true;
                    ViewBag.FromEmailSuccess = WebConstants.Email_Success;
                }
                search.MonthlyReportType = "Question";
                // reportViewer = tcService.MonthlyBreakdownRDLC(search, emailInput);
                //  CommonService pdfService = new CommonService();
                // ViewBag.createPdfLocation = pdfService.GetRDLCPathtoOpen(search.ReportTitle, tcService.MonthlyBreakdownRDLC(search, emailInput));
                reportViewer = tcService.MonthlyBreakdownRDLC(search, emailInput);
                // ViewBag.ReportViewer = reportViewer;
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
          //  ViewBag.ReportViewer = reportViewer;
            return PartialView("_ReportViewer");
        }


	}
}