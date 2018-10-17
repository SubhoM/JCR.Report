using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using JCR.Reports.Common;
using System.Data;
using System.Data.SqlClient;
using System.Configuration;
using Microsoft.Reporting.WebForms;
using JCR.Reports.ViewModels;
using System.Collections.Specialized;
using System.IO;
using JCR.Reports.Models;
using JCR.Reports.Areas.Corporate.Models;
using JCR.Reports.DataModel;

namespace JCR.Reports.Services
{
    public class CommonService : BaseService
    {
        public Exception ErrorException = null;
        

        public DataSet SelectUserSecurityAttribute(int userID, int attributeTypeID)
        {

            string apps = string.Empty;
            try
            {
                using (SqlConnection cn = new SqlConnection(ConfigurationManager.ConnectionStrings["DBAMP"].ToString()))
                {
                    cn.Open();
                    SqlCommand cmd = new SqlCommand("uspUserSecurityAttributeSelect", cn);
                    cmd.CommandType = CommandType.StoredProcedure;
                    cmd.Parameters.AddWithValue("UserID", userID);
                    cmd.Parameters.AddWithValue("AttributeTypeID", attributeTypeID);
                    SqlDataAdapter da = new SqlDataAdapter(cmd);

                    CreateSQLExecuted(spName: "uspUserSecurityAttributeSelect", cmd: cmd);

                    DataSet ds = new DataSet();
                    //using (cn)
                    using (cmd)
                    using (da)
                    {
                        da.Fill(ds);
                    }
                    return ds;
                }
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        public int InsertUserSecurityAttribute(int userID, int attributeTypeID, string value, DateTime activeDate, DateTime expireDate)
        {
            int rowCount = 0;
            try
            {
                using (SqlConnection cn = new SqlConnection(ConfigurationManager.ConnectionStrings["DBAMP"].ToString()))
                {
                    cn.Open();
                    SqlCommand cmd = new SqlCommand("uspUserSecurityAttributeInsert", cn);
                    cmd.CommandType = CommandType.StoredProcedure;
                    cmd.Parameters.AddWithValue("UserID", userID);
                    cmd.Parameters.AddWithValue("AttributeTypeID", attributeTypeID);
                    cmd.Parameters.AddWithValue("AttributeValue", value);
                    cmd.Parameters.AddWithValue("AttributeActivationDate", activeDate);
                    cmd.Parameters.AddWithValue("AttributeExpirationDate", expireDate);


                    CreateSQLExecuted(spName: "uspUserSecurityAttributeInsert", cmd: cmd);

                    //using (cn)
                    using (cmd)
                    {
                        rowCount = cmd.ExecuteNonQuery();
                    }

                }
                return rowCount;
            }

            catch (Exception ex)
            {
                throw ex;
            }
        }

        public int UpdateUserSecurityAttribute(int userID, int attributeTypeID, string value, DateTime activeDate, DateTime expireDate)
        {
            int rowCount = 0;
            try
            {
                using (SqlConnection cn = new SqlConnection(ConfigurationManager.ConnectionStrings["DBAMP"].ToString()))
                {
                    cn.Open();
                    SqlCommand cmd = new SqlCommand("uspUserSecurityAttributeUpdate", cn);
                    cmd.CommandType = CommandType.StoredProcedure;
                    cmd.Parameters.AddWithValue("UserID", userID);
                    cmd.Parameters.AddWithValue("AttributeTypeID", attributeTypeID);
                    cmd.Parameters.AddWithValue("AttributeValue", value);
                    cmd.Parameters.AddWithValue("AttributeActivationDate", activeDate);
                    cmd.Parameters.AddWithValue("AttributeExpirationDate", expireDate);


                    CreateSQLExecuted(spName: "uspUserSecurityAttributeUpdate", cmd: cmd);

                    //using (cn)
                    using (cmd)
                    {
                        rowCount = cmd.ExecuteNonQuery();
                    }

                }
                return rowCount;
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }


        public string OrganizationTypeTitle(int ranking = 0, int selectedSiteID = -1, int selectedProgramID = -1)
        {

            string orgtypename = "";
            try
            {

                DataTable orgtypes = ReportDepartmentComparativeAnalysisData(ranking, selectedSiteID, selectedProgramID).Tables[0];
                var query =
                          (from orgtype in orgtypes.AsEnumerable()
                           where orgtype.Field<bool>("IsActive") == true
                           select new
                           {
                               OrganizationTypeTitle = orgtype.Field<string>("OrganizationTypeTitle"),
                               IsActive = orgtype.Field<bool>("IsActive")

                           }).FirstOrDefault();

                orgtypename = query != null ? query.OrganizationTypeTitle.ToString() : "";



            }
            catch (Exception ex)
            {

                throw ex;
            }

            return orgtypename;
        }

        public string OrganizationTypesHeader()
        {
            string orgtypename = "";
            try
            {
                DataTable orgtypes = ReportDepartmentComparativeAnalysisData().Tables[0];
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

        private DataSet ReportDepartmentComparativeAnalysisData(int ranking = 0, int selectedSiteID = -1, int selectedProgramID = -1)
        {
            string msg = String.Empty;
            DataSet ds = new DataSet();
            int SiteID = selectedSiteID == -1 ? AppSession.SelectedSiteId : selectedSiteID;
            int ProgramID = selectedProgramID == -1 ? AppSession.SelectedProgramId : selectedProgramID;
            using (SqlConnection cn = new SqlConnection(this.ConnectionString))
            {
                cn.Open();
                SqlCommand cmd = new SqlCommand("ustReport_GetOrganizationTypeNames", cn);
                cmd.CommandType = System.Data.CommandType.StoredProcedure;
                cmd.Parameters.AddWithValue("SiteID", SiteID);
                cmd.Parameters.AddWithValue("ProgramID", ProgramID);
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

        public UserInfo GetBasicUserInfo(int userId)
        {
            string msg = String.Empty;
            DataSet ds = new DataSet();
            DataTable dt = new DataTable();
            UserInfo info = new UserInfo();
            try
            {

                using (SqlConnection cn = new SqlConnection(this.ConnectionString))
                {
                    cn.Open();
                    SqlCommand cmd = new SqlCommand("ustGetBasicUserInfo", cn);
                    cmd.CommandType = System.Data.CommandType.StoredProcedure;
                    cmd.Parameters.AddWithValue("UserID", userId);
                    SqlDataAdapter da = new SqlDataAdapter(cmd);

                    using (cn)
                    using (cmd)
                    using (da)
                    {
                        da.Fill(ds);
                    }
                }
                dt = ds.Tables[0];

                foreach (DataRow row in ds.Tables[0].Rows)
                {
                    info.FirstName = row["FirstName"].ToString();
                    info.LastName = row["LastName"].ToString();
                    info.EmailAddress = row["UserLogonID"].ToString();
                    info.FullName = info.FirstName + " " + info.LastName;
                }

            }
            catch (Exception ex)
            {

                throw ex;
            }
            return info;
        }

        /// <summary>
        /// GetEmailList: ajax called method to populate autocomplete dropdown for searching emails
        /// </summary>
        /// <param name="search">term to search for</param>
        /// <param name="siteIDs">a list of sites to search for users</param>
        /// <returns>a list of matches</returns>
        public List<String> GetEmailList(string searchEmail)
        {
            List<string> list = new List<string>();

            using (SqlConnection cn = new SqlConnection(ConfigurationManager.ConnectionStrings["DBAMP_WHSE"].ToString()))
            {
                cn.Open();

                SqlCommand cmd = new SqlCommand("usmERReportGetEmailList", cn);
                cmd.CommandType = CommandType.StoredProcedure;
                cmd.Parameters.AddWithValue("@Search", searchEmail);
                cmd.Parameters.AddWithValue("@SiteList", AppSession.SelectedSiteId.ToString());

                SqlDataReader reader = cmd.ExecuteReader();
                if (reader.HasRows)
                {
                    while (reader.Read())
                    {
                        list.Add(reader["UserLogonID"].ToString());
                    }
                }
                reader.Close();
            }

            return list;
        }

        public byte[] SetRdlcEmail(ReportViewer rv)
        {
            Warning[] warnings;
            string[] streamids;
            string mimeType;
            string encoding;
            string filenameExtension;

            return rv.LocalReport.Render(
                "PDF",
                null,
                out mimeType,
                out encoding,
                out filenameExtension,
                out streamids,
                out warnings);

        }

        public string GetReportTitle(string messageCode)
        {
            if (HttpContext.Current.Cache["ReportTitles"] == null)
            {
                List<KeyValuePair<string, string>> lstReportTitles = new List<KeyValuePair<string, string>>();

                DataSet ds = new DataSet();
                using (SqlConnection cn = new SqlConnection(this.ConnectionString))
                {
                    cn.Open();
                    SqlCommand cmd = new SqlCommand("ustJCRMessagesSelect", cn);
                    cmd.CommandType = System.Data.CommandType.StoredProcedure;

                    SqlDataAdapter da = new SqlDataAdapter(cmd);

                    using (cn)
                    using (cmd)
                    using (da)
                    {
                        da.Fill(ds);
                    }
                }

                if (ds.Tables.Count > 0)
                {
                    foreach (DataRow drTitle in ds.Tables[0].Rows)
                        lstReportTitles.Add(new KeyValuePair<string, string>(drTitle["MessageCode"].ToString(), drTitle["MessageText"].ToString()));
                }

                HttpContext.Current.Cache["ReportTitles"] = lstReportTitles;
            }
            return ((List<KeyValuePair<string, string>>)HttpContext.Current.Cache["ReportTitles"]).Find(item => item.Key == messageCode).Value;
        }


        public bool SendReportEmail(Email email,int actionTypeId, byte[] RdlcforEmail = null)
        {
            bool returnStatus = true; //WebConstants.Email_Success;
            List<string> guidList = new List<string>();

            try
            {
                string dtNow = DateTime.Now.ToString("MM-dd-yyyy_hhmmssfff_tt");
                var siteId = AppSession.SelectedSiteId;
                var userId = AppSession.UserID.HasValue ? AppSession.UserID.Value : 0;

                Random rn = new Random(siteId + userId);
                var seedVal = rn.Next(99999999);

                // Generate a unique file name. 
                string filename = string.Format("{0}_{1}{2}.pdf", email.Title, dtNow.ToString(), seedVal.ToString());
                // Create email body from email template file
                var nvc = new NameValueCollection(3);
                nvc["TONAME"] = AppSession.FullName;
                nvc["MESSAGE"] = "Please find the report <b>" + email.Title + "</b> attached.";
                nvc["COMMENTS"] = !string.IsNullOrEmpty(email.Comments) ? "Comments:" + email.Comments : "";

                // Create body from template
                email.Body = EmailHelpers.LoadEmailTemplate("EmailReport.htm", nvc);
                string fileGuid = EprodWebApi.SaveAttachmentToDatabase(filename, RdlcforEmail,AppSession.ReportType);
                guidList.Add(fileGuid);
                
                email.GuidList = guidList.ToArray();
                EmailHelpers.SendEmail(email, actionTypeId);
            }
            catch (Exception)
            {
                returnStatus = false; //WebConstants.Email_Failed;

            }

            return returnStatus;
        }
        private List<string> GetLists(string items)
        {
            char[] sep = { ',' };

            List<string> SplitIds = items.Split(',')
                     .Select(t => t)
                     .ToList();

            return SplitIds;
        }
        //public bool SendExcelEmail(Email email, string jsondata, string headerInfo)
        //{
        //    bool returnStatus = true; //WebConstants.Email_Success;

        //    try
        //    {


        //        var fileLocation = AppDomain.CurrentDomain.BaseDirectory + "ReportExportFiles";
        //        string dtNow = DateTime.Now.ToString("MM-dd-yyyy_hhmmssfff_tt");
        //        // Generate a unique file name. 
        //        string filename = string.Format("{0}_{1}.xlsx", email.Title, dtNow.ToString());

        //        email.AttachmentLocation[0] = Path.Combine(fileLocation, filename);

        //        XLWorkbook wb = new XLWorkbook();
        //        DataTable dt = (DataTable)JsonConvert.DeserializeObject(jsondata, (typeof(DataTable)));
        //        if (dt.Columns.Count == 0)
        //        { throw (new Exception("No Data")); }
        //        List<string> headernameslist = new List<string>();
        //        headernameslist = GetLists(headerInfo);
        //        //rename the columns as per excel view
        //        for (int i = 0; i < headernameslist.Count; i++)
        //        {
        //            dt.Columns[i].ColumnName = headernameslist[i].ToString();
        //        }

        //        wb.Worksheets.Add(dt, "WorksheetName");
        //        wb.SaveAs(fileLocation + "\\" + filename);

        //        // Create email body from email template file
        //        var nvc = new NameValueCollection(3);
        //        nvc["TONAME"] = AppSession.SessionUser.FullName;
        //        nvc["MESSAGE"] = "Please find the report <b>" + email.Title + "</b> attached.";
        //        nvc["COMMENTS"] = (email.Comments != "" && email.Comments != null) ? "Comments:" + email.Comments : "";

        //        // Create body from template
        //        email.Body = EmailHelpers.LoadEmailTemplate("EmailReport.htm", nvc);
        //        EmailHelpers.SendEmail(email);


        //    }
        //    catch (Exception)
        //    {
        //        returnStatus = false; //WebConstants.Email_Failed;

        //    }

        //    return returnStatus;
        //}

        public string SaveExcel(string Title, byte[] fileContent)
        {
            string fileGuid = "";
            try
            {
                string dtNow = DateTime.Now.ToString("MM-dd-yyyy_hhmmssfff_tt");
                var siteId = AppSession.SelectedSiteId;
                var userId = AppSession.UserID.HasValue ? AppSession.UserID.Value : 0;

                Random rn = new Random(siteId + userId);
                var seedVal = rn.Next(99999999);

                string filename = string.Format("{0}_{1}{2}.xlsx", Title, dtNow.ToString(), seedVal.ToString());
                fileGuid = EprodWebApi.SaveAttachmentToDatabase(filename, fileContent, AppSession.ReportType);
            }
            catch (Exception)
            {


            }
            return fileGuid;

        }
        public string SavePDF(string Title, byte[] fileContent)
        {
            string fileGuid = "";
            try
            {
                string dtNow = DateTime.Now.ToString("MM-dd-yyyy_hhmmssfff_tt");
                var siteId = AppSession.SelectedSiteId;
                var userId = AppSession.UserID.HasValue ? AppSession.UserID.Value : 0;

                Random rn = new Random(siteId + userId);
                var seedVal = rn.Next(99999999);

                string filename = string.Format("{0}_{1}{2}.pdf", Title, dtNow.ToString(), seedVal.ToString());
                fileGuid = EprodWebApi.SaveAttachmentToDatabase(filename, fileContent, AppSession.ReportType);
            }
            catch (Exception)
            {
            }
            return fileGuid;
        }


        public string GetRDLCPathtoOpen(string reportName, ReportViewer rv)
        {

            string Attachment = "";
            string pdfLocation = "";
            Warning[] warnings;
            string[] streamids;
            string mimeType;
            string encoding;
            string filenameExtension;
            byte[] fileContents = null;
            try
            {
                fileContents = rv.LocalReport.Render(
                "PDF",
                null,
                out mimeType,
                out encoding,
                out filenameExtension,
                out streamids,
                out warnings);

                var fileLocation = AppDomain.CurrentDomain.BaseDirectory + "ReportExportFiles";

                string filename = reportName + "-" + Guid.NewGuid().ToString() + ".pdf";
                Attachment = Path.Combine(fileLocation, filename);
                using (var fs = new FileStream(Attachment, FileMode.Create))
                {
                    fs.Write(fileContents, 0, fileContents.Length);
                    fs.Close();
                }

                var request = System.Web.HttpContext.Current.Request;
                var appUrl = System.Web.HttpRuntime.AppDomainAppVirtualPath;
                string url = System.Web.HttpContext.Current.Request.Url.AbsoluteUri;
                var baseUrl = string.Format("{0}://{1}{2}", request.Url.Scheme, request.Url.Authority, appUrl);
                pdfLocation = string.Format("{0}ReportExportFiles/{1}", baseUrl, Attachment.Split('\\').Last());

            }
            catch (Exception ex)
            {

                throw ex;
            }

            return pdfLocation;
        }

        //public byte[] SetRdlcOpen(ReportViewer rv)
        //{
        //    Warning[] warnings;
        //    string[] streamids;
        //    string mimeType;
        //    string encoding;
        //    string filenameExtension;

        //    return rv.LocalReport.Render(
        //        "PDF",
        //        null,
        //        out mimeType,
        //        out encoding,
        //        out filenameExtension,
        //        out streamids,
        //        out warnings);

        //}
        public string SaveCSV(string Title, byte[] fileContent)
        {
            string Attachment = "";
            try
            {

                var fileLocation = AppDomain.CurrentDomain.BaseDirectory + "ReportExportFiles";
                string dtNow = DateTime.Now.ToString("MM-dd-yyyy_hhmmssfff_tt");
                string filename = string.Format("{0}_{1}.csv", Title, dtNow.ToString());
                Attachment = Path.Combine(fileLocation, filename);
                using (var fs = new FileStream(Attachment, FileMode.Create))
                {
                    fs.Write(fileContent, 0, fileContent.Length);
                    fs.Close();
                }
            }
            catch (Exception)
            {
            }
            return Attachment;
        }



        public bool SendExcelEmailAttachemnt(Email email, bool EREmail = false, string EmailFrom = "")
        {
            bool returnStatus = true; //WebConstants.Email_Success;
            List<string> guidList = new List<string>();

            try
            {
                //int actionTypeId = HelperClasses.GetActionTypeId(AppSession.ReportID);
                int actionTypeId = WebConstants.GetActionTypeId(AppSession.ReportID);
                // Create email body from email template file
                var nvc = new NameValueCollection(3);
                nvc["TONAME"] = AppSession.FullName;
                if (email.MultipleAttachment)
                {
                    nvc["MESSAGE"] = "Please find the multiple <b>" + email.Title + "(s)</b> attached.";
                }
                else
                {
                    nvc["MESSAGE"] = "Please find the report <b>" + email.Title + "</b> attached.";
                }
                //nvc["MESSAGE"] = "Please find the report <b>" + email.Title + "</b> attached.";
                nvc["COMMENTS"] = !string.IsNullOrEmpty(email.Comments) ? "Comments:" + email.Comments : "";

                // Create body from template
                email.Body = EmailHelpers.LoadEmailTemplate("EmailReport.htm", nvc);
                if(email.AttachmentLocation.Count>0)
                {
                    for (int i = 0; i <= email.AttachmentLocation.Count-1; i++)
                    {
                        if (email.AttachmentLocation[i] != string.Empty)
                        {
                            string fileGuid = email.AttachmentLocation[i];
                            guidList.Add(fileGuid);
                        }
                    }
                    email.GuidList = guidList.ToArray();
                }
                
                EmailHelpers.SendEmail(email, actionTypeId, EmailFrom);
            }
            catch (FileNotFoundException ex)
            {
                ExceptionLog exceptionLog = new ExceptionLog
                {
                    ExceptionText = "File does not exists: " + ex.Message,
                    PageName = "CommonService.cs",
                    MethodName = "SendExcelEmailAttachemnt",
                    UserID = Convert.ToInt32(AppSession.UserID),
                    SiteId = Convert.ToInt32(AppSession.SelectedSiteId),
                    TransSQL = "",
                    HttpReferrer = null
                };
                new ExceptionService().LogException(exceptionLog);
                returnStatus = false; //WebConstants.Email_Failed;
            }
            catch (Exception ex)
            {
                ErrorException = ex;
                ExceptionLog exceptionLog = new ExceptionLog
                {
                    ExceptionText = "Reports_SendEmail: " + ex.Message,
                    PageName = "CommonService.cs",
                    MethodName = "SendExcelEmailAttachemnt",
                    UserID = Convert.ToInt32(AppSession.UserID),
                    SiteId = Convert.ToInt32(AppSession.SelectedSiteId),
                    TransSQL = "",
                    HttpReferrer = null
                };
                new ExceptionService().LogException(exceptionLog);
                returnStatus = false; //WebConstants.Email_Failed;
            }
            return returnStatus;
        }
        public int GetPreferredProgram(int userId, int siteId)
        {
            int programID = 0;

            using (SqlConnection cn = new SqlConnection(ConfigurationManager.ConnectionStrings["DBMEdition01"].ToString()))
            {
                cn.Open();

                SqlCommand cmd = new SqlCommand("ustGetSiteProgramPreference", cn);
                cmd.CommandType = CommandType.StoredProcedure;
                cmd.Parameters.AddWithValue("@UserID", userId);
                cmd.Parameters.AddWithValue("@SiteID", siteId);

                SqlDataReader reader = cmd.ExecuteReader();
                if (reader.HasRows)
                {
                    while (reader.Read())
                    {
                        programID = Convert.ToInt32(reader["ProgramID"].ToString());
                    }
                }
                reader.Close();
            }
            return programID;
        }

        public void UpdatePreferredProgram(int userId, int siteId, int programId)
        {
            using (SqlConnection cn = new SqlConnection(ConfigurationManager.ConnectionStrings["DBMEdition01_Write"].ToString()))
            {
                cn.Open();

                SqlCommand cmd = new SqlCommand("ustSaveSiteProgramPreference", cn);
                cmd.CommandType = CommandType.StoredProcedure;
                cmd.Parameters.AddWithValue("@UserID", userId);
                cmd.Parameters.AddWithValue("@SiteID", siteId);
                cmd.Parameters.AddWithValue("@ProgramID", programId);

                cmd.ExecuteNonQuery();
            }
            //Update AMP app with selected Program ID.
            InsertUpdateUserDefaultSelection(userId, siteId, programId);
        }

        public void InsertUpdateUserDefaultSelection(int UserID, int SiteID, int programId)
        {
            using (SqlConnection cn = new SqlConnection(ConfigurationManager.ConnectionStrings["DBAMP"].ToString()))
            {
                cn.Open();

                SqlCommand cmd = new SqlCommand("usmInsertUpdateUserDefaultSelection", cn);
                cmd.CommandType = CommandType.StoredProcedure;
                cmd.Parameters.AddWithValue("@UserID", UserID);
                cmd.Parameters.AddWithValue("@SiteID", SiteID);
                cmd.Parameters.AddWithValue("@ProductID", 1);
                cmd.Parameters.AddWithValue("@CycleID", AppSession.CycleID);
                cmd.Parameters.AddWithValue("@PageModeID", 0);
                cmd.Parameters.AddWithValue("@ProgramServiceID", programId);
                cmd.Parameters.AddWithValue("@CertificationItemID", 0);
                cmd.Parameters.AddWithValue("@ChapterID", 0);
                cmd.Parameters.AddWithValue("@ViewBySelectionValue", string.Empty);
                cmd.Parameters.AddWithValue("@IsCustomSelection", 0);
                cmd.Parameters.AddWithValue("@EpViewByOptionID", -1);
                cmd.Parameters.AddWithValue("@IsAMP", 0);
                cmd.ExecuteNonQuery();
            }
        }

        public List<ScheduleRecurrenceType> GetScheduleTypes()
        {
            var list = new List<ScheduleRecurrenceType>();


            list.Insert(0, new ScheduleRecurrenceType
            {
                ERScheduleTypeID = Convert.ToInt32(-1),
                ERScheduleName = "All",
                ERScheduleDescription = "All",
            });
            list.Insert(1, new ScheduleRecurrenceType
            {
                ERScheduleTypeID = Convert.ToInt32(1),
                ERScheduleName = "Daily",
                ERScheduleDescription = "Daily",
            });
            list.Insert(2, new ScheduleRecurrenceType
            {
                ERScheduleTypeID = Convert.ToInt32(2),
                ERScheduleName = "Weekly",
                ERScheduleDescription = "Weekly",
            });
            list.Insert(3, new ScheduleRecurrenceType
            {
                ERScheduleTypeID = Convert.ToInt32(3),
                ERScheduleName = "Monthly",
                ERScheduleDescription = "Monthly",
            });
            list.Insert(4, new ScheduleRecurrenceType
            {
                ERScheduleTypeID = Convert.ToInt32(4),
                ERScheduleName = "Quarterly",
                ERScheduleDescription = "Quarterly",
            });
            list.Insert(5, new ScheduleRecurrenceType
            {
                ERScheduleTypeID = Convert.ToInt32(0),
                ERScheduleName = "None",
                ERScheduleDescription = "None",
            });

            return list;
        }

        public List<UserInfo> GetCreatedByUsers(int productID)
        {
            var list = new List<UserInfo>();

            DataSet ds = new DataSet();
            DataTable dt = new DataTable();
            try
            {
                using (SqlConnection cn = new SqlConnection(ConfigurationManager.ConnectionStrings["DBAMP_WHSE"].ToString()))
                {
                    cn.Open();
                    SqlCommand cmd = new SqlCommand("ustReport_GetSavedandScheduledCreatedby", cn);
                    cmd.CommandType = CommandType.StoredProcedure;
                    cmd.Parameters.AddWithValue("@productID", productID);
                    cmd.Parameters.AddWithValue("@siteID", Convert.ToInt32(AppSession.SelectedSiteId));
                    cmd.Parameters.AddWithValue("@ProgramID", Convert.ToInt32(AppSession.SelectedProgramId));

                    SqlDataAdapter da = new SqlDataAdapter(cmd);

#if DEBUG
                    CreateSQLExecuted("ustReport_GetSavedandScheduledCreatedby", cmd);
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
                //if (dt.Rows.Count > 0)
                //{
                list = dt.ToList<UserInfo>();
                list.Insert(0, new UserInfo
                {
                    UserID = Convert.ToInt32(-1),
                    FirstName = "All",
                    EmailAddress = "",
                    LastName = "",
                    FullName = "All",

                });
                // }
                list.ForEach(z => z.FullName = z.FirstName + " " + z.LastName);

            }
            catch (Exception ex)
            {
                ex.Data.Add(TSQL, _SQLExecuted);
                throw ex;
            }

            return list;


        }

        public List<MyReportDetail> SelectMyReporList(int productID)
        {
            var list = new List<MyReportDetail>();

            DataSet ds = new DataSet();
            DataTable dt = new DataTable();
            try
            {
                using (SqlConnection cn = new SqlConnection(ConfigurationManager.ConnectionStrings["DBAMP_WHSE"].ToString()))
                {
                    cn.Open();
                    SqlCommand cmd = new SqlCommand("ustReport_GetSavedandScheduledReportIDs", cn);
                    cmd.CommandType = CommandType.StoredProcedure;
                    cmd.Parameters.AddWithValue("@productID", productID);
                    cmd.Parameters.AddWithValue("@SiteID", AppSession.SelectedSiteId);
                    cmd.Parameters.AddWithValue("@ProgramID", AppSession.SelectedProgramId);
                    SqlDataAdapter da = new SqlDataAdapter(cmd);

#if DEBUG
                    CreateSQLExecuted("ustReport_GetSavedandScheduledReportIDs", cmd);
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
                    list = dt.ToList<MyReportDetail>();

                }


                list.Insert(0, new MyReportDetail
                {
                    ERReportUserScheduleID = Convert.ToInt32(-1),
                    ReportNameOverride = "All",


                });


            }
            catch (Exception ex)
            {
                ex.Data.Add(TSQL, _SQLExecuted);
                throw ex;
            }

            return list;


        }

        public List<UserInfo> GetERCreatedByUsers(int productID)
        {
            var list = new List<UserInfo>();

            DataSet ds = new DataSet();
            DataTable dt = new DataTable();
            try
            {
                List<int> siteIDList = new List<int>();
                if (productID == (int)WebConstants.ProductID.AMP)
                { siteIDList = AppSession.Sites.Select(m => m.SiteID).ToList(); }
                else
                { siteIDList = AppSession.Sites.Where(m => m.RoleID == (int)(AppSession.RoleID)).Select(m => m.SiteID).ToList(); }


                using (SqlConnection cn = new SqlConnection(ConfigurationManager.ConnectionStrings["DBAMP_WHSE"].ToString()))
                {
                    cn.Open();
                    SqlCommand cmd = new SqlCommand("ustReport_GetSavedandScheduledERCreatedby", cn);
                    cmd.CommandType = CommandType.StoredProcedure;
                    cmd.Parameters.AddWithValue("@UserSiteList", string.Join(",", siteIDList.ToArray()));
                    cmd.Parameters.AddWithValue("@EProductID", productID);

                    SqlDataAdapter da = new SqlDataAdapter(cmd);

#if DEBUG
                    CreateSQLExecuted("ustReport_GetSavedandScheduledERCreatedby", cmd);
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
                //if (dt.Rows.Count > 0)
                //{
                list = dt.ToList<UserInfo>();
                list.ForEach(z => z.FullName = z.LastName + ", " + z.FirstName);
                list.Insert(0, new UserInfo
                {
                    UserID = Convert.ToInt32(-1),
                    FirstName = "All",
                    EmailAddress = "",
                    LastName = "",
                    FullName = "All",
                });
                // }

            }
            catch (Exception ex)
            {
                ex.Data.Add(TSQL, _SQLExecuted);
                throw ex;
            }

            return list;


        }
        public List<MyReportDetail> SelectERMyReporList(int productID)
        {
            var list = new List<MyReportDetail>();

            DataSet ds = new DataSet();
            DataTable dt = new DataTable();
            try
            {
                int ERReportCategoryID = 1;
                List<int> siteIDList = new List<int>();
                if (productID == (int)WebConstants.ProductID.AMP)
                {
                    siteIDList = AppSession.Sites.Select(m => m.SiteID).ToList();
                    ERReportCategoryID = (int)WebConstants.ReportCategoryID.AMP;
                }
                else
                {
                    siteIDList = AppSession.Sites.Where(m => m.RoleID == (int)(AppSession.RoleID)).Select(m => m.SiteID).ToList();
                    ERReportCategoryID = (int)WebConstants.ReportCategoryID.TracerER;
                }

                using (SqlConnection cn = new SqlConnection(ConfigurationManager.ConnectionStrings["DBAMP_WHSE"].ToString()))
                {
                    cn.Open();
                    SqlCommand cmd = new SqlCommand("ustReport_GetSavedandScheduledERReportIDs", cn);
                    cmd.CommandType = CommandType.StoredProcedure;
                    cmd.Parameters.AddWithValue("@UserSiteList", string.Join(",", siteIDList.ToArray()));
                    cmd.Parameters.AddWithValue("@EProductID", productID);
                    cmd.Parameters.AddWithValue("@ERReportCategoryID", ERReportCategoryID);
                    SqlDataAdapter da = new SqlDataAdapter(cmd);

#if DEBUG
                    CreateSQLExecuted("ustReport_GetSavedandScheduledERReportIDs", cmd);
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
                    list = dt.ToList<MyReportDetail>();

                }


                list.Insert(0, new MyReportDetail
                {
                    ERReportUserScheduleID = Convert.ToInt32(-1),
                    ReportNameOverride = "All",


                });


            }
            catch (Exception ex)
            {
                ex.Data.Add(TSQL, _SQLExecuted);
                throw ex;
            }

            return list;


        }

        public List<ReportDetail> SelectReporListByProductID(int productID, bool AddSelectAllOption = false)
        {
            var list = new List<ReportDetail>();

            DataSet ds = new DataSet();
            DataTable dt = new DataTable();
            try
            {
                using (SqlConnection cn = new SqlConnection(ConfigurationManager.ConnectionStrings["DBAMP_WHSE"].ToString()))
                {
                    cn.Open();
                    SqlCommand cmd = new SqlCommand("ustReport_ReportsListByProductID", cn);
                    cmd.CommandType = CommandType.StoredProcedure;
                    cmd.Parameters.AddWithValue("@productID", productID);

                    SqlDataAdapter da = new SqlDataAdapter(cmd);

#if DEBUG
                    CreateSQLExecuted("ustReport_ReportsListByProductID", cmd);
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
                    list = dt.ToList<ReportDetail>();
                    if (AppSession.LinkType == 10)
                    {
                        string reportAccessList = ConfigurationManager.AppSettings["UHSReportAccess"] != null ? ConfigurationManager.AppSettings["UHSReportAccess"].ToString() : "";
                        bool isExists = reportAccessList.Split(',').Any(x => x == AppSession.UserID.ToString());
                        if (!isExists) {
                            var removeReport = list.FirstOrDefault(r => r.ERReportID == 41);
                            if (removeReport != null) { list.Remove(removeReport); }
                        }
                        
                    }
                    if(AppSession.LinkType == 5)
                    {
                        var removeReport = list.FirstOrDefault(r => r.ERReportID == 42);
                        if (removeReport != null) { list.Remove(removeReport); }
                    }
                }
                if (AddSelectAllOption)
                {
                    list.Insert(0, new ReportDetail
                    {
                        ERReportID = Convert.ToInt32(-1),
                        ERReportName = "All",
                        ERReportDescription = "",
                        ERReportFullDescription = "",
                        ReportChangeStatus = "",
                        ReportSource = "",
                        ReportRoles = string.Empty

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
        public static DataSet ReportParameters()
        {

            DataSet ds = new DataSet("dsReport_Parameters");

            DataTable table1 = new DataTable("dsParameters");

            table1.Columns.Add("ParameterName", typeof(string));
            table1.Columns.Add("ParameterValue", typeof(string));
            table1.Columns.Add("ParameterGroup", typeof(string));
            ds.Tables.Add(table1);
            return ds;
        }

        public static string InitializeReportDateTitle(string seedname, DateTime? startDate, DateTime? endDate)
        {
            string reportDateTitle = String.Empty;


            if (startDate != null && endDate != null)
            {
                reportDateTitle = seedname.ToString() + " updates for " + startDate.Value.ToShortDateString() + " - " + endDate.Value.ToShortDateString();
            }
            else if (startDate != null && endDate == null)
            {
                reportDateTitle = seedname.ToString() + " updates since " + startDate.Value.ToShortDateString();
            }
            else if (startDate == null && endDate != null)
            {
                reportDateTitle = seedname.ToString() + " updates through " + endDate.Value.ToShortDateString();
            }
            else
            {
                reportDateTitle = "All " + seedname.ToString() + " Dates";

            }

            return reportDateTitle;
        }
        public static string InitializeAMPDateTitle(string startDate, string endDate)
        {
            string reportDateTitle = String.Empty;


            if (startDate != string.Empty && endDate != string.Empty)
            {
                reportDateTitle = startDate + " - " + endDate;
            }
            else if (startDate != string.Empty && endDate == string.Empty)
            {
                reportDateTitle = " since " + startDate;
            }
            else if (startDate == string.Empty && endDate != string.Empty)
            {
                reportDateTitle = " through " + endDate;
            }
            else
            {
                reportDateTitle = "All";

            }

            return reportDateTitle;
        }

        public static string GetOrgHeader()
        {
            string header = AppSession.OrgRanking1Name;

            if (AppSession.OrgRanking2Name.ToString() != "")
                header = AppSession.OrgRanking2Name.ToString() + ", " + header;
            if (AppSession.OrgRanking3Name.ToString() != "")
                header = AppSession.OrgRanking3Name.ToString() + ", " + header;

            header = "Include Inactive " + header.ToString();


            return header;

        }


        public static DataSet TopNData(DataSet ds, int topN, string idColumnName, string complianceColumnName, ref string matchMessage)
        {
            DataSet ds1 = new DataSet();
            DataView dv = new DataView(ds.Tables[0]);
            dv = TopNData(dv, topN, idColumnName, complianceColumnName, ref matchMessage);
            DataTable dt = new DataTable();
            dt = dv.ToTable();
            ds1.Tables.Add(dt);

            return ds1;
        }

        public static DataView TopNData(DataView dv, int topN, string idColumnName, string complianceColumnName, ref string matchMessage)
        {
            decimal lastPercentInBounds = -1;
            decimal lastPercentOutBounds = -1;

            DataView topNData = new DataView();
            topNData = dv;

            matchMessage = "";

            try
            {

                foreach (DataRowView drow in topNData)
                {
                    if (Convert.ToInt32(drow[idColumnName.ToString()]) <= topN)
                        lastPercentInBounds = Convert.ToDecimal(drow[complianceColumnName.ToString()]);
                    else
                    {
                        if (lastPercentOutBounds == -1)
                            lastPercentOutBounds = Convert.ToDecimal(drow[complianceColumnName.ToString()]);

                        drow.Delete();
                    }
                }

                if (lastPercentInBounds != -1 && lastPercentInBounds == lastPercentOutBounds)
                    matchMessage = " Multiple questions found at " + lastPercentInBounds.ToString() + "%. Questions with higher denominator are included in the result.";     // Flag its a match

            }
            catch (Exception ex)      // Do not let any error cause us to crash
            {
                string msg = ex.Message.ToString();
            }


            return topNData;

        }

        //public List<Program> SelectTracerProgramsBySiteAndUser(int userID, int siteID, int cycleID)
        //{
        //    var lstPrograms = new List<Program>();
        //    DataSet ds = new DataSet();
        //    DataTable dt = new DataTable();

        //    try
        //    {
        //        using (SqlConnection cn = new SqlConnection(ConfigurationManager.ConnectionStrings["DBAMP_WHSE"].ToString()))
        //        {
        //            cn.Open();
        //            //using the same store procedure used by tracer app for site list by userid
        //            SqlCommand cmd = new SqlCommand("usmSelectTracerProgramsBySiteUser", cn);
        //            cmd.CommandType = CommandType.StoredProcedure;
        //            cmd.Parameters.AddWithValue("@SiteID", siteID);
        //            cmd.Parameters.AddWithValue("@UserID", userID);
        //            cmd.Parameters.AddWithValue("@CycleID", cycleID);

        //            SqlDataAdapter da = new SqlDataAdapter(cmd);
        //            CreateSQLExecuted(spName: "usmSelectTracerProgramsBySiteUser", cmd: cmd);
        //            using (cn)
        //            using (cmd)
        //            using (da)
        //            {
        //                da.Fill(ds);
        //            }
        //        }
        //        dt = ds.Tables[0];
        //        lstPrograms = dt.ToList<Program>();
        //    }
        //    catch (Exception ex)
        //    {
        //        throw ex;
        //    }

        //    return lstPrograms;
        //}

        public bool CheckAMPAccess()
        {

            bool AmpAccess = false;
            DataSet ds = new DataSet();
            DataTable dt = new DataTable();
            try
            {
                using (SqlConnection cn = new SqlConnection(ConfigurationManager.ConnectionStrings["DBAMP_WHSE"].ToString()))
                {
                    cn.Open();
                    SqlCommand cmd = new SqlCommand("usmERReportGetUserSiteCount", cn);
                    cmd.CommandType = CommandType.StoredProcedure;
                    cmd.Parameters.AddWithValue("UserID", AppSession.UserID);
                    cmd.Parameters.AddWithValue("EProductID", 1);
                    cmd.Parameters.AddWithValue("@RoleIDs", "1,2,4,8,9");
                    cmd.Parameters.AddWithValue("@SiteID", AppSession.SelectedSiteId);
                    SqlParameter outputParm = cmd.Parameters.Add("@SiteCount", SqlDbType.Int);
                    outputParm.Direction = ParameterDirection.Output;
                    SqlDataAdapter da = new SqlDataAdapter(cmd);

                    using (cn)
                    using (cmd)
                    using (da)
                    {
                        da.Fill(ds);
                    }
                    AmpAccess = (int)outputParm.Value > 0 ? true : false;
                }


            }
            catch (Exception)
            {

                throw;
            }


            return AmpAccess;

        }

        /// <summary>
        /// Check Corporate access for the site
        /// </summary>
        /// <param name="siteID"></param>
        /// <returns></returns>
        public bool CheckCorporateAccess(int siteID)
        {
            bool bIsCorporate = false;
            try
            {
                using (SqlConnection cn = new SqlConnection(ConfigurationManager.ConnectionStrings["DBMEdition01"].ToString()))
                {
                    cn.Open();

                    SqlCommand cmd = new SqlCommand("amp.usmGetSiteCoporateCheck", cn);
                    cmd.CommandType = CommandType.StoredProcedure;
                    cmd.Parameters.AddWithValue("@SiteIDs", siteID);

                    SqlDataReader reader = cmd.ExecuteReader();
                    if (reader.HasRows)
                    {
                        while (reader.Read())
                        {
                            bIsCorporate = reader.GetInt32(reader.GetOrdinal("CorpSite")) == 1 ? true : false;
                        }
                    }
                    reader.Close();
                }
            }
            catch (Exception)
            {
                throw;
            }

            return bIsCorporate;
        }

        public bool CheckCorporateAccess(string siteIDs)
        {
            bool bIsCorporate = false;
            DataSet ds = new DataSet();
            DataTable dt = new DataTable();
            try
            {
                using (SqlConnection cn = new SqlConnection(ConfigurationManager.ConnectionStrings["DBMEdition01"].ToString()))
                {
                    cn.Open();

                    SqlCommand cmd = new SqlCommand("amp.usmGetSiteCoporateCheck", cn);
                    cmd.CommandType = CommandType.StoredProcedure;
                    cmd.Parameters.AddWithValue("@SiteIDs", siteIDs);

                    SqlDataAdapter da = new SqlDataAdapter(cmd);


                    using (cmd)
                    using (da)
                    {
                        da.Fill(ds);
                    }

                    if (ds.Tables.Count > 0)
                    {
                        dt = ds.Tables[0];
                        var objResult = dt.ToList<SiteTreeCorporateCheck>();

                        bIsCorporate = objResult.Any(item => item.CorpSite == 1);
                    }

                }
            }
            catch (Exception)
            {
                throw;
            }

            return bIsCorporate;
        }

        public void GetHelpLink()
        {
            try
            {

                int eProductID = 0;
                switch (AppSession.LinkType)
                {
                    case (int)WebConstants.LinkType.AMPCorporateReports:
                    case (int)WebConstants.LinkType.AmpHome:
                    case (int)WebConstants.LinkType.AMPCorpScoring:
                    case (int)WebConstants.LinkType.AMPSiteScoring:
                        {
                            eProductID = 1;
                            break;
                        }
                    case (int)WebConstants.LinkType.TracersHome:
                    case (int)WebConstants.LinkType.EnterpriseReportTracers:
                        {
                            eProductID = 2;
                            break;
                        }
                    default:
                        eProductID = 0;
                        break;
                }

                using (SqlConnection cn = new SqlConnection(ConfigurationManager.ConnectionStrings["DBMEdition01"].ToString()))
                {
                    cn.Open();

                    SqlCommand cmd = new SqlCommand("usmGetHelpLinkByEProduct", cn);
                    cmd.CommandType = CommandType.StoredProcedure;
                    cmd.Parameters.AddWithValue("@EProductID", eProductID);

                    SqlDataReader reader = cmd.ExecuteReader();
                    if (reader.HasRows)
                    {
                        while (reader.Read())
                        {
                            AppSession.HelpLinkURL = reader["HelpLinkURL"].ToString();
                        }
                    }
                    else
                        AppSession.HelpLinkURL = "";

                    reader.Close();
                }

            }
            catch (Exception)
            {
                throw;

            }
        }

        public CycleInfo GetLatestCycleByProgram(int programID)
        {
            var standardCycle = new CycleInfo();
            DataSet ds = new DataSet();
            DataTable dt = new DataTable();

            try
            {
                using (SqlConnection cn = new SqlConnection(ConfigurationManager.ConnectionStrings["DBMEdition01"].ToString()))
                {
                    cn.Open();
                    //using the same store procedure used by tracer app for site list by userid
                    SqlCommand cmd = new SqlCommand("usmReportGetLatestCycleByProgram", cn);
                    cmd.CommandType = CommandType.StoredProcedure;
                    cmd.Parameters.AddWithValue("@ProgramID", programID);

                    SqlDataAdapter da = new SqlDataAdapter(cmd);
                    CreateSQLExecuted(spName: "usmReportGetLatestCycleByProgram", cmd: cmd);
                    using (cn)
                    using (cmd)
                    using (da)
                    {
                        da.Fill(ds);
                    }
                }
                if (ds.Tables.Count > 0)
                {
                    dt = ds.Tables[0];
                    standardCycle = dt.ToList<CycleInfo>().FirstOrDefault();
                }
            }
            catch (Exception ex)
            {
                throw ex;
            }

            return standardCycle;
        }
        
        public bool AtLeastOneSiteAndProgramHasCMSLicense() {            
            int subscriptionTypeID = CMSService.GetSubscriptionTypeIDForCMS((WebConstants.LinkType)AppSession.LinkType);
            
            return DataModel.UserCustom.GetLicenseDetailsForCMSByUser((int)AppSession.UserID, subscriptionTypeID);
        }

        public static List<StickyDate> GetStickyDates(int siteID, int userID)
        {
            var result = new List<StickyDate>();

            using (var dbmEntityContainter = new DBMEdition01_Entities())
            {
                result = dbmEntityContainter.GetStickyDates(siteID, userID).ToList();
            }

            return result;
        }
    }
}