using Microsoft.Reporting.WebForms;
using System;
using System.Web.UI.WebControls;

namespace ReportViewerForMvc
{
    /// <summary>
    /// The Web Form used for rendering a ReportViewer control.
    /// </summary>
    public partial class ReportViewerWebForm : System.Web.UI.Page
    {
        protected void Page_Load(object sender, EventArgs e)
        {
            BuildReportViewer();
        }

        private void BuildReportViewer()
        {
            if (!IsPostBack)
            {
                var myReportViewer = Session["MyReportViewer"] as ReportViewer;
                ReportViewerForMvc.ReportViewer.ID = ReportViewer1.ID;
                ReportViewer1.SetProperties(myReportViewer);

                //try
                //{
                //    if (Session["ReportPath"] != null)
                //    {
                //        ReportViewer1.ServerReport.ReportPath = Convert.ToString(Session["ReportPath"]);
                //    }
                //    if (Session["ReportParameter"] != null)
                //    {
                //        ReportViewer1.ServerReport.SetParameters((ReportParameter[])Session["ReportParameter"]);
                //    }
                //}
                //catch (Exception ex)
                //{

                //}
                //ReportViewer1.ServerReport.Refresh();
            }
        }
    }
}