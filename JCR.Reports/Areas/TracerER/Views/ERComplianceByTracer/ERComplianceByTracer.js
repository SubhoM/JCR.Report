loadparameters = "ComplianceByTracer";
ExcelView = true;
exportparameters = true;
var defaultValue = "-1";
var defaultText = "All";
var SelectedProgramName = "Hospital";
var SelectedProgramID = 2;
var ResetFilters = $("#GetResetLink").val();
var regExp = /([^)]+)\%/;
var ExportReportName = "";

function additionalData(e) {
    return { search: SetSearchCriteria(false) }
}

function GetParameterValues() {

    var ProgramIDs = [];
    var ProgramNames = [];
   
    if (ProgramIDs.length <= 0) {
        ProgramIDs.push(defaultValue);
        ProgramNames.push(defaultText);
    }

    var TracerListIDs = [];
    var TracerListNames = [];
    $('#TracersList :selected').each(function (i, selected) {
        TracerListIDs[i] = $(selected).val();
        TracerListNames[i] = $(selected).text();
    });
    if (TracerListIDs.length <= 0) {
        TracerListIDs.push(defaultValue);
        TracerListNames.push(defaultText);
    }
    var QuarterListIDs = [];
    var QuarterListNames = [];
    $('#QuartersList :selected').each(function (i, selected) {
        QuarterListIDs[i] = $(selected).val();
        QuarterListNames[i] = $(selected).text();
    });
    if (QuarterListIDs.length <= 0) {
        QuarterListIDs.push(8);
        QuarterListNames.push('2018-Q1');
    }


    var searchset =
{
    SelectedSiteIDs: $("#SiteSelector_SelectedSiteIDs").val(),
    ProgramIDs: ProgramIDs.toString(),
    ProgramNames: ProgramNames.toString().replace(/,/g, ", "),
    TracerListIDs: TracerListIDs.toString(),
    TracerListNames: ConvertToAllOrCSV(TracerListNames),
    QuarterListIDs: QuarterListIDs.toString(),
    QuarterListNames: ConvertToAllOrCSV(QuarterListNames),
    ReportType: $('input[type=radio][name=grpBy]:checked').val(),
    IncludeAllSite: $('#chkIncludeSites').is(':checked'),
    ReportTitle: $('#hdnReportTitle').val(),
    SelectedSiteHCOIDs: "",
    IncludeMinimumComValue: $('#minimaltracerCompValuebox').is(':checked'),
    MinimumComplianceValue: $("#mintracervalue").data("kendoNumericTextBox").value()
}

    return searchset;
}

function SetSearchCriteria(GenfromSavedFilters) {

    //only for rdlc GenfromSavedFilters is set to true only from email button
    //layout.js file common code
    if (GenfromSavedFilters != undefined) {
        if (GenfromSavedFilters) {
            return SearchSetFilterData(GenfromSavedFilters, '');
        }
        else {
            return SearchSetFilterData(GenfromSavedFilters, GetParameterValues());
        }
    }
    else {
        return SearchSetFilterData(GenfromSavedFilters, GetParameterValues());
    }

}
function ValidateData(timeDelay) {
    return true;
}
//Withemail parameter is optional 
function GenerateReport(GenfromSavedFilters, Withemail) {
    //$('.loading').show();
    //SetLoadingImageVisibility(false);
    hasExcelData = true;
    GenerateReportAddCall();
}

