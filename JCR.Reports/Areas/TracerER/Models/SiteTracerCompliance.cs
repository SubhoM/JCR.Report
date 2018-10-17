using System;
using System.ComponentModel.DataAnnotations;

namespace JCR.Reports.Models
{
    public class SiteTracerCompliance
    {
        public string Tracer { get; set; }

        [Display(Name = "Compliance with Tracer Schedule")]
        public int SchCompliance { get; set; }

        [Display(Name = "Tracer Compliance")]
        public int TracerCompliance { get; set; }
        
    }
}