using System;
using System.Linq;
using System.Web.Mvc;
using JCR.Reports.Services;
using JCR.Reports.ViewModels;
using JCR.Reports.Common;


namespace JCR.Reports.Areas.TracerER.Controllers
{
    public class ERSearchController : Controller
    {
        //
        // GET: /ERSearch/
        public ActionResult Index()
        {
            return View();
        }

        public ActionResult GetMultiSitePrograms(string selectedSiteIDs)
        {

            ERSearchInputService reportservice = new ERSearchInputService();

            return PartialView("Search/_MultiSiteProgram", reportservice.GetMultiSitePrograms(selectedSiteIDs, (int)WebConstants.ProductID.Tracer));
        }
        public ActionResult GetMultiSiteChapters(int allPrograms, string selectedProgramIDs)
        {

            ERSearchInputService reportservice = new ERSearchInputService();

            return PartialView("Search/_MultiSiteChapter", reportservice.GetMultiSiteChapters(allPrograms, selectedProgramIDs));
        }

        public ActionResult GetMultiSiteStandards(string selectedProgramIDs, string selectedChapterIDs)
        {

            ERSearchInputService reportservice = new ERSearchInputService();

            return PartialView("Search/_MultiSiteStandardsList", reportservice.GetMultiSiteStandards(selectedProgramIDs, selectedChapterIDs));
        }
        public ActionResult GetMultiSiteEPs(string selectedProgramIDs, string selectedChapterIDs, string selectedStandards)
        {

            ERSearchInputService reportservice = new ERSearchInputService();

            return PartialView("Search/_MultiSiteEPsList", reportservice.GetMultiSiteEps(selectedProgramIDs, selectedChapterIDs, selectedStandards));
        }
        public ActionResult GetMultiSiteTracersList(string selectedSiteIDs, string selectedProgramIDs)
        {

            ERSearchInputService reportservice = new ERSearchInputService();

            return PartialView("Search/_MultiSiteTracersList", reportservice.GetMultiSiteTracersList(selectedSiteIDs, selectedProgramIDs));
        }
        public ActionResult GetUHSTracersList(string selectedSiteIDs, string selectedProgramIDs)
        {

            ERSearchInputService reportservice = new ERSearchInputService();

            return PartialView("Search/_MultiSiteTracersList", reportservice.GetUHSTracersList(selectedSiteIDs, selectedProgramIDs));
        }
        public ActionResult GetQuartersList()
        {

            ERSearchInputService reportservice = new ERSearchInputService();

            return PartialView("Search/_MultiSiteQuarterList", reportservice.GetQuartersList());
        }

        public ActionResult GetMultiSiteDepartments(string selectedSiteIDs, string selectedProgramIDs)
        {

            ERSearchInputService reportservice = new ERSearchInputService();

            return PartialView("Search/_MultiSiteDepartment", reportservice.GetMultiSiteDepartmentsList(selectedSiteIDs, selectedProgramIDs));
        }
        public ActionResult GetERCreatedByUsers()
        {
     

            SearchViewModel searchlist = new SearchViewModel();


            CommonService cs = new CommonService();

            searchlist.CreatedByUsers = cs.GetERCreatedByUsers((int)WebConstants.ProductID.TracerER);
            return PartialView("Search/_SavedReportsCreatedBy", searchlist);
        }
        public ActionResult GetERMyReports()
        {
           

            SearchViewModel searchlist = new SearchViewModel();

            CommonService cs = new CommonService();
            searchlist.ERMyReportList = cs.SelectERMyReporList((int)WebConstants.ProductID.TracerER);
            return PartialView("Search/_SearchByMyReports", searchlist);
        }

        [HttpPost]
        public JsonResult GetOrganizationTypesHeaderString(int selectedSiteID, int selectedProgramID)
        {
            ERSearchInputService reportservice = new ERSearchInputService();
            string sCategoryTitle = reportservice.OrganizationTypesHeader(selectedSiteID, selectedProgramID);
            return Json(sCategoryTitle);
        }
	}
}