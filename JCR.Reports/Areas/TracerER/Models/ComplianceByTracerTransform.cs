using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace JCR.Reports.Models
{
    public class ComplianceByTracerTransform
    {
        public int SiteID { get; set; }
        public string SiteName { get; set; }
        public int HCOID { get; set; }
        public int TracerCustomID { get; set; }
        public string TracerCustomName { get; set; }
        public string TracerCategoryName { get; set; }
        public decimal ExpectedObs { get; set; }
        public int ObservationCount { get; set; }
        public int QuestionCount { get; set; }
        public decimal Numerator { get; set; }
        public decimal Denominator { get; set; }
        public decimal CompliancePercent { get; set; }
        public decimal ScheduleCompliance { get; set; }
        

    }
}