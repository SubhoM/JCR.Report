using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Linq;
using System.Text.RegularExpressions;

namespace JCR.Reports.Common
{
    /// <summary>
    /// WebConstants
    /// </summary>
    public static class WebConstants
    {
        public const string ENCRYPT_KEY = "jcr";
        public const string EMPTY_STRING = " ";
        public const string NEWLINE_ONE = "\r";
        public const string NEWLINE_TWO = "\n";
        public const string BREAKTAG = "<br>";
        public const string BREAKENDTAG = "<br/>";
        public const string AMPERSAND = "&amp;";
        public const string AMPER_SAND = "&";
        public const string QUOTE = "\"";
        public const string ESCAPED_QUOTE = "\"\"";
        public static char[] CHARACTERS_THAT_MUST_BE_QUOTED = { ',', '"', '\n', '\r' };
        public const string Copyright = " Joint Commission Resources";
        public const string Tracer_Copyright = " Joint Commission Resources";

        public const string SESSIONUSER = "TracerUser";

        public const string APP_SESSION_KEY = "__appSession";
        public const string DATA_LIMIT_EXCEL_VIEW = "Maximum limit of records reached. Refine your criteria to narrow the result.";
        public const string DATA_LIMIT_RDLC_VIEW = "Maximum limit of records reached. Refine your criteria to narrow the result.";
        public const string NO_DATA_FOUND_EXCEL_VIEW = "No Completed Observations found matching your criteria.";
        public const string NO_DATA_FOUND_RDLC_VIEW = "No Completed Observations found matching your criteria.";
        public const string NO_DATA_FOUND_EXCEL_VIEW_OSR = "No Observations found matching your criteria.";
        public const string NO_DATA_FOUND_RDLC_VIEW_OSR = "No Observations found matching your criteria.";
        public const string NO_DATA_FOUND_EXCEL_VIEW_TSR = "No data found matching your criteria.";
        public const string NO_DATA_FOUND_RDLC_VIEW_TSR = "No data found matching your criteria.";
        public const string NO_DATA_FOUND_TASK_REPORT = "No Task found matching your criteria.";

        //Common Pages
        public const string LOGIN_PAGE = @"~/Login.aspx";
        public const string INFO_PAGE = @"~/Info.aspx";


        // Messages shared by Reports
        public const string Tooltip_GenerateReport = "Generate report to display below";
        public const string Tooltip_EmailReport = "Email the report to the email address specified in EMAIL TO";
        public const string Confirm_EmailReport = "Are you sure you wish to email the report?";


        public const string USER_FRIENDLY_ERROR_MESSAGE = "An error occurred within the application...<br/>" +
           "The error was logged and it will be reviewed by the support team.<br/>We apologize for the inconvenience.<br />" +
           "If this error persists, please contact Customer Support at 888-527-9255 or by email at " +
           "<a style=\'padding:0 10px;color:\'#9f6000\'\' href=\'mailto:support@jcrinc.com\'>support@jcrinc.com</a>";

        public const int OBSERVATION_COMPLETED = 8;

