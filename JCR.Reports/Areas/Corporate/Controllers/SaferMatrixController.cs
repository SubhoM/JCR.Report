using JCR.Reports.Areas.Corporate.ViewModels;
using JCR.Reports.Common;
using JCR.Reports.DataModel;
using JCR.Reports.Models;
using JCR.Reports.Models.Enums;
using JCR.Reports.Services;
using JCR.Reports.ViewModels;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;
using System.Net;
using System.Web;
using System.Web.Mvc;

namespace JCR.Reports.Areas.Corporate.Controllers
{
    public class SaferMatrixController : Controller
    {

        ExceptionService exceptionService = new ExceptionService();

        public ActionResult Index(int id, int? actionType)
        {
            try
            {

                HelperClasses.SetReportOrScheduleID(id, (int)ReportsListEnum.SaferMatrix);


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

                    return View(reportservice.GetCorpSearchListsForSavedParameters(AppSession.ReportScheduleID, savedParameters, WebConstants.AMP_SAFER_MATRIX_REPORT));
                }
                else
                    return View(reportservice.GetCorpSearchLists(WebConstants.AMP_SAFER_MATRIX_REPORT));
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


        public ActionResult LoadSaferMatrix()
        {
            try
            {
                return PartialView("SaferMatrix");
            }

            catch (Exception ex)
            {

                ExceptionLog exceptionLog = new ExceptionLog
                {
                    ExceptionText = "Reports: " + ex.Message,
                    PageName = "SaferMatrix",
                    MethodName = "LoadCorporateSummary",
                    UserID = Convert.ToInt32(AppSession.UserID),
                    SiteId = Convert.ToInt32(AppSession.SelectedSiteId),
                    TransSQL = "",
                    HttpReferrer = null
                };
                exceptionService.LogException(exceptionLog);

                return RedirectToAction("Error", "Transfer");
            }
        }

        public ActionResult SaferReport_Data(SearchCorporateER search, int LevelIdentifier, int LevelTypeIdentifier)
        {
            try
            {

                //Mock Survey Status Parameter. Corporate Reports displays data after Mock Survey Recommendations are approved.
                search.MockSurveyStatusID = (int)MockSurveyStatus.Publish_CCA_Recommendation;


                JsonResult jr = new JsonResult();
                if (search.ProgramIDs == "-1") search.ProgramIDs = "2";
                if (search.SelectedChapterIDs == "-1") search.SelectedChapterIDs = null;
                if (search.SelectedStandardIDs == "-1") search.SelectedStandardIDs = null;
                if (search.SelectedEPIDs == "-1") search.SelectedEPIDs = null;
                if (search.MatrixID < 1000) search.MatrixID = 0;
                search.EndDate = (search.EndDate != null && search.EndDate.ToString() != "") ? search.EndDate.Value.Date.AddHours(23).AddMinutes(29).AddSeconds(59) : search.EndDate;

                string encryptionKey = ConfigurationManager.AppSettings.Get("EncryptionKey");

                switch (LevelIdentifier)
                {
                    case (int)WebConstants.SaferMatrixLevels.Level1_Program:
                        {
                            switch (LevelTypeIdentifier)
                            {
                                case (int)WebConstants.LevelTypeIdentifier.Graph:
                                    var levelGraph = SaferMatrix.GetSaferMatrix(search);

                                    if (levelGraph == null)
                                        Response.StatusCode = (int)HttpStatusCode.BadRequest;

                                    jr = Json(levelGraph, JsonRequestBehavior.AllowGet);
                                    break;
                                case (int)WebConstants.LevelTypeIdentifier.Summary:
                                    var levelSummary = SaferMatrix.GetSaferMatrixSummary(search);
                                    jr = Json(levelSummary, JsonRequestBehavior.AllowGet);
                                    break;
                                case (int)WebConstants.LevelTypeIdentifier.Detail:
                                    var levelDetail = SaferMatrix.GetSaferMatrixData(search);

                                    jr = Json(levelDetail, JsonRequestBehavior.AllowGet);
                                    break;
                            }
                            break;
                        }
                    case (int)WebConstants.SaferMatrixLevels.Level2_Site:
                        {
                            switch (LevelTypeIdentifier)
                            {
                                case (int)WebConstants.LevelTypeIdentifier.Graph:
                                case (int)WebConstants.LevelTypeIdentifier.Summary:
                                    var levelChartSummary = SaferMatrix.GetSaferMatrixSummaryBySite(search);
                                    jr = Json(levelChartSummary, JsonRequestBehavior.AllowGet);

                                    break;
                                case (int)WebConstants.LevelTypeIdentifier.Detail:
                                    var levelData = SaferMatrix.GetSaferMatrixData(search);
                                    jr = Json(levelData, JsonRequestBehavior.AllowGet);
                                    break;
                            }

                            break;
                        }
                    case (int)WebConstants.SaferMatrixLevels.Level3_Chapter:
                        {
                            switch (LevelTypeIdentifier)
                            {

                                case (int)WebConstants.LevelTypeIdentifier.Graph:
                                case (int)WebConstants.LevelTypeIdentifier.Summary:

                                    var levelGraphSummary = SaferMatrix.GetSaferMatrixSummaryByChapter(search);

                                    jr = Json(levelGraphSummary, JsonRequestBehavior.AllowGet);
                                    break;
                                case (int)WebConstants.LevelTypeIdentifier.Detail:
                                    var levelData = SaferMatrix.GetSaferMatrixData(search);
                                    jr = Json(levelData, JsonRequestBehavior.AllowGet);
                                    break;
                            }
                            break;
                        }
                    case (int)WebConstants.SaferMatrixLevels.Level4_EP:
                        {
                            var levelData = new List<SaferMatrixData>();
                            levelData = SaferMatrix.GetSaferMatrixData(search);

                            jr = Json(levelData, JsonRequestBehavior.AllowGet);
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
                    PageName = "SaferMatrix",
                    MethodName = "AMPCorporateSummarySaferMatrix_Data",
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
                //Mock Survey Status Parameter. Corporate Reports displays data after Mock Survey Recommendations are approved.
                ERsearch.MockSurveyStatusID = (int)MockSurveyStatus.Publish_CCA_Recommendation;

                //if (ERsearch.ProgramIDs == "-1") ERsearch.ProgramIDs = null;
                if (ERsearch.ProgramNames == "-1" || ERsearch.ProgramNames == null) ERsearch.ProgramNames = "All";
                if (ERsearch.SelectedChapterIDs == "-1") ERsearch.SelectedChapterIDs = null;
                if (ERsearch.SelectedChapterNames == "-1" || ERsearch.SelectedChapterNames == null) ERsearch.SelectedChapterNames = "All";
                if (ERsearch.SelectedStandardIDs == "-1") ERsearch.SelectedStandardIDs = null;
                if (ERsearch.SelectedStandardNames == "-1" || ERsearch.SelectedStandardNames == null) ERsearch.SelectedStandardNames = "All";

                if (ERsearch.SelectedEPIDs == "-1") ERsearch.SelectedEPIDs = null;
                if (ERsearch.SelectedEPLabels == "-1" || ERsearch.SelectedEPLabels == null) ERsearch.SelectedEPLabels = "All";

                if (ERsearch.MatrixID < 1000) ERsearch.MatrixID = 0;

                Session["ERsearchcriteria"] = ERsearch;
                return Json(new { success = true }, JsonRequestBehavior.AllowGet);

            }

            catch (Exception ex)
            {

                ExceptionLog exceptionLog = new ExceptionLog
                {
                    ExceptionText = "Reports: " + ex.Message,
                    PageName = "SaferMatrix",
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
                SearchCorporateER ERsearchcriteria = Session["ERsearchcriteria"] as SearchCorporateER;

                var saferMatrixService = new JCR.Reports.Areas.Corporate.Services.SaferMatrixService();

                fileContents = saferMatrixService.SaferReportRDLC(ERsearchcriteria, (int)WebConstants.ReportFormat.PDF, SortBy, SortOrder);

                email.AttachmentLocation[0] = emailService.SavePDF(ExcelGridName, fileContents);
                email.FileContents = fileContents;
                email.ReportName = ERReportName;
                //int actionTypeId = 53;
                emailSuccess = emailService.SendExcelEmailAttachemnt(email,true, "FromCorporateEmailAddress");
                if (emailSuccess) { emailMessage = WebConstants.Excel_Email_Success; } else { emailMessage = WebConstants.Email_Failed; }

            }
            catch (Exception ex)
            {
                emailMessage = WebConstants.Excel_Email_Failed;

                ExceptionLog exceptionLog = new ExceptionLog
                {
                    ExceptionText = "Reports: " + ex.Message,
                    PageName = "SaferMatrix",
                    MethodName = "SaferMatrixSendERPDFEmail",
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
                var saferService = new JCR.Reports.Areas.Corporate.Services.SaferMatrixService();
                fileContents = saferService.SaferReportRDLC(ERsearchcriteria, (int)WebConstants.ReportFormat.PDF, SortBy, SortOrder);
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