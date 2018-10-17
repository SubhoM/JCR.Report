using System;
using System.Linq;
using System.Web.Mvc;
using JCR.Reports.Common;
using JCR.Reports.Services;
using Microsoft.Reporting.WebForms;
using JCR.Reports.Models;
using JCR.Reports.ViewModels;
using JCR.Reports.Models.Enums;
using JCR.Reports.Areas.Tracer.ViewModels;
using JCR.Reports.Areas.Tracer.Services;
using System.Configuration;

namespace JCR.Reports.Areas.Tracer.Controllers
{
    public class OrganizationPriorityFindingsController : Controller
    {
        // GET: OrganizationPriorityFindings
        [SessionExpireFilter]
        public ActionResult Index(int id, int? actionType)
        {
            HelperClasses.SetReportOrScheduleID(id, (int)ReportsListEnum.OrganizationPriorityFindings);

            if (AppSession.ReportScheduleID > 0)
            {
                //Load the saved parameters
                var oSaveAndScheduleService = new SaveAndScheduleService();
                var savedParameters = oSaveAndScheduleService.LoadUserSchedule(AppSession.ReportScheduleID);
                TempData["SavedParameters"] = savedParameters; //This tempdata will be used by the Ajax call to avoid loading the saved parameters again from DB
                TempData["ActionType"] = actionType;

                //Show/Hide Save to my reports button
                ViewBag.HideSaveReport = HelperClasses.HideSaveToMyReports(AppSession.RoleID, savedParameters.UserID, AppSession.UserID, actionType);
            }

            SearchInputService reportservice = new SearchInputService();
            return View(reportservice.GetOrgFindingsSearchParams(WebConstants.TRACER_REPORT_TITLE_TRACER_PRIORITY_FINDING));
        }

        public PartialViewResult _GetOrgPriorityFindings(Search search, Email emailInput)
        {
            ReportViewer reportViewer = new ReportViewer();
            try
            {
                var findingsService = new OrganizationPriorityFindings();
                if (emailInput.To != null)
                {
                    ViewBag.FromEmail = true;
                    ViewBag.FromEmailSuccess = WebConstants.Email_Success;
                }

                // reportViewer = findingsService.OrganizationPriorityFindingsRDLC(search, emailInput);
                //CommonService pdfService = new CommonService();
                // ViewBag.createPdfLocation = pdfService.GetRDLCPathtoOpen(search.ReportTitle, findingsService.OrganizationPriorityFindingsRDLC(search, emailInput));
                reportViewer = findingsService.OrganizationPriorityFindingsRDLC(search, emailInput);
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
                        //ModelState.AddModelError("Error", "Maximum number of records reached.  Please narrow your report criteria and try again.");
                    }
                }
                else
                {
                    ViewBag.FromEmail = true;
                    ModelState.AddModelError("Error", WebConstants.Email_Failed);
                }
            }

            // ViewBag.ReportViewer = reportViewer;
            Session["MyReportViewer"] = reportViewer;
            return PartialView("_ReportViewer");
        }
    }
}