/// <reference path="EPScoring.js" />
ExcelView = true;
exportparameters = true;
var defaultValue = "-1";
var defaultText = "All";
var SelectedProgramName = '';
var SelectedProgramID = '-1';
var SelectedChapteID = 0;
var SelectedChapterName = "";
var SelectedStandardName = "";
var SelectedStandardTextID = "";
var SelectedScoredByUserName = "";
var SelectedScoredByUserID = "";
var SelectedSiteID = 0;
var ResetFilters = $("#GetResetLink").val();
var ExportReportName = "";
var GenerateForEmail = false;

var DocumentationDataSource = [
    { text: "All", value: "1" },
    { text: "Presence of", value: "2" },
    { text: "Absence of", value: "3" }
];

$(document).ready(function () {
    CreateDocumentationDropdown('divPlanOfAction', 'Select Plan of Action');
    CreateDocumentationDropdown('divOrgFindings', 'Select Org Findings');
    CreateDocumentationDropdown('divOrgNotes', 'Select Org Notes');
    CreateDocumentationDropdown('divLinkedDocs', 'Select Linked Documents');

    $("#ScoreValue").prop("checked", true)
    EnableDisableNotScoredInPeriod();

    $('#IncludeCMSCheckbox').attr("disabled", 'disabled');

    $("#IScoreCheckbox").change(function () {
        MultiScoredByCall();
        EnableDisableNotScoredInPeriod();
        EnableDisableNotScored();
    });

    $("#PScoreCheckbox").change(function () {
        MultiScoredByCall();
        EnableDisableNotScoredInPeriod();
        EnableDisableNotScored();
    });

    $("#FScoreCheckbox").change(function () {
        MultiScoredByCall();
    });

    $("input[name=ReportLevelChange]:radio").change(function () {
        if ($('#DetailReport').is(':checked') || $('#ExcelViewReport').is(':checked')) {
            $('#IncludeCMSCheckbox').removeAttr("disabled");
        }
        else {
            $('#IncludeCMSCheckbox').attr("disabled", 'disabled');
            $('#IncludeCMSCheckbox').attr('checked', false);
        }
    });

    $("#exportoexcel").css("display", "none");
    $("#exportoexcel").click(function () {
        ERExcelExportFunction();

    });

    $("input[name=DateRange]:radio").change(function () {
        OnScoringPeriodChange();
    });

    $("#ObsstartDate").on('change keyup paste', function () {
        OnScoringPeriodChange();
    });

    $("#ObsEndDate").on('change keyup paste', function () {
        OnScoringPeriodChange();
    });


    $("input[name=rdScoreValue]:radio").change(function () {
        if ($('#NotScoredInPeriod').is(':checked')) {

            $('#SatisfactoryCheckbox').attr("disabled", 'disabled');
            $('#InsufficientCheckbox').attr("disabled", 'disabled');
            $('#NACheckbox').attr("disabled", 'disabled');

            $('#SatisfactoryCheckbox').attr('checked', false);
            $('#InsufficientCheckbox').attr('checked', false);
            $('#NACheckbox').attr('checked', false);
        }
        else {
            $('#SatisfactoryCheckbox').removeAttr("disabled");
            $('#InsufficientCheckbox').removeAttr("disabled");
            $('#NACheckbox').removeAttr("disabled");

            $("#ScoreValue").prop("checked", true);

            CheckboxChecked('True', 'SatisfactoryCheckbox');
            CheckboxChecked('True', 'InsufficientCheckbox');
            CheckboxChecked('True', 'NACheckbox');
        }
    });

    // Reset these additional parameters
    $("#resetfiltersbutton").click(function () {
        SetDefaults();
    });

    if ($.isNumeric($('#lblReportScheduleID').html())) {
        GetSavedParameters($('#lblReportScheduleID').html());
    }
});

function CreateDocumentationDropdown(ctrlName, placeHolderText) {

    $("#" + ctrlName).kendoMultiSelect({
        dataTextField: "text",
        dataValueField: "value",
        dataSource: DocumentationDataSource,
        value: 1,
        placeholder: placeHolderText,
        select: function (e) {
            $("#" + ctrlName).data("kendoMultiSelect").value([]);
        }
    });

    addarrowtomultiselect(ctrlName);
}

function OnScoringPeriodChange() {

    EnableDisableNotScoredInPeriod();
    if (($("#ObsstartDate").val().length > 0) || ($("#ObsEndDate").val().length > 0)) {
        $('#lblNotScored').hide()
        $('#NotScored').hide();
        $('#NotScored').attr('checked', false);
    }
    else {
        $('#lblNotScored').show();
        $('#NotScored').show();
    }

    if (($("#ObsstartDate").val().length == 0) && ($("#ObsEndDate").val().length == 0)) {
        $("#ScoreValue").prop("checked", true);

        $('#SatisfactoryCheckbox').removeAttr("disabled");
        $('#InsufficientCheckbox').removeAttr("disabled");
        $('#NACheckbox').removeAttr("disabled");

        CheckboxChecked('True', 'SatisfactoryCheckbox');
        CheckboxChecked('True', 'InsufficientCheckbox');
        CheckboxChecked('True', 'NACheckbox');
    }
}

function additionalData(e) {

    return { search: SetSearchCriteria(false) }
}

function SetSearchCriteria(GenfromSavedFilters) {
    return SearchSetFilterData(GenfromSavedFilters, GetParameterValuesForEPScoring());
}

