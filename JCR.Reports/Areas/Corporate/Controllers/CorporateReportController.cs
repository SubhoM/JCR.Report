using System;
using System.Linq;
using System.Web.Mvc;
using JCR.Reports.Services;
using JCR.Reports.ViewModels;
using JCR.Reports.Common;
using JCR.Reports.Models;
using JCR.Reports.Models.Enums;
using JCR.Reports.DataModel;

namespace JCR.Reports.Areas.Corporate.Controllers
{
    public class CorporateReportController : Controller
    {
        ExceptionService exceptionService = new ExceptionService();

        // GET: Corporate/CorporateReport
        public ActionResult Index()
        {
            return View();
        }

        public ActionResult GetProgramsList(string selectedSiteIDs, string selectedProgramIDs = "")
        {
            try
            {
                var programlist = StandardData.GetProgramSites(selectedSiteIDs).OrderBy(item => item.SortOrder);

                var programs = selectedProgramIDs.Trim().TrimEnd(',').Split(',');

                if (selectedProgramIDs.Length > 0 && selectedProgramIDs != "-1")
                    programlist = programlist.Where(item => programs.Contains(item.BaseProgramID.ToString().Trim())).OrderBy(item => item.SortOrder);

                return PartialView("Search/_ReportsProgramSelect", programlist);
            }
            catch (Exception ex)
            {
                ExceptionLog exceptionLog = new ExceptionLog
                {
                    ExceptionText = "Reports: " + ex.Message,
                    PageName = "CorporatePriorityFinding",
                    MethodName = "GetMultiSitePrograms",
                    UserID = Convert.ToInt32(AppSession.UserID),
                    SiteId = Convert.ToInt32(AppSession.SelectedSiteId),
                    TransSQL = "",
                    HttpReferrer = null
                };
                exceptionService.LogException(exceptionLog);

                return RedirectToAction("Error", "Transfer");
            }

        }
        
        public ActionResult IsCMSSite(string selectedSiteIDs)
        {
            try
            {
                CorporateSearchInputService reportservice = new CorporateSearchInputService();
                var isCMS = reportservice.CheckCMSForSiteID(selectedSiteIDs);
                JsonResult jr = new JsonResult();
                jr = Json(isCMS, JsonRequestBehavior.AllowGet);
                jr.MaxJsonLength = Int32.MaxValue;
                jr.RecursionLimit = 100;
                return jr;
           }
            catch (Exception ex)
            {
                ExceptionLog exceptionLog = new ExceptionLog
                {
                    ExceptionText = "Reports: " + ex.Message,
                    PageName = "CorporatePriorityFinding",
                    MethodName = "IsCMSSite",
                    UserID = Convert.ToInt32(AppSession.UserID),
                    SiteId = Convert.ToInt32(AppSession.SelectedSiteId),
                    TransSQL = "",
                    HttpReferrer = null
                };
                exceptionService.LogException(exceptionLog);

                return RedirectToAction("Error", "Transfer");
            }
        }

        public ActionResult GetMultiSitePrograms(string selectedSiteIDs)
        {
            try
            {
                CorporateSearchInputService reportservice = new CorporateSearchInputService();
                //if (AppSession.ReportID == (int)ReportsListEnum.EPScoringReport)
                //{
                //    var programs = reportservice.GetMultiSitePrograms(selectedSiteIDs);
                //    programs.First().ProgramName = "Select Program";
                //    return PartialView("Search/_MultiSiteProgram", programs);
                //}
                //else
                //{
                    return PartialView("Search/_MultiSiteProgram", reportservice.GetMultiSitePrograms(selectedSiteIDs));
               // }
            }

            catch (Exception ex)
            {
                ExceptionLog exceptionLog = new ExceptionLog
                {
                    ExceptionText = "Reports: " + ex.Message,
                    PageName = "CorporatePriorityFinding",
                    MethodName = "GetMultiSitePrograms",
                    UserID = Convert.ToInt32(AppSession.UserID),
                    SiteId = Convert.ToInt32(AppSession.SelectedSiteId),
                    TransSQL = "",
                    HttpReferrer = null
                };
                exceptionService.LogException(exceptionLog);

                return RedirectToAction("Error", "Transfer");
            }
        }

        public ActionResult GetMultiSiteChapters(string selectedSiteIDs, int allPrograms, string selectedProgramIDs)
        {
            try
            {
                CorporateSearchInputService reportservice = new CorporateSearchInputService();

                return PartialView("Search/_MultiSiteChapter", reportservice.GetMultiSiteChapters(selectedSiteIDs, selectedProgramIDs));
            }
            catch (Exception ex)
            {
                ExceptionLog exceptionLog = new ExceptionLog
                {
                    ExceptionText = "Reports: " + ex.Message,
                    PageName = "CorporatePriorityFinding",
                    MethodName = "GetMultiSiteChapters",
                    UserID = Convert.ToInt32(AppSession.UserID),
                    SiteId = Convert.ToInt32(AppSession.SelectedSiteId),
                    TransSQL = "",
                    HttpReferrer = null
                };
                exceptionService.LogException(exceptionLog);

                return RedirectToAction("Error", "Transfer");
            }
        }

