using System;
using System.ComponentModel.DataAnnotations;
using System.Data;
using System.Linq;


namespace JCR.Reports.Models
{
    public class GroupByTracerAssignmentData
    {
        public DataTable datatableTracerInfo { get; set; }
        public string TracerName { get; set; }
        public string ResponsiblePersonName { get; set; }
        public int ObservationCount { get; set; }
        public string TracerColumnTitle { get; set; }
        public string OrgTypeLevel1IDs { get; set; }
        public string OrgTypeLevel1Names { get; set; }
        public string OrgTypeLevel2IDs { get; set; }
        public string OrgTypeLevel2Names { get; set; }
        public string OrgTypeLevel3IDs { get; set; }
        public string OrgTypeLevel3Names { get; set; }
        
    }
}