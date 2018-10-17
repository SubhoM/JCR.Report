using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace JCR.Reports.Models
{
    public class TracerFrequency
    {
        public Nullable<int> TracerObsFrequencyTypeID { get; set; }
        public string TracerObsFrequencyTypeCode { get; set; }
        public string TracerObsFrequencyTypeName { get; set; }

        public string TracerObsFrequencyTypeDescription { get; set; }

    }
}