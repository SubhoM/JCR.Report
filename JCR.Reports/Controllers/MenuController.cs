using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace JCR.Reports.Controllers
{
    public class MenuController : Controller {

        [HttpPost]
        public void SwitchApps(string webApp, int pageID) {
            try {
                var url = string.Empty;
                switch (webApp.ToLower()) {
                    case "tracers":
                        url = "http://www.microsoft.com";
                        break;
                    case "amp":
                        url = "http://www.yahoo.com";
                        break;                 
                }
                Response.Redirect(url);
            }
            catch (Exception ex) {
                throw ex;
            }
        }
    }
}