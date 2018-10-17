using System;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;
using System.Web;

namespace JCR.Reports.Models {
    public class Authentication {
        public int UserID             { get; set; }
        public string UserLogonID     { get; set; }
        public string AuthToken       { get; set; }
        public int AdminUserID        { get; set; }     // AdminUserID 0 indicates no global admin logged-in as the requested user.
        public bool LOCALDEBUG        { get; set; }
        public bool InError           { get; set; }
        public string ErrorMsg        { get; set; }
        public int PageID             { get; set; }
        public int UserOriginalRoleID { get; set; }
        public Authentication() {
            LOCALDEBUG = Convert.ToBoolean(ConfigurationManager.AppSettings["LOCALDEBUG"]);
        }
    }
}