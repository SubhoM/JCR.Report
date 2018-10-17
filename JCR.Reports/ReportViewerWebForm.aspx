<%@ Page Language="C#" AutoEventWireup="True" CodeBehind="ReportViewerWebForm.aspx.cs" Inherits="ReportViewerForMvc.ReportViewerWebForm" %>

<%@ Register Assembly="Microsoft.ReportViewer.WebForms, Version=11.0.0.0, Culture=neutral, PublicKeyToken=89845dcd8080cc91" Namespace="Microsoft.Reporting.WebForms" TagPrefix="rsweb" %>

<!DOCTYPE html>

<html xmlns="http://www.w3.org/1999/xhtml">
<head runat="server">
    <title></title>
</head>
<body>
<%--    <style type="text/css">
        /*Hides the loading image within the rdlc*/
        div#ReportViewer1_AsyncWait, div#ReportViewer1_AsyncWait_Wait {
            display: none !important;
        }
    </style>--%>
    <style>
        
        /* Hide refresh image button*/
        div#ReportViewer1_ctl05_ctl05_ctl00, div#ReportViewer1_ctl05_ctl05_ctl00 {display: none !important;}
          /* Hide print image button*/
           div#ReportViewer1_ctl05_ctl06_ctl00, div#ReportViewer1_ctl05_ctl06_ctl00 {display: none !important;}
    /* this will remove the spinner */
    div#ReportViewer1_AsyncWait_Wait img{ display: none; } 
    /* this allows you to modify the td that contains the spinner */
    div#ReportViewer1_AsyncWait_Wait table tbody tr td:nth-child(2) div{display: none !important; } 
</style>
    <form id="form1" runat="server">
        <div>
            <asp:ScriptManager ID="ScriptManager1" runat="server">
                <Scripts>
                    <asp:ScriptReference Assembly="ReportViewerForMvc"  Name="ReportViewerForMvc.Scripts.PostMessage.js" />
                </Scripts>
            </asp:ScriptManager>
            <rsweb:ReportViewer ID="ReportViewer1" runat="server"></rsweb:ReportViewer>
        </div>
    </form>

</body>
</html>
