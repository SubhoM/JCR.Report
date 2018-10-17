using System;

namespace JCR.Reports.Models
{
    public class ProgramVM
    {
        public int ProgramID { get; set; }
        public int TJCProgramID { get; set; }
        public string ProgramCode { get; set; }
        public string ProgramName { get; set; }
        public Nullable<int> ProductID { get; set; }
        public string AdvCertFlag { get; set; }
        public Nullable<int> AdvCertListTypeID { get; set; }
        public string CertProgramName { get; set; }
        public Nullable<long> SortOrder { get; set; }
    }
}