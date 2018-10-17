using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace JCR.Reports.Areas.TracerER.ViewModels
{
    public class ErTracersbyQuestionDetails
    {

        public int TracerCustomID { get; set; }

        public string TracerCustomName { get; set; }

        public int TracerResponseID { get; set; }

        public string Observation { get; set; }

        public int QuestionNo { get; set; }

        public string QuestionText { get; set; }

        public string StandardEP { get; set; }

        public string OrganizationName_Rank3 { get; set; }
        public string OrganizationName_Rank2 { get; set; }
        public string OrganizationName_Rank1_Dept { get; set; }
        public string SurveyTeam { get; set; }
        public string UniqueIdentifier { get; set; }
        public string EquipmentObserved { get; set; }
        public string ContractedService { get; set; }
        public string StaffInterviewed { get; set; }
        public string MedicalStaffInvolved { get; set; }

        public string ObservationNote { get; set; }
        public string UpdatedByUserName { get; set; }

        public string ObservationDate { get; set; }

        public string LastUpdated { get; set; }
        public decimal Numerator { get; set; }

        public decimal Denominator { get; set; }
        public decimal CompliancePercent { get; set; }
        public string TracerQuestionNote { get; set; }

        public string Location { get; set; }

    }
}