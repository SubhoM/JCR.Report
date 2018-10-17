using JCR.Reports.Models;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;

namespace JCR.Reports.Areas.TracerER.ViewModels
{
    public class CompliaceByTracerHeatMap
    {
        private List<SiteByTracerInfo> _siteTracer = new List<SiteByTracerInfo>();

        public List<SiteByTracerInfo> SitewiseTracer
        {
            get { return _siteTracer; }
            set { _siteTracer = value; }
        }

        [Display(Name = "Tracer")]
        public string SiteName { get; set; }

        public int SiteID { get; set; }
        public string HCOID { get; set; }
        public string TracerCategoryName { get; set; }
        public int TracerCategoryID { get; set; }
        public int OverallTotalCompletedObservation { get; set; }
        public string OverallTracerCompliance { get; set; }
        public decimal OverallNum { get; set; }
        public decimal OverallDen { get; set; }
    }
}