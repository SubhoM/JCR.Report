using System.Web.Mvc;

namespace JCR.Reports.Areas.Tracer
{
    public class TracerAreaRegistration : AreaRegistration 
    {
        public override string AreaName 
        {
            get 
            {
                return "Tracer";
            }
        }

        public override void RegisterArea(AreaRegistrationContext context) 
        {
            context.MapRoute(
                "Tracer_default",
                "Tracer/{controller}/{action}/{id}/{actionType}",
                new { controller = "Transfer", action = "IndexTracer", id = UrlParameter.Optional, actionType = UrlParameter.Optional }
            );
        }
    }
}