using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Configuration;
using JCR.Reports.Common;
using JCR.Reports.Models;
using JCR.Reports.Models.Enums;
using JCR.Reports.Services;
using JCR.Reports.DataModel;
using JCR.Reports.ViewModels;
using JCR.Reports.Areas.Corporate.ViewModels;

namespace JCR.Reports.Areas.Corporate.Controllers
{
    public class PriorityTjcRFIController : Controller
    {
        ExceptionService exceptionService = new ExceptionService();
        /// <summary>
        /// Load Department Comparative Analysis report default parameters
        /// </summary>
        /// <returns>View</returns>
        [SessionExpireFilter]

        // GET: Corporate/PriorityTjcRFI
        public ActionResult Index(int id, int? actionType)
        {
            try
            {

                HelperClasses.SetReportOrScheduleID(id, (int)ReportsListEnum.RFIFindingReport);


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

                    return View(reportservice.GetCorpSearchListsForSavedParameters(AppSession.ReportScheduleID, savedParameters, WebConstants.RFI_REPORT_TITLE_FINDING_REPORT));
                }
                else
                    return View(reportservice.GetCorpSearchLists(WebConstants.RFI_REPORT_TITLE_FINDING_REPORT));
            }
            catch (Exception ex)
            {

                ExceptionLog exceptionLog = new ExceptionLog
                {
                    ExceptionText = "Reports: " + ex.Message,
                    PageName = "PriorityFindingRFI",
                    MethodName = "RFIFindingSummaryIndex",
                    UserID = Convert.ToInt32(AppSession.UserID),
                    SiteId = Convert.ToInt32(AppSession.SelectedSiteId),
                    TransSQL = "",
                    HttpReferrer = null
                };
                exceptionService.LogException(exceptionLog);

                return RedirectToAction("Error", "Transfer");
            }
        }
        public ActionResult LoadRFISummary()
        {
            try
            {
                return PartialView("PriorityTjcRFI");
            }

            catch (Exception ex)
            {

                ExceptionLog exceptionLog = new ExceptionLog
                {
                    ExceptionText = "Reports: " + ex.Message,
                    PageName = "CorporatePriorityFinding",
                    MethodName = "AMPCorporateSummaryLoadCorporateSummary",
                    UserID = Convert.ToInt32(AppSession.UserID),
                    SiteId = Convert.ToInt32(AppSession.SelectedSiteId),
                    TransSQL = "",
                    HttpReferrer = null
                };
                //exceptionService.LogException(exceptionLog);

                return RedirectToAction("Error", "Transfer");
            }
        }
        public ActionResult RFIReport_Data(SearchCorporateER search, int LevelIdentifier)
        {
            try
            {
                JsonResult jr = new JsonResult();
                if (search.ProgramIDs == "-1") search.ProgramIDs = null;
                if (search.SelectedChapterIDs == "-1") search.SelectedChapterIDs = null;
                if (search.SelectedStandardIDs == "-1") search.SelectedStandardIDs = null;

                string JCREmailDomain = "@JCRINC.COM";
                string JCREmailDomain2 = "@JCAHO.COM";
                string encryptionKey = ConfigurationManager.AppSettings.Get("EncryptionKey");

                switch (LevelIdentifier)
                {
                    case (int)WebConstants.RFISummaryLevels.Level1_Program:
                        {

                            List<RFIProgramFinding> Level1Data = new List<RFIProgramFinding>();
                            Level1Data = TJCRFIFinding.GetRFIFindingByProgram(search);

                            jr = Json(Level1Data, JsonRequestBehavior.AllowGet);
                            break;
                        }

                    case (int)WebConstants.RFISummaryLevels.Level2_Chapter:
                        {
                            if (search.IsDuplicateLoadCall)
                            {
                                jr = TempData["PTR_Level2Data"] as JsonResult;
                            }
                            else
                            {
                                List<RFIChapterFinding> Level2Data = new List<RFIChapterFinding>();
                                Level2Data = TJCRFIFinding.GetRFIFindingByChapter(search);
                                jr = Json(Level2Data, JsonRequestBehavior.AllowGet);
                                TempData["PTR_Level2Data"] = jr;
                            }
                            break;
                        }
                    case (int)WebConstants.RFISummaryLevels.Level3_Standard:
                        {

                            if (search.IsDuplicateLoadCall)
                            {
                                jr = TempData["PTR_Level3Data"] as JsonResult;
                            }
                            else
                            {
                                List<RFIStandardFinding> Level3Data = new List<RFIStandardFinding>();
                                Level3Data = TJCRFIFinding.GetRFIFindingByStandard(search);

                                var max = Convert.ToInt32(Level3Data.Max(r => r.CumulativePerc));
                                Session["MaxStandardCount"] = max >= 100 ? 100 : max;

                                jr = Json(Level3Data, JsonRequestBehavior.AllowGet);
                                TempData["PTR_Level3Data"] = jr;
                            }
                            break;
                        }
                    case (int)WebConstants.RFISummaryLevels.Level4_EP:
                        {
                            string tjcFinding = string.Empty;
                            List<RFIEPFinding> Level4Data = new List<RFIEPFinding>();

                            Level4Data = TJCRFIFinding.GetRfiEPDetails(search);

                            if (!AppSession.EmailAddress.ToUpper().Contains(JCREmailDomain) && !AppSession.EmailAddress.ToUpper().Contains(JCREmailDomain2))
                            {
                                Level4Data.ToList().ForEach(data =>
                                {
                                    data.TJCFinding = CryptHelpers.RFIDecrypt(data.TJCFinding, encryptionKey);
                                });
                            }
                            else
                            {
                                Level4Data.ToList().ForEach(data => data.TJCFinding = string.Empty);
                            }

                            jr = Json(Level4Data, JsonRequestBehavior.AllowGet);
                            break;
                        }
                    case (int)WebConstants.RFISummaryLevels.Level5_EPDetails:
                        {
                            List<RFIStandardFinding> Level5Data = new List<RFIStandardFinding>();
                            Level5Data = TJCRFIFinding.GetRFIFindingByStandard(search);
                            jr = Json(Level5Data, JsonRequestBehavior.AllowGet);
                            break;
                        }

                }
                jr.MaxJsonLength = Int32.MaxValue;
                jr.RecursionLimit = 100;
                return jr;
            }

            catch (Exception ex)
            {

                ExceptionLog exceptionLog = new ExceptionLog
                {
                    ExceptionText = "Reports: " + ex.Message,
                    PageName = "TjcRFIFinding",
                    MethodName = "RFIReport_Data",
                    UserID = Convert.ToInt32(AppSession.UserID),
                    SiteId = Convert.ToInt32(AppSession.SelectedSiteId),
                    TransSQL = "",
                    HttpReferrer = null
                };
                exceptionService.LogException(exceptionLog);

                return RedirectToAction("Error", "Transfer");
            }

        }

