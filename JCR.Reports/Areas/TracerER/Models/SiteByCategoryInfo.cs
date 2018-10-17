using System;
using System.ComponentModel.DataAnnotations;
using System.Linq;

namespace JCR.Reports.Models
{
    public class SiteByCategoryInfo
    {
        public string CategoryName { get; set; }

        [Display(Name = "Compliance with Tracer Schedule Average")]
        public string AverageScheduleCompliance { get; set; }
        [Display(Name = "Tracer Compliance Average")]
        public string AverageTracerCompliance { get; set; }
    }
}