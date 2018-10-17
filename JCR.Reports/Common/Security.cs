using System;
using System.Collections.Generic;
using System.Collections.Specialized;
using System.Configuration;
using System.Globalization;
using System.Linq;
using System.Security.Cryptography;
using System.IO;
using System.Text;
using System.Web;
using JCR.Reports.DataModel;
using JCR.Reports.Models;
using JCR.Reports.Services;
namespace JCR.Reports.Common {
    public enum ProductQueryStringKey
    {
        LinkType,
        UserName,
        ReportName,
        SelectedSiteID,
        SelectedSiteName,
        SelectedProgramID,
        SelectedProgramName,
        SelectedCertificationItemID,
        UserID,
        RoleID,
        DirectView,
        currentUTCtime,
        PageID,
        CycleID,
        UserOriginalRoleID,
        UserOriginalID,
        IsAdmin
    }
   
    public enum QueryStringValue
    {
        LogOut = 0,
        TimeOut = 1
    }

    public static class Security {

        public static bool AmpAccess()
        {
            CommonService commonService = new CommonService();
            bool ampAccess = commonService.CheckAMPAccess();
            return ampAccess;
        }

        public static void SetUpSession(bool fromportal = false, Models.Authentication objAuthenticationUser = null) {
            try {
                var ProductParamDictionary    = new StringDictionary();
                var objUser                   = new Models.Authentication();
                var menuService               = new Services.MenuService();
                bool LOCALDEBUG               = false;
                string fromProduct            = null;
                string decryptedProductParams = null;                

                LOCALDEBUG = Convert.ToBoolean(ConfigurationManager.AppSettings["LOCALDEBUG"]);
       
                if (LOCALDEBUG == false) {

                    if (HttpContext.Current.Request.QueryString["FromPortal"] != null) {
                        fromProduct = HttpContext.Current.Request.QueryString["FromPortal"];
                    }

                    if (HttpContext.Current.Request.QueryString["FromProduct"] != null) {
                        fromProduct = HttpContext.Current.Request.QueryString["FromProduct"];
                    }

                    if (fromProduct == null) {
                        return;
                    }

                    // When decrypted, the decryptProductParams variable looks like this:
                    // UserID|100106|Token|479bb3e7-079a-4a97-950f-41da256c6928|PageID|14|currentUTCtime|09/25/2017 19:56:41
                    decryptedProductParams = CryptHelpers.Decrypt(fromProduct, WebConstants.ENCRYPT_KEY);
                    
                    using (IEnumerator<string> enumerator = decryptedProductParams.Split('|').AsEnumerable().GetEnumerator()) {
                        while (enumerator.MoveNext()) {
                            string first = enumerator.Current;
                            if (!enumerator.MoveNext()) {
                                break;
                            }
                            ProductParamDictionary.Add(first, enumerator.Current);
                        }
                    }

                    objUser.UserID = Convert.ToInt32(ProductParamDictionary["UserID"]);
                    objUser.AuthToken = ProductParamDictionary["Token"];
                    objUser.PageID = Convert.ToInt32(ProductParamDictionary["PageID"]);
                    objUser.AdminUserID = Convert.ToInt32(ProductParamDictionary["AdminUserID"]);

                    #region Process currentUTCtime from Querystring. If currentUTCtime not found, log exception & redirect request to login.

                    if (ProductParamDictionary[ProductQueryStringKey.currentUTCtime.ToString()] != null) {
                        var ProductUtCtime = Convert.ToDateTime(ProductParamDictionary[ProductQueryStringKey.currentUTCtime.ToString()]);
                        var currentUtCtime = DateTime.UtcNow.ToString(CultureInfo.InvariantCulture);

                        // 5 minute check between servers
                        if ((DateTime.Parse(currentUtCtime.ToString(CultureInfo.InvariantCulture)))
                                .Subtract(DateTime.Parse(ProductUtCtime.ToString(CultureInfo.InvariantCulture)))
                                .Seconds > 300) {
                            if (Convert.ToBoolean(ConfigurationManager.AppSettings["PortalRedirect"])) {
                                HttpContext.Current.Response.Redirect(string.Format("Transfer.aspx?qs={0}", (int) QueryStringValue.TimeOut), false);
                                HttpContext.Current.Response.End();
                            }
                        }
                    } else {
                        // =================================================================================================
                        // If currentUTCtime KVP not found, log error in ExceptionLog and reroute user to login screen.
                        // =================================================================================================
                        ExceptionService exceptionService = new ExceptionService();
                        ExceptionLog exLog = new ExceptionLog();
                        exLog.ExceptionText = "KVP currentUTCtime missing from ecrypted querystring.";
                        exLog.PageName = "JCR.Reports.Common.Security.cs";
                        exLog.MethodName = "SetUpSession";
                        exLog.UserID = objUser.UserID;
                        exLog.SiteId = 0;
                        exLog.TransSQL = string.Format("Unencrypted Querystring: {0}", decryptedProductParams);
                        exLog.HttpReferrer = null;
                        exceptionService.LogException(exLog);
                        HttpContext.Current.Response.Redirect("~/Transfer/LogoutRedirect");
                    }

                    #endregion

                    // Mark Orlando 10/18/2017. When AMP is called from AdminTool, UserOriginalRoleID KVP will contain 5 aka Global Admin.
                    // If UserOriginalRoleID is 5, then AdminTool will pass AMP the GA's User ID in UserOriginalRoleID KVP.
                    // Default values of 0 indicate the real user is not GA, but rather a customer.
                    // When GAdmin logged-in as customer and went from AMP to Reports here's what Querystring looked like:
                    // UserID|100106|Token|28D07930-AF85-42CE-A80D-17CF51DDAF13|PageID|48|AdminUserID|123316|UserOriginalRoleID|5|currentUTCtime|11/27/2017 20:41:25
                    if (ProductParamDictionary["UserOriginalRoleID"] != null) {
                        objUser.UserOriginalRoleID = Convert.ToInt32(ProductParamDictionary["UserOriginalRoleID"]);
                        objUser.AdminUserID = Convert.ToInt32(ProductParamDictionary["AdminUserID"]);
                    }
                } else {
                    // Susan Easter has access to 10 sites, each of which has access to AMP & Tracers...except site 4758
                    // For this site, she has access to AMP, but not Tracers: Michael E. DeBakey VA MC Opioid Treatment Program


                    //objUser.UserLogonID = "susan.easter@va.gov";
                    //objUser.UserLogonID = "pgarg@jcrinc.com";
                    //objUser.UserLogonID = "srangara@jcaho.net";
                    //objUser.UserLogonID = "nsohal@jcrinc.com";
                    //objUser.UserLogonID = "denise.lord@va.gov";
                    //objUser.UserLogonID = "pweissman@lifespan.org";
                    //objUser.UserLogonID = "pskukas@jcrinc.com";
                    //objUser.UserLogonID = "ashrestha@jcrinc.com";
                    // objUser.UserLogonID = "morlando@gadmin.com";
                    //objUser.UserLogonID = "lucinda.witt@hcahealthcare.com";
                    //objUser.UserLogonID = "darlene.luttman@tenethealth.com";
                    //objUser.UserLogonID = "pdumler@umm.edu";
                    //objUser.UserLogonID = "sswarts@jcrinc.com";
                    // objUser.UserLogonID = "nsohal@jcrinc.com";
                    // objUser.UserLogonID = "maryjane.allen@va.gov";  // Staff Member
                    // objUser.UserLogonID = "speedy@jcrinc.com";      // Site Manager
                    // objUser.UserLogonID = "ksultz@jcrinc.com";
                    // objUser.UserLogonID = "twostrange2000@yahoo.com";
                    objUser.UserLogonID = "Autumn.Schwartz@EssentiaHealth.org";

                    //objUser.PageID = 14;      // PageID 14 is 'Reports Menu|Compliance'  aka AMP    
                    objUser.PageID = 48;      // PageID 48 is 'Reports Menu|Tracers'    
                    //objUser.PageID = 49;      // PageID 49 is 'Reports Menu|ER Tracers'    
                }

                if (objAuthenticationUser != null)
                    objUser = objAuthenticationUser;

                menuService.Authenticate(objUser);

                if (objUser.InError) {
                    HttpContext ctx = HttpContext.Current;
                    ctx.Response.Redirect("~/Transfer/Error");
                } else {
                    if (LOCALDEBUG) {
                        menuService.CreateStateWhenLocalDebugIsTrue(objUser.UserID);
                    }
                    AppSession.CreateSession();
                    AppSession.UserID             = objUser.UserID;
                    AppSession.AuthToken          = objUser.AuthToken;
                    AppSession.PageID             = objUser.PageID;
                    AppSession.AdminUserID        = objUser.AdminUserID;
                    AppSession.UserOriginalRoleID = objUser.UserOriginalRoleID;
                    AppSession.WebApiUrl = ConfigurationManager.AppSettings["JCRAPI"].ToString();

                    var menuState = menuService.GetState(AppSession.UserID.GetValueOrDefault(), AppSession.AuthToken);

                    AppSession.EmailAddress        = menuState.UserLogonID;
                    AppSession.FirstName           = menuState.FirstName;
                    AppSession.LastName            = menuState.LastName;
                    AppSession.FullName            = String.Format("{0} {1}", menuState.FirstName, menuState.LastName);
                    AppSession.RoleID              = menuState.UserRoleID;
                    AppSession.SelectedSiteId      = menuState.SiteID;
                    AppSession.SelectedSiteName    = menuState.SiteName;
                    AppSession.SelectedProgramId   = menuState.ProgramID;
                    AppSession.SelectedProgramName = menuState.ProgramName;
                    AppSession.CycleID             = menuState.CycleID;
                    AppSession.IsCorporateSite     = menuState.AccessToMockSurvey;
                    AppSession.ProgramGroupTypeID  = menuState.ProgramGroupTypeID;
                    AppSession.IsCMSProgram        = menuState.AccessToCMS;
                    AppSession.HasTracersAccess    = menuState.AccessToTracers;
                    AppSession.SelectedCertificationItemID = menuState.CertificationItemID;

                    if (AppSession.SelectedCertificationItemID > 0) {
                        var lstPrograms = UserCustom.GetProgramBySites(AppSession.SelectedSiteId);
                        if (lstPrograms != null && lstPrograms.Count > 0) {
                            var queryBaseProgramID = lstPrograms.Where(prg => prg.ProgramID == AppSession.SelectedProgramId && prg.AdvCertListTypeID == AppSession.SelectedCertificationItemID).FirstOrDefault();

                            if (queryBaseProgramID != null)
                                AppSession.SelectedProgramId = (int)queryBaseProgramID.BaseProgramID;
                        }
                    }

                    switch (AppSession.PageID) {
                        case 50:       // PageID 50 is My Saved Reports ● Tracers
                        case 15:       // PageID 15 is is My Saved Reports ● Compliance
                        case 51:       // PageID 51 is is My Saved Reports ● ER Tracers
                            AppSession.DirectView = "MyReports";
                            break;
                        case 52:       // PageID 52 is My Site's Saved Reports ● Tracers
                        case 16:       // PageID 16 is My Site's Saved Reports ● Compliance
                        case 53:       // PageID 53 is My Site's Saved Reports ● ER Tracers
                            AppSession.DirectView = "SearchReports";
                            break;
                    }

                    var commonService = new CommonService();

                    SearchInputService searchInputService = new SearchInputService();

                    AppSession.CycleID = commonService.GetLatestCycleByProgram(AppSession.SelectedProgramId).CycleID;

                    //if (AppSession.LinkType != 11) {
                    //    AppSession.Sites = searchInputService.SelectTracerSitesByUser(Convert.ToInt32(AppSession.UserID));
                    //    AppSession.CycleID = commonService.GetLatestCycleByProgram(AppSession.SelectedProgramId).CycleID;
                    //} else {
                     //   var SiteList = CorporateFinding.GetSitesByUser(Convert.ToInt32(AppSession.UserID)).Select(x => new UserSite() { SiteID = x.SiteID, SiteName = x.SiteName, RoleID = x.RoleID, SiteFullName = x.SiteFullName, IsCorporateAccess = x.IsCorporateAccess }).ToList();
                    //    AppSession.Sites = SiteList;
                    //}

                    //if (AppSession.Sites.Count == 0) {
                    //    AppSession.Sites = searchInputService.SelectTracerSitesByUser(Convert.ToInt32(AppSession.UserID));
                    //}

                    AppSession.Sites = SearchInputService.GetSitesByUser(AppSession.UserID);

                    foreach (var site in AppSession.Sites.ToList()) {

                        //site.Programs = new List<ProgramVM>();
                        //site.Programs.AddRange(new SearchInputService().SelectAllTracerProgramsBySiteAndUser(Convert.ToInt32(AppSession.UserID), site.SiteID, Convert.ToInt32(AppSession.CycleID)));

                        site.Programs=UserCustom.GetProgramBySites(site.SiteID);
                    }

                    commonService.GetHelpLink();
                    UpdateAppLogin();
                }
            }
            catch (Exception ex) {
                throw ex;
            }
        }