function ValidateScreen() {
    var isPageValid = true;

    var ProgramID = $("#MultiSiteProgram").data("kendoMultiSelect").value().toString();
    if (ProgramID == '-1' || ProgramID == '') {

        showValidationAlert("Program is required.");

        isPageValid = false;
        return isPageValid;
    }

    if ($('#IScoreCheckbox').is(':checked') == false && $('#PScoreCheckbox').is(':checked') == false && $('#FScoreCheckbox').is(':checked') == false) {

        showValidationAlert("At least one score type must be checked.");

        isPageValid = false;
        return isPageValid;
    }

    if ($('#ScoreValue').is(':checked')) {

        if (($('#SatisfactoryCheckbox').is(':checked') == false && $('#InsufficientCheckbox').is(':checked') == false && $('#NACheckbox').is(':checked') == false
            && $('#NotScored').is(':checked') == false)) {

            showValidationAlert("At least one score value must be checked.");

            isPageValid = false;
            return isPageValid;
        }

    }

    if ($('#divPlanOfAction').data("kendoMultiSelect").value().toString() == '') {
        showValidationAlert("Plan of Action is required.");
        isPageValid = false;
        return isPageValid;
    }
    if ($('#divOrgFindings').data("kendoMultiSelect").value().toString() == '') {
        showValidationAlert("Org Findings is required.");
        isPageValid = false;
        return isPageValid;
    }
    if ($('#divOrgNotes').data("kendoMultiSelect").value().toString() == '') {
        showValidationAlert("Org Notes is required.");
        isPageValid = false;
        return isPageValid;
    }
    if ($('#divLinkedDocs').data("kendoMultiSelect").value().toString() == '') {
        showValidationAlert("Linked Documents is required.");
        isPageValid = false;
        return isPageValid;
    }

    return isPageValid;
}

function showValidationAlert(message) {

    $('#showerror_msg').removeClass("alert-info").addClass("alert-danger");
    $('#showerror_msg').css("display", "block");
    $('#show_msg').html(message);

}

//Withemail parameter is optional 
function GenerateReport(GenfromSavedFilters, Withemail) {
    //$('.loading').hide();
    //SetLoadingImageVisibility(false);
    hasExcelData = true;

    var isPageValid = ValidateScreen();

    if (!isPageValid)
        return false;

    if ($('#SummaryReport').is(':checked')) {
        if (GenerateForEmail) {
            var email = $.parseJSON(sessionStorage.getItem('searchsetemailsession'));
            GenerateReport_Summary(GenfromSavedFilters, email);
            GenerateForEmail = false;
        }
        else {
            GenerateReport_Summary(GenfromSavedFilters, Withemail);
        }
    }
    if ($('#DetailReport').is(':checked')) {

        if (GenerateForEmail) {
            var email = $.parseJSON(sessionStorage.getItem('searchsetemailsession'));
            GenerateReport_Details(GenfromSavedFilters, email);
            GenerateForEmail = false;
        }
        else {
            GenerateReport_Details(GenfromSavedFilters, Withemail);
        }
    }
    if ($('#ExcelViewReport').is(':checked')) {
        $("#exportoexcel").css("display", "block");
        GenerateReport_Excel(GenfromSavedFilters, Withemail);
    }
}

var GetRDLCSummaryView = '/Corporate/EPScoring/_GetEPScoringSummaryData';

function GenerateReport_Summary(GenfromSavedFilters, Withemail) {
    $("#divExportToExcel").hide();
    $("#loadExcelGrid").hide();
    dataLimitIssue = false;
    //$(".loading").show();

    ShowLoader();

    var rdlcsearch = SetSearchCriteria(GenfromSavedFilters);
    RdlcGenerated = true;


    $.ajax({
        type: "Post",
        url: GetRDLCSummaryView,
        contentType: "application/json",
        data: JSON.stringify({ search: rdlcsearch, emailInput: Withemail }),
        success: function (response) {
            $("#divL1tag").show();
            $("#loadrdlc").html(response);
            $("#loadrdlc").show();
            //$(".loading").hide();

            HideLoader();
        }
    });
}

var GetRDLCDetailView = '/Corporate/EPScoring/_GetEPScoringDetailData';

function GenerateReport_Details(GenfromSavedFilters, Withemail) {
    $("#divExportToExcel").hide();
    $("#loadExcelGrid").hide();
    dataLimitIssue = false;
    //$(".loading").show();

    ShowLoader();

    var rdlcsearch = SetSearchCriteria(GenfromSavedFilters);
    RdlcGenerated = true;

    $.ajax({
        type: "Post",
        url: GetRDLCDetailView,
        contentType: "application/json",
        data: JSON.stringify({ search: rdlcsearch, emailInput: Withemail }),
        success: function (response) {
            $("#divL1tag").show();
            $("#loadrdlc").html(response);
            $("#loadrdlc").show();
            //$(".loading").hide();

            HideLoader();
        }
    });
}

var wnd, detailsTemplate;
function GenerateReport_Excel(GenfromSavedFilters, Withemail) {
    var epGrid = $("#loadExcelGrid");
    if (epGrid.data("kendoGrid")) {
        $("#loadExcelGrid").data("kendoGrid").destroy();
        $("#loadExcelGrid").empty();
    }

    //$(".loading").show();

    ShowLoader();

    var data = ExceldataSource(GenfromSavedFilters, Withemail);
    $("#loadExcelGrid").kendoGrid({
        dataSource: data,
        pageable: {
            refresh: true,
            pageSizes: [20, 50, 100]
        },
        clickable: false,
        selectable: false,
        reorderable: true,
        resizable: true,
        dataBound: LargeGridResize,
        height: 450,
        columnMenu: true,
        filterable: {
            extra: false,
            operators: {
                string: {
                    startswith: "Starts with",
                    endswith: "Ends with",
                    contains: "Contains",
                    doesnotcontain: "Does Not Contain",
                    eq: "Is equal to",
                    neq: "Is not equal to"
                }
            }
        },
        groupable: true,
        sortable: true,
        //dataBound: OnGridDataBound,
        excel: { allPages: true },
        excelExport: ERexcelExport,
        columns: [
                    { field: "HCOID", width: 60, title: "HCO ID", hidden: "true" },
                    { field: "SiteName", width: 200, title: "Site Name", hidden: "true" },
                    { field: "ProgramName", width: 150, title: "Program", hidden: "true" },
                    { field: "ChapterName", width: 150, title: "Chapter", hidden: "true" },
                    { field: "StandardLabel", width: 130, title: "Standard" },
                    { field: "EPLabel", width: 70, title: "EP" },
                    { field: "EPText", width: 300, title: "EP Description", encoded: false },
                    { command: { text: "View Documentation", click: showDocuments }, title: "Documentation", width: "180px" },
                    { field: "ScoreTypeName", width: 120, title: "Score Type" },
                    { field: "ScoreName", width: 100, title: "Score" },
                    { field: "Likelihood", width: 160, title: "Likelihood to Harm" },
                    { field: "Scope", width: 100, title: "Scope" },
                    { field: "ScoreDate", width: 120, title: "Date Scored" },
                    { field: "FullName", width: 120, title: "Scored By" },
                    { field: "Findings", width: 160, title: "Organizational Findings", hidden: "true", menu: false },
                    { field: "POA", width: 150, title: "Plan of Action", hidden: "true", menu: false },
                    { field: "MOS", width: 150, title: "Sustainment Plan", hidden: "true", menu: false },
                    { field: "OrgNotes", width: 150, title: "Internal Org Notes", hidden: "true", menu: false },
                    { field: "CompliantDate", width: 150, title: "POA Compliant by Date", hidden: "true", menu: false },
                    { field: "DocumentList", width: 150, title: "Linked Documents", hidden: "true", menu: false },
                    { field: "FSA", width: 75, title: "FSA" },
                    { field: "dcm_fl", width: 75, title: "DOC" },
                    { field: "esp1_fl", width: 75, title: "ESP" },
                    { field: "NewEP", width: 75, title: "New" },
                    { field: "TagCode", width: 75, title: "Tag", hidden: "true", menu: false },
                    { field: "CopText", width: 200, title: "Cop Text", hidden: "true", menu: false }
        ]
    });
}

