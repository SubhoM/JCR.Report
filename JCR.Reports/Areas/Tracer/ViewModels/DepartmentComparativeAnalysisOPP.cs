using System;
using System.Linq;
using System.ComponentModel.DataAnnotations;
namespace JCR.Reports.Areas.Tracer.ViewModels
{
    public class DepartmentComparativeAnalysisOPP 
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
        [Display(Name="Question")]
        public string QuestionText { get; set; }
      
        [Display(Name="Standard/EPs")]
        public string StandardEPs { get; set; }
       
        [Display(Name = "Tracer")]
        public string TracerCustomName { get; set; }
        [Display(Name = "Observation")]
        public string TracerResponseTitle { get; set; }
        [Display(Name = "Date")]
        public Nullable<DateTime> ObservationDate { get; set; }
        [Display(Name = "Num")]
        public decimal Numerator { get; set; }
        [Display(Name = "Den")]
        public decimal Denominator { get; set; }
        [Display(Name = "Compl %")]
        public decimal CompliancePercent { get; set; }


        [Display(Name="Question Note")]
        public string TracerQuestionNote { get; set; }
          
     
     
    }
}