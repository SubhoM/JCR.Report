using System;
using System.Linq;
using System.ComponentModel.DataAnnotations;
namespace JCR.Reports.Areas.Tracer.ViewModels
{
    public class TracerComprehensiveExcel : TracerOrganization
    {
         [Display(Name = "Tracer")]
        public string TracerCustomName { get; set; }

        //public int TracerCustomID { get; set; }

        [Display(Name = "Observation")]
        public string TracerResponseTitle { get; set; }

        //public int TracerResponseID { get; set; }

       
        public string SurveyTeam { get; set; }

        [Display(Name = "Medical Staff Involved")]
        public string MedicalStaffInvolved { get; set; }

        public string Location { get; set; }
        [Display(Name = "Unique Identifier")]
        public string MedicalRecordNumber { get; set; }

        public string EquipmentObserved { get; set; }

        public string ContractedService { get; set; }

        public string StaffInterviewed { get; set; }

         [Display(Name = "Observation Notes")]
        public string TracerNote { get; set; }

        public int UpdatedById { get; set; }

         [Display(Name = "Updated By")]
        public string UpdatedByUserName { get; set; }

        public int QuestionAnswer { get; set; }

        public DateTime ObservationDate { get; set; }

        [Display(Name = "Last Updated")]
        public DateTime UpdatedDate { get; set; }

        public decimal Numerator { get; set; }

        public decimal Denominator { get; set; }

        [Display(Name = "Compliance")]
        public decimal CompliancePercent { get; set; }

        [Display(Name = "Ques No")]
        public int TracerQuestionNumber { get; set; }
        public int TracerQuestionID { get; set; }

         [Display(Name = "Question")]
        public string QuestionText { get; set; }

        //public decimal TotalNumerator { get; set; }

        //public decimal TotalDenominator { get; set; }

        //public decimal TotalCompliancePercent { get; set; }

        public bool FollowUpRequired { get; set; }

        [Display(Name = "Question Notes")]
        public string TracerQuestionNote { get; set; }

        public string StandardEP { get; set; }

        [Display(Name = "Observation Date")]
        public string ObservationDtString { get { return ObservationDate.ToString("MM/dd/yyyy"); } }

        [Display(Name = "Last Updated")]
        public string UpdatedDtString { get { return UpdatedDate.ToString("MM/dd/yyyy"); } }

        [Display(Name = "Total Completed Observations")]
        public int TotalObservationsCount { get; set; }
    }
}