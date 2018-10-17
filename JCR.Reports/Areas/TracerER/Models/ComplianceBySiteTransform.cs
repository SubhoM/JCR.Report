using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace JCR.Reports.Models
{
    public class ComplianceBySiteTransform
    {
        public int SiteID { get; set; }
        public string SiteName { get; set; }
        public int TracerCustomID { get; set; }
        public string TracerCustomName { get; set; }
        public decimal Numerator { get; set; }
        public decimal Denominator { get; set; }
        public decimal CompliancePercent { get; set; }
        public int tracerquestion_rank { get; set; }
        public int tracercustom_rank { get; set; }
        public string questiontext { get; set; }
        public int QuesNo { get; set; }
              
    }
}