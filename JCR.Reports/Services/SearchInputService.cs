using System;
using System.Collections.Generic;
using System.Linq;
using System.Data;
using System.Data.SqlClient;
using System.Text.RegularExpressions;
using JCR.Reports.Models;
using System.Configuration;
using JCR.Reports.Common;
using JCR.Reports.Models.Enums;
using System.Net.Http;

namespace JCR.Reports.Services
{
    /// <summary>
    /// Class to handle data operations and interactions with Models
    /// </summary>
    public class SearchInputService : BaseService
    {
        /// <summary>
        /// Constructors
        /// </summary>
        public SearchInputService()
            : base()
        {
        }

        public SearchInputService(string connectionString)
            : base(connectionString)
        {
        }

        #region Public methods for action and initial load

        /// <summary>
        /// Get Default values  values for all applicable parameters
        /// </summary>
        /// <returns>SearchList </returns>
        public SearchList GetSearchLists(string messageCode = "")
        {
            SearchList searchlist = new SearchList();
            Search search = new Search();
            searchlist.TracersCategories = GetTracersCategories().TracersCategories.ToList();
            searchlist.TracersLists = GetTracersList("").TracersLists.ToList();
            searchlist.TracerSectionsLists = GetTracerSectionsList("").TracerSectionsLists.ToList();
            searchlist = GetOrgnizationTypeList(searchlist, search);

            if (!string.IsNullOrWhiteSpace(messageCode))
                searchlist.ReportTitle = GetReportTitle(messageCode);

            return searchlist;

        }

        /// <summary>
        /// Loads the saved parameters
        /// </summary>
        /// <param name="reportScheduleID"></param>
        /// <param name="messageCode"></param>
        /// <returns></returns>
        public SearchList GetSearchListsForSavedParameters(int reportScheduleID, SaveAndSchedule savedParameters, string messageCode = "")
        {
            SearchList searchlist = new SearchList();
            Search search = new Search();

            searchlist.TracersCategories = GetTracersCategories().TracersCategories.ToList();
            searchlist.TracersLists = GetTracersList(GetParameterValue(savedParameters.ReportParameters, WebConstants.TRACERS_CATEGORY)).TracersLists.ToList();
            //var tracersIDList = String.Join(",", searchlist.TracersLists.Select(t => t.TracerCustomID));
            //searchlist.TracerSectionsLists = GetTracerSectionsList(GetParameterValue(savedParameters.ReportParameters, WebConstants.TRACERS_CUSTOM)).TracerSectionsLists.ToList();

            search.OrgTypeLevel3IDs = GetParameterValue(savedParameters.ReportParameters, WebConstants.ORG_CAMPUS);
            search.OrgTypeLevel2IDs = GetParameterValue(savedParameters.ReportParameters, WebConstants.ORG_BUILDING);
            search.InActiveOrgTypes = GetParameterValue(savedParameters.ReportParameters, WebConstants.ORGTYPE_CHECKBOX) == "True" ? true : false;

            searchlist = GetOrgnizationTypeList(searchlist, search);

            if (!string.IsNullOrWhiteSpace(messageCode))
                searchlist.ReportTitle = GetReportTitle(messageCode);

            return searchlist;
        }
        public SearchList GetSearchLists_QuestionEPRelation(string messageCode = "")
        {
            SearchList searchlist = new SearchList();
            Search search = new Search();
            if(AppSession.RoleID == (int)Role.GlobalAdmin)
            {
                searchlist.TracersLists = GetAllTemplatesList().TracersLists.ToList();
            }
            else
            {
                searchlist.TracersLists = GetAllTracersList().TracersLists.ToList();
            }

            if (!string.IsNullOrWhiteSpace(messageCode))
                searchlist.ReportTitle = GetReportTitle(messageCode);

            return searchlist;
        }

        public SearchList GetSearchLists_DepartmentAssignment(string messageCode = "")
        {
            SearchList searchlist = new SearchList();
            Search search = new Search();

            
            
            //load department assignment Frequency.
            searchlist = GetTracerFreqencyLists(string.Empty);

            searchlist.TracersCategories = SelectTDSTracerCategories(AppSession.SelectedSiteId, AppSession.SelectedProgramId);

            searchlist.TracersLists = SelectAllTracerListBasedOnDepartmentAssignment(AppSession.SelectedSiteId,
                                            AppSession.SelectedProgramId, string.Empty, string.Empty);
            searchlist = GetOrgnizationTypeList(searchlist, search);
            
            if (!string.IsNullOrWhiteSpace(messageCode))
                searchlist.ReportTitle = GetReportTitle(messageCode);

            return searchlist;

        }

        public SearchList GetSavedParameters_QuestionEPRelation(int reportScheduleID, SaveAndSchedule savedParameters, string messageCode)
        {
            SearchList searchlist = new SearchList();
            Search search = new Search();
            searchlist.TracersLists = GetAllTracersList(GetParameterValue(savedParameters.ReportParameters, WebConstants.TRACERS_STATUS)).TracersLists.ToList();

            if (!string.IsNullOrWhiteSpace(messageCode))
                searchlist.ReportTitle = GetReportTitle(messageCode);

            return searchlist;
        }

        public SearchList GetSearchLists_ComplianceQuestion(string messageCode = "")
        {
            SearchList searchlist = new SearchList();
            Search search = new Search();
            searchlist.TracersLists = GetTracersList("").TracersLists.ToList();

            searchlist.TracerSectionsLists = GetTracerSectionsList("").TracerSectionsLists.ToList();
            searchlist = GetOrgnizationTypeList(searchlist, search);

            if (!string.IsNullOrWhiteSpace(messageCode))
                searchlist.ReportTitle = GetReportTitle(messageCode);

            return searchlist;
        }

        public SearchList GetSearchLists_ComplianceDepartment(string messageCode = "")
        {
            SearchList searchlist = new SearchList();
            Search search = new Search();
            searchlist.TracersLists = GetTracersList("").TracersLists.ToList();

            searchlist.TracerSectionsLists = GetTracerSectionsList("").TracerSectionsLists.ToList();
            searchlist = GetOrgnizationTypeList(searchlist, search);

            if (!string.IsNullOrWhiteSpace(messageCode))
                searchlist.ReportTitle = GetReportTitle(messageCode);

            return searchlist;
        }
        public ERSearchList GetSearchLists_ByTJCStandard(string messageCode = "")
        {
            ERSearchList searchlist = new ERSearchList();

            if (!string.IsNullOrWhiteSpace(messageCode))
                searchlist.ReportTitle = GetReportTitle(messageCode);

            return searchlist;
        }
        public ERSearchList GetSavedParameters_ByTJCStandard(int reportScheduleID, SaveAndSchedule savedParameters, string messageCode)
        {
            ERSearchList searchlist = new ERSearchList();
            ERSearchInputService reportservice = new ERSearchInputService();
            string selectedSites = string.Join(",", savedParameters.ReportSiteMaps.Select(siteMaps => siteMaps.SiteID).ToList());
            string selectedPrograms = GetParameterValue(savedParameters.ReportParameters, WebConstants.PROGRAM_SERVICES);
            string selectedChapters = GetParameterValue(savedParameters.ReportParameters, WebConstants.TRACERS_CHAPTER);
            string selectedStandards = GetParameterValue(savedParameters.ReportParameters, WebConstants.TRACERS_STANDARD);

            searchlist.TracersStandards = reportservice.GetMultiSiteStandards(selectedPrograms, selectedChapters).TracersStandards;
            searchlist.TracersEPs = reportservice.GetMultiSiteEps(selectedPrograms, selectedChapters, selectedStandards).TracersEPs;

            if (!string.IsNullOrWhiteSpace(messageCode))
                searchlist.ReportTitle = GetReportTitle(messageCode);

            return searchlist;
        }

        public ERSearchList GetSearchLists_ComplianceSummary(string messageCode = "")
        {
            ERSearchList searchlist = new ERSearchList();

            if (!string.IsNullOrWhiteSpace(messageCode))
                searchlist.ReportTitle = GetReportTitle(messageCode);

            return searchlist;
        }

        public ERSearchList GetERTracerByQuestion(string ReportTitle = "")
        {
            ERSearchList searchlist = new ERSearchList();

            searchlist.ReportTitle = ReportTitle;

            return searchlist;
        }

        public ERSearchList GetERComplianceByTracer(string ReportTitle = "")
        {
            ERSearchList searchlist = new ERSearchList();

            searchlist.ReportTitle = ReportTitle;

            return searchlist;
        }

        public SearchList GetSavedParameters_ComplianceQuestion(int reportScheduleID, SaveAndSchedule savedParameters, string messageCode)
        {
            SearchList searchlist = new SearchList();
            Search search = new Search();
            searchlist.TracersLists = GetTracersList("").TracersLists.ToList();

            searchlist.TracerSectionsLists = GetTracerSectionsList("").TracerSectionsLists.ToList();

            search.OrgTypeLevel3IDs = GetParameterValue(savedParameters.ReportParameters, WebConstants.ORG_CAMPUS);
            search.OrgTypeLevel2IDs = GetParameterValue(savedParameters.ReportParameters, WebConstants.ORG_BUILDING);
            search.InActiveOrgTypes = GetParameterValue(savedParameters.ReportParameters, WebConstants.ORGTYPE_CHECKBOX) == "True" ? true : false;
            searchlist = GetOrgnizationTypeList(searchlist, search);

            if (!string.IsNullOrWhiteSpace(messageCode))
                searchlist.ReportTitle = GetReportTitle(messageCode);

            return searchlist;
        }

        public SearchList GetSavedParameters_ComplianceDepartment(int reportScheduleID, SaveAndSchedule savedParameters, string messageCode)
        {
            SearchList searchlist = new SearchList();
            Search search = new Search();
            searchlist.TracersLists = GetTracersList("").TracersLists.ToList();

            searchlist.TracerSectionsLists = GetTracerSectionsList("").TracerSectionsLists.ToList();

            search.OrgTypeLevel3IDs = GetParameterValue(savedParameters.ReportParameters, WebConstants.ORG_CAMPUS);
            search.OrgTypeLevel2IDs = GetParameterValue(savedParameters.ReportParameters, WebConstants.ORG_BUILDING);
            search.InActiveOrgTypes = GetParameterValue(savedParameters.ReportParameters, WebConstants.ORGTYPE_CHECKBOX) == "True" ? true : false;
            searchlist = GetOrgnizationTypeList(searchlist, search);

            if (!string.IsNullOrWhiteSpace(messageCode))
                searchlist.ReportTitle = GetReportTitle(messageCode);

            return searchlist;
        }

