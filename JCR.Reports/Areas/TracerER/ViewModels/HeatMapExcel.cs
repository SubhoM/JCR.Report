using JCR.Reports.Models;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Web;

namespace JCR.Reports.Areas.TracerER.ViewModels
{
    public class HeatMapExcel
    {
        private List<SiteTracerCompliance> _siteTracerCompliance = new List<SiteTracerCompliance>();

        public List<SiteTracerCompliance> SiteTracerCompliance
        {
            get { return _siteTracerCompliance; }
            set { _siteTracerCompliance = value; }
        }

        [Display(Name = "Site")]
        public string SiteName { get; set; }

        public int SiteID { get; set; }
    }
}