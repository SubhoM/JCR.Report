using System;
using System.Linq;


namespace JCR.Reports.Models
{
    public class ScheduleReportParameter
    {
        public int ReportID { get; set; }
        public int ReportParameterID { get; set; }
        public int ParameterOrder { get; set; }
        public string DisplayText { get; set; }
        public string DefaultValue { get; set; }
        public string ParameterName { get; set; }
    }
}