function ExceldataSource(GenfromSavedFilters, Withemail) {
    var ExcelSearch = SetSearchCriteria(GenfromSavedFilters);
    return new kendo.data.DataSource({
        transport: {
            read: {
                url: "/Corporate/EPScoring/_GetEPScoringExcelData",
                type: "post",
                dataType: "json",
                data: { search: ExcelSearch }
            }
        },
        pageSize: 20,
        requestEnd: function (e) {
            $("#loadrdlc").hide();

            //$(".loading").hide();

            HideLoader();

            if (e.response != null) {
                if (e.response.length === 0) {
                    $("#divL1tag").hide();
                    $("#divExportToExcel").hide();
                    $("#loadExcelGrid").hide();
                    openSlide("btnSearchCriteria", "slideSearch");
                    $('#showerror_msg').removeClass("alert-info").addClass("alert-danger");
                    $('#showerror_msg').css("display", "block");
                    $('#show_msg').html("No data found matching your criteria.");
                    EnableDisableEmail(false);
                }
                else {
                    closeSlide("btnSearchCriteria", "slideSearch");
                    //unBlockElement("divL1tag");

                    EnableDisableEmail(true);
                    $("#divL1tag").show();
                    $("#divExportToExcel").show();
                    $("#loadExcelGrid").show();
                }
            }
        },

        aggregate: [{ field: "StandardLabel", aggregate: "count" },
                   { field: "EPLabel", aggregate: "count" },
                   { field: "EPText", aggregate: "count" },
                   { field: "ScoreTypeName", aggregate: "count" },
                   { field: "ScoreName", aggregate: "count" },
                   { field: "Likelihood", aggregate: "count" },
                   { field: "Scope", aggregate: "count" },
                   { field: "ScoreDate", aggregate: "count" },
                   { field: "FullName", aggregate: "count" },
                   { field: "FSA", aggregate: "count" },
                   { field: "dcm_fl", aggregate: "count" },
                   { field: "esp1_fl", aggregate: "count" },
                   { field: "NewEP", aggregate: "count" },
                   { field: "TagCode", aggregate: "count" },
                   { field: "CopText", aggregate: "count" },
                   { field: "HCOID", aggregate: "count" },
                   { field: "ProgramCode", aggregate: "count" },
                   { field: "OrgNotes", aggregate: "count" },
                   { field: "Findings", aggregate: "count" },
                   { field: "POA", aggregate: "count" },
                   { field: "DocumentList", aggregate: "count" },
                   { field: "CompliantDate", aggregate: "count" },
                   { field: "MOS", aggregate: "count" },
                   { field: "ProgramName", aggregate: "count" },
                   { field: "ChapterName", aggregate: "count" }
        ]
    });
}

//function OnGridDataBound(e) {
//    var grid = $("#loadExcelGrid");
//    var footer = grid.find(".k-grid-footer");
//    if (footer) $(footer).hide();

//    var epGrid = $(grid).data("kendoGrid");
//    if ($('#IncludeCMSCheckbox').is(':checked') == true) {
//        epGrid.showColumn("TagCode");
//        epGrid.showColumn("CopText");
//    }
//    else {
//        epGrid.hideColumn("TagCode");
//        epGrid.hideColumn("CopText");
//    }
//}
function showDocuments(e) {
    wnd = $("#divDetail").kendoWindow({
        title: "Documentation",
        modal: true,
        visible: false,
        resizable: false,
        width: 550,
        height: 600,
        position: {
            top: 10
        }
    }).data("kendoWindow");
    wnd.title("Documentation");
    detailsTemplate = kendo.template($("#DocumentTemplate").html());

    var dataItem = this.dataItem($(e.currentTarget).closest("tr"));
    dataItem.HCOID = dataItem.HCOID == null ? dataItem.HCOID : dataItem.HCOID.toString().trim();
    dataItem.StandardLabel = dataItem.StandardLabel.toString().trim();
    dataItem.EPLabel = dataItem.EPLabel.toString().trim();
    dataItem.ProgramCode = dataItem.ProgramCode.toString().trim();
    wnd.content(detailsTemplate(dataItem));
    wnd.center().open();
}

