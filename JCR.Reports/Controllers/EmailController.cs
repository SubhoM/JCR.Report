using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using JCR.Reports.ViewModels;
using JCR.Reports.Common;
using JCR.Reports.Services;
using Microsoft.Reporting.WebForms;
using JCR.Reports.Models;
using System.Data;
using System.Data.SqlClient;
using JCR.Reports.Areas.TracerER.Services;
using JCR.Reports.Areas.Tracer.Services;
namespace JCR.Reports.Controllers
{
    public class EmailController : Controller
    {
        //
        // GET: /Email/
        [SessionExpireFilter]
        public ActionResult Index()
        {
            return View();
        }

        /// <summary>
        /// GetEmailList: ajax call - get a list of emails matching search term
        /// used for autocomplete functionality in schedule emails
        /// </summary>
        /// <param name="search">search term</param>
        /// <returns>json list of emails for dropdown</returns>
        [HttpPost]
        public JsonResult GetEmailList(string search)
        {

            var emailService = new CommonService();
            List<string> list = emailService.GetEmailList(search);

            return Json(list.ToArray());
        }



        public ActionResult SendExcelEmail(string base64, Email email)
        {
            var emailService = new CommonService();
            bool emailSuccess = true;
            var emailMessage = WebConstants.Excel_Email_Success;
            try
            {
                byte[] fileContents = Convert.FromBase64String(base64);
                if (email.MultipleAttachment) {

                    if (Session["Attachment1Location"] == null )
                    {
                        if (email.ReportName == "gridMQB" || email.ReportName == "gridMTB")
                            email.Title = email.Title + " Data";
                        if (email.ReportName == "gridHeatMap")
                            email.Title = email.Title + "Infection Control";
                        Session["Attachment1Location"] = emailService.SaveExcel(email.Title.ToString(), fileContents);
                        emailMessage = "Preping Second Attachment";
                    }
                    else
                    {
                        if (email.ReportName == "gridMQB" || email.ReportName == "gridMTB")
                            email.Title = email.Title + " Data";
                        else if (email.ReportName == "gridHeatMap")
                            email.Title = email.Title + "Documentation";
                        else
                            email.Title = email.Title.ToString() + " Details";
                        email.AttachmentLocation[0] = Session["Attachment1Location"].ToString();
                        email.AttachmentLocation[1] = emailService.SaveExcel(email.Title, fileContents);
                        email.FileContents = fileContents;
                        emailSuccess = emailService.SendExcelEmailAttachemnt(email);
                        if (emailSuccess) { emailMessage = WebConstants.Excel_Email_Success; } else { emailMessage = WebConstants.Email_Failed; }
                        Session["Attachment1Location"] = null;

                    }
                    
                }
                else {
                    email.AttachmentLocation[0] = emailService.SaveExcel(email.Title.ToString(), fileContents);
                    email.FileContents = fileContents;
                    emailSuccess = emailService.SendExcelEmailAttachemnt(email,AppSession.LinkType == 10 ? true : false);
                    if (emailSuccess) { emailMessage = WebConstants.Excel_Email_Success; } else { emailMessage = WebConstants.Email_Failed; }
                }
            }
            catch (Exception)
            {
                emailMessage = WebConstants.Excel_Email_Failed;
            }
            return Json(emailMessage);

        }

        private string GetPDFFilePath(string ExcelGridName, string fileName)
        {
            var emailService = new CommonService();
            Search searchcriteria = Session["searchcriteria"] as Search;
            Session.Remove("searchcriteria");
            //get dataset as required using Session["searchcriteria"] as parameter
            DataTable dt = new DataTable();
            byte[] file = null;
            if (ExcelGridName == "chartMQB" || ExcelGridName == "chartMTB")
            {
                var service = new MonthlyBreakdownService();
                file = service.MonthlyBreakdownChartIE(searchcriteria);
                fileName = fileName + " Graph";
            }
            return emailService.SavePDF(fileName, file);
        }


