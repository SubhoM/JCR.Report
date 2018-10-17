using System;
using System.Linq;
using System.ComponentModel.DataAnnotations;

namespace JCR.Reports.Areas.Tracer.ViewModels
{
    public abstract class TracerOrganization
    {

        public int SiteID { get; set; }
       //  [CustomDisplayName((int)CategoryHierarchy.Campus)]
        [Display(Name="Level3")]
        public string OrgName_Rank3 { get; set; }
      //   [CustomDisplayName((int)CategoryHierarchy.Building)]
        [Display(Name = "Level2")]
        public string OrgName_Rank2 { get; set; }
     //   [CustomDisplayName((int)CategoryHierarchy.Department)]
        [Display(Name = "Department")]
        public string OrgName_Rank1_Dept { get; set; }

        public int? OrgID_Rank1_Dept { get; set; }
        public int? OrgID_Rank2 { get; set; }
        public int? OrgID_Rank3 { get; set; }
       
        public bool? IsActive_Rank3 { get; set; }

        public bool? IsActive_Rank2 { get; set; }

        public bool? IsActive_Rank1 { get; set; }
        public string OrgRanking1Name { get; set; }
        public string OrgRanking2Name { get; set; }
        public string OrgRanking3Name { get; set; }


    }
}