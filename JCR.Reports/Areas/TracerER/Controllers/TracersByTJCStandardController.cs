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
    public class TracersByTJCStandardController : Controller
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

                HelperClasses.SetReportOrScheduleID(id, (int)ReportsListEnum.TracersByTJCStandard);

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

                    return View(reportservice.GetSavedParameters_ByTJCStandard(AppSession.ReportScheduleID, savedParameters, WebConstants.ERTRACER_REPORT_TITLE_Tracer_By_TJC_Standard));
                }
                else
                {
                    ERSearchList list = new ERSearchList();
                    list = reportservice.GetSearchLists_ByTJCStandard(WebConstants.ERTRACER_REPORT_TITLE_Tracer_By_TJC_Standard);
                    List<TracersStandards> standardList = new List<TracersStandards>();
                    standardList.Add(new TracersStandards
                    {
                        TracerStandardID = Convert.ToInt32(-1),
                        Code = "All"
                    });
                    list.TracersStandards = standardList;
                    List<TracersEP> epList = new List<TracersEP>();

                    epList.Add(new TracersEP
                    {
                        EPTextID = Convert.ToInt32(-1),
                        StandardLabelAndEPLabel = "All",

                    });


                    list.TracersEPs = epList;
                    return View(list);
                }
            }
            catch (Exception ex)
            {

                ExceptionLog exceptionLog = new ExceptionLog
                {
                    ExceptionText = "ER Reports: " + ex.Message,
                    PageName = "TracersByTJCStandard",
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

        public ActionResult LoadCompliancebyProgramL1()
        {
            return PartialView("TracersbyTJCStandardReport");
        }

        public ActionResult TracersByTJCStandard_Data(SearchER search, int LevelIdentifier)
        {
            TracersByTJCStandard reportservice = new TracersByTJCStandard();
            JsonResult jr = new JsonResult();

            switch (LevelIdentifier)
            {
                case (int)WebConstants.TracerByTJCStandardLevels.Level1_Program:
                    {
                        List<ErTracersbyProgramData> Level1Data = new List<ErTracersbyProgramData>();
                        Level1Data = reportservice.GetLevel1Data(search);
                        jr = Json(Level1Data, JsonRequestBehavior.AllowGet);
                        break;
                    }

                case (int)WebConstants.TracerByTJCStandardLevels.Level2_Site:
                    {
                        List<ErTracersbySiteData> Level2Data = new List<ErTracersbySiteData>();
                        Level2Data = reportservice.GetLevel2Data(search);
                        jr = Json(Level2Data, JsonRequestBehavior.AllowGet);
                        break;
                    }
                case (int)WebConstants.TracerByTJCStandardLevels.Level3_Chapter:
                    {
                        List<ErTracersbyChapterData> Level3Data = new List<ErTracersbyChapterData>();
                        Level3Data = reportservice.GetLevel3Data(search);
                        jr = Json(Level3Data, JsonRequestBehavior.AllowGet);
                        break;
                    }
                case (int)WebConstants.TracerByTJCStandardLevels.Level4_Standard:
                    {
                        List<ErTracersbyStandardData> Level4Data = new List<ErTracersbyStandardData>();
                        Level4Data = reportservice.GetLevel4Data(search);
                        jr = Json(Level4Data, JsonRequestBehavior.AllowGet);
                        break;
                    }
                case (int)WebConstants.TracerByTJCStandardLevels.Level5_EP:
                    {
                        List<ErTracersbyEPData> Level5Data = new List<ErTracersbyEPData>();
                        Level5Data = reportservice.GetLevel5Data(search);
                        jr = Json(Level5Data, JsonRequestBehavior.AllowGet);
                        break;
                    }
                case (int)WebConstants.TracerByTJCStandardLevels.Level6_EPDetails:
                    {
                        List<ErTracersbyEPDetails> Level6Data = new List<ErTracersbyEPDetails>();
                        Level6Data = reportservice.GetLevel6Data(search);
                        jr = Json(Level6Data, JsonRequestBehavior.AllowGet);
                        break;
                    }

            }



            jr.MaxJsonLength = Int32.MaxValue;
            jr.RecursionLimit = 100;
            return jr;
        }


        [HttpPost]
        public JsonResult GetHCOIDsString(string selectedSiteIDs)
        {
            ERSearchInputService reportservice = new ERSearchInputService();
            string HCOIDs = reportservice.GetSelectedSiteHCOID(selectedSiteIDs);
            return Json(HCOIDs);
        }

      

    }
}