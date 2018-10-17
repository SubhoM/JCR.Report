using System;
using System.Linq;
using System.Web.Mvc;

namespace JCR.Reports.Models
{
    public class Search
    {
        public Search() {
            ResponseStatus = JCR.Reports.Common.WebConstants.OBSERVATION_COMPLETED;
        }

        public int SiteID { get; set; }

        public string SiteName { get; set; }
        public int ProgramID { get; set; }
        public string TracerCategoryIDs { get; set; }
        public string CMSTags { get; set; }
        public string TracerCMSTagsNames { get; set; }
        public string TracerQuestionIDs { get; set; }
        public string TopLeastCompliantQuestions { get; set; }
        public string TracerCategoryNames { get; set; }
        public bool AllTracers { get; set; }
        public string TracerListIDs { get; set; }
        public string TracerFrequencyIDs { get; set; }
        public string TracerListNames { get; set; }
        public string SelectedQuestionIDs { get; set; }
        public string TracerSectionListIDs { get; set; }
        public string TracerSectionListNames { get; set; }
        public string SelectedQuestionTracerIDs { get; set; }
        public string TracerChapterIDs { get; set; }
        public string TracerChapterNames { get; set; }
        public string TracerStandardIDs { get; set; }
        public string TracerStandardNames { get; set; }
        public string EPTextIDs { get; set; }
        public string StandardLabelAndEPLabels { get; set; }

        public string OrgTypeLevel1IDs { get; set; }
        public string OrgTypeLevel1Names { get; set; }
        public string OrgRanking1Header { get; set; }
        public string OrgTypeLevel2IDs { get; set; }

        public string OrgTypeLevel2Names { get; set; }
        public string OrgRanking2Header { get; set; }
        public string OrgTypeLevel3IDs { get; set; }
        public string OrgTypeLevel3Names { get; set; }
        public string OrgRanking3Header { get; set; }

        public string EnteredByIDs { get; set; }
        public string EnteredByNames { get; set; }

        public string AssignedToIDs { get; set; }
        public string AssignedToNames { get; set; }

        public string TracerStatusIDs { get; set; }
        public string TracerStatusNames { get; set; }
        public bool InActiveOrgTypes { get; set; }
        public bool IncludeNonCompliantOpportunities { get; set; }

        public bool IncludeDeptNoCompObs { get; set; }


        public int OpportunitiesValue { get; set; }

        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public string ReportNameOverride { get; set; }
        public string ReportDescription { get; set; }
        public string ReportID { get; set; }
        public string ReportType { get; set; }
        public string ReportDateTitle { get; set; }
        public string ReportTitle { get; set; }
        public bool IncludeFollowup { get; set; }

        public bool IncludeNA { get; set; }

        public bool IncludeFsa { get; set; }

        public string ReportTypeSumDet { get; set; }

        public string GroupByObsQues { get; set; }

        public string ReportGroupByType { get; set; }
        public int TopFindings { get; set; }
        public bool IncludeCMS { get; set; }

        public string Keyword { get; set; }

        // Mark Orlando 03/09/2015. 
        // The ResponseStatus property is used by the "Tracer Observation Status" reports. It references the 
        // column dbo.TracerResponse.ResponseStatusID. Value of -1 means the SP will not filter  out data 
        // based on the status of the observation. 
        public int ResponseStatus { get; set; }

        // Mark Orlando 03/11/2015. 
        // The ObservationStatusReportType property is used by the "Tracer Observation Status" reports. Its used
        // to allow the user to chose the detail or summary version of the report. Detail is the default.
        public string ObservationStatusReportType { get; set; }

        // Mark Orlando 03/11/2015. 
        // The ObservationStatus property is used by the "Tracer Observation Status" reports. Its used
        // to allow the user to whether the report should contain only completed observations, in-progress
        // observations, or both. ObservationStatus contains key value. ObservationStatusName is the title.
        public string ObservationStatus { get; set; }
        public string ObservationStatusName { get; set; }

        //public string Keyword { get; set; }

        public bool IncludeMinimalDenomValue { get; set; }
        public int MinimalDenomValue { get; set; }

        public string MonthlyReportType { get; set; }

        public string TracerStatusID { get; set; }

        public string EPMigrationChangeDate { get; set; }
        public string EPMigrationChangeType { get; set; }

        public string ActiveFrequencyName { get; set; }

        public string RegulationType { get; set; }
        public int TracerTypeID { get; set; }

        public bool IncludeHavingComplianceValue { get; set; }
        public string HavingComplianceOperator { get; set; }
        public int HavingComplianceValue { get; set; }

        public string HavingComplianceColor { get; set; }
        [AllowHtml]
        public string QuestionText { get; set; }
        public int QuestionID { get; set; }

        public string OutputDepartmentList { get; set; }

        public int SelectedTracerCustomID { get; set; }
        public bool IncludeTotalComObsValue { get; set; }
        public string TotalCompletedObsOperator { get; set; }
        public int TotalCompletedObsValue { get; set; }

        public bool TracerCompGreaterChecked { get; set; }
        public int TracerCompGreater { get; set; }
        public bool TracerCompBetweenChecked { get; set; }
        public int TracerCompBetweenLow { get; set; }
        public int TracerCompBetweenHigh { get; set; }
        public bool TracerCompLessChecked { get; set; }
        public int TracerCompLess { get; set; }

        public string DepartmentNames { get; set; }

        public string DepartmentIDs{ get; set; }
        //For department headers with special characters
        public string OrgTypeLevel1SpecialCaseNames { get; set; } 
    }
}