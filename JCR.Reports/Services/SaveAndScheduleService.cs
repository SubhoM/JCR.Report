using JCR.Reports.Models;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data;
using System.Data.SqlClient;
using System.Linq;


namespace JCR.Reports.Services
{
    public class SaveAndScheduleService : BaseService
    {
        public SaveAndScheduleService()
        {
            this.ConnectionString = ConfigurationManager.ConnectionStrings["DBAMP"].ToString();
            this.ConnectionString_WHSE = ConfigurationManager.ConnectionStrings["DBAMP_WHSE"].ToString();

        }

        public List<ScheduleReportParameter> GetReportParameters(int reportID)
        {
            List<ScheduleReportParameter> parameterList = new List<ScheduleReportParameter>();
            using (SqlConnection cn = new SqlConnection(this.ConnectionString_WHSE))
            {
                cn.Open();

                SqlCommand cmd = new SqlCommand("ustReportGetParameters", cn);
                cmd.CommandType = CommandType.StoredProcedure;
                cmd.Parameters.AddWithValue("@ReportID", reportID);

                SqlDataReader reader = cmd.ExecuteReader();
                if (reader.HasRows)
                {
                    while (reader.Read())
                    {
                        parameterList.Add(
                            new ScheduleReportParameter
                            {
                                ReportID = Convert.ToInt16(reader["ERReportID"].ToString()),
                                ReportParameterID = Convert.ToInt16(reader["ERReportParameterID"].ToString()),
                                ParameterName = reader["ParameterName"].ToString(),
                                ParameterOrder = Convert.ToInt16(reader["ParameterOrder"].ToString()),
                                DisplayText = reader["DisplayText"].ToString(),
                                DefaultValue = reader["DefaultValue"].ToString()
                            });
                    }
                }
                reader.Close();
            }

            return parameterList;
        }

