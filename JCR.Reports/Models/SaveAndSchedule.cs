using System;
using System.Collections.Generic;
using System.Linq;


namespace JCR.Reports.Models
{
    public class SaveAndSchedule
    {
        public SaveAndSchedule()
        {
            this.ReportParameters = new List<ReportUserScheduleParameter>();
            this.ReportSiteMaps = new List<ReportUserScheduleSiteMap>();
        }
        public int SiteID { get; set; }
        public int ReportID { get; set; }
        public int? UserID { get; set; }
        public int ReportUserScheduleID { get; set; }
        public int ReportScheduleStatusID { get; set; }
        public string ReportNameOverride { get; set; }
        public string ReportDescription { get; set; }
        public int ReportMode { get; set; }
        public string EmailTo { get; set; }
        public string EmailCC { get; set; }
        public string EmailBCC { get; set; }
        public string ReplyTo { get; set; }
        public string Subject { get; set; }
        public int RenderFormatTypeID { get; set; }
        public int Priority { get; set; }
        public string Comment { get; set; }
        public int ScheduleTypeID { get; set; }
        public string DaysOfWeek { get; set; }
        public int? DaysOfMonth { get; set; }
        public int? DaysOfQuarter { get; set; }
        public DateTime? NextRunScheduled { get; set; }
        public DateTime? LastRundate { get; set; }
        public int? LastRunStatus { get; set; }
        public string LastRunMessage { get; set; }
        public int? UpdateByUserId { get; set; }
        public int? ReportLauncherID { get; set; }
        public List<ReportUserScheduleParameter> ReportParameters { get; set; }
        public List<ReportUserScheduleSiteMap> ReportSiteMaps { get; set; }

        public int? ReportDelete { get; set; }
    }
}