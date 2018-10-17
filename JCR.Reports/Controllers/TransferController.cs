using System;
using System.Linq;
using System.Web.Mvc;
using System.Configuration;
using JCR.Reports.Common;
using System.Text;
using System.Globalization;
using JCR.Reports.Models;
using JCR.Reports.Services;
using JCR.Reports.Models.Enums;
using System.Collections.Generic;

namespace JCR.Reports.Controllers
{
    public class TransferController : Controller
    {
        ExceptionService exceptionService = new ExceptionService();

        /// <summary>
        /// Index: Entry point - Confirm access, Setup session and variables, etc.
        /// </summary>
        /// <returns>Redirect</returns>
        public ActionResult Index()
        {
            try
            {
                Security.SetUpSession();

                if (AppSession.HasValidSession) {
                    if (AppSession.DirectView != null) {
                        return RedirectToAction(AppSession.DirectView, "Home", new { area = FindArea() });
                    } else {
                        return RedirectToAction("Index", "Home", new { area = FindArea() });
                    }
                }

                // return to portal
                return Redirect(ConfigurationManager.AppSettings["JcrPortalUrl"].ToString());
            }
            catch (Exception ex)
            {
                ExceptionLog exceptionLog = new ExceptionLog 
                {
                    ExceptionText = "Reports: " + ex.Message,
                    PageName = "TransferController",
                    MethodName = "Index",
                    UserID = Convert.ToInt32(AppSession.UserID),
                    SiteId = Convert.ToInt32(AppSession.SelectedSiteId),
                    TransSQL = "",
                    HttpReferrer = null
                };


                exceptionService.LogException(exceptionLog);

                return RedirectToAction("Error", "Transfer");
            }
        }

        public ActionResult IndexCorp()
        {
            try
            {

                Security.SetUpSession();

                if (AppSession.HasValidSession)
                {
                    return RedirectToAction("Index", "Home", new { area = FindArea() });
                }


                // return to portal
                return Redirect(ConfigurationManager.AppSettings["JcrPortalUrl"].ToString());
            }
            catch (Exception)
            {

                return RedirectToAction("Error", "Transfer");
            }
        }

        private string FindArea() {
            var areaType = string.Empty;

            switch (AppSession.LinkType) {
                case 11:
                    areaType = "Corporate";
                    break;

                case 5:
                    areaType = "Tracer";
                    break;

                case 10:
                    areaType = "TracerER";
                    break;
            }
            return areaType;
        }

        public ActionResult RedirectToApp()
        {
            try
            {
                if (AppSession.HasValidSession)
                {
                    return RedirectToAction("Index", "Home", new { area = FindArea() });
                }
                else
                {
                    return RedirectToAction("Error", "Transfer");
                }
            }
            catch (Exception)
            {
                return RedirectToAction("Error", "Transfer");
            }
        }

        public void RedirectToWebApp(string webApp, int pageID, string searchstring) {
            try {
                string productUrl = string.Empty;
                string plainText = string.Format("UserID|{0}|Token|{1}|PageID|{2}|AdminUserID|{3}|UserOriginalRoleID|{4}|SearchString|{5}|currentUTCtime|{6}", 
                    AppSession.UserID, 
                    AppSession.AuthToken, 
                    pageID, 
                    AppSession.AdminUserID,
                    AppSession.UserOriginalRoleID,
                    searchstring,
                    DateTime.UtcNow.ToString(CultureInfo.InvariantCulture)); 

                if (AppSession.HasValidSession) {
                    switch (webApp.ToLower()) {
                        case "tracers":
                            productUrl = ConfigurationManager.AppSettings["TracersUrl"];
                            break;
                        case "amp":
                            productUrl = ConfigurationManager.AppSettings["AmpUrl"];
                            break;
                        case "admin":
                            productUrl = ConfigurationManager.AppSettings["AdminUrl"];
                            break;
                    }

                    // System.Diagnostics.Debug.WriteLine(string.Format("{0}?FromProduct={1}", productUrl, plainText));
                    // Example URL created above:
                    // http://localhost:8284/Transfer/Index?FromProduct=UserID|100106|Token|0e5f063e-a5e9-43a0-9d56-30436278918c|PageID|31|AdminUserID|178276|UserOriginalRoleID|5|currentUTCtime|10/20/2017 17:53:34

                    string url = string.Format("{0}?FromProduct={1}", productUrl, CryptHelpers.Encrypt(plainText, WebConstants.ENCRYPT_KEY));
                    Response.Redirect(url);
                }
            }
            catch (Exception ex) {
                throw (ex);
            }
        }