        public SearchList GetSavedParameters_DepartmentAssignment(int reportScheduleID, SaveAndSchedule savedParameters, string messageCode)
        {
            SearchList searchlist = new SearchList();
            Search search = new Search();

         
            searchlist = GetTracerFreqencyLists(GetParameterValue(savedParameters.ReportParameters, WebConstants.TRACERS_CATEGORY));

            search.OrgTypeLevel3IDs = GetParameterValue(savedParameters.ReportParameters, WebConstants.ORG_CAMPUS);
            search.OrgTypeLevel2IDs = GetParameterValue(savedParameters.ReportParameters, WebConstants.ORG_BUILDING);
            search.InActiveOrgTypes = GetParameterValue(savedParameters.ReportParameters, WebConstants.ORGTYPE_CHECKBOX) == "True" ? true : false;
            searchlist = GetOrgnizationTypeList(searchlist, search);
            searchlist.TracersCategories = SelectTDSTracerCategories(AppSession.SelectedSiteId, AppSession.SelectedProgramId);
            searchlist.TracersLists = SelectAllTracerListBasedOnDepartmentAssignment(AppSession.SelectedSiteId,
                                                       AppSession.SelectedProgramId,
                                                       GetParameterValue(savedParameters.ReportParameters, WebConstants.TRACERS_FREQUENCY),
                                                       GetParameterValue(savedParameters.ReportParameters, WebConstants.TRACERS_CATEGORY));
            if (!string.IsNullOrWhiteSpace(messageCode))
                searchlist.ReportTitle = GetReportTitle(messageCode);

            return searchlist;
        }

        public SearchList GetSearchLists_TeamStatus(string messageCode)
        {
            SearchList searchlist = new SearchList();
            Search search = new Search();
            searchlist.TracersCategories = GetTracersCategories().TracersCategories.ToList();
            searchlist.TracersLists = GetTracersList("").TracersLists.ToList();
            searchlist = GetOrgnizationTypeList(searchlist, search);
            searchlist = GetTracersObsEnteredBy(searchlist, search);

            searchlist.ReportTitle = GetReportTitle(messageCode);
            return searchlist;

        }

        public SearchList GetSavedParameters_TeamStatus(int reportScheduleID, SaveAndSchedule savedParameters, string messageCode)
        {
            SearchList searchlist = new SearchList();
            Search search = new Search();
            searchlist.TracersCategories = GetTracersCategories().TracersCategories.ToList();
            searchlist.TracersLists = GetTracersList(GetParameterValue(savedParameters.ReportParameters, WebConstants.TRACERS_CATEGORY)).TracersLists.ToList();

            search.OrgTypeLevel3IDs = GetParameterValue(savedParameters.ReportParameters, WebConstants.ORG_CAMPUS);
            search.OrgTypeLevel2IDs = GetParameterValue(savedParameters.ReportParameters, WebConstants.ORG_BUILDING);
            search.InActiveOrgTypes = GetParameterValue(savedParameters.ReportParameters, WebConstants.ORGTYPE_CHECKBOX) == "True" ? true : false;
            searchlist = GetOrgnizationTypeList(searchlist, search);

            //Updated by users list should be independent of Organization items
            search.OrgTypeLevel3IDs = string.Empty;
            search.OrgTypeLevel2IDs = string.Empty;
            searchlist = GetTracersObsEnteredBy(searchlist, search);

            searchlist.ReportTitle = GetReportTitle(messageCode);
            return searchlist;

        }

        public SearchList GetSearchLists_TaskStatus(string messageCode)
        {
            SearchList searchlist = new SearchList();
            Search search = new Search();
            searchlist = GetTaskAssignedTo(searchlist);
            // We want all tracer task statuses populated
            searchlist = GetStatuses(searchlist, search, (int)TracerStatusType.Task, "");

            searchlist.ReportTitle = GetReportTitle(messageCode);
            return searchlist;

        }

        public SearchList GetSearchLists_ObservationStatus(string messageCode)
        {
            SearchList searchlist = new SearchList();
            Search search = new Search();

            search.ResponseStatus = -1; // Defaults to All
            searchlist.TracersCategories = GetTracersCategories().TracersCategories.ToList();
            searchlist.TracersLists = GetTracersList("").TracersLists.ToList();
            searchlist.ReportTitle = GetReportTitle(messageCode);
            searchlist = GetOrgnizationTypeList(searchlist, search);
            searchlist = GetTracersObsEnteredBy(searchlist, search);
            return searchlist;
        }

        public SearchList GetSavedParameters_ObservationStatus(int reportScheduleID, SaveAndSchedule savedParameters, string messageCode)
        {
            SearchList searchlist = new SearchList();
            Search search = new Search();

            search.ResponseStatus = -1; // Defaults to All
            searchlist.TracersCategories = GetTracersCategories().TracersCategories.ToList();
            searchlist.TracersLists = GetTracersList(GetParameterValue(savedParameters.ReportParameters, WebConstants.TRACERS_CATEGORY)).TracersLists.ToList();
            searchlist.ReportTitle = GetReportTitle(messageCode);

            search.OrgTypeLevel3IDs = GetParameterValue(savedParameters.ReportParameters, WebConstants.ORG_CAMPUS);
            search.OrgTypeLevel2IDs = GetParameterValue(savedParameters.ReportParameters, WebConstants.ORG_BUILDING);
            search.InActiveOrgTypes = GetParameterValue(savedParameters.ReportParameters, WebConstants.ORGTYPE_CHECKBOX) == "True" ? true : false;

            searchlist = GetOrgnizationTypeList(searchlist, search);

            //Updated by users list should be independent of Organization items
            search.OrgTypeLevel3IDs = string.Empty;
            search.OrgTypeLevel2IDs = string.Empty;
            searchlist = GetTracersObsEnteredBy(searchlist, search);
            return searchlist;
        }

        public SearchList GetOrgFindingsSearchParams(string messageCode)
        {
            SearchList searchlist = new SearchList();
            searchlist.TracersCategories = GetTracersCategories().TracersCategories.ToList();
            searchlist.ReportTitle = GetReportTitle(messageCode);

            return searchlist;
        }

        public string GetReportTitle(string messageCode)
        {
            CommonService oCommonService = new CommonService();
            return oCommonService.GetReportTitle(messageCode);
        }

        //public List<Program> GetPrograms(bool isRetired)
        //{
        //    var programList = new List<Program>();
        //    programList = SelectTracerProgramsBySiteAndUser(Convert.ToInt32(AppSession.UserID), AppSession.SelectedSiteId, Convert.ToInt16(AppSession.CycleID));

        //    return programList;
        //}

        public List<Program> GetPrograms()
        {
            //var programslist = new List<ProgramVM>();
            //programslist = SelectAllTracerProgramsBySiteAndUser(Convert.ToInt32(AppSession.UserID), AppSession.SelectedSiteId, Convert.ToInt16(AppSession.CycleID));

            var programslist = AppSession.Sites.Where(m => m.SiteID == AppSession.SelectedSiteId).First().Programs;

            return programslist;
        }

        public SearchList GetTracersCategories(int tracerTypeID = 1)
        {
            SearchList tracerslist = new SearchList();
            tracerslist.TracersCategories = SelectTracerCategories(AppSession.SelectedSiteId, AppSession.SelectedProgramId, tracerTypeID);
            return tracerslist;
        }

        public SearchList GetTracerFreqencyLists(string TracerCategoryIDs) {
            SearchList tracerslist = new SearchList();
             tracerslist.TracerFrequencyLists = SelectTracerFrequencies(AppSession.SelectedSiteId, AppSession.SelectedProgramId, TracerCategoryIDs);
            return tracerslist;
        }       
        public SearchList GetTracersCategories(bool retired)
        {
            SearchList tracerslist = new SearchList();

            var TracerAPI = WebApiMethods_Tracer.GetTracersCategories();

            tracerslist.TracersCategories = WebApiMethods_Tracer.TracerCategory;
            return tracerslist;
        }
        public SearchList GetTracersList(string TracerCategoryIDs, string TracerStatus = "1,2,3", string observationStatus = "7,8", int tracerTypeID = 1)
        {
            SearchList tracerslist = new SearchList();

            tracerslist.TracersLists = SelectTracerList(AppSession.SelectedSiteId, AppSession.SelectedProgramId, TracerCategoryIDs, TracerStatus, observationStatus, tracerTypeID);
            return tracerslist;
        }
        public SearchList GetTracerSectionsList(string TracerCustomIDs, string TracerStatus = "1,2,3", string observationStatus = "7,8", int tracerTypeID = 1)
        {
            SearchList tracerslist = new SearchList();

            tracerslist.TracerSectionsLists = SelectTracerSectionsList(AppSession.SelectedSiteId, AppSession.SelectedProgramId,TracerCustomIDs, TracerStatus, observationStatus, tracerTypeID);
            return tracerslist;
        }
        public SearchList GetAllTracersList(string TracerStatus = "1,2,3,12")
        {
            SearchList tracerslist = new SearchList();

            tracerslist.TracersLists = SelectAllTracerList(AppSession.SelectedSiteId, AppSession.SelectedProgramId,  TracerStatus);
            return tracerslist;
        }

        public SearchList GetAllTemplatesList(string TemplateStatus = "")
        {
            SearchList tracerslist = new SearchList();

            tracerslist.TracersLists = SelectAllTemplateList(AppSession.SelectedProgramId, TemplateStatus);
            return tracerslist;
        }


        public SearchList GetAllTracerScheduleFrequencyList(string FrequencyTypeIDs ="",string TracerCategoryIds="")
        {
            SearchList tracerslist = new SearchList();

            tracerslist.TracersLists = SelectAllTracerListBasedOnDepartmentAssignment(AppSession.SelectedSiteId,
                                            AppSession.SelectedProgramId, FrequencyTypeIDs, TracerCategoryIds);
            return tracerslist;
        }


        public TracerQuestion GetSearchQuestions(string TracerCustomIDs,string TracerQuestionCategoryIDs, string QuestionKeyword, int SiteID, int ProgramID, int tracerTypeID = 1)
        {
            TracerQuestion tracerQuestionlist = new TracerQuestion();

            tracerQuestionlist.TracerQuestionList = SelectQuestions(TracerCustomIDs, TracerQuestionCategoryIDs, QuestionKeyword, SiteID, ProgramID, tracerTypeID);
            return tracerQuestionlist;
        }
        public TracerQuestionDetail GetQuestionDetails(int TracerCustomID, int QuestionID, int tracerTypeID =1)
        {
            TracerQuestionDetail tracerQuestionDetaillist = new TracerQuestionDetail();

            tracerQuestionDetaillist.TracerQuestionDetailList = SelectQuestionDetails(TracerCustomID, QuestionID, tracerTypeID);
            return tracerQuestionDetaillist;
        }

        public SearchList GetTracersChapters()
        {
            SearchList tracerslist = new SearchList();

            tracerslist.TracersChapters = SelectTracerChapters((int)AppSession.CycleID, AppSession.SelectedProgramId);
            tracerslist.OrgRanking3Name = GetOrganizationName(AppSession.SelectedSiteId, AppSession.SelectedProgramId, 3);
            tracerslist.OrgRanking2Name = GetOrganizationName(AppSession.SelectedSiteId, AppSession.SelectedProgramId, 2);
            tracerslist.OrgRanking1Name = GetOrganizationName(AppSession.SelectedSiteId, AppSession.SelectedProgramId, 1);
            return tracerslist;
        }

        public string GetOrganizationName(int siteID, int programID, int ranking)
        {
            var returnVal = SelectOrganizationName(siteID, programID, ranking);

            if (string.IsNullOrEmpty(returnVal))
                returnVal = string.Empty;
            return returnVal;
        }

        public SearchList GetTracersStandards(string chapterID)
        {
            SearchList tracerslist = new SearchList();

            tracerslist.TracersStandards = SelectTracerStandards((int)AppSession.CycleID, AppSession.SelectedProgramId, chapterID, AppSession.SelectedSiteId);
            return tracerslist;
        }