        //Email functionality
        public const string Email_Success = "Successfully sent report to the email account(s)";
        public const string Excel_Email_Success = "Successfully sent report to the email account(s)";
        public const string Email_Failed = "Unable to send report to the email account(s). Please contact Customer Support.";
        public const string Excel_Email_Failed = "Unable to send report to the email account(s). Please contact Customer Support.";
        public const string TRACER_REPORT_TITLE_DEPARTMENT_COMPARATIVE_ANALYSIS = "MSG-052";
        public const string TRACER_REPORT_TITLE_TRACER_PRIORITY_FINDING = "MSG-053";
        public const string TRACER_REPORT_TITLE_TRACER_COMPREHENSIVE_REPORT = "MSG-054";
        public const string TRACER_REPORT_TITLE_TEAM_STATUS_REPORT = "MSG-055";
        public const string TRACER_REPORT_TITLE_TRACER_STATUS_REPORT = "MSG-056";
        public const string TRACER_REPORT_TITLE_TASK_STATUS_REPORT = "MSG-057";
        public const string TRACER_REPORT_TITLE_TRACE_BY_EP_REPORT = "MSG-058";
        public const string TRACER_REPORT_TITLE_TRACE_BY_PFA_REPORT = "MSG-068";
        public const string TRACER_REPORT_TITLE_TJC_STANDARDS_REPORT = "MSG-069";
        public const string TRACER_REPORT_TITLE_COMPLIANCE_BY_DEPARTMENT = "MSG-085";
        public const string TRACER_REPORT_TITLE_TRACER_COMPLIANCE_DEPARTMENT = "MSG-086";
        public const string TRACER_REPORT_TITLE_TRACER_CONTROL_CHART_REPORT = "MSG-071";
        public const string TRACER_REPORT_TITLE_TRACER_COMPLIANCE_SUMMARY_REPORT = "MSG-072";
        public const string TRACER_REPORT_TITLE_COMPREHENSIVE_TRACER_EXPORT_REPORT = "MSG-073";
        public const string TRACER_REPORT_TITLE_COMPLIANCE_BY_QUESTION = "MSG-076";
        public const string TRACER_REPORT_TITLE_MONTHLY_QUESTION_BREAKDOWN = "MSG-077";
        public const string TRACER_REPORT_TITLE_MONTHLY_TRACER_BREAKDOWN = "MSG-078";
        public const string TRACER_REPORT_TITLE_TRACE_BY_CMS_REPORT = "MSG-079";
        public const string ERTRACER_REPORT_TITLE_Tracer_By_TJC_Standard = "MSG-080";
        public const string ERTRACER_REPORT_TITLE_Tracer_Compliance_Summary = "MSG-081";
        public const string ERTRACER_REPORT_TITLE_Tracer_By_Question_Report = "Tracer By Question Report";
        public const string ERTRACER_REPORT_TITLE_Compliance_By_Tracer_Report = "UHS Tracer Compliance Dashboard";
        public const string ERTRACER_REPORT_TITLE_Tracer_Dashboard_Report = "Tracer Dashboard";
        public const string TRACER_REPORT_TITLE_Question_EP_Relation_REPORT = "MSG-082";
        public const string TRACER_REPORT_TITLE_NEW_EP_REPORT = "MSG-083";
        public const string TRACER_REPORT_TITLE_TRACERDEPARTMENT_ASSIGNMENT_REPORT = "MSG-084";
        public const string CORP_REPORT_TITLE_FINDING_REPORT = "Mock Survey Priority Findings Report";
        public const string RFI_REPORT_TITLE_FINDING_REPORT = "Priority Findings RFI Report";
        public const string AMP_TASK_ASSIGNMENT_REPORT = "Task Assignment Report";
        public const string AMP_TASK_REPORT = "Task Report";
        public const string AMP_EP_ASSIGNMENT_REPORT = "EP Assignments by Chapter";
        public const string AMP_EP_SCORING_REPORT = "EP Scoring Report";
        public const string AMP_SAFER_MATRIX_REPORT = "Safer Matrix Report";
        public const string CHAPTER = "Chapter";
        public const string Standard = "Standard";
        public const string AMP_ASSIGNMENT_STATUS_BY_USER_REPORT = "Assignment Status by User Report";
        public const string AMP_EP_ASSIGNMENT_SCORING_REPORT = "Individual and Preliminary Scoring";
        public const string AMP_CMS_COMPLIANCE_REPORT = "CMS Compliance Report";
        public const string AMP_EP_NOT_SCORED_IN_PERIOD_REPORT = "EPs Not Scored in Period";
        public const string AMP_EP_SCORING_REPORT_FINAL_AND_MOCK_SURVEY = "Final and Mock Survey Scoring";
        public const string AMP_EP_SCORING_REPORT_FINAL = "Final Scoring";
        public const string AMP_COMPREHENSIVE_SCORING_REPORT = "Comprehensive Scoring Report";

        public const string TRACERS_CATEGORY = "TracersCategory";
        public const string TRACERS_CUSTOM = "TracersCustom";
        public const string TRACERS_CHAPTER = "TracersChapter";
        public const string TRACERS_STANDARD = "TracersStandard";
        public const string TRACERS_FREQUENCY = "TracersFrequency";
        public const string TRACERS_EP = "TracersEP";
        public const string ORG_CAMPUS = "OrgCampus";
        public const string ORG_BUILDING = "OrgBuilding";
        public const string ORGTYPE_CHECKBOX = "Orgtypecheckbox";
        public const string OBSERVATION_STATUS = "ObservationStatus";
        public const string PROGRAM_SERVICES = "ProgramServices";
        public const string INCLUDE_FSA = "IncludeFSAcheckbox";
        public const string TRACERS_STATUS = "TracerStatus";
        // Add constant headers for Parameter Names
        public const string PARAM_SiteName = "Site Name";
        public const string PARAM_ProgramName = "Program Name";
        public const string PARAM_TracerCategories = "Tracer Category";
        public const string PARAM_TracerName = "Tracer Name";
        public const string PARAM_ReportType = "Report Type";
        public const string PARAM_ReportGroupByType = "Group By";
        public const string PARAM_CompliancePercent = "Percentage compliance of non-compliant question";
        public const string PARAM_IncludeCompliancePercent = "Include details of non-compliant questions";
        public const string PARAM_IncludeMinimalDenominator = "Include minimal total denominator";
        public const string PARAM_IncludeMinimalDenominatorValue = "Minimal total denominator value";
        public const string PARAM_IncludeDeptNoCompObs = "Include all Departments";
        public const string PARAM_StartDate = "Start Date";
        public const string PARAM_EndDate = "End Date";
        public const string PARAM_FollowupRequired = "Only include with Follow-up required";
        public const string PARAM_IncludeNA = "Include Not Applicable";
        public const string PARAM_FSA = "Include FSA EPs";
        public const string PARAM_ShowCMS = "Include CMS Crosswalk";
        public const string PARAM_AssignedToNames = "Assigned To";
        public const string PARAM_UpdatedByNames = "Updated By";
        public const string PARAM_TaskStatus = "Task Status";
        public const string PARAM_ChapterNames = "Chapter";
        public const string PARAM_StandardLabels = "Standards";
        public const string PARAM_EPLabels = "EPs";
        public const string PARAM_TracerType = "Tracer Type";
        public const string PARAM_ObservationStatusNames = "Observation Status";
        public const string PARAM_TopFindings = "Top Findings";
        public const string PARAM_AllQuestions = "Across All Tracers";
        public const string PARAM_Keyword = "Keyword";
        public const string PARAM_SelectedQuestions = "Selected Questions";
        public const string PARAM_CMSTagNames = "Tag";
        public const string PARAM_TopLeastCompliantQuestionsValue = "Top Least Compliant Questions Value";
        public const string REPORT_FORMAT_PDF = "PDF";
        public const string REPORT_FORMAT_EXCEL = "EXCELOPENXML";

