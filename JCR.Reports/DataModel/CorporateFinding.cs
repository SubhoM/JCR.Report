using System;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;
using System.Web;
using JCR.Reports.Areas.Corporate.ViewModels;
using JCR.Reports.Models;

namespace JCR.Reports.DataModel
{
    public class CorporateFinding
    {
        //public static List<Site> GetCorporateSitesByUser(int UserID, Nullable<bool> filteredsites = false)
        //{
        //    var result = new List<Site>();
        //    using (var ampDbEntityContainer = new AMPDbEntityContainer())
        //    {
        //        result = ampDbEntityContainer.GetCorporateSitesByUser(UserID).ToList();
        //    }

        //    return result;
        //}

        public static List<Site> GetSitesByUser(int UserID, Nullable<bool> filteredsites = false)
        {
            var result = new List<Site>();
            using (var dbmDbEntityContainer = new DBMEdition01_Entities())
            {
                result = dbmDbEntityContainer.GetSelectSitesByUser(UserID).ToList();
            }

            return result;
        }

        public static List<MockSurvey> GetMultiSiteMockSurveys(String selectedSiteIDs, int statusID, int? programID = null)
        {
            var result = new List<MockSurvey>();
            using (var dbmEditionContainer = new DBMEdition01_Entities())
            {
                result = dbmEditionContainer.GetMockSurveysBySites(selectedSiteIDs, statusID, programID).ToList();
            }
            return result;
        }

        public static string GetReportHcoIDs(string selectedSiteIDs)
        {
            string hcoIDs = string.Empty;
            using (var dbmEditionContainer = new DBMEdition01_Entities())
            {
                hcoIDs = dbmEditionContainer.GetHcoIDs(selectedSiteIDs).FirstOrDefault();
            }

            return hcoIDs;
        }

        public static List<CorpProgramFinding> GetCorpFindingByProgram(string siteIDs, string mockSurveyIDs, string mSTeamLeadIDs, string mSTeamMemberIDs, string programIDs, string standardTextIDs, string chapterIDs, string ePTextIDs, Nullable<System.DateTime> startDate, Nullable<System.DateTime> endDate, Nullable<bool> rFIInclude, Nullable<bool> onlyFSAEPs, Nullable<int> mockSurveyStatusID, DateTime? standardEffBeginDate = null)
        {
            var result = new List<CorpProgramFinding>();
            using (var dbmEditionContainer = new DBMEdition01_Entities())
            {
                result = dbmEditionContainer.GetCorpFindingByProgram(siteIDs, mockSurveyIDs, mSTeamLeadIDs, mSTeamMemberIDs, programIDs, standardTextIDs, chapterIDs, startDate, endDate, rFIInclude, onlyFSAEPs, mockSurveyStatusID, standardEffBeginDate).ToList();
            }
            return result;
        }


        public static List<CorpProgramFinding> GetCorpFindingByProgram(SearchCorporateER search, DateTime? standardEffBeginDate = null)
        {
            var result = new List<CorpProgramFinding>();
            using (var dbmEditionEntityContainer = new DBMEdition01_Entities())
            {
                result = dbmEditionEntityContainer.GetCorpFindingByProgram(search.SelectedSiteIDs, search.SelectedMockSurveyIDs, search.SelectedMockSurveyLeadIDs, search.SelectedMockSurveyMemberIDs, search.ProgramIDs, search.SelectedStandardIDs, search.SelectedChapterIDs, search.StartDate, search.EndDate, search.IncludeRFI, search.IncludeFsa, search.MockSurveyStatusID, standardEffBeginDate).ToList();
                
            }
            return result;
        }

        public static List<CorpChapterFinding> GetCorpFindingByChapter(string siteIDs, string mockSurveyIDs, string mSTeamLeadIDs, string mSTeamMemberIDs, string programIDs, string standardTextIDs, string chapterIDs, string ePTextIDs, Nullable<System.DateTime> startDate, Nullable<System.DateTime> endDate, bool rfiInclude, bool onlyFSAEPS, int mockSurveyStatusID, DateTime? standardEffBeginDate = null)
        {
            var result = new List<CorpChapterFinding>();
            using (var dbmEditionEntityContainer = new DBMEdition01_Entities())
            {
                result = dbmEditionEntityContainer.GetCorpFindingByChapter(siteIDs, mockSurveyIDs, mSTeamLeadIDs, mSTeamMemberIDs, programIDs, standardTextIDs, chapterIDs, startDate, endDate, rfiInclude, onlyFSAEPS, mockSurveyStatusID, standardEffBeginDate).ToList();
            }

            return result;
        }

