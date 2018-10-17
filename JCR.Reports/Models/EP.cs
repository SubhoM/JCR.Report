using System;
using System.Linq;


namespace JCR.Reports.Models
{
    public class EP
    {
        public Nullable<int> EPTextID { get; set; }
    
        public string StandardLabelAndEPLabel { get; set; }

        public string EPText { get; set; }
    }
}