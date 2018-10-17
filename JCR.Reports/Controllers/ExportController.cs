using JCR.Reports.Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using JCR.Reports.Models;
using System.Data;
using System.Data.SqlClient;
using JCR.Reports.Services;
using JCR.Reports.Areas.Tracer.Services;
namespace JCR.Reports.Controllers
{
    public class ExportController : Controller
    {
        //
        // GET: /Export/
        [SessionExpireFilter]
        public ActionResult Index()
        {
            return View();
        }

        [HttpPost]
        public ActionResult Excel_Export_Save(string contentType, string base64, string fileName)
        {
            byte[] fileContents = Convert.FromBase64String(base64);
            string dtNow = DateTime.Now.ToString("MM-dd-yyyy_hhmmssfff_tt");
            string filename = string.Format("{0}_{1}.xlsx", fileName, dtNow.ToString());
            return File(fileContents, contentType, fileName);

        }

        [HttpPost]
        public ActionResult Pdf_Export_Save(string contentType, string base64, string fileName)
        {
            var fileContents = Convert.FromBase64String(base64);

            return File(fileContents, contentType, fileName);
        }
        public ActionResult CreateSessionCriteria(Search search)
        {
            Session["searchcriteria"] = search;

            return Json(new { success = true }, JsonRequestBehavior.AllowGet);
        }

        public ActionResult CreateERSessionCriteria(SearchER ERsearch)
        {
            Session["ERsearchcriteria"] = ERsearch;

            return Json(new { success = true }, JsonRequestBehavior.AllowGet);
        }
        public ActionResult CreateSessionCriteriaQuestion(TracerComplianceQuestionInput search, string filtereddataQID)
        {
            //if (Convert.ToInt32(search.TopLeastCompliantQuestions) != 0)
            //{
            //    search.TopLeastCompliantQuestions = (Convert.ToInt32(search.TopLeastCompliantQuestions) - 1).ToString();
            //}
            Session["searchcriteria"] = search;
            Session["filtereddataQID"] = filtereddataQID;
            return Json(new { success = true }, JsonRequestBehavior.AllowGet);
        }
        public ActionResult CreateSessionCriteriaCMS(Search search, string filtereddataCMS)
        {
            
            Session["searchcriteria"] = search;
            Session["filtereddataCMS"] = filtereddataCMS;
            return Json(new { success = true }, JsonRequestBehavior.AllowGet);
        }

        public ActionResult CreatePDFFile(string fileName, string ChartName)
        {
            Search searchcriteria = Session["searchcriteria"] as Search;
            Session.Remove("searchcriteria");
            //get dataset as required using Session["searchcriteria"] as parameter
            DataTable dt = new DataTable();
            byte[] file = null;

            if (ChartName == "chartMQB" || ChartName == "chartMTB")
            {
                var service = new MonthlyBreakdownService();
                file = service.MonthlyBreakdownChartIE(searchcriteria);
            }

            string filename = string.Format("{0}.pdf", fileName);

            return File(file, "application/pdf", filename);

        }

        public ActionResult CreateExcelFile(string fileName, string ExcelGridName)
        {
            Search searchcriteria = Session["searchcriteria"] as Search;
            Session.Remove("searchcriteria");
            //get dataset as required using Session["searchcriteria"] as parameter
            DataTable dt = new DataTable();
            byte[] file = null;

            if (ExcelGridName == "gridTCEPDIE8" || ExcelGridName == "gridTCEPIE8" || ExcelGridName == "gridTCEPQIE8" || ExcelGridName == "gridTCSTDIE8")
            {
                var teService = new TracerByEP();
                file = teService.TracerByEPDataIE(searchcriteria);
            }
            else if (ExcelGridName == "gridTCQUESIE8" || ExcelGridName == "gridTCRESPIE8")
            {
                var tcService = new TracerComprehensive();
                file = tcService.TracerComprehensiveDataIE(searchcriteria);

            }
            else if (ExcelGridName == "gridDCADATAIE8")
            {
                var teService = new DepartmentComparativeAnalysis();
                file = teService.DepartmentComparativeAnalysisDataExcelIE8(searchcriteria);

            }
            else if (ExcelGridName == "gridDCAOPPIE8")
            {
                var teService = new DepartmentComparativeAnalysis();
                file = teService.DepartmentComparativeAnalysisOppExcelIE8(searchcriteria);
            }
            else if (ExcelGridName == "gridTCCMSIE8")
            {
                var cmsService = new TracerByCMS();
                file = cmsService.TracerByCMSIE(searchcriteria, 2);     // 2 = Request By Data Detail version  (1 = Graph version)
            }
            else if (ExcelGridName == "gridMQB")
            {
                var qmbService = new MonthlyBreakdownService();
                file = qmbService.QuestionMonthlyBreakdownDataIE(searchcriteria);
            }
            else if (ExcelGridName == "gridMTB")
            {
                var tmbService = new MonthlyBreakdownService();
                file = tmbService.TracerMonthlyBreakdownDataIE(searchcriteria);
            }

            //// Get the spreadsheet from seession.
            //replace file with the actual content
           // byte[] file = System.Text.Encoding.ASCII.GetBytes(dt.CreateCSVFile());
            string filename = string.Format("{0}.xlsx", fileName);

            return File(file, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", filename);


        }
        public ActionResult CreateExcelFileQuestion(string fileName, string ExcelGridName)
        {
            TracerComplianceQuestionInput searchcriteria = Session["searchcriteria"] as TracerComplianceQuestionInput;
            Session.Remove("searchcriteria");
            //get dataset as required using Session["searchcriteria"] as parameter
            DataTable dt = new DataTable();
           
            var teService = new TracerComplianceQuestion();
            byte[] file  = teService.ReportComplianceQuestionDetailExcelIE8(searchcriteria);
            // Get the spreadsheet from seession.
            //replace file with the actual content
     

               string filename = string.Format("{0}.xlsx", fileName);

            return File(file, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", filename);


        }

        public ActionResult exportPdfFileByLocation(string ExportFileName, string guid)
        {
            JCR.Reports.ViewModels.FileResult fileDetails = null;
            try
            {
                fileDetails = EprodWebApi.RetrieveFile(guid);
                string dtNow = DateTime.Now.ToString("MM-dd-yyyy_hhmmssfff_tt");
                string filename = string.Format("{0}_{1}.pdf", ExportFileName, dtNow.ToString());
                return File(fileDetails.FileStream, "application/pdf", filename);
            }
            finally
            {
                Session.Remove("createErPdfLocation");
            }
         
        
        }

        public ActionResult exportExcelFileByLocation(string ExportFileName, string guid)
        {
            JCR.Reports.ViewModels.FileResult fileDetails = null;
            
            fileDetails = EprodWebApi.RetrieveFile(guid);
            string dtNow = DateTime.Now.ToString("MM-dd-yyyy_hhmmssfff_tt");
            string filename = string.Format("{0}_{1}.xlsx", ExportFileName, dtNow.ToString());
            return File(fileDetails.FileStream, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", filename);
            
        }
    }
}