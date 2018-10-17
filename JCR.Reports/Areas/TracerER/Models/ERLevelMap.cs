using System;
using System.Linq;


namespace JCR.Reports.Models
{
    public class ERLevelMap
    {
        public int ERLevelMapID { get; set; }
        public Nullable<int> ERLevel1ID { get; set; }
        public Nullable<int> ERLevel2ID { get; set; }
        public Nullable<int> ERLevel3ID { get; set; }
        public int SiteID { get; set; }
        public Nullable<int> UpdateUserID { get; set; }
        public System.DateTime CreateDate { get; set; }
        public System.DateTime UpdateDate { get; set; }
        public virtual ERLevel1 ERLevel1 { get; set; }
        public virtual ERLevel2 ERLevel2 { get; set; }
        public virtual ERLevel3 ERLevel3 { get; set; }
      
    }

    public class ERLevel1
    {
        public int ERLevel1ID { get; set; }
        public string ERLevel1Name { get; set; }
    
    }
    public class ERLevel2
    {
        public int ERLevel2ID { get; set; }
        public string ERLevel2Name { get; set; }

    }
    public class ERLevel3
    {
        public int ERLevel3ID { get; set; }
        public string ERLevel3Name { get; set; }

    }

    public partial class ERLevelInformation
    {
        public int ERLevelInformationID { get; set; }
        public int ERLevel1ID { get; set; }
        public string ERLevel1Name { get; set; }
        public string ERLevel2Name { get; set; }
        public string ERLevel3Name { get; set; }
        public Nullable<int> UpdateUserID { get; set; }
        public System.DateTime CreateDate { get; set; }
        public System.DateTime UpdateDate { get; set; }
        public virtual ERLevel1 ERLevel1 { get; set; }
    }
}