function ERSendEmailForEPScoring() {
    GenerateForEmail = true;
    if (!ExcelGenerated) {

        $.ajax({
            async: false,
            url: GenerateReport(false)
        }).done(function () {

            setTimeout(function () {

                if (hasExcelData) {
                    fromemail = true;
                    if (($('#ExcelViewReport').is(':checked') == true))
                    { ERExcelExportFunction(); }
                }
                else {
                    fromemail = false;

                    ShowEmailStatus("No data found matching your Criteria. Change Criteria and try again.", 'failure');
                }
            }, 2000);
        })
    }
    else {
        if (hasExcelData) {

            fromemail = true;
            if (($('#ExcelViewReport').is(':checked') == true))
            { ERExcelExportFunction(); }
        }
        else {
            fromemail = false;

            ShowEmailStatus("No data found matching your Criteria. Change Criteria and try again.", 'failure');
        }
    }
}

function ERExcelExportFunction() {
    ExportReportName = "EP Scoring Report";
    $("#loadExcelGrid").getKendoGrid().showColumn("Findings");
    $("#loadExcelGrid").getKendoGrid().showColumn("OrgNotes");
    $("#loadExcelGrid").getKendoGrid().showColumn("POA");
    $("#loadExcelGrid").getKendoGrid().showColumn("DocumentList");
    $("#loadExcelGrid").getKendoGrid().showColumn("CompliantDate");
    $("#loadExcelGrid").getKendoGrid().showColumn("MOS");
    $("#loadExcelGrid").getKendoGrid().showColumn("HCOID");
    $("#loadExcelGrid").getKendoGrid().showColumn("ProgramName");
    $("#loadExcelGrid").getKendoGrid().showColumn("ChapterName");
    $("#loadExcelGrid").getKendoGrid().showColumn("SiteName");

    $("#loadExcelGrid").getKendoGrid().saveAsExcel();

    $("#loadExcelGrid").getKendoGrid().hideColumn("Findings");
    $("#loadExcelGrid").getKendoGrid().hideColumn("OrgNotes");
    $("#loadExcelGrid").getKendoGrid().hideColumn("POA");
    $("#loadExcelGrid").getKendoGrid().hideColumn("DocumentList");
    $("#loadExcelGrid").getKendoGrid().hideColumn("CompliantDate");
    $("#loadExcelGrid").getKendoGrid().hideColumn("MOS");
    $("#loadExcelGrid").getKendoGrid().hideColumn("HCOID");
    $("#loadExcelGrid").getKendoGrid().hideColumn("ProgramName");
    $("#loadExcelGrid").getKendoGrid().hideColumn("ChapterName");
    $("#loadExcelGrid").getKendoGrid().hideColumn("SiteName");
}

function ERexcelExport(e) {
    e.preventDefault();
    var sheets = [
     e.workbook.sheets[0], AddExportParameters()

    ];
    sheets[0].title = "Report";
    sheets[1].title = "Report Selections";

    var rows = e.workbook.sheets[0].rows;

    for (var ri = 0; ri < rows.length; ri++) {
        var row = rows[ri];
        if (row.type != "header") {
            for (var ci = 0; ci < row.cells.length; ci++) {
                var cell = row.cells[ci];

                if (cell.value && typeof (cell.value) === "string" && cell.value.length > 25) {
                    // Use jQuery.fn.text to remove the HTML and get only the text                
                    cell.value = stripHTML(cell.value);
                }
            }
        }

    }


    var workbook = new kendo.ooxml.Workbook({
        sheets: sheets
    });

    if (fromemail) {
        var dataURL = workbook.toDataURL();
        dataURL = dataURL.split(";base64,")[1];
        var email = $.parseJSON(sessionStorage.getItem('searchsetemailsession'));
        email.Title = ExportReportName;
        $(function () {

            $.post('/Email/SendExcelEmail',
              { base64: dataURL, email: email }, function (data) {

                  if (data != "Preping Second Attachment") {
                      fromemail = false;
                      if (data != "Successfully sent report to the email account(s)") {
                          ShowEmailStatus(data, 'failure');
                      }
                      else {
                          ShowEmailStatus(data, 'success');
                      }

                  }

              });
        });

    }
    else {

        kendo.saveAs({
            dataURI: workbook.toDataURL(),
            fileName: ExportReportName + GetReportDateAdder() + ".xlsx",
            forceProxy: false,
            proxyURL: '/Export/Excel_Export_Save'
        })

        //unBlockElement("divL1tag");
    }
}

function stripHTML(html) {
    var tmp = document.createElement("DIV");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
}


