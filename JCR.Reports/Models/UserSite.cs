using System.Collections.Generic;

namespace JCR.Reports.Models {
    public class UserSite {
        public int SiteID             { get; set; }
        public string SiteFullName    { get; set; }
        public int RoleID             { get; set; }
        public string SiteName        { get; set; }
        public List<Program> Programs { get; set; }
        public int IsCorporateAccess { get; set; }        
        public System.Int32? IsAMPAccess { get; set; }
        public System.Int32? IsTracersAccess { get; set; }
        public System.Int32? SortOrder { get; set; }
    }

    //public partial class Site
    //{
    //    public System.Int32 SiteID { get; set; }
    //    public System.Int32? HCOID { get; set; }
    //    public System.String SiteName { get; set; }
    //    public System.Int32 RoleID { get; set; }
    //    public System.String SiteFullName { get; set; }
    //    public System.Int32? IsAMPAccess { get; set; }
    //    public System.Int32? IsTracersAccess { get; set; }
    //    public System.Int32? SortOrder { get; set; }
    //}
}