using System;

namespace JCR.Reports.Models {
    public class MenuState {
        public bool HasError                { get; set; }
        public string ErrorMessage          { get; set; }
        public int UserID                   { get; set; }
        public string UserLogonID           { get; set; }
        public string FirstName             { get; set; }
        public string LastName              { get; set; }
        public int SiteID                   { get; set; }
        public string SiteName              { get; set; }
        public int EProductID               { get; set; }
        public int ProgramGroupTypeID       { get; set; }
        public int UserRoleID               { get; set; }
        public int ProgramID                { get; set; }
        public string ProgramName           { get; set; }
        public int CertificationItemID      { get; set; }
        public int PageID                   { get; set; }
        public bool IsCurrentCycle          { get; set; }
        public string CycleEffectiveDate    { get; set; }
        public int CycleID                  { get; set; }
        public string MockSurveyTitle       { get; set; }
        public bool AccessToEdition         { get; set; }
        public bool AccessToAMP             { get; set; }
        public bool AccessToTracers         { get; set; }
        public bool AccessToERAMP           { get; set; }
        public bool AccessToERTracers       { get; set; }
        public bool AccessToCMS             { get; set; }
        public bool AccessToMockSurvey      { get; set; }
        public bool UserIsMultiSiteAdmin    { get; set; }

        public MenuState() {
            HasError = false;
            ErrorMessage = string.Empty;
        }
    }
}