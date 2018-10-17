using JCR.Reports.Common;
using JCR.Reports.Models;
using JCR.Reports.Services;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using System.Web;
using Microsoft.Reporting.WebForms;
using JCR.Reports.ViewModels;
using JCR.Reports.Areas.Corporate.ViewModels;

namespace JCR.Reports.Areas.Corporate.Services
{
    public class EPAssignment : BaseService
    {
        ExceptionService _exceptionService = new ExceptionService();
        public List<AssignedUser> GetEPAssignedTo(string selectedSiteIDs, string EPUserRoleID, string programIDs = "-1", string chapterIDs = "-1", string standardIDs = "-1", bool IncludeInActiveTagForUsers = false)
        {
            var list = new List<AssignedUser>();
            DataSet ds = new DataSet();
            DataTable dt = new DataTable();
            try
            {
                using (SqlConnection cn = new SqlConnection(ConfigurationManager.ConnectionStrings["DBMEdition01"].ToString()))
                {
                    cn.Open();
                    int _epUserRoleID = GetEPUserRoleID(EPUserRoleID);
                    SqlCommand cmd = new SqlCommand("amp.usmReport_EPAssignedTo", cn);
                    cmd.CommandType = CommandType.StoredProcedure;
                    cmd.Parameters.AddWithValue("@selectedSiteIDs", selectedSiteIDs);
                    cmd.Parameters.AddWithValue("@EPUserRoleID", _epUserRoleID);
                    cmd.Parameters.AddWithValue("@JCRProgramID", programIDs);
                    cmd.Parameters.AddWithValue("@ChapterID", chapterIDs);
                    cmd.Parameters.AddWithValue("@StandardID", standardIDs);
                    cmd.Parameters.AddWithValue("@IncludeInActiveTagForUsers", Convert.ToInt16(IncludeInActiveTagForUsers));
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
                    list = dt.ToList<AssignedUser>();
                    list.Insert(0, new AssignedUser
                    {
                        UserID = Convert.ToInt32(-1),
                        FullName = "All",


                    });
                }
                else
                {
                    list.Insert(0, new AssignedUser
                    {
                        UserID = Convert.ToInt32(-1),
                        FullName = "All",

                    });
                }


            }
            catch (Exception ex)
            {
                ex.Data.Add(TSQL, _SQLExecuted);
                throw ex;
            }

            return list;
        }

        private int GetEPUserRoleID(string EPUserRoleID) {
            int _epUserRoleID = 2;
            switch (EPUserRoleID)
            {
                case "Individual":
                    {
                        _epUserRoleID = 1;
                        break;
                    }
                case "Preliminary":
                    {
                        _epUserRoleID = 2;
                        break;
                    }
                case "Both":
                    {
                        _epUserRoleID = 0;
                        break;
                    }
                default:
                    {
                        _epUserRoleID = 2;
                        break;
                    }
            }

            return _epUserRoleID;
        }

        public List<AssignedUser> GetEPAssignedBy(string selectedSiteIDs, string EPUserRoleID, string programIDs = "-1", string chapterIDs = "-1", string standardIDs = "-1")
        {
            var list = new List<AssignedUser>();
            DataSet ds = new DataSet();
            DataTable dt = new DataTable();
            try
            {
                using (SqlConnection cn = new SqlConnection(ConfigurationManager.ConnectionStrings["DBMEdition01"].ToString()))
                {
                    cn.Open();
                    int _epUserRoleID = GetEPUserRoleID(EPUserRoleID);
                  
                    SqlCommand cmd = new SqlCommand("amp.usmReport_EPAssignedBy", cn);
                    cmd.CommandType = CommandType.StoredProcedure;
                    cmd.Parameters.AddWithValue("@selectedSiteIDs", selectedSiteIDs);
                    cmd.Parameters.AddWithValue("@EPUserRoleID", _epUserRoleID);
                    cmd.Parameters.AddWithValue("@JCRProgramID", programIDs);
                    cmd.Parameters.AddWithValue("@ChapterID", chapterIDs);
                    cmd.Parameters.AddWithValue("@StandardID", standardIDs);
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
                    list = dt.ToList<AssignedUser>();
                    list.Insert(0, new AssignedUser
                    {
                        UserID = Convert.ToInt32(-1),
                        FullName = "All",


                    });
                }
                else
                {
                    list.Insert(0, new AssignedUser
                    {
                        UserID = Convert.ToInt32(-1),
                        FullName = "All",

                    });
                }
            }
            catch (Exception ex)
            {
                ex.Data.Add(TSQL, _SQLExecuted);
                throw ex;
            }

            return list;
        }


