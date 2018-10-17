using System;
using System.Linq;


namespace JCR.Reports.Models
{
    public class TracersEP
    {
        public Nullable<int> EPTextID { get; set; }
    
        public string StandardLabelAndEPLabel { get; set; }

        public string EPText { get; set; }
    }
}