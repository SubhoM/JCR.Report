using System;
using System.Linq;
using System.Web.Mvc;
using JCR.Reports.Services;
using JCR.Reports.Common;
using JCR.Reports.Models.Enums;
using JCR.Reports.Models;
using JCR.Reports.ViewModels;
using System.Collections.Generic;
using JCR.Reports.Areas.TracerER.Services;
using JCR.Reports.Areas.TracerER.ViewModels;
namespace JCR.Reports.Areas.TracerER.Controllers
{
    public class ERTracerByQuestionController : Controller
    {
        ExceptionService exceptionService = new ExceptionService();
        //
        // GET: /TracersByTJCStandard/
        public ActionResult Index(int id, int? actionType)
        {

            try
            {
                if (!AppSession.HasValidSession)
                {
                    return RedirectToAction("IndexER", "Transfer", new { area = "" });
                }

                HelperClasses.SetReportOrScheduleID(id, (int)ReportsListEnum.ERTracerByQuestion);

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
                }

                ERSearchList list = new ERSearchList();
                list = reportservice.GetERTracerByQuestion(WebConstants.ERTRACER_REPORT_TITLE_Tracer_By_Question_Report);

                return View(list);
            }
            catch (Exception ex)
            {

                ExceptionLog exceptionLog = new ExceptionLog
                {
                    ExceptionText = "ER Reports: " + ex.Message,
                    PageName = "ERTracerByQuestion",
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

        //LoadComplianceSummaryReport
        public ActionResult LoadERTracerByQuestionReport()
        {
            return PartialView("ERTracerByQuestionReport");
        }
        //TracerComplianceSummary_Data
        public ActionResult ERTracerByQuestion_Data(SearchER search, int LevelIdentifier)
        {


            ERTracerByQuestion reportservice = new ERTracerByQuestion();
            JsonResult jr = new JsonResult();
            switch (LevelIdentifier)
            {
                case (int)WebConstants.ERTracerByQuestionLevels.Level1_Program:
                    {

                        List<ErTracersbyProgramData> Level1Data = new List<ErTracersbyProgramData>();
                        Level1Data = reportservice.GetLevel1Data(search);
                        jr = Json(Level1Data, JsonRequestBehavior.AllowGet);
                        break;
                    }

                case (int)WebConstants.ERTracerByQuestionLevels.Level2_Tracer:
                    {
                        List<ErTracersbyTracerData> Level2Data = new List<ErTracersbyTracerData>();
                        Level2Data = reportservice.GetLevel2Data(search);
                        jr = Json(Level2Data, JsonRequestBehavior.AllowGet);


                        break;
                    }
                case (int)WebConstants.ERTracerByQuestionLevels.Level3_Question:
                    {

                        List<ErTracersbyQuestionData> Level3Data = new List<ErTracersbyQuestionData>();
                        Level3Data = reportservice.GetLevel3Data(search);
                        jr = Json(Level3Data, JsonRequestBehavior.AllowGet);


                        break;
                    }
                case (int)WebConstants.ERTracerByQuestionLevels.Level4_Site:
                    {


                        List<ErTracersbySiteData> Level4Data = new List<ErTracersbySiteData>();
                        Level4Data = reportservice.GetLevel4Data(search);
                        jr = Json(Level4Data, JsonRequestBehavior.AllowGet);
                        break;
                    }
                case (int)WebConstants.ERTracerByQuestionLevels.Level5_QuestionDetails:
                    {

                        List<ErTracersbyQuestionDetails> Level5Data = new List<ErTracersbyQuestionDetails>();
                        Level5Data = reportservice.GetLevel5Data(search);
                        jr = Json(Level5Data, JsonRequestBehavior.AllowGet);

                        break;
                    }
            }




            jr.MaxJsonLength = Int32.MaxValue;
            jr.RecursionLimit = 100;
            return jr;
        }



    }
}