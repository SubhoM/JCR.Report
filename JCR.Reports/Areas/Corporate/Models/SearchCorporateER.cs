using System;
using System.Linq;

namespace JCR.Reports.Models
{
    public class SearchCorporateER : SearchCommon
    {

        //public string StandardLabelAndEPLabels { get; set; }
        //public DateTime? StartDate { get; set; }
        //public DateTime? EndDate { get; set; }
        //public string ReportType { get; set; }
       public string ScoreType { get; set; }
        //public string ReportDateTitle { get; set; }
        //public string ReportTitle { get; set; }

        public int MatrixID { get; set; }

        public string SelectedAssignedToIDs { get; set; }
        public string SelectedAssignedToNames { get; set; }
        public string SelectedAssignedByIDs { get; set; }
        public string SelectedAssignedByNames { get; set; }
        public bool IncludeFsa { get; set; }
        public bool IncludeRFI { get; set; }
        public bool docRequired { get; set; }
        public bool NewChangedEps { get; set; }

        public string SelectedMockSurveyIDs { get; set; }
         public string SelectedMockSurveyNames { get; set; }  
         public string SelectedMockSurveyLeadIDs { get; set; }    
         public string SelectedMockSurveyLeadNames { get; set; }    
         public string SelectedMockSurveyMemberIDs { get; set; }
         public string SelectedMockSurveyMemberNames { get; set; }

        public int MockSurveyStatusID { get; set; }

        public bool IncludePre { get; set; }
        public bool IncludeFin { get; set; }

    }
}