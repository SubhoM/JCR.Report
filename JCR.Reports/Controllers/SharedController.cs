using JCR.Reports.Common;
using JCR.Reports.Services;
using System;
using System.Net.Http;
using System.Web.Mvc;

namespace JCR.Reports.Controllers
{
    /// <summary>
    /// SharedController
    /// </summary>
    public class SharedController : Controller
    {
        /// <summary>
        /// Error view
        /// </summary>
        /// <returns>View</returns>
        public ActionResult Error()
        {
            return View();
        }

        //Used by the Sites partial view
        //   [ChildActionOnly]
        public PartialViewResult LoadSites(bool allSites = true)
        {
            //SearchInputService oUserSites = new SearchInputService();
            //var model = oUserSites.SelectTracerSitesByUser(Convert.ToInt32(AppSession.UserID), allSites); ;
            var model = AppSession.Sites;
            return PartialView("Search/_UserSite", model);
        }

        //Used by the Programs partial view
        [ChildActionOnly]
        public PartialViewResult LoadPrograms()
        {
            SearchInputService oUserSites = new SearchInputService();
            var model = oUserSites.GetPrograms();

            if (AppSession.SelectedProgramId > 0 && model.Count > 0)
            {
                //Update SelectedCertificationItemID variable which is used for Tracers Reports to AMP navigation
                AppSession.SelectedCertificationItemID = 0;
                AppSession.IsCertificationProgram = model.Exists(prg => prg.BaseProgramID == AppSession.SelectedProgramId && prg.ProductID == 2);
                if (AppSession.IsCertificationProgram)
                {
                    var queryAdvancedCert = model.Find(prg => prg.BaseProgramID == AppSession.SelectedProgramId && prg.ProductID == 2 && prg.AdvCertListTypeID > 0);
                    if (queryAdvancedCert != null)
                        AppSession.SelectedCertificationItemID = (int)queryAdvancedCert.AdvCertListTypeID;
                }
            }
            return PartialView("Search/_Programs", model);
        }

        public EmptyResult UpdatePreferredProgram(int selectedSiteId, int selectedProgramId)
        {
            CommonService oService = new CommonService();
            oService.UpdatePreferredProgram((int)AppSession.UserID, selectedSiteId, selectedProgramId);
            return new EmptyResult();
        }

        public EmptyResult actionTracking(int reportID)
        {


            ActionTracking actionTrackingservice = new ActionTracking();

            actionTrackingservice.LogActionTaken(reportID);

            return new EmptyResult();
        }
        public JsonResult CheckUpdatesToApplicationValid()
        {
            bool isValid = false;
            AppSession.IsUpdatedApplicationValid = 1;

            using (var client = new HttpClient())
            {
                client.DefaultRequestHeaders.Add("token", AppSession.AuthToken);
                client.DefaultRequestHeaders.Add("UserId", AppSession.UserID.ToString());

                string webApiUrl = System.Configuration.ConfigurationManager.AppSettings.Get("JCRAPI") + string.Format("UserInfo/CheckUserLoginFirstAfterProductRelease?eProductId={0}&userId={1}", (int)Models.Enums.EProductType.ER, AppSession.UserID);
                var response = client.GetAsync(webApiUrl).Result;
                if (response.IsSuccessStatusCode)
                {
                    var result = response.Content.ReadAsAsync<dynamic>().Result;
                    isValid = result.IsUserFirstLogin;
                }
            }

            return Json(isValid, JsonRequestBehavior.AllowGet);
        }
    }
}