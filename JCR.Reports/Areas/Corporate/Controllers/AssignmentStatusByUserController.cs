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
    public class AssignmentStatusByUserController : Controller
    {
        ExceptionService exceptionService = new ExceptionService();
        /// <summary>
        /// Load Department Comparative Analysis report default parameters
        /// </summary>
        /// <returns>View</returns>
        [SessionExpireFilter]

        // GET: Corporate/AssignmentStatusByUser
        public ActionResult Index(int id, int? actionType)
        {
            try
            {

                HelperClasses.SetReportOrScheduleID(id, (int)ReportsListEnum.AssignmentStatusByUserReport);


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

                    return View(reportservice.GetCorpSearchListsForSavedParameters(AppSession.ReportScheduleID, savedParameters, WebConstants.AMP_ASSIGNMENT_STATUS_BY_USER_REPORT));
                }
                else
                    return View(reportservice.GetCorpSearchLists(WebConstants.AMP_ASSIGNMENT_STATUS_BY_USER_REPORT));
            }
            catch (Exception ex)
            {

                ExceptionLog exceptionLog = new ExceptionLog
                {
                    ExceptionText = "Reports: " + ex.Message,
                    PageName = "AssignmentStatusByUser",
                    MethodName = "AssignmentStatusByUserIndex",
                    UserID = Convert.ToInt32(AppSession.UserID),
                    SiteId = Convert.ToInt32(AppSession.SelectedSiteId),
                    TransSQL = "",
                    HttpReferrer = null
                };
                exceptionService.LogException(exceptionLog);

                return RedirectToAction("Error", "Transfer");
            }
        }

        public ActionResult GetAssignmentAssignedTo(SearchAssignmentStatusByUser search)
        {

            ValidateSearchCriteria(search);
            var result = AssignmentService.GetAssignmentAssignedTo(search);

            result.Insert(0, new AssignedToUser
            {
                UserID = Convert.ToInt32(-1),
                FullName = "All"
            });

            return PartialView("Search/_AssignmentAssignedTo", result);
        }

        public ActionResult LoadChart()
        {
            try
            {
                return PartialView("AssignmentStatusByUser");
            }

            catch (Exception ex)
            {

                ExceptionLog exceptionLog = new ExceptionLog
                {
                    ExceptionText = "Reports: " + ex.Message,
                    PageName = "AssignmentStatusByUser",
                    MethodName = "LoadChart",
                    UserID = Convert.ToInt32(AppSession.UserID),
                    SiteId = Convert.ToInt32(AppSession.SelectedSiteId),
                    TransSQL = "",
                    HttpReferrer = null
                };
                //exceptionService.LogException(exceptionLog);

                return RedirectToAction("Error", "Transfer");
            }
        }

        public ActionResult GetReportData(SearchAssignmentStatusByUser search, int LevelIdentifier)
        {
            try
            {
                JsonResult jr = new JsonResult();
                ValidateSearchCriteria(search);

                switch ((AssignmentStatusByUserSummaryLevels)LevelIdentifier)
                {
                    case AssignmentStatusByUserSummaryLevels.Level1_ByUser:

                        if (search.IsDuplicateLoadCall)
                        {
                            jr = TempData["ASBU_Level1Data"] as JsonResult;
                        }
                        else
                        {
                            List<AssignmentStatusByUser_UserData> Level1Data = new List<AssignmentStatusByUser_UserData>();
                            Level1Data = AssignmentService.GetAssignmentStatusByUser_UserData(search);

                            jr = Json(Level1Data, JsonRequestBehavior.AllowGet);
                            TempData["ASBU_Level1Data"] = jr;
                        }
                        break;

                    case AssignmentStatusByUserSummaryLevels.Level2_ByChapter:


                        if (search.IsDuplicateLoadCall)
                        {
                            jr = TempData["ASBU_Level2Data"] as JsonResult;
                        }
                        else
                        {
                            List<AssignmentStatusByUser_ChapterData> Level2Data = new List<AssignmentStatusByUser_ChapterData>();
                            Level2Data = AssignmentService.GetAssignmentStatusByUser_ChapterData(search);

                            jr = Json(Level2Data, JsonRequestBehavior.AllowGet);
                            TempData["ASBU_Level2Data"] = jr;
                        }
                        break;

                    case AssignmentStatusByUserSummaryLevels.Level3_ByStandard:

                        if (search.IsDuplicateLoadCall)
                        {
                            jr = TempData["ASBU_Level3Data"] as JsonResult;
                        }
                        else
                        {
                            List<AssignmentStatusByUser_StandardData> Level3Data = new List<AssignmentStatusByUser_StandardData>();
                            Level3Data = AssignmentService.GetAssignmentStatusByUser_StandardData(search);

                            jr = Json(Level3Data, JsonRequestBehavior.AllowGet);
                            TempData["ASBU_Level3Data"] = jr;
                        }
                        break;

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
                    PageName = "AssignmentStatusByUser",
                    MethodName = "GetReportData",
                    UserID = Convert.ToInt32(AppSession.UserID),
                    SiteId = Convert.ToInt32(AppSession.SelectedSiteId),
                    TransSQL = "",
                    HttpReferrer = null
                };
                exceptionService.LogException(exceptionLog);

                return RedirectToAction("Error", "Transfer");
            }

        }
        public ActionResult GetReportDetailData(SearchAssignmentStatusByUser search, int LevelIdentifier)
        {
            try
            {
                JsonResult jr = new JsonResult();
                ValidateSearchCriteria(search);

                List<AssignmentStatusByUser_EPData> DetailData = new List<AssignmentStatusByUser_EPData>();
                DetailData = AssignmentService.GetAssignmentStatusByUser_EPData(search);

                jr = Json(DetailData, JsonRequestBehavior.AllowGet);

                jr.MaxJsonLength = Int32.MaxValue;
                jr.RecursionLimit = 100;
                return jr;
            }

            catch (Exception ex)
            {

                ExceptionLog exceptionLog = new ExceptionLog
                {
                    ExceptionText = "Reports: " + ex.Message,
                    PageName = "AssignmentStatusByUser",
                    MethodName = "GetReportData",
                    UserID = Convert.ToInt32(AppSession.UserID),
                    SiteId = Convert.ToInt32(AppSession.SelectedSiteId),
                    TransSQL = "",
                    HttpReferrer = null
                };
                exceptionService.LogException(exceptionLog);

                return RedirectToAction("Error", "Transfer");
            }

        }

        private static void ValidateSearchCriteria(SearchAssignmentStatusByUser search)
        {
            if (search.ProgramIDs == "-1") { search.ProgramIDs = null; search.ProgramNames = "All"; }
            if (search.SelectedChapterIDs == "-1") { search.SelectedChapterIDs = null; search.SelectedChapterNames = "All"; }
            if (search.SelectedStandardIDs == "-1") { search.SelectedStandardIDs = null; search.SelectedStandardNames = "All"; }
            if (search.SelectedAssignedToIDs == "-1") { search.SelectedAssignedToIDs = null; search.SelectedAssignedToNames = "All"; }
        }

        public ActionResult CreateERSessionCriteria(SearchAssignmentStatusByUser ERsearch)
        {
            try
            {
                ValidateSearchCriteria(ERsearch);
                Session["ERsearchcriteria"] = ERsearch;

                return Json(new { success = true }, JsonRequestBehavior.AllowGet);
            }

            catch (Exception ex)
            {
                ExceptionLog exceptionLog = new ExceptionLog
                {
                    ExceptionText = "Reports: " + ex.Message,
                    PageName = "AssignmentStatusByUser",
                    MethodName = "CreateERSessionCriteria",
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
                SearchAssignmentStatusByUser search = Session["ERsearchcriteria"] as SearchAssignmentStatusByUser;
                Session.Remove("ERsearchcriteria");

                var assignmentService = new JCR.Reports.Areas.Corporate.Services.AssignmentStatusByUserReportService();
                fileContents = assignmentService.AssignmentStatusByUserReportRDLC(search, (int)WebConstants.ReportFormat.PDF, SortBy, SortOrder);

                email.AttachmentLocation[0] = emailService.SavePDF(ExcelGridName, fileContents);
                email.FileContents = fileContents;
                email.ReportName = ERReportName;
                //int actionTypeId = 51;
                emailSuccess = emailService.SendExcelEmailAttachemnt(email,true);
                if (emailSuccess)
                {
                    emailMessage = WebConstants.Excel_Email_Success;
                }
                else
                {
                    emailMessage = WebConstants.Email_Failed;

                    if (emailService.ErrorException != null)
                    {
                        ExceptionLog exceptionLog = new ExceptionLog
                        {
                            ExceptionText = "Reports: " + emailService.ErrorException.Message,
                            PageName = "AssignmentStatusByUser",
                            MethodName = "SendERPDFEmail",
                            UserID = Convert.ToInt32(AppSession.UserID),
                            SiteId = Convert.ToInt32(AppSession.SelectedSiteId),
                            TransSQL = "",
                            HttpReferrer = null
                        };
                        exceptionService.LogException(exceptionLog);
                    }

                }
            }
            catch (Exception ex)
            {
                emailMessage = WebConstants.Excel_Email_Failed;

                ExceptionLog exceptionLog = new ExceptionLog
                {
                    ExceptionText = "Reports: " + ex.Message,
                    PageName = "AssignmentStatusByUser",
                    MethodName = "SendERPDFEmail",
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
                SearchAssignmentStatusByUser search = Session["ERsearchcriteria"] as SearchAssignmentStatusByUser;
                Session.Remove("ERsearchcriteria");

                var assignmentService = new JCR.Reports.Areas.Corporate.Services.AssignmentStatusByUserReportService();
                fileContents = assignmentService.AssignmentStatusByUserReportRDLC(search, (int)WebConstants.ReportFormat.PDF, SortBy, SortOrder);
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
                    PageName = "AssignmentStatusByUser",
                    MethodName = "createErPdf",
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