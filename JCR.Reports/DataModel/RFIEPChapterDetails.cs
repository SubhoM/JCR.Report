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
    
    public partial class RFIEPChapterDetails
    {
        public int SiteID { get; set; }
        public int ProgramServiceID { get; set; }
        public int ChapterID { get; set; }
        public int StandardTextID { get; set; }
        public int EPTextID { get; set; }
        public Nullable<int> HCO_ID { get; set; }
        public string Program { get; set; }
        public string State { get; set; }
        public string HospitalName { get; set; }
        public string Chapter { get; set; }
        public string Standard { get; set; }
        public string EP { get; set; }
        public Nullable<int> Documentation { get; set; }
        public string TJCScore { get; set; }
        public string TJCSAFERScoreLikelihood { get; set; }
        public string TJCSAFERScoreScope { get; set; }
        public Nullable<System.DateTime> TJCScoreDate { get; set; }
        public string PreliminaryScore { get; set; }
        public string PreliminarySAFERScoreLikelihood { get; set; }
        public string PreliminarySAFERScoreScope { get; set; }
        public Nullable<System.DateTime> PreliminaryScoreDate { get; set; }
        public string FinalScore { get; set; }
        public string FinalSAFERScoreLikelihood { get; set; }
        public string FinalSAFERScoreScope { get; set; }
        public Nullable<System.DateTime> FinalScoreDate { get; set; }
    }
}
