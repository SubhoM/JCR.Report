using System;

namespace JCR.Reports.Models
{
    public class SearchCommon
    {
        public string SelectedSiteIDs { get; set; }
        public string SelectedSiteNames { get; set; }
        public string SelectedSiteHCOIDs { get; set; }

        public string ProgramIDs { get; set; }
        public string ProgramNames { get; set; }

        public string SelectedChapterIDs { get; set; }
        public string SelectedChapterNames { get; set; }
        public string SelectedStandardIDs { get; set; }
        public string SelectedStandardNames { get; set; }

        public string SelectedEPIDs { get; set; }
        public string SelectedEPNames { get; set; }
        public string SelectedEPLabels { get; set; }

        public string StandardLabelAndEPLabels { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public string ReportType { get; set; }
        public string ReportDateTitle { get; set; }
        public string ReportTitle { get; set; }

        public int LevelIdentifier { get; set; }

        public DateTime? StandardEffBeginDate { get; internal set; }
        public int? CertificationID { get; internal set; }
        public bool IsDuplicateLoadCall { get; set; }

        public string SelectedCoPIDs { get; set; }
        public string SelectedCoPNames { get; set; }
        public string SelectedTagIDs { get; set; }
        public string SelectedTagNames { get; set; }
    }

}