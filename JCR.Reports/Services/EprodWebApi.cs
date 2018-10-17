using System;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Formatting;
using System.Net.Http.Headers;
using System.Text;
using System.Threading.Tasks;
using JCR.Reports.Models;
using JCR.Reports.Common;
using JCR.Reports.ViewModels;
using System.Net;

namespace JCR.Reports.Services
{
    public class EprodWebApi
    {
        public static AccessToken GetAuthenticationToken(string apiUrl, string appID, string appPassword)
        {
            ServicePointManager.SecurityProtocol = SecurityProtocolType.Tls12;
            using (var client = new HttpClient())
            {
                client.BaseAddress = new Uri(string.Concat(apiUrl, "/token"));
                var authorizationHeader = Convert.ToBase64String(Encoding.UTF8.GetBytes(string.Format("{0}:{1}", appID, appPassword)));
                client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Basic", authorizationHeader);

                var form = new Dictionary<string, string>  
               {  
                   {"grant_type", "password"},  
                   {"username", appID},  
                   {"password", appPassword},  
               };

                var tokenResponse = client.PostAsync(apiUrl + "token", new FormUrlEncodedContent(form)).Result;
                var token = tokenResponse.Content.ReadAsAsync<AccessToken>(new[] { new JsonMediaTypeFormatter() }).Result;
                return token;
            };
        }

        public static bool ApplicationEvent(ApplicationEvent appEvent, string apiUrl, string apiAccessToken)
        {
            using (var client = new HttpClient())
            {
                client.BaseAddress = new Uri(apiUrl);
                client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", apiAccessToken);
                var response = client.PostAsJsonAsync("api/ApplicationEvent/UserLogTracking", appEvent).Result;
                return response.IsSuccessStatusCode;
            }
        }
        public static async Task<List<TracersCategory>> GetTracerCategory(int siteId, int programId)
        {
            CheckAPIAccessToken();
            var apiUrl = ConfigurationManager.AppSettings.Get("WebAPI");
            List<TracersCategory> products = new List<TracersCategory>();
            ServicePointManager.SecurityProtocol = SecurityProtocolType.Tls12;
            using (var client = new HttpClient())
            {
                client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", AppSession.AccessToken.ToString());
                var response = client.GetAsync(apiUrl +
                                    string.Format("api/Tracer/SelectTracerCategories?siteId={0}&programId={1}", siteId, programId)).Result;

                if (response.IsSuccessStatusCode)
                {
                    products = await response.Content.ReadAsAsync<List<TracersCategory>>();
                    if (products != null)
                        return products;
                    else
                        return null;
                }
                else
                    return null;
            }

         
        }

        public static async Task<List<Program>> SelectTracerProgramsBySiteAndUser(int userID, int siteID, int cycleID)
        {

            List<Program> rtn = new List<Program>();
            using (var client = new HttpClient())
            {

              CheckAPIAccessToken();
              var apiUrl = ConfigurationManager.AppSettings.Get("WebAPI");
                client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", AppSession.AccessToken.ToString());
                var response = client.GetAsync(apiUrl +
                                    string.Format("api/Tracer/SelectTracerProgramsBySiteAndUser?userID={0}&siteID={1}&cycleID={2}", userID, siteID, cycleID)).Result;

                if (response.IsSuccessStatusCode)
                {
                    rtn = await response.Content.ReadAsAsync<List<Program>>();
                    if (rtn != null)
                        return rtn;
                    else
                        return null;
                }
                else
                    return null;
            }


        }

        //public static async Task<List<ReportDetail>> SelectReporListByProductID(int productID)
        //{

        //    List<ReportDetail> rtn = new List<ReportDetail>();
        //    using (var client = new HttpClient())
        //    {

        //        CheckAPIAccessToken();
        //        var apiUrl = ConfigurationManager.AppSettings.Get("WebAPI");
        //        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", AppSession.AccessToken.ToString());
        //        var response = client.GetAsync(apiUrl +
        //                            string.Format("api/Tracer/GetReportList?productID={0}", productID)).Result;

        //        if (response.IsSuccessStatusCode)
        //        {
        //            rtn = await response.Content.ReadAsAsync<List<ReportDetail>>();
        //            if (rtn != null)
        //                return rtn;
        //            else
        //                return null;
        //        }
        //        else
        //            return null;
        //    }


        //}

