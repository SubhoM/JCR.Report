using System;
using System.Linq;

namespace JCR.Reports.Models
{
    public class SearchAssignmentStatusByUser : SearchCommon
    {

        public bool IncludeFSAEPs { get; set; }
        public bool IncludeDocumentationRequired { get; set; }
        public bool IncludeNewChangedEPs { get; set; }
        public int SelectedScoreType { get; set; }
        public string SelectedScoreTypeName { get; set; }
        public string SelectedAssignedToIDs { get; set; }
        public string SelectedAssignedToNames { get; set; }
        public string ScoreValueList { get; set; }
        public string ScoreValueNameList { get; set; }
    }
}