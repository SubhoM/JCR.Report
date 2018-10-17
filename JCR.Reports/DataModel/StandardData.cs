using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace JCR.Reports.DataModel
{
    public class StandardData
    {

        public static List<Programs> GetProgramSites(String siteList)
        {
            var result = new List<Programs>();
          
            using (var DBMEdition01_Entities = new DBMEdition01_Entities())
            {
                result = DBMEdition01_Entities.GetProgrambySites(siteList, null).ToList();
            }
                return result;
        }

        public static List<Chapter> GetChapters(String siteList, string programIDs)
        {
            var result = new List<Chapter>();
            using (var DBMEdition01_Entities = new DBMEdition01_Entities())
            {
                result = DBMEdition01_Entities.GetChapter(siteList, programIDs,null).ToList();
            }

            return result;
        }

        public static List<Standard> GetStandards(string programList, string chapterList)
        {    
            var result = new List<Standard>();
          
            using (var DBMEdition01_Entities = new DBMEdition01_Entities())
            {
                result = DBMEdition01_Entities.GetStandardsByProgramsChapters(chapterList, programList).ToList();
            }

            return result;
        }

    }
}