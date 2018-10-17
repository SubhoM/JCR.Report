using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace JCR.Reports.Models
{
    public class TracerDepartmentAssignmentInput
    {
        public string TracerCategoryIDs { get; set; }
        public string OrgTypeLevel1IDs { get; set; }
        public string OrgTypeLevel1Names { get; set; }
        public string OrgTypeLevel2IDs { get; set; }
        public string OrgTypeLevel2Names { get; set; }
        public string OrgTypeLevel3IDs { get; set; }
        public string OrgTypeLevel3Names { get; set; }
        public bool InActiveOrgTypes { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public string TracerIds { get; set; }
        public string TracerListNames { get; set; }
        public string TracerListIDs { get; set; }
        public string TracerFrequencyIDs { get; set; }
        
        public string FrequencyId { get; set; }
        public string FrequencyName { get; set; }

        public string ReportType { get; set; }
        public List<string> DefaultFrequencyNames { get; set; }

        public string ActiveFrequencyName { get; set; }

    }
}