function AddExportParameters() {


    var Search = GetParameterValuesForEPScoring();
    var filterBy = "";
    if (Search.FSA == 1) { filterBy = "Include FSA Eps,\n"; }
    if (Search.DocRequired == "Y") { filterBy += "Documentation Required,\n"; }
    if (Search.NewChangedEPs == 1) { filterBy += "New Eps"; }

    var ScoreTypeNameList = "";
    if (Search.ScoreTypeList.indexOf("1") > -1) { ScoreTypeNameList += "Individual, "; }
    if (Search.ScoreTypeList.indexOf("2") > -1) { ScoreTypeNameList += "Preliminary, "; }
    if (Search.ScoreTypeList.indexOf("3") > -1) { ScoreTypeNameList += "Final"; }
    ScoreTypeNameList = ScoreTypeNameList.replace(/\, $/, '');
    var ScoreValueNameList = "";
    if (Search.ScoreValueList.indexOf("2") > -1) { ScoreValueNameList += "Satisfactory, "; }
    if (Search.ScoreValueList.indexOf("0") > -1) { ScoreValueNameList += "Insufficient, "; }
    if (Search.ScoreValueList.indexOf("6") > -1) { ScoreValueNameList += "Not Applicable, "; }
    if (Search.IncludeNotScoredRecords == 1) { ScoreValueNameList += "Not Scored"; }
    ScoreValueNameList = ScoreValueNameList.replace(/\, $/, '');
    var DocumentationList = "";
    if (Search.OrgFindings == 1) { DocumentationList = "All Organizational Findings,\n"; }
    else if (Search.OrgFindings == 2) { DocumentationList = "Presence Organizational Org Findings,\n"; }
    else if (Search.OrgFindings == 3) { DocumentationList = "Absence Organizational Org Findings,\n"; }
    if (Search.PlanOfAction == 1) { DocumentationList = DocumentationList + "All Plan Of Action,\n"; }
    else if (Search.PlanOfAction == 2) { DocumentationList = DocumentationList + "Presence Of Plan Of Action,\n"; }
    else if (Search.PlanOfAction == 3) { DocumentationList = DocumentationList + "Absence Of Plan Of Action,\n"; }
    if (Search.OrgNotes == 1) { DocumentationList = DocumentationList + "All Org Notes,\n"; }
    else if (Search.OrgNotes == 2) { DocumentationList = DocumentationList + "Presence Of Org Notes,\n"; }
    else if (Search.OrgNotes == 3) { DocumentationList = DocumentationList + "Absence Of Org Notes,\n"; }
    if (Search.LinkedDocs == 1) { DocumentationList = DocumentationList + "All Linked Documents\n"; }
    else if (Search.LinkedDocs == 2) { DocumentationList = DocumentationList + "Presence Of Linked Documents\n"; }
    else if (Search.LinkedDocs == 3) { DocumentationList = DocumentationList + "Absence Of Linked Documents"; }

    var startDate = Search.DateStart;
    var endDate = Search.DateEnd;
    var reportDate = "All Dates";

    if (Search.DateStart == "") {
        startDate = Search.DateStart;
        if (Search.DateEnd != "")
            reportDate = "for " + Search.DateStart + " - " + Search.DateEnd;
        else
            reportDate = "since " + Search.DateStart;
    }

    if (Search.DateEnd == "") {
        endDate = Search.DateEnd;
        if (Search.DateStart == "")
            reportDate = "through " + Search.DateEnd;
    }

    var stringvalue = {

        columns: [
          { autoWidth: true },
          { autoWidth: true }
        ],
        rows: [

            {
                cells: [
                { value: "Parameter Name" },
                { value: "Parameter Value" }
                ]
            },
            {
                cells: [
                { value: "Site Name" },
                { value: Search.SiteName }
                ]
            },
               {
                   cells: [
                   { value: "Program" },
                   { value: Search.ProgramName }
                   ]
               },
            {
                cells: [
                { value: "Chapter" },
                { value: Search.ChapterAll == 1 ? "All" : Search.ChapterNameList }
                ]
            },
            {
                cells: [
                { value: "Standard" },
                { value: Search.StandardAll == 1 ? "All" : Search.StandardNameList }
                ]
            },
               {
                   cells: [
                   { value: "Score Value" },
                   { value: ScoreValueNameList }
                   ]
               },
            {
                cells: [
                { value: "Score Type" },
                { value: ScoreTypeNameList }
                ]
            },

            {
                cells: [
                { value: "Scoring Period" },
                { value: reportDate }
                ]
            },
            {
                cells: [
                { value: "Scored By" },
                { value: Search.ScoredByAll == 1 ? "All" : Search.ScoredByNameList }
                ]
            },
            {
                cells: [
                { value: "Include CMS Crosswalk" },
                { value: Search.chkIncludeCMS == 1 ? "Yes" : "No" }
                ]
            },

            {
                cells: [
                { value: "Filter By" },
                { value: filterBy }
                ]
            },

            {
                cells: [
                { value: "Documentation" },
                { value: DocumentationList }
                ]
            },
        ]
    }
    return stringvalue;

}

function SaveToMyReports(deleteReport) {

    var isPageValid = ValidateScreen();

    if (!isPageValid)
        return false;

    var searchCriteria = GetParameterValuesForEPScoring();

    var parameterSet = [
        { ReportTitle: $('#hdnReportTitle').val() },
        { ReportType: $("input[name=ReportLevelChange]:checked").val() },
        { SelectedSites: searchCriteria.SiteID },
        { ProgramServices: searchCriteria.ProgramID },
        { ChapterIDs: searchCriteria.ChapterList },
        { StandardIDs: searchCriteria.StandardList },
        { ScoredBy: searchCriteria.ScoredByList },
        { ScoreValueOption: $("input[name=rdScoreValue]:checked").val() },
        { PlanOfAction: searchCriteria.PlanOfAction },
        { OrgFindings: searchCriteria.OrgFindings },
        { OrgNotes: searchCriteria.OrgNotes },
        { LinkedDocuments: searchCriteria.LinkedDocs }
    ];

    //Include Score Types
    if (searchCriteria.ScoreTypeList.indexOf("1") > -1) parameterSet.push({ IncludeIndividualScoreCheckbox: true });
    if (searchCriteria.ScoreTypeList.indexOf("2") > -1) parameterSet.push({ IncludePreliminaryScoreCheckbox: true });
    if (searchCriteria.ScoreTypeList.indexOf("3") > -1) parameterSet.push({ IncludeFinalScoreCheckbox: true });

    //Include Score Values
    if (searchCriteria.NotScoredInPeriod == 0) {
        if (searchCriteria.ScoreValueList.indexOf("2") > -1) parameterSet.push({ SatisfactoryCheckbox: true });
        if (searchCriteria.ScoreValueList.indexOf("0") > -1) parameterSet.push({ InsufficientCheckbox: true });
        if (searchCriteria.ScoreValueList.indexOf("6") > -1) parameterSet.push({ NotApplicableCheckbox: true });
        if (searchCriteria.ScoreValueList.indexOf("99") > -1) parameterSet.push({ NotScoredCheckbox: true });
    }

    //Include Filter by options
    if (searchCriteria.chkIncludeCMS == 1) parameterSet.push({ chkIncludeCMS: true });
    if (searchCriteria.FSA == 1) parameterSet.push({ IncludeFSAcheckbox: true });
    if (searchCriteria.DocRequiredValue == 1) parameterSet.push({ EPDocRequiredCheckbox: true });
    if (searchCriteria.NewChangedEPs == 1) parameterSet.push({ EPNewChangedCheckbox: true });

    //DateRange - Add date parameters only there is a value
    GetObservationDate(parameterSet, searchCriteria.DateStart, searchCriteria.DateEnd);

    parameterSet.push({ ScheduledReportName: $('#txtScheduledReportName').val() });

    //Add recurrence fields to the parameter set
    GetERRecurrenceParameters(parameterSet);

    //Save the parameters to the database
    SaveSchedule(parameterSet, deleteReport);
}