        public const int CERTIFICATION_PROGRAM_ID = 67;
        public const int LUNG_VOLUME_REDUCTION_SURGERY = 1345;
        public const int VENTRICULAR_ASSIST_DEVICE = 1346;

        public enum ProductEnum
        {
            Accreditation = 1,
            Certification = 2
        }

        public enum ProductID
        {
            AMP=1,
            Tracer=2,
            TracerER=12
        }
        public enum ReportCategoryID
        {
            AMPER = 1,
            Tracer = 2,
            TracerER = 3,
            AMP = 4
        }

        public enum Role
        {          

        [Description("Staff Member")]
        StaffMember = 4,
        [Description("Team Coordinator")]
        TeamCoordinator = 3,
        [Description("Global Admin")]
        GlobalAdmin = 5,
        [Description("Support")]
        Support = 6,                                                                                       
        [Description("Program Administrator")]                                           
        ProgramAdministrator = 1,
        [Description("Site Manager")]
        SiteManager = 2,                          
        [Description("Guest User")]
        Guestuser=7,
        [Description("Mock Survey User")]
        MockSurveyUser = 8,
        [Description("Mock Survey Reviewer")]
        MockSurveyReviewer = 9
        }

        public enum ProgramType
        {
            Hospital = 2,
            NursingCareCenter = 5,
            BehavioralHealth = 6,
            Laboratory = 21,
            HomeCare = 22,
            Ambulatory = 23,
            MedicareBasedLTC = 46,
            DiseaseSpecificCare = 67,
            OfficeBasedSurgery = 68,
            CriticalAccessHospitals = 69
        }

        //Used for Save and Schedule action types
        public enum ActionType
        { 
            Edit = 1,
            Generate = 2,
            Copy = 3,
            Delete = 4
        }

        public enum EPAssignmentLevels
        {
            
            Level1_Site = 1,
            Level2_Chapter = 2,
            Level3_Standard = 3,
            Level4_EP = 4
        }

        public enum TracerByTJCStandardLevels
        {
            Level1_Program = 1,
            Level2_Site = 2,
            Level3_Chapter = 3,
            Level4_Standard = 4,
            Level5_EP = 5,
            Level6_EPDetails = 6
        }

        public enum TracerComplianceSummaryLevels
        {
            Level1_Program = 1,
            Level2_Site = 2,
            Level3_Tracer = 3,
            Level4_Question = 4,
            Level5_QuestionDetails = 5
        }
        public enum ERTracerByQuestionLevels
        {
            Level1_Program = 1,
            Level2_Tracer = 2,
            Level3_Question = 3,
            Level4_Site = 4,
            Level5_QuestionDetails = 5
        }

        public enum CorporateSummaryLevels
        {
            Level1_Program = 1,
            Level2_Chapter = 2,           
            Level3_Standard =3,
            Level4_EP = 4,
            Level5_EPDetails = 5
        }

        public enum SaferMatrixLevels
        {
            Level1_Program = 1, 
            Level2_Site = 2,
            Level3_Chapter = 3,
            Level4_EP = 4
        }

        public enum LevelTypeIdentifier
        {
            Graph = 1,
            Summary = 2,
            Detail = 3
        }


