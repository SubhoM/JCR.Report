using System;

namespace JCR.Reports.Models
{
    public class SearchTaskReport : SearchCommon
    {
        public string SelectedEmailCcedIds { get; set; }
        public string SelectedEmailCcedNames { get; set; }
        public string TracerListIDs { get; set; }
        public string TracerListNames { get; set; }
        public string OrgTypeLevel1IDs { get; set; }
        public string OrgTypeLevel1Names { get; set; }
        public string OrgTypeLevel2IDs { get; set; }
        public string OrgTypeLevel2Names { get; set; }
        public string OrgTypeLevel3IDs { get; set; }
        public string OrgTypeLevel3Names { get; set; }
        public string SelectedAssignedToIDs { get; set; }
        public string SelectedAssignedToNames { get; set; }
        public string SelectedAssignedByIDs { get; set; }
        public string SelectedAssignedByNames { get; set; }
        public DateTime? DueFromDate { get; set; }
        public DateTime? DueToDate { get; set; }
        public DateTime? AssignFromDate { get; set; }
        public DateTime? AssignToDate { get; set; }
        public string SelectedTaskStatusIDs { get; set; }
        public string SelectedTaskStatusNames { get; set; }
        public bool IncludePastDue { get; set; }
    }
}