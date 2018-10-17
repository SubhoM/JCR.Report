using JCR.Reports.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace JCR.Reports.DataModel
{
    public class AssignmentService
    {

        public static List<AssignmentStatusByUser_UserData> GetAssignmentStatusByUser_UserData(SearchAssignmentStatusByUser search)
        {
            var result = new List<AssignmentStatusByUser_UserData>();

            using (var DBMEdition01_Entities = new DBMEdition01_Entities())
            {
                try
                {
                    int ProgramID = Convert.ToInt32(search.ProgramIDs);

                    result = DBMEdition01_Entities.GetAssignmentStatusByUser_UserWise(search.SelectedSiteIDs, ProgramID,
                        search.SelectedChapterIDs, search.SelectedStandardIDs, search.SelectedScoreType, search.SelectedAssignedToIDs, search.IncludeFSAEPs,
                        search.IncludeDocumentationRequired, search.IncludeNewChangedEPs, search.StartDate, search.EndDate, search.StandardEffBeginDate, search.ScoreValueList).ToList();

                    result
                        .Where(a => (decimal)(a.ScoreCompletePercentage.Value + a.ScoreNotCompletePercentage.Value + a.ScorePastDueDatePercentage.Value) > (decimal)100.00).ToList()
                        .ForEach(delegate (AssignmentStatusByUser_UserData userData)
                    {

                        decimal difference = (userData.ScoreCompletePercentage.Value + userData.ScoreNotCompletePercentage.Value + userData.ScorePastDueDatePercentage.Value) - 100;

                        if (userData.ScoreCompletePercentage.Value > difference * 2)
                            userData.ScoreCompletePercentage = userData.ScoreCompletePercentage.Value - difference;
                        else if (userData.ScoreNotCompletePercentage.Value > difference * 2)
                            userData.ScoreNotCompletePercentage = userData.ScoreNotCompletePercentage.Value - difference;
                        else if (userData.ScorePastDueDatePercentage.Value > difference * 2)
                            userData.ScorePastDueDatePercentage = userData.ScorePastDueDatePercentage.Value - difference;

                    });


                }
                catch (Exception ex)
                {
                    throw ex;
                }

                return result;
            }
        }
        public static List<AssignmentStatusByUser_ChapterData> GetAssignmentStatusByUser_ChapterData(SearchAssignmentStatusByUser search)
        {
            var result = new List<AssignmentStatusByUser_ChapterData>();

            using (var DBMEdition01_Entities = new DBMEdition01_Entities())
            {
                try
                {

                    int SiteID = Convert.ToInt32(search.SelectedSiteIDs);
                    int ProgramID = Convert.ToInt32(search.ProgramIDs);
                    int SelectedAssignedToID = Convert.ToInt32(search.SelectedAssignedToIDs);

                    result = DBMEdition01_Entities.GetAssignmentStatusByUser_ChapterWise(SiteID, ProgramID,
                        search.SelectedChapterIDs, search.SelectedStandardIDs, search.SelectedScoreType, SelectedAssignedToID, search.IncludeFSAEPs,
                        search.IncludeDocumentationRequired, search.IncludeNewChangedEPs, search.StartDate, search.EndDate, search.StandardEffBeginDate, search.ScoreValueList).ToList();

                    result
                        .Where(a => (decimal)(a.ScoreCompletePercentage.Value + a.ScoreNotCompletePercentage.Value + a.ScorePastDueDatePercentage.Value) > (decimal)100.00).ToList()
                        .ForEach(delegate (AssignmentStatusByUser_ChapterData userData)
                        {

                            decimal difference = (userData.ScoreCompletePercentage.Value + userData.ScoreNotCompletePercentage.Value + userData.ScorePastDueDatePercentage.Value) - 100;

                            if (userData.ScoreCompletePercentage.Value > difference * 2)
                                userData.ScoreCompletePercentage = userData.ScoreCompletePercentage.Value - difference;
                            else if (userData.ScoreNotCompletePercentage.Value > difference * 2)
                                userData.ScoreNotCompletePercentage = userData.ScoreNotCompletePercentage.Value - difference;
                            else if (userData.ScorePastDueDatePercentage.Value > difference * 2)
                                userData.ScorePastDueDatePercentage = userData.ScorePastDueDatePercentage.Value - difference;

                        });

                }
                catch (Exception ex)
                {
                    throw ex;
                }

                return result;
            }
        }
        public static List<AssignmentStatusByUser_StandardData> GetAssignmentStatusByUser_StandardData(SearchAssignmentStatusByUser search)
        {
            var result = new List<AssignmentStatusByUser_StandardData>();

            using (var DBMEdition01_Entities = new DBMEdition01_Entities())
            {
                try
                {

                    int SiteID = Convert.ToInt32(search.SelectedSiteIDs);
                    int ProgramID = Convert.ToInt32(search.ProgramIDs);
                    int ChapterID = Convert.ToInt32(search.SelectedChapterIDs);
                    int SelectedAssignedToID = Convert.ToInt32(search.SelectedAssignedToIDs);

                    result = DBMEdition01_Entities.GetAssignmentStatusByUser_StandardWise(SiteID, ProgramID,
                        ChapterID, search.SelectedStandardIDs, search.SelectedScoreType, SelectedAssignedToID, search.IncludeFSAEPs,
                        search.IncludeDocumentationRequired, search.IncludeNewChangedEPs, search.StartDate, search.EndDate, search.StandardEffBeginDate, search.ScoreValueList).ToList();

                    result
                        .Where(a => (decimal)(a.ScoreCompletePercentage.Value + a.ScoreNotCompletePercentage.Value + a.ScorePastDueDatePercentage.Value) > (decimal)100.00).ToList()
                        .ForEach(delegate (AssignmentStatusByUser_StandardData userData)
                        {

                            decimal difference = (userData.ScoreCompletePercentage.Value + userData.ScoreNotCompletePercentage.Value + userData.ScorePastDueDatePercentage.Value) - 100;

                            if (userData.ScoreCompletePercentage.Value > difference * 2)
                                userData.ScoreCompletePercentage = userData.ScoreCompletePercentage.Value - difference;
                            else if (userData.ScoreNotCompletePercentage.Value > difference * 2)
                                userData.ScoreNotCompletePercentage = userData.ScoreNotCompletePercentage.Value - difference;
                            else if (userData.ScorePastDueDatePercentage.Value > difference * 2)
                                userData.ScorePastDueDatePercentage = userData.ScorePastDueDatePercentage.Value - difference;

                        });

                }
                catch (Exception ex)
                {
                    throw ex;
                }

                return result;
            }
        }
        public static List<AssignmentStatusByUser_EPData> GetAssignmentStatusByUser_EPData(SearchAssignmentStatusByUser search)
        {
            var result = new List<AssignmentStatusByUser_EPData>();

            using (var DBMEdition01_Entities = new DBMEdition01_Entities())
            {
                try
                {
                    int ProgramID = Convert.ToInt32(search.ProgramIDs);

                    result = DBMEdition01_Entities.GetAssignmentStatusByUser_EPWise(search.SelectedSiteIDs, ProgramID,
                        search.SelectedChapterIDs, search.SelectedStandardIDs, search.SelectedScoreType, search.SelectedAssignedToIDs, search.IncludeFSAEPs,
                        search.IncludeDocumentationRequired, search.IncludeNewChangedEPs, search.StartDate, search.EndDate, search.StandardEffBeginDate, search.ScoreValueList,
                        search.LevelIdentifier).ToList();
                }
                catch (Exception ex)
                {
                    throw ex;
                }

                return result;
            }
        }
        public static List<AssignedToUser> GetAssignmentAssignedTo(SearchAssignmentStatusByUser search)
        {
            var result = new List<AssignedToUser>();

            using (var DBMEdition01_Entities = new DBMEdition01_Entities())
            {
                try
                {
                    result = DBMEdition01_Entities.GetUserAssignedToSiteIDAndAssignment(search.SelectedSiteIDs, search.ProgramIDs,
                        search.SelectedChapterIDs, search.SelectedStandardIDs, search.SelectedScoreType, search.IncludeFSAEPs,
                        search.IncludeDocumentationRequired, search.IncludeNewChangedEPs, search.StartDate, search.EndDate, search.StandardEffBeginDate).ToList();
                }
                catch (Exception ex)
                {
                    throw ex;
                }

                return result;
            }

        }
    }
}