        public ActionResult IndexER()
        {
            try
            {
                
                Security.SetUpSession(true);

                if (AppSession.HasValidSession)
                {
                    return RedirectToAction("Index", "Home", new { area = FindArea() });
                }
                // return to portal
                return Redirect(ConfigurationManager.AppSettings["JcrPortalUrl"].ToString());
            }
            catch (Exception)
            {
                return RedirectToAction("Error", "Transfer");
            }
        }        

        /// <summary>
        /// Portal 
        /// </summary>
        /// <returns>redirects to portal</returns>
        public ActionResult Portal()
        {
            string url = string.Format("{0}?FromProduct={1}",
                ConfigurationManager.AppSettings["JcrPortalUrl"],
                CryptHelpers.Encrypt(AppSession.UserID + "|" + ((int)AppSession.SelectedSiteId).ToString(),
                    WebConstants.ENCRYPT_KEY));

            //AppSession.AbandonSession();
            return Redirect(url);
        }
        
        [SessionExpireFilter]
        public ActionResult AppRedirect(string pageName) {
            int pageID     = (int)Enum.Parse(typeof(ApplicationPage), pageName);
            string appurl  = string.Empty;
            string url     = string.Empty;
            int eProductID = 0;

            var menuService = new Services.MenuService();
            menuService.SaveArg(AppSession.UserID.GetValueOrDefault(), "PageID", pageID.ToString());

            if (AppSession.HasValidSession) {
                switch (pageName) {
                    case "Assignment":
                    case "BulkReAssign":
                    case "BulkUpdatePOA":
                    case "BulkUpdateScore":
                    case "CMSScoring":
                    case "CorporateFindingsEdit":
                    case "DocumentationAnalyzer":
                    case "EPAttributeFilter":
                    case "FSA":
                    case "MockSurveyDashBoard":
                    case "MockSurveyScoring":
                    case "RFI":
                    case "ScoreAnalyzer":
                    case "ServiceProfile":
                    case "StandardsAndScoring":
                    case "SystemSurveySetting":
                    case "UserSiteMaintenance": {
                            appurl = ConfigurationManager.AppSettings["AMPUrl"].ToString();
                            eProductID = 1;  // In DBAMP.dbo.EProduct table, AMP has EProductID equal to 1.
                            break;
                        }
                    case "CopyTracertoOtherSites":
                    case "CreateNewCMSTracer":
                    case "CreateNewTJCTracer":
                    case "CreateNewTracer":
                    case "DeleteTracerfromOtherSites":
                    case "DepartmentMaintenance":
                    case "EPsNotReferenced":
                    case "GlobalAdminTracersHomePage":
                    case "GuestAccessHomePage":
                    case "JCRTemplatesAffectedbyCriticalChangesinLatestCycle":
                    case "StandardEPChangesinAllCycles":
                    case "StandardEPChangesinLatestCycle":
                    case "TaskAssignments":
                    case "TracerHomePage": {
                            appurl = ConfigurationManager.AppSettings["TracersUrl"].ToString();
                            eProductID = 2;  // In DBAMP.dbo.EProduct table, Tracers has EProductID equal to 2.
                            break;
                        }
                }
                menuService.SaveArg(AppSession.UserID.GetValueOrDefault(), "EProductID", eProductID.ToString());
                url = string.Format("{0}?userid={1}&token={2}", appurl, AppSession.UserID, AppSession.AuthToken);
            } else {
                url = ConfigurationManager.AppSettings["JcrPortalUrl"].ToString() + "?qs=1";
            }
            return Redirect(url);
        }

        /// <summary>
        /// TimeoutRedirect
        /// </summary>
        /// <returns>redirect to portal</returns>
        public ActionResult TimeoutRedirect()
        {
            string url = ConfigurationManager.AppSettings["JcrPortalUrl"].ToString() + "?qs=1";
            return Redirect(url);
        }

        /// <summary>
        /// TimeoutRedirect
        /// </summary>
        /// <returns>redirect to portal</returns>
        public ActionResult HelpRedirect()
        {
            // string url = ConfigurationManager.AppSettings["JcrPortalUrl"].ToString() + "?qs=1";
            //  return Redirect("/ReportHelp/_ReportHelp");
            return View("ReportHelp/_ReportHelp");
        }

