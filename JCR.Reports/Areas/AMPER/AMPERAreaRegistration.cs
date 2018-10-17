using System.Web.Mvc;

namespace JCR.Reports.Areas.AmpER
{
    public class AmpERAreaRegistration : AreaRegistration 
    {
        public override string AreaName 
        {
            get 
            {
                return "AmpER";
            }
        }

        public override void RegisterArea(AreaRegistrationContext context) 
        {
            context.MapRoute(
                "AmpER_default",
                "AmpER/{controller}/{action}/{id}",
                new { action = "Index", id = UrlParameter.Optional }
            );
        }
    }
}