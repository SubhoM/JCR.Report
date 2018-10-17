using JCR.Reports.Common;
using JCR.Reports.Models.Enums;
using System;
using System.Linq;
using System.Web.Mvc;

namespace JCR.Reports.Controllers
{
    public class EProdApisController : Controller
    {
        // GET: EProdApis
        public EmptyResult AddSiteLoginApplicationEvent(int siteID)
        {
            try
            {
                WebApiMethods.AddSiteLoginApplicationEvent(siteID);
            }
            catch(Exception)
            {

            }

            return new EmptyResult();
        }

        public EmptyResult AddReportAccessApplicationEvent(int reportID)
        {
            try
            {
                WebApiMethods.AddReportAccessApplicationEvent(AppSession.SelectedSiteId, (ActionTaken)reportID);
            }
            catch (Exception)
            {

            }

            return new EmptyResult();
        }
    }
}