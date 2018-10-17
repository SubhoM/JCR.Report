using System;
using System.Linq;


namespace JCR.Reports.Models
{
    public class SearchSavedReportsInput
    {
        public string ERReportIDs { get; set; }
        public string ERMyReportIDs { get; set; }
        public string ERRecurrenceIDs { get; set; }

        public int ReportUserScheduleID { get; set; }

        public Nullable<DateTime> CreateDateFrom { get; set; }
        public Nullable<DateTime> CreateDateTo { get; set; }

        public string CreatedByIDs { get; set; }

        public bool MyReportsView { get; set; }
        public string SearchSelectedSites { get; set; }
    }
}