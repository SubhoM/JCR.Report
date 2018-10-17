using System;
using System.ComponentModel.DataAnnotations;
using System.Linq;

namespace JCR.Reports.Models
{
    public class QuestionBySiteInfo
    {
        public string SiteName { get; set; }

        [Display(Name = "Total Numerator")]
        public string Numerator { get; set; }

        [Display(Name = "Total Denominator")]
        public string Denominator { get; set; }

        [Display(Name = "Overall Compliance %")]
        public string CompliancePercent { get; set; }
    }
}