        public int SaveUserSchedule(SaveAndSchedule userSchedule)
        {
            int erReportUserScheduleID = -1;

            SqlTransaction tran = null;
            SqlCommand cmdSchedule = null;
            SqlCommand cmdScheduleClear = null;
            SqlCommand cmdScheduleSiteMap = null;
            SqlCommand cmdScheduleParameter = null;

            using (SqlConnection cn = new SqlConnection(this.ConnectionString))
            {
                try
                {
                    cn.Open();
                    tran = cn.BeginTransaction();

                    cmdSchedule = new SqlCommand("usmERReportUserScheduleUpdate", cn, tran);
                    cmdScheduleClear = new SqlCommand("usmERReportUserScheduleClear", cn, tran);
                    cmdScheduleSiteMap = new SqlCommand("usmERReportUserScheduleSiteMapUpdate", cn, tran);
                    cmdScheduleParameter = new SqlCommand("usmERReportUserScheduleParameterUpdate", cn, tran);

                    //Update report schedule
                    cmdSchedule.CommandType = CommandType.StoredProcedure;
                    cmdSchedule.Parameters.Add("@ERReportUserScheduleID", SqlDbType.Int);
                    cmdSchedule.Parameters["@ERReportUserScheduleID"].Direction = ParameterDirection.InputOutput;
                    if (userSchedule.ReportUserScheduleID > 0)
                    {
                        cmdSchedule.Parameters["@ERReportUserScheduleID"].Value = userSchedule.ReportUserScheduleID;
                    }
                    else
                    {
                        cmdSchedule.Parameters["@ERReportUserScheduleID"].Value = 0;
                    }

                    cmdSchedule.Parameters.AddWithValue("@ERReportID", userSchedule.ReportID);
                    cmdSchedule.Parameters.AddWithValue("@UserID", userSchedule.UserID);
                    cmdSchedule.Parameters.AddWithValue("@ERReportScheduleStatusID", userSchedule.ReportScheduleStatusID);
                    cmdSchedule.Parameters.AddWithValue("@ReportNameOverride", GetValue(userSchedule.ReportNameOverride));
                    cmdSchedule.Parameters.AddWithValue("@ReportDescription", GetValue(userSchedule.ReportDescription));
                    cmdSchedule.Parameters.AddWithValue("@EmailTo", userSchedule.EmailTo);
                    cmdSchedule.Parameters.AddWithValue("@CC", GetValue(userSchedule.EmailCC));
                    cmdSchedule.Parameters.AddWithValue("@BCC", GetValue(userSchedule.EmailBCC));
                    cmdSchedule.Parameters.AddWithValue("@ReplyTo", GetValue(userSchedule.ReplyTo));
                    cmdSchedule.Parameters.AddWithValue("@Subject", GetValue(userSchedule.Subject));
                    cmdSchedule.Parameters.AddWithValue("@RenderFormatTypeID", userSchedule.RenderFormatTypeID);
                    cmdSchedule.Parameters.AddWithValue("@Priority", userSchedule.Priority);
                    cmdSchedule.Parameters.AddWithValue("@Comment", GetValue(userSchedule.Comment));
                    cmdSchedule.Parameters.AddWithValue("@ERScheduleTypeID", userSchedule.ScheduleTypeID);
                    cmdSchedule.Parameters.AddWithValue("@DaysOfWeek", GetValue(userSchedule.DaysOfWeek));
                    cmdSchedule.Parameters.AddWithValue("@DayOfMonth", GetValue(userSchedule.DaysOfMonth));
                    cmdSchedule.Parameters.AddWithValue("@DayOfQuarter", GetValue(userSchedule.DaysOfQuarter));
                    cmdSchedule.Parameters.AddWithValue("@NextRunScheduled", GetValue(userSchedule.NextRunScheduled));
                    cmdSchedule.Parameters.AddWithValue("@LastRundate", GetValue(userSchedule.LastRundate));
                    cmdSchedule.Parameters.AddWithValue("@LastRunStatus", GetValue(userSchedule.LastRunStatus));
                    cmdSchedule.Parameters.AddWithValue("@LastRunMessage", GetValue(userSchedule.LastRunMessage));
                    cmdSchedule.Parameters.AddWithValue("@UpdateByUserId", userSchedule.UpdateByUserId);
                    cmdSchedule.Parameters.AddWithValue("@ReportLauncherID", GetValue(userSchedule.ReportLauncherID));
                    cmdSchedule.Parameters.AddWithValue("@ReportDelete", userSchedule.ReportDelete);
                    CreateSQLExecuted("usmERReportUserScheduleUpdate", cmdSchedule);

                    cmdSchedule.ExecuteNonQuery();

                    erReportUserScheduleID = (int)cmdSchedule.Parameters["@ERReportUserScheduleID"].Value;

                    //Clear any existing parameters and site map
                    CreateSQLExecuted("usmERReportUserScheduleClear", cmdScheduleClear);
                    cmdScheduleClear.CommandType = CommandType.StoredProcedure;
                    cmdScheduleClear.Parameters.AddWithValue("@ERReportUserScheduleID", erReportUserScheduleID);
                    cmdScheduleClear.ExecuteNonQuery();

                    //Update site map
                    cmdScheduleSiteMap.CommandType = CommandType.StoredProcedure;
                    cmdScheduleSiteMap.Parameters.Add("@ERReportUserScheduleID", SqlDbType.Int);
                    cmdScheduleSiteMap.Parameters.Add("@SiteID", SqlDbType.Int);

                    foreach (var siteMap in userSchedule.ReportSiteMaps)
                    {
                        siteMap.ERReportUserScheduleID = erReportUserScheduleID;
                        cmdScheduleSiteMap.Parameters["@ERReportUserScheduleID"].Value = erReportUserScheduleID;
                        cmdScheduleSiteMap.Parameters["@SiteID"].Value = siteMap.SiteID;

                        CreateSQLExecuted("usmERReportUserScheduleSiteMapUpdate", cmdScheduleSiteMap);
                        cmdScheduleSiteMap.ExecuteNonQuery();
                    }

                    //Update parameters
                    cmdScheduleParameter.CommandType = CommandType.StoredProcedure;
                    cmdScheduleParameter.Parameters.Add("@ERReportUserScheduleID", SqlDbType.Int);
                    cmdScheduleParameter.Parameters.Add("@ERReportParameterID", SqlDbType.Int);
                    cmdScheduleParameter.Parameters.Add("@DisplayTextOverride", SqlDbType.VarChar);
                    cmdScheduleParameter.Parameters.Add("@ParameterValue", SqlDbType.VarChar);
                    foreach (var pararmeter in userSchedule.ReportParameters)
                    {
                        pararmeter.ReportUserScheduleID = erReportUserScheduleID;
                        cmdScheduleParameter.Parameters["@ERReportUserScheduleID"].Value = erReportUserScheduleID;
                        cmdScheduleParameter.Parameters["@ERReportParameterID"].Value = pararmeter.ReportParameterID;
                        cmdScheduleParameter.Parameters["@DisplayTextOverride"].Value = pararmeter.DisplayTextOverride;
                        cmdScheduleParameter.Parameters["@ParameterValue"].Value = pararmeter.ParameterValue;

                        CreateSQLExecuted("usmERReportUserScheduleParameterUpdate", cmdScheduleParameter);

                        cmdScheduleParameter.ExecuteNonQuery();
                    }

                    if (tran.Connection != null)
                    {
                        tran.Commit();
                    }
                }
                catch (Exception ex)
                {
                    if (tran != null)
                    {
                        tran.Rollback();
                    }
                    ex.Data.Add(TSQL, _SQLExecuted);
                    throw ex;
                }
            }

            return erReportUserScheduleID;
        }

