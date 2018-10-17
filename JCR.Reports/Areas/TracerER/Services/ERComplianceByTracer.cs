using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Data;
using System.Data.SqlClient;
using System.Configuration;
using JCR.Reports.Models;
using JCR.Reports.ViewModels;
using JCR.Reports.Common;
using Microsoft.Reporting.WebForms;
using Kendo.Mvc.UI;
using Kendo.Mvc.Extensions;
using JCR.Reports.Services;
using JCR.Reports.Areas.TracerER.ViewModels;
using System.Linq.Expressions;
using System.Text.RegularExpressions;

namespace JCR.Reports.Areas.TracerER.Services
{
    public class ERComplianceByTracer : BaseService
    {
        ExceptionService _exceptionService = new ExceptionService();

        public DataSourceResult TracerComplianceHeatMap([DataSourceRequest]DataSourceRequest request, SearchER search)
        {
            List<CompliaceByTracerHeatMap> tracerComplianceHeatMap = new List<CompliaceByTracerHeatMap>();
            DataTable dt = new DataTable();

            DataSourceResult result = new DataSourceResult();
            try
            {

                dt = this.GetComplianceTracerData(search,"heatmap").Tables[0];

                var tracerTransform = dt.ToList<ComplianceByTracerTransform>();
                //convert datatable to list       
                tracerComplianceHeatMap = TransformComplianceTracer(tracerTransform, search);
                tracerComplianceHeatMap = tracerComplianceHeatMap.OrderBy(c=>c.SiteName).ToList();
                result = tracerComplianceHeatMap.ToDataSourceResult(request, tc => new CompliaceByTracerHeatMap
                {
                    // TO DO Get Excel View DataSet
                    SiteName = tc.HCOID+" "+tc.SiteName,
                    SitewiseTracer = tc.SitewiseTracer

                });
                
            }
            catch (Exception ex)
            {
                if (ex.Message.ToString() == "No Data")
                {
                    result.Errors = WebConstants.NO_DATA_FOUND_EXCEL_VIEW;
                }
                else if (ex.Message.ToString() == "Limit")
                {
                    result.Errors = "Maximum limit of " + ConfigurationManager.AppSettings["ReportOutputLimit"].ToString() + " records reached. Refine your criteria to narrow the result.";
                }
                if (ex.Message.ToString() != "No Data" && ex.Message.ToString() != "Limit")
                {
                    ExceptionLog exceptionLog = new ExceptionLog
                    {
                        ExceptionText = "Reports: " + ex.Message,
                        PageName = "ERComplianceByTracer",
                        MethodName = "TracerComplianceHeatMap",
                        UserID = Convert.ToInt32(AppSession.UserID),
                        SiteId = Convert.ToInt32(AppSession.SelectedSiteId),
                        TransSQL = "",
                        HttpReferrer = null
                    };
                    _exceptionService.LogException(exceptionLog);
                }
            }
            return result;

        }
        private List<CompliaceByTracerHeatMap> TransformComplianceTracer(List<ComplianceByTracerTransform> tracerTransform, SearchER search)
        {
            List<CompliaceByTracerHeatMap> tracerComplianceHeatMap = new List<CompliaceByTracerHeatMap>();
            ERSearchInputService reportservice = new ERSearchInputService();
            var tracerList = Array.ConvertAll(search.TracerListNames.Split(','), p => p.Trim()).ToList();
                //reportservice.GetUHSTracersList(search.SelectedSiteIDs, search.ProgramIDs).TracersLists.Select(x=>x.TracerCustomName).ToList();
            if(tracerList.Any(i=>string.Equals("All", i, StringComparison.CurrentCultureIgnoreCase)))
            {
                tracerList = null;
                tracerList = reportservice.GetUHSTracersList(search.SelectedSiteIDs, search.ProgramIDs).TracersLists.Select(x => x.TracerCustomName).ToList();
                tracerList.RemoveAt(0);
            }
           
            tracerList.OrderBy(i => PadNumbers(i));
            foreach (var site in tracerTransform)
            {
                if (tracerComplianceHeatMap.Any(item => site.SiteID == item.SiteID))
                {
                    var newSite = tracerComplianceHeatMap.First(item => string.Equals(site.SiteName, item.SiteName, StringComparison.CurrentCultureIgnoreCase));
                    AddTracerwiseSite(newSite, site);

                }
                else
                {
                    var newSite = PopulateTracerwiseInfo(tracerList);
                    newSite.SiteName = site.SiteName;
                    newSite.SiteID = site.SiteID;
                    newSite.HCOID = site.HCOID.ToString();
                    tracerComplianceHeatMap.Add(AddTracerwiseSite(newSite, site));
                }
            }
            return tracerComplianceHeatMap;
        }
        private CompliaceByTracerHeatMap AddTracerwiseSite(CompliaceByTracerHeatMap newSite, ComplianceByTracerTransform tracerTransform)
        {
            if (newSite.SitewiseTracer.Any(item => string.Equals(item.TracerName, tracerTransform.TracerCustomName, StringComparison.CurrentCultureIgnoreCase)))
            {
                var tracerMonthInfo = newSite.SitewiseTracer.First(item => string.Equals(item.TracerName, tracerTransform.TracerCustomName, StringComparison.CurrentCultureIgnoreCase));
                tracerMonthInfo.ScheduleCompliance = "";
                if (tracerTransform.ExpectedObs != 0) {
                    var shcdlCompl = ((decimal)(100 * tracerTransform.ObservationCount) / (decimal)tracerTransform.ExpectedObs);
                    tracerMonthInfo.ScheduleCompliance = shcdlCompl > 100 ? "100.0%" : shcdlCompl.ToString("0.0")+"%";
                }
                tracerMonthInfo.TracerCompliance = tracerTransform.Denominator == 0 ? "" : ((decimal)(100*tracerTransform.Numerator)/(decimal)tracerTransform.Denominator).ToString("0.0")+"%";
            }
            return newSite;
        }