function GenerateReportAddCall() {

    ExcelGenerated = true;
  /*
    SelectedProgramName = "Hospital";
    SelectedProgramID = 2;
    SelectedHCOName = "";
    SelectedSiteID = 0;
    ExportReportName = "";
    SelectedTracerCustomID = 0;
    SelectedTracerCustomName = "";
    */
    var selectedReport = $('input[type=radio][name=grpBy]:checked').val();
    var reportURL = '/TracerER/ERComplianceByTracer/LoadHeatMap';
    ExcelGridName = "gridHeatMap";
    if (selectedReport === 'HeatMap')
    {
        reportURL = '/TracerER/ERComplianceByTracer/LoadHeatMap';
        ExcelGridName = "gridHeatMap";
        $("#resultHeatMap").html('');        
    }
    else if (selectedReport === 'Summary')
    {
        reportURL = '/TracerER/ERComplianceByTracer/LoadSummary';
        ExcelGridName = "gridSummary";
        $("#resultSummary").html('');        
    }
    else
    {
        reportURL = '/TracerER/ERComplianceByTracer/LoadTracerResults';
        ExcelGridName = "gridDetails";     
        $("#resultDetails").html('');
    }
    //$('.loading').show();
    //blockElement("divL1tag");
    $.ajax({
        type: "Post",
        async: true,
        cache: false,
        url: reportURL,
        data: {
            search: SetSearchCriteria(false)
        },
        dataType: "html",
        success: function (data) {
            $('#loadReport').html(data);
           // blockElement("divL1tag");          
        }
    });
    //$('.loading').hide();
    ExcelBindData(ExcelGridName);
    closeSlide("btnSearchCriteria", "slideSearch");
}

function SetDefaults() {
    SelectedProgramName = "Hospital";
    SelectedProgramID = 2;
    ExportReportName = "";
    $("#chkIncludeSites").prop("checked", true);
    $("#mintracervalue").data("kendoNumericTextBox").value(100);
    $('input:radio[name=grpBy][value="HeatMap"]').prop('checked', true);
    $('#QuartersList').data("kendoMultiSelect").value("8");
}

$(document).ready(function () {
    $('input:radio[name=grpBy][value="HeatMap"]').prop('checked', true);
    // Reset these additional parameters
    $("#resetfiltersbutton").click(function () {
        SetDefaults();
    });
    if ($.isNumeric($('#lblReportScheduleID').html())) {
        GetSavedParameters($('#lblReportScheduleID').html());
    }
    $("input[name=grpBy]:radio").change(function () {
        if ($('input[name=grpBy]:checked').val() == "HeatMap") {
            $("#tracerCriteria").show();
        } else {
            $("#tracerCriteria").hide();
            $('#minimaltracerCompValuebox').prop("checked", false);
        }
    })
});

