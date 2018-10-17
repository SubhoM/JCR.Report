using System;
using System.Collections.Generic;
using System.Linq;
using System.Data;
using System.Data.SqlClient;
using JCR.Reports.Models;
using System.Configuration;
using JCR.Reports.Common;
using JCR.Reports.DataModel;
using JCR.Reports.Models.Enums;
using System.Web.Services;

namespace JCR.Reports.Services
{
    public class CorporateSearchInputService : BaseService
    {
        /// <summary>
        /// Constructors
        /// </summary>
        public CorporateSearchInputService()
            : base()
        {
        }

        public List<MockSurvey> GetMultiSiteMockSurveys(string selectedSiteIDs, int StatusID, int? programID = null)
        {
            var MockSurveyList = CorporateFinding.GetMultiSiteMockSurveys(selectedSiteIDs, StatusID, programID);

            MockSurveyList.Insert(0, new MockSurvey
            {
                MockSurveyID = Convert.ToInt32(-1),
                MockSurveyName = "All",
                StatusId = 0
            });

            return MockSurveyList;
        }

        public List<CorpUser> GetCorpUsersBySite(string userRoleName, string selectedSiteIDs, int StatusID)
        {
            var MockSurveyUserList = CorporateFinding.GetCorpUsersBySite(userRoleName, selectedSiteIDs, StatusID);

            MockSurveyUserList.Insert(0, new CorpUser
            {
                UserID = Convert.ToInt32(-1),
                UserName = "All"
            });

            return MockSurveyUserList;
        }

        public MockSurveyCriteria GetMockSurveyCriteria(string selectedSiteIDs)
        {
            var objMockSurveyCriteria = new MockSurveyCriteria();
            var MockSurveyList = new List<MockSurvey>();

            //Mock Survey Status Variable. Corporate Reports displays data after Mock Survey Recommendations are approved.
            var MockSurveyStatusID = (int)MockSurveyStatus.Publish_CCA_Recommendation;
            MockSurveyList = GetMockSurveyNameList(selectedSiteIDs);

            var CorpTLList = new List<CorpUser>();

            if (selectedSiteIDs != "-1")
                CorpTLList = GetCorpUsersBySite("Team Lead", selectedSiteIDs, MockSurveyStatusID);
            else
                CorpTLList.Add(new CorpUser
                {
                    UserID = Convert.ToInt32(-1),
                    UserName = "All",
                });

            var CorpTMList = new List<CorpUser>();
            if (selectedSiteIDs != "-1")
                CorpTMList = GetCorpUsersBySite("Team Member", selectedSiteIDs, MockSurveyStatusID);
            else
                CorpTMList.Add(new CorpUser
                {
                    UserID = Convert.ToInt32(-1),
                    UserName = "All",
                });

            objMockSurveyCriteria.MockSurveyList = MockSurveyList;
            objMockSurveyCriteria.TeamLeadList = CorpTLList;
            objMockSurveyCriteria.TeamMemberList = CorpTMList;

            return objMockSurveyCriteria;
        }

        public List<MockSurvey> GetMockSurveyNameList(string selectedSiteIDs, int? programID = null)
        {
            var MockSurveyList = new List<MockSurvey>();

            //Mock Survey Status Variable. Corporate Reports displays data after Mock Survey Recommendations are approved.
            var MockSurveyStatusID = (int)MockSurveyStatus.Publish_CCA_Recommendation;

            if (selectedSiteIDs != "-1")
                MockSurveyList = GetMultiSiteMockSurveys(selectedSiteIDs, MockSurveyStatusID, programID);
            else
                MockSurveyList.Add(new MockSurvey
                {
                    MockSurveyID = Convert.ToInt32(-1),
                    MockSurveyName = "All",
                    StatusId = 0
                });

            return MockSurveyList;
        }

        public List<Programs> GetMultiSitePrograms(string selectedSiteIDs)
        {
            var programlist = new List<Programs>();

            if (AppSession.ReportID != 1 || AppSession.Sites.Count > 1)
            {
                programlist = StandardData.GetProgramSites(selectedSiteIDs);
                programlist = GetCMSProgramsFiltered(programlist);

                switch ((ReportsListEnum)AppSession.ReportID)
                {
                    case ReportsListEnum.EPScoringReport:
                    case ReportsListEnum.TaskAssignment:
                    case ReportsListEnum.EPAssignmentScoring:
                    case ReportsListEnum.CMSCompliance:
                    case ReportsListEnum.EPsNotScoredinPeriod:
                    case ReportsListEnum.EPScoringReportFinalMockSurvey:
                    case ReportsListEnum.ComprehensiveScoringReport:
                        break;
                    default:
                        programlist.Insert(0, new Programs
                        {
                            BaseProgramID = Convert.ToInt32(-1),
                            ProgramID = Convert.ToInt32(-1),
                            ProgramName = "All"
                        });
                        break;
                }

            }
            else
            {
                if (selectedSiteIDs != "-1")
                {
                    programlist = StandardData.GetProgramSites(selectedSiteIDs);
                    programlist = GetCMSProgramsFiltered(programlist);
                }

                programlist.Insert(0, new Programs
                {
                    BaseProgramID = Convert.ToInt32(-1),
                    ProgramID = Convert.ToInt32(-1),
                    ProgramName = "All"
                });
            }

            return programlist;
        }

