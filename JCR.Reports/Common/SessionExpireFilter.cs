using System;
using System.Linq;
using System.Web;
using System.Web.Mvc;


namespace JCR.Reports.Common
{
    public class SessionExpireFilter : ActionFilterAttribute
    {
        public override void OnActionExecuting(ActionExecutingContext filterContext)
        {
            HttpContext ctx = HttpContext.Current;

            // check if session is supported
            if (ctx.Session != null)
            {
                //If the session is invalid recreate it and redirect to Transfer/Index
                if (!AppSession.HasValidSession)
                {
                    ctx.Response.Redirect("~/Transfer/Index");
                }
                // check if a new session id was generated
               // if (ctx.Session.IsNewSession)
               // {
                    //If it says it is a new session, but an existing cookie exists, then it must have timed out
                    //string sessionCookie = ctx.Request.Headers["Cookie"];
               //   ctx.Response.Redirect("~/Transfer/LogoutRedirect");
              //  }
            }
            else
            {
                ctx.Response.Redirect("~/Transfer/TimeoutRedirect");
            }

            base.OnActionExecuting(filterContext);
        }
    }
}