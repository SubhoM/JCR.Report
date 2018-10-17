using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using JCR.Reports.Models;
using JCR.Reports.Common;
using JCR.Reports.DataModel;

namespace JCR.Reports.DataModel
{
    public class SaferMatrix
    {
        public static SaferMatrixMap GetSaferMatrix(SearchCorporateER search)
        {
            int limit = 8;
            var mockSurveyList = GetSaferMatrixData(search);

            if (mockSurveyList.Count < 1)
                return null;

            var saferMatrixMap = new SaferMatrixMap();

            using (var dbmDbEntityContainer = new DBMEdition01_Entities())
            {
                foreach (var safer in dbmDbEntityContainer.GetSafterMap())
                {
                    var shortList = mockSurveyList.Where(item => item.CorporateFinalScoreID == safer.ScoreID).DistinctBy(x => new {x.SiteID, x.StandardLabel });

                    shortList = GroupBySite(shortList);
                    var shortListCount = shortList.Count();
                    var fullEP = ReturnCorpFindings(safer, shortList.Take(limit));
                    if (shortListCount > limit)
                        fullEP = string.Format("{0}+({1}) more EP(s)", fullEP, (shortList.Count() - limit).ToString());

                    AssignEPValue(saferMatrixMap, fullEP, safer.ScoreID);
                }
            }
            return saferMatrixMap;

        }

        

        private static IEnumerable<SaferMatrixData> GroupBySite(IEnumerable<SaferMatrixData> shortList)
        {
            var shortListData = new List<SaferMatrixData>();

            var added = new List<string>();

            foreach(var item in shortList.ToList())
            {
                if(!added.Contains(item.StandardLabel))
                {

                    var items = shortList.Where(eps => string.Equals(eps.StandardLabel, item.StandardLabel));

                    added.Add(item.StandardLabel);
                    if (items.Count() > 1)                    
                        item.StandardLabel = string.Format("{0} ({1} Sites)", item.StandardLabel, items.Count());
                    shortListData.Add(item);
                }
            }

            return shortListData;
        }

        public static List<MockSurveyCorporateFindingsReport> GetSaferMatrixRDLC(SearchCorporateER search)
        {
            var saferMatrixList = new List<MockSurveyCorporateFindingsReport>();
            var mockSurveyList = GetSaferMatrixData(search);
            int limit = int.MaxValue;
            var list = new List<MockSurveyCorporateFindingsReport>();

            using (var dbmDbEntityContainer = new DBMEdition01_Entities())
            {
                foreach (var safer in dbmDbEntityContainer.GetSafterMap())
                {
                    var shortList = mockSurveyList.Where(item => item.CorporateFinalScoreID == safer.ScoreID).DistinctBy(x => new { x.SiteID, x.StandardLabel });
                    shortList = GroupBySite(shortList);
                    var shortListCount = shortList.Count();
                    MockSurveyCorporateFindingsReport addItem = ReturnCorpFindingsRDLC(safer, shortList.Take(limit));
                    if (shortListCount > limit)
                        addItem.FullEP = string.Format("{0}+({1}) more EP(s)", addItem.FullEP, (shortList.Count() - limit).ToString());

                    list.Add(addItem);
                }
            }

            return list;
        }

        private static MockSurveyCorporateFindingsReport ReturnCorpFindingsRDLC(SafterMap safer, IEnumerable<SaferMatrixData> enumerable)
        {
            string fullEP = string.Empty;
            string breakString = "<br>";

            if (enumerable != null && enumerable.Count() > 0)
                foreach (var ep in enumerable)
                    fullEP = fullEP + ep.StandardLabel + breakString;

            return new MockSurveyCorporateFindingsReport
            {
                CorporateFinalScoreID = safer.ScoreID,
                FullEP = fullEP,
                LikeID = (int)safer.LikeID,
                ScopeID = safer.ScopeID.HasValue ? (int)safer.ScopeID : 1000,
                Likelihood = safer.Likelihood,
                Scope = safer.Scope
            };
        }