        public static List<CorpChapterFinding> GetCorpFindingByChapter(SearchCorporateER search, DateTime? standardEffBeginDate = null)
        {
            var result = new List<CorpChapterFinding>();

            try
            {
                using (var dbmEditionEntityContainer = new DBMEdition01_Entities())
                {
                    result = dbmEditionEntityContainer.GetCorpFindingByChapter(search.SelectedSiteIDs, search.SelectedMockSurveyIDs, search.SelectedMockSurveyLeadIDs, search.SelectedMockSurveyMemberIDs, search.ProgramIDs, search.SelectedStandardIDs, search.SelectedChapterIDs, search.StartDate, search.EndDate, search.IncludeRFI, search.IncludeFsa, search.MockSurveyStatusID, standardEffBeginDate).ToList();
                }
            }
            catch (Exception ex)
            {
                throw ex;
            }

            return result;
        }

        public static List<CorpStandardFinding> GetCorpFindingByStandard(string siteIDs, string mockSurveyIDs, string mSTeamLeadIDs, string mSTeamMemberIDs, string programIDs, string standardTextIDs, string chapterIDs, string ePTextIDs, Nullable<System.DateTime> startDate, Nullable<System.DateTime> endDate, bool rfiInclude, bool onlyFSAEPs, int mockSurveyStatusID, DateTime? standardEffBeginDate = null)
        {
            var result = new List<CorpStandardFinding>();
            using (var dbmEditionEntityContainer = new DBMEdition01_Entities())
            {
                result = dbmEditionEntityContainer.GetCorpFindingByStandard(siteIDs, mockSurveyIDs, mSTeamLeadIDs, mSTeamMemberIDs, programIDs, standardTextIDs, chapterIDs, startDate, endDate, rfiInclude, onlyFSAEPs, mockSurveyStatusID, standardEffBeginDate).ToList();
            }

            return result;
        }

        public static List<CorpStandardFinding> GetCorpFindingByStandard(SearchCorporateER search, DateTime? standardEffBeginDate = null)
        {
            var result = new List<CorpStandardFinding>();
            using (var dbmEditionEntityContainer = new DBMEdition01_Entities())
            {
                try
                {
                    result = dbmEditionEntityContainer.GetCorpFindingByStandard(search.SelectedSiteIDs, search.SelectedMockSurveyIDs, search.SelectedMockSurveyLeadIDs, search.SelectedMockSurveyMemberIDs, search.ProgramIDs, search.SelectedStandardIDs, search.SelectedChapterIDs, search.StartDate, search.EndDate, search.IncludeRFI, search.IncludeFsa, search.MockSurveyStatusID, standardEffBeginDate).ToList();
                }
                catch (Exception e)
                {
                    string x = e.ToString();
                }
            }
            return result;
        }

        public static List<CorpEPFinding> GetCorpFindingByEP(string siteIDs, string mockSurveyIDs, string mSTeamLeadIDs, string mSTeamMemberIDs, string programIDs, string standardTextIDs, string chapterIDs, string ePTextIDs, Nullable<System.DateTime> startDate, Nullable<System.DateTime> endDate, bool rFIInclude, bool onlyFSAEPs, int mockSurveyStatusID, DateTime? standardEffBeginDate = null)
        {
            var result = new List<CorpEPFinding>();
            using (var dbmEditionEntityContainer = new DBMEdition01_Entities())
            {
                result = dbmEditionEntityContainer.GetCorpFindingByEP(siteIDs, mockSurveyIDs, mSTeamLeadIDs, mSTeamMemberIDs, programIDs, standardTextIDs, chapterIDs, startDate, endDate, rFIInclude, onlyFSAEPs, mockSurveyStatusID, standardEffBeginDate).ToList();
            }

            return result;
        }

        public static List<CorpEPFinding> GetCorpFindingByEP(SearchCorporateER search, DateTime? standardEffBeginDate = null)
        {
            var result = new List<CorpEPFinding>();
            using (var dbmEditionEntityContainer = new DBMEdition01_Entities())
            {
                dbmEditionEntityContainer.Database.CommandTimeout = Convert.ToInt32(ConfigurationManager.AppSettings["SPCmdTimeout"].ToString());
                result = dbmEditionEntityContainer.GetCorpFindingByEP(search.SelectedSiteIDs, search.SelectedMockSurveyIDs, search.SelectedMockSurveyLeadIDs, search.SelectedMockSurveyMemberIDs, search.ProgramIDs, search.SelectedStandardIDs, search.SelectedChapterIDs, search.StartDate, search.EndDate, search.IncludeRFI, search.IncludeFsa, search.MockSurveyStatusID, standardEffBeginDate).ToList();
            }

            return result;
        }

        public static List<CorpUser> GetCorpUsersBySite(string userRoleName, string siteIDs, int StatusID)
        {
            var result = new List<CorpUser>();
            using (var dbmEditionEntityContainer = new DBMEdition01_Entities())
            {
                result = dbmEditionEntityContainer.GetCorpUsersBySite(userRoleName, siteIDs, StatusID).ToList();
            }

            return result;
        }
    }
}