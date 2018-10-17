using System;
using System.Collections.Generic;
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
    public class TracerByEPController : Controller
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

            HelperClasses.SetReportOrScheduleID(id, (int)ReportsListEnum.TracerByEP);

            SearchInputService reportservice = new SearchInputService();
            SearchList list = new SearchList();
            string savedChapters = string.Empty;
            string savedStandards = string.Empty;

            if (AppSession.ReportScheduleID > 0)
            {
                //Load the saved parameters
                var oSaveAndScheduleService = new SaveAndScheduleService();
                var savedParameters = oSaveAndScheduleService.LoadUserSchedule(AppSession.ReportScheduleID);
                TempData["SavedParameters"] = savedParameters; //This tempdata will be used by the Ajax call to avoid loading the saved parameters again from DB
                TempData["ActionType"] = actionType;

                //Show/Hide Save to my reports button
                ViewBag.HideSaveReport = HelperClasses.HideSaveToMyReports(AppSession.RoleID, savedParameters.UserID, AppSession.UserID, actionType);

                //Get the saved Chapters and Standards
                savedChapters = savedParameters.ReportParameters.FirstOrDefault(param => param.ReportParameterName == WebConstants.TRACERS_CHAPTER).ParameterValue;
                savedStandards = savedParameters.ReportParameters.FirstOrDefault(param => param.ReportParameterName == WebConstants.TRACERS_STANDARD).ParameterValue;

                list = reportservice.GetSearchListsForSavedParameters(AppSession.ReportScheduleID, savedParameters, WebConstants.TRACER_REPORT_TITLE_TRACE_BY_EP_REPORT);
            }
            else
                list = reportservice.GetSearchLists(WebConstants.TRACER_REPORT_TITLE_TRACE_BY_EP_REPORT);

            list.TracersChapters = reportservice.GetTracersChapters().TracersChapters;

            List<TracersStandards> standardList = new List<TracersStandards>();
            if (!String.IsNullOrWhiteSpace(savedChapters) && savedChapters != "-1") //Load standards only for the selected Chapters
            {
                standardList = reportservice.GetTracersStandards(savedChapters).TracersStandards.ToList();
            }
            else
            {
                standardList.Add(new TracersStandards
                {
                    TracerStandardID = Convert.ToInt32(-1),
                    Code = "All"
                });
            }
            list.TracersStandards = standardList;

            List<TracersEP> epList = new List<TracersEP>();
            if (!String.IsNullOrWhiteSpace(savedStandards) && savedStandards != "-1") //Load EPs only for the selected Standards and Chapters
            {
                epList = reportservice.GetTracersEPs(savedChapters, savedStandards).TracersEPs.ToList();
            }
            else
            {
                epList.Add(new TracersEP
                {
                    EPTextID = Convert.ToInt32(-1),
                    StandardLabelAndEPLabel = "All",

                });
            }

            list.TracersEPs = epList;
            return View(list);
            }
            catch (Exception ex)
            {

                ExceptionLog exceptionLog = new ExceptionLog
                {
                    ExceptionText = "Reports: " + ex.Message,
                    PageName = "TracerByEP",
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

        public PartialViewResult _TracerByEP(Search search, Email emailInput)
        {

            ReportViewer reportViewer = new ReportViewer();
            try
            {
                var tcService = new TracerByEP();
                if (emailInput.To != null)
                {

                    ViewBag.FromEmail = true;
                    ViewBag.FromEmailSuccess = WebConstants.Email_Success;
                }
         
                reportViewer = tcService.TracerByEPRDLC(search, emailInput);
             
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


        public ActionResult _TracerByEPGroupByEPExcel([DataSourceRequest]DataSourceRequest request, Search search)
        {

            var tcService = new TracerByEP();

            DataSourceResult result = tcService.TracerByEPExcel(request, search);

            if (result.Errors != null && result.Errors.ToString() != "")
                ModelState.AddModelError("Error", result.Errors.ToString());

            var val = Json(result, JsonRequestBehavior.AllowGet);
            val.MaxJsonLength = int.MaxValue;

            return val;
        }




        public ActionResult LoadTracerByEPGroupByStandard()
        {
            return PartialView("TracerByEPGroupByStandard");
        }

        public ActionResult LoadTracerByEPGroupByEP()
        {
            return PartialView("TracerByEPGroupByEP");
        }

        public ActionResult LoadTracerByEPGroupByEPDept()
        {
            return PartialView("TracerByEPGroupByEPDept");
        }

        public ActionResult LoadTracerByEPGroupByEPQues()
        {
            return PartialView("TracerByEPGroupByEPQues");
        }

        public ActionResult LoadTracerByEPGroupByStandardIE8()
        {
            return PartialView("TracerByEPGroupByStandardIE8");
        }

        public ActionResult LoadTracerByEPGroupByEPIE8()
        {
            return PartialView("TracerByEPGroupByEPIE8");
        }

        public ActionResult LoadTracerByEPGroupByEPDeptIE8()
        {
            return PartialView("TracerByEPGroupByEPDeptIE8");
        }

        public ActionResult LoadTracerByEPGroupByEPQuesIE8()
        {
            return PartialView("TracerByEPGroupByEPQuesIE8");
        }
    }
}