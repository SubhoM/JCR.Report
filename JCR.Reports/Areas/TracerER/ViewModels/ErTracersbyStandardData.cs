using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace JCR.Reports.Areas.TracerER.ViewModels
{
    public class ErTracersbyStandardData : ERTracersResponseSummary
    {
        public int StandardTextID { get; set; }
        public string StandardLabel { get; set; }
    }
}