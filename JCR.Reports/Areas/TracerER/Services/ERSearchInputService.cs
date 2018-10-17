using System;
using System.Collections.Generic;
using System.Linq;
using System.Data;
using System.Data.SqlClient;
using JCR.Reports.Models;
using System.Configuration;
using JCR.Reports.Common;

namespace JCR.Reports.Services
{
    public class ERSearchInputService : BaseService
    {
           /// <summary>
        /// Constructors
        /// </summary>
        public ERSearchInputService() 
            : base()
        {
        }
        public List<ProgramVM> GetMultiSitePrograms(string selectedSiteIDs, int eproductID)
        {
            var programslist = new List<ProgramVM>();
            programslist = SelectMultiSitePrograms(selectedSiteIDs, AppSession.CycleID, eproductID);
            return programslist;
        }
        public List<MultiSiteChapters> GetMultiSiteChapters(int allPrograms, string selectedProgramIDs)
        {
            var chapterslist = new List<MultiSiteChapters>();
            chapterslist = SelectMultiSiteChapters(allPrograms, selectedProgramIDs, (int)AppSession.CycleID);
            return chapterslist;
        }
        public ERSearchList GetMultiSiteStandards(string selectedProgramIDs, string selectedChapterIDs)
        {
            ERSearchList standardslist = new ERSearchList();
            standardslist.TracersStandards = SelectMultiSiteStandards((int)AppSession.CycleID, selectedProgramIDs, selectedChapterIDs);
            return standardslist;
        }
        public ERSearchList GetMultiSiteEps(string selectedProgramIDs, string selectedChapterIDs, string selectedStandards)
        {
            ERSearchList epslist = new ERSearchList();
            epslist.TracersEPs = SelectMultiSiteEPs((int)AppSession.CycleID, selectedProgramIDs, selectedChapterIDs, selectedStandards);
            return epslist;
        }
        public ERSearchList GetMultiSiteTracersList(string selectedSiteIDs,string selectedProgramIDs)
        {
            ERSearchList tracerslist = new ERSearchList();

            tracerslist.TracersLists = SelectMultiSiteTracerList(selectedSiteIDs,  selectedProgramIDs);
            return tracerslist;
        }
        public ERSearchList GetUHSTracersList(string selectedSiteIDs, string selectedProgramIDs)
        {
            ERSearchList tracerslist = new ERSearchList();
            
            tracerslist.TracersLists = SelectUHSTracerList(selectedSiteIDs, selectedProgramIDs);
            return tracerslist;
        }
        public ERSearchList GetQuartersList()
        {
            ERSearchList quarterslist = new ERSearchList();

            quarterslist.QuartersLists = SelectQuartersList();
            return quarterslist;
        }
        public List<string> GetSitesList(string selectedSiteIDs)
        {
       
            List<int> selectedtSites = selectedSiteIDs.TrimEnd(',').Split(',').Select(int.Parse).Where(s => s > 0).ToList();
 
            var sitesList = from siteid in selectedtSites join sites in AppSession.Sites.Where(m => m.IsTracersAccess == 1) on siteid equals sites.SiteID select sites;
            List<String> siteNamesList = sitesList.Select(m => m.SiteName).ToList();
          
            return siteNamesList;
        }

        public ERSearchList GetMultiSiteDepartmentsList(string selectedSiteIDs, string selectedProgramIDs)
        {
            ERSearchList departmentlist = new ERSearchList();

            departmentlist.DepartmentLists = SelectMultiSiteDepartmentList(selectedSiteIDs, selectedProgramIDs);
            return departmentlist;
        }

