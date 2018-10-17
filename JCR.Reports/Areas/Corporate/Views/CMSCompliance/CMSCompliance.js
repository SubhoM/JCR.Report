
var defaultValue = "-1";
var defaultText = "All";
ExcelView = false;
var GenerateForEmail = false;
var ExportReportName = "";
var previousSelectedProgramID = null;

var DocumentationDataSource = [
    { text: "All", value: "1" },
    { text: "Presence of", value: "2" },
    { text: "Absence of", value: "3" }
];

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
};

function LoadReportParameters(selectedSiteIDs) {
    ERCriteriaLoaded = true;
    GetReportHCOIDs(selectedSiteIDs);
    MultiSiteProgramCall(selectedSiteIDs);
}

function GetReportHCOIDs(selectedSiteIDs) {
    $.ajax({
        async: false,
        type: "POST",
        data: { selectedSiteIDs: selectedSiteIDs },
        url: '/Corporate/CorporateReport/GetReportHCOIDs',
        success: function (response) {
            $("#SiteSelector_SelectedHCOIDs").val(response[0]["ReportHCOIDs"]);
        }
    });
}

function MultiSiteProgramCall(selectedSiteIDs) {

    $.ajax({
        async: false,
        dataType: "html",
        url: "/Corporate/CorporateReport/GetMultiSitePrograms",
        data: {
            selectedSiteIDs: selectedSiteIDs
        },
        success: function (response) {
            $("#divMultiSiteProgram").html(response);

            MultiSiteCoPCall(GetMultiSiteProgramSelectedValue());
        }
    });
}

function GetMultiSiteProgramSelectedValue() {

    if ($("#MultiSiteProgram").data("kendoMultiSelect").value().toString() == "-1") {
        var ProgramselectedOptions = $.map($('#MultiSiteProgram option'), function (e) { if ($(e).val() == -1) { return '' } else { return $(e).val(); } });
        return ProgramselectedOptions.join(',');
    }
    else {
        return $("#MultiSiteProgram").data("kendoMultiSelect").value().toString();
    }

}

function MultiSiteCoPCall(selectedProgramIDs) {

    $.ajax({
        async: false,
        dataType: "html",
        url: "/Corporate/CorporateReport/GetMultiSiteCoPs",
        data: {
            selectedProgramIDs: selectedProgramIDs
        },
        success: function (response) {
            $("#divMultiSiteCoP").html(response);
            UpdateTags();
        }
    });
}

function onMSProgramChange(e) {

    var MultiSiteProgramIDs = [];
    previousSelectedProgramID = GetMultiSiteProgramSelectedValue();
    MultiSiteCoPCall(previousSelectedProgramID);
    ResetTagsMultiSelect();

    create_error_elem();
}

function UpdateTags() {

    $.ajax({
        async: false,
        url: "/Corporate/CorporateReport/GetMultiSiteTags",
        dataType: "html",
        data: {
            selectedProgramIDs: GetMultiSiteProgramSelectedValue(),
            selectedCoPIDs: $("#MultiSiteCoP").data("kendoMultiSelect").value().toString()
        },
        success: function (response) {

            $("#divMultiSiteTag").html(response);
            if (!isSavedReportLoading)
                IdentifiedByCall();
        }
    });
}

function IdentifiedByCall() {

    var programIDs = $("#MultiSiteProgram").data("kendoMultiSelect").value().toString();
    var copIDs = $("#MultiSiteCoP").data("kendoMultiSelect").value().toString();
    var tagIDs = $("#MultiSiteTag").data("kendoMultiSelect").value().toString();

    MultiSiteIdentifiedBy(programIDs, copIDs, tagIDs);
}

function updateMultiSiteIdentifiedBy() {
    IdentifiedByCall();
}

function MultiSiteIdentifiedBy(programIDs, coPIDs, tagIDs) {
    var selectedSiteIDs = 0;

    if ($('#hdnSitesCount').val() == 1) {
        selectedSiteIDs = $('#hdnSingleSiteID').val();
    }
    else {
        selectedSiteIDs = ERSites.getSelectedSites()
    }

    $.ajax({
        async: false,
        cache: false,
        dataType: "html",
        url: '/Corporate/CorporateReport/GetIdentifiedBy',
        data: {
            selectedSiteIDs: selectedSiteIDs,
            programIDs: programIDs,
            coPIDs: coPIDs,
            tagIDs: tagIDs
        },
        success: function (response) {
            $("#divMultiSiteIdentifiedBy").html(response);

        }
    });
}

