using System;
using System.Linq;
using System.Web.Mvc;
using JCR.Reports.Models;
using JCR.Reports.Services;
using JCR.Reports.Common;
using JCR.Reports.ViewModels;
namespace JCR.Reports.Controllers
{
    public class SearchController : Controller
    {
        //
        // GET: /ReportReDirect/
        [SessionExpireFilter]
        public ActionResult Index()
        {
            return View();
        }

        #region ActionTypes

        public ActionResult GetPrograms(int selectedsiteid, string selectedsitename, bool allPrograms = true, bool redirectToHome = false)
        {
            // M.Orlando: When user is on Tracers Report page (http://localhost:49179/Tracer/Home/Index), 
            // this is where code POSTS back to the server when the user selects a different site.

            var menuService = new JCR.Reports.Services.MenuService();
            menuService.SaveArg(AppSession.UserID.GetValueOrDefault(), "SiteID", selectedsiteid.ToString());
            //menuService.SaveArg(AppSession.UserID.GetValueOrDefault(), "SiteName", selectedsitename.ToString());
            //menuService.RefreshUserMenuState(AppSession.UserID.GetValueOrDefault());

            if (redirectToHome)
            {
                return new EmptyResult();
            }


            CheckSession(selectedsiteid, selectedsitename);
            SearchInputService reportService = new SearchInputService();
            var programsList = reportService.GetPrograms();
            if (!allPrograms) {
                programsList = programsList.Where(item => item.ProgramID == 2 || item.ProgramID == 69).ToList();
            }

            //Set the default program when the site is changed
            reportService.SetProgramPreference(programsList);


            return PartialView("Search/_Programs", programsList);
        }

        public ActionResult UpdateProgramsInSession(int selectedProgramId, string selectedProgramName, bool redirectToHome = false, int advCertListTypeID = 0)
        {
       
            var menuService = new JCR.Reports.Services.MenuService();
            
            if (advCertListTypeID == 0 ||selectedProgramId==1345 || selectedProgramId == 1346)
            {
                menuService.SaveArg(AppSession.UserID.GetValueOrDefault(), "ProgramID", selectedProgramId.ToString());
            }
            else if (advCertListTypeID > 0)
            {
                selectedProgramId = Convert.ToInt32(selectedProgramId.ToString() + advCertListTypeID.ToString());
                menuService.SaveArg(AppSession.UserID.GetValueOrDefault(), "CertificationItemID",  selectedProgramId.ToString());
            }



            menuService.SaveArg(AppSession.UserID.GetValueOrDefault(), "ProgramName", selectedProgramName.ToString());
            //menuService.RefreshUserMenuState(AppSession.UserID.GetValueOrDefault());

            if (redirectToHome)
            {
                return new EmptyResult();
            }

            // M.Orlando: When user is on Tracers Report page (http://localhost:49179/Tracer/Home/Index), 
            // this is where code POSTS back to the server when the user selects a different program.

            CheckSession(AppSession.SelectedSiteId, AppSession.SelectedSiteName, selectedProgramId, advCertListTypeID,selectedProgramName);
            AppSession.CycleID = new CommonService().GetLatestCycleByProgram(AppSession.SelectedProgramId).CycleID;


            return new EmptyResult();
        }

        /// <summary>
        /// Get tracers categories based on selected site id
        /// </summary>
        /// <returns>PartialView</returns>
        public ActionResult GetTracersCategories(int selectedsiteid, string selectedsitename, int tracerTypeID = 1)
        {
            CheckSession(selectedsiteid, selectedsitename);
            SearchInputService reportservice = new SearchInputService();

            return PartialView("Search/_TracersCategory", reportservice.GetTracersCategories(tracerTypeID));
        }

     


        /// <summary>
        /// Get tracers chapters based on selected program
        /// </summary>
        /// <returns>PartialView</returns>
        public ActionResult GetTracersChapters(int selectedsiteid, string selectedsitename)
        {
            CheckSession(selectedsiteid, selectedsitename);
            SearchInputService reportservice = new SearchInputService();

            return PartialView("Search/_ChaptersList", reportservice.GetTracersChapters());
        }