        public ActionResult SendPDFEmail(string ExcelGridName, Email email, string SortBy, string SortOrder)
        {
            var emailService = new CommonService();
            bool emailSuccess = true;
            var emailMessage = WebConstants.Excel_Email_Success;

            try
            {
                byte[] fileContents = null;
                if (email.MultipleAttachment)
                {
                    if (Session["Attachment1Location"] == null)
                    {
                        Session["Attachment1Location"] = GetPDFFilePath(ExcelGridName, email.Title.ToString());
                        emailMessage = "Preping Second Attachment";
                    }
                    else
                    {
                        email.AttachmentLocation[0] = Session["Attachment1Location"].ToString();
                        email.AttachmentLocation[1] = GetPDFFilePath(ExcelGridName, email.Title.ToString());
                        email.FileContents = fileContents;
                        emailSuccess = emailService.SendExcelEmailAttachemnt(email);
                        if (emailSuccess) { emailMessage = WebConstants.Excel_Email_Success; } else { emailMessage = WebConstants.Email_Failed; }
                        Session["Attachment1Location"] = null;

                    }
                }
                else
                {

                    if (ExcelGridName == "Tracer by CMS")
                    {
                        var cmsService = new TracerByCMS();


                        Search searchcriteria = Session["searchcriteria"] as Search;
                        Session.Remove("searchcriteria");


                        string filtereddataTag = Session["filtereddataCMS"].ToString();
                        Session.Remove("filtereddataCMS");

                        fileContents = cmsService.TracerByCMSIE(searchcriteria, 1, filtereddataTag, SortBy, SortOrder);
                    }
                    else
                    {
                        TracerComplianceQuestionInput searchcriteria = Session["searchcriteria"] as TracerComplianceQuestionInput;
                        Session.Remove("searchcriteria");
                        var dcaService = new TracerComplianceQuestion();
                        //if (Convert.ToInt32(searchcriteria.TopLeastCompliantQuestions) > 0)
                        //{
                        //    searchcriteria.TopLeastCompliantQuestions = (Convert.ToInt32(searchcriteria.TopLeastCompliantQuestions) - 1).ToString();
                        //}
                        string filtereddataQID = Session["filtereddataQID"].ToString();
                        Session.Remove("filtereddataQID");
                        fileContents = dcaService._complianceQuestionChartRDLC(searchcriteria, filtereddataQID, SortBy, SortOrder);
                    }


                    email.AttachmentLocation[0] = emailService.SavePDF(ExcelGridName, fileContents);
                    email.FileContents = fileContents;
                    emailSuccess = emailService.SendExcelEmailAttachemnt(email);
                    if (emailSuccess) { emailMessage = WebConstants.Excel_Email_Success; } else { emailMessage = WebConstants.Email_Failed; }
                }
            }
            catch (Exception)
            {
                emailMessage = WebConstants.Excel_Email_Failed;
            }
            finally
            {
                Session.Remove("searchcriteria");
            }
            return Json(emailMessage);
        
        
        }
        public ActionResult SendExcelEmailIE8(string ExcelGridName, Email email)
        {
            var emailService = new CommonService();
            bool emailSuccess = true;
            var emailMessage = WebConstants.Excel_Email_Success;
            try
            {
                            
                DataTable dt = new DataTable();
                byte[] file = null;
                if (ExcelGridName == "gridTCEPDIE8" || ExcelGridName == "gridTCEPIE8" || ExcelGridName == "gridTCEPQIE8" || ExcelGridName == "gridTCSTDIE8")
                {
                    var teService = new TracerByEP();
                    file = teService.TracerByEPDataIE(Session["searchcriteria"] as Search);
                }
                else if (ExcelGridName == "gridTCQUESIE8")
                {
                    var tcService = new TracerComprehensive();
                    file = tcService.TracerComprehensiveDataIE(Session["searchcriteria"] as Search);

                }
                else if (ExcelGridName == "gridTCRESPIE8")
                {
                    var tcService = new TracerComprehensive();
                    file = tcService.TracerComprehensiveDataIE(Session["searchcriteria"] as Search);

                }
                else if (ExcelGridName == "gridDCADATAIE8")
                {
                    var teService = new DepartmentComparativeAnalysis();
                    file = teService.DepartmentComparativeAnalysisDataExcelIE8(Session["searchcriteria"] as Search);

                }
                else if (ExcelGridName == "gridCompQuesDetIE8")
                {
                    var teService = new TracerComplianceQuestion();
                    file = teService.ReportComplianceQuestionDetailExcelIE8(Session["searchcriteria"] as TracerComplianceQuestionInput);

                }
                else if (ExcelGridName == "gridTCCMSIE8")
                {
                    var cmsService = new TracerByCMS();
                    file = cmsService.TracerByCMSIE(Session["searchcriteria"] as Search, 2);        // Request detail version
                }
                else if (ExcelGridName == "gridMQB")
                {
                    var qmbService = new MonthlyBreakdownService();
                    file = qmbService.QuestionMonthlyBreakdownDataIE(Session["searchcriteria"] as Search);
                }
                else if (ExcelGridName == "gridMTB")
                {
                    var tmbService = new MonthlyBreakdownService();
                    file = tmbService.TracerMonthlyBreakdownDataIE(Session["searchcriteria"] as Search);
                }

                if (email.MultipleAttachment)
                {

                    email.AttachmentLocation[0] = emailService.SaveExcel(email.Title.ToString(), file);
                    var teService = new DepartmentComparativeAnalysis();
                    file = teService.DepartmentComparativeAnalysisOppExcelIE8(Session["searchcriteria"] as Search);
                    email.AttachmentLocation[1] = emailService.SaveExcel(email.Title.ToString() + " Details", file);
                    email.FileContents = file;
                    emailSuccess = emailService.SendExcelEmailAttachemnt(email);
                    if (emailSuccess) { emailMessage = WebConstants.Excel_Email_Success; } else { emailMessage = WebConstants.Email_Failed; }


                }
                else
                {
                    email.AttachmentLocation[0] = emailService.SaveExcel(email.Title.ToString(), file);
                    email.FileContents = file;
                    emailSuccess = emailService.SendExcelEmailAttachemnt(email);
                    if (emailSuccess) { emailMessage = WebConstants.Excel_Email_Success; } else { emailMessage = WebConstants.Email_Failed; }
                }
            }
            catch (Exception)
            {
                emailMessage = WebConstants.Excel_Email_Failed;
            }
            finally
            {
                Session.Remove("searchcriteria");
            }
            return Json(emailMessage);

        }