function HeatMapExcelExport(e) {

    e.preventDefault();
    var sheets = [
        e.workbook.sheets[0], AddExportParameters()

    ];
    sheets[0].title = "Report";
    sheets[1].title = "Report Selections";
    var includeMinimum = $('#minimaltracerCompValuebox').is(':checked');
    var tracerMinimumValue = $("#mintracervalue").data("kendoNumericTextBox").value();
    var rows = e.workbook.sheets[0].rows;
    var rowlength = rows.length;
    for (var ri = 0; ri < rowlength; ri++) {
        var row = rows[ri];
        for (var i = 0; i < row.cells.length; i++) {
            var cell = row.cells[i];
            cell.wrap = true;
            cell.borderBottom = { color: "#000000 ", size: 1 };
            cell.borderTop = { color: "#000000 ", size: 1 };
            cell.borderRight = { color: "#000000 ", size: 1 };
            cell.borderLeft = { color: "#000000 ", size: 1 };
            if (cell.value && typeof (cell.value) === "string" && cell.value.length > 10) {
                // Use jQuery.fn.text to remove the HTML and get only the text                
                cell.value = stripHTML(cell.value);
            }
            if (row.type == "data") {
                var CompValue = cell.value;
                if (i >= 1) {
                    if (CompValue != "N/A") {
                        if (CompValue != "") {
                            var actualCompValue = regExp.exec(CompValue);
                            if (i % 2 != 0) {
                                if (parseFloat(actualCompValue[1]) >= parseFloat(100)) {
                                    row.cells[i].background = '#008000';
                                    row.cells[i].color = '#FFFFFF';
                                }
                                if (parseFloat(actualCompValue[1]) < parseFloat(100)) {
                                    row.cells[i].background = '#FF0000';
                                    row.cells[i].color = '#FFFFFF';
                                }
                            }
                            else {
                                if (parseFloat(actualCompValue[1]) >= parseFloat(90)) {
                                    row.cells[i].background = '#008000';
                                    row.cells[i].color = '#FFFFFF';
                                }
                                if ((parseFloat(actualCompValue[1]) < parseFloat(90)) && (parseFloat(actualCompValue[1]) >= parseFloat(80))) {
                                    row.cells[i].background = '#FFFF00';
                                }
                                if (parseFloat(actualCompValue[1]) < parseFloat(80)) {
                                    row.cells[i].background = '#FF0000';
                                    row.cells[i].color = '#FFFFFF';
                                }
                                if (includeMinimum) {
                                    if (parseFloat(actualCompValue[1]) >= parseFloat(tracerMinimumValue)) {
                                        row.cells[i].value = '';
                                        row.cells[i].background = '#FFFFFF';
                                        row.cells[i - 1].value = '';
                                        row.cells[i - 1].background = '#FFFFFF';
                                    }
                                }
                            }
                        }
                        else {
                            if (includeMinimum) {
                                if (i % 2 != 0) {
                                    row.cells[i].value = 'No Data';
                                }
                                else {
                                    row.cells[i].value = '';
                                }
                            }
                        }
                    }
                }
            }
        }
    }
    var newRows = [];
    rows.splice(rowlength, rowlength++, { cells: newRows });
    rows.splice(rowlength, rowlength++, { cells: newRows });
    rows.splice(rowlength, rowlength++, { cells: newRows });
    newRows = [
            {
                value: "Compliance with Tracer Schedule:",
                color: "#000000",
                bold: true
            }
    ];
    rows.splice(rowlength, rowlength++, { cells: newRows });
    newRows = [
            {
                value: "Red indicates facility was not 100% compliant with tracer schedule that was assigned.",
                colSpan: 2,
                color: "#FF3333",
                bold: true
            }
    ];
    rows.splice(rowlength, rowlength++, { cells: newRows });
    newRows = [
            {
                value: "Green indicates facility was 100% compliant with tracer schedule that was assigned.",
                colSpan: 2,
                color: "#008000",
                bold: true
            }
    ];
    rows.splice(rowlength, rowlength++, { cells: newRows });
    
    newRows = [];
    rows.splice(rowlength, ++rowlength, { cells: newRows });
    newRows = [
            {
                value: "Tracer Compliance:",
                color: "#000000",
                bold: true
            }
    ];
    rows.splice(rowlength, rowlength++, { cells: newRows });
    newRows = [
            {
                value: "Green indicates facility scored 90% (or better)",
                colSpan: 2,
                color: "#008000",
                bold: true
            }
    ];
    rows.splice(rowlength, rowlength++, { cells: newRows });
    newRows = [
        {
            value: "Yellow indicates facility scored between 80.0% and 89.9%",
            colSpan: 2,
            color: "#000000",
            bold: true
        }
    ];
    rows.splice(rowlength, rowlength++, { cells: newRows });
    newRows = [
            {
                value: "Red indicates facility scored 79.9% or less",
                colSpan: 2,
                color: "#FF3333",
                bold: true
            }
    ];
    rows.splice(rowlength, rowlength++, { cells: newRows });
    

    var workbook = new kendo.ooxml.Workbook({
        sheets: sheets
    });
    
    if (fromemail) {
        ExcelGridName = "gridHeatMap_1";
        ExcelSecondGridName = "gridHeatMap_2"
        var dataURL = workbook.toDataURL();
        dataURL = dataURL.split(";base64,")[1];
        var email = $.parseJSON(sessionStorage.getItem('searchsetemailsession'));
        email.Title = "UHS Tracer Compliance Dashboard HeatMap_";
        email.hasExcelSecondGrid = true;
        email.MultipleAttachment = true;
        email.ReportName = "gridHeatMap";
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
            fileName: $("#ReportTitle").html() + GetReportDateAdder() + ".xlsx",
            forceProxy: false,
            proxyURL: '/Export/Excel_Export_Save'
        })
    }
    //unBlockElement("divL1tag");
}
function SummaryExcelExport(e) {

    e.preventDefault();
    var sheets = [
        e.workbook.sheets[0], AddExportParameters()

    ];
    sheets[0].title = "Report";
    sheets[1].title = "Report Selections";

    var rows = e.workbook.sheets[0].rows;
    for (var ri = 0; ri < rows.length; ri++) {
        var row = rows[ri];
        for (var i = 0; i < row.cells.length; i++) {
            var cell = row.cells[i];
            cell.wrap = true;
            cell.borderBottom = { color: "#000000 ", size: 1 };
            cell.borderTop = { color: "#000000 ", size: 1 };
            cell.borderRight = { color: "#000000 ", size: 1 };
            cell.borderLeft = { color: "#000000 ", size: 1 };
            if (cell.value && typeof (cell.value) === "string" && cell.value.length > 10) {
                // Use jQuery.fn.text to remove the HTML and get only the text                
                cell.value = stripHTML(cell.value);
            }
            if (row.type == "data") {
                var CompValue = cell.value;
                if (i >= 1) {
                    if (CompValue != "N/A") {
                        if (CompValue != "") {
                            var actualCompValue = regExp.exec(CompValue);
                            if (i % 2 != 0) {
                                if (parseFloat(actualCompValue[1]) >= parseFloat(100)) {
                                    row.cells[i].background = '#008000';
                                    row.cells[i].color = '#FFFFFF';
                                }
                                if (parseFloat(actualCompValue[1]) < parseFloat(100)) {
                                    row.cells[i].background = '#FF0000';
                                    row.cells[i].color = '#FFFFFF';
                                }
                            }
                            else {
                                if (parseFloat(actualCompValue[1]) >= parseFloat(90)) {
                                    row.cells[i].background = '#008000';
                                    row.cells[i].color = '#FFFFFF';
                                }
                                if ((parseFloat(actualCompValue[1]) < parseFloat(90)) && (parseFloat(actualCompValue[1]) >= parseFloat(80))) {
                                    row.cells[i].background = '#FFFF00';
                                }
                                if (parseFloat(actualCompValue[1]) < parseFloat(80)) {
                                    row.cells[i].background = '#FF0000';
                                    row.cells[i].color = '#FFFFFF';
                                }
                            }
                        }
                    }
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
        email.Title = "UHS Tracer Compliance Dashboard Summary";
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
            fileName: $("#ReportTitle").html() + GetReportDateAdder() + ".xlsx",
            forceProxy: false,
            proxyURL: '/Export/Excel_Export_Save'
        })
    }
    //unBlockElement("divL1tag");
}
function TracerResultExcelExport(e) {

    e.preventDefault();
    var sheets = [
        e.workbook.sheets[0], AddExportParameters()

    ];
    sheets[0].title = "Report";
    sheets[1].title = "Report Selections";

    var rows = e.workbook.sheets[0].rows;
    for (var ri = 0; ri < rows.length; ri++) {
        var row = rows[ri];
        for (var i = 0; i < row.cells.length; i++) {
            var cell = row.cells[i];
            cell.wrap = true;
            cell.borderBottom = { color: "#000000 ", size: 1 };
            cell.borderTop = { color: "#000000 ", size: 1 };
            cell.borderRight = { color: "#000000 ", size: 1 };
            cell.borderLeft = { color: "#000000 ", size: 1 };
            if (cell.value && typeof (cell.value) === "string" && cell.value.length > 10) {
                // Use jQuery.fn.text to remove the HTML and get only the text                
                cell.value = stripHTML(cell.value);
            }
            if (row.type == "data") {
                var CompValue = cell.value;
                if (i >= 2) {
                    if (CompValue != "N/A") {
                        if (CompValue != "") {
                            var actualCompValue = regExp.exec(CompValue);
                            if (typeof actualCompValue != 'undefined' && actualCompValue != null) {                                
                                if (parseFloat(actualCompValue[1]) < parseFloat(100)) {
                                    row.cells[i].background = '#FF0000';
                                    row.cells[i - 1].background = '#FF0000';
                                    row.cells[i - 2].background = '#FF0000';
                                    row.cells[i].color = '#FFFFFF';
                                    row.cells[i - 1].color = '#FFFFFF';
                                    row.cells[i - 2].color = '#FFFFFF';
                                }
                            }
                        }
                        if (CompValue == "" && row.cells[i - 1].value == "0") {
                            row.cells[i].background = '#808080';
                            row.cells[i - 1].background = '#808080';
                            row.cells[i - 2].background = '#808080';

                        }
                    }
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
        email.Title = "UHS Tracer Compliance Dashboard Details";
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
            fileName: $("#ReportTitle").html() + GetReportDateAdder() + ".xlsx",
            forceProxy: false,
            proxyURL: '/Export/Excel_Export_Save'
        })
    }
    //unBlockElement("divL1tag");
}
function stripHTML(html) {
    var tmp = document.createElement("DIV");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
}
function CreateExcel(GridName) {
    $("#" + GridName).getKendoGrid().saveAsExcel();
}
function AddExportParameters() {
    var ChartSearch = GetParameterValues();
  
    
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
                   { value: "Site / HCO ID" },
                   { value: $("#SiteSelector_SelectedHCOIDs").val() }
                   ]
               },
            {
                cells: [
                { value: "Program" },
                { value: ChartSearch.ProgramNames }
                ]
            },
            {
                cells: [
                { value: "Quarter" },
                { value: ChartSearch.QuarterListNames }
                ]
            },
            {
                cells: [
                { value: "Tracer" },
                { value: ChartSearch.TracerListNames }
                ]
            },
            ChartSearch.IncludeMinimumComValue == true ? getMinimumTracerComplianceExcelExportParameter(ChartSearch) : ""
        ]
    }
    return stringvalue;

}

