using System;
using System.Collections.Generic;
using System.Web.Mvc;
using JCR.Reports.Common;
using JCR.Reports.Models;
using JCR.Reports.Models.Enums;
using JCR.Reports.Services;
using JCR.Reports.ViewModels;
using JCR.Reports.Areas.Corporate.Models;
using JCR.Reports.Areas.Corporate.ViewModels;
using Microsoft.Reporting.WebForms;
using Kendo.Mvc.UI;

namespace JCR.Reports.Areas.Corporate.Controllers
{
    public class TaskReportController : Controller
    {
        ExceptionService exceptionService = new ExceptionService();
        // GET: Corporate/TaskReport
        public ActionResult Index(int id, int? actionType)
        {
            try
            {
                HelperClasses.SetReportOrScheduleID(id, (int)ReportsListEnum.TaskReport);

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
                    return View(reportservice.GetCorpSearchListsForSavedParameters(AppSession.ReportScheduleID, savedParameters, WebConstants.AMP_TASK_REPORT));
                }
                else
                    return View(reportservice.GetCorpSearchLists(WebConstants.AMP_TASK_REPORT));
            }
            catch (Exception ex)
            {

                ExceptionLog exceptionLog = new ExceptionLog
                {
                    ExceptionText = "Reports: " + ex.Message,
                    PageName = "TaskReport",
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
        public PartialViewResult _TaskRdlcReport(SearchTaskReport search, Email emailInput, string ReportType)
        {
            ReportViewer reportViewer = new ReportViewer();
            try
            {
                var dcaService = new Services.TaskReport();
                if (emailInput.To != null)
                {
                    ViewBag.FromEmail = true;
                    ViewBag.FromEmailSuccess = WebConstants.Email_Success;
                }

                reportViewer = dcaService.TaskReportRDLC(search, emailInput, ReportType);
                if (Session["EmailSuccess"] != null)
                {
                    if (Session["EmailSuccess"].ToString() == "false")
                    {
                        ViewBag.FromEmailSuccess = WebConstants.Email_Failed;
                    }
                }
            }
            catch (Exception ex)
            {
                if (ex.Message.ToString() != "Email")
                {
                    if (ex.Message.ToString() == "No Data")
                    {
                        ModelState.AddModelError("Error", WebConstants.NO_DATA_FOUND_TASK_REPORT);
                    }
                }
                else
                {
                    ViewBag.FromEmail = true;
                    ModelState.AddModelError("Error", WebConstants.Email_Failed);
                }
            }
            finally
            {
                if (Session["EmailSuccess"] != null)
                    Session.Remove("EmailSuccess");
            }

            Session["MyReportViewer"] = reportViewer;
            return PartialView("_ReportViewer");
        }
        public ActionResult GetTaskAssignedTo(string selectedSiteIDs)
        {
            Services.TaskReport taskService = new Services.TaskReport();
            return PartialView("Search/_TaskAssignedTo", taskService.GetUserDetails(selectedSiteIDs,1));

        }
        public ActionResult GetTaskAssignedBy(string selectedSiteIDs)
        {
            Services.TaskReport taskService = new Services.TaskReport();
            return PartialView("Search/_TaskAssignedBy", taskService.GetUserDetails(selectedSiteIDs,2));

        }
        public ActionResult GetTaskEmailCcedTo(string selectedSiteIDs)
        {
            Services.TaskReport taskService = new Services.TaskReport();
            return PartialView("Search/_EmailCcedTo", taskService.GetUserDetails(selectedSiteIDs,3));

        }
        public ActionResult GetTracersList(string selectedSiteIDs, string selectedProgramIDs)
        {
            SearchList tracerList = new SearchList();
            Services.TaskReport taskService = new Services.TaskReport();
            //tracerList.TracersLists = searchService.GetTracersList("", "1,2,3", "7,8", 2).TracersLists;
            tracerList.TracersLists = taskService.SelectAllTaskTracers(Convert.ToInt32(selectedSiteIDs.Replace(",","")), Convert.ToInt32(selectedProgramIDs));
            return PartialView("Search/_TracersList", tracerList);
        }

        public ActionResult DistributeOrgTypeListLevel3(string selectedSiteIDs, string selectedProgramIDs)
        {
            SearchList searchList = new SearchList();
            Search search = new Search();
            Services.TaskReport taskService = new Services.TaskReport();
            searchList = taskService.GetOrgnizationTypeList(searchList, search, Convert.ToInt32(selectedSiteIDs.Replace(",", "")), Convert.ToInt32(selectedProgramIDs));
            return PartialView("Search/_CampusList", searchList);
        }

        public ActionResult DistributeOrgTypeListLevel2(string selectedSiteIDs, string selectedProgramIDs)
        {
            SearchList searchList = new SearchList();
            Search search = new Search();
            Services.TaskReport taskService = new Services.TaskReport();
            searchList = taskService.GetOrgnizationTypeList(searchList, search, Convert.ToInt32(selectedSiteIDs.Replace(",", "")), Convert.ToInt32(selectedProgramIDs));
            return PartialView("Search/_BuildingList", searchList);
        }

        public ActionResult DistributeOrgTypeListLevel1(string selectedSiteIDs, string selectedProgramIDs)
        {
            SearchList searchList = new SearchList();
            Search search = new Search();
            Services.TaskReport taskService = new Services.TaskReport();
            searchList = taskService.GetOrgnizationTypeList(searchList, search, Convert.ToInt32(selectedSiteIDs.Replace(",", "")), Convert.ToInt32(selectedProgramIDs));
            return PartialView("Search/_DepartmentList", searchList);
        }

        public ActionResult GetTaskStatus()
        {
            var list = new List<TaskStatus>();


            list.Insert(0, new TaskStatus
            {
                TaskStatusID = Convert.ToInt32(-1),
                TaskStatusName = "All",

            });

            list.Insert(1, new TaskStatus
            {
                TaskStatusID = Convert.ToInt32(1),
                TaskStatusName = "Open",

            });
            list.Insert(2, new TaskStatus
            {
                TaskStatusID = Convert.ToInt32(2),
                TaskStatusName = "Complete",

            });
            return PartialView("Search/_TaskStatus", list);

        }

        public ActionResult LoadTaskExcelReport()
        {
            return PartialView("TaskReportExcelView");
        }
        public ActionResult _TaskReportExcel([DataSourceRequest]DataSourceRequest request, SearchTaskReport search)
        {
            var dcaService = new Services.TaskReport();

            DataSourceResult result = dcaService._taskReportExcel(request, search);
            JsonResult jr = new JsonResult();

            jr = Json(result, JsonRequestBehavior.AllowGet);
            jr.MaxJsonLength = Int32.MaxValue;
            jr.RecursionLimit = 100;
            return jr;


        }
    }
}