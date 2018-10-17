using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Linq;


namespace JCR.Reports.Models.Enums
{
    public enum ActionTaken
    {
        GuestLinksCreated = 1,
        ObservationsCreatedFromGuestLinks = 2,
        ObservationsCompleted = 3,
        ObservationsInProgress = 4,
        TracersPublished = 5,
        TracerEmailed = 6,
        TracerPrinted = 7,
        SiteLogin = 8,
        DepartmentComparativeAnalysisReport = 9,
        ComprehensiveTracerReport = 10,
        TracerByEPReport = 11,
        ComplianceByQuestionNewReport = 12,
        MonthlyQuestionBreakdownNewReport = 13,
        MonthlyTracerBreakdownNewReport = 14,
        OrganizationPriorityFindingsReport = 15,
        TJCPriorityFindingsReport = 16,
        TracerComplianceSummaryReport = 17,
        TracerControlChartReport = 18,
        ObservationStatusReport = 19,
        TracerTeamStatusReport = 20,
        TaskStatusReport = 21,
        TracerDepartmentAssignment=33,
        ReportsMenuTracers=48,
        ReportsMenuEnterpriseReporting=49,
        MySavedReportsTracers=50,
        MySavedReportsEnterpriseReporting = 51,
        MySitesSavedReportsTracers = 52,
        MySitesSavedReportsEnterpriseReporting = 53
    }

    public enum ActionTypeEnum
    {
        CMSComplianceReport = 95,
        EPAssignmentReport = 123,
        EPScoringReport = 49,
        TaskAssignmentReport = 50,
        DepartmentComparativeAnalysisReport = 9,
        MonthlyQuestionBreakdownReport = 13,
        MonthlyTracerBreakdownReport = 14,
        OrganizationPriorityFindingsReportOrganizationPriorityFindingsReport = 15,
        TaskStatusReport = 21,
        TracerByEPReport = 11,
        ComprehensiveTracerReport = 10,
        TracerControlChartReport = 18,
        ObservationStatusReport = 19,
        TracerTeamStatusReport = 20,
        TJCPriorityFindingsReport = 16,
        TracerComplianceSummaryReport = 17,
        EPsNotScoredinPeriod = 124,
        EPScoringReportFinalMockSurvey = 125,
        ComprehensiveScoringReport = 126,
        TaskReport = 163,
        TracerComplianceDepartment = 172
    }


    public enum LinkType
    {
        AmpHome = 1,
        EditionHome = 2,
        EcmHome = 3,
        EcmPlusHome = 4,
        TracersHome = 5,
        AmpFavoriteReport = 6,
        EnterpriseReport = 7,
        EnterpriseFavoriteReport = 8        
    }

    public enum EProductType
    {
        AMP = 1,
        Tracers = 2,
        Edition = 3,
        OrderProcessing = 4,
        DataExchange = 5,
        IPortal = 6,
        IApp = 7,
        CCM = 8,
        GlobalAdmin = 9,
        Portal = 10,
        Reports = 11,
        ER = 12,
        ECM = 13
    }

    public enum ReportsListEnum
    {
        DepartmentComparativeAnalysis = 7,
        ComprehensiveTracerReport = 8,
        TracerByEP = 9,
        TracerByCMS = 10,
        ComplianceByQuestion = 11,
        MonthlyQuestionBreakdown = 12,
        MonthlyTracerBreakdown = 13,
        OrganizationPriorityFindings = 14,
        TJCPriorityFindings = 15,
        TracerComplianceSummary = 16,
        TracerControlChart = 17,
        ObservationStatusReport = 18,
        TracerTeamStatusReport = 19,
        TaskStatusReport = 20,
        TracersByTJCStandard = 21,
        TracersComplianceSummary = 22,
        AMPCorporateReports=23,       
        QuestionEpRelation = 24,
        NewEP = 25,
        RFIFindingReport = 26,
        EPScoringReport = 27,
        TaskAssignment = 28,
        AssignmentStatusByUserReport = 29,
        EPAssignment = 30,
        SaferMatrix = 31,
        EPAssignmentScoring = 32,       
        TracerDepartmentAssignment = 33,
        CMSCompliance = 34,
        CMSMatrix = 35,
        ERTracerByQuestion = 36,
        EPsNotScoredinPeriod = 37,
        EPScoringReportFinalMockSurvey = 38,
        ComprehensiveScoringReport=39,
        ComplianceByDepartment = 40,
        ERComplianceByTracer = 41,
        TaskReport = 42,
        TracerComplianceDepartment = 44,
        ERTracerDashboard = 45
    }

    public enum ScheduleType
    {
        None,
        Daily,
        Weekly,
        Monthly,
        Quarterly
    }

    public enum ScheduleStatus
    {
        Inactive,
        Pending,
        Scheduled,
        InProgress,
        Complete
    }

    public enum LastRunStatus
    {
        NotRun,
        Success,
        Failure
    }

    public enum RenderFormatType
    {
        PDF = 1,
        Excel = 2,
        Word = 3
    }


    public enum Role
    {
        [Description("Staff Member")]
        Staffmember = 4,
        [Description("Team Coordinator")]
        Teamcoordinator = 3,
        [Description("Global Admin")]
        GlobalAdmin = 5,
        [Description("Support")]
        Support = 6,
        [Description("Program Administrator")]
        Programadministrator = 1,
        [Description("Site Manager")]
        Sitemanager = 2,
        [Description("Guest User")]
        Guestuser = 7,
        [Description("Mock Survey User")]
        CorporateUser = 8,
        [Description("Mock Survey Reviewer")]
        CorporateReviewer = 9
    }


    public enum MockSurveyStatus
    {
        [Description("Open")]
        Open = 1,
        [Description("Send for Review - Exec Summary")]
        Send_for_Review_Exec_Summary = 2,
        [Description("Publish Exec Summary")]
        Publish_Exec_Summary = 3,
        [Description("Send for Review - CCA Recommendations")]
        Send_for_Review_CCA_Recommendations = 4,
        [Description("Publish CCA Recommendation")]
        Publish_CCA_Recommendation = 5,
        [Description("Send CCA for POA Review")]
        Send_CCA_for_POA_Review = 6,
        [Description("Publish_CCA_Report_Final")]
        Publish_CCA_Report_Final = 7
    }            
}