        private CompliaceByTracerHeatMap PopulateTracerwiseInfo(List<string> tracerList)
        {
            CompliaceByTracerHeatMap tbe = new CompliaceByTracerHeatMap();

            foreach (var s in tracerList)
            {
                tbe.SitewiseTracer.Add(new SiteByTracerInfo
                {
                    TracerName = s,
                    ScheduleCompliance = "",
                    TracerCompliance = ""
                });
            }

            return tbe;
        }
        private DataSet GetComplianceTracerData(SearchER searchParams, string reportType)
        {
            DataSet ds = new DataSet();
            var qutList = searchParams.QuarterListNames.ToString();
            DateTime? startDate = null;
            DateTime? endDate = null;
            System.Globalization.CultureInfo culture = System.Threading.Thread.CurrentThread.CurrentCulture;
            string year = qutList.Substring(0,4);
            if(qutList != "")
            {
                if (qutList.Contains("Q1"))
                {
                    startDate = Convert.ToDateTime(year + "-01-01 12:00:00 AM");
                    endDate = Convert.ToDateTime(year + "-03-31 11:59:00 PM");
                }
                else if (qutList.Contains("Q2"))
                {
                    startDate = Convert.ToDateTime(year + "-04-01 12:00:00 AM");
                    endDate = Convert.ToDateTime(year + "-06-30 11:59:00 PM");
                }
                else if (qutList.Contains("Q3"))
                {
                    startDate = Convert.ToDateTime(year + "-07-01 12:00:00 AM");
                    endDate = Convert.ToDateTime(year + "-09-30 11:59:00 PM");
                }
                else
                {
                    startDate = Convert.ToDateTime(year + "-10-01 12:00:00 AM");
                    endDate = Convert.ToDateTime(year + "-12-31 11:59:00 PM");
                }
            }
            
            try
            {
                if (searchParams.TracerListIDs == "-1") { searchParams.TracerListIDs = string.Empty; }
                if (searchParams.ProgramIDs == "-1") { searchParams.ProgramIDs = string.Empty; }
               // searchParams.ProgramIDs = 2;
                string sp = "ustERReport_ERCompliance";

                if (reportType == "summary")
                {
                    sp = "ustERReport_ERComplianceSummary";
                }
                else if (reportType == "details")
                {
                    sp = "ustERReport_ERComplianceDetails";
                }

                using (SqlConnection cn = new SqlConnection(this.ConnectionString))
                {
                    cn.Open();
                    SqlCommand cmd = new SqlCommand(sp, cn);
                    if(sp == "ustERReport_ERCompliance")
                    {
                        cmd.Parameters.AddWithValue("ShowAllSites", searchParams.IncludeAllSite==true?1:0);
                    }
                    cmd.CommandTimeout = 900;
                    cmd.CommandType = System.Data.CommandType.StoredProcedure;

                    cmd.Parameters.AddWithValue("SiteIDs", searchParams.SelectedSiteIDs);
                    cmd.Parameters.AddWithValue("ProgramID", AppSession.SelectedProgramId);
                    cmd.Parameters.AddWithValue("TracerIDs", searchParams.TracerListIDs);
                    cmd.Parameters.AddWithValue("ResponseStartDate", startDate);
                    cmd.Parameters.AddWithValue("ResponseEndDate", endDate);

                    //Get the SQL statement for logging
                    CreateSQLExecuted(sp, cmd);
#if DEBUG
                    System.Diagnostics.Debug.WriteLine(_SQLExecuted);
#endif
                    SqlDataAdapter da = new SqlDataAdapter(cmd);

                    using (cn)
                    using (cmd)
                    using (da)
                    {
                        da.Fill(ds);
                    }
                }
            }
            catch (Exception ex)
            {
                ex.Data.Add(TSQL, _SQLExecuted);
                throw ex;
            }

            //If no data exists, throw an exception to display the no rows found message in the UI
            if (ds.Tables[0].Rows.Count == 0)
                throw (new Exception("No Data"));

            return ds;
        }

