﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Data;
using System.Data.SqlClient;
using JCR.Reports.Models;
using JCR.Reports.ViewModels;
using Microsoft.Reporting.WebForms;
using JCR.Reports.Services;

using JCR.Reports.Common;
using JCR.Reports.Areas.TracerER.ViewModels;

namespace JCR.Reports.Areas.TracerER.Services
{
    public class TracersComplianceSummary : BaseService
    {
        /// <summary>
        /// Constructors
        /// </summary>
        public TracersComplianceSummary()
            : base()
        {
        }
        ExceptionService _exceptionService = new ExceptionService();
        public List<ErTracersbyProgramData> GetLevel1Data(SearchER search)
        {
            var Level1Data = new List<ErTracersbyProgramData>();
            Level1Data = GetLevel1DataSet(search).Tables[0].ToList<ErTracersbyProgramData>();
            Level1Data.ForEach(z => z.NACompliancePercent = Decimal.Equals(z.Numerator, 0) & Decimal.Equals(z.Denominator, 0) ? 100.0m : 0.0m);
            Level1Data.ForEach(z => z.NonCompliancePercent = Decimal.Equals(z.Numerator, 0) & Decimal.Equals(z.Denominator, 0) ? 0.0m : z.NonCompliancePercent);
            return Level1Data;
        }
    