function SetDefaults() {
    EnableDisableEmail(false);
    $('#loadrdlc').html('');
    $('#loadExcelGrid').html('');
    SelectedProgramName = '';
    SelectedProgramID = '-1';
    SelectedChapteID = 0;
    SelectedChapterName = "";
    SelectedStandardName = "";
    SelectedStandardTextID = "";
    SelectedScoredByUserName = "";
    SelectedScoredByUserID = "";
    SelectedSiteID = 0;
    var dateRangedeselect = $('input[name=DateRange]:checked').val();
    $('input:radio[id*=' + dateRangedeselect + ']').prop('checked', false);
    LoadDefaultProgramSelect();
    ResetStandardsMultiSelect();
    ResetScoredByMultiSelect();
    CheckboxChecked('False', 'IScoreCheckbox');
    CheckboxChecked('False', 'PScoreCheckbox');
    CheckboxChecked('True', 'FScoreCheckbox');
    CheckboxChecked('True', 'SatisfactoryCheckbox');
    CheckboxChecked('True', 'InsufficientCheckbox');
    CheckboxChecked('True', 'NACheckbox');
    CheckboxChecked('False', 'NotScored');
    CheckboxChecked('False', 'FsaEpsCheckbox');
    CheckboxChecked('False', 'DocRequiredCheckbox');
    CheckboxChecked('False', 'ChangedEpsCheckbox');
    CheckboxChecked('False', 'IncludeCMSCheckbox');
    $('#IncludeCMSCheckbox').attr("disabled", 'disabled');
    CheckboxChecked('True', 'SummaryReport');
    var dropdownlistPlanOfAction = $("#divPlanOfAction").data("kendoMultiSelect");
    dropdownlistPlanOfAction.value(1);
    var dropdownlistOrgFindings = $("#divOrgFindings").data("kendoMultiSelect");
    dropdownlistOrgFindings.value(1);
    var dropdownlistOrgNotes = $("#divOrgNotes").data("kendoMultiSelect");
    dropdownlistOrgNotes.value(1);
    var dropdownlistLinkedDocs = $("#divLinkedDocs").data("kendoMultiSelect");
    dropdownlistLinkedDocs.value(1);
   
    $('#NotScoredInPeriod').prop("checked", false);
    $('#NotScoredInPeriod').attr("disabled", "disabled");
    $('#lblNotScored').show();
    $('#NotScored').show();
    $('#lblNotScored').removeAttr("disabled");
    $('#NotScored').removeAttr("disabled");
    $('#SatisfactoryCheckbox').removeAttr("disabled");
    $('#InsufficientCheckbox').removeAttr("disabled");
    $('#NACheckbox').removeAttr("disabled");
    $("#ScoreValue").removeAttr('disabled');
    $("#ScoreValue").prop("checked", true);

}

//Sets the saved parameters for each control
function SetSavedParameters(params) {
    var selectedSites = '';
    //setting this flag, so as to not update the related dropdowns 
    //and to manually load it, so as to prevent the duplicate call
    isSavedReportLoading = true;

    $('#txtScheduledReportName').val(params.ReportNameOverride);

    var query = $(params.ReportSiteMaps).each(function () {
        selectedSites += $(this)[0].SiteID + ',';
    });
    selectedSites = selectedSites.replace(/\,$/, ''); //Remove the last character if its a comma

    ERSites.oldSites = ERSites.getSelectedSites();

    LoadReportParameters(selectedSites);

    //$("#SingleSelectForProgram").data("kendoComboBox").value(getParamValue(params.ReportParameters, "ProgramServices").split(","));
    $("#MultiSiteProgram").data("kendoMultiSelect").value(getParamValue(params.ReportParameters, "ProgramServices").split(","));

    //Load the Chapters, Standards
    MultiSiteChapterCall(selectedSites, 0, getParamValue(params.ReportParameters, "ProgramServices"));
    $("#MultiSiteChapter").data("kendoMultiSelect").value(getParamValue(params.ReportParameters, "ChapterIDs").split(","));
    UpdateStandards();
    if (getParamValue(params.ReportParameters, "StandardIDs") != null) {
        $("#AMPStandard").data("kendoMultiSelect").value(getParamValue(params.ReportParameters, "StandardIDs").split(","));
    }

    $('input[name=ReportLevelChange][value=' + (getParamValue(params.ReportParameters, "ReportType")) + ']').prop('checked', true);
    if (getParamValue(params.ReportParameters, "ReportType") != "" && getParamValue(params.ReportParameters, "ReportType") != "Summary") {
        $('#IncludeCMSCheckbox').removeAttr("disabled");
    }
    else {
        $('#IncludeCMSCheckbox').attr("disabled", 'disabled');
    }
    CheckboxChecked(getParamValue(params.ReportParameters, "chkIncludeCMS"), 'IncludeCMSCheckbox');
    CheckboxChecked(getParamValue(params.ReportParameters, "IncludeIndividualScoreCheckbox"), 'IScoreCheckbox');
    CheckboxChecked(getParamValue(params.ReportParameters, "IncludePreliminaryScoreCheckbox"), 'PScoreCheckbox');
    CheckboxChecked(getParamValue(params.ReportParameters, "IncludeFinalScoreCheckbox"), 'FScoreCheckbox');

    $('input[name=ScoreValue][value=' + (getParamValue(params.ReportParameters, "ScoreValueOption")) + ']').prop('checked', true);

    if (getParamValue(params.ReportParameters, "ScoreValueOption") == "ScoreValue") {
        CheckboxChecked(getParamValue(params.ReportParameters, "SatisfactoryCheckbox"), 'SatisfactoryCheckbox');
        CheckboxChecked(getParamValue(params.ReportParameters, "InsufficientCheckbox"), 'InsufficientCheckbox');
        CheckboxChecked(getParamValue(params.ReportParameters, "NotApplicableCheckbox"), 'NACheckbox');
        CheckboxChecked(getParamValue(params.ReportParameters, "NotScoredCheckbox"), 'NotScored');
    }

    CheckboxChecked(getParamValue(params.ReportParameters, "IncludeFSAcheckbox"), 'FsaEpsCheckbox');
    CheckboxChecked(getParamValue(params.ReportParameters, "EPDocRequiredCheckbox"), 'DocRequiredCheckbox');
    CheckboxChecked(getParamValue(params.ReportParameters, "EPNewChangedCheckbox"), 'ChangedEpsCheckbox');

    MultiScoredByCall();
    $("#MultiSiteEpScoredBy").data("kendoMultiSelect").value(getParamValue(params.ReportParameters, "ScoredBy").split(","));
    $("#divPlanOfAction").data("kendoMultiSelect").value(getParamValue(params.ReportParameters, "PlanOfAction"));
    $("#divOrgFindings").data("kendoMultiSelect").value(getParamValue(params.ReportParameters, "OrgFindings"));
    $("#divOrgNotes").data("kendoMultiSelect").value(getParamValue(params.ReportParameters, "OrgNotes"));
    $("#divLinkedDocs").data("kendoMultiSelect").value(getParamValue(params.ReportParameters, "LinkedDocuments"));
    SetERRecurrenceParameters(params);
    SetSavedObservationDate(params.ReportParameters);
    TriggerActionByReportMode(params.ReportMode);
    EnableDisableNotScoredInPeriod();
    EnableDisableNotScored();
    isSavedReportLoading = false;
}