// common scripts end

//Email Functionality start
function ERSendEmail() {

    if (!ExcelGenerated) {

        $.ajax({
            async: false,
            url: GenerateReport(false)
        }).done(function () {

            setTimeout(function () {

                if (hasExcelData) {
                    fromemail = true;
                    if ($('input[type=radio][name=grpBy]:checked').val() === "HeatMap") {
                                $.ajax({
                                    url: CreateExcel("gridHeatMap_1"),

                                }).done(function () {
                                    fromemail = true;
                                    CreateExcel("gridHeatMap_2");
                                })
                    }
                    else if ($('input[type=radio][name=grpBy]:checked').val() === "Summary") {
                        CreateExcel("gridSummary");
                    }
                    else {
                        CreateExcel("gridDetails");
                    }
                   
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
            if ($('input[type=radio][name=grpBy]:checked').val() === "HeatMap") {
                $.ajax({
                    url: CreateExcel("gridHeatMap_1"),

                }).done(function () {
                    fromemail = true;
                    CreateExcel("gridHeatMap_2");
                })
            }
            else if ($('input[type=radio][name=grpBy]:checked').val() === "Summary") {
                CreateExcel("gridSummary");
            }
            else {
                CreateExcel("gridDetails");
            }
        }
        else {
            fromemail = false;
               ShowEmailStatus("No data found matching your Criteria. Change Criteria and try again.", 'failure');
        }
    }
}
//Email Functionality end

//Save the selected parameters
function SaveToMyReports(deleteReport) {
    var searchCriteria = GetParameterValues();

    var parameterSet = [
        { SelectedSites: ERSites.getSelectedSites() },
        { ProgramServices: searchCriteria.ProgramIDs },
        { ReportTitle: searchCriteria.ReportTitle },
        { ReportType: searchCriteria.ReportType },
        { TracersList: searchCriteria.TracerListIDs },
        { IncludeAllSite: searchCriteria.IncludeAllSite},
        {QuarterPeriodID: searchCriteria.QuarterListIDs}
    ];

    parameterSet.push({ ScheduledReportName: $('#txtScheduledReportName').val() });

    //Set the Report Name
    if (searchCriteria.IncludeMinimumComValue == true) {
        parameterSet.push({ IncludeMinimumComValue: searchCriteria.IncludeMinimumComValue });
        parameterSet.push({ MinimumComplianceValue: searchCriteria.MinimumComplianceValue });
    }

    //Add recurrence fields to the parameter set
    GetERRecurrenceParameters(parameterSet);

    //Add date parameters only there is a value
   // GetObservationDate(parameterSet, searchCriteria.StartDate, searchCriteria.EndDate);

    //Save the parameters to the database
    SaveSchedule(parameterSet, deleteReport);
}

//Sets the saved parameters for each control
function SetSavedParameters(params) {
    var selectedSites = '';

    $('#txtScheduledReportName').val(params.ReportNameOverride);
    var query = $(params.ReportSiteMaps).each(function () {
        selectedSites += $(this)[0].SiteID + ',';
    });
    selectedSites = selectedSites.replace(/\,$/, ''); //Remove the last character if its a comma
    $('input:radio[name=grpBy][value="' + getParamValue(params.ReportParameters, "ReportType") + '"]').prop('checked', true);
    ERSites.oldSites = ERSites.getSelectedSites();

    //Load the programs
    $.ajax({
        type: "POST",
        async: false,
        data: { selectedSiteIDs: selectedSites },
        url: '/TracerER/TracersByTJCStandard/GetHCOIDsString',
        success: function (data) {
            $("#SiteSelector_SelectedHCOIDs").val(data);
        }
    });

    $("#chkIncludeSites").prop("checked", getParamValue(params.ReportParameters, "IncludeAllSite"));
    MultiSiteTracerCall(selectedSites, '2');
    $("#TracersList").data("kendoMultiSelect").value(getParamValue(params.ReportParameters, "TracersList").split(","));

    MultiSiteQuarterCall();
    $("#QuartersList").data("kendoMultiSelect").value(getParamValue(params.ReportParameters, "QuarterPeriodID").split(","));
    if ($('input[name=grpBy]:checked').val() == "HeatMap") {
        if (getParamValue(params.ReportParameters, "IncludeMinimumComValue") == "True") {
            $('#minimaltracerCompValuebox').prop('checked', true);
            $("#mintracervalue").data("kendoNumericTextBox").enable(true);
            $("#mintracervalue").data("kendoNumericTextBox").value(getParamValue(params.ReportParameters, "MinimumComplianceValue"));
        }
        else {
            $('#minimaltracerCompValuebox').prop('checked', false);
            $("#mintracervalue").data("kendoNumericTextBox").enable(false);
        }
    }
    else {
        $("#tracerCriteria").hide();
    }

    SetERRecurrenceParameters(params);

    //Show the Criteria screen once the parameters are loaded
    ERCriteriaLoaded = true;
    OnbtnERSearchClick();

    TriggerActionByReportMode(params.ReportMode);
}
function dataBound() {
    //$('.loading').show();
    this.expandRow(this.tbody.find("tr.k-master-row"));
    //$('.loading').hide();
}
function onHeatMapDatabinding(e) {
    //$('.loading').show();
    var gridID = '';
    var i = 1;
    if (e.sender && e.sender.wrapper && e.sender.wrapper.length > 0)
        gridID = e.sender.wrapper[0].id;
    var tracers = {};
    tracers = tracerscat;
    var gridname = "#" + gridID;
    for (var key in tracers) {
        var value = tracers[key];
        if (parseInt(gridID.substring(12)) != value) {
            $(gridname).data("kendoGrid").hideColumn(i);
        }
        i++;
    }
    //$('.loading').hide();
}
function onHeatMapDataBound(e) {
    //$('.loading').show();
    var gridID = '';
    if (e.sender && e.sender.wrapper && e.sender.wrapper.length > 0)
        gridID = e.sender.wrapper[0].id;
    
    var includeMinimum = $('#minimaltracerCompValuebox').is(':checked');
    var tracerMinimumValue = $("#mintracervalue").data("kendoNumericTextBox").value();

    if (gridID != null && gridID != '') {

        var grid = $("#" + gridID);
        var footer = grid.find(".k-grid-footer");
        var header = grid.find(".k-grid-header");

        //Get the Grid Element and Areas Inside It
        var contentArea = grid.find(".k-grid-content");  //This is the content Where Grid is located
        var count = grid.data("kendoGrid").dataSource.data().length;

        var dataItems = e.sender.dataSource.data();
        for (var j = 0; j < dataItems.length; j++) {
            var row = e.sender.tbody.find("[data-uid='" + dataItems[j].uid + "']");
            var cells = row.children();
            for (var i = 0; i < cells.length; i++) {
                var cell = cells[i];
                var CompValue = cell.textContent;
                if (CompValue != "N/A") {
                    if (CompValue != "") {
                        var actualCompValue = regExp.exec(CompValue);
                        if (i % 2 == 0) {
                            if (parseFloat(actualCompValue[1]) >= parseFloat(100)) {
                                cell.style.backgroundColor = 'Green';
                                cell.style.color = '#FFFFFF';
                            }
                            if (parseFloat(actualCompValue[1]) < parseFloat(100)) {
                                cell.style.backgroundColor = 'Red';
                                cell.style.color = '#FFFFFF';
                            }
                        }
                        else {
                            if (parseFloat(actualCompValue[1]) >= parseFloat(90)) {
                                cell.style.backgroundColor = 'Green';
                                cell.style.color = '#FFFFFF';
                            }
                            if ((parseFloat(actualCompValue[1]) < parseFloat(90)) && (parseFloat(actualCompValue[1]) >= parseFloat(80))) {
                                cell.style.backgroundColor = 'Yellow';
                            }
                            if (parseFloat(actualCompValue[1]) < parseFloat(80)) {
                                cell.style.backgroundColor = 'Red';
                                cell.style.color = '#FFFFFF';
                            }
                            if (includeMinimum) {
                                if (parseFloat(actualCompValue[1]) >= parseFloat(tracerMinimumValue)) {
                                    cells[i].innerHTML = '';
                                    cells[i].style.backgroundColor = 'White';
                                    cells[i - 1].innerHTML = '';
                                    cells[i - 1].style.backgroundColor = 'White';
                                }
                            }
                        }
                    }
                    else {
                        if (includeMinimum) {
                            if (i % 2 == 0) {
                                cells[i].innerHTML = 'No Data';
                            }
                            else {
                                cells[i].innerHTML = '';
                            }
                        }
                    }
                }
            }
        }
        //Horizontal Scrollbar
        var dataDivHeader = e.sender.wrapper.children(".k-grid-header");
        var dataDiv = e.sender.wrapper.children(".k-grid-content");

        e.sender.wrapper.children(".topScroll").remove();

        var scrollWidth = kendo.support.scrollbar();
        var tableWidth = $(grid).find(".k-grid-content table").width();
        var columnWidth = $(grid).find(".k-grid-content-locked table").width();

        var topScroll = $("<div class='topScroll' style='height:" + scrollWidth + "px;margin-left:" + columnWidth + "px;margin-right:" + scrollWidth + "px;'>" +
                          "<div style='width:" + tableWidth + "px;'></div>" +
                          "</div>").insertBefore(dataDivHeader);
        topScroll.scrollLeft(dataDiv.scrollLeft());

        topScroll.on("scroll", function () {
            dataDiv.scrollLeft(topScroll.scrollLeft());
        });

        dataDiv.on("scroll", function () {
            topScroll.scrollLeft(dataDiv.scrollLeft());
        });
    }
    //$('.loading').hide();
}

function onDetailsDataBound(e) {

    var gridID = '';
    if (e.sender && e.sender.wrapper && e.sender.wrapper.length > 0)
        gridID = e.sender.wrapper[0].id;

    if (gridID != null && gridID != '') {

        var grid = $("#" + gridID);
        var footer = grid.find(".k-grid-footer");
        var header = grid.find(".k-grid-header");

        //Get the Grid Element and Areas Inside It
        var contentArea = grid.find(".k-grid-content");  //This is the content Where Grid is located
        var count = grid.data("kendoGrid").dataSource.data().length;

        var dataItems = e.sender.dataSource.data();
        for (var j = 0; j < dataItems.length; j++) {
            var row = e.sender.tbody.find("[data-uid='" + dataItems[j].uid + "']");
            var cells = row.children();
            for (var i = 1; i < cells.length; i++) {
                var cell = cells[i];
                var CompValue = cell.textContent;
                if (CompValue.indexOf("%") > 0) {
                    var actualCompValue = regExp.exec(CompValue);
                    if (parseFloat(actualCompValue[1]) < parseFloat(90)) {
                        cell.style.backgroundColor = 'Red';
                        cells[i - 1].style.backgroundColor = 'Red';
                        cells[i - 2].style.backgroundColor = 'Red';
                        cell.style.color = '#FFFFFF';
                        cells[i - 1].style.color = '#FFFFFF';
                        cells[i - 2].style.color = '#FFFFFF';
                    }
                }
                else if (CompValue == "" && cells[i - 1].textContent == "0") {
                        cell.style.backgroundColor = 'Grey';
                        cells[i - 1].style.backgroundColor = 'Grey';
                        cells[i - 2].style.backgroundColor = 'Grey';
                }
            }
        }
    }
}
function ResetCriteriaDates() {

}