        public SearchList GetTracersEPs(string chapterid, string standardtextid)
        {
            SearchList tracerslist = new SearchList();

            tracerslist.TracersEPs = SelectTracerEPs((int)AppSession.CycleID, AppSession.SelectedProgramId, AppSession.SelectedSiteId, chapterid, standardtextid);
            return tracerslist;
        }

        public SearchList GetTracersCMS(int? chapterid)
        {
            SearchList tracerslist = new SearchList();

            tracerslist.CMSTags = SelectTracerCMSTags(chapterid, AppSession.SelectedSiteId, AppSession.SelectedProgramId, (int)AppSession.CycleID);
            return tracerslist;
        }

        public SearchList GetOrgnizationTypeList(SearchList sl, Search search, int selectedSiteID = -1, int selectedProgramID = -1)
        {
            string selectedLevel3Items = search.OrgTypeLevel3IDs;
            string selectedLevel2Items = search.OrgTypeLevel2IDs;

            //Clear all Level2 and Level3 information while loading Campus(Level3) information
            search.OrgTypeLevel3IDs = string.Empty;
            search.OrgTypeLevel2IDs = string.Empty;

            sl = DistributeOrgTypeListLevel3(sl, search, selectedSiteID, selectedProgramID);

            //Set Level3 information while loading Building(Level2) information
            search.OrgTypeLevel3IDs = selectedLevel3Items;
            sl = DistributeOrgTypeListLevel2(sl, search, selectedSiteID, selectedProgramID);

            //Set Level3 and Level2 information while loading Dept(Level1) information
            search.OrgTypeLevel3IDs = selectedLevel3Items;
            search.OrgTypeLevel2IDs = selectedLevel2Items;
            sl = DistributeOrgTypeListLevel1(sl, search, selectedSiteID, selectedProgramID);

            return sl;
        }


      


        public SearchList GetTracersObsEnteredBy(SearchList sl, Search search)
        {
            sl = DistributeTracerOrgEnteredBy(sl, search);
            return sl;
        }

        public SearchList GetTaskAssignedTo(SearchList sl)
        {
            sl = DistributeTaskAssignedTo(sl);
            return sl;
        }


        public SearchList GetStatuses(SearchList sl, Search search, int tracerStatusTypeID, string tracerStatusIDs)
        {

            sl = DistributeTracerStatus(sl, search, tracerStatusTypeID, tracerStatusIDs);
            return sl;
        }


        public SearchList DistributeOrgTypeListLevel3(SearchList sl, Search search, int selectedSiteID = -1, int selectedProgramID = -1)
        {

            var CampusLists = new List<OrgnizationType>();
            CampusLists = SelectOrgnizationType(search, 3, selectedSiteID, selectedProgramID).OrderBy(l => l.OrganizationTitle).ToList();

            CommonService cs = new CommonService();
            sl.OrgRanking3Name = cs.OrganizationTypeTitle(3, selectedSiteID, selectedProgramID);
            sl.hasRanking3 = sl.OrgRanking3Name == "" ? false : true;
            AppSession.OrgRanking3Name = sl.OrgRanking3Name;
            CampusLists.Insert(0, new OrgnizationType
            {
                OrganizationID = Convert.ToInt32(-1),
                OrganizationTitle = "All",

            });
            sl.CampusLists = CampusLists;

            return sl;

        }
        public SearchList DistributeOrgTypeListLevel2(SearchList sl, Search search, int selectedSiteID = -1, int selectedProgramID = -1)
        {
            var BuildingLists = new List<OrgnizationType>();

            BuildingLists = SelectOrgnizationType(search, 2, selectedSiteID, selectedProgramID).OrderBy(l => l.OrganizationTitle).ToList();

            CommonService cs = new CommonService();
            sl.OrgRanking2Name = cs.OrganizationTypeTitle(2, selectedSiteID, selectedProgramID);
            sl.hasRanking2 = sl.OrgRanking2Name == "" ? false : true;
            AppSession.OrgRanking2Name = sl.OrgRanking2Name;
            BuildingLists.Insert(0, new OrgnizationType
            {
                OrganizationID = Convert.ToInt32(-1),
                OrganizationTitle = "All",

            });

            sl.BuildingLists = BuildingLists;
            return sl;

        }

        public SearchList DistributeOrgTypeListLevel1(SearchList sl, Search search, int selectedSiteID = -1, int selectedProgramID = -1)
        {


            var DepartmentLists = new List<OrgnizationType>();
            DepartmentLists = SelectOrgnizationType(search, 1, selectedSiteID, selectedProgramID).OrderBy(l => l.OrganizationTitle).ToList();
            CommonService cs = new CommonService();
            sl.OrgRanking1Name = cs.OrganizationTypeTitle(1, selectedSiteID, selectedProgramID);
            sl.hasRanking1 = sl.OrgRanking1Name == "" ? false : true;
            AppSession.OrgRanking1Name = sl.OrgRanking1Name;
            DepartmentLists.Insert(0, new OrgnizationType
             {
                 OrganizationID = Convert.ToInt32(-1),
                 OrganizationTitle = "All",
             });
            sl.DepartmentLists = DepartmentLists;

            return sl;

        }

        public SearchList DistributeTracerOrgEnteredBy(SearchList sl, Search search)
        {


            var EnteredByLists = new List<TracersUser>();

            EnteredByLists = SelectTracersObsEnteredBy(search);
            EnteredByLists.Insert(0, new TracersUser
            {
                UserID = Convert.ToInt32(-1),
                UserName = "All",
            });
            sl.TracersObsEnteredBy = EnteredByLists;

            return sl;

        }

        public SearchList DistributeTaskAssignedTo(SearchList sl)
        {


            var AssignedToLists = new List<TracersUser>();

            AssignedToLists = SelectTaskUsers();

            sl.AssignedTo = AssignedToLists;

            return sl;

        }

        public SearchList DistributeTracerStatus(SearchList sl, Search search, int tracerStatusTypeID, string tracerStatusIDs)
        {


            var tracerStatusLists = new List<TracersStatus>();

            // Get all statuses for tasks
            tracerStatusLists = SelectTracerStatus(tracerStatusTypeID, tracerStatusIDs);
            tracerStatusLists.Insert(0, new TracersStatus
            {
                TracerStatusID = Convert.ToInt32(-1),
                TracerStatusName = "All",
            });
            sl.TracerStatuses = tracerStatusLists;

            return sl;

        }

        //Set the preferred program
        public void SetProgramPreference(List<Program> lstPrograms)
        {
            CommonService oService = new CommonService();

            var preferredProgramId = AppSession.SelectedProgramId == 0 ? oService.GetPreferredProgram(Convert.ToInt32(AppSession.UserID), AppSession.SelectedSiteId) : AppSession.SelectedProgramId;

            if (preferredProgramId > 0)
            {
                string programName = string.Empty;
                int programId = 0;
                int certificationItemID = 0;

                var qry = lstPrograms.Where(prg => prg.BaseProgramID == preferredProgramId);
                if (qry.Count() > 0)
                {
                    programId = preferredProgramId;
                    programName = qry.FirstOrDefault().ProgramName;
                    certificationItemID = (int)qry.FirstOrDefault().AdvCertListTypeID;
                }
                else
                {
                    programId = (int)lstPrograms.FirstOrDefault().ProgramID;
                    programName = lstPrograms.FirstOrDefault().ProgramName;
                    certificationItemID = (int)lstPrograms.FirstOrDefault().AdvCertListTypeID;
                }

                if (!string.IsNullOrWhiteSpace(programName))
                {
                    AppSession.SelectedProgramId = programId;
                    AppSession.SelectedProgramName = programName;
                    AppSession.SelectedCertificationItemID = certificationItemID;
                }
            }
            else if (lstPrograms.Count > 0) //Bug 12115: Set default program in session for the sites accessed for the first time
            { 
                var defaultProgram = lstPrograms.FirstOrDefault();
                AppSession.SelectedProgramId = (int)defaultProgram.ProgramID;
                AppSession.SelectedProgramName = defaultProgram.ProgramName;
            }

            var menuService = new JCR.Reports.Services.MenuService();

            if (AppSession.SelectedCertificationItemID > 0)
            {
                menuService.SaveArg(AppSession.UserID.GetValueOrDefault(), "CertificationItemID", AppSession.SelectedCertificationItemID.ToString());
            }
            else
            {
                menuService.SaveArg(AppSession.UserID.GetValueOrDefault(), "ProgramID", AppSession.SelectedProgramId.ToString());
            }
        }
        public List<CycleInfo> GetCycleInfo()
        {
            var cycleInfoList = new List<CycleInfo>();
            cycleInfoList = SelectCycleInfo();
            return cycleInfoList;
        }

        public List<CycleInfo> GetCycleInfoNewEP()
        {
            var cycleInfoList = new List<CycleInfo>();
            cycleInfoList = SelectCycleInfoNewEP();
            return cycleInfoList;
        }
        //public SearchList DistributeOrgTypeList(SearchList sl, string TracerIDs = "", string TracerCategoryIDs = "", string Level3OrganizationIDs = "", string Level2OrganizationIDs = "", bool? IsCategoryActive = true, bool? IsCategoryItemActive = true)
        //{

        //var OrganizationlevelLists = new List<OrgnizationType>();
        //    var CampusLists = new List<OrgnizationType>();
        //    var BuildingLists = new List<OrgnizationType>();
        //    var DepartmentLists = new List<OrgnizationType>();

        //    OrganizationlevelLists = SelectOrgnizationType(AppSession.SelectedSiteId, AppSession.SelectedProgramId, TracerIDs, TracerCategoryIDs, Level3OrganizationIDs, Level2OrganizationIDs, IsCategoryActive, IsCategoryItemActive);
        //    CampusLists = OrganizationlevelLists.Where(l => l.Ranking == 3).OrderBy(l => l.OrganizationTitle).ToList();
        //    BuildingLists = OrganizationlevelLists.Where(l => l.Ranking == 2).OrderBy(l => l.OrganizationTitle).ToList();
        //    DepartmentLists = OrganizationlevelLists.Where(l => l.Ranking == 1).OrderBy(l => l.OrganizationTitle).ToList();

        //    if (CampusLists.Count() > 0)
        //    {
        //        sl.OrgRanking3Name = CampusLists.First().OrganizationTypeTitle.ToString();
        //        AppSession.OrgRanking3Name = sl.OrgRanking3Name;
        //        CampusLists.Insert(0, new OrgnizationType
        //        {
        //            OrganizationID = Convert.ToInt32(-1),
        //            OrganizationTitle = "All",

        //        });

        //        sl.CampusLists = CampusLists;
        //        sl.hasRanking3 = true;

        //    }
        //    if (BuildingLists.Count() > 0)
        //    {
        //        sl.OrgRanking2Name = BuildingLists.First().OrganizationTypeTitle.ToString();
        //        AppSession.OrgRanking2Name = sl.OrgRanking2Name;
        //        BuildingLists.Insert(0, new OrgnizationType
        //        {
        //            OrganizationID = Convert.ToInt32(-1),
        //            OrganizationTitle = "All",

        //        });

        //        sl.BuildingLists = BuildingLists;
        //        sl.hasRanking2 = true;

