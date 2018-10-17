using System;
using System.Web.Mvc;
using JCR.Reports.Common;
using JCR.Reports.Services;
using JCR.Reports.Models;
using JCR.Reports.ViewModels;
using JCR.Reports.Areas.Tracer.ViewModels;
using JCR.Reports.Areas.Tracer.Services;
using static JCR.Reports.Common.WebConstants;

namespace JCR.Reports.Areas.Tracer.Controllers
{
    public class HomeController : Controller
    {
        ExceptionService exceptionService = new ExceptionService();

        public ActionResult Index(int pageId = 0)
        {
            try
            {
                if (!AppSession.HasValidSession) {
                    return RedirectToAction("Index", "Transfer", new { area = "" });
                } else {
                    // Mark Orlando 12/5/2017. Needed to support TEN. While user is in reports, as they click on different pages,
                    // the client passes pageId to controller. Controller must store pageId in AppSession. This is required
                    // because AppSession.LinkType is now read-only and derived from pageId.
                    if (pageId > 0) {
                        AppSession.PageID = pageId;
                    }
                }

                AppSession.ReportType = "TracersReports";
                ViewBag.Message = "Reports";

                //Change it to a View model
                ViewBag.ShowHeader = true;

                ClearReportParameters();

                CommonService cs = new CommonService();
                var list = cs.SelectReporListByProductID((int)WebConstants.ProductID.Tracer);
                if (AppSession.SelectedProgramId == 2 || AppSession.SelectedProgramId == 69)
                {
                    ViewBag.ShowCMSReport = true;
                }
                else
                {
                    ViewBag.ShowCMSReport = false;
                }
                ViewBag.IsCMSProgram = AppSession.IsCMSProgram;
                if (AppSession.RoleID == (int)Role.GlobalAdmin)
                {
                    foreach (var item in list)
                    {
                        item.ERReportName = item.ERReportName.Replace("Tracer", "Template");
                        item.ERReportDescription = item.ERReportDescription.Replace("Tracer", "Template");
                    }
                }
                var rtn = new ReportList { List = list };
                //  var attributes = cs.SelectReporAttributesByProductIDReportID((int) WebConstants.ProductID.Tracer,null);
                // rtn.ListAttributes=attributes;
                return View(rtn);

            }
            catch (Exception ex)
            {

                ExceptionLog exceptionLog = new ExceptionLog
                {
                    ExceptionText = "Reports: " + ex.Message,
                    PageName = "Home",
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

        public ActionResult MyReports(string id, int pageId=0)
        {
            if (!AppSession.HasValidSession) {
                return RedirectToAction("Index", "Transfer");
            } else {
                // Mark Orlando 12/5/2017. Needed to support TEN. While user is in reports, as they click on different pages,
                // the client passes pageId to controller. Controller must store pageId in AppSession. This is required
                // because AppSession.LinkType is now read-only and derived from pageId.
                if (pageId > 0) {
                    AppSession.PageID = pageId;
                }

            }
            AppSession.ReportType = "TracersReports";
            ClearReportParameters();
            return View();
        }

        public ActionResult SearchReports(string id, int pageId=0)
        {
            if (!AppSession.HasValidSession) {
                return RedirectToAction("Index", "Transfer");
            } else {
                // Mark Orlando 12/5/2017. Needed to support TEN. While user is in reports, as they click on different pages,
                // the client passes pageId to controller. Controller must store pageId in AppSession. This is required
                // because AppSession.LinkType is now read-only and derived from pageId.
                if (pageId > 0) {
                    AppSession.PageID = pageId;
                }
            }
            AppSession.ReportType = "TracersReports";
            ClearReportParameters();

            SearchViewModel searchlist = new SearchViewModel();
            CommonService cs = new CommonService();

            searchlist.ERReportList = cs.SelectReporListByProductID((int)WebConstants.ProductID.Tracer, true);
            searchlist.CreatedByUsers = cs.GetCreatedByUsers((int)WebConstants.ProductID.Tracer);
            searchlist.ScheduleTypes = cs.GetScheduleTypes();
            searchlist.ERMyReportList = cs.SelectMyReporList((int)WebConstants.ProductID.Tracer);


            return View(searchlist);
        }

        private void ClearReportParameters()
        {
            AppSession.ReportID = 0;
            AppSession.ReportScheduleID = 0;
            AppSession.ReportScheduleName = string.Empty;
            AppSession.ReportScheduleDesc = string.Empty;
        }
    }
}