        /// <summary>
        /// Get tracers standards based on selected chapter
        /// </summary>
        /// <returns>PartialView</returns>
        public ActionResult GetTracersStandards(int selectedsiteid, string selectedsitename, string chapterid)
        {
            CheckSession(selectedsiteid, selectedsitename);
            SearchInputService reportservice = new SearchInputService();

            return PartialView("Search/_StandardsList", reportservice.GetTracersStandards(chapterid));
        }

        public ActionResult GetTracersCMS(int selectedsiteid, string selectedsitename, int? chapterid)
        {
            CheckSession(selectedsiteid, selectedsitename);
            SearchInputService reportservice = new SearchInputService();
            if (chapterid == -1)
                chapterid = null;
            return PartialView("Search/_CMSTagsList", reportservice.GetTracersCMS(chapterid));
        }

        /// <summary>
        /// Get tracers EP based on selected standard
        /// </summary>
        /// <returns>PartialView</returns>
        public ActionResult GetTracersEPs(int selectedsiteid, string selectedsitename, string chapterid, string standardtextid)
        {
            CheckSession(selectedsiteid, selectedsitename);
            SearchInputService reportservice = new SearchInputService();

            return PartialView("Search/_EPsList", reportservice.GetTracersEPs(chapterid, standardtextid));
        }

        /// <summary>
        /// Get tracers list based on selected site id or tracer category change
        /// </summary>
        /// <returns>PartialView</returns>
        public ActionResult GetTracersList(int selectedsiteid, string selectedsitename, string tracerCategoryIDs, int tracerTypeID = 1)
        {
            CheckSession(selectedsiteid, selectedsitename);
            SearchInputService reportservice = new SearchInputService();

            return PartialView("Search/_TracersList", reportservice.GetTracersList(tracerCategoryIDs, "1,2,3", "7,8", tracerTypeID));
        }

        /// <summary>
        /// Get tracers list based on selected site id or tracer category change
        /// </summary>
        /// <returns>PartialView</returns>
        public ActionResult GetTracerSectionsList(int selectedsiteid, string selectedsitename, string tracerCustomIDs, int tracerTypeID = 1)
        {
            CheckSession(selectedsiteid, selectedsitename);
            SearchInputService reportservice = new SearchInputService();

            return PartialView("Search/_TracerSectionsList", reportservice.GetTracerSectionsList(tracerCustomIDs, "1,2,3", "7,8", tracerTypeID));
        }

        /// <summary>
        /// Get tracers list based on selected site id or tracer category change
        /// </summary>
        /// <returns>PartialView</returns>
        public ActionResult GetTracersListForComplianceSumary(int selectedsiteid, string selectedsitename, string tracerCategoryIDs)
        {
            CheckSession(selectedsiteid, selectedsitename);
            SearchInputService reportservice = new SearchInputService();
            SearchList oSearchList = reportservice.GetTracersList(tracerCategoryIDs);

            var qryTracers = oSearchList.TracersLists.Where(item => item.TracerCustomID != -1);
            oSearchList.TracersLists = qryTracers;

            //if (qryTracers.Count() > 5)
            //    oSearchList.TracersLists = qryTracers;

            return PartialView("Search/_TracersListForComplianceSummary", oSearchList);

        }

