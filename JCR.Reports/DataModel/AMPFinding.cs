using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace JCR.Reports.DataModel
{
    public class AMPFinding
    {
        public static List<Site> GetSitesByUser(int UserID, Nullable<bool> filteredsites = false)
        {
            var result = new List<Site>();
            using (var dbmDbEntityContainer = new DBMEdition01_Entities())
            {
                result = dbmDbEntityContainer.GetSelectSitesByUser(UserID).ToList();
            }

            return result;
        }
    }
}