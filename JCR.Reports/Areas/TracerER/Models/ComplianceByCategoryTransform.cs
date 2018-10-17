using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace JCR.Reports.Models
{
    public class ComplianceByCategoryTransform
    {
        public int SiteID { get; set; }
        public string SiteName { get; set; }
        public int HCOID { get; set; }
        public string TracerCategoryName { get; set; }
        public string SchComplianceAverage { get; set; }
        public string TracerComplianceAverage { get; set; }

    }
}