function onIdentifiedBySelect(e) {

    var dataItem = this.dataSource.view()[e.item.index()];
    var values = this.value();

    if (dataItem.FullName === "All") {
        $('#IdentifiedBy').data("kendoMultiSelect").value([]);

    } else if (jQuery.inArray("-1", values)) {
        values = $.grep(values, function (value) {
            return value !== -1;
        });

        if (values == "") { this.value(values); }

    }
}

function onIdentifiedByChange(e) {

    enableDisableNotReviewedControl();
}

function enableDisableNotReviewedControl() {
    var identifiedByIds = $("#IdentifiedBy").data("kendoMultiSelect").value().toString();

    if (identifiedByIds == "-1") {
        $('#IncludeitemsNotReviewedCheckbox').removeAttr("disabled");
    }
    else {
        $('#IncludeitemsNotReviewedCheckbox').attr("disabled", "disabled");
        $("#IncludeitemsNotReviewedCheckbox").prop("checked", false);
    }
}

$(document).ready(function () {
    $("#SPDateLabel").text("Date Range");
    CreateDocumentationDropdown('divPlanOfCorrection', 'Select Plan Of Correction');
    CreateDocumentationDropdown('divOrgCMSFindings', 'Select Org CMS Findings');
    CreateDocumentationDropdown('divCMSSurveyorFindings', 'Select CMS Surveyor Findings');
    CreateDocumentationDropdown('divLinkedDocs', 'Select Linked Documents');

    $("#exportoexcel").css("display", "none");
    $("#exportoexcel").click(function () {
        ERExcelExportFunction();
    });


    $("input[name=ReportLevelChange]:radio").change(function () {
        if ($('#DetailReport').is(':checked') || $('#ExcelViewReport').is(':checked')) {
            $('#IncludeTJCCheckbox').removeAttr("disabled");
        }
        else {
            $('#IncludeTJCCheckbox').attr("disabled", 'disabled');
            $('#IncludeTJCCheckbox').attr('checked', false);
        }
    });



    // Reset these additional parameters
    $("#resetfiltersbutton").click(function () {
        SetDefaults();
    });

    if ($.isNumeric($('#lblReportScheduleID').html())) {
        GetSavedParameters($('#lblReportScheduleID').html());
    }
    $("#hSelectSite").html("Select Site:");
});

function SetDefaults() {

    $('#loadrdlc').html('');
    $('#loadExcelGrid').html('');
    $("#divAutoCitationTextArea").hide();
    defaultValue = "-1";
    defaultText = "All";
    ExcelView = false;
    GenerateForEmail = false;
    $('input[name=ReportLevelChange][value=Summary]').prop('checked', true);

    LoadDefaultProgramSelect();
    ResetTagsMultiSelect();
    EnableDisableEmail(false);
    var programID = $("#hdnProgramID").val();
    $("#MultiSiteProgram").data("kendoMultiSelect").value(programID);
    $('#IncludeTJCCheckbox').attr("disabled", 'disabled');

    CheckboxChecked('True', 'ComplaintCheckbox');
    CheckboxChecked('True', 'StandardLevelDeficiencyCheckbox');
    CheckboxChecked('True', 'ConditionLevelDeficiencyCheckbox');
    CheckboxChecked('True', 'ImmediateJeopardyCheckbox');
    CheckboxChecked('True', 'NotApplicableCheckbox');
    CheckboxChecked('False', 'IncludeitemsNotReviewedCheckbox');
    $('#IncludeitemsNotReviewedCheckbox').removeAttr("disabled");
    IdentifiedByCall();

    var dropdownlistPlanOfCorrection = $("#divPlanOfCorrection").data("kendoMultiSelect");
    dropdownlistPlanOfCorrection.value(1);
    var dropdownlistOrgCMSFindings = $("#divOrgCMSFindings").data("kendoMultiSelect");
    dropdownlistOrgCMSFindings.value(1);
    var dropdownlistCMSSurveyorFindings = $("#divCMSSurveyorFindings").data("kendoMultiSelect");
    dropdownlistCMSSurveyorFindings.value(1);
    var dropdownlistLinkedDocs = $("#divLinkedDocs").data("kendoMultiSelect");
    dropdownlistLinkedDocs.value(1);

    var dateRangedeselect = $('input[name=DateRange]:checked').val();
    $('input:radio[id*=' + dateRangedeselect + ']').prop('checked', false);
}
var GetRDLC = $("#GetRDLC").val();

