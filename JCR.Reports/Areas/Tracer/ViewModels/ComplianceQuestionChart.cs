using System;
using System.Linq;
using System.ComponentModel.DataAnnotations;
namespace JCR.Reports.Areas.Tracer.ViewModels
{
    public class ComplianceQuestionChart
    {
        //public int TracerCustomID { get; set; }
        //public string TracerCustomName { get; set; }
        public int QID { get; set; }
        public int QuesNo { get; set; }
        public string QuestionText { get; set; }
        [Display(Name = "Num Total")]
        public decimal TotalNumerator { get; set; }
        [Display(Name = "Den Total")]
        public decimal TotalDenominator { get; set; }
        [Display(Name = "Compl %")]  
        public decimal Compliance { get; set; }

        public int QuestionID { get; set; }
    }
}