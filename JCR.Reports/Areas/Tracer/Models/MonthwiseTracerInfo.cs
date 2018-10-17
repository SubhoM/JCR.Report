using System;
using System.ComponentModel.DataAnnotations;
using System.Linq;


namespace JCR.Reports.Models
{
    public class MonthwiseTracerInfo
    {
        public string Month { get; set; }

        [Display(Name = "Num")]
        public int Numerator { get; set; }
        [Display(Name = "Den")]
        public int Denominator { get; set; }
        [Display(Name = "Total Compl Observ")]
        public int ObservationsCount { get; set; }
        [Display(Name = "Comp %")]
        public decimal CompliancePercentage
        {
            get
            {
                var val = 0.0f;
                if (Denominator != 0)
                { 
                val = (float)Numerator / (float)Denominator;
                }
                 
                return Math.Round((decimal)val * 100, 1);
            }
        }
    }
}