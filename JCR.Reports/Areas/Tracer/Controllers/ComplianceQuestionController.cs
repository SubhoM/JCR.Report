using System;
using System.Collections.Generic;
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
    public class ComplianceQuestionController : Controller
    {
        ExceptionService exceptionService = new ExceptionService();
        //
        // GET: /ComplianceQuestion/
        public ActionResult Index(int id, int? actionType)
        {
            
            try
            {
                HelperClasses.SetReportOrScheduleID(id, (int)ReportsListEnum.ComplianceByQuestion);
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

                    return View(reportservice.GetSavedParameters_ComplianceQuestion(AppSession.ReportScheduleID, savedParameters, WebConstants.TRACER_REPORT_TITLE_COMPLIANCE_BY_QUESTION));
                }
                else
                    return View(reportservice.GetSearchLists_ComplianceQuestion(WebConstants.TRACER_REPORT_TITLE_COMPLIANCE_BY_QUESTION));
            }
            catch (Exception ex)
            {

                ExceptionLog exceptionLog = new ExceptionLog
                {
                    ExceptionText = "Reports: " + ex.Message,
                    PageName = "ComplianceQuestion",
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

        public ActionResult Questions_Read(string TracerCustomID, string TracerQuestionCategoryID, string SearchKeyword,int SiteID , int ProgramID, int tracerTypeID)
        {

            SearchInputService reportservice = new SearchInputService();

            List<TracerQuestion> tracerquestionlist = new List<TracerQuestion>();
            tracerquestionlist = reportservice.GetSearchQuestions(TracerCustomID, TracerQuestionCategoryID, SearchKeyword, SiteID, ProgramID, tracerTypeID).TracerQuestionList.ToList();

         
            JsonResult jr = new JsonResult();

            jr = Json(tracerquestionlist, JsonRequestBehavior.AllowGet);
            jr.MaxJsonLength = Int32.MaxValue;
            jr.RecursionLimit = 100;
            return jr;


        }
        public ActionResult Questions_Details(int TracerCustomID, int QuestionID, int tracerTypeID = 1)
        {

            SearchInputService reportservice = new SearchInputService();

            List<TracerQuestionDetail> tracerquestiondetaillist = new List<TracerQuestionDetail>();
            tracerquestiondetaillist = reportservice.GetQuestionDetails(TracerCustomID, QuestionID, tracerTypeID).TracerQuestionDetailList.ToList();


            JsonResult jr = new JsonResult();

            jr = Json(tracerquestiondetaillist, JsonRequestBehavior.AllowGet);
            jr.MaxJsonLength = Int32.MaxValue;
            jr.RecursionLimit = 100;
            return jr;
        }

        public ActionResult GetQuestionView()
        {
             return PartialView("Search/_QuestionListView");
        }
       

        public ActionResult _ComplianceQuestionChartExcel([DataSourceRequest]DataSourceRequest request, TracerComplianceQuestionInput search)
        {
            var dcaService = new TracerComplianceQuestion();
            DataSourceResult result = dcaService._complianceQuestionChartExcel(request, search);
            JsonResult jr = new JsonResult();

            jr = Json(result, JsonRequestBehavior.AllowGet);
            jr.MaxJsonLength = Int32.MaxValue;
            jr.RecursionLimit = 100;
            return jr;
          
        }


        public ActionResult ComplianceQuestion_Export(string SortBy, string SortOrder)
        {
            TracerComplianceQuestionInput searchcriteria = Session["searchcriteria"] as TracerComplianceQuestionInput;
            Session.Remove("searchcriteria");
            var dcaService = new TracerComplianceQuestion();
            //if (Convert.ToInt32(searchcriteria.TopLeastCompliantQuestions) > 0)
            //{
            //    searchcriteria.TopLeastCompliantQuestions = (Convert.ToInt32(searchcriteria.TopLeastCompliantQuestions) - 1).ToString();
            //}
            string filtereddataQID = Session["filtereddataQID"].ToString();
            Session.Remove("filtereddataQID");
            byte[] fileContents = dcaService._complianceQuestionChartRDLC(searchcriteria, filtereddataQID, SortBy, SortOrder);
            string dtNow = DateTime.Now.ToString("MM-dd-yyyy_hhmmssfff_tt");
            string filename = string.Format("{0}_{1}.pdf", "Compliance By Question", dtNow.ToString());
            return File(fileContents, "application/pdf", filename);

        }
        public ActionResult _ComplianceQuestionDetailExcel([DataSourceRequest]DataSourceRequest request, TracerComplianceQuestionInput search)
        {
            var dcaService = new TracerComplianceQuestion();
         
            DataSourceResult result = dcaService._complianceQuestionDetailExcel(request, search);
            JsonResult jr = new JsonResult();

            jr = Json(result, JsonRequestBehavior.AllowGet);
            jr.MaxJsonLength = Int32.MaxValue;
            jr.RecursionLimit = 100;
            return jr;
           

        }

        public ActionResult LoadComplianceQuestionChart()
        {
            return PartialView("ComplianceQuestionGraph");
        }

        public ActionResult LoadComplianceQuestionDetail()
        {
            return PartialView("ComplianceQuestionDetail");
        }

        public ActionResult LoadComplianceQuestionDetailIE8()
        {
            return PartialView("ComplianceQuestionDetailIE8");
        }


	}
}