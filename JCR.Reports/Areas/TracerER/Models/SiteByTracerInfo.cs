using System;
using System.ComponentModel.DataAnnotations;
using System.Linq;


namespace JCR.Reports.Models
{
    public class SiteByTracerInfo
    {
        public string TracerName { get; set; }

        [Display(Name = "Compliance with Tracer Schedule")]
        public string ScheduleCompliance { get; set; }
        [Display(Name = "Tracer Compliance")]
        public string TracerCompliance { get; set; }
        [Display(Name = "Total Completed Observations")]
        public string TotalCompletedObservations { get; set; }
    }
}