        public SaveAndSchedule LoadUserSchedule(int reportScheduleID)
        {
            SaveAndSchedule savedParameters;

            try
            {
                SqlConnection cn = new SqlConnection(this.ConnectionString_WHSE);
                cn.Open();

                SqlCommand cmd = new SqlCommand("usmERReportUserScheduleSelect", cn);
                cmd.CommandType = CommandType.StoredProcedure;
                cmd.Parameters.AddWithValue("@ERReportUserScheduleID", reportScheduleID);

                CreateSQLExecuted("usmERReportUserScheduleSelect", cmd);

                // data set of three tables
                DataSet ds = new DataSet();
                SqlDataAdapter da = new SqlDataAdapter(cmd);

                using (cn)
                using (cmd)
                using (da)
                {
                    da.Fill(ds);
                }

                DataRow drUserSchedule = ds.Tables[0].Rows[0];
                savedParameters = new SaveAndSchedule
                {
                    ReportUserScheduleID = Convert.ToInt32(drUserSchedule["ERReportUserScheduleID"]),
                    ReportID = Convert.ToInt32(drUserSchedule["ERReportID"]),
                    UserID = Convert.ToInt32(drUserSchedule["UserID"]),
                    ReportScheduleStatusID = Convert.ToInt32(drUserSchedule["ERReportScheduleStatusID"]),
                    ReportNameOverride = drUserSchedule["ReportNameOverride"].ToString(),
                    ReportDescription = drUserSchedule["ReportDescription"].ToString(),
                    EmailTo = drUserSchedule["EmailTo"].ToString(),
                    EmailCC = drUserSchedule["CC"].ToString(),
                    EmailBCC = drUserSchedule["BCC"].ToString(),
                    ReplyTo = drUserSchedule["ReplyTo"].ToString(),
                    Subject = drUserSchedule["Subject"].ToString(),
                    RenderFormatTypeID = Convert.ToInt32(drUserSchedule["RenderFormatTypeID"]),
                    Priority = Convert.ToInt32(drUserSchedule["Priority"]),
                    Comment = drUserSchedule["Comment"].ToString(),
                    ScheduleTypeID = Convert.ToInt32(drUserSchedule["ERScheduleTypeID"]),
                    DaysOfWeek = drUserSchedule["DaysOfWeek"].ToString(),
                    DaysOfMonth = GetIntOrNull(drUserSchedule["DayOfMonth"]),
                    DaysOfQuarter = GetIntOrNull(drUserSchedule["DayOfQuarter"]),
                    NextRunScheduled = GetDateOrNull(drUserSchedule["NextRunScheduled"]),
                    LastRundate = GetDateOrNull(drUserSchedule["LastRundate"]),
                    LastRunStatus = GetIntOrNull(drUserSchedule["LastRunStatus"]),
                    LastRunMessage = string.IsNullOrEmpty(drUserSchedule["LastRunMessage"].ToString()) == true ? null : drUserSchedule["LastRunMessage"].ToString(),
                    UpdateByUserId = Convert.ToInt32(drUserSchedule["UpdateByUserId"]),
                    ReportLauncherID = GetIntOrNull(drUserSchedule["ReportLauncherID"]),
                };


                // Site Map
                List<ReportUserScheduleSiteMap> siteMapList = new List<ReportUserScheduleSiteMap>();

                //Assign the site value
                if (ds.Tables[1].Rows.Count > 0)
                {
                    savedParameters.SiteID = Convert.ToInt32(ds.Tables[1].Rows[0]["SiteID"]);
                    foreach (DataRow row in ds.Tables[1].Rows)
                    {
                        siteMapList.Add(new ReportUserScheduleSiteMap
                        {
                            ERReportUserScheduleID = Convert.ToInt32(row["ERReportUserScheduleID"]),
                            SiteID = Convert.ToInt32(row["SiteID"]),
                            ERLevelMapID = Convert.ToInt32(row["ERLevelMapID"]),
                            CreateDate = Convert.ToDateTime(row["CreateDate"]),
                            UpdateDate = Convert.ToDateTime(row["UpdateDate"])
                        });
                    }
                }

                savedParameters.ReportSiteMaps = siteMapList;

                //Load the parameters
                List<ReportUserScheduleParameter> parameterList = new List<ReportUserScheduleParameter>();
                if (ds.Tables[2].Rows.Count > 0)
                {
                    foreach (DataRow row in ds.Tables[2].Rows)
                    {
                        parameterList.Add(new ReportUserScheduleParameter
                        {
                            ReportUserScheduleID = Convert.ToInt32(row["ERReportUserScheduleID"]),
                            ReportParameterID = Convert.ToInt32(row["ERReportParameterID"]),
                            ReportParameterName = row["ParameterName"].ToString(),
                            DisplayTextOverride = row["DisplayTextOverride"].ToString(),
                            ParameterValue = row["ParameterValue"].ToString(),
                            CreateDate = Convert.ToDateTime(row["CreateDate"]),
                            UpdateDate = Convert.ToDateTime(row["UpdateDate"])
                        });
                    }
                }
                savedParameters.ReportParameters = parameterList;
            }
            catch (Exception ex)
            {
                ex.Data.Add(TSQL, _SQLExecuted);
                throw ex;
            }

            return savedParameters;
        }

        private object GetValue(object val)
        {
            return val == null ? DBNull.Value : val;
        }

        /// <summary>
        /// GetDateOrNul: Get a DateTime or null
        /// </summary>
        /// <param name="dt">date object</param>
        /// <returns>DateTime or null</returns>
        private DateTime? GetDateOrNull(object dt)
        {
            if (dt == DBNull.Value)
            {
                return null;
            }
            else
            {
                return Convert.ToDateTime(dt);
            }
        }

        /// <summary>
        /// GetIntOrNull: Get an int or null
        /// </summary>
        /// <param name="i">int object</param>
        /// <returns>int or null</returns>
        private int? GetIntOrNull(object i)
        {
            if (i == DBNull.Value)
            {
                return null;
            }
            else
            {
                return Convert.ToInt32(i);
            }
        }
    }
}