using System;


namespace JCR.Reports.Models
{
    public class ReportUserScheduleParameter
    {
        public int ReportUserScheduleID { get; set; }
        public int ReportParameterID { get; set; }
        public string ReportParameterName { get; set; }
        public string DisplayTextOverride { get; set; }
        public string ParameterValue { get; set; }
        public DateTime CreateDate { get; set; }
        public DateTime UpdateDate { get; set; }
    }
}