using JCR.Reports.Models;
using JCR.Reports.Models.Enums;
using JCR.Reports.Services;
using System;
using System.Configuration;
using System.Linq;
using System.Net;

namespace JCR.Reports.Common
{
    public class WebApiMethods
    {
        public static bool AddSiteLoginApplicationEvent(int selectedSiteID)
        {
            return AddApplicationEvent(selectedSiteID, ActionTaken.SiteLogin);
        }

        public static bool AddReportAccessApplicationEvent(int selectedSiteID, ActionTaken reportAccessed)
        {
            return AddApplicationEvent(selectedSiteID, reportAccessed);
        }

        public static bool AddApplicationEvent(int selectedSiteID, ActionTaken actionTaken)
        {
            try
            {
                ServicePointManager.SecurityProtocol = SecurityProtocolType.Tls12;
                var apiUrl = ConfigurationManager.AppSettings.Get("WebAPI");
                if (null == AppSession.AccessToken || string.IsNullOrEmpty(AppSession.AccessToken.Token))
                {
                    AppSession.AccessToken = EprodWebApi.GetAuthenticationToken(apiUrl,
                                                                    ConfigurationManager.AppSettings.Get("AppID"),
                                                                    ConfigurationManager.AppSettings.Get("AppPassword"));
                }
                ApplicationEvent appEvent = new ApplicationEvent()
                {
                    UserId = (int)AppSession.UserID,
                    SiteId = selectedSiteID,
                    ProgramId = AppSession.SelectedProgramId,
                    EproductId = (int)EProductType.Reports,
                    ActionTypeId = (int)actionTaken
                };

                return EprodWebApi.ApplicationEvent(appEvent, apiUrl, AppSession.AccessToken.Token);
            }
            catch(Exception ex)
            {
                if (ex.Message.ToString() != "No Data" && ex.Message.ToString() != "Limit")
                {
                    ExceptionLog exceptionLog = new ExceptionLog
                    {
                        ExceptionText = "Reports: " + ex.Message,
                        PageName = "WebApiMethods.cs",
                        MethodName = "AddApplicationEvent",
                        UserID = Convert.ToInt32(AppSession.UserID),
                        SiteId = Convert.ToInt32(AppSession.SelectedSiteId),
                        TransSQL = "",
                        HttpReferrer = null
                    };
                    ExceptionService _exceptionService = new ExceptionService();
                    _exceptionService.LogException(exceptionLog);
                }
            }
            return false;
        }
    }
}