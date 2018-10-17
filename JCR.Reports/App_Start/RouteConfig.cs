using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Web.Routing;

namespace JCR.Reports
{
    public class RouteConfig
    {
        public static void RegisterRoutes(RouteCollection routes) {
            routes.IgnoreRoute("{resource}.axd/{*pathInfo}");

            routes.MapRoute(
                name: "Default",
                url: "{controller}/{action}/{id}/{actionType}",
                defaults: new { controller = "Transfer", action = "Index", id = UrlParameter.Optional, actionType = UrlParameter.Optional }
            );

            routes.MapRoute(
                name: "DefaultTracer",
                url: "Tracer/{controller}/{action}/{id}/{actionType}",
                defaults: new { controller = "Transfer", action = "Index", id = UrlParameter.Optional, actionType = UrlParameter.Optional }
            );

            routes.MapRoute(
                name: "DefaultER",
                url: "TracerER/{controller}/{action}/{id}/{actionType}",
                defaults: new { controller = "Transfer", action = "IndexER", id = UrlParameter.Optional, actionType = UrlParameter.Optional }
            );

            routes.MapRoute(
                name: "DefaultAMPCorporate",
                url: "Corporate/{controller}/{action}/{id}/{actionType}",
                defaults: new { controller = "Transfer", action = "IndexCorp", id = UrlParameter.Optional, actionType = UrlParameter.Optional }
            );
        }
    }
}
