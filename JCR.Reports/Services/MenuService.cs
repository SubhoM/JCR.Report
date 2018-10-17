using System;
using System.Linq;
using JCR.Reports.Common;
using System.Data;
using System.Data.SqlClient;
using System.Configuration;
using JCR.Reports.Models;
using System.Net.Http;
using System.Web;
using System.Collections.Generic;

namespace JCR.Reports.Services {
    public class MenuService {

        public void CreateStateWhenLocalDebugIsTrue(int userID) {
            try {
                using (SqlConnection conn = new SqlConnection(ConfigurationManager.ConnectionStrings["DBMEdition01_Write"].ToString())) {
                    SqlCommand cmd = new SqlCommand("apiMenuState_InitLocalDebug", conn);
                    cmd.CommandType = CommandType.StoredProcedure;
                    cmd.Parameters.AddWithValue("@UserID", userID);
                    conn.Open();
                    cmd.ExecuteScalar();
                }
            }
            catch (Exception ex) {
                throw ex;
            }
        }

        public Models.MenuState GetState(int userID, string token) {
            Models.MenuState userMenuState = new MenuState();
            try {
                using (SqlConnection conn = new SqlConnection(ConfigurationManager.ConnectionStrings["DBMEdition01"].ToString())) {
                    SqlCommand cmd = new SqlCommand("apiMenuState_Get", conn);
                    cmd.CommandType = CommandType.StoredProcedure;
                    cmd.Parameters.AddWithValue("@UserID", userID);
                    conn.Open();
                    SqlDataReader reader = cmd.ExecuteReader();
                    if (reader.HasRows) {
                        while (reader.Read()) {
                            userMenuState.UserID               = userID;
                            userMenuState.SiteID               = Convert.ToInt32(reader["SiteID"].ToString());
                            userMenuState.FirstName            = reader["FirstName"].ToString();
                            userMenuState.LastName             = reader["LastName"].ToString();
                            userMenuState.UserLogonID          = reader["UserLogonID"].ToString();
                            userMenuState.SiteName             = reader["SiteName"].ToString();
                            userMenuState.UserRoleID           = Convert.ToInt32(reader["UserRoleID"].ToString());
                            userMenuState.ProgramID            = Convert.ToInt32(reader["ProgramID"].ToString());
                            userMenuState.ProgramName          = reader["ProgramName"].ToString();
                            userMenuState.CertificationItemID  = Convert.ToInt32(reader["CertificationItemID"].ToString());
                            userMenuState.ProgramGroupTypeID   = Convert.ToInt32(reader["ProgramGroupTypeID"].ToString());
                            userMenuState.IsCurrentCycle       = Convert.ToBoolean(reader["IsCurrentCycle"].ToString());
                            userMenuState.CycleEffectiveDate   = reader["CycleEffectiveDate"].ToString();
                            userMenuState.CycleID              = Convert.ToInt32(reader["CycleID"].ToString());
                            userMenuState.MockSurveyTitle      = reader["MockSurveyTitle"].ToString();
                            userMenuState.AccessToEdition      = Convert.ToBoolean(reader["AccessToEdition"].ToString());
                            userMenuState.AccessToAMP          = Convert.ToBoolean(reader["AccessToAMP"].ToString());
                            userMenuState.AccessToTracers      = Convert.ToBoolean(reader["AccessToTracers"].ToString());
                            userMenuState.AccessToERAMP        = Convert.ToBoolean(reader["AccessToERAMP"].ToString());
                            userMenuState.AccessToERTracers    = Convert.ToBoolean(reader["AccessToERTracers"].ToString());
                            userMenuState.AccessToCMS          = Convert.ToBoolean(reader["AccessToCMS"].ToString());
                            userMenuState.AccessToMockSurvey   = Convert.ToBoolean(reader["AccessToMockSurvey"].ToString());
                            userMenuState.UserIsMultiSiteAdmin = Convert.ToBoolean(reader["UserIsMultiSiteAdmin"].ToString());
                        }
                    }
                    reader.Close();
                }
            }
            catch (Exception ex) {
                throw ex;
            }
            return userMenuState;
        }