        private static void UpdateAppLogin()
        {
            CommonService commonservice = new CommonService();

            var ds = commonservice.SelectUserSecurityAttribute((int)AppSession.UserID, 330);
            var apps = string.Empty;

            if (ds.Tables.Count > 0 && ds.Tables[0].Rows.Count > 0)
            {

                apps = ds.Tables[0].Rows[0]["AttributeValue"].ToString();

                var appsList = apps.Length > 0 ? apps.Split(',').Select(int.Parse).ToList() : new List<int>();
                if (!appsList.Contains(11))
                {
                    appsList.Add(11);
                    commonservice.UpdateUserSecurityAttribute((int)AppSession.UserID, 330,
                        String.Join(",", appsList.Select(x => x.ToString()).ToArray()), DateTime.Today, DateTime.Today);
                }
            }
            else
            {
                commonservice.InsertUserSecurityAttribute((int)AppSession.UserID, 330, "11", DateTime.Today, DateTime.Today);
            }
        }
    }

    #region CryptHelpers
    public static class CryptHelpers {
        public static string Decrypt(string base64Text, string encryptionKey) {
            string str;
            var goodString = base64Text.Trim().Length > 10;

            // if (base64Text.Trim().Substring(base64Text.Trim().Length-1,1)=="=")
            // goodString = true;
            if (goodString) {
                ICryptoTransform transform;
                using (var provider = new TripleDESCryptoServiceProvider()) {
                    provider.Key = new MD5CryptoServiceProvider().ComputeHash(Encoding.ASCII.GetBytes(encryptionKey));
                    provider.Mode = CipherMode.ECB;
                    transform = provider.CreateDecryptor();
                }

                base64Text = base64Text.Replace(@" ", "+");
                byte[] inputBuffer = Convert.FromBase64String(base64Text);
                str = Encoding.ASCII.GetString(transform.TransformFinalBlock(inputBuffer, 0, inputBuffer.Length));
            } else {
                str = string.Empty;
            }
            return str;
        }

