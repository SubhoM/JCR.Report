using System;
using System.Linq;


namespace JCR.Reports.Models
{

    public partial class ReportDetail
    {
        public int ERReportDisplayGroupID { get; set; }
        public string ERReportDisplayGroupName { get; set; }
        public int GroupSortOrder { get; set; }
        public int ERReportID { get; set; }
        public string ERReportName { get; set; }
        public string ERReportDescription { get; set; }
        public string ERReportFullDescription { get; set; }
        public string ReportChangeStatus { get; set; }
        public string ReportSource { get; set; }
        public string ReportType { get; set; }
        public int ReportSortOrder { get; set; }
        public string ReportRoles { get; set; }
    }
}

