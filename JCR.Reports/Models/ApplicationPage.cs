using System.ComponentModel;

namespace JCR.Reports.Models.Enums
{
    public enum ApplicationPage
    {
        [Description("Tracers & Observations")]
        TracerHomePage = 1,

        [Description("Task Assignments")]
        TaskAssignments = 2,

        [Description("Create New Tracer")]
        CreateNewTracer = 3,

        [Description("Department Maintenance")]
        DepartmentMaintenance = 4,

        [Description("Copy Tracer to Other Sites")]
        CopyTracertoOtherSites = 5,

        [Description("Delete Tracer from Other Sites")]
        DeleteTracerfromOtherSites = 6,

        [Description("Standard/EP Changes in Latest Cycle")]
        StandardEPChangesinLatestCycle = 7,

        [Description("Standard/EP Changes in All Cycles")]
        StandardEPChangesinAllCycles = 8,

        [Description("JCR Templates Affected by Critical Changes in Latest Cycle")]
        JCRTemplatesAffectedbyCriticalChangesinLatestCycle = 9,

        [Description("EPs Not Referenced")]
        EPsNotReferenced = 10,

        UserPrompt = 11,
        GuestAccessHomePage = 12,

        [Description("Global Admin Home")]
        GlobalAdminTracersHomePage = 13,

        [Description("Create Report")]
        CreateReports = 14,

        [Description("My Reports")]
        MyReports = 15,

        [Description("Search All Reports")]
        SearchReports = 16,

        Error = 17,
        AccessDenied = 18,

        [Description("Create New TJC Tracer")]
        CreateNewTJCTracer = 19,

        [Description("Create New CMS Tracer")]
        CreateNewCMSTracer = 20,
        [Description("Guest Access Setup")]
        GuestAccessSetup = 22,
       [Description("Standards and Scoring")]
        StandardsAndScoring = 31,

        MockSurveySetUp = 32,
        SystemSurveySetting = 48,
        MockSurveyDashBoard = 33,
        ScoreAnalyzer = 34,
        DocumentationAnalyzer = 35,
        MockSurveyScoring = 36,
        CorporateFindingsEdit = 37,
        FSA = 38,

        [Description("New Scoring Assignments")]
        Assignment = 39,

        [Description("Bulk Scoring")]
        BulkUpdateScore = 40,

        [Description("Bulk Plan of Action")]
        BulkUpdatePOA = 41,

        [Description("Reassign EPs")]
        BulkReAssign = 42,

        [Description("Download RFI")]
        RFI = 43,

        [Description("User Site Maintenance")]
        UserSiteMaintenance = 44,

        [Description("EP Attribute Filters")]
        EPAttributeFilter = 45,

        [Description("Service Profile")]
        ServiceProfile = 46,

        [Description("CMS Regulations and Compliance")]
        CMSScoring = 47
    }
}