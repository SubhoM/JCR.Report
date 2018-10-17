
namespace JCR.Reports.Areas.Corporate.ViewModels
{
    public class EPAssignmentSummary
    {

        public int EPCount { get; set; }

        public int AssignedCount { get; set; }

        public int NotAssignedCount { get; set; }
   
        public decimal AssignedPercent { get; set; }
        public decimal NotAssignedPercent { get; set; }
      
    }
}