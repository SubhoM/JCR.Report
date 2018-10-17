using System;
using System.Linq;


namespace JCR.Reports.ViewModels
{
    public class SaveandScheduledDetails
    {
        public int ERReportUserScheduleID { get; set; }
        public int ERReportID { get; set; }
        public int UserID { get; set; }
        public int ERReportScheduleStatusID { get; set; }
        public string EmailTo { get; set; }
        public Nullable<System.DateTime> LastRundate { get; set; }
        public Nullable<int> LastRunStatus { get; set; }

        public string ReportNameOverride { get; set; }
        public string ReportDescription { get; set; }
        public int ERScheduleTypeID { get; set; }
        public Nullable<System.DateTime> NextRunScheduled { get; set; }
        public System.DateTime CreateDate { get; set; }
        public System.DateTime UpdateDate { get; set; }

        public string ERReportName { get; set; }
        public int SiteID { get; set; }

        public string FirstName { get; set; }

        public string LastName { get; set; }

        public string UpdateByUserID { get; set; }
        public string UpdateByUserFirstName { get; set; }
        public string UpdateByUserLastName { get; set; }
          public string CC { get; set; }
        public string BCC { get; set; }
        public string ReplyTo { get; set; }
        public string Subject { get; set; }
        public int RenderFormatTypeID { get; set; }
      
        public string Comment { get; set; }

        public string ERReportScheduleStatusName { get; set; }
        public string ERReportScheduleStatusDescription { get; set; }
        public string ERScheduleName { get; set; }
        public string ERScheduleDescription { get; set; }
        
        public string LastRunMessage { get; set; }
        public string ReportSource { get; set; }

        public string CreatedBy { get; set; }
        public string UpdatedBy { get; set; }
        
    }
}