        private static string PadNumbers(string input)
        {
            return Regex.Replace(input, "[0-9]+", match => match.Value.PadLeft(10, '0'));
        }

        //Summary Report
        public DataSourceResult TracerComplianceSummary([DataSourceRequest]DataSourceRequest request, SearchER search)
        {
            List<CompliaceByTracerSummary> tracerComplianceSummary = new List<CompliaceByTracerSummary>();
            DataTable dt = new DataTable();

            DataSourceResult result = new DataSourceResult();
            try
            {

                dt = this.GetComplianceTracerData(search, "summary").Tables[0];

                var categoryTransform = dt.ToList<ComplianceByTracerTransform>();

                categoryTransform.ForEach(z => z.ScheduleCompliance = z.ExpectedObs == 0 ? 0.0m: (decimal)((100 * z.ObservationCount)/(z.ExpectedObs)));
                categoryTransform.ForEach(z => z.ScheduleCompliance = z.ScheduleCompliance > 100 ? 100.0m : z.ScheduleCompliance);
                var results = (from row in categoryTransform
                               group row by new { row.SiteID, row.SiteName,row.HCOID, row.TracerCategoryName } into grp
                               select new ComplianceByCategoryTransform
                               {
                                   SiteID = grp.Key.SiteID,
                                   SiteName = grp.Key.SiteName,
                                   HCOID = grp.Key.HCOID,
                                   TracerCategoryName = grp.Key.TracerCategoryName,
                                   SchComplianceAverage = (grp.Average(row => Convert.ToInt64(row.ScheduleCompliance))).ToString("0.0"),
                                   TracerComplianceAverage =((decimal)(100 *grp.Sum(row => Convert.ToDecimal(row.Numerator)) / grp.Sum(row => Convert.ToDecimal(row.Denominator)))).ToString("0.0")

                               }).ToList<ComplianceByCategoryTransform>();
                               
               //convert datatable to list       
                tracerComplianceSummary = TransformComplianceCategory(results, search);
                tracerComplianceSummary = tracerComplianceSummary.OrderBy(c => c.SiteName).ToList();
                result = tracerComplianceSummary.ToDataSourceResult(request, tc => new CompliaceByTracerSummary
                {
                    SiteName = tc.HCOID.ToString() + " " + tc.SiteName,
                    SitewiseCategory = tc.SitewiseCategory

                });

            }
            catch (Exception ex)
            {
                if (ex.Message.ToString() == "No Data")
                {
                    result.Errors = WebConstants.NO_DATA_FOUND_EXCEL_VIEW;
                }
                else if (ex.Message.ToString() == "Limit")
                {
                    result.Errors = "Maximum limit of " + ConfigurationManager.AppSettings["ReportOutputLimit"].ToString() + " records reached. Refine your criteria to narrow the result.";
                }
                if (ex.Message.ToString() != "No Data" && ex.Message.ToString() != "Limit")
                {
                    ExceptionLog exceptionLog = new ExceptionLog
                    {
                        ExceptionText = "Reports: " + ex.Message,
                        PageName = "ERComplianceByTracer",
                        MethodName = "TracerComplianceSummary",
                        UserID = Convert.ToInt32(AppSession.UserID),
                        SiteId = Convert.ToInt32(AppSession.SelectedSiteId),
                        TransSQL = "",
                        HttpReferrer = null
                    };
                    _exceptionService.LogException(exceptionLog);
                }
            }
            return result;

        }
     
