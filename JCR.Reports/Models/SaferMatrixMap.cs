using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace JCR.Reports.Models
{
    public class SaferMatrixMap
    {
        public string ImmediateThreat { get; set; }
        public string HighLimited { get; set; }
        public string HighPattern { get; set; }
        public string HighWidespread { get; set; }
        public string ModerateLimited { get; set; }
        public string ModeratePattern { get; set; }
        public string ModerateWidespread { get; set; }
        public string LowLimited { get; set; }
        public string LowPattern { get; set; }
        public string LowWidespread { get; set; }
    }


    public class MockSurveyCorporateFindingsReport
    {
        public string ChapterText { get; set; }
        public string StandardLabel { get; set; }
        public string EPLabel { get; set; }
        public int MockSurveyID { get; set; }
        public int EPTextID { get; set; }
        public string Findings { get; set; }
        public string Recommendations { get; set; }
        public string POA { get; set; }
        public string POAUser { get; set; }
        public string POADate { get; set; }
        public int CorporateFinalScoreID { get; set; }
        public int CorporateFinalScoredByUserID { get; set; }
        public string CorporateFinalScoreDate { get; set; }
        public int StandardSortOrder { get; set; }
        public string StandardText { get; set; }
        public string EPText { get; set; }
        public string POAComplianceDate { get; set; }
        public int CritFactor { get; set; }
        public int FSA { get; set; }

        public string Likelihood { get; set; }
        public string Scope { get; set; }
        public string FullEP { get; set; }
        public int LikeID { get; set; }
        public int ScopeID { get; set; }
        
    }
}