        //public static async Task<List<ReportAttributes>> SelectReporAttributesByProductIDReportID(int productID, int? reportID)
        //{

        //    List<ReportAttributes> rtn = new List<ReportAttributes>();
        //    using (var client = new HttpClient())
        //    {

        //        CheckAPIAccessToken();
        //        var apiUrl = ConfigurationManager.AppSettings.Get("WebAPI");
        //        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", AppSession.AccessToken.ToString());
        //        var response = client.GetAsync(apiUrl +
        //                            string.Format("api/Tracer/SelectReportAttributesByProductID?productID={0}&reportID={1}", productID, reportID)).Result;

        //        if (response.IsSuccessStatusCode)
        //        {
        //            rtn = await response.Content.ReadAsAsync<List<ReportAttributes>>();
        //            if (rtn != null)
        //                return rtn;
        //            else
        //                return null;
        //        }
        //        else
        //            return null;
        //    }


        //}
        private static void CheckAPIAccessToken()
        {
            var apiUrl = ConfigurationManager.AppSettings.Get("WebAPI");
           
            if (null == AppSession.AccessToken || string.IsNullOrEmpty(AppSession.AccessToken.Token))
            {
                AppSession.AccessToken = EprodWebApi.GetAuthenticationToken(apiUrl,
                                                                ConfigurationManager.AppSettings.Get("AppID"),
                                                                ConfigurationManager.AppSettings.Get("AppPassword"));
            }

        }

        public static string SaveFileToDatabase(string p1, byte[] p2)
        {

            CheckAPIAccessToken();
            HttpContent fileContent = new ByteArrayContent(p2);

            FileResult fileResult = null;
            using (var client = new HttpClient())
            {
                client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", AppSession.AccessToken.Token.ToString());

                using (var formData = new MultipartFormDataContent())
                {
                    formData.Add(fileContent, "file", p1);

                    //call service
                    var response = client.PostAsync(ConfigurationManager.AppSettings.Get("WebAPI") + "api/Files/SaveFile", formData).Result;

                    if (!response.IsSuccessStatusCode)
                    {
                        throw new Exception();
                    }
                    else
                    {
                        fileResult = response.Content.ReadAsAsync<FileResult>(new[] { new JsonMediaTypeFormatter() }).Result;
                    }
                }
            }

            return fileResult == null ? Guid.Empty.ToString() : fileResult.FileID;
        }

        public static string SaveAttachmentToDatabase(string p1, byte[] p2, string appCode)
        {

            CheckAPIAccessToken();
            HttpContent fileContent = new ByteArrayContent(p2);
            ServicePointManager.SecurityProtocol = SecurityProtocolType.Tls12;
            FileResult fileResult = null;
            using (var client = new HttpClient())
            {
                client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", AppSession.AccessToken.Token.ToString());

                using (var formData = new MultipartFormDataContent())
                {
                    formData.Add(fileContent, "file", p1);

                    //call service
                    var response = client.PostAsync(ConfigurationManager.AppSettings.Get("WebAPI") + "api/Files/SaveAttachmentFile/?appCode=" + appCode, formData).Result;

                    if (!response.IsSuccessStatusCode)
                    {
                        throw new Exception();
                    }
                    else
                    {
                        fileResult = response.Content.ReadAsAsync<FileResult>(new[] { new JsonMediaTypeFormatter() }).Result;
                    }
                }
            }

            return fileResult == null ? Guid.Empty.ToString() : fileResult.FileID;
        }

        public static FileResult RetrieveFile(string guid)
        {

            CheckAPIAccessToken();
            FileResult stream;
            ServicePointManager.SecurityProtocol = SecurityProtocolType.Tls12;
            using (var client = new HttpClient())
            {
                client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", AppSession.AccessToken.Token.ToString());

                using (var formData = new MultipartFormDataContent())
                {

                    //call service
                    var response = client.GetAsync(ConfigurationManager.AppSettings.Get("WebAPI") + string.Format("api/Files/RetrieveFile?fileID={0}", guid)).Result;

                    if (!response.IsSuccessStatusCode)
                    {
                        throw new Exception();
                    }
                    else
                    {

                        if (response.Content.GetType() != typeof(System.Net.Http.StreamContent))
                            throw new Exception();

                        stream = response.Content.ReadAsAsync<FileResult>(new[] { new JsonMediaTypeFormatter() }).Result;
                    }
                }
            }
            return stream;
        }
    }
}
    