        /// <summary>
        /// Get Orgnization Type List level3 based on selected site id 
        /// </summary>
        /// <returns>PartialView</returns>
        public ActionResult GetOrganizationTypelevel3(Search search, int selectedSiteIDs = -1, int selectedProgramIDs = -1)
        {
            SearchInputService reportservice = new SearchInputService();
            SearchList tracerslist = new SearchList();
            tracerslist = reportservice.DistributeOrgTypeListLevel3(tracerslist, search, selectedSiteIDs, selectedProgramIDs);
            return PartialView("Search/_CampusList", tracerslist);

        }
        /// <summary>
        /// Get Orgnization Type List level2 based on selected site id 
        /// </summary>
        /// <returns>PartialView</returns>
        public ActionResult GetOrganizationTypelevel2(Search search, int selectedSiteIDs = -1, int selectedProgramIDs = -1)
        {
            SearchInputService reportservice = new SearchInputService();
            SearchList tracerslist = new SearchList();
            tracerslist = reportservice.DistributeOrgTypeListLevel2(tracerslist, search, selectedSiteIDs, selectedProgramIDs);
            return PartialView("Search/_BuildingList", tracerslist);

        }
        /// <summary>
        /// Get Orgnization Type List level1 based on selected site id 
        /// </summary>
        /// <returns>PartialView</returns>
        public ActionResult GetOrganizationTypelevel1(Search search, int selectedSiteIDs = -1, int selectedProgramIDs = -1)
        {
            SearchInputService reportservice = new SearchInputService();
            SearchList tracerslist = new SearchList();
            tracerslist = reportservice.DistributeOrgTypeListLevel1(tracerslist, search, selectedSiteIDs, selectedProgramIDs);
            return PartialView("Search/_DepartmentList", tracerslist);

        }
        public ActionResult GetInactivePartial()
        {
            SearchList Inactivelist = new SearchList();

            if (AppSession.OrgRanking2Name != "")
            {
                Inactivelist.OrgRanking2Name = AppSession.OrgRanking2Name;
                Inactivelist.hasRanking2 = true;
            }
            else
            {
                Inactivelist.OrgRanking2Name = "";
                Inactivelist.hasRanking2 = false;
            }

            if (AppSession.OrgRanking3Name != "")
            {
                Inactivelist.OrgRanking3Name = AppSession.OrgRanking3Name;
                Inactivelist.hasRanking3 = true;
            }
            else
            {
                Inactivelist.OrgRanking3Name = "";
                Inactivelist.hasRanking3 = false;
            }

            return PartialView("Search/_InactiveOrgItemsCheckBox", Inactivelist);
        }

        public ActionResult GetTracersOrgEnteredBy(int selectedsiteid, string selectedsitename, Search search)
        {
            CheckSession(selectedsiteid, selectedsitename);
            SearchInputService reportservice = new SearchInputService();
            SearchList searchlist = new SearchList();

            searchlist = reportservice.DistributeTracerOrgEnteredBy(searchlist, search);
            return PartialView("Search/_TracerObservationEnteredBy", searchlist);
        }

        public ActionResult GetTaskAssignedTo(int selectedsiteid, string selectedsitename)
        {
            CheckSession(selectedsiteid, selectedsitename);

            SearchInputService reportservice = new SearchInputService();
            SearchList searchlist = new SearchList();

          //  searchlist = reportservice.GetTaskAssignedTo(searchlist);
            return PartialView("Search/_UserAssignedTo", reportservice.GetTaskAssignedTo(searchlist));
        }
        public ActionResult GetCreatedByUsers(int selectedsiteid, string selectedsitename)
        {
            CheckSession(selectedsiteid, selectedsitename);

            SearchViewModel searchlist = new SearchViewModel();


            CommonService cs = new CommonService();

            searchlist.CreatedByUsers = cs.GetCreatedByUsers((int)WebConstants.ProductID.Tracer);
            return PartialView("Search/_SavedReportsCreatedBy", searchlist);
        }

        public ActionResult GetMyReportsBySite(int selectedsiteid, string selectedsitename)
        {
            CheckSession(selectedsiteid, selectedsitename);

            SearchViewModel searchlist = new SearchViewModel();
            
            CommonService cs = new CommonService();
            searchlist.ERMyReportList = cs.SelectMyReporList((int)WebConstants.ProductID.Tracer);
         //   searchlist.CreatedByUsers = cs.GetCreatedByUsers((int)WebConstants.ProductID.Tracer);
            return PartialView("Search/_SearchByMyReports", searchlist);
        }

        #endregion

        [SessionExpireFilter]
        private void CheckSession(int selectedsiteid, string selectedsitename, int selectedProgramId = 0,int selectedAdvCertItemID = 0, string selectedProgramName = "") {
            if (selectedsiteid > 0) {
                AppSession.SelectedSiteId = selectedsiteid;
                AppSession.SelectedSiteName = selectedsitename;
            }

            if (selectedProgramId > 0) {
                AppSession.SelectedProgramId = selectedProgramId;
                AppSession.SelectedProgramName = selectedProgramName;
                AppSession.SelectedCertificationItemID = selectedAdvCertItemID;

            }

            if (selectedsiteid > 0 && selectedProgramId > 0) {
                CMSService.UpdateCMSSessionValue();
            }
        }
    }
}