using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace JCR.Reports.Areas.TracerER.ViewModels
{
    public class ErTracersbySiteData : ERTracersResponseSummary
    {
        public int? HCOID { get; set; }
        public int SiteID { get; set; }
        public string SiteName { get; set; }
        public string SiteFullName { get; set; }
        public string Location { get; set; }

    }
}