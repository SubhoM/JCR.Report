using System;
using System.Collections.Generic;
using System.Linq;
using JCR.Reports.DataModel;
using JCR.Reports.Services;
namespace JCR.Reports.Models
{
    public class CorporateSearchList
    {
        public string ReportTitle { get; set; }
        public IEnumerable<Standard> AMPStandards { get; set; }
        public IEnumerable<EP> AMPEPs { get; set; }
        public ERGroupBYProgramLevel ERGroupBYProgramLevel { get; set; }

    }

    public class SearchEPScoringParams
    {
        //public SearchEPScoringParams()
        //{
        //    ResponseStatus = JCR.Reports.Common.WebConstants.OBSERVATION_COMPLETED;
        //}
        public int SiteID { get; set; }
        public string SiteName { get; set; }
        public int ProgramID { get; set; }
        public string ProgramName { get; set; }
        public int ChapterAll { get; set; }
        public string ChapterList { get; set; }
        public string ChapterNameList { get; set; }
        public int StandardAll { get; set; }
        public string StandardList { get; set; }
        public string StandardNameList { get; set; }
        public int ScoredByAll { get; set; }
        public string ScoredByList { get; set; }
        public string ScoredByNameList { get; set; }
        public string ScoreTypeList { get; set; }
        public string ScoreTypeNameList { get; set; }
        public string ScoreValueList { get; set; }
        public string ScoreValueNameList { get; set; }
        public int FSA { get; set; }
        public string FilterByList { get; set; }
        public string DocumentationList { get; set; }
        public int NotScoredInPeriod { get; set; }
        public string DocRequired { get; set; }
        public int DocRequiredValue { get; set; }
        public int NewChangedEPs { get; set; }
        public int chkIncludeCMS { get; set; }
        public int OrgNotes { get; set; }
        public int OrgFindings { get; set; }
        public int PlanOfAction { get; set; }
        public int LinkedDocs { get; set; }
        public DateTime? DateStart { get; set; }
        public DateTime? DateEnd { get; set; }

        public int? CertificationID { get; set; }
        public DateTime? StandardEffBeginDate { get; set; }
        public string ReportTitle { get; set; }
    }
    public class SearchEPAssignmentScoringParams : SearchEPScoringParams
    {
        public string AssignedToList { get; set; }
        public string AssignedToNameList { get; set; }
        public int EPAssigned { get; set; }
        public int EPNotAssigned { get; set; }
    }
    public class SearchEPNotScoredInPeriodParams : SearchEPScoringParams
    {
        public int ScoreType { get; set; }
    }
    public class SearchEPScoringReportFinalMockSurveyParams : SearchEPScoringParams
    {
        public string MockSurveyIDList { get; set; }
        public string MockSurveyNameList { get; set; }
        public int MockSurveyFindings { get; set; }
        public int MockSurveyRecommendations { get; set; }
        public bool IsCorporateAccess { get; set; }
    }

    public class SearchComprehensiveScoringParams
    {
        public int SiteID { get; set; }
        public string SiteName { get; set; }
        public int ProgramID { get; set; }
        public string ProgramName { get; set; }
        public int ChapterID { get; set; }
        public string ChapterName { get; set; }
        public int chkIncludeCMS { get; set; }
        public DateTime? DateStart { get; set; }
        public DateTime? DateEnd { get; set; }
        public bool IsCorporateAccess { get; set; }
        public int? CertificationID { get; set; }
        public DateTime? StandardEffBeginDate { get; set; }
        public string ReportTitle { get; set; }
    }
}