        public List<EPAssignmentbySite> GetLevel1Data(SearchCorporateER search)
        {
            var Level1Data = new List<EPAssignmentbySite>();
            Level1Data = GetDataSet(search, (int)WebConstants.EPAssignmentLevels.Level1_Site).Tables[0].ToList<EPAssignmentbySite>();
            Level1Data.ForEach(z => z.SiteFullName = z.HCOID == 0 || z.HCOID == null ? z.SiteName + " " + z.SiteID.ToString() + " (SiteID) " : z.SiteName + " " + z.HCOID.ToString());
     
            return Level1Data;
        }

        private DataSet GetDataSet(SearchCorporateER search, int LevelIdentifier)
        {
            DataSet ds = new DataSet();
            try
            {
                string sp_name = "amp.usmReport_EPAssignment_BySite";
                switch (LevelIdentifier)
                {


                    case (int)WebConstants.EPAssignmentLevels.Level1_Site:
                        {
                            sp_name = "amp.usmReport_EPAssignment_BySite";
                            break;
                        }
                    case (int)WebConstants.EPAssignmentLevels.Level2_Chapter:
                        {
                            sp_name = "amp.usmReport_EPAssignment_ByChapter";
                            break;
                        }
                    case (int)WebConstants.EPAssignmentLevels.Level3_Standard:
                        {
                            sp_name = "amp.usmReport_EPAssignment_ByStandard";
                            break;
                        }
                    case (int)WebConstants.EPAssignmentLevels.Level4_EP:
                        {
                            sp_name = "amp.usmReport_EPAssignment_Details";
                            break;
                        }


                }
                int _epUserRoleID = GetEPUserRoleID(search.ScoreType);

                using (SqlConnection cn = new SqlConnection(this.ConnectionString))
                {
                    cn.Open();

                    SqlCommand cmd = new SqlCommand(sp_name, cn);
                    cmd.CommandTimeout = 900;
                    cmd.CommandType = CommandType.StoredProcedure;
                    cmd.Parameters.AddWithValue("SiteIDs", search.SelectedSiteIDs);
                    cmd.Parameters.AddWithValue("JCRProgramID", Convert.ToInt32(search.ProgramIDs));
                    cmd.Parameters.AddWithValue("ChapterIDs", search.SelectedChapterIDs == "-1" ? "" : search.SelectedChapterIDs);
                    cmd.Parameters.AddWithValue("StandardIDs", search.SelectedStandardIDs == "-1" ? "" : search.SelectedStandardIDs);
                    cmd.Parameters.AddWithValue("ScoreType", _epUserRoleID);
                    cmd.Parameters.AddWithValue("AssignedToIDs", search.SelectedAssignedToIDs == "-1" ? "" : search.SelectedAssignedToIDs);
                    cmd.Parameters.AddWithValue("AssignedByIDs", search.SelectedAssignedByIDs == "-1" ? "" : search.SelectedAssignedByIDs);
                    cmd.Parameters.AddWithValue("docRequired", search.docRequired ? 1 : 0);
                    cmd.Parameters.AddWithValue("FSA", search.IncludeFsa ? 1 : 0);
                    cmd.Parameters.AddWithValue("NewChangedEps", search.NewChangedEps ? 1 : 0);
                  
#if DEBUG
                    CreateSQLExecuted(sp_name, cmd);
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

        public List<EPAssignmentbyChapter> GetLevel2Data(SearchCorporateER search)
        {
            var Level2Data = new List<EPAssignmentbyChapter>();
            Level2Data = GetDataSet(search, (int)WebConstants.EPAssignmentLevels.Level2_Chapter).Tables[0].ToList<EPAssignmentbyChapter>();
       
            return Level2Data;
        }




        public List<EPAssignmentbyStandard> GetLevel3Data(SearchCorporateER search)
        {
            var Level3Data = new List<EPAssignmentbyStandard>();
            Level3Data = GetDataSet(search, (int)WebConstants.EPAssignmentLevels.Level3_Standard).Tables[0].ToList<EPAssignmentbyStandard>();


            return Level3Data;
        }




        public List<EPAssignmentDetails> GetLevel4Data(SearchCorporateER search)
        {
            var Level4Data = new List<EPAssignmentDetails>();

            Level4Data = GetDataSet(search, (int)WebConstants.EPAssignmentLevels.Level4_EP).Tables[0].ToList<EPAssignmentDetails>();
            return Level4Data;
        }

        public byte[] EPAssignmentRDLC(SearchCorporateER search, int reportType, string SortBy = "", string SortOrder = "")
        {

            byte[] fileContents = null;
            
            string rdlcName = String.Empty;
            string dsName = String.Empty;
      
            DataView dv = null;

            ReportParameterCollection reportParameterCollection = null;

            try
            {

                if (AppSession.ReportScheduleID > 0)
                    search.ReportTitle = String.Concat(search.ReportTitle, " - Report ID: ", AppSession.ReportScheduleID);

                // Setup ReportViewer 
                ReportViewer reportViewer = new ReportViewer();
                reportViewer.ProcessingMode = ProcessingMode.Local;
                reportViewer.SizeToReportContent = true;
                reportViewer.LocalReport.DisplayName = search.ReportTitle;

                switch (search.LevelIdentifier)
                {
                    
                    case (int)WebConstants.EPAssignmentLevels.Level1_Site:
                    default:
                        {
                            rdlcName = "rptEPAssignment_BySite.rdlc";
                            dsName = "dsReport_EPAssignment_BySite";
                            dv = new DataView(GetDataSet(search, (int)WebConstants.EPAssignmentLevels.Level1_Site).Tables[0]);
                          
                            break;
                        }
                    case (int)WebConstants.EPAssignmentLevels.Level2_Chapter:
                        {
                            rdlcName = "rptEPAssignment_ByChapter.rdlc";
                            dsName = "dsReport_EPAssignment_ByChapter";
                            dv = new DataView(GetDataSet(search, (int)WebConstants.EPAssignmentLevels.Level2_Chapter).Tables[0]);
                            
                            break;
                        }
                    case (int)WebConstants.EPAssignmentLevels.Level3_Standard:
                        {
                            rdlcName = "rptEPAssignment_ByStandard.rdlc";
                            dsName = "dsReport_EPAssignment_ByStandard";
                            dv = new DataView(GetDataSet(search, (int)WebConstants.EPAssignmentLevels.Level3_Standard).Tables[0]);
                        
                            break;
                        }
           
                }

                ReportParameter p1 = new ReportParameter("ReportTitle", search.ReportTitle.ToString());
                ReportParameter p2 = new ReportParameter("Programs", search.ProgramNames.ToString());
                ReportParameter p3 = new ReportParameter("Chapters", search.SelectedChapterNames.ToString());
                ReportParameter p4 = new ReportParameter("HCOID", search.SelectedSiteHCOIDs.ToString());
                ReportParameter p5 = new ReportParameter("Standards", search.SelectedStandardNames.ToString());
                ReportParameter p6 = new ReportParameter("AssignedTo", search.SelectedAssignedToNames.ToString());
                ReportParameter p7 = new ReportParameter("Copyright", "© " + DateTime.Now.Year.ToString() + WebConstants.Copyright.ToString());
                ReportParameter p8 = new ReportParameter("ScoreType", search.ScoreType.ToString());
                ReportParameter p9 = new ReportParameter("ReportSubTitle", "Assignment Status by User");
                ReportParameter p10 = new ReportParameter("ReportType", search.ReportType.ToString());
                ReportParameter p11 = new ReportParameter("AssignedBy", search.SelectedAssignedByNames.ToString());
                reportParameterCollection = new ReportParameterCollection { p1, p2, p3, p4, p5, p6, p7, p8, p9, p10, p11 };

                if (SortBy != "")
                { dv.Sort = SortBy + " " + SortOrder; }
                // Setup Data sources for report
                reportViewer.LocalReport.DataSources.Clear();
                reportViewer.LocalReport.ReportPath = HttpContext.Current.Request.MapPath(HttpContext.Current.Request.ApplicationPath) + @"Areas\Corporate\Reports\" + rdlcName.ToString();
                reportViewer.LocalReport.DataSources.Add(new ReportDataSource(dsName, dv));

                reportViewer.LocalReport.SetParameters(reportParameterCollection);
                Warning[] warnings;
                string[] streamIds;
                string mimeType = string.Empty;
                string encoding = string.Empty;
                string extension = string.Empty;

                string format = WebConstants.REPORT_FORMAT_PDF;      // PDF is default
                if (reportType == (int)WebConstants.ReportFormat.EXCEL)
                    format = WebConstants.REPORT_FORMAT_EXCEL;        // If Excel option chosen
                fileContents = reportViewer.LocalReport.Render(format, null, out mimeType, out encoding, out extension, out streamIds, out warnings);
            }
            catch (Exception ex)
            {
                ExceptionLog exceptionLog = new ExceptionLog
                {
                    ExceptionText = "Reports: " + ex.Message,
                    PageName = "EPAssignmentRDLC",
                    MethodName = "EPAssignmentRDLC",
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