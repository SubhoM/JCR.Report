using System;
using System.Linq;

namespace JCR.Reports.Models
{
    public class SearchER
    {
        public string SelectedSiteIDs { get; set; }

        public string SelectedSiteHCOIDs { get; set; }
        public string ProgramIDs { get; set; }
        public string ProgramNames { get; set; }
       
  
        public string TracerListIDs { get; set; }

        public string TracerListNames { get; set; }

        public string QuarterListIDs { get; set; }

        public string QuarterListNames { get; set; }

        public string DepartmentListIDs { get; set; }

        public string DepartmentListNames { get; set; }

        public string SelectedChapterIDs { get; set; }
        public string SelectedChapterNames { get; set; }
        public string SelectedStandardIDs { get; set; }
        public string SelectedStandardNames { get; set; }
        public string TracerQuestionIDs { get; set; }
        public string EPTextIDs { get; set; }
        public string StandardLabelAndEPLabels { get; set; }

        public bool IncludeAllSite { get; set; }

        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public string ReportType { get; set; }
        public string ReportDateTitle { get; set; }
        public string ReportTitle { get; set; }
      

        public bool IncludeFsa { get; set; }
        public int LevelIdentifier { get; set;}

        public bool IncludeTotalComObsValue { get; set; }
        public string TotalCompletedObsOperator { get; set; }
        public int TotalCompletedObsValue { get; set;}
        public bool TracerCompGreaterChecked { get; set; }
        public int TracerCompGreater { get; set; }
        public bool TracerCompBetweenChecked { get; set; }
        public int TracerCompBetweenLow { get; set; }
        public int TracerCompBetweenHigh { get; set; }
        public bool TracerCompLessChecked { get; set; }
        public int TracerCompLess { get; set; }
        public string ReportName { get; set; }
        public string ReportDescription { get; set; }
        public bool IncludeMinimumComValue { get; set; }
        public int MinimumComplianceValue { get; set; }
    }
}