        /// <summary>
        /// LogoutRedirect
        /// </summary>
        /// <returns>redirect to portal</returns>
        public ActionResult LogoutRedirect()
        {
            var url = ForwardOntoNextApp();
            if (AppSession.HasValidSession)
                AppSession.AbandonSession();
            return Redirect(url);
        }

        public string ForwardOntoNextApp()
        {

            string url = ConfigurationManager.AppSettings["JcrPortalUrl"].ToString() + "?qs=0";
            if (!AppSession.HasValidSession)
                return url;

            CommonService commonservice = new CommonService();

            var ds = commonservice.SelectUserSecurityAttribute((int)AppSession.UserID, 330);
            var apps = string.Empty;

            if (ds.Tables.Count > 0 && ds.Tables[0].Rows.Count > 0)
            {

                apps = ds.Tables[0].Rows[0]["AttributeValue"].ToString();

                var appsList = apps.Length > 0 ? apps.Split(',').Select(int.Parse).ToList() : new List<int>();

                if (appsList.Count > 0)
                {                    
                    if (appsList.Contains(11))
                        appsList.Remove(11);
                    
                    var nextApp = appsList.Count > 0 ? appsList[0] : 0;

                    commonservice.UpdateUserSecurityAttribute((int)AppSession.UserID, 330,
                        String.Join(",", appsList.Select(x => x.ToString()).ToArray()), DateTime.Today, DateTime.Today);

                    Uri myUri = null;
                    switch (nextApp)
                    {
                        //AMP
                        case 1:
                            myUri = new Uri(ConfigurationManager.AppSettings["AmpUrl"]);
                            url = string.Format("{1}://{0}/Transfer/LogoutRedirect", myUri.Authority, myUri.Scheme);
                            break;
                        //Tracers
                        case 2:
                            myUri = new Uri(ConfigurationManager.AppSettings["TracersUrl"]);
                            url = string.Format("{1}://{0}/Transfer/LogoutRedirect", myUri.Authority, myUri.Scheme);
                            break;
                        //Edition
                        case 3:
                            myUri = new Uri(ConfigurationManager.AppSettings["E-DitionUrl"]);
                            url = string.Format("{1}://{0}/Logoff.aspx", myUri.Authority, myUri.Scheme);
                            break;
                        //Portal
                        case 10:
                            myUri = new Uri(ConfigurationManager.AppSettings["JcrPortalUrl"]);
                            url = string.Format("{1}://{0}/Logout.aspx", myUri.Authority, myUri.Scheme);
                            break;
                        //Admin
                        case 15:
                            myUri = new Uri(ConfigurationManager.AppSettings["AdminUrl"]);
                            url = string.Format("{1}://{0}/Logout.aspx", myUri.Authority, myUri.Scheme);
                            break;
                        default:
                            break;
                    }

                }
            }

            return url;
        }

        /// <summary>
        /// KeepAlive: ajax call to keep the session alive on user action
        /// </summary>
        public void KeepAlive()
        {
            Session["KeepAlive"] = true;
            return;
        }

        /// <summary>
        /// Error view
        /// </summary>
        /// <returns>View</returns>
        public ActionResult Error()
        {


            if (AppSession.HasValidSession)
            {
                if (AppSession.LinkType == (int)WebConstants.LinkType.EnterpriseReportTracers)
                {
                    ViewBag.ERReports = true;
                }
                else
                {
                    ViewBag.ERReports = false;
                }
            }

            return View("Error/Error");
        }

