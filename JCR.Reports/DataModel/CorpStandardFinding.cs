//------------------------------------------------------------------------------
// <auto-generated>
//     This code was generated from a template.
//
//     Manual changes to this file may cause unexpected behavior in your application.
//     Manual changes to this file will be overwritten if the code is regenerated.
// </auto-generated>
//------------------------------------------------------------------------------

namespace JCR.Reports.DataModel
{
    using System;
    
    public partial class CorpStandardFinding
    {
        public Nullable<int> RowID { get; set; }
        public Nullable<int> StandardID { get; set; }
        public string Label { get; set; }
        public int FindingCount { get; set; }
        public int RFICount { get; set; }
        public Nullable<decimal> Percentage { get; set; }
        public Nullable<decimal> CumulativePercentage { get; set; }
    }
}