        private List<CompliaceByTracerSummary> TransformComplianceCategory(List<ComplianceByCategoryTransform> categoryTransform, SearchER search)
        {
            List<CompliaceByTracerSummary> CategoryComplianceSummary = new List<CompliaceByTracerSummary>();
            List<string> categoryList = new List<string>();
            categoryList.Add("Documentation");
            categoryList.Add("Infection Control");
           // var categoryList = categoryTransform.Select(item => item.TracerCategoryName).Distinct().OrderBy(item => PadNumbers(item)).ToList();

            foreach (var site in categoryTransform)
            {
                if (CategoryComplianceSummary.Any(item => site.SiteID == item.SiteID))
                {
                    var newSite = CategoryComplianceSummary.First(item => string.Equals(site.SiteName, item.SiteName, StringComparison.CurrentCultureIgnoreCase));
                    AddCategorywiseSite(newSite, site);

                }
                else
                {
                    var newSite = PopulateCategorywiseInfo(categoryList);
                    newSite.SiteName = site.SiteName;
                    newSite.SiteID = site.SiteID;
                    newSite.HCOID = site.HCOID;
                    CategoryComplianceSummary.Add(AddCategorywiseSite(newSite, site));
                }
            }
            return CategoryComplianceSummary;
        }
        private CompliaceByTracerSummary AddCategorywiseSite(CompliaceByTracerSummary newSite, ComplianceByCategoryTransform categoryTransform)
        {
            if (newSite.SitewiseCategory.Any(item => string.Equals(item.CategoryName, categoryTransform.TracerCategoryName, StringComparison.CurrentCultureIgnoreCase)))
            {
                var categoryInfo = newSite.SitewiseCategory.First(item => string.Equals(item.CategoryName, categoryTransform.TracerCategoryName, StringComparison.CurrentCultureIgnoreCase));
                categoryInfo.AverageScheduleCompliance = Convert.ToDecimal(categoryTransform.SchComplianceAverage) > 100 ? "100.0%" : categoryTransform.SchComplianceAverage + "%";
                categoryInfo.AverageTracerCompliance = categoryTransform.TracerComplianceAverage + "%";
            }
            return newSite;
        }
        private CompliaceByTracerSummary PopulateCategorywiseInfo(List<string> categoryList)
        {
            CompliaceByTracerSummary tbe = new CompliaceByTracerSummary();

            foreach (var s in categoryList)
            {
                tbe.SitewiseCategory.Add(new SiteByCategoryInfo
                {
                    CategoryName = s,
                    AverageScheduleCompliance = "",
                    AverageTracerCompliance = ""
                });
            }

            return tbe;
        }
        //Details Report
        public DataSourceResult TracerComplianceDetails([DataSourceRequest]DataSourceRequest request, SearchER search)
        {
            List<CompliaceByTracerDetails> tracerComplianceDetails = new List<CompliaceByTracerDetails>();
            DataTable dt = new DataTable();

            DataSourceResult result = new DataSourceResult();
            try
            {

                dt = this.GetComplianceTracerData(search, "details").Tables[0];

                var siteTransform = dt.ToList<ComplianceBySiteTransform>();

                //convert datatable to list       
                tracerComplianceDetails = TransformComplianceSite(siteTransform, search);
                result = tracerComplianceDetails.ToDataSourceResult(request, tc => new CompliaceByTracerDetails
                {
                    QuestionText = tc.QuestionText,
                    QuesNo = tc.QuesNo,
                    QuestionwiseSite = tc.QuestionwiseSite,
                    Tracer = tc.Tracer

                });

            }
            catch (Exception ex)
            {
                if (ex.Message.ToString() == "No Data")
                {
                    result.Errors = WebConstants.NO_DATA_FOUND_EXCEL_VIEW;
                }
                else if (ex.Message.ToString() == "Limit")
                {
                    result.Errors = "Maximum limit of " + ConfigurationManager.AppSettings["ReportOutputLimit"].ToString() + " records reached. Refine your criteria to narrow the result.";
                }
                if (ex.Message.ToString() != "No Data" && ex.Message.ToString() != "Limit")
                {
                    ExceptionLog exceptionLog = new ExceptionLog
                    {
                        ExceptionText = "Reports: " + ex.Message,
                        PageName = "ERComplianceByTracer",
                        MethodName = "TracerComplianceDetails",
                        UserID = Convert.ToInt32(AppSession.UserID),
                        SiteId = Convert.ToInt32(AppSession.SelectedSiteId),
                        TransSQL = "",
                        HttpReferrer = null
                    };
                    _exceptionService.LogException(exceptionLog);
                }
            }
            return result;

        }
       
