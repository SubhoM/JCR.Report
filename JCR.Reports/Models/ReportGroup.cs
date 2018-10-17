using System;
using System.Collections.Generic;
using System.Linq;


namespace JCR.Reports.Models
{
    public partial class ReportGroup
    {
        public string GroupName { get; set; }
        public int GroupID { get; set; }
        public List<ReportDetail> rptList { get; set; }
    }
}