        public ActionResult RFIEPLevelDetails_Data(SearchCorporateER search)
        {
            try
            {
                string JCREmailDomain = "@JCRINC.COM";
                string JCREmailDomain2 = "@JCAHO.COM";
                string encryptionKey = ConfigurationManager.AppSettings.Get("EncryptionKey");

                JsonResult jr = new JsonResult();
                if (search.ProgramIDs == "-1") search.ProgramIDs = null;
                if (search.SelectedChapterIDs == "-1") search.SelectedChapterIDs = null;
                if (search.SelectedStandardIDs == "-1") search.SelectedStandardIDs = null;

                List<RFIEPFinding> Level2Data = new List<RFIEPFinding>();
                Level2Data = TJCRFIFinding.GetRfiEPDetails(search);

                if (!AppSession.EmailAddress.ToUpper().Contains(JCREmailDomain) && !AppSession.EmailAddress.ToUpper().Contains(JCREmailDomain2))
                {
                    Level2Data.ToList().ForEach(data =>
                    {
                        data.TJCFinding = CryptHelpers.RFIDecrypt(data.TJCFinding, encryptionKey);
                    });
                }
                else
                {
                    Level2Data.ToList().ForEach(data => data.TJCFinding = string.Empty);
                }

                jr = Json(Level2Data, JsonRequestBehavior.AllowGet);
                jr.MaxJsonLength = Int32.MaxValue;
                jr.RecursionLimit = 100;
                return jr;
            }

            catch (Exception ex)
            {

                ExceptionLog exceptionLog = new ExceptionLog
                {
                    ExceptionText = "Reports: " + ex.Message,
                    PageName = "TjcRFIFinding",
                    MethodName = "RFIEPLevelDetails_Data",
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

                return Json(TJCRFIFinding.GetReportHcoIDs(selectedSiteIDs), JsonRequestBehavior.AllowGet);
            }

            catch (Exception ex)
            {

                ExceptionLog exceptionLog = new ExceptionLog
                {
                    ExceptionText = "Reports: " + ex.Message,
                    PageName = "TjcRFIFinding",
                    MethodName = "GetReportRFIHCOIDs",
                    UserID = Convert.ToInt32(AppSession.UserID),
                    SiteId = Convert.ToInt32(AppSession.SelectedSiteId),
                    TransSQL = "",
                    HttpReferrer = null
                };
                exceptionService.LogException(exceptionLog);

                return Json(RedirectToAction("Error", "Transfer"));
            }

        }
        public ActionResult GetCountForOthers()
        {
            try
            {
                string rtn = Session["MaxStandardCount"].ToString();
                return Json(rtn, JsonRequestBehavior.AllowGet);
            }

            catch (Exception ex)
            {

                ExceptionLog exceptionLog = new ExceptionLog
                {
                    ExceptionText = "Reports: " + ex.Message,
                    PageName = "PriorityRFIFinding",
                    MethodName = "PriorityTjcRFIGetCountForOthers",
                    UserID = Convert.ToInt32(AppSession.UserID),
                    SiteId = Convert.ToInt32(AppSession.SelectedSiteId),
                    TransSQL = "",
                    HttpReferrer = null
                };
                exceptionService.LogException(exceptionLog);

                return RedirectToAction("Error", "Transfer");
            }
        }
        public ActionResult CreateERSessionCriteria(SearchCorporateER ERsearch)
        {
            try
            {
                if (ERsearch.ProgramIDs == "-1") ERsearch.ProgramIDs = null;
                if (ERsearch.ProgramNames == "-1") ERsearch.ProgramIDs = "All";
                if (ERsearch.ProgramNames == "-1") ERsearch.ProgramIDs = "All";
                if (ERsearch.SelectedChapterIDs == "-1") ERsearch.SelectedChapterIDs = null;
                if (ERsearch.SelectedChapterNames == "-1") ERsearch.SelectedChapterIDs = "All";
                if (ERsearch.SelectedStandardIDs == "-1") ERsearch.SelectedStandardIDs = null;
                if (ERsearch.SelectedStandardNames == "-1") ERsearch.SelectedStandardNames = "All";

                Session["ERsearchcriteria"] = ERsearch;
                return Json(new { success = true }, JsonRequestBehavior.AllowGet);

            }

            catch (Exception ex)
            {

                ExceptionLog exceptionLog = new ExceptionLog
                {
                    ExceptionText = "Reports: " + ex.Message,
                    PageName = "PriorityRFIFinding",
                    MethodName = "PriorityTjcRFICreateERSessionCriteria",
                    UserID = Convert.ToInt32(AppSession.UserID),
                    SiteId = Convert.ToInt32(AppSession.SelectedSiteId),
                    TransSQL = "",
                    HttpReferrer = null
                };
                exceptionService.LogException(exceptionLog);

                return RedirectToAction("Error", "Transfer");
            }
        }
        public ActionResult SendERPDFEmail(string ExcelGridName, Email email, string ERReportName, string SortBy = "", string SortOrder = "")
        {
            var emailService = new CommonService();
            bool emailSuccess = true;
            var emailMessage = WebConstants.Excel_Email_Success;

            try
            {
                byte[] fileContents = null;
                SearchCorporateER ERsearchcriteria = Session["ERsearchcriteria"] as SearchCorporateER;

                var rfiService = new JCR.Reports.Areas.Corporate.Services.RFIReportService();

                fileContents = rfiService.RFIReportRDLC(ERsearchcriteria, (int)WebConstants.ReportFormat.PDF, SortBy, SortOrder);

                email.AttachmentLocation[0] = emailService.SavePDF(ExcelGridName, fileContents);
                email.FileContents = fileContents;
                email.ReportName = ERReportName;
                //int actionTypeId = 48;
                emailSuccess = emailService.SendExcelEmailAttachemnt(email,true, "FromCorporateEmailAddress");
                if (emailSuccess) { emailMessage = WebConstants.Excel_Email_Success; } else { emailMessage = WebConstants.Email_Failed; }

            }
            catch (Exception ex)
            {
                emailMessage = WebConstants.Excel_Email_Failed;

                ExceptionLog exceptionLog = new ExceptionLog
                {
                    ExceptionText = "Reports: " + ex.Message,
                    PageName = "PriorityRFIFinding",
                    MethodName = "PriorityTjcRFISendERPDFEmail",
                    UserID = Convert.ToInt32(AppSession.UserID),
                    SiteId = Convert.ToInt32(AppSession.SelectedSiteId),
                    TransSQL = "",
                    HttpReferrer = null
                };
                exceptionService.LogException(exceptionLog);
            }
            finally
            {
                Session.Remove("ERsearchcriteria");
            }
            return Json(emailMessage);
        }

        public ActionResult createErPdf(string ExcelGridName, string ERReportName, string SortBy = "", string SortOrder = "")
        {
            var emailService = new CommonService();

            var createErPdf = "failed";
            string fileGuid = "";
            try
            {
                byte[] fileContents = null;
                SearchCorporateER ERsearchcriteria = Session["ERsearchcriteria"] as SearchCorporateER;
                Session.Remove("ERsearchcriteria");
                var RFIService = new JCR.Reports.Areas.Corporate.Services.RFIReportService();
                fileContents = RFIService.RFIReportRDLC(ERsearchcriteria, (int)WebConstants.ReportFormat.PDF, SortBy, SortOrder);
                if (fileContents != null)
                {
                    createErPdf = "success";
                }
                else
                {
                    createErPdf = "failed";
                }
                fileGuid = emailService.SavePDF(ExcelGridName, fileContents);
            }
            catch (Exception ex)
            {
                createErPdf = "failed";

                ExceptionLog exceptionLog = new ExceptionLog
                {
                    ExceptionText = "Reports: " + ex.Message,
                    PageName = "PriorityRFIFinding",
                    MethodName = "PriorityTjcRFIcreateErPdf",
                    UserID = Convert.ToInt32(AppSession.UserID),
                    SiteId = Convert.ToInt32(AppSession.SelectedSiteId),
                    TransSQL = "",
                    HttpReferrer = null
                };
                exceptionService.LogException(exceptionLog);
            }
            finally
            {
                Session.Remove("ERsearchcriteria");
            }
            return Json(new { exportCreated = createErPdf, fileGuid = fileGuid });


        }
    }

}