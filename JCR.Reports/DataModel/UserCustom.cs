using JCR.Reports.Common;
using JCR.Reports.Models;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;
using System.Net.Http;
using System.Web;

namespace JCR.Reports.DataModel
{
    public class UserCustom
    {

        public static User GetUserInfo(int UserID)
        {
            var result = new User();
            using (var dbmeditionEntityContainer = new DBMEdition01_Entities())
            {
                result = dbmeditionEntityContainer.GetUserInfo(UserID).First();
            }

            return result;
        }

        public static List<UserSiteByProduct> GetUserSitesByProdcut(int userID, int productID)
        {
            var result = new List<UserSiteByProduct>();
            using (var dbmEntityContainter = new DBMEdition01_Entities())
            {
                result = dbmEntityContainter.GetUserSitesByProduct(userID, productID).ToList();
            }
            return result;
        }

        public static List<Program> GetProgramBySites(int? SiteID)
        {
            //var result = new List<Programs>();

            //using (var dbmEntityContainter = new DBMEdition01_Entities())
            //{
            //    result = dbmEntityContainter.GetProgrambySites(Convert.ToString(SiteID), null).ToList();
            //}

            List<Program> _programs = null;

            var APIBaseUrl = ConfigurationManager.AppSettings["JCRAPI"].ToString();
            var JCRAPIToken = AppSession.AuthToken;
            var userID = AppSession.UserID.ToString();

            using (var httpClient = new System.Net.Http.HttpClient())
            {
                httpClient.BaseAddress = new Uri(APIBaseUrl);

                httpClient.DefaultRequestHeaders.Add("token", JCRAPIToken);
                httpClient.DefaultRequestHeaders.Add("UserId", userID);

                HttpResponseMessage response = httpClient.GetAsync("GetCommonInfo/GetProgramsBySite?siteID=" + SiteID).Result;

                if (response.IsSuccessStatusCode)
                {
                    //_programs = Newtonsoft.Json.JsonConvert.DeserializeObject<List<Program>>(response.Content.ReadAsStringAsync().Result);

                    _programs = response.Content.ReadAsAsync<List<Program>>().Result;
                }

            }

            return _programs;
           
        }
        public static bool GetLicenseDetailsForCMS(int SiteID, int ProgramID, int SubscriptionTypeID)
        {
            bool result = false;

            using (var dbmEntityContainter = new DBMEdition01_Entities())
            {
                result = (bool)dbmEntityContainter.GetLicenseDetailsForCMS(SiteID, ProgramID, SubscriptionTypeID).FirstOrDefault();
            }

            return result;
        }
        public static bool GetLicenseDetailsForCMSByUser(int userID, int SubscriptionTypeID)
        {
            bool result = false;

            using (var dbmEntityContainter = new DBMEdition01_Entities())
            {
                result = (bool)dbmEntityContainter.GetLicenseDetailsForCMSByUser(userID, SubscriptionTypeID).FirstOrDefault();
            }

            return result;
        }

        public static List<CMSSite> GetCMSSitesByProgramID(int ProgramID, int SubscriptionTypeID)
        {
            var result = new List<CMSSite>();

            using (var dbmEntityContainter = new DBMEdition01_Entities())
            {
                result = dbmEntityContainter.GetCMSSitesByProgramID(ProgramID, SubscriptionTypeID).ToList();
            }

            return result;
        }
        public static List<CMSProgram> GetCMSProgramsBySiteID(int SiteID, int SubscriptionTypeID)
        {
            var result = new List<CMSProgram>();

            using (var dbmEntityContainter = new DBMEdition01_Entities())
            {
                result = dbmEntityContainter.GetCMSProgramsBySiteID(SiteID, SubscriptionTypeID).ToList();
            }

            return result;
        }
        public static List<CoP> GetCoPsByProgramID(string ProgramIDs)
        {
            var result = new List<CoP>();

            using (var dbmEntityContainter = new DBMEdition01_Entities())
            {
                result = dbmEntityContainter.GetCoPsByProgramID(ProgramIDs).ToList();
            }

            return result;
        }
        public static List<Tag> GetTagsByProgramIDAndCoPID(string ProgramIDs, string CoPIDs)
        {
            var result = new List<Tag>();

            using (var dbmEntityContainter = new DBMEdition01_Entities())
            {
                result = dbmEntityContainter.GetTagsByProgramIDAndCoPID(ProgramIDs, CoPIDs).ToList();
            }

            return result;
        }
        public static List<IdentifiedUser> GetIdentifiedUsers(string siteIDs, string programIDs, string coPIDs, string tagIDs)
        {
            var result = new List<IdentifiedUser>();

            using (var dbmEntityContainter = new DBMEdition01_Entities())
            {
                result = dbmEntityContainter.GetIdentifiedUsers(siteIDs, programIDs, coPIDs, tagIDs).ToList();
            }

            return result;
        }

    }
}