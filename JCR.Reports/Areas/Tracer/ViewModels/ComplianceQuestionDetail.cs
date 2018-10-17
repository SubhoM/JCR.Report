using System;
using System.Linq;
using System.ComponentModel.DataAnnotations;
namespace JCR.Reports.Areas.Tracer.ViewModels
{
    public class ComplianceQuestionDetail
    {
        [Display(Name = "Question")]
        public string QuestionText { get; set; }
        public decimal OverallCompliance { get; set; }
        [Display(Name = "Tracer")]
        public string TracerCustomName { get; set; }

        [Display(Name = "Tracer Section")]
        public string TracerSection { get; set; }

        [Display(Name = "Ques No")]
        public int QuesNo { get; set; }
        
        public string StandardEPs { get; set; }
             
        public string Observation { get; set; }

        public decimal Num { get; set; }

        public decimal Den { get; set; }
        public decimal TotalNumerator { get; set; }

        public decimal TotalDenominator { get; set; }
      
        public decimal Compliance { get; set; }

        [Display(Name = "Level3")]
        public string OrgName_Rank3 { get; set; }
      
        [Display(Name = "Level2")]
        public string OrgName_Rank2 { get; set; }
       
        [Display(Name = "Department")]
        public string OrgName_Rank1_Dept { get; set; }
        public string SurveyTeam { get; set; }

        [Display(Name = "Medical Staff Involved")]
        public string MedicalStaffInvolved { get; set; }

        public string Location { get; set; }
        [Display(Name = "Unique Identifier")]

        public string MedicalRecordNumber { get; set; }

        public string EquipmentObserved { get; set; }

        public string ContractedService { get; set; }

        public string StaffInterviewed { get; set; }

        [Display(Name = "Note")]
        public string TracerNote { get; set; }


        [Display(Name = "Date")]
        public Nullable<DateTime> ObservationDate { get; set; }

        [Display(Name = "Updated By")]
        public string UpdatedByName { get; set; }

        [Display(Name = "Last Updated")]
        public DateTime LastUpdated { get; set; }

        [Display(Name = "Question Note")]
        public string QuestionNotes { get; set; }
        public int QID { get; set; }

        public int LimitDepartment { get; set; }

        public string ObservationDtString { get { return ObservationDate.HasValue ? ObservationDate.Value.ToString("MM/dd/yyyy") : string.Empty; } }
        
        public string LastUpdatedDtString { get { return LastUpdated.ToString("MM/dd/yyyy"); } }
        public int ObservationCount { get; set; }
        public int TotalObservationCount { get; set; }
        public int TracerCustomID { get; set; }
        public int OrgName_Rank1_DeptID { get; set; }
        public int TotalCompletedObservation { get; set; }
    }
}