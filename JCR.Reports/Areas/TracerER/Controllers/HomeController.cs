using System;
using System.Web.Mvc;
using JCR.Reports.Common;
using JCR.Reports.Services;
using JCR.Reports.Models;
using JCR.Reports.ViewModels;
using System.Linq;


namespace JCR.Reports.Areas.TracerER.Controllers
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
                AppSession.ReportType = "ERTracersReport";
                ViewBag.Message = "Tracer Enterprise Reporting";

                //Change it to a View model
                ViewBag.ShowHeader = true;

                ViewBag.IsCMSProgram = AppSession.IsCMSProgram;

                ClearReportParameters();

                CommonService cs = new CommonService();
                var list = cs.SelectReporListByProductID((int)WebConstants.ProductID.TracerER);

                var rtn = new ReportList { List = list };
                //  var attributes = cs.SelectReporAttributesByProductIDReportID((int) WebConstants.ProductID.Tracer,null);
                // rtn.ListAttributes=attributes;
                return View(rtn);
            }
            catch (Exception ex)
            {
                ExceptionLog exceptionLog = new ExceptionLog
                {
                    ExceptionText = " Tracer ER Reports: " + ex.Message,
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

        public ActionResult MyReports(int pageId = 0)
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

            AppSession.ReportType = "ERTracersReport";
            ClearReportParameters();

            return View();
        }

        public ActionResult SearchReports(int pageId = 0)
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

            AppSession.ReportType = "ERTracersReport";
            ClearReportParameters();

            SearchViewModel searchlist = new SearchViewModel();
            CommonService cs = new CommonService();
            searchlist.ERReportList = cs.SelectReporListByProductID((int)WebConstants.ProductID.TracerER, true);
            searchlist.CreatedByUsers = cs.GetERCreatedByUsers((int)WebConstants.ProductID.TracerER);
            searchlist.ScheduleTypes = cs.GetScheduleTypes();
            // this needs to be modified based user and selected sites.
            searchlist.ERMyReportList = cs.SelectERMyReporList((int)WebConstants.ProductID.TracerER);

            return View(searchlist);
        }

        private void ClearReportParameters()
        {
            AppSession.ReportID = 0;
            AppSession.ReportScheduleID = 0;
            AppSession.ReportScheduleName = string.Empty;
        }

        public ActionResult ERLevelSites()
        {
            string selectedSiteIds = "";
            var reportService = new SearchInputService();

            var sites = AppSession.Sites.Where(m => m.IsTracersAccess == 1).ToList();
            var levelMap = reportService.GetLevelMap(sites);
            
            AppSession.SessionERLevelInformation = reportService.GetLevelInformation(AppSession.SelectedSiteId);
            levelMap = levelMap.OrderByDescending(l => l.ERLevel1.ERLevel1ID)
                             .ThenBy(l => l.ERLevel2.ERLevel2Name)
                             .ThenBy(l => l.ERLevel3.ERLevel3Name)
                             .ToList();

            bool hasLevel1 = levelMap.Where(l => l.ERLevel1ID > 0).Count() > 0 ? true : false;
            bool hasLevel2 = levelMap.Where(l => l.ERLevel2ID > 0).Count() > 0 ? true : false;
            bool hasLevel3 = levelMap.Where(l => l.ERLevel3ID > 0).Count() > 0 ? true : false;

            // if there are no level 1 names (or (None)), set to false
            if (hasLevel1)
            {
                if (levelMap.Where(l => !String.IsNullOrEmpty(l.ERLevel1.ERLevel1Name)).Count() == 0)
                {
                    hasLevel1 = false;
                }
            }

            //Get the selected sites for the saved report
            if (AppSession.ReportScheduleID > 0 && TempData["SavedParameters"] != null)
            {
                var oScheduleDate = new SaveAndSchedule();
                oScheduleDate = (SaveAndSchedule)TempData["SavedParameters"];
                selectedSiteIds = string.Join(",", oScheduleDate.ReportSiteMaps.Select(siteMaps => siteMaps.SiteID).ToList());
            }

            var siteSelectorViewModel = new SiteSelectorViewModel
            {
                ERLevelMap = levelMap,
                HasLevel1 = hasLevel1,
                HasLevel2 = hasLevel2,
                HasLevel3 = hasLevel3,
                SelectedSiteIds = selectedSiteIds
            };
            //var dataContext = new SampleEntities();

            //var employees = from e in dataContext.Employees
            //                where (id.HasValue ? e.ReportsTo == id : e.ReportsTo == null)
            //                select new
            //                {
            //                    id = e.EmployeeID,
            //                    Name = e.FirstName + " " + e.LastName,
            //                    hasChildren = e.Employees1.Any()
            //                };
            return PartialView("Search/_SitesTree", siteSelectorViewModel);
            // return Json(siteSelectorViewModel, JsonRequestBehavior.AllowGet);
        }

    }
}