        public static string Encrypt(string plainText, string encryptionKey) {
            string str;
            if (plainText.Trim().Length > 0) {
                ICryptoTransform transform;
                using (var provider = new TripleDESCryptoServiceProvider()) {
                    provider.Key = new MD5CryptoServiceProvider().ComputeHash(Encoding.ASCII.GetBytes(encryptionKey));
                    provider.Mode = CipherMode.ECB;
                    transform = provider.CreateEncryptor();
                }
                byte[] bytes = Encoding.ASCII.GetBytes(plainText);
                str = Convert.ToBase64String(transform.TransformFinalBlock(bytes, 0, bytes.Length));
            } else {
                str = string.Empty;
            }
            return str;
        }

        public static string RFIDecrypt(string cipherText, string encryptionKey) {
            // will return plain text
            string plainText = string.Empty;
            try {
                if (!String.IsNullOrWhiteSpace(cipherText)) {
                    // get salted cipher array
                    byte[] saltedCipherBytes = Convert.FromBase64String(cipherText);

                    // create array to hold salt
                    byte[] salt = new byte[16];

                    // create array to hold cipher
                    byte[] cipherBytes = new byte[saltedCipherBytes.Length - salt.Length];

                    // copy salt/cipher to arrays
                    Array.Copy(saltedCipherBytes, 0, salt, 0, salt.Length);
                    Array.Copy(saltedCipherBytes, salt.Length, cipherBytes, 0, saltedCipherBytes.Length - salt.Length);

                    // create new password derived bytes using password/salt
                    using (Rfc2898DeriveBytes pdb = new Rfc2898DeriveBytes(encryptionKey, salt)) {
                        using (Aes aes = AesManaged.Create()) {
                            // Generate key and iv from password/salt and pass to aes
                            aes.Key = pdb.GetBytes(aes.KeySize / 8);
                            aes.IV = pdb.GetBytes(aes.BlockSize / 8);

                            // Open a new memory stream to write the encrypted data to
                            using (MemoryStream ms = new MemoryStream()) {
                                // Create a crypto stream to perform decryption
                                using (CryptoStream cs = new CryptoStream(ms, aes.CreateDecryptor(), CryptoStreamMode.Write)) {
                                    // write decrypted data to memory
                                    cs.Write(cipherBytes, 0, cipherBytes.Length);
                                }
                                // convert decrypted array to plain text string
                                plainText = Encoding.Unicode.GetString(ms.ToArray());
                            }
                            aes.Clear();
                        }
                    }
                }
            }
            catch (Exception) {
                return string.Empty;
            }
            return plainText;
        }
    }
    #endregion
}