        public bool CheckCMSForSiteID(string selectedSiteIDs)
        {
            var isCMS = false;
            if (AppSession.ReportID != 1 || AppSession.Sites.Count > 1)
            {
                var subscriptionTypeID = CMSService.GetSubscriptionTypeIDForCMS((WebConstants.LinkType)AppSession.LinkType);
                var cmsSites = CMSService.GetCMSProgramsBySiteID(Convert.ToInt32(selectedSiteIDs.Replace(",","")), subscriptionTypeID);

                if(cmsSites.Count>0){
                    isCMS = true;
                }

            }
            return isCMS;
        }
        private static List<Programs> GetCMSProgramsFiltered(List<Programs> programlist)
        {
            if ((ReportsListEnum)AppSession.ReportID == ReportsListEnum.CMSCompliance)
            {
                var subscriptionTypeID = CMSService.GetSubscriptionTypeIDForCMS((WebConstants.LinkType)AppSession.LinkType);
                var cmsSites = CMSService.GetCMSProgramsBySiteID(AppSession.SelectedSiteId, subscriptionTypeID);

                programlist = (from program in programlist
                               join cms in cmsSites on program.ProgramID equals cms.ProgramID
                               select program).ToList();

            }

            return programlist;
        }

        public List<Chapter> GetMultiSiteChapters(string selectedSiteIDs, string selectedPgmIDs)
        {
            var chapterlist = new List<Chapter>();

            if (selectedSiteIDs != "-1")
                chapterlist = StandardData.GetChapters(selectedSiteIDs, selectedPgmIDs).ToList();

            if ((ReportsListEnum)AppSession.ReportID != ReportsListEnum.ComprehensiveScoringReport)
            {
                chapterlist.Insert(0, new Chapter
                {
                    ChapterID = Convert.ToInt32(-1),
                    ChapterText = "All"
                });
            }

            return chapterlist;
        }

        public List<Standard> GetMultiSiteStandards(string selectedProgramIDs, string selectedChapterIDs)
        {
            var standardlist = new List<Standard>();

            if (selectedChapterIDs != "-1")
                standardlist = StandardData.GetStandards(selectedProgramIDs, selectedChapterIDs).ToList();

            standardlist.Insert(0, new Standard
            {
                StandardID = Convert.ToInt32(-1),
                StandardLabel = "All"
            });

            return standardlist;
        }

        public List<EP> GetMultiSiteEPs(string selectedProgramIDs, string selectedChapterIDs, string selectedStandardIDs)
        {
            var eplist = new List<EP>();

            if (selectedStandardIDs != "-1")
                eplist = ERSearchInputService.SelectMultiSiteEPs((int)AppSession.CycleID, selectedProgramIDs, selectedChapterIDs, selectedStandardIDs).Select(x => new EP() { EPTextID = x.EPTextID, EPText = x.EPText, StandardLabelAndEPLabel = x.StandardLabelAndEPLabel }).ToList();
            else
                eplist.Add(new EP
                {
                    EPTextID = Convert.ToInt32(-1),
                    EPText = "All",
                    StandardLabelAndEPLabel = "All"
                });

            return eplist;
        }

        public List<ScoredByUser> GetScoredByForEPs(int siteID, int selectedProgramID, string selectedChapterIDs, string selectedStandardIDs, string selectedScoreType)
        {
            var epsScoredBy = new List<ScoredByUser>();

            if (selectedProgramID > 0 || selectedChapterIDs != "-1" || selectedStandardIDs != "-1" || selectedScoreType != "-1")
            {
                epsScoredBy = EPScoringReport.GetScoredByForEPs(siteID, selectedProgramID,
                    selectedChapterIDs != "-1" ? selectedChapterIDs : null,
                    selectedStandardIDs != "-1" ? selectedStandardIDs : null,
                    selectedScoreType != "-1" ? selectedScoreType : null
                    ).Select(x => new ScoredByUser() { UserID = x.UserID, UserName = x.UserName }).ToList();
            }

            epsScoredBy.Insert(0, new ScoredByUser
            {
                UserID = Convert.ToInt32(-1),
                UserName = "All",
            });

            return epsScoredBy;
        }
    }
}