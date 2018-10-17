using System;
using System.Linq;
using System.ComponentModel.DataAnnotations;
using JCR.Reports.Common;
namespace JCR.Reports.Areas.Tracer.ViewModels
{
    public class TracerByEPExcel : TracerOrganization
    {

        public int ChapterSortOrder { get; set; }
        public int StandardSortOrder { get; set; }
        public int EPSortOrder { get; set; }
        public int ReportDataType { get; set; }
        public int ChapterID { get; set; }

        [Display(Name = "Chapter Code")]
        public string ChapterCode { get; set; }

        [Display(Name = "Chapter")]
        public string ChapterName { get; set; }

        public int StandardTextID { get; set; }

        [Display(Name = "Standard")]
        public string StandardLabel { get; set; }

        [Display(Name = "Standard Text")]
        public string StandardText { get; set; }
         public int EPTextID { get; set; }
        [Display(Name = "EP")]
        public string EPLabel { get; set; }

        public int EP { get { return EPLabel.ToInt(); } }

        [Display(Name = "EP Text")]
        public string EPText { get; set; }

        //public string Standard
        //{
        //    get
        //    {
        //        return HelperClasses.GetStandard(StandardLabel, StandardText);
        //    }
        //}

        [Display(Name = "Num")]
        public int Numerator { get; set; }
        [Display(Name = "Den")]
        public int Denominator { get; set; }
        
        [Display(Name = "Comp %")]
        public decimal CompliancePercent { get; set; }
        
        [Display(Name = "Num")]
        public int TotalNumerator { get; set; }

        [Display(Name = "Den")]
        public int TotalDenominator { get; set; }

        [Display(Name = "Comp %")]
        public int TotalCompliancePercent { get; set; }

        [Display(Name = "Response Count")]
        public int ResponseCount { get; set; }

        [Display(Name = "Tracer Custom ID")]
        public int TracerCustomID { get; set; }

        [Display(Name = "Tracer")]
        public string TracerCustomName { get; set; }

        [Display(Name = "Tracer Response ID")]
        public int TracerResponseID { get; set; }

        [Display(Name = "Observation")]
        public string TracerResponseTitle { get; set; }

        [Display(Name = "Observation Date")]
        public DateTime ObservationDate { get; set; }

        [Display(Name = "Observation Date")]
        public string ObservationDtString { get { return ObservationDate.ToString("MM/dd/yyyy"); } }

        [Display(Name = "Note")]
        public string TracerResponseNote { get; set; }

        [Display(Name = "Tracer Question ID")]
        public int TracerQuestionID { get; set; }

        [Display(Name = "Question")]
        public string QuestionText { get; set; }

        [Display(Name = "Sort Order")]
        public int SortOrder { get; set; }

        [Display(Name = "Tracer Answer ID")]
        public int TracerQuestionAnswerID { get; set; }

        [Display(Name = "Updated By")]
        public int UpdatedBy { get; set; }

        [Display(Name = "Last Updated")]
        public DateTime UpdatedDate { get; set; }

        [Display(Name = "Last Updated")]
        public string UpdatedDtString { get { return UpdatedDate.ToString("MM/dd/yyyy"); } }

        [Display(Name = "Updated By")]
        public string UpdatedByUserName { get; set; }

        [Display(Name = "Ques Note")]
        public string TracerQuestionNote { get; set; }

        [Display(Name = "Tag ID")]
        public int TagID { get; set; }

        [Display(Name = "Element ID")]
        public int ElementID { get; set; }

        [Display(Name = "COP Text")]
        public string CopText { get; set; }

        [Display(Name = "COP Sort Order")]
        public int CopSortOrder { get; set; }

        [Display(Name = "Tag Sort Order")]
        public int TagSortOrder { get; set; }

        [Display(Name = "Requirement Name")]
        public string RequirementName { get; set; }

        [Display(Name = "Deemed Service")]
        public string DeemedService { get; set; }

        [Display(Name = "Code ID")]
        public int CodeID { get; set; }

        [Display(Name = "Tag Code")]
        public int TagCode { get; set; }

        //TO DO Add the rest of the dataset
   
    }
}