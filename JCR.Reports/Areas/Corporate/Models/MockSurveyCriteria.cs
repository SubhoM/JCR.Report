using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using JCR.Reports.DataModel;

namespace JCR.Reports.Models
{
    public class MockSurveyCriteria
    {
        public List<MockSurvey> MockSurveyList { get; set; }
        public List<CorpUser> TeamLeadList { get; set; }
        public List<CorpUser> TeamMemberList { get; set; }


    }
}