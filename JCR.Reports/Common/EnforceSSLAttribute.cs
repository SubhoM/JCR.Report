using System;
using System.Web.Mvc;
using System.Configuration;

namespace JCR.Reports.Common
{
    /// <summary>
    /// EnforceSSLAttribute
    /// </summary>
    public class EnforceSSLAttribute : ActionFilterAttribute
    {
        /// <summary>
        /// OnActionExecuting: check each call is setup to enforce SSL connection
        /// Set up as Global Filter in FilterConfig
        /// </summary>
        /// <param name="actionContext">ActionExecutingContext</param>
        public override void OnActionExecuting(ActionExecutingContext actionContext)
        {
            if (ConfigurationManager.AppSettings["EnforceSSL"] != null)
            {
                bool enforceSSL = Convert.ToBoolean(ConfigurationManager.AppSettings["EnforceSSL"]);
                if (enforceSSL)
                {
                    string newURL = actionContext.HttpContext.Request.Url.DnsSafeHost + actionContext.HttpContext.Request.RawUrl;
                    if (!actionContext.HttpContext.Request.IsSecureConnection)
                    {
                        actionContext.Result = new RedirectResult("https://" + newURL);
                    }
                }            
            }
        }


    }
}