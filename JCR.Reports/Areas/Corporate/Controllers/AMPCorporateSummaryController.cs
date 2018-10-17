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
    public class AMPCorporateSummaryController : Controller
    {
        ExceptionService exceptionService = new ExceptionService();
        /// <summary>
        /// Load Corporate Findings report default parameters
        /// </summary>
        /// <returns>View</returns>
        [SessionExpireFilter]
        // GET: Corporate/AMPCorporateReports
        public ActionResult Index(int id, int? actionType)
        {
            try
            {
                HelperClasses.SetReportOrScheduleID(id, (int)ReportsListEnum.AMPCorporateReports);
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

                    return View(reportservice.GetCorpSearchListsForSavedParameters(AppSession.ReportScheduleID, savedParameters, WebConstants.CORP_REPORT_TITLE_FINDING_REPORT));
                }
                else
                    return View(reportservice.GetCorpSearchLists(WebConstants.CORP_REPORT_TITLE_FINDING_REPORT));
            }
            catch (Exception ex)
            {

                ExceptionLog exceptionLog = new ExceptionLog
                {
                    ExceptionText = "Reports: " + ex.Message,
                    PageName = "CorporatePriorityFinding",
                    MethodName = "AMPCorporateSummaryIndex",
                    UserID = Convert.ToInt32(AppSession.UserID),
                    SiteId = Convert.ToInt32(AppSession.SelectedSiteId),
                    TransSQL = "",
                    HttpReferrer = null
                };
                exceptionService.LogException(exceptionLog);

                return RedirectToAction("Error", "Transfer");
            }
        }

        public ActionResult LoadCorporateSummary()
        {
            try
            {
                return PartialView("AMPCorporateSummary");
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
                exceptionService.LogException(exceptionLog);

                return RedirectToAction("Error", "Transfer");
            }
        }

        public ActionResult CorporateReport_Data(SearchCorporateER search, int LevelIdentifier)
        {
            try
            {
                //Mock Survey Status Parameter. Corporate Reports displays data after Mock Survey Recommendations are approved.
                search.MockSurveyStatusID = (int)MockSurveyStatus.Publish_CCA_Recommendation;

                JsonResult jr = new JsonResult();
                if (search.ProgramIDs == "-1") search.ProgramIDs = null;
                if (search.SelectedChapterIDs == "-1") search.SelectedChapterIDs = null;
                if (search.SelectedStandardIDs == "-1") search.SelectedStandardIDs = null;
                if (search.SelectedMockSurveyIDs == "-1") search.SelectedMockSurveyIDs = null;
                if (search.SelectedMockSurveyLeadIDs == "-1") search.SelectedMockSurveyLeadIDs = null;
                if (search.SelectedMockSurveyMemberIDs == "-1") search.SelectedMockSurveyMemberIDs = null;

                string JCREmailDomain = "@JCRINC.COM";
                string JCREmailDomain2 = "@JCAHO.COM";
                string encryptionKey = ConfigurationManager.AppSettings.Get("EncryptionKey");

                switch (LevelIdentifier)
                {
                    case (int)WebConstants.CorporateSummaryLevels.Level1_Program:
                        {
                            List<CorpProgramFinding> Level1Data = new List<CorpProgramFinding>();
                            Level1Data = CorporateFinding.GetCorpFindingByProgram(search);

                            jr = Json(Level1Data, JsonRequestBehavior.AllowGet);
                            break;
                        }

                    case (int)WebConstants.CorporateSummaryLevels.Level2_Chapter:
                        {
                            if (search.IsDuplicateLoadCall)
                            {
                                jr = TempData["ACS_Level2Data"] as JsonResult;
                            }
                            else
                            {
                                List<CorpChapterFinding> Level2Data = new List<CorpChapterFinding>();
                                Level2Data = CorporateFinding.GetCorpFindingByChapter(search);
                                jr = Json(Level2Data, JsonRequestBehavior.AllowGet);
                                TempData["ACS_Level2Data"] = jr;
                            }
                            break;
                        }
                    case (int)WebConstants.CorporateSummaryLevels.Level3_Standard:
                        {
                            if (search.IsDuplicateLoadCall)
                            {
                                jr = TempData["ACS_Level3Data"] as JsonResult;
                            }
                            else
                            {
                                List<CorpStandardFinding> Level3Data = new List<CorpStandardFinding>();
                                Level3Data = CorporateFinding.GetCorpFindingByStandard(search);

                                var max = Convert.ToInt32(Level3Data.Max(r => r.CumulativePercentage));
                                Session["MaxStandardCount"] = max >= 100 ? 100 : max;

                                jr = Json(Level3Data, JsonRequestBehavior.AllowGet);
                                TempData["ACS_Level3Data"] = jr;
                            }
                            break;
                        }
                    case (int)WebConstants.CorporateSummaryLevels.Level4_EP:
                        {
                            string tjcFinding = string.Empty;
                            List<CorpEPFinding> Level4Data = new List<CorpEPFinding>();

                            Level4Data = CorporateFinding.GetCorpFindingByEP(search);

                            if (!AppSession.EmailAddress.ToUpper().Contains(JCREmailDomain) && !AppSession.EmailAddress.ToUpper().Contains(JCREmailDomain2))
                            {
                                Level4Data.ToList().ForEach(data => { data.TJCFinding = CryptHelpers.RFIDecrypt(data.TJCFinding, encryptionKey); });
                            }
                            else
                            {
                                Level4Data.ToList().ForEach(data => data.TJCFinding = string.Empty);
                            }

                            jr = Json(Level4Data, JsonRequestBehavior.AllowGet);
                            break;
                        }
                    case (int)WebConstants.CorporateSummaryLevels.Level5_EPDetails:
                        {
                            List<CorpStandardFinding> Level5Data = new List<CorpStandardFinding>();
                            Level5Data = CorporateFinding.GetCorpFindingByStandard(search);
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
                    PageName = "CorporatePriorityFinding",
                    MethodName = "AMPCorporateSummaryCorporateReport_Data",
                    UserID = Convert.ToInt32(AppSession.UserID),
                    SiteId = Convert.ToInt32(AppSession.SelectedSiteId),
                    TransSQL = "",
                    HttpReferrer = null
                };
                exceptionService.LogException(exceptionLog);

                return RedirectToAction("Error", "Transfer");
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
                    PageName = "CorporatePriorityFinding",
                    MethodName = "AMPCorporateSummaryGetCountForOthers",
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
                if (ERsearch.SelectedMockSurveyIDs == "-1") ERsearch.SelectedMockSurveyIDs = null;
                if (ERsearch.SelectedMockSurveyNames == "-1") ERsearch.SelectedMockSurveyNames = "All";
                if (ERsearch.SelectedMockSurveyLeadIDs == "-1") ERsearch.SelectedMockSurveyLeadIDs = null;
                if (ERsearch.SelectedMockSurveyLeadNames == "-1") ERsearch.SelectedMockSurveyLeadIDs = "All";
                if (ERsearch.SelectedMockSurveyMemberIDs == "-1") ERsearch.SelectedMockSurveyMemberIDs = null;
                if (ERsearch.SelectedMockSurveyMemberNames == "-1") ERsearch.SelectedMockSurveyMemberNames = "All";

                Session["ERsearchcriteria"] = ERsearch;

                return Json(new { success = true }, JsonRequestBehavior.AllowGet);
            }

            catch (Exception ex)
            {
                ExceptionLog exceptionLog = new ExceptionLog
                {
                    ExceptionText = "Reports: " + ex.Message,
                    PageName = "CorporatePriorityFinding",
                    MethodName = "AMPCorporateSummaryCreateERSessionCriteria",
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
                //   Session.Remove("ERsearchcriteria");

                var corporateService = new JCR.Reports.Areas.Corporate.Services.CorporateReportService();
                ERsearchcriteria.MockSurveyStatusID = (int)MockSurveyStatus.Publish_CCA_Recommendation;
                fileContents = corporateService.CorporateReportRDLC(ERsearchcriteria, (int)WebConstants.ReportFormat.PDF, SortBy, SortOrder);

                email.AttachmentLocation[0] = emailService.SavePDF(ExcelGridName, fileContents);
                email.FileContents = fileContents;
                email.ReportName = ERReportName;
                //int actionTypeId = 84;
                emailSuccess = emailService.SendExcelEmailAttachemnt(email,true, "FromCorporateEmailAddress");
                if (emailSuccess) { emailMessage = WebConstants.Excel_Email_Success; } else { emailMessage = WebConstants.Email_Failed; }
            }
            catch (Exception ex)
            {
                emailMessage = WebConstants.Excel_Email_Failed;

                ExceptionLog exceptionLog = new ExceptionLog
                {
                    ExceptionText = "Reports: " + ex.Message,
                    PageName = "CorporatePriorityFinding",
                    MethodName = "AMPCorporateSummarySendERPDFEmail",
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
                var corporateService = new JCR.Reports.Areas.Corporate.Services.CorporateReportService();
                ERsearchcriteria.MockSurveyStatusID = (int)MockSurveyStatus.Publish_CCA_Recommendation;

                fileContents = corporateService.CorporateReportRDLC(ERsearchcriteria, (int)WebConstants.ReportFormat.PDF, SortBy, SortOrder);
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
                    PageName = "CorporatePriorityFinding",
                    MethodName = "AMPCorporateSummarycreateErPdf",
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