        //    }
        //    if (DepartmentLists.Count() > 0)
        //    {
        //        sl.OrgRanking1Name = DepartmentLists.First().OrganizationTypeTitle.ToString();
        //        AppSession.OrgRanking1Name = sl.OrgRanking1Name;
        //        DepartmentLists.Insert(0, new OrgnizationType
        //        {
        //            OrganizationID = Convert.ToInt32(-1),
        //            OrganizationTitle = "All",

        //        });

        //        sl.DepartmentLists = DepartmentLists;
        //        sl.hasRanking1 = true;

        //    }

        //   return sl;

        //}
        #endregion
        public List<CycleInfo> SelectCycleInfo()
        {
            var list = new List<CycleInfo>();
            DataSet ds = new DataSet();
            DataTable dt = new DataTable();
            try
            {
                using (SqlConnection cn = new SqlConnection(this.ConnectionString))
                {
                    cn.Open();
                    SqlCommand cmd = new SqlCommand(" SELECT CycleName, CycleID FROM dbo.BaseCycle WHERE  StandardGroupID = 1 AND NOT EXISTS (SELECT 1 FROM dbo.BaseCycle aa HAVING MIN(aa.CycleID ) = BaseCycle.CycleID )  ", cn);
                    SqlDataAdapter da = new SqlDataAdapter(cmd);

                    using (cn)
                    using (cmd)
                    using (da)
                    {
                        da.Fill(ds);
                    }
                }
                dt = ds.Tables[0];
               
                if (dt.Rows.Count > 0)
                {
                    list = dt.ToList<CycleInfo>();
                 
                }
              
                list.Insert(0, new CycleInfo
                {
                    CycleID = Convert.ToInt32(-1),
                    CycleName = "All",

                });
            }
            catch (Exception ex)
            {
                ex.Data.Add(TSQL, _SQLExecuted);
                throw ex;
            }

            return list;
        }
        public List<CycleInfo> SelectCycleInfoNewEP()
        {
            var list = new List<CycleInfo>();
            DataSet ds = new DataSet();
            DataTable dt = new DataTable();
            try
            {
                using (SqlConnection cn = new SqlConnection(this.ConnectionString))
                {
                    cn.Open();
                    SqlCommand cmd = new SqlCommand("  select CycleName, CycleID from [dbo].[BaseCycle] where StandardGroupID = 1", cn);
                    SqlDataAdapter da = new SqlDataAdapter(cmd);

                    using (cn)
                    using (cmd)
                    using (da)
                    {
                        da.Fill(ds);
                    }
                }
                dt = ds.Tables[0];

                if (dt.Rows.Count > 0)
                {
                    list = dt.ToList<CycleInfo>();

                }

                list.Insert(0, new CycleInfo
                {
                    CycleID = Convert.ToInt32(-1),
                    CycleName = "All",

                });
            }
            catch (Exception ex)
            {
                ex.Data.Add(TSQL, _SQLExecuted);
                throw ex;
            }

            return list;
        }
        public List<UserSite> SelectTracerSitesByUser(int userID, bool allSites = true, int siteID = 0)
        {
            var list = new List<UserSite>();
            DataSet ds = new DataSet();
            DataTable dt = new DataTable();
            try
            {
                using (SqlConnection cn = new SqlConnection(ConfigurationManager.ConnectionStrings["DBAMP_WHSE"].ToString()))
                {
                    cn.Open();
                    //using the same store procedure used by tracer app for site list by userid
                    SqlCommand cmd = new SqlCommand("usmSelectTracerSitesByUser", cn);
                    cmd.CommandType = CommandType.StoredProcedure;
                    cmd.Parameters.AddWithValue("@UserID", userID);
                    cmd.Parameters.AddWithValue("@SiteID", siteID);
                    cmd.Parameters.AddWithValue("@filteredsites", allSites ? 0 : 1);
                    //@filteredsites
                    SqlDataAdapter da = new SqlDataAdapter(cmd);

                    using (cn)
                    using (cmd)
                    using (da)
                    {
                        da.Fill(ds);
                    }
                }
                dt = ds.Tables[0];
                list = dt.ToList<UserSite>();
            }
            catch (Exception ex)
            {
                ex.Data.Add(TSQL, _SQLExecuted);
                throw ex;
            }

            return list;
        }

        public static List<UserSite> GetSitesByUser(int? userID)
        {          

            List<UserSite> _sites = null;

            var APIBaseUrl = ConfigurationManager.AppSettings["JCRAPI"].ToString();
            var JCRAPIToken = AppSession.AuthToken;
            var _userID = userID.ToString();
            
            using (var httpClient = new System.Net.Http.HttpClient())
            {
                httpClient.BaseAddress = new Uri(APIBaseUrl);

                httpClient.DefaultRequestHeaders.Add("token", JCRAPIToken);
                httpClient.DefaultRequestHeaders.Add("UserId", AppSession.UserID.ToString());

                HttpResponseMessage response = httpClient.GetAsync("GetCommonInfo/GetUserSites?userID=" + userID).Result;


                if (response.IsSuccessStatusCode)
                {
                    //_sites = Newtonsoft.Json.JsonConvert.DeserializeObject<List<Site>>(response.Content.ReadAsStringAsync().Result);

                    _sites = response.Content.ReadAsAsync<List<UserSite>>().Result;
                }

            }


            return _sites;

        }
        public List<ERLevelMap> GetLevelMap(List<UserSite> sites)
        {
            var list = new List<ERLevelMap>();

            try
            {
                string siteList = "";

                //var sites = CMSService.GetCMSSitesFiltered(AppSession.Sites); //To Filter out CMS Sites when CMS Report is selected

                var commonService = new CommonService();

                foreach (var site in sites) {

                    // M.Orlando 09/27/2017: Updated for TEN
                    if (AppSession.LinkType == (int) WebConstants.LinkType.AMPCorporateReports || 
                                                     site.RoleID.In ((int) (WebConstants.Role.ProgramAdministrator),
                                                                     (int) (WebConstants.Role.SiteManager), 
                                                                     (int) (WebConstants.Role.StaffMember),
                                                                     (int) (WebConstants.Role.MockSurveyUser),
                                                                     (int) (WebConstants.Role.MockSurveyReviewer))) {
                        siteList += site.SiteID.ToString() + ",";
                    }

                    site.IsCorporateAccess = commonService.CheckCorporateAccess(site.SiteID) == true?1 : 0;
                }
                siteList = siteList.Substring(0, siteList.Length - 1);

                using (SqlConnection cn = new SqlConnection(ConfigurationManager.ConnectionStrings["DBAMP_WHSE"].ToString()))
                {
                    cn.Open();
                    SqlCommand cmd = new SqlCommand("usmERReportGetLevelMap", cn);
                    cmd.CommandType = CommandType.StoredProcedure;
                    cmd.Parameters.AddWithValue("@SiteList", siteList);

                    CreateSQLExecuted("usmERReportGetLevelMap", cmd);
#if DEBUG
                    System.Diagnostics.Debug.WriteLine(_SQLExecuted);
#endif

                    var reader = cmd.ExecuteReader();
                    if (reader.HasRows)
                    {
                        while (reader.Read())
                        {
                            int l1ID = reader["ERLevel1ID"] != DBNull.Value ? Convert.ToInt32(reader["ERLevel1ID"]) : 0;
                            int l2ID = reader["ERLevel2ID"] != DBNull.Value ? Convert.ToInt32(reader["ERLevel2ID"]) : 0;
                            int l3ID = reader["ERLevel3ID"] != DBNull.Value ? Convert.ToInt32(reader["ERLevel3ID"]) : 0;

                            string l1Name = reader["ERLevel1Name"] != DBNull.Value ? reader["ERLevel1Name"].ToString() : null;
                            string l2Name = reader["ERLevel2Name"] != DBNull.Value ? reader["ERLevel2Name"].ToString() : null;
                            string l3Name = reader["ERLevel3Name"] != DBNull.Value ? reader["ERLevel3Name"].ToString() : null;

                            list.Add(new ERLevelMap
                            {
                                ERLevel1ID = l1ID,
                                ERLevel2ID = l2ID,
                                ERLevel3ID = l3ID,
                                SiteID = Convert.ToInt32(reader["SiteID"]),
                                ERLevel1 = new ERLevel1 { ERLevel1ID = l1ID, ERLevel1Name = l1Name },
                                ERLevel2 = new ERLevel2 { ERLevel2ID = l2ID, ERLevel2Name = l2Name },
                                ERLevel3 = new ERLevel3 { ERLevel3ID = l3ID, ERLevel3Name = l3Name }
                            });
                        }
                    }
                    reader.Close();
                }
            }
            catch (Exception ex)
            {
                ex.Data.Add(TSQL, _SQLExecuted);
                throw ex;
            }

            return list;
        }

        public ERLevelInformation GetLevelInformation(int siteID)
        {
            ERLevelInformation erLevelInformation = null;

            try
            {
                using (SqlConnection cn = new SqlConnection(ConfigurationManager.ConnectionStrings["DBAMP_WHSE"].ToString()))
                {
                    cn.Open();
                    SqlCommand cmd = new SqlCommand("usmERReportGetLevelInformation", cn);
                    cmd.CommandType = CommandType.StoredProcedure;
                    cmd.Parameters.AddWithValue("@SiteID", siteID);

                    CreateSQLExecuted("usmERReportGetLevelInformation", cmd);
#if DEBUG
                    System.Diagnostics.Debug.WriteLine(_SQLExecuted);
#endif

                    var reader = cmd.ExecuteReader();
                    if (reader.HasRows)
                    {
                        reader.Read();
                        string level2Name = null;
                        if (reader["ERLevel2Name"] != DBNull.Value)
                        {
                            level2Name = reader["ERLevel2Name"].ToString();
                        }
                        string level3Name = null;
                        if (reader["ERLevel3Name"] != DBNull.Value)
                        {
                            level3Name = reader["ERLevel3Name"].ToString();
                        }
                        erLevelInformation = new ERLevelInformation
                        {
                            ERLevelInformationID = Convert.ToInt32(reader["ERLevelInformationID"]),
                            ERLevel1ID = Convert.ToInt32(reader["ERLevel1ID"]),
                            ERLevel2Name = level2Name,
                            ERLevel3Name = level3Name
                        };
                    }
                    reader.Close();
                }
            }
            catch (Exception ex)
            {
                ex.Data.Add(TSQL, _SQLExecuted);
                throw ex;
            }

            return erLevelInformation;
        }


        public List<Program> SelectTracerProgramsBySiteAndUser(int userID, int siteID, int cycleID)
        {
            var lstPrograms = new List<Program>();
            DataSet ds = new DataSet();
            DataTable dt = new DataTable();

            try
            {
                using (SqlConnection cn = new SqlConnection(ConfigurationManager.ConnectionStrings["DBAMP_WHSE"].ToString()))
                {
                    cn.Open();
                    //using the same store procedure used by tracer app for site list by userid
                    SqlCommand cmd = new SqlCommand("usmSelectTracerProgramsBySiteUser", cn);
                    cmd.CommandType = CommandType.StoredProcedure;
                    cmd.Parameters.AddWithValue("@SiteID", siteID);
                    cmd.Parameters.AddWithValue("@UserID", userID);
                    cmd.Parameters.AddWithValue("@CycleID", cycleID);

                    SqlDataAdapter da = new SqlDataAdapter(cmd);

                    using (cn)
                    using (cmd)
                    using (da)
                    {
                        da.Fill(ds);
                    }
                }
                dt = ds.Tables[0];
                lstPrograms = dt.ToList<Program>();
            }
            catch (Exception ex)
            {
                ex.Data.Add(TSQL, _SQLExecuted);
                throw ex;
            }

            return lstPrograms;
        }

