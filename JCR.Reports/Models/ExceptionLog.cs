using System;


namespace JCR.Reports.Models
{
    public partial class ExceptionLog
    {
        public int ExceptionLogID {get; set; }
        public string ExceptionText {get; set; }
        public string PageName {get; set; }
        public string MethodName {get; set; }
        public int UserID {get; set; }
        public int SiteId {get; set; }
        public string TransSQL {get; set; }
        public string HttpReferrer  {get; set; }
        public DateTime CreateDate  {get; set; }
        public DateTime UpdateDate { get; set; }
    }
}
