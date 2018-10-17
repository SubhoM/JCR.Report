using System;
using System.Collections.Generic;
using System.Linq;
using JCR.Reports.Common;
using JCR.Reports.Models;
using JCR.Reports.Models.Enums;

namespace JCR.Reports.DataModel
{
    public class EPScoringReport
    {
        public static List<ScoredByUser> GetScoredByForEPs(int siteID, int selectedProgramID, string selectedChapterIDs, string selectedStandardIDs, string selectedScoreType)
        {

            var result = new List<ScoredByUser>();
            //Added by kalaivani for getting the scored by users
            using (var DBMEdition01_Entities = new DBMEdition01_Entities())
            {
                var MockSurveyStatusID = (int)MockSurveyStatus.Publish_CCA_Recommendation;
                result = DBMEdition01_Entities.GetScoredByUsers(siteID, selectedProgramID, selectedChapterIDs, selectedStandardIDs, selectedScoreType, MockSurveyStatusID).ToList();
            }

            return result;
        }        

        public static List<EpExcelDetails> GetEPExcelDetails(SearchEPScoringParams search)
        {
            var result = new List<EpExcelDetails>();
            using (var DBMEdition01_Entities = new DBMEdition01_Entities())
            {
                DBMEdition01_Entities.Database.CommandTimeout = 6000;
                try
                {
                    string ChapterList = string.Empty;
                    string StandardList = string.Empty;
                    string ScoredByList = string.Empty;

                    ChapterList = (search.ChapterAll == 1) ? null : search.ChapterList;
                    StandardList = (search.StandardAll == 1) ? null : search.StandardList;
                    ScoredByList = (search.ScoredByAll == 1) ? null : search.ScoredByList;

                    result = DBMEdition01_Entities.GetEPExcelDetails(search.SiteID,
                        search.ProgramID, ChapterList, StandardList, search.ScoreTypeList, 
                        search.ScoreValueList, ScoredByList, search.NotScoredInPeriod, search.FSA, 
                        search.DocRequiredValue, search.NewChangedEPs, search.PlanOfAction, search.OrgFindings,
                        search.OrgNotes, search.LinkedDocs, search.DateStart, search.DateEnd,
                        search.StandardEffBeginDate, search.CertificationID, search.chkIncludeCMS).ToList()
                        .ConvertAll(x => new EpExcelDetails()
                        {
                            HCOID = x.HCOID,
                            SiteName = x.SiteName,
                            StandardLabel = x.StandardLabel,
                            EPLabel = x.EPLabel,
                            EPText = x.EPText,
                            EPTextID = x.EPTextID,
                            ScoreTypeName = x.ScoreTypeName,
                            ScoreName = x.ScoreName,
                            Likelihood = x.Likelihood,
                            Scope = x.Scope,
                            ScoreDate = x.ScoreDate,
                            FullName = x.FullName,                          
                            Findings = x.Findings,
                            OrgNotes = x.OrgNotes,
                            POA = x.POA,
                            DocumentList = x.DocumentList,
                            CompliantDate = x.CompliantDate,
                            MOS = x.MOS,
                            FSA = x.FSA,
                            dcm_fl = x.dcm_fl,                            
                            esp1_fl = x.esp1_fl,
                            NewEP = x.NewEP,
                            TagCode = x.TagCode,
                            CopText = x.CopText,                                                       
                            ProgramCode = x.ProgramCode,
                            ProgramName = x.ProgramName,
                            ChapterName = x.ChapterName,
                            SiteID = x.SiteID                          
                            
                        }).ToList();
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