using System.Web;
using System.Web.Mvc;
using JCR.Reports.Common;
namespace JCR.Reports
{
    public class FilterConfig
    {
        public static void RegisterGlobalFilters(GlobalFilterCollection filters)
        {
            filters.Add(new ReportsHandleErrorAttribute());
            filters.Add(new EnforceSSLAttribute());
        }
    }
}
