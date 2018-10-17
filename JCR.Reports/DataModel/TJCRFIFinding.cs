using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using JCR.Reports.Areas.Corporate.ViewModels;
using JCR.Reports.Models;

namespace JCR.Reports.DataModel
{
    public class TJCRFIFinding
    {
        public static List<Site> GetSitesByUser(int UserID, Nullable<bool> filteredsites = false)
        {
            var result = new List<Site>();
            using (var dbmDbEntityContainer = new DBMEdition01_Entities())
            {
                result = dbmDbEntityContainer.GetSelectSitesByUser(UserID).ToList();
            }

            return result;
        }
        
        public static string GetReportHcoIDs(string selectedSiteIDs)
        {
            string hcoIDs = string.Empty;
            using (var dbmDbEntityContainer = new DBMEdition01_Entities())
            {
                try
                {
                    hcoIDs = dbmDbEntityContainer.GetHcoIDs(selectedSiteIDs).FirstOrDefault();
                }
                catch (Exception ex)
                {
                    throw ex;
                }

            }

            return hcoIDs;
        }
        
        public static List<RFIProgramFinding> GetRFIFindingByProgram(SearchCorporateER search)
        {
            var result = new List<RFIProgramFinding>();

            try
            {
                //Added by Subramaniam R on 26th sep 2016 for calling from DBMEdition entity.
                using (var DBMEdition01_Entities = new DBMEdition01_Entities())
                {
                    result = DBMEdition01_Entities.GetRFIFindingbyProgram(search.SelectedSiteIDs, search.ProgramIDs, search.SelectedStandardIDs, search.SelectedChapterIDs, search.StartDate, search.EndDate, search.IncludeFsa, search.IncludeRFI, search.IncludePre, search.IncludeFin).ToList();
                }
            }
            catch (Exception ex)
            {
                throw ex;
            }

            return result;
        }

        public static List<RFIChapterFinding> GetRFIFindingByChapter(SearchCorporateER search)
        {
            var result = new List<RFIChapterFinding>();

            try
            {
                //Added by Subramaniam R on 28th sep 2016 for calling from DBMEdition entity.
                using (var DBMEdition01_Entities = new DBMEdition01_Entities())
                {
                    DBMEdition01_Entities.Database.CommandTimeout = 6000;
                    result = DBMEdition01_Entities.GetRFIFindingbyChapter(search.SelectedSiteIDs, search.ProgramIDs, search.SelectedStandardIDs, search.SelectedChapterIDs, search.StartDate, search.EndDate, search.IncludeFsa, search.IncludeRFI, search.IncludePre, search.IncludeFin).ToList();
                }
            }
            catch (Exception ex)
            {
                throw ex;
            }

            return result;

        }

        public static List<RFIStandardFinding> GetRFIFindingByStandard(SearchCorporateER search)
        {
            var result = new List<RFIStandardFinding>();
            //Added by Subramaniam R on 28th sep 2016 for calling from DBMEdition entity.
            using (var DBMEdition01_Entities = new DBMEdition01_Entities())
            {
                try
                {
                    result = DBMEdition01_Entities.GetRFIFindingByStandard(search.SelectedSiteIDs, search.ProgramIDs, search.SelectedStandardIDs, search.SelectedChapterIDs, search.StartDate, search.EndDate, search.IncludeFsa, search.IncludeRFI, search.IncludePre, search.IncludeFin).ToList();
                }
                catch (Exception ex)
                {
                    throw ex;
                }

                return result;
            }
        }

        public static List<RFIEPFindingViewModel> GetCorpFindingByEP(SearchCorporateER search)
        {
            var result = new List<RFIEPFindingViewModel>();
            //Added by Subramaniam R on 05 Oct 2016 for calling from DBMEdition entity.
            using (var DBMEdition01_Entities = new DBMEdition01_Entities())
            {
                try
                {
                    result = DBMEdition01_Entities.GetRFIFindingByEP(search.SelectedSiteIDs, search.ProgramIDs, search.SelectedStandardIDs, search.SelectedChapterIDs, search.StartDate, search.EndDate, search.IncludeFsa, search.IncludeRFI, search.IncludePre, search.IncludeFin)
                        .ToList()
                        .ConvertAll(x => new RFIEPFindingViewModel()
                        {
                            HCO_ID = x.HCO_ID,
                            Program = x.Program,
                            State = x.State,
                            HospitalName = x.HospitalName,
                            Chapter = x.Chapter,
                            Standard = x.Standard,
                            EP = x.EP,
                            //Documentation = x.Documentation,
                            TJCScore = x.TJCScore,
                            TJCSAFERScoreLikelihood = x.TJCSAFERScoreLikelihood,
                            TJCSAFERScoreScope = x.TJCSAFERScoreScope,
                            TJCScoreDate = x.TJCScoreDate,
                            PreliminaryScore = x.PreliminaryScore,
                            PreliminarySAFERScoreLikelihood = x.PreliminarySAFERScoreLikelihood,
                            PreliminarySAFERScoreScope = x.PreliminarySAFERScoreScope,
                            PreliminaryScoreDate = x.PreliminaryScoreDate,
                            FinalScore = x.FinalScore,
                            FinalSAFERScoreLikelihood = x.FinalSAFERScoreLikelihood,
                            FinalSAFERScoreScope = x.FinalSAFERScoreScope,
                            FinalScoreDate = x.FinalScoreDate,
                            TJCFinding = x.TJCFinding,
                            PlanOfAction = x.PlanOfAction,
                            SustainmentPlan = x.SustainmentPlan
                        }).ToList();
                    return result;
                }
                catch (Exception e)
                {
                    string x = e.ToString();
                }
            }

            return result;
        }
        public static List<RFIEPFinding> GetRfiEPDetails(SearchCorporateER search)
        {
            var result = new List<RFIEPFinding>();
            using (var DBMEdition01_Entities = new DBMEdition01_Entities())
            {
                try
                {
                    result = DBMEdition01_Entities.GetRFIFindingByEP(search.SelectedSiteIDs, search.ProgramIDs, search.SelectedStandardIDs, search.SelectedChapterIDs, search.StartDate, search.EndDate, search.IncludeFsa, search.IncludeRFI, search.IncludePre, search.IncludeFin).ToList();
                    return result;
                }
                catch (Exception e)
                {
                    string x = e.ToString();
                }
            }

            return result;
        }

    }
}