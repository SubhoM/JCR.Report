using System;
using System.Linq;
using System.Web.Mvc;

namespace JCR.Reports.Models
{
    public class TracerComplianceQuestionInput
    {

        public string OrgTypeLevel1IDs { get; set; }

        public int ReportID { get; set; }
        public string ReportName { get; set; }
        public string ReportDescription { get; set; }
        public string OrgTypeLevel1Names { get; set; }
        public string OrgTypeLevel2IDs { get; set; }

        public string OrgTypeLevel2Names { get; set; }
        public string OrgTypeLevel3IDs { get; set; }
        public string OrgTypeLevel3Names { get; set; }
        public bool InActiveOrgTypes { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }

        public string TopLeastCompliantQuestions { get; set; }

      //  public string SelectedQuestions { get; set; }

        public bool AllTracers { get; set; }

        public string SelectedQuestionIDs { get; set; }

        public string SelectedQuestionTracerIDs { get; set; }

        [AllowHtml]
        public string QuestionText { get; set; }

        public int QuestionID { get; set; }
        public string TracerIds { get; set; }
        public string TracerListNames { get; set; }
        public string TracerSectionListNames { get; set; }

        public string Keyword { get; set; }

        public string ReportTitle { get; set; }

        public bool IncludeMinimalDenomValue { get; set; }
        public int MinimalDenomValue { get; set; }
        public int TracerTypeID { get; set; }

        public bool IncludeHavingComplianceValue { get; set; }
        public string HavingComplianceOperator { get; set; }
        public int HavingComplianceValue { get; set; }
    }
}