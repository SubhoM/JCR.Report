using System;
using System.Linq;
using System.ComponentModel;
using JCR.Reports.Services;


namespace JCR.Reports.Common
{
    public class CustomDisplayNameAttribute : DisplayNameAttribute
    {
        public CustomDisplayNameAttribute(int value)
            : base(GetMessageFromResource(value))
        { }

        private static string GetMessageFromResource(int value)
        {
            CommonService cs = new CommonService();
            string orgtypename = "";
            try
            {
                orgtypename = cs.OrganizationTypeTitle(value);
                switch (value)
                {
                    case (int)CategoryHierarchy.Department:
                        AppSession.OrgRanking1Name = orgtypename;
                        break;
                    case (int)CategoryHierarchy.Building:
                        AppSession.OrgRanking2Name = orgtypename;
                        break;
                    case (int)CategoryHierarchy.Campus:
                        AppSession.OrgRanking3Name = orgtypename;
                        break;
                }
                
            }
            catch (Exception ex)
            {
                
                throw ex;
            }
           
            return orgtypename;
         
        }

       
    }
}