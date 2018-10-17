namespace JCR.Reports.Areas.Corporate.ViewModels
{
    public class EPAssignmentbySite : EPAssignmentSummary
    {
        public int? HCOID { get; set; }
        public int SiteID { get; set; }
        public string SiteName { get; set; }
        public string SiteFullName { get; set; }
        public string Location { get; set; }
    }
}