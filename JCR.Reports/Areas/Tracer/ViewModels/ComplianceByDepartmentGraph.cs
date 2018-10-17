using System;
using System.Linq;
using System.ComponentModel.DataAnnotations;
namespace JCR.Reports.Areas.Tracer.ViewModels
{
    public class ComplianceByDepartmentGraph
    {
        public int QID { get; set; }
        public int QuesNo { get; set; }
        public string QuestionText { get; set; }
        public decimal OverallCompliance { get; set; }
    }
}