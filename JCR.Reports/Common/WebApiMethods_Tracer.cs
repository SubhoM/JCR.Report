using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using JCR.Reports.Models;
using JCR.Reports.Services;


namespace JCR.Reports.Common
{
    public class WebApiMethods_Tracer
    {
        public static List<TracersCategory> TracerCategory { get; set; }
        public static List<Program> Program { get; set; }

        public static List<ReportDetail> ReportList { get; set; }
      //  public static List<ReportAttributes> ReportListAttributes { get; set; }

        public async static Task<List<TracersCategory>> GetTracersCategories()
        {
              try
            {
               
                List<TracersCategory> rtn = await EprodWebApi.GetTracerCategory(Convert.ToInt32(AppSession.SelectedSiteId), Convert.ToInt32(AppSession.SelectedProgramId));

             
               TracerCategory=rtn;
               return rtn;
            }
            catch(Exception ex)
            {
                if (ex.Message.ToString() != "No Data" && ex.Message.ToString() != "Limit")
                {
                    ExceptionLog exceptionLog = new ExceptionLog
                    {
                        ExceptionText = "Reports: " + ex.Message,
                        PageName = "WebApiMethods.cs",
                        MethodName = "GetTracersCategories",
                        UserID = Convert.ToInt32(AppSession.UserID),
                        SiteId = Convert.ToInt32(AppSession.SelectedSiteId),
                        TransSQL = "",
                        HttpReferrer = null
                    };
                    ExceptionService _exceptionService = new ExceptionService();
                    _exceptionService.LogException(exceptionLog);
                }
            }
            return null;

         }
        public async static Task<List<Program>> SelectTracerProgramsBySiteAndUser(int userID, int siteID, int cycleID)
        {
            try
            {
              
                List<Program> rtn = await EprodWebApi.SelectTracerProgramsBySiteAndUser(userID, siteID, cycleID);


                Program = rtn;
                
                return rtn;
            }
            catch (Exception ex)
            {
                if (ex.Message.ToString() != "No Data" && ex.Message.ToString() != "Limit")
                {
                    ExceptionLog exceptionLog = new ExceptionLog
                    {
                        ExceptionText = "Reports: " + ex.Message,
                        PageName = "WebApiMethods.cs",
                        MethodName = "GetTracersCategories",
                        UserID = Convert.ToInt32(AppSession.UserID),
                        SiteId = Convert.ToInt32(AppSession.SelectedSiteId),
                        TransSQL = "",
                        HttpReferrer = null
                    };
                    ExceptionService _exceptionService = new ExceptionService();
                    _exceptionService.LogException(exceptionLog);
                }
            }
            return null;

        }

        //public async static Task<List<ReportDetail>> SelectReporListByProductID(int productID)
        //{
        //    try
        //    {

        //        List<ReportDetail> rtn = await EprodWebApi.SelectReporListByProductID(productID);


        //        ReportList = rtn;
        //        return rtn;
        //    }
        //    catch (Exception ex)
        //    {
        //        if (ex.Message.ToString() != "No Data" && ex.Message.ToString() != "Limit")
        //        {
        //            ExceptionLog exceptionLog = new ExceptionLog
        //            {
        //                ExceptionText = "Reports: " + ex.Message,
        //                PageName = "WebApiMethods.cs",
        //                MethodName = "GetTracersCategories",
        //                UserID = Convert.ToInt32(AppSession.UserID),
        //                SiteId = Convert.ToInt32(AppSession.SelectedSiteId),
        //                TransSQL = "",
        //                HttpReferrer = null
        //            };
        //            ExceptionService _exceptionService = new ExceptionService();
        //            _exceptionService.LogException(exceptionLog);
        //        }
        //    }
        //    return null;

        //}
        //public async static Task<List<ReportAttributes>> SelectReporAttributesByProductIDReportID(int productID, int? reportID)
        //{
        //    try
        //    {
        //        List<ReportAttributes> rtn = await EprodWebApi.SelectReporAttributesByProductIDReportID(productID, reportID);
                
        //        ReportListAttributes = rtn;
                
        //        return rtn;
        //    }
        //    catch (Exception ex)
        //    {
        //        if (ex.Message.ToString() != "No Data" && ex.Message.ToString() != "Limit")
        //        {
        //            ExceptionLog exceptionLog = new ExceptionLog
        //            {
        //                ExceptionText = "Reports: " + ex.Message,
        //                PageName = "WebApiMethods.cs",
        //                MethodName = "GetTracersCategories",
        //                UserID = Convert.ToInt32(AppSession.UserID),
        //                SiteId = Convert.ToInt32(AppSession.SelectedSiteId),
        //                TransSQL = "",
        //                HttpReferrer = null
        //            };
        //            ExceptionService _exceptionService = new ExceptionService();
        //            _exceptionService.LogException(exceptionLog);
        //        }
        //    }
        //    return null;

        //}
    }
}