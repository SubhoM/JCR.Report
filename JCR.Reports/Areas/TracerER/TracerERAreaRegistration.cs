using System.Web.Mvc;

namespace JCR.Reports.Areas.TracerER
{
    public class TracerERAreaRegistration : AreaRegistration 
    {
        public override string AreaName 
        {
            get 
            {
                return "TracerER";
            }
        }

        public override void RegisterArea(AreaRegistrationContext context) 
        {
            context.MapRoute(
                "TracerER_default",
                "TracerER/{controller}/{action}/{id}/{actionType}",
               new { controller = "Transfer", action = "IndexER", id = UrlParameter.Optional, actionType = UrlParameter.Optional }
            );

       
        }
    }
}