        /// <summary>
        /// Portal 
        /// </summary>
        /// <returns>redirects to portal</returns>
        [SessionExpireFilter]
        public ActionResult AdminRedirect() {
            // int pageID = (int)Enum.Parse(typeof(ApplicationPage), pageName);
            string url = "";
            if (AppSession.HasValidSession) {
                var linkType = ((int)WebConstants.LinkType.AmpHome).ToString();
                var appurl   = ConfigurationManager.AppSettings["AdminUrl"].ToString();
                var fromType = "FromPortal";

                var sbQueryString = new StringBuilder();

                sbQueryString.Append(ProductQueryStringKey.LinkType);
                sbQueryString.Append("|");
                sbQueryString.Append(linkType);
                sbQueryString.Append("|");
                sbQueryString.Append(ProductQueryStringKey.UserName);
                sbQueryString.Append("|");
                sbQueryString.Append(AppSession.EmailAddress);
                sbQueryString.Append("|");
                sbQueryString.Append(ProductQueryStringKey.SelectedSiteID);
                sbQueryString.Append("|");
                sbQueryString.Append(((int)AppSession.SelectedSiteId).ToString());
                sbQueryString.Append("|");
                sbQueryString.Append(ProductQueryStringKey.SelectedSiteName);
                sbQueryString.Append("|");
                sbQueryString.Append(AppSession.SelectedSiteName);
                sbQueryString.Append("|");
                sbQueryString.Append(ProductQueryStringKey.SelectedProgramID);
                sbQueryString.Append("|");

                sbQueryString.Append(AppSession.SelectedProgramId);

                sbQueryString.Append("|");
                sbQueryString.Append(ProductQueryStringKey.SelectedProgramName);
                sbQueryString.Append("|");
                sbQueryString.Append(AppSession.SelectedProgramName);
                sbQueryString.Append("|");
                sbQueryString.Append(ProductQueryStringKey.SelectedCertificationItemID);
                sbQueryString.Append("|");
                sbQueryString.Append(AppSession.SelectedCertificationItemID);
                sbQueryString.Append("|");
                sbQueryString.Append(ProductQueryStringKey.UserID);
                sbQueryString.Append("|");
                sbQueryString.Append(AppSession.UserID);
                sbQueryString.Append("|");
                sbQueryString.Append(ProductQueryStringKey.RoleID);
                sbQueryString.Append("|");
                sbQueryString.Append(AppSession.RoleID.ToString());
                sbQueryString.Append("|");
                sbQueryString.Append(ProductQueryStringKey.currentUTCtime);
                sbQueryString.Append("|");
                sbQueryString.Append(DateTime.UtcNow.ToString(CultureInfo.InvariantCulture));
                sbQueryString.Append("|");
                sbQueryString.Append(ProductQueryStringKey.PageID);
                sbQueryString.Append("|");
                sbQueryString.Append((int)ApplicationPage.AccessDenied);
                sbQueryString.Append("|");
                sbQueryString.Append(ProductQueryStringKey.CycleID);
                sbQueryString.Append("|");
                sbQueryString.Append(((int)AppSession.CycleID).ToString());
                sbQueryString.Append("|");
                sbQueryString.Append(ProductQueryStringKey.UserOriginalRoleID);  // When GAdmin is logged-in as customer, this value is 5.
                sbQueryString.Append("|");
                sbQueryString.Append(AppSession.UserOriginalRoleID);
                sbQueryString.Append("|");
                sbQueryString.Append(ProductQueryStringKey.UserOriginalID);  // When GAdmin is morlando@gadmin.com, logged-in as customer, this value is 178276
                sbQueryString.Append("|");
                sbQueryString.Append(AppSession.AdminUserID);
                sbQueryString.Append("|");
                sbQueryString.Append(ProductQueryStringKey.IsAdmin);
                sbQueryString.Append("|");
                sbQueryString.Append("Admin");

                // If Global Admin logged-in as customer and went from AMP to Reports and now wants to go to Global Admin, here's what 
                // the Querystring might look like:
                // http://localhost:44444/Login.aspx?FromPortal=LinkType|1|UserName|Denise.Lord@va.gov|SelectedSiteID|681|SelectedSiteName|Edith Nourse Rogers Memorial Veterans Hospital|SelectedProgramID|2|SelectedProgramName|Hospital|SelectedCertificationItemID|0|UserID|100106|RoleID|1|currentUTCtime|11/27/2017 20:47:36|PageID|18|CycleID|22|UserOriginalRoleID|5|UserOriginalID|178276|IsAdmin|Admin
                // System.Diagnostics.Debug.WriteLine(string.Format("{0}?{1}={2}", appurl, fromType, sbQueryString.ToString()));
                // System.Diagnostics.Debug.WriteLine("pause");

                url = string.Format("{0}?{1}={2}",
                                     appurl, fromType,
                                      CryptHelpers.Encrypt(sbQueryString.ToString(),
                                      WebConstants.ENCRYPT_KEY));
            }
            else {
                url = ConfigurationManager.AppSettings["JcrPortalUrl"].ToString() + "?qs=1";
            }

            //AppSession.AbandonSession();
            return Redirect(url);
        }
    }
}