using System;
using System.Linq;
using JCR.Reports.Models;
using JCR.Reports.Common;
namespace JCR.Reports.Services
{
    public class SearchFormat
    {
        [SessionExpireFilter]
        public Search CheckInputs(Search search)
        {
            search.SiteID = AppSession.SelectedSiteId;
            search.SiteName = AppSession.SelectedSiteName;
            search.TracerCategoryIDs = (search.TracerCategoryIDs != null && search.TracerCategoryIDs != "-1") ? search.TracerCategoryIDs : "";
            search.CMSTags = (search.CMSTags != null && search.CMSTags != "-1") ? search.CMSTags : "";
            search.TracerQuestionIDs = (search.TracerQuestionIDs != null && search.TracerQuestionIDs != "-1") ? search.TracerQuestionIDs : "";
            search.TracerListIDs = (search.TracerListIDs != null && search.TracerListIDs != "-1") ? search.TracerListIDs : "";
            search.OrgTypeLevel1IDs = (search.OrgTypeLevel1IDs != null && search.OrgTypeLevel1IDs != "-1") ? search.OrgTypeLevel1IDs : "";
            search.OrgTypeLevel2IDs = (search.OrgTypeLevel2IDs != null && search.OrgTypeLevel2IDs != "-1") ? search.OrgTypeLevel2IDs : "";
            search.OrgTypeLevel3IDs = (search.OrgTypeLevel3IDs != null && search.OrgTypeLevel3IDs != "-1") ? search.OrgTypeLevel3IDs : "";
            search.TracerCategoryNames = (search.TracerCategoryNames != null && search.TracerCategoryNames != "") ? search.TracerCategoryNames : "All";
            search.TracerListNames = (search.TracerListNames != null && search.TracerListNames != "") ? search.TracerListNames : "All";
            search.OrgTypeLevel1Names = (search.OrgTypeLevel1Names != null && search.OrgTypeLevel1Names != "") ? search.OrgTypeLevel1Names : "All";
            search.OrgTypeLevel2Names = (search.OrgTypeLevel2Names != null && search.OrgTypeLevel2Names != "") ? search.OrgTypeLevel2Names : "All";
            search.OrgTypeLevel3Names = (search.OrgTypeLevel3Names != null && search.OrgTypeLevel3Names != "") ? search.OrgTypeLevel3Names : "All";
            search.EndDate = (search.EndDate != null && search.EndDate.ToString() != "") ? search.EndDate.Value.Date.AddHours(23).AddMinutes(29).AddSeconds(59) : search.EndDate;
            return search;

        }



        public Search CheckInputs_TracerObsEnteredBy(Search search)
        {
            search.EnteredByIDs = (search.EnteredByIDs != null && search.EnteredByIDs != "-1") ? search.EnteredByIDs : "";
            search.EnteredByNames = (search.EnteredByNames != null && search.EnteredByNames != "") ? search.EnteredByNames : "All";
            return search;
        }

        public Search CheckInputs_AssignedTo(Search search)
        {
            search.AssignedToIDs = (search.AssignedToIDs != null && search.AssignedToIDs != "-1") ? search.AssignedToIDs : "";
            search.AssignedToNames = (search.AssignedToNames != null && search.AssignedToNames != "") ? search.AssignedToNames : "All";
            return search;
        }


        public Search CheckInputs_TracerStatuses(Search search)
        {
            search.TracerStatusIDs = (search.TracerStatusIDs != null && search.TracerStatusIDs != "-1") ? search.TracerStatusIDs : "";
            search.TracerStatusNames = (search.TracerStatusNames != null && search.TracerStatusNames != "") ? search.TracerStatusNames : "All";
            return search;
        }
    }
}