using System;
using System.Linq;
using System.ComponentModel.DataAnnotations;
namespace JCR.Reports.Areas.Tracer.ViewModels
{
    public class DepartmentComparativeAnalysisData 
    {
        //  [CustomDisplayName((int)CategoryHierarchy.Campus)]
        [Display(Name = "Level3")]
        public string OrgName_Rank3 { get; set; }
        //   [CustomDisplayName((int)CategoryHierarchy.Building)]
        [Display(Name = "Level2")]
        public string OrgName_Rank2 { get; set; }
        //   [CustomDisplayName((int)CategoryHierarchy.Department)]
        [Display(Name = "Department")]
        public string OrgName_Rank1_Dept { get; set; }
          [Display(Name = "Tracers in Dept")]
        public int TracerCount { get; set; }
         [Display(Name = "Total Completed Observations")]
          public int TracerResponseCount { get; set; }
         [Display(Name = "Not App Total")]
         public int TotalNotApplicableCount { get; set; }

        [Display(Name = "Num Total")]
        public decimal NumeratorTotal { get; set; }
          [Display(Name = "Den Total")]
        public decimal DenominatorTotal { get; set; }

           [Display(Name = "Compl %")]    
        public decimal NDCompliancePercent { get; set; }

    }
}