function ValidateScreen() {
    var isPageValid = true;

    var ProgramID = $("#MultiSiteProgram").data("kendoMultiSelect").value().toString();
    if (ProgramID == '-1' || ProgramID == '') {

        showValidationAlert("Program is required.");

        isPageValid = false;
        return isPageValid;
    }

    var ComplianceValue = $("[type=checkbox][name=ComplianceValue]:checked").map(function () {
        return this.value;
    }).get().join(",");

    if (ComplianceValue == '') {

        showValidationAlert("At least one compliance value must be checked.");

        isPageValid = false;
        return isPageValid;
    }

    return isPageValid;
}

function ResetCriteriaDates() {
    //do nothing
}

function SetSearchCriteria(GenfromSavedFilters) {

    //only for rdlc GenfromSavedFilters is set to true only from email button
    //layout.js file common code
    return SearchSetFilterData(GenfromSavedFilters, GetParameterValues());
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
            GenerateReport_RDLC(GenfromSavedFilters, email, 'Summary');
            GenerateForEmail = false;
        }
        else {
            GenerateReport_RDLC(GenfromSavedFilters, Withemail, 'Summary');
        }
    }
    else if ($('#DetailReport').is(':checked')) {

        if (GenerateForEmail) {
            var email = $.parseJSON(sessionStorage.getItem('searchsetemailsession'));
            GenerateReport_RDLC(GenfromSavedFilters, email, 'Detail');
            GenerateForEmail = false;
        }
        else {
            GenerateReport_RDLC(GenfromSavedFilters, Withemail, 'Detail');
        }
    }
    else if ($('#ExcelViewReport').is(':checked')) {
        $("#exportoexcel").css("display", "block");
        GenerateReport_Excel(GenfromSavedFilters, Withemail);
    }
}

function GenerateReport_RDLC(GenfromSavedFilters, Withemail, ReportType) {
    $("#divExportToExcel").hide();
    $("#loadExcelGrid").hide();
    $("#divAutoCitationTextArea").hide();
    dataLimitIssue = false;
    //$(".loading").show();

    ShowLoader();

    var rdlcsearch = SetSearchCriteria(GenfromSavedFilters);
    RdlcGenerated = true;


    $.ajax({
        type: "Post",
        url: '/Corporate/CMSCompliance/_GetCMSComplianceRDLCData',
        contentType: "application/json",
        data: JSON.stringify({ search: rdlcsearch, emailInput: Withemail, ReportType: ReportType }),
        success: function (response) {
            $("#divL1tag").show();
            $("#loadrdlc").html(response);
            $("#loadrdlc").show();
            //$(".loading").hide();

            HideLoader();
        }
    });
}

