using System;
using System.Linq;


namespace JCR.Reports.Models
{
    public class UserPreference
    {
        public bool? HideReleaseNotes { get; set; }
        public int? SiteID { get; set; }
        public int? ProgramID { get; set; }
    }
}