        //public List<ProgramVM> SelectAllTracerProgramsBySiteAndUser(int userID, int siteID, int cycleID)
        //{
        //    var lstPrograms = new List<ProgramVM>();
        //    DataSet ds = new DataSet();
        //    DataTable dt = new DataTable();

        //    try
        //    {
        //        using (SqlConnection cn = new SqlConnection(this.ConnectionString))
        //        {
        //            cn.Open();
        //            //using the same store procedure used by tracer app for site list by userid
        //            SqlCommand cmd = new SqlCommand("usmSelectAllTracerProgramsBySiteUser", cn);
        //            cmd.CommandType = CommandType.StoredProcedure;
        //            cmd.Parameters.AddWithValue("@SiteID", siteID);
        //            cmd.Parameters.AddWithValue("@UserID", userID);
        //            cmd.Parameters.AddWithValue("@CycleID", cycleID);

        //            SqlDataAdapter da = new SqlDataAdapter(cmd);

        //            using (cn)
        //            using (cmd)
        //            using (da)
        //            {
        //                da.Fill(ds);
        //            }
        //        }
        //        dt = ds.Tables[0];
        //        lstPrograms = dt.ToList<ProgramVM>();
        //    }
        //    catch (Exception ex)
        //    {
        //        ex.Data.Add(TSQL, _SQLExecuted);
        //        throw ex;
        //    }

        //    return lstPrograms;
        //}

        private List<TracerQuestionDetail> SelectQuestionDetails(int TracerCustomID, int QuestionID, int tracerTypeID =1 )
        {
            var list = new List<TracerQuestionDetail>();

            DataSet ds = new DataSet();
            DataTable dt = new DataTable();

            try
            {
                using (SqlConnection cn = new SqlConnection(this.ConnectionString))
                {
                    cn.Open();
                    //to do SP to be created
                    SqlCommand cmd = new SqlCommand("ustReport_QuestionInfo", cn);
                    cmd.CommandType = CommandType.StoredProcedure;
                    cmd.Parameters.AddWithValue("TracerCustomID", TracerCustomID);
                    cmd.Parameters.AddWithValue("TracerQuestionID", QuestionID);
                    cmd.Parameters.AddWithValue("CycleID", AppSession.CycleID);
                    cmd.Parameters.AddWithValue("ProgramID", AppSession.SelectedProgramId);
                    cmd.Parameters.AddWithValue("SiteID", AppSession.SelectedSiteId);
                    cmd.Parameters.AddWithValue("TracerTypeID", tracerTypeID);

#if DEBUG
                    CreateSQLExecuted("ustReport_QuestionInfo", cmd);
                    System.Diagnostics.Debug.WriteLine(_SQLExecuted);
#endif

                    SqlDataAdapter da = new SqlDataAdapter(cmd);

                    using (cn)
                    using (cmd)
                    using (da)
                    {
                        da.Fill(ds);
                    }

                }
                dt = ds.Tables[0];
                if (dt.Rows.Count > 0)
                {
                    list = dt.ToList<TracerQuestionDetail>();

                }
                else
                {
                    list.Insert(0, new TracerQuestionDetail
                    {
                        TracerCustomID = Convert.ToInt32(-1),
                        TracerQuestionCategoryID = Convert.ToString(-1),
                        TracerQuestionID = Convert.ToInt32(-1),
                        // QuestionText = "No Question Found",
                        QuesNo = Convert.ToInt32(0),
                        TracerCustomName = "No Tracer Found",
                        StandardEP = "No Standard Found",
                        QuestionCategoryName = "No Tracer Section Found",

                    });
                }
            }
            catch (Exception ex)
            {
                ex.Data.Add(TSQL, _SQLExecuted);
                throw ex;
            }

            return list;
        }
        private List<TracerQuestion> SelectQuestions(string TracerCustomIDs,string TracerQuestionCategoryIDs, string QuestionKeyword, int SiteID, int ProgramID, int tracerTypeID =1)
        {
            var list = new List<TracerQuestion>();

            DataSet ds = new DataSet();
            DataTable dt = new DataTable();
            try
            {
                using (SqlConnection cn = new SqlConnection(this.ConnectionString))
                {
                    cn.Open();
                    SqlCommand cmd = new SqlCommand("ustReport_SelectQuestion", cn);
                    cmd.CommandType = CommandType.StoredProcedure;
                    cmd.Parameters.AddWithValue("TracerCustomIDs", TracerCustomIDs == "-1" ? "" : TracerCustomIDs);
                    cmd.Parameters.AddWithValue("TracerSectionIDs", TracerQuestionCategoryIDs == "-1" ? "" : TracerQuestionCategoryIDs);
                    cmd.Parameters.AddWithValue("Keyword", QuestionKeyword == "" ? null : QuestionKeyword);
                    cmd.Parameters.AddWithValue("CycleID", AppSession.CycleID);
                    cmd.Parameters.AddWithValue("ProgramID", ProgramID);
                    cmd.Parameters.AddWithValue("SiteID", SiteID);
                    cmd.Parameters.AddWithValue("SetRowCount", 500);
                    cmd.Parameters.AddWithValue("TracerTypeID", tracerTypeID);
                    //    cmd.Parameters.Add("TotalRowCount", SqlDbType.Int).Direction = ParameterDirection.Output;
                    // cmd.Parameters("TotalRowCount").Direction = ParameterDirection.Output;


#if DEBUG
                    CreateSQLExecuted("ustReport_SelectQuestion", cmd);
                    System.Diagnostics.Debug.WriteLine(_SQLExecuted);
#endif

                    SqlDataAdapter da = new SqlDataAdapter(cmd);

                    using (cn)
                    using (cmd)
                    using (da)
                    {
                        da.Fill(ds);
                    }

                }
                dt = ds.Tables[0];
                if (dt.Rows.Count > 0)
                {
                    list = dt.ToList<TracerQuestion>();

                }
                //else
                //{
                //    list.Insert(0, new TracerQuestion
                //    {
                //        TracerCustomID = Convert.ToInt32(-1),
                //        TracerQuestionID = Convert.ToInt32(-1),
                //        QuestionText = "No Questions Found",
                //        LinkHeader = "No Question Found",
                //        CountTracers = Convert.ToInt32(0),
                //        TracerCustomName = "No Questions Found",

                //    });
                //}
            }
            catch (Exception ex)
            {
                ex.Data.Add(TSQL, _SQLExecuted);
                throw ex;
            }

            return list;
        }
        private List<TracersCategory> SelectTracerCategories(int siteid, int programid, int tracerTypeID = 1)
        {
            var list = new List<TracersCategory>();

            DataSet ds = new DataSet();
            DataTable dt = new DataTable();
            try
            {
                using (SqlConnection cn = new SqlConnection(this.ConnectionString))
                {
                    cn.Open();
                    SqlCommand cmd = new SqlCommand("ustReport_SelectTracerCategories", cn);
                    cmd.CommandType = CommandType.StoredProcedure;
                    cmd.Parameters.AddWithValue("@SiteID", siteid);
                    cmd.Parameters.AddWithValue("@ProgramID", programid);
                    cmd.Parameters.AddWithValue("@TracerTypeID", tracerTypeID);

                    SqlDataAdapter da = new SqlDataAdapter(cmd);

#if DEBUG
                    CreateSQLExecuted("ustReport_SelectTracerCategories", cmd);
                    System.Diagnostics.Debug.WriteLine(_SQLExecuted);
#endif

                    using (cn)
                    using (cmd)
                    using (da)
                    {
                        da.Fill(ds);
                    }

                }
                dt = ds.Tables[0];
                if (dt.Rows.Count > 0)
                {
                    list = dt.ToList<TracersCategory>();
                    list.Insert(0, new TracersCategory
                    {
                        TracerCategoryID = Convert.ToInt32(-1),
                        TracerCategoryName = "All",

                    });
                }
                else
                {
                    list.Insert(0, new TracersCategory
                    {
                        TracerCategoryID = Convert.ToInt32(-1),
                        TracerCategoryName = "All",

                    });
                }
            }
            catch (Exception ex)
            {
                ex.Data.Add(TSQL, _SQLExecuted);
                throw ex;
            }

            return list;
        }
        private List<TracersCategory> SelectTDSTracerCategories(int siteid, int programid)
        {
            var list = new List<TracersCategory>();

            DataSet ds = new DataSet();
            DataTable dt = new DataTable();
            try
            {
                using (SqlConnection cn = new SqlConnection(this.ConnectionString))
                {
                    cn.Open();
                    SqlCommand cmd = new SqlCommand("ustSelectTDSTracerCategorNames", cn);
                    cmd.CommandType = CommandType.StoredProcedure;
                    cmd.Parameters.AddWithValue("@SiteID", siteid);
                    cmd.Parameters.AddWithValue("@ProgramID", programid);                    

                    SqlDataAdapter da = new SqlDataAdapter(cmd);

#if DEBUG
                    CreateSQLExecuted("ustSelectTDSTracerCategorNames", cmd);
                    System.Diagnostics.Debug.WriteLine(_SQLExecuted);
#endif

                    using (cn)
                    using (cmd)
                    using (da)
                    {
                        da.Fill(ds);
                    }

                }
                dt = ds.Tables[0];
                if (dt.Rows.Count > 0)
                {
                    list = dt.ToList<TracersCategory>();
                    list.Insert(0, new TracersCategory
                    {
                        TracerCategoryID = Convert.ToInt32(-1),
                        TracerCategoryName = "All",

                    });
                }
                else
                {
                    list.Insert(0, new TracersCategory
                    {
                        TracerCategoryID = Convert.ToInt32(-1),
                        TracerCategoryName = "All",

                    });
                }
            }
            catch (Exception ex)
            {
                ex.Data.Add(TSQL, _SQLExecuted);
                throw ex;
            }

            return list;
        }
        private List<TracerFrequency> SelectTracerFrequenciesBasedOnCustomID(int siteid, int programid,
                string tracerCustomIDs = "")
        {
            var list = new List<TracerFrequency>();

            DataSet ds = new DataSet();
            DataTable dt = new DataTable();
            try
            {
                using (SqlConnection cn = new SqlConnection(this.ConnectionString))
                {
                    cn.Open();
                    SqlCommand cmd = new SqlCommand("ustSelectFrequencyListOnTracerID", cn);
                    cmd.Parameters.AddWithValue("@SiteID", siteid);
                    cmd.Parameters.AddWithValue("@ProgramID", programid);
                    cmd.Parameters.AddWithValue("@TracerIDs", tracerCustomIDs);

                    cmd.CommandType = CommandType.StoredProcedure;

                    SqlDataAdapter da = new SqlDataAdapter(cmd);

                    using (cn)
                    using (cmd)
                    using (da)
                    {
                        da.Fill(ds);
                    }

                }
                dt = ds.Tables[0];
                if (dt.Rows.Count > 0)
                {
                    list = dt.ToList<TracerFrequency>();
                    
                }
                
            }
            catch (Exception ex)
            {
                ex.Data.Add(TSQL, _SQLExecuted);
                throw ex;
            }

            return list;
        }
        private List<TracerFrequency> SelectTracerFrequencies(int siteid, int programid,string TracerCategoryIDs="")
        {
            var list = new List<TracerFrequency>();

            DataSet ds = new DataSet();
            DataTable dt = new DataTable();
            try
            {
                using (SqlConnection cn = new SqlConnection(this.ConnectionString))
                {
                    cn.Open();
                    SqlCommand cmd = new SqlCommand("ustSelectFrequencyBasedOnSiteID", cn);
                    cmd.Parameters.AddWithValue("@SiteID", siteid);
                    cmd.Parameters.AddWithValue("@ProgramID", programid);
                    cmd.Parameters.AddWithValue("@TracerCategoryIDs", TracerCategoryIDs);

                    cmd.CommandType = CommandType.StoredProcedure;
                    
                    SqlDataAdapter da = new SqlDataAdapter(cmd);

                    using (cn)
                    using (cmd)
                    using (da)
                    {
                        da.Fill(ds);
                    }

                }
                dt = ds.Tables[0];
                if (dt.Rows.Count > 0)
                {
                    list = dt.ToList<TracerFrequency>();
                    list.Insert(0, new TracerFrequency
                    {
                        TracerObsFrequencyTypeID = Convert.ToInt32(-1),
                        TracerObsFrequencyTypeName = "All",

                    });
                }
                else
                {
                    list.Insert(0, new TracerFrequency
                    {
                        TracerObsFrequencyTypeID = Convert.ToInt32(-1),
                        TracerObsFrequencyTypeName = "All",

                    });
                }
            }
            catch (Exception ex)
            {
                ex.Data.Add(TSQL, _SQLExecuted);
                throw ex;
            }

            return list;
        }


