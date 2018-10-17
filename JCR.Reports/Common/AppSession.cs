using System;
using System.Diagnostics;
using System.Web;
using System.Collections.Generic;
using JCR.Reports.Models;


namespace JCR.Reports.Common
{
    [Serializable]
    public class AppSession
    {
        #region Fields

        private const int _cultureID = 1;

        private bool _firstTimeThruHomePage = true;

        private int _reportId;
        private int _reportScheduleId;
        private string _reportScheduleName = string.Empty;
        private string _reportScheduleDesc = string.Empty;
        private int _selectedProgramId;
        private string _selectedProgramName = string.Empty;        
        private int _selectedCertificationItemId;
        private bool _isCertificationProgram = false;
        private bool _isCMSProgram = false;

        private int _selectedSiteId;

        private string _selectedSiteName = string.Empty;
        private bool _isCorporateSite = false;
        private bool _hasTracersAccess = false;
        private int? _userID;
        private int? _roleID;
        private int? _cycleID;
        private string _authToken = string.Empty;
       
        private string _orgRanking3Name = string.Empty;
        private string _orgRanking2Name = string.Empty;
        private string _orgRanking1Name = string.Empty;
       
        private string _webApiUrl = string.Empty;
        private string _emailAddress = string.Empty;
        private string _firstName = string.Empty;
        private string _lastName = string.Empty;
        private string _fullName = string.Empty;
        private List<Models.UserSite> _sites = new List<UserSite>();

        private int _programGroupTypeID;
        private AccessToken _accessToken;
        private ERLevelInformation _erLevelInformation;
        private int _linkType;
        private string _directView;
        private string _helpLinkURL;
        private string _reportType;
        private int _pageID;
        private int _adminUserID = 0;
        private int _userOriginalRoleID = 0;
        private int _isUpdatedApplicationValid = 0;
        #endregion

        #region Public Properties

        public static int CultureID
        {
            [DebuggerStepThrough]
            get
            {
                return _cultureID;
            }
        }

        public static bool FirstTimeThruHomePage
        {
            [DebuggerStepThrough]
            get
            {
                return GetSession()._firstTimeThruHomePage;
            }

            [DebuggerStepThrough]
            set
            {
                GetSession()._firstTimeThruHomePage = value;
            }
        }

        public static string ReportType
        {
            [DebuggerStepThrough]
            get
            {
                return GetSession()._reportType;
            }

            [DebuggerStepThrough]
            set
            {
                GetSession()._reportType = value;
            }
        }

        public static bool HasValidSession
        {
            [DebuggerStepThrough]
            get
            {
                var session = GetSession();
                return session != null && session._userID != null;
                // return GetSession()._userID != null;
            }
        }

        public static int ReportID
        {
            [DebuggerStepThrough]
            get
            {
                return GetSession()._reportId;
            }

            [DebuggerStepThrough]
            set
            {
                GetSession()._reportId = value;
            }
        }
        public static int ReportScheduleID
        {
            [DebuggerStepThrough]
            get
            {
                return GetSession()._reportScheduleId;
            }

            [DebuggerStepThrough]
            set
            {
                GetSession()._reportScheduleId = value;
            }
        }
        public static string ReportScheduleName
        {
            [DebuggerStepThrough]
            get
            {
                return GetSession()._reportScheduleName;
            }

            [DebuggerStepThrough]
            set
            {
                GetSession()._reportScheduleName = value;
            }
        }
        public static string ReportScheduleDesc
        {
            [DebuggerStepThrough]
            get
            {
                return GetSession()._reportScheduleDesc;
            }

            [DebuggerStepThrough]
            set
            {
                GetSession()._reportScheduleDesc = value;
            }
        }
        public static int SelectedProgramId
        {
            [DebuggerStepThrough]
            get
            {
                return GetSession()._selectedProgramId;
            }

            [DebuggerStepThrough]
            set
            {
                GetSession()._selectedProgramId = value;
            }
        }

        public static string SelectedProgramName
        {
            [DebuggerStepThrough]
            get
            {
                return GetSession()._selectedProgramName;
            }

            [DebuggerStepThrough]
            set
            {
                GetSession()._selectedProgramName = value;
            }
        }

        public static int SelectedCertificationItemID {
            [DebuggerStepThrough]
            get
            {
                return GetSession()._selectedCertificationItemId;
            }

            [DebuggerStepThrough]
            set
            {
                GetSession()._selectedCertificationItemId = value;
            }
        }
        public static bool IsCertificationProgram
        {
            [DebuggerStepThrough]
            get
            {
                return GetSession()._isCertificationProgram;
            }

            [DebuggerStepThrough]
            set
            {
                GetSession()._isCertificationProgram = value;
            }
        }