        public DataSet GetLevel1DataSet(SearchER search)
        {
            var list = new List<ErTracersbyProgramData>();

            DataSet ds = new DataSet();
          
            try
            {
                using (SqlConnection cn = new SqlConnection(this.ConnectionString))
                {
                    cn.Open();

                   SqlCommand cmd = new SqlCommand("ustERReport_TracerComplianceSummary_ByProgram", cn);
                    cmd.CommandTimeout = 900;
                    cmd.CommandType = CommandType.StoredProcedure;
                    cmd.Parameters.AddWithValue("SiteIDs", search.SelectedSiteIDs);
                    cmd.Parameters.AddWithValue("ProgramIDs", search.ProgramIDs == "-1" ? "" : search.ProgramIDs);
                    cmd.Parameters.AddWithValue("TracerIDs", search.TracerListIDs == "-1" ? "" : search.TracerListIDs);
                 
                    cmd.Parameters.AddWithValue("CycleID", AppSession.CycleID);
                    cmd.Parameters.AddWithValue("IncludeNA", 1);
                    cmd.Parameters.AddWithValue("FSA", search.IncludeFsa ? 1 : 0);
                    cmd.Parameters.AddWithValue("OrgActive", -1);
                    cmd.Parameters.AddWithValue("ResponseStartDate", search.StartDate);
                    cmd.Parameters.AddWithValue("ResponseEndDate", search.EndDate);




#if DEBUG
                    CreateSQLExecuted("ustERReport_TracerComplianceSummary_ByProgram", cmd);
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

            return ds;

        }



        public List<ErTracersbySiteData> GetLevel2Data(SearchER search)
        {
            var Level2Data = new List<ErTracersbySiteData>();
            Level2Data = GetLevel2DataSet(search).Tables[0].ToList<ErTracersbySiteData>();
            Level2Data.ForEach(z => z.SiteFullName = z.HCOID == 0 || z.HCOID == null ? z.SiteName + " " + z.SiteID.ToString() + " (SiteID) " : z.SiteName + " " + z.HCOID.ToString());
            Level2Data.ForEach(z => z.NACompliancePercent = Decimal.Equals(z.Numerator, 0) & Decimal.Equals(z.Denominator, 0) ? 100.0m : 0.0m);
            Level2Data.ForEach(z => z.NonCompliancePercent = Decimal.Equals(z.Numerator, 0) & Decimal.Equals(z.Denominator, 0) ? 0.0m : z.NonCompliancePercent);
         
            return Level2Data;
        }
 
        public DataSet GetLevel2DataSet(SearchER search)
        {
            var list = new List<ErTracersbyProgramData>();

            DataSet ds = new DataSet();
          
            try
            {
                using (SqlConnection cn = new SqlConnection(this.ConnectionString))
                {
                    cn.Open();

                     SqlCommand cmd = new SqlCommand("ustERReport_TracerComplianceSummary_BySite", cn);
                     cmd.CommandTimeout = 900;
                    cmd.CommandType = CommandType.StoredProcedure;
                    cmd.Parameters.AddWithValue("SiteIDs", search.SelectedSiteIDs);
                    cmd.Parameters.AddWithValue("ProgramID", Convert.ToInt32(search.ProgramIDs));
                    cmd.Parameters.AddWithValue("TracerIDs", search.TracerListIDs == "-1" ? "" : search.TracerListIDs);
                    cmd.Parameters.AddWithValue("CycleID", AppSession.CycleID);
                    cmd.Parameters.AddWithValue("IncludeNA", 1);
                    cmd.Parameters.AddWithValue("FSA", search.IncludeFsa ? 1 : 0);
                    cmd.Parameters.AddWithValue("OrgActive", -1);
                    cmd.Parameters.AddWithValue("ResponseStartDate", search.StartDate);
                    cmd.Parameters.AddWithValue("ResponseEndDate", search.EndDate);




#if DEBUG
                    CreateSQLExecuted("ustERReport_TracerComplianceSummary_BySite", cmd);
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

            return ds;

        }





        public List<ErTracersbyTracerData> GetLevel3Data(SearchER search)
        {
            var Level3Data = new List<ErTracersbyTracerData>();
            Level3Data = GetLevel3DataSet(search).Tables[0].ToList<ErTracersbyTracerData>();
            Level3Data.ForEach(z => z.NACompliancePercent = Decimal.Equals(z.Numerator, 0) & Decimal.Equals(z.Denominator, 0) ? 100.0m : 0.0m);
            Level3Data.ForEach(z => z.NonCompliancePercent = Decimal.Equals(z.Numerator, 0) & Decimal.Equals(z.Denominator, 0) ? 0.0m : z.NonCompliancePercent);
            return Level3Data;
        }
     

        public DataSet GetLevel3DataSet(SearchER search)
        {
            var list = new List<ErTracersbyProgramData>();

            DataSet ds = new DataSet();
          
            try
            {
                using (SqlConnection cn = new SqlConnection(this.ConnectionString))
                {
                    cn.Open();

                   SqlCommand cmd = new SqlCommand("ustERReport_TracerComplianceSummary_ByTracer", cn);
                   cmd.CommandTimeout = 900;
                    cmd.CommandType = CommandType.StoredProcedure;
                    cmd.Parameters.AddWithValue("SiteIDs", search.SelectedSiteIDs);
                    cmd.Parameters.AddWithValue("ProgramID", Convert.ToInt32(search.ProgramIDs));
                    cmd.Parameters.AddWithValue("TracerIDs", search.TracerListIDs == "-1" ? "" : search.TracerListIDs);
                    cmd.Parameters.AddWithValue("CycleID", AppSession.CycleID);
                    cmd.Parameters.AddWithValue("IncludeNA", 1);
                    cmd.Parameters.AddWithValue("FSA", search.IncludeFsa ? 1 : 0);
                    cmd.Parameters.AddWithValue("OrgActive", -1);
                    cmd.Parameters.AddWithValue("ResponseStartDate", search.StartDate);
                    cmd.Parameters.AddWithValue("ResponseEndDate", search.EndDate);



#if DEBUG
                    CreateSQLExecuted("ustERReport_TracerComplianceSummary_ByTracer", cmd);
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

            return ds;

        }

        public List<ErTracersbyQuestionData> GetLevel4Data(SearchER search)
        {
            var Level4Data = new List<ErTracersbyQuestionData>();
            Level4Data = GetLevel4DataSet(search).Tables[0].ToList<ErTracersbyQuestionData>();
            Level4Data.ForEach(z => z.NACompliancePercent = Decimal.Equals(z.Numerator, 0) & Decimal.Equals(z.Denominator, 0) ? 100.0m : 0.0m);
            Level4Data.ForEach(z => z.NonCompliancePercent = Decimal.Equals(z.Numerator, 0) & Decimal.Equals(z.Denominator, 0) ? 0.0m : z.NonCompliancePercent);
            return Level4Data;
        }
      

        public DataSet GetLevel4DataSet(SearchER search)
        {
            var list = new List<ErTracersbyProgramData>();

            DataSet ds = new DataSet();
          
            try
            {
                using (SqlConnection cn = new SqlConnection(this.ConnectionString))
                {
                    cn.Open();

                  SqlCommand cmd = new SqlCommand("ustERReport_TracerComplianceSummary_ByQuestion", cn);
                  cmd.CommandTimeout = 900;
                    cmd.CommandType = CommandType.StoredProcedure;
                    cmd.Parameters.AddWithValue("SiteID", search.SelectedSiteIDs);
                    cmd.Parameters.AddWithValue("ProgramID", Convert.ToInt32(search.ProgramIDs));
                    cmd.Parameters.AddWithValue("TracerID", search.TracerListIDs);
                    cmd.Parameters.AddWithValue("CycleID", AppSession.CycleID);
                    cmd.Parameters.AddWithValue("IncludeNA", 1);
                    cmd.Parameters.AddWithValue("FSA", search.IncludeFsa ? 1 : 0);
                    cmd.Parameters.AddWithValue("OrgActive", -1);
                    cmd.Parameters.AddWithValue("ResponseStartDate", search.StartDate);
                    cmd.Parameters.AddWithValue("ResponseEndDate", search.EndDate);




#if DEBUG
                    CreateSQLExecuted("ustERReport_TracerComplianceSummary_ByQuestion", cmd);
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

            return ds;

        }
        public List<ErTracersbyQuestionDetails> GetLevel5Data(SearchER search)
        {
            var Level5Data = new List<ErTracersbyQuestionDetails>();

            Level5Data = SelectLevel5Data(search);
            return Level5Data;
        }
        private List<ErTracersbyQuestionDetails> SelectLevel5Data(SearchER search)
        {
            var list = new List<ErTracersbyQuestionDetails>();

            DataSet ds = new DataSet();
            DataTable dt = new DataTable();
            try
            {
                using (SqlConnection cn = new SqlConnection(this.ConnectionString))
                {
                    cn.Open();

                    SqlCommand cmd = new SqlCommand("ustERReport_TracerComplianceSummary_ByQuestionDetails", cn);
                    cmd.CommandTimeout = 900;
                    cmd.CommandType = CommandType.StoredProcedure;
                    cmd.Parameters.AddWithValue("SiteID", search.SelectedSiteIDs);
                    cmd.Parameters.AddWithValue("ProgramID", Convert.ToInt32(search.ProgramIDs));
                    cmd.Parameters.AddWithValue("TracerID", search.TracerListIDs);
                    cmd.Parameters.AddWithValue("TracerQuestionID", search.TracerQuestionIDs);
                    cmd.Parameters.AddWithValue("CycleID", AppSession.CycleID);
                    cmd.Parameters.AddWithValue("IncludeNA", 1);
                    cmd.Parameters.AddWithValue("FSA", search.IncludeFsa ? 1 : 0);
                    cmd.Parameters.AddWithValue("OrgActive", -1);
                    cmd.Parameters.AddWithValue("ResponseStartDate", search.StartDate);
                    cmd.Parameters.AddWithValue("ResponseEndDate", search.EndDate);




#if DEBUG
                    CreateSQLExecuted("ustERReport_TracerComplianceSummary_ByQuestionDetails", cmd);
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
                dt = ds.Tables[0];
                if (dt.Rows.Count > 0)
                {
                    list = dt.ToList<ErTracersbyQuestionDetails>();

                }

            }
            catch (Exception ex)
            {
                ex.Data.Add(TSQL, _SQLExecuted);
                throw ex;
            }

            return list;
        }


        public byte[] TracersComplianceSummaryRDLC(SearchER search, int reportType, string SortBy="", string SortOrder="")
        {
           byte[] fileContents = null;
            string reportDateTitle = "";

            string rdlcName = String.Empty; 
            string dsName = String.Empty;
            DataView dv = null;

            ReportParameterCollection reportParameterCollection = null;
           

            try
            {

                if (AppSession.ReportScheduleID > 0)
                    search.ReportTitle = String.Concat(search.ReportTitle, " - Report ID: ", AppSession.ReportScheduleID);

                reportDateTitle = CommonService.InitializeReportDateTitle("Observation", search.StartDate, search.EndDate);
                search.EndDate = (search.EndDate != null && search.EndDate.ToString() != "") ? search.EndDate.Value.Date.AddHours(23).AddMinutes(29).AddSeconds(59) : search.EndDate;

               
                // Setup ReportViewer 
                ReportViewer reportViewer = new ReportViewer();
                reportViewer.ProcessingMode = ProcessingMode.Local;
                reportViewer.SizeToReportContent = true;
                reportViewer.LocalReport.DisplayName = search.ReportTitle;
              
                // Add Initial Common Report Parameter
                // Set Parameters
           
               

               switch (search.LevelIdentifier)
               {
                   case (int) WebConstants.TracerComplianceSummaryLevels.Level1_Program :
                   default:
                    {
                        rdlcName = "rptReportTracerComplianceSummary_ByProgram.rdlc";
                        dsName = "dsReport_TracerComplianceSummaryByProgram";
                        dv = new DataView(GetLevel1DataSet(search).Tables[0]);
                        ReportParameter p1 = new ReportParameter("ReportTitle", search.ReportTitle.ToString());
                        ReportParameter p2 = new ReportParameter("Programs", search.ProgramNames.ToString());
                        ReportParameter p3 = new ReportParameter("Tracers", search.TracerListNames.ToString());
                        ReportParameter p4 = new ReportParameter("HCOID", search.SelectedSiteHCOIDs.ToString());
                        ReportParameter p5 = new ReportParameter("ReportDateTitle", reportDateTitle.ToString());
                        ReportParameter p6 = new ReportParameter("Copyright", "© " + DateTime.Now.Year.ToString() + WebConstants.Tracer_Copyright.ToString());
                        ReportParameter p7 = new ReportParameter("ReportSubTitle", "Overall Compliance by Program");
                        ReportParameter p8 = new ReportParameter("ReportType", search.ReportType.ToString());
                        ReportParameter p9 = new ReportParameter("FSA", search.IncludeFsa ? "1" : "0");
                        ReportParameter p10 = new ReportParameter("IsCMSProgram", AppSession.IsCMSProgram ? "1" : "0");
                        reportParameterCollection = new ReportParameterCollection { p1, p2, p3, p4, p5, p6, p7, p8, p9, p10 };
                        break;
                    }

                    case (int) WebConstants.TracerComplianceSummaryLevels.Level2_Site :
                    {
                        rdlcName = "rptReportTracerComplianceSummary_BySite.rdlc";
                        dsName = "dsReport_TracerComplianceSummaryBySite";
                        dv = new DataView(GetLevel2DataSet(search).Tables[0]);
                        ReportParameter p1 = new ReportParameter("ReportTitle", search.ReportTitle.ToString());
                        ReportParameter p2 = new ReportParameter("Programs", search.ProgramNames.ToString());
                        ReportParameter p3 = new ReportParameter("Tracers", search.TracerListNames.ToString());
                        ReportParameter p4 = new ReportParameter("HCOID", search.SelectedSiteHCOIDs.ToString());
                        ReportParameter p5 = new ReportParameter("ReportDateTitle", reportDateTitle.ToString());
                        ReportParameter p6 = new ReportParameter("Copyright", "© " + DateTime.Now.Year.ToString() + WebConstants.Tracer_Copyright.ToString());
                        ReportParameter p7 = new ReportParameter("ReportSubTitle", "Compliance by Site");
                        ReportParameter p8 = new ReportParameter("ReportType", search.ReportType.ToString());
                        ReportParameter p9 = new ReportParameter("FSA", search.IncludeFsa ? "1" : "0");
                        ReportParameter p10 = new ReportParameter("IsCMSProgram", AppSession.IsCMSProgram ? "1" : "0");
                        reportParameterCollection = new ReportParameterCollection { p1, p2, p3, p4, p5, p6, p7, p8, p9, p10 };
                        break;
                    }
                    case (int) WebConstants.TracerComplianceSummaryLevels.Level3_Tracer :
                    {
                        rdlcName = "rptReportTracerComplianceSummary_ByTracer.rdlc";
                        dsName = "dsReport_TracerComplianceSummaryByTracer";
                        dv = new DataView(GetLevel3DataSet(search).Tables[0]);
                        ReportParameter p1 = new ReportParameter("ReportTitle", search.ReportTitle.ToString());
                        ReportParameter p2 = new ReportParameter("Programs", search.ProgramNames.ToString());
                        ReportParameter p3 = new ReportParameter("ReportDateTitle", reportDateTitle.ToString());
                        ReportParameter p4 = new ReportParameter("Copyright", "© " + DateTime.Now.Year.ToString() + WebConstants.Tracer_Copyright.ToString());
                        ReportParameter p5 = new ReportParameter("ReportSubTitle", "Compliance by Tracer");
                        ReportParameter p6 = new ReportParameter("SiteName", search.SelectedSiteHCOIDs.ToString());   
                        ReportParameter p7 = new ReportParameter("Tracers", search.TracerListNames.ToString());
                        ReportParameter p8 = new ReportParameter("ReportType", search.ReportType.ToString());
                        ReportParameter p9 = new ReportParameter("HCOID", search.SelectedSiteHCOIDs.ToString());
                        ReportParameter p10 = new ReportParameter("FSA", search.IncludeFsa ? "1" : "0");
                        ReportParameter p11 = new ReportParameter("IsCMSProgram", AppSession.IsCMSProgram ? "1" : "0");
                        reportParameterCollection = new ReportParameterCollection { p1, p2, p3,  p4, p5, p6, p7, p8, p9, p10, p11 };
                        break;
                    }
                   case (int) WebConstants.TracerComplianceSummaryLevels.Level4_Question :
                    {
                        rdlcName = "rptReportTracerComplianceSummary_ByQuestion.rdlc";
                        dsName = "dsReport_TracerComplianceSummaryByQuestion";
                        dv = new DataView(GetLevel4DataSet(search).Tables[0]);
                        ReportParameter p1 = new ReportParameter("ReportTitle", search.ReportTitle.ToString());
                        ReportParameter p2 = new ReportParameter("Programs", search.ProgramNames.ToString());
                        ReportParameter p3 = new ReportParameter("Tracers", search.TracerListNames.ToString());
                        ReportParameter p4 = new ReportParameter("ReportDateTitle", reportDateTitle.ToString());
                        ReportParameter p5 = new ReportParameter("Copyright", "© " + DateTime.Now.Year.ToString() + WebConstants.Tracer_Copyright.ToString());
                        ReportParameter p6 = new ReportParameter("ReportSubTitle", "Compliance by Question");
                        ReportParameter p7 = new ReportParameter("SiteName", search.SelectedSiteHCOIDs.ToString());
                        ReportParameter p8 = new ReportParameter("ReportType", search.ReportType.ToString());
                        ReportParameter p9 = new ReportParameter("FSA", search.IncludeFsa ? "1" : "0");
                        ReportParameter p10 = new ReportParameter("IsCMSProgram", AppSession.IsCMSProgram ? "1" : "0");
                        reportParameterCollection = new ReportParameterCollection { p1, p2, p3, p4, p5, p6, p7, p8, p9, p10};
                        break;
                    }
               }
               if (SortBy != "")
               { dv.Sort = SortBy + " " + SortOrder; }
                // Setup Data sources for report
                reportViewer.LocalReport.DataSources.Clear();
                reportViewer.LocalReport.ReportPath = HttpContext.Current.Request.MapPath(HttpContext.Current.Request.ApplicationPath) + @"Areas\TracerER\Reports\" + rdlcName.ToString();
                reportViewer.LocalReport.DataSources.Add(new ReportDataSource(dsName, dv));

                reportViewer.LocalReport.SetParameters(reportParameterCollection);
                Warning[] warnings;
                string[] streamIds;
                string mimeType = string.Empty;
                string encoding = string.Empty;
                string extension = string.Empty;

                string format = WebConstants.REPORT_FORMAT_PDF;      // PDF is default
                if (reportType == (int) WebConstants.ReportFormat.EXCEL)
                    format = WebConstants.REPORT_FORMAT_EXCEL;        // If Excel option chosen
                fileContents = reportViewer.LocalReport.Render(format, null, out mimeType, out encoding, out extension, out streamIds, out warnings);
            }
            catch (Exception ex)
            {
                ExceptionLog exceptionLog = new ExceptionLog
                {
                    ExceptionText = "Reports: " + ex.Message,
                    PageName = "TracerComplianceSummaryRDLC",
                    MethodName = "TracerComplianceSummaryRDLC",
                    UserID = Convert.ToInt32(AppSession.UserID),
                    SiteId = Convert.ToInt32(AppSession.SelectedSiteId),
                    TransSQL = "",
                    HttpReferrer = null
                };
                _exceptionService.LogException(exceptionLog);
            }

            return fileContents;
        }
    }
}