        private List<TracersChapters> SelectTracerChapters(int cycleid, int programid)
        {
            var list = new List<TracersChapters>();

            DataSet ds = new DataSet();
            DataTable dt = new DataTable();
            try
            {
                using (SqlConnection cn = new SqlConnection(this.ConnectionString))
                {
                    cn.Open();
                    SqlCommand cmd = new SqlCommand("ustReport_GetChapterNames", cn);
                    cmd.CommandType = CommandType.StoredProcedure;
                    cmd.Parameters.AddWithValue("@CycleID", cycleid);
                    cmd.Parameters.AddWithValue("@ProgramID", programid);

                    SqlDataAdapter da = new SqlDataAdapter(cmd);

                    using (cn)
                    using (cmd)
                    using (da)
                    {
                        da.Fill(ds);
                    }

                }
                dt = ds.Tables[0];
                if (dt.Rows.Count > 0)
                {
                    list = dt.ToList<TracersChapters>();
                    list.Insert(0, new TracersChapters
                    {
                        TracerChapterID = Convert.ToInt32(-1),
                        TracerChapterName = "All",

                    });
                }
                else
                {
                    list.Insert(0, new TracersChapters
                    {
                        TracerChapterID = Convert.ToInt32(-1),
                        TracerChapterName = "All",

                    });
                }
            }
            catch (Exception ex)
            {
                ex.Data.Add(TSQL, _SQLExecuted);
                throw ex;
            }

            return list;
        }

        private List<CMSTags> SelectTracerCMSTags(int? chapterID, int siteID, int programID, int cycleID)
        {
            var list = new List<CMSTags>();

            DataSet ds = new DataSet();
            DataTable dt = new DataTable();
            try
            {
                using (SqlConnection cn = new SqlConnection(ConfigurationManager.ConnectionStrings["DBMEdition01_Write"].ToString()))
                {
                    cn.Open();
                    SqlCommand cmd = new SqlCommand("ustReport_GetCMSTags", cn);
                    cmd.CommandType = CommandType.StoredProcedure;
                    cmd.CommandTimeout = Convert.ToInt32(ConfigurationManager.AppSettings["SPCmdTimeout"].ToString());
                    cmd.Parameters.AddWithValue("@ChapterID", chapterID);
                    cmd.Parameters.AddWithValue("@SiteID", siteID);
                    cmd.Parameters.AddWithValue("@ProgramID", programID);
                    cmd.Parameters.AddWithValue("@CycleID", cycleID);

                    SqlDataAdapter da = new SqlDataAdapter(cmd);

                    using (cn)
                    using (cmd)
                    using (da)
                    {
                        da.Fill(ds);
                    }

                }
                dt = ds.Tables[0];
                if (dt.Rows.Count > 0)
                {
                    list = dt.ToList<CMSTags>();
                    list.Insert(0, new CMSTags
                    {
                        ID = -1,
                        Tag = "All",

                    });
                }
                else
                {
                    list.Insert(0, new CMSTags
                    {
                        ID = -1,
                        Tag = "All",

                    });
                }
            }
            catch (Exception ex)
            {
                ex.Data.Add(TSQL, _SQLExecuted);
                throw ex;
            }

            return list;
        }

        private List<TracersStandards> SelectTracerStandards(int cycleid, int programid, string chapterid, int siteID)
        {
            var list = new List<TracersStandards>();

            if (string.Equals(chapterid, "-1"))
            {
                list.Insert(0, new TracersStandards
                {
                    TracerStandardID = Convert.ToInt32(-1),
                    Code = "All",
                });
                return list;
            }

            DataSet ds = new DataSet();
            DataTable dt = new DataTable();
            try
            {
                using (SqlConnection cn = new SqlConnection(ConfigurationManager.ConnectionStrings["DBMEdition01_Write"].ToString()))
                {
                    cn.Open();
                    SqlCommand cmd = new SqlCommand("ustReport_GetStandardNames", cn);
                    cmd.CommandTimeout = Convert.ToInt32(ConfigurationManager.AppSettings["SPCmdTimeout"].ToString());
                    cmd.CommandType = CommandType.StoredProcedure;
                    cmd.Parameters.AddWithValue("@CycleID", cycleid);
                    cmd.Parameters.AddWithValue("@ProgramID", programid);
                    cmd.Parameters.AddWithValue("@ChapterID", Convert.ToInt32(chapterid));
                    cmd.Parameters.AddWithValue("@SiteID", siteID);

                    SqlDataAdapter da = new SqlDataAdapter(cmd);

                    using (cn)
                    using (cmd)
                    using (da)
                    {
                        da.Fill(ds);
                    }

                }
                dt = ds.Tables[0];
                if (dt.Rows.Count > 0)
                {
                    list = dt.ToList<TracersStandards>();
                    list.Insert(0, new TracersStandards
                    {
                        TracerStandardID = Convert.ToInt32(-1),
                        Code = "All",

                    });
                }
                else
                {
                    list.Insert(0, new TracersStandards
                    {
                        TracerStandardID = Convert.ToInt32(-1),
                        Code = "All",
                    });
                }
            }
            catch (Exception ex)
            {
                ex.Data.Add(TSQL, _SQLExecuted);
                throw ex;
            }

            return list;
        }

        private List<TracersEP> SelectTracerEPs(int cycleid, int programid, int siteID, string chapterid, string standardtextid)
        {
            var list = new List<TracersEP>();

            if (string.Equals(chapterid, "-1"))
            {
                list.Insert(0, new TracersEP
                {
                    EPTextID = Convert.ToInt32(-1),
                    StandardLabelAndEPLabel = "All",

                });
                return list;
            }

            standardtextid = string.IsNullOrEmpty(standardtextid) ? string.Empty : standardtextid;

            DataSet ds = new DataSet();
            DataTable dt = new DataTable();
            try
            {
                using (SqlConnection cn = new SqlConnection(ConfigurationManager.ConnectionStrings["DBMEdition01_Write"].ToString()))
                {
                    cn.Open();
                    SqlCommand cmd = new SqlCommand("ustSelectEPsWithTracers", cn);
                    cmd.CommandTimeout = Convert.ToInt32(ConfigurationManager.AppSettings["SPCmdTimeout"].ToString());
                    cmd.CommandType = CommandType.StoredProcedure;
                    cmd.Parameters.AddWithValue("@CycleID", cycleid);
                    cmd.Parameters.AddWithValue("@ProgramID", programid);
                    cmd.Parameters.AddWithValue("@SiteID", siteID);
                    if (string.Equals(chapterid, "-1"))
                        cmd.Parameters.AddWithValue("@ChapterID", DBNull.Value);
                    else
                        cmd.Parameters.AddWithValue("@ChapterID", Convert.ToInt32(chapterid));

                    if (string.Equals(standardtextid, "-1"))
                        cmd.Parameters.AddWithValue("@StandardTextIDs", DBNull.Value);
                    else
                        cmd.Parameters.AddWithValue("@StandardTextIDs", standardtextid);

                    SqlDataAdapter da = new SqlDataAdapter(cmd);

                    using (cn)
                    using (cmd)
                    using (da)
                    {
                        da.Fill(ds);
                    }

                }
                dt = ds.Tables[0];
                if (dt.Rows.Count > 0)
                {
                    list = dt.ToList<TracersEP>();
                    list.Insert(0, new TracersEP
                    {
                        EPTextID = Convert.ToInt32(-1),
                        StandardLabelAndEPLabel = "All",

                    });
                }
                else
                {
                    list.Insert(0, new TracersEP
                    {
                        EPTextID = Convert.ToInt32(-1),
                        StandardLabelAndEPLabel = "All",
                    });
                }
            }
            catch (Exception ex)
            {
                ex.Data.Add(TSQL, _SQLExecuted);
                throw ex;
            }

            return list;
        }


        private List<TracerSections> SelectTracerSectionsList(int siteid, int programid, string tracerCustomIds, string TracerStatus, string observationStatus, int tracerTypeID = -1)
        {
            var list = new List<TracerSections>();
            tracerCustomIds = tracerCustomIds == "-1" ? "" : tracerCustomIds;

            DataSet ds = new DataSet();
            DataTable dt = new DataTable();
            try
            {
                using (SqlConnection cn = new SqlConnection(this.ConnectionString))
                {
                    cn.Open();
                    SqlCommand cmd = new SqlCommand("ustReport_SelectTracerSections", cn);
                    cmd.CommandTimeout = Convert.ToInt32(ConfigurationManager.AppSettings["SPCmdTimeout"].ToString());
                    cmd.CommandType = CommandType.StoredProcedure;
                    cmd.Parameters.AddWithValue("@SiteID", siteid);
                    cmd.Parameters.AddWithValue("@ProgramID", programid);
                    cmd.Parameters.AddWithValue("@TracerCategoryIds", "");
                    cmd.Parameters.AddWithValue("@TracerCustomIds", tracerCustomIds);
                    cmd.Parameters.AddWithValue("@ResponseStatus", observationStatus);
                    cmd.Parameters.AddWithValue("@TracerStatus", TracerStatus);
                    cmd.Parameters.AddWithValue("@TracerTypeID", tracerTypeID);
                    SqlDataAdapter da = new SqlDataAdapter(cmd);

                    #if DEBUG
                        CreateSQLExecuted("ustReport_SelectTracerSections", cmd);
                        System.Diagnostics.Debug.WriteLine(_SQLExecuted);
                    #endif

                    using (cn)
                    using (cmd)
                    using (da)
                    {
                        da.Fill(ds);
                    }
                }
                dt = ds.Tables[0];
                if (dt.Rows.Count > 0)
                {
                    list = dt.ToList<TracerSections>();
                    list.Insert(0, new TracerSections
                    {
                        TracerQuestionCategoryID = "-1",
                        QuestionCategoryName = "All",

                    });
                }
                else
                {
                    list.Insert(0, new TracerSections
                    {
                        TracerQuestionCategoryID = "-1",
                        QuestionCategoryName = "All",

                    });
                }
            }
            catch (Exception ex)
            {
                ex.Data.Add(TSQL, _SQLExecuted);
                throw ex;
            }

            return list;
        }