function GetParameterValuesForEPScoring() {
    var SelectedSiteName = "";
    if ($('#hdnSitesCount').val() == 1) {
        SelectedSiteName = $('#hdnSingleSiteName').val();
    }
    else {
        SelectedSiteName = $("#SiteSelector_SelectedSiteName").val();
    }

    var ProgramIDs = [];
    var ProgramNames = [];
    $('#MultiSiteProgram :selected').each(function (i, selected) {
        ProgramIDs[i] = $(selected).val();
        ProgramNames[i] = $(selected).text();
    });
    if (ProgramIDs.length <= 0) {
        ProgramIDs.push(defaultValue);
        ProgramNames.push(defaultText);
    }
    var SelectedChapterIDs = [];
    var SelectedChapterNames = [];
    var shortChaptersShow = [];
    $('#MultiSiteChapter :selected').each(function (i, selected) {
        SelectedChapterIDs[i] = $(selected).val();
        SelectedChapterNames[i] = $(selected).text();
        shortChaptersShow[i] = $(selected).text();
    });
    if (SelectedChapterIDs.length <= 0) {
        SelectedChapterIDs.push(defaultValue);
        SelectedChapterNames.push(defaultText);
    }

    var SelectedStandardIDs = [];
    var SelectedStandardNames = [];
    $('#AMPStandard :selected').each(function (i, selected) {
        SelectedStandardIDs[i] = $(selected).val();
        SelectedStandardNames[i] = $(selected).text();
    });
    if (SelectedStandardIDs.length <= 0) {
        SelectedStandardIDs.push(defaultValue);
        SelectedStandardNames.push(defaultText);
    }

    var SelectedScoredByUserIDs = [];
    var SelectedScoredByUsersNames = [];
    $('#MultiSiteEpScoredBy :selected').each(function (i, selected) {
        SelectedScoredByUserIDs[i] = $(selected).val();
        SelectedScoredByUsersNames[i] = GetReportHeaderUserNameFormat($(selected).text().trim());
    });
    if (SelectedScoredByUserIDs.length <= 0) {
        SelectedScoredByUserIDs.push(defaultValue);
        SelectedScoredByUsersNames.push(defaultText);
    }

    var SelectedSiteID;
    if ($('#hdnReportID').val() == 27 && $('#hdnSitesCount').val() == 1) {
        SelectedSiteID = $('#hdnSingleSiteID').val();
    }
    else {
        SelectedSiteID = ERSites.getSelectedSites();
    }

    var ScoreType = '';
    var ScoreValue = '';
    var NotScoredInPeriod = $('#NotScoredInPeriod').is(':checked') == true ? 1 : 0;

    if ($('#IScoreCheckbox').is(":checked") == true) {
        ScoreType += '1,';
    }

    if ($('#PScoreCheckbox').is(":checked") == true) {
        ScoreType += '2,';
    }

    if ($('#FScoreCheckbox').is(":checked") == true) {
        ScoreType += '3,';
    }

    if (NotScoredInPeriod == 0) {

        if ($('#InsufficientCheckbox').is(':checked')) {
            ScoreValue += '0,';
        }

        if ($('#SatisfactoryCheckbox').is(':checked')) {
            ScoreValue += '2,';
        }

        if ($('#NACheckbox').is(':checked')) {
            ScoreValue += '6,';
        }

        if ($('#NotScored').is(':checked')) {
            ScoreValue += '99,';
        }

        ScoreValue = ScoreValue.replace(/\,$/, '');

    }

    var ChapterNameList = ConvertToAllOrCSV(SelectedChapterNames);
    var StandardNameList = ConvertToAllOrCSV(SelectedStandardNames);
    var ScoredByNameList = ConvertToAllOrCSV(SelectedScoredByUsersNames);

    var searchset = {

        SiteID: SelectedSiteID.toString().replace(/\,$/, ''),
        SiteName: SelectedSiteName,
        ProgramID: ProgramIDs.toString().replace(/\,$/, ''),
        ProgramName: ProgramNames.toString().replace(/,/g, ", "),
        ChapterAll: SelectedChapterIDs.toString() == -1 ? 1 : 0,
        ChapterList: SelectedChapterIDs.toString(),
        ChapterNameList: ChapterNameList,
        StandardAll: SelectedStandardIDs.toString() == -1 ? 1 : 0,
        StandardList: SelectedStandardIDs.toString(),
        StandardNameList: StandardNameList,
        ScoredByAll: SelectedScoredByUserIDs.toString() == -1 ? 1 : 0,
        ScoredByList: SelectedScoredByUserIDs.toString(),
        ScoredByNameList: ScoredByNameList,
        ScoreTypeList: ScoreType.replace(/\,$/, ''),
        ScoreValueList: ScoreValue,
        NotScoredInPeriod: NotScoredInPeriod,
        FSA: $('#FsaEpsCheckbox').is(':checked') == true ? 1 : 0,
        DocRequired: $('#DocRequiredCheckbox').is(':checked') == true ? 'Y' : 'N',
        DocRequiredValue: $('#DocRequiredCheckbox').is(':checked') == true ? 1 : 0,
        NewChangedEPs: $('#ChangedEpsCheckbox').is(':checked') == true ? 1 : 0,
        chkIncludeCMS: $('#IncludeCMSCheckbox').is(':checked') == true ? 1 : 0,
        DateStart: kendo.toString($("#ObsstartDate").data("kendoDatePicker").value(), "yyyy-MM-dd"),
        DateEnd: kendo.toString($("#ObsEndDate").data("kendoDatePicker").value(), "yyyy-MM-dd"),
        PlanOfAction: $("#divPlanOfAction").data("kendoMultiSelect").value().toString(),
        OrgFindings: $("#divOrgFindings").data("kendoMultiSelect").value().toString(),
        OrgNotes: $("#divOrgNotes").data("kendoMultiSelect").value().toString(),
        LinkedDocs: $("#divLinkedDocs").data("kendoMultiSelect").value().toString(),
        ReportTitle: $('#txtScheduledReportName').val() == '' ? $('#hdnReportTitle').val() : $('#txtScheduledReportName').val()
    }
    return searchset;
}