        private static void AssignEPValue(SaferMatrixMap saferMatrixMap, string fullEP, int scoreID)
        {
            switch(scoreID)
            {
                case 1000:
                    saferMatrixMap.ImmediateThreat = fullEP;
                    break;
                case 1321:
                    saferMatrixMap.HighLimited = fullEP;
                    break;
                case 1322:
                    saferMatrixMap.HighPattern = fullEP;
                    break;
                case 1323:
                    saferMatrixMap.HighWidespread = fullEP;
                    break;
                case 1221:
                    saferMatrixMap.ModerateLimited = fullEP;
                    break;
                case 1222:
                    saferMatrixMap.ModeratePattern = fullEP;
                    break;
                case 1223:
                    saferMatrixMap.ModerateWidespread = fullEP;
                    break;
                case 1121:
                    saferMatrixMap.LowLimited = fullEP;
                    break;
                case 1122:
                    saferMatrixMap.LowPattern = fullEP;
                    break;
                case 1123:
                    saferMatrixMap.LowWidespread = fullEP;
                    break;
                default:
                    break;
            }
        }

        private static string ReturnCorpFindings(SafterMap safer, IEnumerable<SaferMatrixData> enumerable)
        {
            string fullEP = string.Empty;
            string breakString = "<br>";

            if (enumerable != null && enumerable.Count() > 0)
                foreach (var ep in enumerable)
                    fullEP = fullEP + ep.StandardLabel + breakString;

            return fullEP;
        }

        public static List<SaferMatrixData> GetSaferMatrixData(SearchCorporateER search)
        {
            var result = new List<SaferMatrixData>();
            using (var dbmDbEntityContainer = new DBMEdition01_Entities())
            {
                result = dbmDbEntityContainer.GetSaferMatrixData(search.SelectedSiteIDs, search.ProgramIDs, search.SelectedStandardIDs, 
                    search.SelectedChapterIDs, search.SelectedEPIDs, int.Parse(search.ScoreType), search.StartDate,
                    search.EndDate, search.MatrixID, search.IncludeFsa, search.MockSurveyStatusID, AppSession.CycleID).ToList();
            }

            return result;
        }

        public static List<SaferMatrixSummary> GetSaferMatrixSummary(SearchCorporateER search)
        {
            var result = new List<SaferMatrixSummary>();
            using (var dbmDbEntityContainer = new DBMEdition01_Entities())
            {
                result = dbmDbEntityContainer.GetSaferMatrixSummary(search.SelectedSiteIDs, search.ProgramIDs, search.SelectedStandardIDs,
                    search.SelectedChapterIDs, search.SelectedEPIDs, int.Parse(search.ScoreType), search.StartDate,
                    search.EndDate, search.MatrixID, search.IncludeFsa, search.MockSurveyStatusID, AppSession.CycleID).ToList();
            }

            return result;
        }

        public static List<SaferMatrixSummaryBySite> GetSaferMatrixSummaryBySite(SearchCorporateER search)
        {
            var result = new List<SaferMatrixSummaryBySite>();
            using (var dbmDbEntityContainer = new DBMEdition01_Entities())
            {
                result = dbmDbEntityContainer.GetSaferMatrixSummaryBySite(search.SelectedSiteIDs, search.ProgramIDs, search.SelectedStandardIDs,
                    search.SelectedChapterIDs, search.SelectedEPIDs, int.Parse(search.ScoreType), search.StartDate,
                    search.EndDate, search.MatrixID, search.IncludeFsa, search.MockSurveyStatusID, AppSession.CycleID).ToList();
            }

            return result;
        }

        public static List<SaferMatrixSummaryByChapter> GetSaferMatrixSummaryByChapter(SearchCorporateER search)
        {
            var result = new List<SaferMatrixSummaryByChapter>();
            using (var dbmDbEntityContainer = new DBMEdition01_Entities())
            {
                result = dbmDbEntityContainer.GetSaferMatrixSummaryByChapter(search.SelectedSiteIDs, search.ProgramIDs, search.SelectedStandardIDs,
                    search.SelectedChapterIDs, search.SelectedEPIDs, int.Parse(search.ScoreType), search.StartDate,
                    search.EndDate, search.MatrixID, search.IncludeFsa, search.MockSurveyStatusID, AppSession.CycleID).ToList();
            }

            return result;
        }

    }
    
}