        public enum RFISummaryLevels
        {
            Level1_Program = 1,
            Level2_Chapter = 2,
            Level3_Standard = 3,
            Level4_EP = 4,
            Level5_EPDetails = 5
        }
        public enum ReportFormat
        {
            PDF = 1,
            EXCEL = 2
        }

        public enum MonthlyReportType
        {
            ByQuestion = 1,
            ByTracer = 2
        }

        public enum LinkType {
            AmpHome = 1,
            EditionHome = 2,
            EcmHome = 3,
            EcmPlusHome = 4,
            TracersHome = 5,
            AmpFavoriteReport = 6,
            EnterpriseReportHome = 7,
            EnterpriseFavoriteReport = 8,
            EditionMobile = 9,
            EnterpriseReportTracers = 10,
            AMPCorporateReports = 11,
            AMPCorpScoring = 12,
            AMPSiteScoring = 13
        }

        public enum UserPreferenceType
        {
            Site = 1,
            Program = 2,
            Chapter = 3,
            ViewEP = 4,
            Cycle = 5,
            ScoreAnalyzerStartDate = 6,
            ScoreAnalyzerEndDate = 7,
            OutdatedDate = 8,
            EPAttributeFilter = 9,
            ServiceProfile = 10,
            StandardEffBeginDate = 11
        }

        /// <summary>
        /// This method returns the user's role for the selected site. The role is parsed such that a 
        /// space is inserted wherever the case changes.
        /// </summary>
        /// <returns></returns>
        public static string GetRoleForSelectedSite()
        {
            var roleDescr = string.Empty;
            var firstOrDefault = AppSession.Sites.FirstOrDefault(usm => usm.SiteID == AppSession.SelectedSiteId);
            if (firstOrDefault != null) {
                AppSession.RoleID = firstOrDefault.RoleID;
                Role userRole = (Role)Enum.Parse(typeof(Role), firstOrDefault.RoleID.ToString());
                roleDescr = Regex.Replace(userRole.ToString(), @"(\B[A-Z])", @" $1");
            }
            return roleDescr;
        }
        public enum ERReportDisplayGroup
        {
            Scoring_Report = 1,
            Assignment_Report = 2,
            Mock_Survey_Report = 3,
            CMS_Report = 4
        }
        public enum SubscriptionType
        {
            CMS_Tracers = 13,
            CMS_AMP = 14
        }

        public static int GetActionTypeId(int reportId)
        {
            int actionTypeId = 0;
            Dictionary<int, int> actionTypeDic = new Dictionary<int, int>();
            actionTypeDic.Add(1, 22);
            actionTypeDic.Add(2, 23);
            actionTypeDic.Add(3, 24);
            actionTypeDic.Add(4, 25);
            actionTypeDic.Add(5, 26);
            actionTypeDic.Add(6, 27);
            actionTypeDic.Add(7, 9);
            actionTypeDic.Add(8, 10);
            actionTypeDic.Add(9, 11);
            actionTypeDic.Add(10, 28);
            actionTypeDic.Add(11, 12);
            actionTypeDic.Add(12, 13);
            actionTypeDic.Add(13, 14);
            actionTypeDic.Add(14, 15);
            actionTypeDic.Add(15, 16);
            actionTypeDic.Add(16, 30);
            actionTypeDic.Add(17, 18);
            actionTypeDic.Add(18, 19);
            actionTypeDic.Add(19, 20);
            actionTypeDic.Add(20, 21);
            actionTypeDic.Add(21, 29);
            actionTypeDic.Add(22, 17);
            actionTypeDic.Add(23, 120);
            actionTypeDic.Add(24, 93);
            actionTypeDic.Add(25, 92);
            actionTypeDic.Add(26, 48);
            actionTypeDic.Add(27, 49);
            actionTypeDic.Add(28, 50);
            actionTypeDic.Add(29, 51);
            actionTypeDic.Add(30, 52);
            actionTypeDic.Add(31, 53);
            actionTypeDic.Add(33, 94);
            actionTypeDic.Add(34, 95);
            actionTypeDic.Add(35, 96);
            actionTypeDic.Add(36, 119);
            actionTypeDic.Add(32, 123);
            actionTypeDic.Add(37, 124);
            actionTypeDic.Add(38, 125);
            actionTypeDic.Add(39, 126);
            actionTypeDic.Add(40, 161);
            actionTypeDic.Add(42, 163);
            actionTypeDic.Add(44, 172);
            actionTypeDic.Add(45, 173);
            if (actionTypeDic.ContainsKey(reportId))
            {
                actionTypeId = actionTypeDic[reportId];
            }

            return actionTypeId;
        }
    }
    public enum AssignmentStatusByUserSummaryLevels
    {
        Level1_ByUser = 1,
        Level2_ByChapter = 2,
        Level3_ByStandard = 3,
        Level4_ByEPDetails = 4
    }
}