        private List<Tracers> SelectTracerList(int siteid, int programid, string tracerCategoryIds, string TracerStatus, string observationStatus, int tracerTypeID = -1)
        {
            var list = new List<Tracers>();
            tracerCategoryIds = tracerCategoryIds == "-1" ? "" : tracerCategoryIds;
            DataSet ds = new DataSet();
            DataTable dt = new DataTable();
            try
            {
                using (SqlConnection cn = new SqlConnection(this.ConnectionString))
                {
                    cn.Open();
                    SqlCommand cmd = new SqlCommand("ustReport_SelectTracers", cn);
                    cmd.CommandTimeout = Convert.ToInt32(ConfigurationManager.AppSettings["SPCmdTimeout"].ToString());
                    cmd.CommandType = CommandType.StoredProcedure;
                    cmd.Parameters.AddWithValue("@SiteID", siteid);
                    cmd.Parameters.AddWithValue("@ProgramID", programid);
                    cmd.Parameters.AddWithValue("@TracerCategoryIds", tracerCategoryIds);
                    cmd.Parameters.AddWithValue("@ResponseStatus", observationStatus);
                    cmd.Parameters.AddWithValue("@TracerStatus", TracerStatus);
                    cmd.Parameters.AddWithValue("@TracerTypeID", tracerTypeID);
                    SqlDataAdapter da = new SqlDataAdapter(cmd);

#if DEBUG
                    CreateSQLExecuted("ustReport_SelectTracers", cmd);
                    System.Diagnostics.Debug.WriteLine(_SQLExecuted);
#endif

                    using (cn)
                    using (cmd)
                    using (da)
                    {
                        da.Fill(ds);
                    }
                }
                dt = ds.Tables[0];
                if (dt.Rows.Count > 0)
                {
                    list = dt.ToList<Tracers>();
                    list.Insert(0, new Tracers
                    {
                        TracerCustomID = Convert.ToInt32(-1),
                        TracerCustomName = "All",

                    });
                }
                else
                {
                    list.Insert(0, new Tracers
                    {
                        TracerCustomID = Convert.ToInt32(-1),
                        TracerCustomName = "All",

                    });
                }
            }
            catch (Exception ex)
            {
                ex.Data.Add(TSQL, _SQLExecuted);
                throw ex;
            }

            return list;
        }

        private List<Tracers> SelectAllTracerListBasedOnDepartmentAssignment(int siteid, int programid, string frequencyTypeids="",string TracerCategoryID ="")
        {
            var list = new List<Tracers>();
            
            DataSet ds = new DataSet();
            DataTable dt = new DataTable();
            try
            {
                using (SqlConnection cn = new SqlConnection(this.ConnectionString))
                {
                    cn.Open();
                    SqlCommand cmd = new SqlCommand("ustSelectFrequencyBasedOnTracerNames", cn);
                    cmd.CommandTimeout = Convert.ToInt32(ConfigurationManager.AppSettings["SPCmdTimeout"].ToString());
                    cmd.CommandType = CommandType.StoredProcedure;
                    cmd.Parameters.AddWithValue("@SiteID", siteid);
                    cmd.Parameters.AddWithValue("@ProgramID", programid);
                    cmd.Parameters.AddWithValue("@frequencyTypeID", frequencyTypeids);
                    cmd.Parameters.AddWithValue("@TracerCategoryIDs", TracerCategoryID);
                    SqlDataAdapter da = new SqlDataAdapter(cmd);

#if DEBUG
                    CreateSQLExecuted("ustSelectFrequencyBasedOnTracerNames", cmd);
                    System.Diagnostics.Debug.WriteLine(_SQLExecuted);
#endif

                    using (cn)
                    using (cmd)
                    using (da)
                    {
                        da.Fill(ds);
                    }
                }
                dt = ds.Tables[0];
                if (dt.Rows.Count > 0)
                {
                    list = dt.ToList<Tracers>();
                    list.Insert(0, new Tracers
                    {
                        TracerCustomID = Convert.ToInt32(-1),
                        TracerCustomName = "All",

                    });
                }
                else
                {
                    list.Insert(0, new Tracers
                    {
                        TracerCustomID = Convert.ToInt32(-1),
                        TracerCustomName = "All",

                    });
                }
            }
            catch (Exception ex)
            {
                ex.Data.Add(TSQL, _SQLExecuted);
                throw ex;
            }

            return list;
        }


        private List<Tracers> SelectAllTracerList(int siteid, int programid, string TracerStatus)
        {
            var list = new List<Tracers>();
            TracerStatus = TracerStatus == "-1" || TracerStatus == "" ? "1,2,3,12" : TracerStatus;
            DataSet ds = new DataSet();
            DataTable dt = new DataTable();
            try
            {
                using (SqlConnection cn = new SqlConnection(this.ConnectionString))
                {
                    cn.Open();
                    SqlCommand cmd = new SqlCommand("ustReport_SelectAllTracers", cn);
                    cmd.CommandTimeout = Convert.ToInt32(ConfigurationManager.AppSettings["SPCmdTimeout"].ToString());
                    cmd.CommandType = CommandType.StoredProcedure;
                    cmd.Parameters.AddWithValue("@SiteID", siteid);
                    cmd.Parameters.AddWithValue("@ProgramID", programid);
                    cmd.Parameters.AddWithValue("@TracerStatus", TracerStatus);
                    SqlDataAdapter da = new SqlDataAdapter(cmd);

#if DEBUG
                    CreateSQLExecuted("ustReport_SelectAllTracers", cmd);
                    System.Diagnostics.Debug.WriteLine(_SQLExecuted);
#endif

                    using (cn)
                    using (cmd)
                    using (da)
                    {
                        da.Fill(ds);
                    }
                }
                dt = ds.Tables[0];
                if (dt.Rows.Count > 0)
                {
                    list = dt.ToList<Tracers>();
                    list.Insert(0, new Tracers
                    {
                        TracerCustomID = Convert.ToInt32(-1),
                        TracerCustomName = "All",

                    });
                }
                else
                {
                    list.Insert(0, new Tracers
                    {
                        TracerCustomID = Convert.ToInt32(-1),
                        TracerCustomName = "All",

                    });
                }
            }
            catch (Exception ex)
            {
                ex.Data.Add(TSQL, _SQLExecuted);
                throw ex;
            }

            return list;
        }

        private List<Tracers> SelectAllTemplateList(int programid, string TemplatesStatus)
        {
            var list = new List<Tracers>();
            TemplatesStatus = TemplatesStatus == "-1" || TemplatesStatus == "" ? "1,0" : TemplatesStatus;
            DataSet ds = new DataSet();
            DataTable dt = new DataTable();
            try
            {
                using (SqlConnection cn = new SqlConnection(this.ConnectionString))
                {
                    cn.Open();
                    SqlCommand cmd = new SqlCommand("ustReport_SelectAllTemplates", cn);
                    cmd.CommandTimeout = Convert.ToInt32(ConfigurationManager.AppSettings["SPCmdTimeout"].ToString());
                    cmd.CommandType = CommandType.StoredProcedure;
                    cmd.Parameters.AddWithValue("@ProgramID", programid);
                    cmd.Parameters.AddWithValue("@TemplateStatus", TemplatesStatus);
                    SqlDataAdapter da = new SqlDataAdapter(cmd);

#if DEBUG
                    CreateSQLExecuted("ustReport_SelectAllTemplates", cmd);
                    System.Diagnostics.Debug.WriteLine(_SQLExecuted);
#endif

                    using (cn)
                    using (cmd)
                    using (da)
                    {
                        da.Fill(ds);
                    }
                }
                dt = ds.Tables[0];
                if (dt.Rows.Count > 0)
                {
                    list = dt.ToList<Tracers>();
                    list.Insert(0, new Tracers
                    {
                        TracerCustomID = Convert.ToInt32(-1),
                        TracerCustomName = "All",

                    });
                }
                else
                {
                    list.Insert(0, new Tracers
                    {
                        TracerCustomID = Convert.ToInt32(-1),
                        TracerCustomName = "All",

                    });
                }
            }
            catch (Exception ex)
            {
                ex.Data.Add(TSQL, _SQLExecuted);
                throw ex;
            }

            return list;
        }

        private List<OrgnizationType> SelectOrgnizationType(Search search, int categoryRanking,int selectedSiteID = -1, int selectedProgramID = -1)
        {
            var list = new List<OrgnizationType>();
            SearchFormat searchoutput = new SearchFormat();
            searchoutput.CheckInputs(search);
            int SiteID = selectedSiteID == -1 ? AppSession.SelectedSiteId : selectedSiteID;
            int ProgramID = selectedProgramID == -1 ? AppSession.SelectedProgramId : selectedProgramID;
            DataSet ds = new DataSet();
            DataTable dt = new DataTable();
            try
            {
                using (SqlConnection cn = new SqlConnection(this.ConnectionString))
                {
                    cn.Open();
                    SqlCommand cmd = new SqlCommand("ustReport_GetDepartmentHierarchy", cn);
                    cmd.CommandType = CommandType.StoredProcedure;
                    cmd.Parameters.AddWithValue("@SiteID", SiteID);
                    cmd.Parameters.AddWithValue("@ProgramID", ProgramID);
                    cmd.Parameters.AddWithValue("@CategoryRanking", categoryRanking);

                    cmd.Parameters.AddWithValue("@TracerIDs", search.TracerListIDs);
                    cmd.Parameters.AddWithValue("@TracerCategoryIDs", search.TracerCategoryIDs);
                    cmd.Parameters.AddWithValue("@Level3OrganizationID", search.OrgTypeLevel3IDs);
                    cmd.Parameters.AddWithValue("@Level2OrganizationID", search.OrgTypeLevel2IDs);
                    cmd.Parameters.AddWithValue("@IsCategoryActive", 1);   // Only Active Categories Should Appear (Per Navdeep 04/07/2015).

                    if (search.InActiveOrgTypes)
                    {
                        cmd.Parameters.AddWithValue("@IsCategoryItemActive", 0);
                    }
                    else
                    {
                        cmd.Parameters.AddWithValue("@IsCategoryItemActive", 1);
                    }

                    if (!string.IsNullOrEmpty(search.ReportTitle))
                    {
                        if (search.ReportTitle.Equals("Observation Status Report", StringComparison.InvariantCultureIgnoreCase))
                        {
                            search.ResponseStatus = Convert.ToInt32(search.ObservationStatus);
                        }
                    }
                    cmd.Parameters.AddWithValue("@ResponseStatus", search.ResponseStatus);

#if DEBUG
                    CreateSQLExecuted("ustReport_GetDepartmentHierarchy", cmd);
                    System.Diagnostics.Debug.WriteLine(_SQLExecuted);
#endif

                    SqlDataAdapter da = new SqlDataAdapter(cmd);

                    using (cn)
                    using (cmd)
                    using (da)
                    {
                        da.Fill(ds);
                    }
                }

                if (categoryRanking == 1)
                {
                    System.Diagnostics.Debug.WriteLine(_SQLExecuted);
                }

                dt = ds.Tables[0];
                list = dt.ToList<OrgnizationType>();
            }
            catch (Exception ex)
            {
                ex.Data.Add(TSQL, _SQLExecuted);
                throw ex;
            }
            return list;
        }

