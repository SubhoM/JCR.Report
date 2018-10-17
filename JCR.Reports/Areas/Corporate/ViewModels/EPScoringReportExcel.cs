using System;

namespace JCR.Reports.Areas.Corporate.ViewModels
{
    public class EPScoringReportExcel
    {
        public string Level { get; set; }
        public Nullable<int> TJCProgramID { get; set; }
        public Nullable<int> EPTextID { get; set; }
        public string EPText { get; set; }
        public string EPLabel { get; set; }
        public Nullable<int> EP_SortOrder { get; set; }
        public string ScoreName { get; set; }
        public Nullable<int> ScoreTypeID { get; set; }
        public string ScoreTypeName { get; set; }
        public string Likelihood { get; set; }
        public string Scope { get; set; }
        public string ScoreDate { get; set; }
        public string Comments { get; set; }
        public Nullable<int> UserID { get; set; }
        public string FullName { get; set; }
        public string AssignedToFullName { get; set; }
        public string FSA { get; set; }
        public string dcm_fl { get; set; }
        public string NewEP { get; set; }
        public string esp1_fl { get; set; }
        public string ProgramCode { get; set; }
        public string Findings { get; set; }
        public string POA { get; set; }
        public string MOS { get; set; }
        public string OrgNotes { get; set; }
        public string CompliantDate { get; set; }
        public string DocumentList { get; set; }
        public Nullable<int> ChapterID { get; set; }
        public Nullable<int> ChapterSortOrder { get; set; }
        public string ChapterCode { get; set; }
        public string StandardLabel { get; set; }
        public string StandardText { get; set; }
        public Nullable<int> StandardTextSortOrder { get; set; }
        public string TagCode { get; set; }
        public string CopText { get; set; }
        public string ChapterName { get; set; }
        public string ProgramName { get; set; }
        public Nullable<int> HCOID { get; set; }
        public string SiteName { get; set; }
        public Nullable<int> SiteID { get; set; }
        public string CoPHTML { get; set; }
        public string CoPExcel { get; set; }
        public string DueDate { get; set; }
    }
}