        public void Save(int userID, string token, Models.MenuState userMenuState) {
            try {
                using (SqlConnection conn = new SqlConnection(ConfigurationManager.ConnectionStrings["DBMEdition01"].ToString())) {
                    SqlCommand cmd = new SqlCommand("apiMenuState_Save", conn);
                    cmd.CommandType = CommandType.StoredProcedure;
                    cmd.Parameters.AddWithValue("@UserID", userID);
                    cmd.Parameters.AddWithValue("@SiteID", userMenuState.SiteID);
                    cmd.Parameters.AddWithValue("@EProductID", userMenuState.EProductID);
                    cmd.Parameters.AddWithValue("@UserRoleID", userMenuState.UserRoleID);
                    cmd.Parameters.AddWithValue("@ProgramID", userMenuState.ProgramID);
                    cmd.Parameters.AddWithValue("@CertificationItemID", userMenuState.CertificationItemID);
                    cmd.Parameters.AddWithValue("@PageID", userMenuState.PageID);
                    cmd.Parameters.AddWithValue("@IsCurrentCycle", userMenuState.IsCurrentCycle);
                    cmd.Parameters.AddWithValue("@MockSurveyTitle", userMenuState.MockSurveyTitle);
                    cmd.Parameters.AddWithValue("@CycleEffectiveDate", userMenuState.CycleEffectiveDate);
                    cmd.Parameters.AddWithValue("@AccessToEdition", userMenuState.AccessToEdition);
                    cmd.Parameters.AddWithValue("@AccessToAMP", userMenuState.AccessToAMP);
                    cmd.Parameters.AddWithValue("@AccessToTracers", userMenuState.AccessToTracers);
                    cmd.Parameters.AddWithValue("@AccessToERAMP", userMenuState.AccessToERAMP);
                    cmd.Parameters.AddWithValue("@AccessToERTracers", userMenuState.AccessToERTracers);
                    cmd.Parameters.AddWithValue("@AccessToCMS", userMenuState.AccessToCMS);
                    cmd.Parameters.AddWithValue("@AccessToMockSurvey", userMenuState.AccessToMockSurvey);
                    cmd.Parameters.AddWithValue("@UserIsMultiSiteAdmin", userMenuState.UserIsMultiSiteAdmin);
                    conn.Open();
                    cmd.ExecuteNonQuery();
                }
            }
            catch (Exception ex) {
                throw ex;
            }
        }

        public void SaveArg(int userID, string key, string value) {
            try {

                

                var APIBaseUrl = ConfigurationManager.AppSettings["JCRAPI"].ToString();
                var JCRAPIToken = AppSession.AuthToken;
                

                using (var httpClient = new System.Net.Http.HttpClient())
                {
                    httpClient.BaseAddress = new Uri(APIBaseUrl);

                    httpClient.DefaultRequestHeaders.Add("token", JCRAPIToken);
                    httpClient.DefaultRequestHeaders.Add("UserId", userID.ToString());
                    



                    var query = "?userId=" + userID.ToString() + "&key=" + key + "&value=" + value;

                    var stringContent = new FormUrlEncodedContent(new[]
                   {
                        new KeyValuePair<string, string>("userId", userID.ToString()),
                        new KeyValuePair<string, string>("key", key),
                        new KeyValuePair<string, string>("value", value)
                    });

                    HttpResponseMessage response = httpClient.PostAsync("MenuInfo/MenuStateSaveArg" + query, stringContent).Result;
                    response.EnsureSuccessStatusCode();
                    
                }
                
                //using (SqlConnection conn = new SqlConnection(ConfigurationManager.ConnectionStrings["DBMEdition01"].ToString())) {
                //    SqlCommand cmd = new SqlCommand("apiMenuState_SaveArg", conn);
                //    cmd.CommandType = CommandType.StoredProcedure;
                //    cmd.Parameters.AddWithValue("@UserID", userID);
                //    cmd.Parameters.AddWithValue("@Key", key);
                //    cmd.Parameters.AddWithValue("@Value", value);
                //    System.Diagnostics.Debug.WriteLine("EXEC apiMenuState_SaveArg @UserID={0}, @Key='{1}', @Value='{2}'", userID, key, value);
                //    conn.Open();
                //    cmd.ExecuteNonQuery();
            
            }
            catch (Exception ex) {
                throw ex;
            }
        }

        //public void RefreshUserMenuState(int userID) {
        //    try {
        //        //using (SqlConnection conn = new SqlConnection(ConfigurationManager.ConnectionStrings["DBMEdition01"].ToString()))
        //        //{
        //        //    SqlCommand cmd = new SqlCommand("apiMenuState_Update", conn);
        //        //    cmd.CommandType = CommandType.StoredProcedure;
        //        //    cmd.Parameters.AddWithValue("@UserID", userID);
        //        //    conn.Open();
        //        //    cmd.ExecuteNonQuery();
        //        //}
        //    }
        //    catch (Exception ex) {
        //        throw ex;
        //    }
        //}
        public void Authenticate(Models.Authentication userAttributes) {
            try {
                using (SqlConnection conn = new SqlConnection(ConfigurationManager.ConnectionStrings["DBAMP"].ToString())) {
                    SqlCommand cmd = new SqlCommand("usmMenuGetDebugToken", conn);
                    cmd.CommandType = CommandType.StoredProcedure;
                    if (userAttributes.LOCALDEBUG) {
                        cmd.Parameters.AddWithValue("@UserLogonID", userAttributes.UserLogonID);
                    } else {
                        cmd.Parameters.AddWithValue("@UserID", userAttributes.UserID);
                    }
            
                    conn.Open();
                    SqlDataReader reader = cmd.ExecuteReader();
                    if (reader.HasRows) {
                        reader.Read();
                        userAttributes.UserID = Convert.ToInt32(reader["UserID"].ToString());
                        userAttributes.AuthToken = reader["AuthToken"].ToString();
                    }
                }
            }
            catch (Exception ex) {
                userAttributes.InError = true;
                userAttributes.ErrorMsg = ex.Message;
            }
        }
    }
}