        public static int SelectedSiteId
        {
            [DebuggerStepThrough]
            get
            {
                return GetSession()._selectedSiteId;
            }

            [DebuggerStepThrough]
            set
            {
                GetSession()._selectedSiteId = value;
            }
        }

        public static string SelectedSiteName
        {
            [DebuggerStepThrough]
            get
            {
                return GetSession()._selectedSiteName;
            }

            [DebuggerStepThrough]
            set
            {
                GetSession()._selectedSiteName = value;
            }
        }

        public static bool IsCorporateSite
        {
            [DebuggerStepThrough]
            get
            {
                return GetSession()._isCorporateSite;
            }

            [DebuggerStepThrough]
            set
            {
                GetSession()._isCorporateSite = value;
            }
        }

        public static int ProgramGroupTypeID {
            [DebuggerStepThrough]
            get {
                return GetSession()._programGroupTypeID;
            }

            [DebuggerStepThrough]
            set {
                GetSession()._programGroupTypeID = value;
            }
        }
        

        public static bool HasTracersAccess
        {
            [DebuggerStepThrough]
            get
            {
                return GetSession()._hasTracersAccess;
            }

            [DebuggerStepThrough]
            set
            {
                GetSession()._hasTracersAccess = value;
            }
        }
        
        public static string OrgRanking3Name
        {
            [DebuggerStepThrough]
            get
            {
                return GetSession()._orgRanking3Name;
            }

            [DebuggerStepThrough]
            set
            {
                GetSession()._orgRanking3Name = value;
            }
        }
        public static string OrgRanking2Name
        {
            [DebuggerStepThrough]
            get
            {
                return GetSession()._orgRanking2Name;
            }

            [DebuggerStepThrough]
            set
            {
                GetSession()._orgRanking2Name = value;
            }
        }
        public static string OrgRanking1Name
        {
            [DebuggerStepThrough]
            get
            {
                return GetSession()._orgRanking1Name;
            }

            [DebuggerStepThrough]
            set
            {
                GetSession()._orgRanking1Name = value;
            }
        }
        public static string SessionID
        {
            [DebuggerStepThrough]
            get
            {
                return HttpContext.Current.Session.SessionID;
            }
        }        
        public static int? UserID
        {
            [DebuggerStepThrough]
            get
            {
                return GetSession()._userID;
            }

            [DebuggerStepThrough]
            set
            {
                GetSession()._userID = value;
            }
        }
        public static string AuthToken {
            [DebuggerStepThrough]
            get {
                return GetSession()._authToken;
            }

            [DebuggerStepThrough]
            set {
                GetSession()._authToken = value;
            }
        }
        public static int? RoleID
        {
            [DebuggerStepThrough]
            get
            {
                return GetSession()._roleID;
            }

            [DebuggerStepThrough]
            set
            {
                GetSession()._roleID = value;
            }
        }
        public static int? CycleID
        {
            [DebuggerStepThrough]
            get
            {
                return GetSession()._cycleID;
            }

            [DebuggerStepThrough]
            set
            {
                GetSession()._cycleID = value;
            }
        }
        public static string EmailAddress
        {
            [DebuggerStepThrough]
            get
            {
                return GetSession()._emailAddress;
            }

            [DebuggerStepThrough]
            set
            {
                GetSession()._emailAddress = value;
            }
        }
        public static string FullName
        {
            [DebuggerStepThrough]
            get
            {
                return GetSession()._fullName;
            }

            [DebuggerStepThrough]
            set
            {
                GetSession()._fullName = value;
            }
        }
        public static string FirstName
        {
            [DebuggerStepThrough]
            get
            {
                return GetSession()._firstName;
            }

            [DebuggerStepThrough]
            set
            {
                GetSession()._firstName = value;
            }
        }
        public static string LastName
        {
            [DebuggerStepThrough]
            get
            {
                return GetSession()._lastName;
            }

            [DebuggerStepThrough]
            set
            {
                GetSession()._lastName = value;
            }
        }

        public static string WebApiUrl {
            [DebuggerStepThrough]
            get {
                return GetSession()._webApiUrl;
            }

            [DebuggerStepThrough]
            set {
                GetSession()._webApiUrl = value;
            }
        }
        public static List<Models.UserSite> Sites
        {
            [DebuggerStepThrough]
            get
            {
                return GetSession()._sites;
            }

            [DebuggerStepThrough]
            set
            {
                GetSession()._sites = value;
            }
        }

