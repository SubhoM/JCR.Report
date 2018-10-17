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
    public class ERTracerDashboard : BaseService
    {
        ExceptionService _exceptionService = new ExceptionService();

        public DataSourceResult TracerDashboardHeatMap([DataSourceRequest]DataSourceRequest request, SearchER search)
        {
            List<CompliaceByTracerHeatMap> tracerComplianceHeatMap = new List<CompliaceByTracerHeatMap>();
            DataTable dt = new DataTable();

            DataSourceResult result = new DataSourceResult();
            try
            {

                dt = this.GetComplianceTracerData(search, "heatmap").Tables[0];

                var tracerTransform = dt.ToList<ComplianceByTracerTransform>();
                //convert datatable to list       
                tracerComplianceHeatMap = TransformDashboardTracer(tracerTransform, search);
                result = tracerComplianceHeatMap.ToDataSourceResult(request, tc => new CompliaceByTracerHeatMap
                {
                    // TO DO Get Excel View DataSet
                    SiteName =  tc.SiteName,
                    HCOID = tc.HCOID.ToString() == "0" ? "" : tc.HCOID.ToString(),
                    OverallTotalCompletedObservation = tc.OverallTotalCompletedObservation,
                    OverallTracerCompliance = tc.OverallTracerCompliance,
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
                        PageName = "ERTracerDashboard",
                        MethodName = "TracerDashboardHeatMap",
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
        private List<CompliaceByTracerHeatMap> TransformDashboardTracer(List<ComplianceByTracerTransform> tracerTransform, SearchER search)
        {
            List<CompliaceByTracerHeatMap> tracerComplianceHeatMap = new List<CompliaceByTracerHeatMap>();
            ERSearchInputService reportservice = new ERSearchInputService();
            var tracerList = Array.ConvertAll(search.TracerListNames.Split('€'), p => p.Trim()).ToList();
            if (tracerList.Any(i => string.Equals("All", i, StringComparison.CurrentCultureIgnoreCase)))
            {
                tracerList = null;
                tracerList = reportservice.GetMultiSiteTracersList(search.SelectedSiteIDs, search.ProgramIDs).TracersLists.Select(x => x.TracerCustomName).ToList();
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
            newSite.OverallTotalCompletedObservation += tracerTransform.ObservationCount;
            newSite.OverallNum += tracerTransform.Numerator;
            newSite.OverallDen += tracerTransform.Denominator;
            newSite.OverallTracerCompliance = (newSite.OverallDen == 0 && newSite.OverallNum == 0) ? "N/A" : ((decimal)(100 * newSite.OverallNum) / (decimal)newSite.OverallDen).ToString("0.0") + "%";
            newSite.OverallTracerCompliance = newSite.OverallTotalCompletedObservation == 0 ? "" : newSite.OverallTracerCompliance;
            if (newSite.SitewiseTracer.Any(item => string.Equals(item.TracerName, tracerTransform.TracerCustomName, StringComparison.CurrentCultureIgnoreCase)))
            {
                var tracerMonthInfo = newSite.SitewiseTracer.First(item => string.Equals(item.TracerName, tracerTransform.TracerCustomName, StringComparison.CurrentCultureIgnoreCase));
                tracerMonthInfo.TotalCompletedObservations = tracerTransform.ObservationCount == 0 ? "" : tracerTransform.ObservationCount.ToString();
                tracerMonthInfo.TracerCompliance = tracerTransform.Denominator == 0 && tracerTransform.Numerator == 0 ? "N/A" : ((decimal)(100 * tracerTransform.Numerator) / (decimal)tracerTransform.Denominator).ToString("0.0") + "%";
                tracerMonthInfo.TracerCompliance = tracerMonthInfo.TotalCompletedObservations == "" ? "" : tracerMonthInfo.TracerCompliance;
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
                    TotalCompletedObservations = "",
                    TracerCompliance = ""
                });
            }

            return tbe;
        }
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
                tracerComplianceDetails = TransformDashboardSite(siteTransform, search);
                result = tracerComplianceDetails.ToDataSourceResult(request, tc => new CompliaceByTracerDetails
                {
                    QuestionText = tc.QuestionText,
                    QuesNo = tc.QuesNo,
                    OverallTracerCompliance = tc.OverallTracerCompliance,
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

        private List<CompliaceByTracerDetails> TransformDashboardSite(List<ComplianceBySiteTransform> siteTransform, SearchER search)
        {
            List<CompliaceByTracerDetails> SiteComplianceDetails = new List<CompliaceByTracerDetails>();
            ERSearchInputService reportservice = new ERSearchInputService();
            var siteList = reportservice.GetSitesList(search.SelectedSiteIDs);
            // var siteList = siteTransform.Select(item => item.SiteName).Distinct().OrderBy(item => PadNumbers(item)).ToList();

            foreach (var tracerquestion in siteTransform)
            {
                if (SiteComplianceDetails.Any(item => tracerquestion.tracerquestion_rank == item.tracerquestion_rank && tracerquestion.tracercustom_rank == item.tracercustom_rank))
                {
                    var newQuestion = SiteComplianceDetails.FirstOrDefault(item => string.Equals(tracerquestion.questiontext, item.QuestionText, StringComparison.CurrentCultureIgnoreCase));
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
            newQuestion.OverallNum += siteTransform.Numerator;
            newQuestion.OverallDen += siteTransform.Denominator;
            newQuestion.OverallTracerCompliance = (newQuestion.OverallDen == 0 && newQuestion.OverallNum == 0) ? "N/A" : ((decimal)(100 * newQuestion.OverallNum) / (decimal)newQuestion.OverallDen).ToString("0.0") + "%";
            if (newQuestion.QuestionwiseSite.Any(item => string.Equals(item.SiteName, siteTransform.SiteName, StringComparison.CurrentCultureIgnoreCase)))
            {
                var siteInfo = newQuestion.QuestionwiseSite.FirstOrDefault(item => string.Equals(item.SiteName, siteTransform.SiteName, StringComparison.CurrentCultureIgnoreCase));
                siteInfo.Numerator = siteTransform.Numerator.ToString();
                siteInfo.Denominator = siteTransform.Denominator.ToString();
                siteInfo.CompliancePercent = siteTransform.Denominator == 0 ? "N/A" : siteTransform.CompliancePercent + "%";
            }
            return newQuestion;
        }
        private CompliaceByTracerDetails PopulateSitewiseInfo(List<string> siteList)
        {
            CompliaceByTracerDetails tbe = new CompliaceByTracerDetails();
            tbe.OverallNum = 0;
            tbe.OverallDen = 0;
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

        private DataSet GetComplianceTracerData(SearchER searchParams, string reportType)
        {
            DataSet ds = new DataSet();
            
            try
            {
                searchParams.EndDate = (searchParams.EndDate != null && searchParams.EndDate.ToString() != "") ? searchParams.EndDate.Value.Date.AddHours(23).AddMinutes(29).AddSeconds(59) : searchParams.EndDate;
                if (searchParams.TracerListIDs == "-1") { searchParams.TracerListIDs = string.Empty; }
                if (searchParams.ProgramIDs == "-1") { searchParams.ProgramIDs = string.Empty; }
                // searchParams.ProgramIDs = 2;
                string sp = "ustERReport_ERTracerDashboardHeatMap";

                if (reportType == "details")
                {
                    sp = "ustERReport_ERTracerDashboardDetails";
                }

                using (SqlConnection cn = new SqlConnection(this.ConnectionString))
                {
                    cn.Open();
                    SqlCommand cmd = new SqlCommand(sp, cn);
                    if (sp == "ustERReport_ERTracerDashboardHeatMap")
                    {
                        cmd.Parameters.AddWithValue("ShowAllSites", searchParams.IncludeAllSite == true ? 1 : 0);
                    }
                    cmd.CommandTimeout = 900;
                    cmd.CommandType = System.Data.CommandType.StoredProcedure;

                    cmd.Parameters.AddWithValue("SiteIDs", searchParams.SelectedSiteIDs);
                    cmd.Parameters.AddWithValue("TracerIDs", searchParams.TracerListIDs);
                    cmd.Parameters.AddWithValue("ResponseStartDate", searchParams.StartDate);
                    cmd.Parameters.AddWithValue("ResponseEndDate", searchParams.EndDate);
                    
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
    }
}