        private List<CompliaceByTracerDetails> TransformComplianceSite(List<ComplianceBySiteTransform> siteTransform, SearchER search)
        {
            List<CompliaceByTracerDetails> SiteComplianceDetails = new List<CompliaceByTracerDetails>();
            ERSearchInputService reportservice = new ERSearchInputService();
            var siteList = reportservice.GetSitesList(search.SelectedSiteIDs);
           // var siteList = siteTransform.Select(item => item.SiteName).Distinct().OrderBy(item => PadNumbers(item)).ToList();

            foreach (var tracerquestion in siteTransform)
            {
                if (SiteComplianceDetails.Any(item => tracerquestion.tracerquestion_rank == item.tracerquestion_rank && tracerquestion.tracercustom_rank == item.tracercustom_rank))
                {
                    var newQuestion = SiteComplianceDetails.First(item => string.Equals(tracerquestion.questiontext, item.QuestionText, StringComparison.CurrentCultureIgnoreCase));
                    AddSitewiseQuestion(newQuestion, tracerquestion);

                }
                else
                {
                    var newQuestion = PopulateSitewiseInfo(siteList);
                    newQuestion.QuestionText = tracerquestion.questiontext;
                    newQuestion.tracerquestion_rank = tracerquestion.tracerquestion_rank;
                    newQuestion.tracercustom_rank = tracerquestion.tracercustom_rank;
                    newQuestion.QuesNo = tracerquestion.QuesNo;
                    newQuestion.Tracer = tracerquestion.TracerCustomName;
                    SiteComplianceDetails.Add(AddSitewiseQuestion(newQuestion, tracerquestion));
                }
            }
            return SiteComplianceDetails;
        }
        private CompliaceByTracerDetails AddSitewiseQuestion(CompliaceByTracerDetails newQuestion, ComplianceBySiteTransform siteTransform)
        {
            if (newQuestion.QuestionwiseSite.Any(item => string.Equals(item.SiteName, siteTransform.SiteName, StringComparison.CurrentCultureIgnoreCase)))
            {
                var siteInfo = newQuestion.QuestionwiseSite.First(item => string.Equals(item.SiteName, siteTransform.SiteName, StringComparison.CurrentCultureIgnoreCase));
                siteInfo.Numerator = siteTransform.Numerator.ToString();
                siteInfo.Denominator = siteTransform.Denominator.ToString();
                siteInfo.CompliancePercent = siteTransform.Denominator == 0 ? "" : siteTransform.CompliancePercent + "%";
            }
            return newQuestion;
        }
        private CompliaceByTracerDetails PopulateSitewiseInfo(List<string> siteList)
        {
            CompliaceByTracerDetails tbe = new CompliaceByTracerDetails();

            foreach (var s in siteList)
            {
                tbe.QuestionwiseSite.Add(new QuestionBySiteInfo
                {
                    SiteName = s,
                    Numerator = "",
                    Denominator = "",
                    CompliancePercent = ""
                });
            }

            return tbe;
        }



    }
}