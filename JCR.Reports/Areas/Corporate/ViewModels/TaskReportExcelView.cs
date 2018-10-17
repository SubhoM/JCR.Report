using System;
using System.Linq;
using System.ComponentModel.DataAnnotations;

namespace JCR.Reports.Areas.Corporate.ViewModels
{
    public class TaskReportExcelView
    {
        public string StatusName { get; set; }
        public int TaskID { get; set; }
        public string TaskName { get; set; }
        public string TaskDescription { get; set; }
        public string AssignedBy { get; set; }
        public string AssignedTo { get; set; }
        public string CcedTo { get; set; }
        public DateTime AssignedDate { get; set; }
        public DateTime DueDate { get; set; } 
        public Nullable<DateTime> CompleteDate { get; set; }
        public string TaskResolution { get; set; }
        public string StandardEp { get; set; }
        public string CmsStandard { get; set; }
        public string EPDetails { get; set; }
        public string TracerCustomName { get; set; }
        public string QuestionText { get; set; }
        public string Observation { get; set; }
        [Display(Name = "Level3")]
        public string OrgName_Rank3 { get; set; }

        [Display(Name = "Level2")]
        public string OrgName_Rank2 { get; set; }

        [Display(Name = "Department")]
        public string OrgName_Rank1_Dept { get; set; }

        public string CCUserIDs { get; set; }
    }
}