        public string GetSelectedSiteHCOID(string selectedSiteIDs)
        {
            DataSet ds = new DataSet();
            DataTable dt = new DataTable();
            string getSelectedSiteHCOID = "";
            try
            {
                using (SqlConnection cn = new SqlConnection(ConfigurationManager.ConnectionStrings["DBAMP_WHSE"].ToString()))
                {
                    cn.Open();
                    //using the same store procedure used by tracer app for site list by userid
                    SqlCommand cmd = new SqlCommand("ustReport_HCOIDs", cn);
                    cmd.CommandTimeout = 900;
                    cmd.CommandType = CommandType.StoredProcedure;


                    cmd.Parameters.AddWithValue("@SiteIDs", selectedSiteIDs);
                   
                    SqlDataAdapter da = new SqlDataAdapter(cmd);

                    using (cn)
                    using (cmd)
                    using (da)
                    {
                        da.Fill(ds);
                    }
                }
                dt = ds.Tables[0];

                foreach (DataRow dr in dt.Rows)
                {
                    getSelectedSiteHCOID = dr["ReportHCOIDs"].ToString();
                }
              



            }
            catch (Exception ex)
            {
                ex.Data.Add(TSQL, _SQLExecuted);
                throw ex;
            }

            return getSelectedSiteHCOID;
        
        }
       
