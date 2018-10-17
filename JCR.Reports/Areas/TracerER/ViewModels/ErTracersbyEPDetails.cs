using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace JCR.Reports.Areas.TracerER.ViewModels
{
    public class ErTracersbyEPDetails
    {
        public string TracerCustomName { get; set; }
        public int TracerCustomID { get; set; }

        public string TracerResponseTitle { get; set; }

        public int TracerResponseID { get; set; }


        public int QuestionNo { get; set; }
        public string QuestionText { get; set; }

        public int StandardTextID { get; set; }

        public int EPTextID { get; set; }

        public int TracerQuestionID { get; set; }


        public int TracerQuestionAnswerID { get; set; }

        public decimal Numerator { get; set; }

        public decimal Denominator { get; set; }
        public decimal CompliancePercent { get; set; }
        public string ObservationDate { get; set; }
        public string LastUpdated { get; set; }

        public string UpdatedByUserName { get; set; }

        public string TracerQuestionNote { get; set; }

        public string ObservationNote { get; set; }

        public string OrganizationName_Rank3 { get; set; }

        public string OrganizationName_Rank2 { get; set; }

        public string OrganizationName_Rank1_Dept { get; set; }

    }
}