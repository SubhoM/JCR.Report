using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace JCR.Reports.Areas.Corporate.ViewModels
{
    public class EPAssignmentDetails : EPAssignmentbySite 
    {
        public int ProgramID { get; set; }

        public string ProgramName { get; set; }
    //    public string ProgramCode { get; set; }
        public int ChapterID { get; set; }
        public string ChapterCode { get; set; }
        public string ChapterName { get; set; }

        public int StandardTextID { get; set; }
        public string StandardLabel { get; set; }

        public int EPTextID { get; set; }
        public int EPLabel { get; set; }

        public string ScoreType { get; set; }

        public string ScoreValue { get; set; }
        public string ScoredBy { get; set; }

        public string Likelihood { get; set; }
        public string Scope { get; set; }

        public string AssignedBy { get; set; }
        public string AssignedTo { get; set; }

        public string ScoreDate { get; set; }
        public string DueDate { get; set; }
        public bool PastDueDate { get; set; }
        public string EPText { get; set; }
        public string Findings { get; set; }
        public string POA { get; set; }
        public string MOS { get; set; }
        public string OrgNotes { get; set; }
        public string CompliantDate { get; set; }
        public string DocumentList { get; set; }

    }
}