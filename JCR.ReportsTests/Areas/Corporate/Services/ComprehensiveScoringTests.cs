using Microsoft.VisualStudio.TestTools.UnitTesting;
using JCR.Reports.Common;
using JCR.Reports.Models;
using System.Web;
using JCR.ReportsTests.Common;
using JCR.Reports.ViewModels;
using System;

namespace JCR.Reports.Areas.Corporate.Services.Tests
{
    [TestClass()]
    public class ComprehensiveScoringTests
    {

        [TestInitialize]
        public void TestInitialize()
        {
            HttpContext.Current = MockHelpers.FakeHttpContext();

            //Undo the below section after Menu integration code completed in Main
            /*var objUser = new Authentication();
            objUser.UserLogonID = "pskukas@jcrinc.com";
            objUser.PageID = 14;  // PageID 14 is 'Compliance'          

            Security.SetUpSession(objAuthenticationUser: objUser);*/
            Security.SetUpSession();
        }

        [TestMethod()]
        public void ComprehensiveScoringRDLCTest()
        {
            ComprehensiveScoring ComprehensiveScoring = new ComprehensiveScoring();
            SearchComprehensiveScoringParams param = new SearchComprehensiveScoringParams();
            param.SiteID = 45254;
            param.ProgramID = 2;
            param.ChapterID = 55;

            param.DateStart = null;
            param.DateEnd = null;
            param.chkIncludeCMS = 0;
            param.IsCorporateAccess = false;

            var reportRootPath = System.IO.Path.GetFullPath(System.IO.Path.Combine(System.IO.Directory.GetCurrentDirectory(), @"..\..\..\"));
            var applicationPath = reportRootPath + @"\JCR.Reports\";
            var result = ComprehensiveScoring.ComprehensiveScoringRDLC(param, new Email(), "Detail", applicationPath);

            Assert.IsInstanceOfType(result, typeof(Microsoft.Reporting.WebForms.ReportViewer));
        }

        [TestMethod()]
        public void GetReportDataViewTest()
        {
            ComprehensiveScoring ComprehensiveScoring = new ComprehensiveScoring();
            SearchComprehensiveScoringParams param = new SearchComprehensiveScoringParams();
            param.SiteID = 45254;
            param.ProgramID = 2;
            param.ChapterID = 55;

            param.DateStart = null;
            param.DateEnd = null;
            param.chkIncludeCMS = 0;
            param.IsCorporateAccess = false;

            var result = ComprehensiveScoring.GetReportDataView(param);

            Assert.AreNotEqual(null, result);
        }

    }
}