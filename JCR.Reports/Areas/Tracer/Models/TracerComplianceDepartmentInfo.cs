using System;
using System.ComponentModel.DataAnnotations;
using System.Linq;

namespace JCR.Reports.Models
{
    public class TracerComplianceDepartmentInfo
    {
        public string OrgName_Rank1_Dept { get; set; }
        public int OrgName_Rank1_DeptID { get; set; }
        public decimal TotalNumerator { get; set; }
        public decimal TotalDenominator { get; set; }
        public string Compliance { get; set; }
        public string TotalCompletedObservation { get; set; }
    }
}