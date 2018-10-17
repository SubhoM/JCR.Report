using System;
using System.Linq;
using System.ComponentModel.DataAnnotations;
namespace JCR.Reports.Areas.TracerER.ViewModels
{
    public class ERTracersResponseSummary
    {

        [Display(Name = "Tracer Count")]
        public int TracerCount { get; set; }

        public int ObservationCount { get; set; }
        
        public int QuestionCount { get; set; }

        [Display(Name = "Total N/A")]
        public int NACount { get; set; }

        [Display(Name = "Total Numerator")]
        public decimal Numerator { get; set; }

        [Display(Name = "Total Denominator")]
        public decimal Denominator { get; set; }

        [Display(Name = "Overall Compliance %")]
        public decimal CompliancePercent { get; set; }
        public decimal NonCompliancePercent { get; set; }
        public decimal NACompliancePercent { get; set; }
    }

 








   

    

}