        public ActionResult SetVariable(string key, string value)
        {
            Session[key] = value;

            return this.Json(new { success = true });
        }



        public ActionResult SendERPDFEmail(string ExcelGridName, Email email, string ERReportName, string SortBy = "", string SortOrder = "")
        {
            var emailService = new CommonService();
            bool emailSuccess = true;
            var emailMessage = WebConstants.Excel_Email_Success;

            try
            {
                byte[] fileContents = null;
                SearchER ERsearchcriteria = Session["ERsearchcriteria"] as SearchER;
                //   Session.Remove("ERsearchcriteria");

                if (ERReportName == "TracersByTJCStandard")
                {
                    var tjcStandardService = new TracersByTJCStandard();

                    fileContents = tjcStandardService.TracerByTJCStandardRDLC(ERsearchcriteria, (int)WebConstants.ReportFormat.PDF, SortBy, SortOrder);
                }
                else if (ERReportName == "ERTracerByQuestion")
                {

                    var ERTracerByQuestion = new ERTracerByQuestion();

                    fileContents = ERTracerByQuestion.ERTracerByQuestionRDLC(ERsearchcriteria, (int)WebConstants.ReportFormat.PDF, SortBy, SortOrder);
                }
                else
                {
                    var tcsService = new TracersComplianceSummary();
                    fileContents = tcsService.TracersComplianceSummaryRDLC(ERsearchcriteria, (int)WebConstants.ReportFormat.PDF, SortBy, SortOrder);
                }
                email.AttachmentLocation[0] = emailService.SavePDF(ExcelGridName, fileContents);
                email.FileContents = fileContents;
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
                SearchER ERsearchcriteria = Session["ERsearchcriteria"] as SearchER;
                Session.Remove("ERsearchcriteria");

                if (ERReportName == "TracersByTJCStandard")
                {
                    var tjcStandardService = new TracersByTJCStandard();

                    fileContents = tjcStandardService.TracerByTJCStandardRDLC(ERsearchcriteria, (int)WebConstants.ReportFormat.PDF, SortBy, SortOrder);
                }
                else if (ERReportName == "ERTracerByQuestion")
                {

                    var ERTracerByQuestion = new ERTracerByQuestion();

                    fileContents = ERTracerByQuestion.ERTracerByQuestionRDLC(ERsearchcriteria, (int)WebConstants.ReportFormat.PDF, SortBy, SortOrder);
                }
                else
                {
                    var tcsService = new TracersComplianceSummary();
                    fileContents = tcsService.TracersComplianceSummaryRDLC(ERsearchcriteria, (int)WebConstants.ReportFormat.PDF, SortBy, SortOrder);
                }
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