        public static AccessToken AccessToken
        {
            [DebuggerStepThrough]
            get
            {
                return GetSession()._accessToken;
            }

            [DebuggerStepThrough]
            set
            {
                GetSession()._accessToken = value;
            }
        }
        public static ERLevelInformation SessionERLevelInformation
        {
            [DebuggerStepThrough]
            get
            {
                if (GetSession() != null)
                {
                    return GetSession()._erLevelInformation;
                }

                return null;
            }

            [DebuggerStepThrough]
            set
            {
                GetSession()._erLevelInformation = value;
            }
        }

        public static int LinkType {
            [DebuggerStepThrough]
            get {
                int linkType = 0;

                // Mark Orlando 12/5/2017. Needed to support TEN. LinkType is set to 11, 5, or 10 depending on whether the user wants
                // to access Tracers, AMP, or EP Tracer Reports. Because page IDs are an integral part of project TEN (Integrated Menu)
                // it makes sense to have AppSession.LinkType be read-only and derived from AppSession.PageID.
                switch (AppSession.PageID) {
                    case 14:            // PageID 14 is Reports Menu|Compliance
                    case 15:            // PageID 15 is My Saved Reports|Compliance
                    case 16:            // PageID 16 is My Site's Saved Reports|Compliance
                        linkType = 11;  // 11: Compliance Reports  
                        break;

                    case 48:            // PageID 48 is Reports Menu|Tracers
                    case 50:            // PageID 50 is My Saved Reports|Tracers
                    case 52:            // PageID 52 is My Site's Saved Reports|Tracers
                        linkType = 5;   // 5: Tracer Reports
                        break;

                    case 49:           // PageID 49 is Reports Menu|ER Tracers
                    case 51:           // PageID 51 is My Saved Reports|ER Tracers
                    case 53:           // PageID 53 is My Site's Saved Reports|ER Tracers
                        linkType = 10; // 10: ER Tracer Reports
                        break;
                }
                return linkType;
            }
        }

        public static string DirectView
        {
            [DebuggerStepThrough]
            get
            {
                return GetSession()._directView;
            }

            [DebuggerStepThrough]
            set
            {
                GetSession()._directView = value;
            }
        }
        public static string HelpLinkURL
        {
            [DebuggerStepThrough]
            get
            {
                return GetSession()._helpLinkURL;
            }

            [DebuggerStepThrough]
            set
            {
                GetSession()._helpLinkURL = value;
            }
        }
        public static bool IsCMSProgram
        {
            [DebuggerStepThrough]
            get
            {
                return GetSession()._isCMSProgram;
            }

            [DebuggerStepThrough]
            set
            {
                GetSession()._isCMSProgram = value;
            }
        }

        public static int PageID {
            [DebuggerStepThrough]
            get {
                return GetSession()._pageID;
            }

            [DebuggerStepThrough]
            set {
                GetSession()._pageID = value;
            }
        }

        public static int AdminUserID {
            [DebuggerStepThrough]
            get {
                return GetSession()._adminUserID;
            }

            [DebuggerStepThrough]
            set {
                GetSession()._adminUserID = value;
            }
        }

        public static int UserOriginalRoleID {
            [DebuggerStepThrough]
            get {
                return GetSession()._userOriginalRoleID;
            }

            [DebuggerStepThrough]
            set {
                GetSession()._userOriginalRoleID = value;
            }
        }

        public static int IsUpdatedApplicationValid
        {
            [DebuggerStepThrough]
            get
            {
                return GetSession()._isUpdatedApplicationValid;
            }

            [DebuggerStepThrough]
            set
            {
                GetSession()._isUpdatedApplicationValid = value;
            }
        }
        #endregion

        #region Public Methods and Operators

        public static void AbandonSession()
        {
            HttpContext current = HttpContext.Current;
            current.Session.RemoveAll();
            current.Session.Abandon();
        }

        public static void CreateSession()
        {
            HttpContext current = HttpContext.Current;
            var session = new AppSession();
            current.Session[WebConstants.APP_SESSION_KEY] = session;
        }

        public static AppSession GetSession()
        {
            var session = HttpContext.Current.Session[WebConstants.APP_SESSION_KEY] as AppSession;            
            return session;
        }

        #endregion
    }
}