        public ActionResult GetMultiSiteStandards(string selectedProgramIDs, string selectedChapterIDs)
        {

            try
            {
                CorporateSearchInputService reportservice = new CorporateSearchInputService();

                return PartialView("Search/_MultiSiteStandardsList", reportservice.GetMultiSiteStandards(selectedProgramIDs, selectedChapterIDs));
            }
            catch (Exception ex)
            {
                ExceptionLog exceptionLog = new ExceptionLog
                {
                    ExceptionText = "Reports: " + ex.Message,
                    PageName = "CorporatePriorityFinding",
                    MethodName = "GetMultiSiteStandards",
                    UserID = Convert.ToInt32(AppSession.UserID),
                    SiteId = Convert.ToInt32(AppSession.SelectedSiteId),
                    TransSQL = "",
                    HttpReferrer = null
                };
                exceptionService.LogException(exceptionLog);

                return RedirectToAction("Error", "Transfer");
            }
        }

        public ActionResult GetMultiSiteEPs(string selectedProgramIDs, string selectedChapterIDs, string selectedStandards)
        {
            try
            {
                CorporateSearchInputService reportservice = new CorporateSearchInputService();

                return PartialView("Search/_MultiSiteEPsList", reportservice.GetMultiSiteEPs(selectedProgramIDs, selectedChapterIDs, selectedStandards));
            }
            catch (Exception ex)
            {
                ExceptionLog exceptionLog = new ExceptionLog
                {
                    ExceptionText = "Reports: " + ex.Message,
                    PageName = "CorporatePriorityFinding",
                    MethodName = "GetMultiSiteEPs",
                    UserID = Convert.ToInt32(AppSession.UserID),
                    SiteId = Convert.ToInt32(AppSession.SelectedSiteId),
                    TransSQL = "",
                    HttpReferrer = null
                };
                exceptionService.LogException(exceptionLog);

                return RedirectToAction("Error", "Transfer");
            }
        }

        public ActionResult GetMockSurveyCriteria(string selectedSiteIDs)
        {
            try
            {
                CorporateSearchInputService reportservice = new CorporateSearchInputService();

                return PartialView("Search/_MockSurveyCriteria", reportservice.GetMockSurveyCriteria(selectedSiteIDs));
            }
            catch (Exception ex)
            {
                ExceptionLog exceptionLog = new ExceptionLog
                {
                    ExceptionText = "Reports: " + ex.Message,
                    PageName = "CorporatePriorityFinding",
                    MethodName = "GetMockSurveyCriteria",
                    UserID = Convert.ToInt32(AppSession.UserID),
                    SiteId = Convert.ToInt32(AppSession.SelectedSiteId),
                    TransSQL = "",
                    HttpReferrer = null
                };
                exceptionService.LogException(exceptionLog);

                return RedirectToAction("Error", "Transfer");
            }
        }

        public JsonResult GetReportHcoIDs(string selectedSiteIDs)
        {
            try
            {
                return Json(CorporateFinding.GetReportHcoIDs(selectedSiteIDs), JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                ExceptionLog exceptionLog = new ExceptionLog
                {
                    ExceptionText = "Reports: " + ex.Message,
                    PageName = "CorporatePriorityFinding",
                    MethodName = "GetReportHCOIDs",
                    UserID = Convert.ToInt32(AppSession.UserID),
                    SiteId = Convert.ToInt32(AppSession.SelectedSiteId),
                    TransSQL = "",
                    HttpReferrer = null
                };
                exceptionService.LogException(exceptionLog);

                return Json(RedirectToAction("Error", "Transfer"));
            }
        }

        public ActionResult GetMultiSiteCoPs(string selectedProgramIDs)
        {
            try
            {
                return PartialView("Search/_MultiSiteCoP", CMSService.GetCoPsByProgramID(selectedProgramIDs));
            }
            catch (Exception ex)
            {
                ExceptionLog exceptionLog = new ExceptionLog
                {
                    ExceptionText = "Reports: " + ex.Message,
                    PageName = "CorporateReportController",
                    MethodName = "GetMultiSiteCoPs",
                    UserID = Convert.ToInt32(AppSession.UserID),
                    SiteId = Convert.ToInt32(AppSession.SelectedSiteId),
                    TransSQL = "",
                    HttpReferrer = null
                };
                exceptionService.LogException(exceptionLog);

                return RedirectToAction("Error", "Transfer");
            }
        }

        public ActionResult GetMultiSiteTags(string selectedProgramIDs, string selectedCoPIDs)
        {
            try
            {
                return PartialView("Search/_MultiSiteTags", CMSService.GetTagsByProgramIDAndCoPID(selectedProgramIDs, selectedCoPIDs));
            }
            catch (Exception ex)
            {
                ExceptionLog exceptionLog = new ExceptionLog
                {
                    ExceptionText = "Reports: " + ex.Message,
                    PageName = "CorporateReportController",
                    MethodName = "GetMultiSiteTags",
                    UserID = Convert.ToInt32(AppSession.UserID),
                    SiteId = Convert.ToInt32(AppSession.SelectedSiteId),
                    TransSQL = "",
                    HttpReferrer = null
                };
                exceptionService.LogException(exceptionLog);

                return RedirectToAction("Error", "Transfer");
            }
        }

        public ActionResult GetIdentifiedBy(string selectedSiteIDs, string programIDs, string coPIDs, string tagIDs)
        {
            try
            {
                programIDs = programIDs == "-1" ? null : programIDs;
                coPIDs = coPIDs == "-1" ? null : coPIDs;
                tagIDs = tagIDs == "-1" ? null : tagIDs;

                return PartialView("Search/_IdentifiedBy", CMSService.GetIdentifiedUsers(selectedSiteIDs, programIDs, coPIDs, tagIDs));
            }
            catch (Exception ex)
            {
                ExceptionLog exceptionLog = new ExceptionLog
                {
                    ExceptionText = "Reports: " + ex.Message,
                    PageName = "CorporateReportController",
                    MethodName = "GetMultiSiteTags",
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