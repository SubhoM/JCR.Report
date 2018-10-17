using System.Collections.Generic;
using JCR.Reports.Common;
using JCR.Reports.DataModel;
using JCR.Reports.Models.Enums;
using JCR.Reports.Models;
using System.Linq;

namespace JCR.Reports.Services
{
    public class CMSService
    {
        public static int GetSubscriptionTypeIDForCMS(WebConstants.LinkType linkType)
        {
            int subscriptionTypeID = 0;

            switch (linkType)
            {
                case WebConstants.LinkType.AMPCorporateReports:
                case WebConstants.LinkType.AmpHome:
                case WebConstants.LinkType.AMPCorpScoring:
                case WebConstants.LinkType.AMPSiteScoring:
                    {
                        subscriptionTypeID = (int)WebConstants.SubscriptionType.CMS_AMP;
                        break;
                    }
                case WebConstants.LinkType.TracersHome:
                case WebConstants.LinkType.EnterpriseReportTracers:
                    {
                        subscriptionTypeID = (int)WebConstants.SubscriptionType.CMS_Tracers;
                        break;
                    }
            }

            return subscriptionTypeID;
        }
        public static void UpdateCMSSessionValue()
        {
            var subscriptionTypeID = GetSubscriptionTypeIDForCMS((WebConstants.LinkType)AppSession.LinkType);
            AppSession.IsCMSProgram = UserCustom.GetLicenseDetailsForCMS(AppSession.SelectedSiteId, AppSession.SelectedProgramId, subscriptionTypeID);
        }
        public static List<CMSSite> GetCMSSitesByProgramID(int ProgramID, int subscriptionTypeID)
        {
            return UserCustom.GetCMSSitesByProgramID(ProgramID, subscriptionTypeID);
        }
        public static List<CMSProgram> GetCMSProgramsBySiteID(int SiteID, int subscriptionTypeID)
        {
            return UserCustom.GetCMSProgramsBySiteID(SiteID, subscriptionTypeID);
        }
        public static List<CoP> GetCoPsByProgramID(string ProgramIDs)
        {
            var coplist = new List<CoP>();

            if (ProgramIDs != "-1")
                coplist = UserCustom.GetCoPsByProgramID(ProgramIDs);

            coplist.Insert(0, new CoP
            {
                CopID = -1,
                CopName = "All"
            });

            return coplist;
        }
        public static List<Tag> GetTagsByProgramIDAndCoPID(string ProgramIDs, string CoPIDs)
        {
            var taglist = new List<Tag>();

            if (CoPIDs != "-1")
                taglist = UserCustom.GetTagsByProgramIDAndCoPID(ProgramIDs, CoPIDs);

            taglist.Insert(0, new Tag
            {
                TagID = -1,
                TagCode = "All"
            });

            return taglist;
        }
        public static List<IdentifiedUser> GetIdentifiedUsers(string siteIDs, string programIDs, string coPIDs, string tagIDs)
        {
            var identifiedUserList = new List<IdentifiedUser>();

            identifiedUserList = UserCustom.GetIdentifiedUsers(siteIDs, programIDs, coPIDs, tagIDs);

            identifiedUserList.Insert(0, new IdentifiedUser
            {
                UserID = -1,
                FullName = "All"
            });

            return identifiedUserList;
        }

        public static List<UserSite> GetCMSSitesFiltered(List<UserSite> sites)
        {
            if ((ReportsListEnum)AppSession.ReportID == ReportsListEnum.CMSCompliance)
            {
                var subscriptionTypeID = CMSService.GetSubscriptionTypeIDForCMS((WebConstants.LinkType)AppSession.LinkType);
                var cmsSites = CMSService.GetCMSSitesByProgramID(AppSession.SelectedProgramId, subscriptionTypeID);

                sites = (from site in sites
                         join cms in cmsSites on site.SiteID equals cms.SiteID
                         select site).ToList();

            }

            return sites;
        }

    }
}