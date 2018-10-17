using JCR.Reports.Common;
using JCR.Reports.DataModel;
using JCR.Reports.Models;
using JCR.Reports.Models.Enums;
using JCR.Reports.Services;
using JCR.Reports.ViewModels;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Globalization;
using System.Linq;
using System.Text;
using System.Web.Mvc;

namespace JCR.Reports.Areas.Corporate.Controllers
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

                AppSession.ReportType = "AMPReports";
                ViewBag.Message = "Reports";

                //Change it to a View model
                ViewBag.ShowHeader = true;

                ClearReportParameters();

                CommonService cs = new CommonService();
                var list = cs.SelectReporListByProductID((int)WebConstants.ProductID.AMP);

                if (AppSession.IsCMSProgram == false)
                    list = list.Where(a => a.ERReportDisplayGroupID != (int)WebConstants.ERReportDisplayGroup.CMS_Report).ToList();

                //Update report name
                if (AppSession.IsCorporateSite == false)
                {
                    string reportTitle = WebConstants.AMP_EP_SCORING_REPORT_FINAL;
                    list.First(a => a.ERReportID == (int)ReportsListEnum.EPScoringReportFinalMockSurvey).ERReportName = reportTitle;
                }


                var reportsList = list.GroupBy(lst => new { lst.ERReportDisplayGroupName, lst.ERReportDisplayGroupID })
                    .Select(grp => new ReportGroup()
                    {
                        GroupName = grp.Key.ERReportDisplayGroupName,
                        GroupID = grp.Key.ERReportDisplayGroupID,
                        rptList = grp.ToList()
                    }).ToList();

                return View(reportsList);
            }
            catch (Exception ex)
            {

                ExceptionLog exceptionLog = new ExceptionLog
                {
                    ExceptionText = "Reports: " + ex.Message,
                    PageName = "CorporatePriorityFinding",
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

        public ActionResult MyReports(string id, int pageId = 0)
        {
            try
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
                AppSession.ReportType = "AMPReports";
                ClearReportParameters();
                return View();
            }
            catch (Exception ex)
            {

                ExceptionLog exceptionLog = new ExceptionLog
                {
                    ExceptionText = "Reports: " + ex.Message,
                    PageName = "CorporatePriorityFinding",
                    MethodName = "MyReports",
                    UserID = Convert.ToInt32(AppSession.UserID),
                    SiteId = Convert.ToInt32(AppSession.SelectedSiteId),
                    TransSQL = "",
                    HttpReferrer = null
                };
                exceptionService.LogException(exceptionLog);

                return RedirectToAction("Error", "Transfer");
            }
        }

        public ActionResult SearchReports(string id, int pageId = 0)
        {
            try
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

                AppSession.ReportType = "AMPReports";
                ClearReportParameters();

                SearchViewModel searchlist = new SearchViewModel();
                CommonService cs = new CommonService();
                List<int> siteList = AppSession.Sites.Select(s => s.SiteID).ToList();
                string siteListcsv = String.Join(",", siteList.Select(x => x.ToString()).ToArray());
                bool hasCorporateSite = cs.CheckCorporateAccess(AppSession.SelectedSiteId);


                if (hasCorporateSite)
                {
                    searchlist.ERReportList = cs.SelectReporListByProductID((int)WebConstants.ProductID.AMP, true);

                }
                else
                {

                    searchlist.ERReportList = cs.SelectReporListByProductID((int)WebConstants.ProductID.AMP, true).Where(x => x.ERReportDisplayGroupID != 3).ToList();

                }

                searchlist.CreatedByUsers = cs.GetERCreatedByUsers((int)WebConstants.ProductID.AMP);
                // searchlist.ScheduleTypes = cs.GetScheduleTypes();
                searchlist.ERMyReportList = cs.SelectERMyReporList((int)WebConstants.ProductID.AMP);


                return View(searchlist);
            }
            catch (Exception ex)
            {

                ExceptionLog exceptionLog = new ExceptionLog
                {
                    ExceptionText = "Reports: " + ex.Message,
                    PageName = "CorporatePriorityFinding",
                    MethodName = "SearchReports",
                    UserID = Convert.ToInt32(AppSession.UserID),
                    SiteId = Convert.ToInt32(AppSession.SelectedSiteId),
                    TransSQL = "",
                    HttpReferrer = null
                };
                exceptionService.LogException(exceptionLog);

                return RedirectToAction("Error", "Transfer");
            }
        }

        private void ClearReportParameters()
        {
            AppSession.ReportID = 0;
            AppSession.ReportScheduleID = 0;
            AppSession.ReportScheduleName = string.Empty;
        }

        public ActionResult ERLevelSites()
        {
            try
            {
                string selectedSiteIds = "";
                var reportService = new SearchInputService();
                //Not applying filter for Task Report
                var siteLst = AppSession.ReportID == 42 ? CMSService.GetCMSSitesFiltered(AppSession.Sites.ToList()) : CMSService.GetCMSSitesFiltered(AppSession.Sites.Where(m => m.IsAMPAccess == 1).ToList());
                var levelMap = reportService.GetLevelMap(siteLst);

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

                var sites = string.Join(",", levelMap.Select(levelM => levelM.SiteID).ToList()); ;

                var siteSelectorViewModel = new SiteSelectorViewModel
                {
                    ERLevelMap = levelMap,
                    HasLevel1 = hasLevel1,
                    HasLevel2 = hasLevel2,
                    HasLevel3 = hasLevel3,
                    SelectedSiteIds = selectedSiteIds,
                    IsCorporateAccess = new CommonService().CheckCorporateAccess(sites)
                };

                switch ((ReportsListEnum)AppSession.ReportID)
                {
                    case ReportsListEnum.EPScoringReport:
                    case ReportsListEnum.TaskAssignment:
                    case ReportsListEnum.EPAssignmentScoring:
                    case ReportsListEnum.CMSCompliance:
                    case ReportsListEnum.EPsNotScoredinPeriod:
                    case ReportsListEnum.EPScoringReportFinalMockSurvey:
                    case ReportsListEnum.TaskReport:
                        return PartialView("Search/_SitesTreeForEPScoring", siteSelectorViewModel);
                    case ReportsListEnum.ComprehensiveScoringReport:
                        return PartialView("Search/_SitesTreeForEPScoring", siteSelectorViewModel);
                    default:
                        return PartialView("Search/_SitesTree", siteSelectorViewModel);
                }

            }
            catch (Exception ex)
            {

                ExceptionLog exceptionLog = new ExceptionLog
                {
                    ExceptionText = "Reports: " + ex.Message,
                    PageName = "CorporatePriorityFinding",
                    MethodName = "ERLevelSites",
                    UserID = Convert.ToInt32(AppSession.UserID),
                    SiteId = Convert.ToInt32(AppSession.SelectedSiteId),
                    TransSQL = "",
                    HttpReferrer = null
                };
                exceptionService.LogException(exceptionLog);

                return RedirectToAction("Error", "Transfer");
            }
        }

        public JsonResult LoadUserSites()
        {
            //var model = UserCustom.GetUserSitesByProdcut(Convert.ToInt32(AppSession.UserID), (int)JCR.Reports.Common.WebConstants.ProductID.AMP); ;

            var model = AppSession.Sites;
            return Json(model, JsonRequestBehavior.AllowGet);
        }

        [HttpPost]
        public EmptyResult ReloadPage(UserSite _site, bool _redirectToHome = false)
        {
            // M.Orlando: When user is on Compliance page (http://localhost:49179/Corporate/Home/Index), 
            // this is where code POSTS back to the server when the user selects different site.

            var menuService = new JCR.Reports.Services.MenuService();
            menuService.SaveArg(AppSession.UserID.GetValueOrDefault(), "SiteID", _site.SiteID.ToString());
            //menuService.SaveArg(AppSession.UserID.GetValueOrDefault(), "SiteName", _site.SiteFullName.ToString());
            //menuService.RefreshUserMenuState(AppSession.UserID.GetValueOrDefault());

            if (_redirectToHome)
            {
                return new EmptyResult();
            }
            

            var commonService = new CommonService();
            AppSession.SelectedSiteId = _site.SiteID;
            AppSession.SelectedSiteName = _site.SiteFullName;
            AppSession.IsCorporateSite = commonService.CheckCorporateAccess(AppSession.SelectedSiteId);
            AppSession.HasTracersAccess = _site.IsTracersAccess == 1 ? true : false;
            CMSService.UpdateCMSSessionValue();

            SearchInputService reportService = new SearchInputService();

            var lstPrograms = AppSession.Sites.Where(m => m.SiteID == AppSession.SelectedSiteId).FirstOrDefault().Programs;

            //Set the default program when the site is changed
            reportService.SetProgramPreference(lstPrograms);



            return new EmptyResult();
        }

        [HttpPost]
        public EmptyResult UpdatePrograms(int productID, int programID, string programName, int? advCertListTypeID) 
        {
            // M.Orlando: When user is on the Compliance page (http://localhost:49179/Corporate/Home/Index), 
            // this is where code POSTS back to the server when the user selects different program.
            var commonService = new CommonService();
            AppSession.SelectedProgramId = programID;
            AppSession.SelectedProgramName = programName;
            AppSession.SelectedCertificationItemID = Convert.ToInt32(advCertListTypeID);

            AppSession.IsCorporateSite = new CommonService().CheckCorporateAccess(AppSession.SelectedSiteId);
            SetTracersAccess();
            CMSService.UpdateCMSSessionValue();

            var menuService = new JCR.Reports.Services.MenuService();
           
            if (advCertListTypeID > 0) {
                menuService.SaveArg(AppSession.UserID.GetValueOrDefault(), "CertificationItemID", programID.ToString());
            } else {
                menuService.SaveArg(AppSession.UserID.GetValueOrDefault(), "ProgramID", programID.ToString());
            }
            //menuService.RefreshUserMenuState(AppSession.UserID.GetValueOrDefault());

            return new EmptyResult();
        }

        public void SetTracersAccess()
        {
            //Check if the current site has Tracer Access. Currently used by AMP reports
            //var lstSites = new SearchInputService().SelectTracerSitesByUser(Convert.ToInt32(AppSession.UserID), true, AppSession.SelectedSiteId);
            //if (lstSites != null && lstSites.Count() > 0)
            //    AppSession.HasTracersAccess = true;
            //else
            //    AppSession.HasTracersAccess = false;

            var site = AppSession.Sites.Where(m => m.SiteID == AppSession.SelectedSiteId).FirstOrDefault();

            AppSession.HasTracersAccess = site.IsTracersAccess == 1 ? true : false;

        }

        public JsonResult GetStickyDates(int siteID)
        {
            try
            {
                JsonResult jr = new JsonResult();
                List<StickyDate> result = CommonService.GetStickyDates(siteID, (int)AppSession.UserID);
                jr = Json(result, JsonRequestBehavior.AllowGet);
                jr.MaxJsonLength = Int32.MaxValue;
                jr.RecursionLimit = 100;
                return jr;
            }
            catch (Exception ex)
            {
                ExceptionLog exceptionLog = new ExceptionLog
                {
                    ExceptionText = "Reports: " + ex.Message,
                    PageName = "Home",
                    MethodName = "GetStickyDates",
                    UserID = Convert.ToInt32(AppSession.UserID),
                    SiteId = siteID,
                    TransSQL = "",
                    HttpReferrer = null
                };
                exceptionService.LogException(exceptionLog);

                return null;
            }
        }

        public JsonResult CheckCorporateAccess(int siteID)
        {
            try
            {
                var status =  new CommonService().CheckCorporateAccess(siteID);
                return Json(new { success = status }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                ExceptionLog exceptionLog = new ExceptionLog
                {
                    ExceptionText = "Reports: " + ex.Message,
                    PageName = "Home",
                    MethodName = "CheckCorporateAccess",
                    UserID = Convert.ToInt32(AppSession.UserID),
                    SiteId = siteID,
                    TransSQL = "",
                    HttpReferrer = null
                };
                exceptionService.LogException(exceptionLog);

                return Json(new { success = false, ex = ex }, JsonRequestBehavior.AllowGet);
            }
        }

    }
}
