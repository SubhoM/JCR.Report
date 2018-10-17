using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace JCR.Reports.Models
{
    public class ReportUserScheduleSiteMap
    {
        public int ERReportUserScheduleID { get; set; }
        public int SiteID { get; set; }
        public int ERLevelMapID { get; set; }
        public System.DateTime CreateDate { get; set; }
        public System.DateTime UpdateDate { get; set; }

        public virtual ERLevelMap ERLevelMap { get; set; }
    }
}