function GetParameterValues() {

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
    var SelectedCoPIDs = [];
    var SelectedCoPNames = [];

    $('#MultiSiteCoP :selected').each(function (i, selected) {
        SelectedCoPIDs[i] = $(selected).val();
        SelectedCoPNames[i] = $(selected).text();

    });
    if (SelectedCoPIDs.length <= 0) {
        SelectedCoPIDs.push(defaultValue);
        SelectedCoPNames.push(defaultText);
    }

    var SelectedTagIDs = [];
    var SelectedTagNames = [];
    $('#MultiSiteTag :selected').each(function (i, selected) {
        SelectedTagIDs[i] = $(selected).val();
        SelectedTagNames[i] = $(selected).text().trim();
    });
    if (SelectedTagIDs.length <= 0) {
        SelectedTagIDs.push(defaultValue);
        SelectedTagNames.push(defaultText);
    }
    var SelectedIdentifiedByIds = [];
    var SelectedIdentifiedByNames = [];
    $('#IdentifiedBy :selected').each(function (i, selected) {
        SelectedIdentifiedByIds[i] = $(selected).val();
        SelectedIdentifiedByNames[i] = GetReportHeaderUserNameFormat($(selected).text().trim());
    });
    if (SelectedIdentifiedByIds.length <= 0) {
        SelectedIdentifiedByIds.push(defaultValue);
        SelectedIdentifiedByNames.push(defaultText);
    }


    var SelectedSiteName = "";
    if ($('#hdnSitesCount').val() == 1) {
        SelectedSiteName = $('#hdnSingleSiteName').val();
    }
    else {
        SelectedSiteName = $("#SiteSelector_SelectedSiteName").val();
    }

    var ComplianceValue = $("[type=checkbox][name=ComplianceValue]:checked").map(function () {
        return this.value;
    }).get().join(",");

    var ComplianceValueName = $("[type=checkbox][name=ComplianceValue]:checked").map(function () {
        return this.parentNode.innerText;
    }).get().join(", ");

    var DocumentationList = "";
    var planOfCorrection = $("#divPlanOfCorrection").data("kendoMultiSelect").value().toString();
    var orgCMSFindings = $("#divOrgCMSFindings").data("kendoMultiSelect").value().toString();
    var cMSSurveyorFindings = $("#divCMSSurveyorFindings").data("kendoMultiSelect").value().toString();
    var linkedDocs = $("#divLinkedDocs").data("kendoMultiSelect").value().toString();

    if (planOfCorrection == 1) { DocumentationList += "All Plan Of Correction,\n"; }
    else if (planOfCorrection == 2) { DocumentationList += "Presence Of Plan Of Correction,\n"; }
    else if (planOfCorrection == 3) { DocumentationList += "Absence Of Plan Of Correction,\n"; }

    if (orgCMSFindings == 1) { DocumentationList += "All Organizational CMS Findings,\n"; }
    else if (orgCMSFindings == 2) { DocumentationList += "Presence Organizational CMS Findings,\n"; }
    else if (orgCMSFindings == 3) { DocumentationList += "Absence Organizational CMS Findings,\n"; }

    if (cMSSurveyorFindings == 1) { DocumentationList += "All CMS Surveyor Findings,\n"; }
    else if (cMSSurveyorFindings == 2) { DocumentationList += "Presence Of CMS Surveyor Findings,\n"; }
    else if (cMSSurveyorFindings == 3) { DocumentationList += "Absence Of CMS Surveyor Findings,\n"; }

    //To Do in Phase II
    //if (linkedDocs == 1) { DocumentationList += "All Linked Documents\n"; }
    //else if (linkedDocs == 2) { DocumentationList += "Presence Of Linked Documents\n"; }
    //else if (linkedDocs == 3) { DocumentationList += "Absence Of Linked Documents"; }

    var searchset =
    {
        SelectedSiteIDs: ERSites.getSelectedSites().replace(/\,$/, ''),
        SelectedSiteNames: SelectedSiteName,
        ProgramIDs: ProgramIDs.toString().replace(/\,$/, ''),
        ProgramNames: ProgramNames.toString().replace(/,/g, ", "),
        SelectedCoPIDs: SelectedCoPIDs.toString().replace(/,/g, ", "),
        SelectedCoPNames: SelectedCoPNames.toString().replace(/,/g, ", "),
        SelectedTagIDs: SelectedTagIDs.toString().replace(/,/g, ", "),
        SelectedTagNames: SelectedTagNames.toString().replace(/,/g, ", "),
        SelectedIdentifiedByIDs: SelectedIdentifiedByIds.toString().replace(/,/g, ", "),
        SelectedIdentifiedByNames: SelectedIdentifiedByNames.toString().replace(/,/g, ", "),
        ComplianceValueList: ComplianceValue,
        ComplianceValueNameList: ComplianceValueName,
        chkIncludeTJC: $('#IncludeTJCCheckbox').is(':checked') == true ? 1 : 0,
        StartDate: kendo.toString($("#ObsstartDate").data("kendoDatePicker").value(), "yyyy-MM-dd"),
        EndDate: kendo.toString($("#ObsEndDate").data("kendoDatePicker").value(), "yyyy-MM-dd"),
        PlanOfCorrection: planOfCorrection,
        OrgCMSFindings: orgCMSFindings,
        CMSSurveyorFindings: cMSSurveyorFindings,
        LinkedDocs: linkedDocs,
        DocumentationNameList: DocumentationList,
        ReportType: $('input[name=ReportLevelChange]:checked').val(),
        ReportTitle: $('#txtScheduledReportName').val() == '' ? $('#hdnReportTitle').val() : $('#txtScheduledReportName').val()
    }

    return searchset;
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
        excel: { allPages: true },
        excelExport: ERexcelExport,
        columns: [
                    { field: "HCOID", width: 60, title: "HCO ID", hidden: "true", menu: false },
                    { field: "SiteName", width: 200, title: "Site Name", hidden: "true", menu: false },
                    { field: "ProgramName", width: 150, title: "Program", hidden: "true", menu: false },
                    { field: "TagName", width: 70, title: "Tag" },
                    { field: "CopStandardName", width: 130, title: "CoP Standard" },
                    { field: "ConcatenatedText", width: 300, title: "Description", encoded: false },
                    { field: "ComplianceValue", width: 150, title: "Compliance Value" },
                    { field: "Degree", width: 100, title: "Degree" },
                    { field: "Manner", width: 100, title: "Manner" },
                    { field: "DateIdentified", width: 132, title: "Date Identified" },
                    { field: "IdentifiedBy", width: 120, title: "Identified By" },
                    { field: "AutoCitationTagText", width: 120, title: "Auto Citation", hidden: "true", encoded: false, menu: false },

                    { command: { text: "View Documentation", click: showDocuments }, title: "Documentation", width: "180px" },
                    { field: "TJCStandard", width: 200, title: "TJCStandard", hidden: "true", encoded: false, menu: false },

                    { field: "OrgCMSFindings", width: 160, title: "Organizational CMS Findings", hidden: "true", menu: false },
                    { field: "POC", width: 150, title: "Plan of Correction", hidden: "true", menu: false },
                    { field: "CSF", width: 150, title: "CMS Surveyor Findings", hidden: "true", menu: false },
                    { field: "CompliantDate", width: 150, title: "POC Compliant by Date", hidden: "true", menu: false },
                    { field: "LinkedDocumentList", width: 150, title: "Linked Documents", hidden: "true", menu: false },

        ]
    });
}

