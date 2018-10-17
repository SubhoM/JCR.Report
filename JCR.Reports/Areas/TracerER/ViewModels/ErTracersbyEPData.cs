using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace JCR.Reports.Areas.TracerER.ViewModels
{

    public class ErTracersbyEPData : ErTracersbyStandardData
    {
        public int EPTextID { get; set; }
        public string EPLabel { get; set; }
       
    }
}