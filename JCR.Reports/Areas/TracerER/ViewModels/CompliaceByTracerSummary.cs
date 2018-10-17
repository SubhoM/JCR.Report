using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using JCR.Reports.Models;
using System.ComponentModel.DataAnnotations;

namespace JCR.Reports.Areas.TracerER.ViewModels
{
    public class CompliaceByTracerSummary
    {
        private List<SiteByCategoryInfo> _siteCategory = new List<SiteByCategoryInfo>();

        public List<SiteByCategoryInfo> SitewiseCategory
        {
            get { return _siteCategory; }
            set { _siteCategory = value; }
        }

        [Display(Name = "Category")]
        public string SiteName { get; set; }
        public int HCOID { get; set; }
        public int SiteID { get; set; }
    }
}