function ExceldataSource(GenfromSavedFilters, Withemail) {
    var ExcelSearch = SetSearchCriteria(GenfromSavedFilters);
    return new kendo.data.DataSource({
        transport: {
            read: {
                url: "/Corporate/CMSCompliance/_GetCMSComplianceExcelData",
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
                    $("#divAutoCitationTextArea").hide();
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
                    $("#divAutoCitationTextArea").show();
                    
                    var resposeFilter = _.filter(e.response, function (item) { return item.AutoCitationText !== ''; });

                    var autoCitationTextArray = _(_.sortBy(resposeFilter, 'AutoCitationSortOrder')).chain().flatten().pluck('AutoCitationText').unique().value();
                    var autoCitationText = autoCitationTextArray.join("<br /> ");

                    $("#divAutoCitationTextArea")[0].innerHTML = autoCitationText;

                }
            }
        }
    });
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
        if ($('#IncludeTJCCheckbox').is(':checked') == true) {
            epGrid.showColumn("TJCStandard");
        }
        else {
            epGrid.hideColumn("TJCStandard");
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

function stripHTML(html) {
    var tmp = document.createElement("DIV");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
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

function ERExcelExportFunction() {
    ExportReportName = "CMS Compliance Report";

    var epGrid = $("#loadExcelGrid").getKendoGrid();
    
    var columns = epGrid.columns;
    var colDocument = columns.filter(function (v, i) { return columns[i].title == 'Documentation'; });

    var isDocumentColumnVisible = !colDocument[0].hidden;

    if (isDocumentColumnVisible) {
        $("#loadExcelGrid").getKendoGrid().showColumn("OrgCMSFindings");
        $("#loadExcelGrid").getKendoGrid().showColumn("POC");
        //$("#loadExcelGrid").getKendoGrid().showColumn("LinkedDocumentList");
        $("#loadExcelGrid").getKendoGrid().showColumn("CompliantDate");
        $("#loadExcelGrid").getKendoGrid().showColumn("CSF");
    }

    $("#loadExcelGrid").getKendoGrid().showColumn("HCOID");
    $("#loadExcelGrid").getKendoGrid().showColumn("ProgramName");
    $("#loadExcelGrid").getKendoGrid().showColumn("SiteName");
    $("#loadExcelGrid").getKendoGrid().showColumn("AutoCitationTagText");

    $("#loadExcelGrid").getKendoGrid().saveAsExcel();

    if (isDocumentColumnVisible) {
        $("#loadExcelGrid").getKendoGrid().hideColumn("OrgCMSFindings");
        $("#loadExcelGrid").getKendoGrid().hideColumn("POC");
        //$("#loadExcelGrid").getKendoGrid().hideColumn("LinkedDocumentList");
        $("#loadExcelGrid").getKendoGrid().hideColumn("CompliantDate");
        $("#loadExcelGrid").getKendoGrid().hideColumn("CSF");
    }

    $("#loadExcelGrid").getKendoGrid().hideColumn("HCOID");
    $("#loadExcelGrid").getKendoGrid().hideColumn("ProgramName");
    $("#loadExcelGrid").getKendoGrid().hideColumn("SiteName");
    $("#loadExcelGrid").getKendoGrid().hideColumn("AutoCitationTagText");
}

function ERSendEmailForEPScoring() {
    GenerateForEmail = true;
    if (!ExcelGenerated) {

        $.ajax({
            async: true,
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

function AddExportParameters() {

    var Search = SetSearchCriteria(true);

    var startDate = Search.StartDate;
    var endDate = Search.EndDate;
    var reportDate = "All Dates";

    if (Search.StartDate == "") {
        startDate = Search.StartDate;
        if (Search.EndDate != "")
            reportDate = "for " + Search.StartDate + " - " + Search.EndDate;
        else
            reportDate = "since " + Search.StartDate;
    }

    if (Search.EndDate == "") {
        endDate = Search.EndDate;
        if (Search.StartDate == "")
            reportDate = "through " + Search.EndDate;
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
                { value: Search.SelectedSiteNames }
                ]
            },
               {
                   cells: [
                   { value: "Program" },
                   { value: Search.ProgramNames }
                   ]
               },
            {
                cells: [
                { value: "CoP" },
                { value: Search.SelectedCoPNames }
                ]
            },
            {
                cells: [
                { value: "Tag" },
                { value: Search.SelectedTagNames }
                ]
            },
            {
                cells: [
                { value: "Date Range" },
                { value: reportDate }
                ]
            },
                 {
                     cells: [
                     { value: "Identified By" },
                     { value: Search.SelectedIdentifiedByNames }
                     ]
                 },

            {
                cells: [
                { value: "Compliance Value" },
                { value: Search.ComplianceValueNameList }
                ]
            },

            {
                cells: [
                { value: "Documentation" },
                { value: Search.DocumentationNameList }
                ]
            },
        ]
    }
    return stringvalue;

}

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
    dataItem.ProgramCode = dataItem.ProgramCode.toString().trim();
    wnd.content(detailsTemplate(dataItem));
    wnd.center().open();
}

function OnPrintDocumentation() {

    var title = document.title;
    document.title = 'CMS Compliance Report - Documentation';
    window.print();
    document.title = title;

}


function SaveToMyReports(deleteReport) {

    var isPageValid = ValidateScreen();

    if (!isPageValid)
        return false;

    var searchCriteria = SetSearchCriteria(false);

    var parameterSet = [
        { ReportTitle: $('#hdnReportTitle').val() },
        { ReportType: $("input[name=ReportLevelChange]:checked").val() },
        { SelectedSites: searchCriteria.SelectedSiteIDs },
        { ProgramServices: searchCriteria.ProgramIDs },
        { CoPIDs: searchCriteria.SelectedCoPIDs },
        { TagIDs: searchCriteria.SelectedTagIDs },
        { IdentifiedBy: searchCriteria.SelectedIdentifiedByIDs },
        { PlanOfCorrection: searchCriteria.PlanOfCorrection },
        { OrgCMSFindings: searchCriteria.OrgCMSFindings },
        { CMSSurveyorFindings: searchCriteria.CMSSurveyorFindings },
        { LinkedDocuments: searchCriteria.LinkedDocs }
    ];

    //Include Compliance Values
    if (searchCriteria.ComplianceValueList.indexOf("2") > -1) parameterSet.push({ ComplaintCheckbox: true });
    if (searchCriteria.ComplianceValueList.indexOf("1") > -1) parameterSet.push({ StandardLevelDeficiencyCheckbox: true });
    if (searchCriteria.ComplianceValueList.indexOf("0") > -1) parameterSet.push({ ConditionLevelDeficiencyCheckbox: true });
    if (searchCriteria.ComplianceValueList.indexOf("1000") > -1) parameterSet.push({ ImmediateJeopardyCheckbox: true });
    if (searchCriteria.ComplianceValueList.indexOf("6") > -1) parameterSet.push({ NotApplicableCheckbox: true });
    if (searchCriteria.ComplianceValueList.indexOf("99") > -1) parameterSet.push({ IncludeitemsNotReviewedCheckbox: true });

    if (searchCriteria.chkIncludeTJC == 1) parameterSet.push({ IncludeTJC: true });

    //DateRange - Add date parameters only there is a value
    GetObservationDate(parameterSet, searchCriteria.StartDate, searchCriteria.EndDate);

    parameterSet.push({ ScheduledReportName: $('#txtScheduledReportName').val() });

    //Add recurrence fields to the parameter set
    GetERRecurrenceParameters(parameterSet);

    //Save the parameters to the database
    SaveSchedule(parameterSet, deleteReport);
}

//to do
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

    $("#MultiSiteProgram").data("kendoMultiSelect").value(getParamValue(params.ReportParameters, "ProgramServices").split(","));

    //Load the CoPs, Tags
    MultiSiteCoPCall(getParamValue(params.ReportParameters, "ProgramServices"));
    $("#MultiSiteCoP").data("kendoMultiSelect").value(getParamValue(params.ReportParameters, "CoPIDs").split(","));
    UpdateTags();
    if (getParamValue(params.ReportParameters, "TagIDs") != null) {
        $("#MultiSiteTag").data("kendoMultiSelect").value(getParamValue(params.ReportParameters, "TagIDs").split(","));
    }

    $('input[name=ReportLevelChange][value=' + (getParamValue(params.ReportParameters, "ReportType")) + ']').prop('checked', true);
    if (getParamValue(params.ReportParameters, "ReportType") != "" && getParamValue(params.ReportParameters, "ReportType") != "Summary") {
        $('#IncludeTJCCheckbox').removeAttr("disabled");
    }
    else {
        $('#IncludeTJCCheckbox').attr("disabled", 'disabled');
    }
    CheckboxChecked(getParamValue(params.ReportParameters, "IncludeTJC"), 'IncludeTJCCheckbox');

    CheckboxChecked(getParamValue(params.ReportParameters, "ComplaintCheckbox"), 'ComplaintCheckbox');
    CheckboxChecked(getParamValue(params.ReportParameters, "StandardLevelDeficiencyCheckbox"), 'StandardLevelDeficiencyCheckbox');
    CheckboxChecked(getParamValue(params.ReportParameters, "ConditionLevelDeficiencyCheckbox"), 'ConditionLevelDeficiencyCheckbox');
    CheckboxChecked(getParamValue(params.ReportParameters, "ImmediateJeopardyCheckbox"), 'ImmediateJeopardyCheckbox');
    CheckboxChecked(getParamValue(params.ReportParameters, "NotApplicableCheckbox"), 'NotApplicableCheckbox');
    CheckboxChecked(getParamValue(params.ReportParameters, "IncludeitemsNotReviewedCheckbox"), 'IncludeitemsNotReviewedCheckbox');

    IdentifiedByCall();
    $("#IdentifiedBy").data("kendoMultiSelect").value(getParamValue(params.ReportParameters, "IdentifiedBy").split(","));
    $("#divPlanOfCorrection").data("kendoMultiSelect").value(getParamValue(params.ReportParameters, "PlanOfCorrection"));
    $("#divOrgCMSFindings").data("kendoMultiSelect").value(getParamValue(params.ReportParameters, "OrgCMSFindings"));
    $("#divCMSSurveyorFindings").data("kendoMultiSelect").value(getParamValue(params.ReportParameters, "CMSSurveyorFindings"));
    $("#divLinkedDocs").data("kendoMultiSelect").value(getParamValue(params.ReportParameters, "LinkedDocuments"));
    SetERRecurrenceParameters(params);
    SetSavedObservationDate(params.ReportParameters);
    TriggerActionByReportMode(params.ReportMode);
    enableDisableNotReviewedControl();
    isSavedReportLoading = false;
}