function OnPrintDocumentation() {

    var title = document.title;
    document.title = 'EP Scoring Report - Documentation';
    window.print();
    document.title = title;

}

//Enable or disable Not Scored In Period option based on Score value, Scored date range and Scored by selections
function EnableDisableNotScoredInPeriod() {
    var bIsIndividualChecked = $("#IScoreCheckbox").is(":checked");
    var bIsPreliminaryChecked = $("#PScoreCheckbox").is(":checked");
    var IsScoringDatesEntered = ($("#ObsstartDate").val().length > 0 || $("#ObsEndDate").val().length > 0);
    var IsScoredBySelected = ($('#MultiSiteEpScoredBy :selected').val() != null && $('#MultiSiteEpScoredBy :selected').val() != "-1");

    var bEnable = !bIsIndividualChecked && !bIsPreliminaryChecked && IsScoringDatesEntered && !IsScoredBySelected;

    if (bEnable === true) {
        $('#NotScoredInPeriod').removeAttr("disabled");
    }
    else {
        if (!IsScoringDatesEntered) {
            $('#lblNotScored').show();
            $('#NotScored').show();
        }

        $('#NotScoredInPeriod').attr("disabled", "disabled");
        $("#NotScoredInPeriod").prop("checked", false);

        $("#ScoreValue").prop("checked", true);
        $('#SatisfactoryCheckbox').removeAttr("disabled");
        $('#InsufficientCheckbox').removeAttr("disabled");
        $('#NACheckbox').removeAttr("disabled");
    }
}

//Enable or disable Not Scored options based on Score value and Scored by selections
function EnableDisableNotScored() {
    var bIsIndividualChecked = $("#IScoreCheckbox").is(":checked");
    var bIsPreliminaryChecked = $("#PScoreCheckbox").is(":checked");
    var IsScoredBySelected = ($('#MultiSiteEpScoredBy :selected').val() != null && $('#MultiSiteEpScoredBy :selected').val() != "-1");

    var bEnable = !bIsIndividualChecked && !bIsPreliminaryChecked && !IsScoredBySelected;

    if (bEnable === true) {
        $('#lblNotScored').removeAttr("disabled");
        $('#NotScored').removeAttr("disabled");
    }
    else {
        $('#lblNotScored').attr("disabled", "disabled");
        $('#NotScored').attr("disabled", "disabled");
        $("#NotScored").prop("checked", false);
    }
}

function LargeGridResize(e) {
    
    var gridID = '';
    if (e.sender && e.sender.wrapper && e.sender.wrapper.length > 0)
        gridID = e.sender.wrapper[0].id;

    if (gridID != null && gridID != '') {
        
        var grid = $("#" + gridID);
        var footer = grid.find(".k-grid-footer");
        if (footer) $(footer).hide();

        //hide the columns
        var epGrid = $(grid).data("kendoGrid");
        if ($('#IncludeCMSCheckbox').is(':checked') == true) {
            epGrid.showColumn("TagCode");
            epGrid.showColumn("CopText");
        }
        else {
            epGrid.hideColumn("TagCode");
            epGrid.hideColumn("CopText");
        }

        var header = grid.find(".k-grid-header");
        var contentArea = grid.find(".k-grid-content");  //This is the content Where Grid is located
        var count = grid.data("kendoGrid").dataSource.data().length;
        var headerGrouping = grid.find('.k-grouping-header');

        var headerGroupingHeight = 0;
        if (headerGrouping.height() != null) {
            headerGroupingHeight = headerGrouping.height() + 16;
        }

        //Apply the height for the content area
        var pagerHeight = 72;
        var headerHeight = 0 + headerGroupingHeight; //header.height();

        if (count > 5) {
            grid.height(300 + headerHeight + pagerHeight);
            contentArea.height(300);
        }
        else {
            if (count < 3) {
                if (count == 1) {
                    grid.height((count * 70) + headerHeight + pagerHeight);
                    contentArea.height((count * 70));
                }
                else {
                    grid.height((count * 60) + headerHeight + pagerHeight);
                    contentArea.height((count * 60));
                }

            }
            else {
                grid.height((count * 52) + headerHeight + pagerHeight);
                contentArea.height((count * 52));
            }
        }
        $('#CorpLayOutFooter').attr("style", "top: auto; position: relative;");
    }
}