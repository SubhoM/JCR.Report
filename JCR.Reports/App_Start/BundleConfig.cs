using System;
using System.Configuration;
using System.Web;
using System.Web.Optimization;

namespace JCR.Reports
{
    public class BundleConfig
    {
        // For more information on bundling, visit http://go.microsoft.com/fwlink/?LinkId=301862
        public static void RegisterBundles(BundleCollection bundles)
        {
            bundles.Add(new StyleBundle("~/Content/css").Include(
                      "~/Content/bootstrap.min.css", "~/Content/Site.css", "~/Content/SearchCriteria.css"));

            bundles.Add(new StyleBundle("~/Content/Tracercss").Include(
                        "~/Content/bootstrap.min.css", "~/Content/Tracersite.css", "~/Content/TracerSearchCriteria.css"));

            bundles.Add(new ScriptBundle("~/bundles/Tracers").Include(
                "~/Areas/Tracer/Scripts/TracerLayout.js",
                "~/Scripts/Common/ReportsCommon.js",
                "~/Scripts/Common/SaveAndSchedule.js"
                ));

            bundles.Add(new ScriptBundle("~/bundles/TracersER").Include(
                "~/Areas/TracerER/Scripts/TracerERLayout.js",                
                "~/Scripts/Common/SaveAndSchedule.js"
                ));

            bundles.Add(new ScriptBundle("~/bundles/AMP").Include(
             "~/Scripts/Layout.js",
             "~/Areas/Corporate/Scripts/CorporateLayout.js",
             "~/Scripts/Common/SaveAndSchedule.js"
             ));

            bundles.Add(new ScriptBundle("~/bundles/kendoui").Include(

                 "~/Scripts/kendo/2017.1.223/jquery.min.js",
                 "~/Scripts/kendo/2017.1.223/jszip.min.js",
                 "~/Scripts/kendo/2017.1.223/kendo.all.min.js",
                 "~/Scripts/kendo/2017.1.223/kendo.aspnetmvc.min.js",
                 "~/Scripts/kendo.modernizr.custom.js",
                 "~/Scripts/bootstrap.js",
                 "~/Scripts/respond.js",
                 "~/Scripts/hMenuData.js",
                 "~/Scripts/hMenuBuilder.js",
                 "~/Scripts/vMenuBuilder.js",
                 "~/Scripts/moment.min.js",
                 "~/Scripts/moment-timezone-2010-2020.js",
                 "~/Scripts/jquery.blockUI.min.js",
                 "~/Scripts/underscore.min.js"
                ));

            bundles.Add(new ScriptBundle("~/bundles/Common").Include(
            "~/Scripts/Common/CofirmNotification.js",
            "~/Scripts/cMenuLauncher.js",
            "~/Scripts/hMenuData.js",
            "~/Scripts/hMenuBuilder.js",
            "~/Scripts/vMenuData.js",
            "~/Scripts/vMenuBuilder.js"
            ));

            bundles.Add(new StyleBundle("~/Content/Common").Include(
                "~/Content/ConfirmDialog.css",
                 "~/Content/hMenuStyles.css",
                 "~/Content/vMenuStyles.css"
            ));

            BundleTable.EnableOptimizations = ConfigurationManager.AppSettings["LOCALDEBUG"].ToString() == "true" ? false : true;
        }
    }
}