        private List<ProgramVM> SelectMultiSitePrograms(string selectedSiteIDs, int? cycleID, int eproductID)
        {
            var lstPrograms = new List<ProgramVM>();
            DataSet ds = new DataSet();
            DataTable dt = new DataTable();

            try
            {
                using (SqlConnection cn = new SqlConnection(ConfigurationManager.ConnectionStrings["DBMEdition01"].ToString()))
                {
                    cn.Open();
                    //using the same store procedure used by tracer app for site list by userid
                    SqlCommand cmd = new SqlCommand("usmReportGetTracerProgramsBySites", cn);
                    cmd.CommandTimeout = 900;
                    cmd.CommandType = CommandType.StoredProcedure;

                    cmd.Parameters.AddWithValue("@SiteList", selectedSiteIDs);
                    cmd.Parameters.AddWithValue("@CycleID", cycleID);
                    cmd.Parameters.AddWithValue("@EProductID", eproductID);
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
                    lstPrograms = dt.ToList<ProgramVM>();
                    lstPrograms.Insert(0, new ProgramVM
                    {
                        ProgramID = Convert.ToInt32(-1),
                        ProgramName = "All"
                    });
                }
                else
                {
                    lstPrograms.Insert(0, new ProgramVM
                    {
                        ProgramID = Convert.ToInt32(-1),
                        ProgramName = "All"
                    });
                }
            }
            catch (Exception ex)
            {
                ex.Data.Add(TSQL, _SQLExecuted);
                throw ex;
            }

            return lstPrograms;
        }
        private List<MultiSiteChapters> SelectMultiSiteChapters(int allPrograms, string selectedProgramIDs, int cycleID)
        {
            var lstChapters = new List<MultiSiteChapters>();
            DataSet ds = new DataSet();
            DataTable dt = new DataTable();

            try
            {
                if (selectedProgramIDs == "-1")
                {
                    selectedProgramIDs = "";
                    allPrograms = 1;
                }

                using (SqlConnection cn = new SqlConnection(ConfigurationManager.ConnectionStrings["DBMEdition01"].ToString()))
                {
                    cn.Open();
                    //using the same store procedure used by tracer app for site list by userid
                    SqlCommand cmd = new SqlCommand("usmERReportGetChapters", cn);
                    cmd.CommandTimeout = 900;
                    cmd.CommandType = CommandType.StoredProcedure;

                    cmd.Parameters.AddWithValue("@AllPrograms", allPrograms);
                    cmd.Parameters.AddWithValue("@ProgramIDs", selectedProgramIDs);
                    cmd.Parameters.AddWithValue("@CycleID", cycleID);
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
                    lstChapters = dt.ToList<MultiSiteChapters>();
                    lstChapters.Insert(0, new MultiSiteChapters
                    {
                        ChapterID = Convert.ToInt32(-1),
                        ChapterText = "All",
                    });
                }
                else
                {
                    lstChapters.Insert(0, new MultiSiteChapters
                    {
                        ChapterID = Convert.ToInt32(-1),
                        ChapterText = "All",
                    });
                }
            }
            catch (Exception ex)
            {
                ex.Data.Add(TSQL, _SQLExecuted);
                throw ex;
            }

            return lstChapters;
        }
        public static List<TracersStandards> SelectMultiSiteStandards(int cycleid, string selectedProgramIDs, string selectedChapterIDs)
        {
            var _SQLExecuted = string.Empty;
            var ConnectionString = ConfigurationManager.ConnectionStrings["DBMEdition01"].ToString();

            var list = new List<TracersStandards>();

            if (string.Equals(selectedChapterIDs, "-1"))
            {
                list.Insert(0, new TracersStandards
                {
                    TracerStandardID = Convert.ToInt32(-1),
                    Code = "All",
                });
                return list;
            }
            selectedProgramIDs = selectedProgramIDs == "-1" ? "" : selectedProgramIDs;
            DataSet ds = new DataSet();
            DataTable dt = new DataTable();
            try
            {
                using (SqlConnection cn = new SqlConnection(ConnectionString))
                {
                    cn.Open();
                    SqlCommand cmd = new SqlCommand("ustReport_GetAllStandardsByChapter", cn);
                    cmd.CommandTimeout = 900;
                    cmd.CommandType = CommandType.StoredProcedure;
                    cmd.Parameters.AddWithValue("@CycleID", cycleid);
                    cmd.Parameters.AddWithValue("@ProgramIDs", selectedProgramIDs);
                    cmd.Parameters.AddWithValue("@ChapterIDs", selectedChapterIDs);

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
                    list = dt.ToList<TracersStandards>();
                    list.Insert(0, new TracersStandards
                    {
                        TracerStandardID = Convert.ToInt32(-1),
                        Code = "All",

                    });
                }
                else
                {
                    list.Insert(0, new TracersStandards
                    {
                        TracerStandardID = Convert.ToInt32(-1),
                        Code = "All",
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

        public static List<TracersEP> SelectMultiSiteEPs(int cycleid, string selectedProgramIDs, string selectedChapterIDs, string selectedStandards)
        {
            var _SQLExecuted = string.Empty;
            var ConnectionString = ConfigurationManager.ConnectionStrings["DBMEdition01"].ToString();

            var list = new List<TracersEP>();

            if (string.Equals(selectedStandards, "-1") || selectedStandards == "")
            {
                list.Insert(0, new TracersEP
                {
                    EPTextID = Convert.ToInt32(-1),
                    StandardLabelAndEPLabel = "All",

                });
                return list;
            }


            selectedStandards = selectedStandards == "-1" ? "" : selectedStandards;
            selectedProgramIDs = selectedProgramIDs == "-1" ? "" : selectedProgramIDs;
            selectedChapterIDs = selectedChapterIDs == "-1" ? "" : selectedChapterIDs;
            DataSet ds = new DataSet();
            DataTable dt = new DataTable();
            try
            {
                using (SqlConnection cn = new SqlConnection(ConnectionString))
                {
                    cn.Open();
                    SqlCommand cmd = new SqlCommand("ustReport_GetAllEpsByStandard", cn);
                    cmd.CommandTimeout = 900;
                    cmd.CommandType = CommandType.StoredProcedure;
                    cmd.Parameters.AddWithValue("@CycleID", cycleid);
                    cmd.Parameters.AddWithValue("@ProgramID", selectedProgramIDs);
                    cmd.Parameters.AddWithValue("@ChapterID", selectedChapterIDs);
                    cmd.Parameters.AddWithValue("@StandardTextIDs", selectedStandards);

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
                    list = dt.ToList<TracersEP>();
                    list.Insert(0, new TracersEP
                    {
                        EPTextID = Convert.ToInt32(-1),
                        StandardLabelAndEPLabel = "All",

                    });
                }
                else
                {
                    list.Insert(0, new TracersEP
                    {
                        EPTextID = Convert.ToInt32(-1),
                        StandardLabelAndEPLabel = "All",
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

        private List<Tracers> SelectMultiSiteTracerList(string selectedSiteIDs, string selectedProgramIDs)
        {
            var list = new List<Tracers>();
            selectedProgramIDs = selectedProgramIDs == "-1" ? "" : selectedProgramIDs;
            DataSet ds = new DataSet();
            DataTable dt = new DataTable();
            try
            {
                using (SqlConnection cn = new SqlConnection(this.ConnectionString))
                {
                    cn.Open();
                    SqlCommand cmd = new SqlCommand("ustReport_SelectMultiSiteTracers", cn);
                    cmd.CommandType = CommandType.StoredProcedure;
                    cmd.CommandTimeout = 900;
                    cmd.Parameters.AddWithValue("@SiteID", selectedSiteIDs);
                    cmd.Parameters.AddWithValue("@ProgramID", selectedProgramIDs);
                    //  cmd.Parameters.AddWithValue("@ResponseStatus", observationStatus);
                    SqlDataAdapter da = new SqlDataAdapter(cmd);

#if DEBUG
                    CreateSQLExecuted("ustReport_SelectMultiSiteTracers", cmd);
                    System.Diagnostics.Debug.WriteLine(_SQLExecuted);
#endif

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
                    list = dt.ToList<Tracers>();
                    list.Insert(0, new Tracers
                    {
                        TracerCustomID = Convert.ToInt32(-1),
                        TracerCustomName = "All",

                    });
                }
                else
                {
                    list.Insert(0, new Tracers
                    {
                        TracerCustomID = Convert.ToInt32(-1),
                        TracerCustomName = "All",

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
        private List<Tracers> SelectUHSTracerList(string selectedSiteIDs, string selectedProgramIDs)
        {
            var list = new List<Tracers>();
            selectedProgramIDs = selectedProgramIDs == "-1" ? "" : selectedProgramIDs;
            DataSet ds = new DataSet();
            DataTable dt = new DataTable();
            try
            {
                using (SqlConnection cn = new SqlConnection(this.ConnectionString))
                {
                    cn.Open();
                    SqlCommand cmd = new SqlCommand("ustReport_SelectUHSTracers", cn);
                    cmd.CommandType = CommandType.StoredProcedure;
                    cmd.CommandTimeout = 900;
                    cmd.Parameters.AddWithValue("@SiteID", selectedSiteIDs);
                    cmd.Parameters.AddWithValue("@ProgramID", selectedProgramIDs);
                    //  cmd.Parameters.AddWithValue("@ResponseStatus", observationStatus);
                    SqlDataAdapter da = new SqlDataAdapter(cmd);

#if DEBUG
                    CreateSQLExecuted("ustReport_SelectUHSTracers", cmd);
                    System.Diagnostics.Debug.WriteLine(_SQLExecuted);
#endif

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
                    list = dt.ToList<Tracers>();
                    list.Insert(0, new Tracers
                    {
                        TracerCustomID = Convert.ToInt32(-1),
                        TracerCustomName = "All",
                        TracerCategoryName = "All",
                        TracerCategoryID = Convert.ToInt32(-1),
                    });
                }
                else
                {
                    list.Insert(0, new Tracers
                    {
                        TracerCustomID = Convert.ToInt32(-1),
                        TracerCustomName = "All",
                        TracerCategoryName = "All",
                        TracerCategoryID = Convert.ToInt32(-1),
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

        private List<Quarters> SelectQuartersList()
        {
            var list = new List<Quarters>();
            DataSet ds = new DataSet();
            DataTable dt = new DataTable();
            try
            {
                using (SqlConnection cn = new SqlConnection(this.ConnectionString))
                {
                    cn.Open();
                    SqlCommand cmd = new SqlCommand("ustReport_SelectQuarters", cn);
                    cmd.CommandType = CommandType.StoredProcedure;
                    //  cmd.Parameters.AddWithValue("@ResponseStatus", observationStatus);
                    SqlDataAdapter da = new SqlDataAdapter(cmd);

#if DEBUG
                    CreateSQLExecuted("ustReport_SelectQuarters", cmd);
                    System.Diagnostics.Debug.WriteLine(_SQLExecuted);
#endif

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
                    list = dt.ToList<Quarters>();
                    
                }
                
            }
            catch (Exception ex)
            {
                ex.Data.Add(TSQL, _SQLExecuted);
                throw ex;
            }

            return list;
        }

        private List<Department> SelectMultiSiteDepartmentList(string selectedSiteIDs, string selectedProgramIDs)
        {
            var list = new List<Department>();
            selectedProgramIDs = selectedProgramIDs == "-1" ? "" : selectedProgramIDs;
            DataSet ds = new DataSet();
            DataTable dt = new DataTable();
            try
            {
                using (SqlConnection cn = new SqlConnection(this.ConnectionString))
                {
                    cn.Open();
                    SqlCommand cmd = new SqlCommand("ustReport_SelectMultiSiteDepartments", cn);
                    cmd.CommandType = CommandType.StoredProcedure;
                    cmd.CommandTimeout = 900;
                    cmd.Parameters.AddWithValue("@SiteID", selectedSiteIDs);
                    cmd.Parameters.AddWithValue("@ProgramID", selectedProgramIDs);
                    
                    SqlDataAdapter da = new SqlDataAdapter(cmd);

#if DEBUG
                    CreateSQLExecuted("ustReport_SelectMultiSiteDepartments", cmd);
                    System.Diagnostics.Debug.WriteLine(_SQLExecuted);
#endif

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
                    list = dt.ToList<Department>();
                    list.Insert(0, new Department
                    {
                        DepartmentID = Convert.ToInt32(-1),
                        DepartmentName = "All",

                    });
                }
                else
                {
                    list.Insert(0, new Department
                    {
                        DepartmentID = Convert.ToInt32(-1),
                        DepartmentName = "All",

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
        public string OrganizationTypesHeader(int siteID, int programID)
        {
                     

            string orgtypename = "";
            try
            {
                DataTable orgtypes = GetEROrgnizationHeadernames(siteID, programID).Tables[0];
                var query =
                          (from orgtype in orgtypes.AsEnumerable()
                           where orgtype.Field<bool>("IsActive") == true
                           orderby orgtype.Field<int>("Ranking") descending
                           select orgtype.Field<string>("OrganizationTypeTitle")
                           ).ToList();
           
               
                orgtypename = query != null ? string.Join(" > ", query) : "";
            }
            catch (Exception ex)
            {
                throw ex;
            }

            return orgtypename;
        }
       private DataSet GetEROrgnizationHeadernames(int siteID, int programID, int ranking = 0)
        {
            string msg = String.Empty;
            DataSet ds = new DataSet();
            using (SqlConnection cn = new SqlConnection(this.ConnectionString))
            {
                cn.Open();
                SqlCommand cmd = new SqlCommand("ustReport_GetOrganizationTypeNames", cn);
                cmd.CommandTimeout = 900;
                cmd.CommandType = System.Data.CommandType.StoredProcedure;
                cmd.Parameters.AddWithValue("SiteID", siteID);
                cmd.Parameters.AddWithValue("ProgramID", programID);
                cmd.Parameters.AddWithValue("Ranking", ranking);

                SqlDataAdapter da = new SqlDataAdapter(cmd);

                using (cn)
                using (cmd)
                using (da)
                {
                    da.Fill(ds);
                }
            }
            return ds;
        }

    }
}