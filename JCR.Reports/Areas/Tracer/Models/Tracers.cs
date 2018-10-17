using System;
using System.Linq;


namespace JCR.Reports.Models
{
    public class Tracers
    {
        public Nullable<int> TracerCustomID { get; set; }

        public string TracerCustomName { get; set; }
        // public Nullable<int> TracerCategoryID { get; set; }
        public string TracerCategoryName { get; set; }
        public Nullable<int> TracerCategoryID { get; set; }
    }
}
