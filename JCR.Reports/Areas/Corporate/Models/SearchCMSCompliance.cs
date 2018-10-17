namespace JCR.Reports.Models
{
    public class SearchCMSCompliance : SearchCommon
    {
        public string SelectedIdentifiedByIDs { get; set; }
        public string SelectedIdentifiedByNames { get; set; }
        public string ComplianceValueList { get; set; }
        public string ComplianceValueNameList { get; set; }
        public int chkIncludeTJC { get; set; }
        public int CMSSurveyorFindings { get; set; }
        public int OrgCMSFindings { get; set; }
        public int PlanOfCorrection { get; set; }
        public int LinkedDocs { get; set; }
        public string DocumentationNameList { get; set; }
    }
}