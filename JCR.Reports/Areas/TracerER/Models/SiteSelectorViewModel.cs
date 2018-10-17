using System;
using System.Collections.Generic;
using System.Linq;

namespace JCR.Reports.Models
{
    public class SiteSelectorViewModel
    {
        public List<ERLevelMap> ERLevelMap { get; set; }
        public bool HasLevel1 { get; set; }
        public bool HasLevel2 { get; set; }
        public bool HasLevel3 { get; set; }
        public string SelectedSiteIds { get; set; }
        public bool IsCorporateAccess { get; set; }
    }
}