using System;
using System.ComponentModel.DataAnnotations;
using System.Linq;


namespace JCR.Reports.Areas.Tracer.ViewModels
{
    public class TracerByCMSGraph
    {
        [Display(Name = "Tag")]
        public string CMSTag { get; set; }
        public int TagID { get; set; }
        [Display(Name = "Num")]
        public int TotalNumerator { get; set; }
        [Display(Name = "Den")]
        public int TotalDenominator { get; set; }
        [Display(Name = "Compl %")]
        public decimal Compliance { get; set; }
    }
}