        private string SelectOrganizationName(int siteID, int programID, int ranking)
        {
            string returnVal = string.Empty;

            try
            {
                using (SqlConnection cn = new SqlConnection(this.ConnectionString))
                {
                    cn.Open();
                    SqlCommand cmd = new SqlCommand("ustReport_GetOrganizationName", cn);
                    cmd.CommandType = CommandType.StoredProcedure;
                    cmd.Parameters.AddWithValue("@SiteID", siteID);
                    cmd.Parameters.AddWithValue("@ProgramID", AppSession.SelectedProgramId);
                    cmd.Parameters.AddWithValue("@Ranking", ranking);



#if DEBUG
                    CreateSQLExecuted("ustReport_GetDepartmentHierarchy", cmd);
                    System.Diagnostics.Debug.WriteLine(_SQLExecuted);
#endif

                    returnVal = cmd.ExecuteScalar() as string;

                }
            }
            catch (Exception ex)
            {
                ex.Data.Add(TSQL, _SQLExecuted);
                throw ex;
            }
            return returnVal;
        }


        private List<TracersUser> SelectTracersObsEnteredBy(Search search)
        {
            var list = new List<TracersUser>();

            DataSet ds = new DataSet();
            DataTable dt = new DataTable();
            try
            {
                using (SqlConnection cn = new SqlConnection(this.ConnectionString))
                {
                    cn.Open();
                    SqlCommand cmd = new SqlCommand("ustReport_SelectTracerResponseUsers", cn);
                    cmd.CommandType = CommandType.StoredProcedure;
                    cmd.Parameters.AddWithValue("SiteID", AppSession.SelectedSiteId);
                    cmd.Parameters.AddWithValue("ProgramID", AppSession.SelectedProgramId);
                    cmd.Parameters.AddWithValue("TracerCategoryIDs", search.TracerCategoryIDs);
                    cmd.Parameters.AddWithValue("TracerIDs", search.TracerListIDs);
                    cmd.Parameters.AddWithValue("OrgIDs_Rank3", search.OrgTypeLevel3IDs);
                    cmd.Parameters.AddWithValue("OrgIDs_Rank2", search.OrgTypeLevel2IDs);
                    cmd.Parameters.AddWithValue("OrgIDs_Rank1_Depts", search.OrgTypeLevel1IDs);
                    cmd.Parameters.AddWithValue("OrgActive", search.InActiveOrgTypes ? -1 : 1);
                    cmd.Parameters.AddWithValue("ResponseStatus", search.ResponseStatus);

#if DEBUG
                    CreateSQLExecuted("ustReport_SelectTracerResponseUsers", cmd);
                    System.Diagnostics.Debug.WriteLine(_SQLExecuted);
#endif

                    SqlDataAdapter da = new SqlDataAdapter(cmd);

                    using (cn)
                    using (cmd)
                    using (da)
                    {
                        da.Fill(ds);
                    }

                }
                dt = ds.Tables[0];
                if (dt.Rows.Count > 0)
                {
                    list = dt.ToList<TracersUser>();
                    //list.Insert(0, new TracersUser
                    //{
                    //    UserID = Convert.ToInt32(-1),
                    //    UserName = "All",

                    //});
                }
                else
                {
                    list.Insert(0, new TracersUser
                    {
                        UserID = Convert.ToInt32(-1),
                        UserName = "All",

                    });
                }
            }
            catch (Exception ex)
            {
                ex.Data.Add(TSQL, _SQLExecuted);
                throw ex;
            }

            return list;
        }

        private List<TracersUser> SelectTaskUsers()
        {
            var list = new List<TracersUser>();

            DataSet ds = new DataSet();
            DataTable dt = new DataTable();
            try
            {
                using (SqlConnection cn = new SqlConnection(this.ConnectionString))
                {
                    cn.Open();
                    SqlCommand cmd = new SqlCommand("ustReport_SelectTasksUsers", cn);
                    cmd.CommandType = CommandType.StoredProcedure;
                    cmd.Parameters.AddWithValue("SiteID", AppSession.SelectedSiteId);
                    //cmd.Parameters.AddWithValue("ProgramID", AppSession.SelectedProgramId);   //Future


                    SqlDataAdapter da = new SqlDataAdapter(cmd);

                    using (cn)
                    using (cmd)
                    using (da)
                    {
                        da.Fill(ds);
                    }

                }
                dt = ds.Tables[0];
                if (dt.Rows.Count > 0)
                {
                    list = dt.ToList<TracersUser>();
                    list.Insert(0, new TracersUser
                    {
                        UserID = Convert.ToInt32(-1),
                        UserName = "All",

                    });
                }
                else
                {
                    list.Insert(0, new TracersUser
                    {
                        UserID = Convert.ToInt32(-1),
                        UserName = "All",

                    });
                }
            }
            catch (Exception ex)
            {
                ex.Data.Add(TSQL, _SQLExecuted);
                throw ex;
            }

            return list;
        }

        private List<TracersStatus> SelectTracerStatus(int tracerStatusTypeID, string tracerStatusIDs = "")
        {
            var list = new List<TracersStatus>();

            DataSet ds = new DataSet();
            DataTable dt = new DataTable();
            try
            {
                using (SqlConnection cn = new SqlConnection(this.ConnectionString))
                {
                    cn.Open();
                    SqlCommand cmd = new SqlCommand("ustReport_SelectTracerStatus", cn);
                    cmd.CommandType = CommandType.StoredProcedure;
                    cmd.Parameters.AddWithValue("SiteID", AppSession.SelectedSiteId);
                    cmd.Parameters.AddWithValue("TracerStatusTypeID", tracerStatusTypeID);
                    cmd.Parameters.AddWithValue("TracerStatusIDs", tracerStatusIDs.ToString());
                    SqlDataAdapter da = new SqlDataAdapter(cmd);

                    using (cn)
                    using (cmd)
                    using (da)
                    {
                        da.Fill(ds);
                    }

                }
                dt = ds.Tables[0];
                if (dt.Rows.Count > 0)
                {
                    list = dt.ToList<TracersStatus>();
                }
                else
                {
                    list.Insert(0, new TracersStatus
                    {
                        TracerStatusID = Convert.ToInt32(-1),
                        TracerStatusName = "All",
                    });
                }
            }
            catch (Exception ex)
            {
                ex.Data.Add(TSQL, _SQLExecuted);
                throw ex;
            }

            return list;
        }


        /// <summary>
        /// Loads the saved parameters
        /// </summary>
        /// <param name="reportScheduleID"></param>
        /// <param name="messageCode"></param>
        /// <returns></returns>
        public CorporateSearchList GetCorpSearchListsForSavedParameters(int reportScheduleID, SaveAndSchedule savedParameters, string messageCode = "")
        {
            CorporateSearchList searchlist = new CorporateSearchList();
            SearchCorporateER search = new SearchCorporateER();

          

            search.ProgramIDs = GetParameterValue(savedParameters.ReportParameters, WebConstants.PROGRAM_SERVICES);
            search.SelectedChapterIDs = GetParameterValue(savedParameters.ReportParameters, WebConstants.CHAPTER);
            search.SelectedStandardIDs = GetParameterValue(savedParameters.ReportParameters, WebConstants.Standard);
            //search.IncludeRFI = GetParameterValue(savedParameters.ReportParameters, WebConstants.ORGTYPE_CHECKBOX) == "True" ? true : false;

            if (!string.IsNullOrWhiteSpace(messageCode))
                searchlist.ReportTitle = messageCode;

            return searchlist;
        }

        public CorporateSearchList GetCorpSearchLists(string ReportTitle = "")
        {
            CorporateSearchList searchlist = new CorporateSearchList();
            
            searchlist.ReportTitle = ReportTitle;

            return searchlist;
        }


        #region Helper Methods


        /// <summary>
        /// GetValue: Get a value or DBNull if null object
        /// </summary>
        /// <param name="val">object to check</param>
        /// <returns>object value or DBNull</returns>
        private object GetValue(object val)
        {
            return val == null ? DBNull.Value : val;
        }

        /// <summary>
        /// GetDateOrNul: Get a DateTime or null
        /// </summary>
        /// <param name="dt">date object</param>
        /// <returns>DateTime or null</returns>
        private DateTime? GetDateOrNull(object dt)
        {
            if (dt == DBNull.Value)
            {
                return null;
            }
            else
            {
                return Convert.ToDateTime(dt);
            }
        }

        /// <summary>
        /// GetIntOrNull: Get an int or null
        /// </summary>
        /// <param name="i">int object</param>
        /// <returns>int or null</returns>
        private int? GetIntOrNull(object i)
        {
            if (i == DBNull.Value)
            {
                return null;
            }
            else
            {
                return Convert.ToInt32(i);
            }
        }

        /// <summary>
        /// ValidateEmailString: helper method to validate email addresses        
        /// </summary>
        /// <param name="emailString">email address string, semi-colon separated</param>
        /// <returns>true if all email address are formatted correctly, false if not</returns>
        private bool ValidateEmailString(string emailString)
        {
            bool rc = true;

            // check email addresses
            char[] sep = { ';' };
            emailString = emailString.Trim();
            string[] emailList = emailString.Split(sep, StringSplitOptions.RemoveEmptyEntries);
            foreach (var email in emailList)
            {
                if (!IsEmailAddress(email.Trim()))
                {
                    rc = false;
                    break;
                }
            }

            return rc;
        }

        /// <summary>
        /// IsEmailAddress: helper method to validate single email address
        /// </summary>
        /// <param name="strEmail">single email address</param>
        /// <returns>true or false</returns>
        private bool IsEmailAddress(string strEmail)
        {
            if (strEmail == null || strEmail.Length == 0)
                return false;
            if (strEmail.IndexOf(" ") > -1)
                return false;
            if (strEmail.Substring(strEmail.Length - 1, 1) == ".")
                return false;
            if (!Regex.IsMatch(strEmail, "^[-A-Za-z0-9_@.']+$"))
                return false;
            int index = strEmail.IndexOf("@");
            if ((index <= 0) || (index >= (strEmail.Length - 3)))
                return false;
            if (strEmail.IndexOf("@", (int)(index + 1)) >= 0)
                return false;
            if ((strEmail.IndexOf(".@") >= 0) || (strEmail.IndexOf("@.") >= 0))
                return false;
            int num2 = strEmail.LastIndexOf(".");
            return (num2 >= 0 && num2 > (index + 1));
        }

        /// <summary>
        /// Gets the report parameter value
        /// </summary>
        /// <param name="savedParameters"></param>
        /// <param name="parameterName"></param>
        /// <returns></returns>
        private string GetParameterValue(List<ReportUserScheduleParameter> savedParameters, string parameterName)
        {
            if (savedParameters.Find(param => param.ReportParameterName == parameterName) != null)
                return savedParameters.Find(param => param.ReportParameterName == parameterName).ParameterValue;
            else
                return string.Empty;
        }
        #endregion

    }
}
