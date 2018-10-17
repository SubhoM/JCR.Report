using System;
using System.Collections.Generic;
using System.Web.Mvc;
using JCR.Reports.Common;
using JCR.Reports.Models;
using JCR.Reports.Models.Enums;
using JCR.Reports.Services;
using JCR.Reports.ViewModels;
using JCR.Reports.Areas.Corporate.Models;
using Microsoft.Reporting.WebForms;
using JCR.Reports.Areas.Corporate.Services;
using JCR.Reports.Areas.Corporate.ViewModels;
namespace JCR.Reports.Areas.Corporate.Controllers
{
    public class EPAssignmentController : Controller
    {
        ExceptionService exceptionService = new ExceptionService();
        // GET: Corporate/EPAssignment
        public ActionResult Index(int id, int? actionType)
        {
            try
            {
                HelperClasses.SetReportOrScheduleID(id, (int)ReportsListEnum.EPAssignment);

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

                    return View(reportservice.GetCorpSearchListsForSavedParameters(AppSession.ReportScheduleID, savedParameters, WebConstants.AMP_EP_ASSIGNMENT_REPORT));
                }
                else
                    return View(reportservice.GetCorpSearchLists(WebConstants.AMP_EP_ASSIGNMENT_REPORT));
            }
            catch (Exception ex)
            {

                ExceptionLog exceptionLog = new ExceptionLog
                {
                    ExceptionText = "Reports: " + ex.Message,
                    PageName = "EPAssignment",
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

        public ActionResult GetEPAssignedTo(string selectedSiteIDs, string EPUserRoleID, string programIDs="-1", string chapterIDs="-1", string standardIDs="-1", bool IncludeInActiveTagForUsers = false)
        {
            Services.EPAssignment epService = new Services.EPAssignment();
            return PartialView("Search/_EPAssignedTo", epService.GetEPAssignedTo(selectedSiteIDs, EPUserRoleID, programIDs, chapterIDs, standardIDs, IncludeInActiveTagForUsers));

        }
        public ActionResult GetEPAssignedBy(string selectedSiteIDs, string EPUserRoleID, string programIDs = "-1", string chapterIDs = "-1", string standardIDs = "-1")
        {
            Services.EPAssignment epService = new Services.EPAssignment();
            return PartialView("Search/_EPAssignedBy", epService.GetEPAssignedBy(selectedSiteIDs, EPUserRoleID, programIDs, chapterIDs, standardIDs));

        }

        public ActionResult LoadL1View()
        {
            return PartialView("EPAssignment");
        }

        public ActionResult EPAssignment_Data(SearchCorporateER search, int LevelIdentifier)
        {
            EPAssignment reportservice = new EPAssignment();
            JsonResult jr = new JsonResult();

            switch (LevelIdentifier)
            {
                

                case (int)WebConstants.EPAssignmentLevels.Level1_Site:
                    {
                        List<EPAssignmentbySite> Level1Data = new List<EPAssignmentbySite>();
                        Level1Data = reportservice.GetLevel1Data(search);
                        jr = Json(Level1Data, JsonRequestBehavior.AllowGet);
                        break;
                    }
                case (int)WebConstants.EPAssignmentLevels.Level2_Chapter:
                    {
                        List<EPAssignmentbyChapter> Level2Data = new List<EPAssignmentbyChapter>();
                        Level2Data = reportservice.GetLevel2Data(search);
                        jr = Json(Level2Data, JsonRequestBehavior.AllowGet);
                        break;
                    }
                case (int)WebConstants.EPAssignmentLevels.Level3_Standard:
                    {
                        List<EPAssignmentbyStandard> Level3Data = new List<EPAssignmentbyStandard>();
                        Level3Data = reportservice.GetLevel3Data(search);
                        jr = Json(Level3Data, JsonRequestBehavior.AllowGet);
                        break;
                    }
                case (int)WebConstants.EPAssignmentLevels.Level4_EP:
                    {
                        List<EPAssignmentDetails> Level4Data = new List<EPAssignmentDetails>();
                        Level4Data = reportservice.GetLevel4Data(search);
                      
                        Level4Data.ForEach(z => { z.PastDueDate = z.DueDate == null ? false : Convert.ToDateTime(z.DueDate) < DateTime.Today && z.ScoreDate == null ? true : false;
                                                  z.DueDate = z.PastDueDate == true ? z.DueDate + "</br>Past Due Date" : z.DueDate;
                                                }
                                          );

                        jr = Json(Level4Data, JsonRequestBehavior.AllowGet);
                        break;
                    }
               

            }

            jr.MaxJsonLength = Int32.MaxValue;
            jr.RecursionLimit = 100;
            return jr;
        }

        public ActionResult CreateERSessionCriteria(SearchCorporateER ERsearch)
        {
            Session["ERsearchcriteria"] = ERsearch;

            return Json(new { success = true }, JsonRequestBehavior.AllowGet);
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
              

            
                    var epaService = new EPAssignment();
                    fileContents = epaService.EPAssignmentRDLC(ERsearchcriteria, (int)WebConstants.ReportFormat.PDF, SortBy, SortOrder);
              
                email.AttachmentLocation[0] = emailService.SavePDF(ExcelGridName, fileContents);
                email.FileContents = fileContents;
                email.ReportName = ERReportName;
                //int actionTypeId = 52;
                emailSuccess = emailService.SendExcelEmailAttachemnt(email,true);
                if (emailSuccess) { emailMessage = WebConstants.Excel_Email_Success; } else { emailMessage = WebConstants.Email_Failed; }

            }
            catch (Exception)
            {
                emailMessage = WebConstants.Excel_Email_Failed;
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
             
                var epaService = new EPAssignment();
                fileContents = epaService.EPAssignmentRDLC(ERsearchcriteria, (int)WebConstants.ReportFormat.PDF, SortBy, SortOrder);
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
            catch (Exception)
            {
                createErPdf = "failed";
            }
            finally
            {
                Session.Remove("ERsearchcriteria");
            }
            return Json(new { exportCreated = createErPdf, fileGuid = fileGuid });


        }

    }
}