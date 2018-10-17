using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace JCR.Reports.Areas.TracerER.ViewModels
{
    public class ErTracersbyTracerData : ERTracersResponseSummary
    {
        public int TracerCustomID { get; set; }
        public string TracerCustomName { get; set; }
    }
}