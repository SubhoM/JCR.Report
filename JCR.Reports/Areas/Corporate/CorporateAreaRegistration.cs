using System.Web.Mvc;

namespace JCR.Reports.Areas.Corporate
{
    public class CorporateAreaRegistration : AreaRegistration 
    {
        public override string AreaName 
        {
            get 
            {
                return "Corporate";
            }
        }

        public override void RegisterArea(AreaRegistrationContext context) 
        {
            context.MapRoute(
                "Corporate_default",
                "Corporate/{controller}/{action}/{id}/{actionType}",
                 new { controller = "Transfer", action = "IndexCorporate", id = UrlParameter.Optional, actionType = UrlParameter.Optional }
            );
        }
    }
}