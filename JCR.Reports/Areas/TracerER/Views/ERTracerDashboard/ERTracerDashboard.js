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

$(document).ready(function () {
    $('input:radio[name=grpBy][value="HeatMap"]').prop('checked', true);
    setTotalCompletedObsRange(true, true, true, 100, 90, 100, 90);
    setTotalCompletedObsColor(true, "lt", 1);
    // Reset these additional parameters
    $("#resetfiltersbutton").click(function () {
        SetDefaults();
    });
    $("input[name=grpBy]:radio").change(function () {
        if ($('input[name=grpBy]:checked').val() == "TracerDetail") {
            $("#graphCriteria").hide();
            $("#tracerCriteria").hide();
            $("#divSelectAllSite").hide();
            $('#minimaltracerCompValuebox').prop("checked", false);
            $('#totalcompletedobsValuebox').prop("checked", false);
        } else {
            $("#graphCriteria").show();
            $("#tracerCriteria").show();
            $("#divSelectAllSite").show();
            $('#totalcompletedobsValuebox').prop("checked", true);
        }
    })
    if ($.isNumeric($('#lblReportScheduleID').html())) {
        GetSavedParameters($('#lblReportScheduleID').html());
    }
});

function SetDefaults() {
    SelectedProgramName = "Hospital";
    SelectedProgramID = 2;
    ExportReportName = "";
    $("#chkIncludeSites").prop("checked", true);
    $("#mintracervalue").data("kendoNumericTextBox").value(100);
    $('input:radio[name=grpBy][value="HeatMap"]').prop('checked', true);
    setTotalCompletedObsRange(true, true, true, 100, 90, 100, 90);
    setTotalCompletedObsColor(true, "lt", 1);
}

function LoadReportParameters(selectedSiteIDs) {
    $.ajax({
        type: "POST",
        data: { selectedSiteIDs: selectedSiteIDs },
        url: '/TracerER/TracersByTJCStandard/GetHCOIDsString',
        success: function (data) {
            $("#SiteSelector_SelectedHCOIDs").val(data);
        }
    });
    MultiSiteTracerCall(selectedSiteIDs, '2');
}

function MultiSiteTracerCall(selectedSiteIDs, selectedProgramIDs) {

    $.ajax({
        async: false,
        dataType: "html",
        url: '/TracerER/ERSearch/GetMultiSiteTracersList',
        data: {
            selectedSiteIDs: selectedSiteIDs,
            selectedProgramIDs: selectedProgramIDs,
        },
        success: function (response) {
            $("#divMultiSiteTracer").html(response);
        }
    });
}

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


    var searchset =
    {
        SelectedSiteIDs: $("#SiteSelector_SelectedSiteIDs").val(),
        ProgramIDs: ProgramIDs.toString(),
        ProgramNames: ProgramNames.toString().replace(/,/g, ", "),
        TracerListIDs: TracerListIDs.toString(),
        TracerListNames: ConvertToAllWithSpecialOrCSV(TracerListNames),
        ReportType: $('input[type=radio][name=grpBy]:checked').val(),
        IncludeAllSite: $('#chkIncludeSites').is(':checked'),
        ReportTitle: $('#hdnReportTitle').val(),
        ReportName: $('#txtScheduledReportName').val(),
        ReportDescription: $('#txtScheduledReportDesc').val(),
        SelectedSiteHCOIDs: "",
        StartDate: kendo.toString($("#ObsstartDate").data("kendoDatePicker").value(), "MM/dd/yyyy"),
        EndDate: kendo.toString($("#ObsEndDate").data("kendoDatePicker").value(), "MM/dd/yyyy"),
        IncludeTotalComObsValue: $('#totalcompletedobsValuebox').is(':checked'),
        TotalCompletedObsOperator: $("#SetTotalCompletedObs").data("kendoDropDownList").value(),
        TotalCompletedObsValue: $("#totalcompletedobsvalue").data("kendoNumericTextBox").value(),
        TracerCompGreaterChecked: $('#tracerCompGreaterChecked').is(':checked'),
        TracerCompGreater: $("#tracerCompGreaterValue").data("kendoNumericTextBox").value(),
        TracerCompBetweenChecked: $('#tracerCompBetweenChecked').is(':checked'),
        TracerCompBetweenLow: $("#tracerCompBetweeLowValue").data("kendoNumericTextBox").value(),
        TracerCompBetweenHigh: $("#tracerCompBetweeHighValue").data("kendoNumericTextBox").value(),
        TracerCompLessChecked: $('#tracerCompLessChecked').is(':checked'),
        TracerCompLess: $("#tracerCompLessValue").data("kendoNumericTextBox").value(),
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

function GenerateReport(GenfromSavedFilters, Withemail) {
    //$('.loading').show();
    //SetLoadingImageVisibility(false);
    hasExcelData = true;
    

    GenerateReportAddCall();
}

function GenerateReportAddCall() {
   /* 
    var parameters = SetSearchCriteria(false);
    var tracerNames = parameters.TracerListNames;
    if (tracerNames == 'All') {
        var tracerText = $('#TracersList option').map(function () {
            return $(this).text();
        });        
        tracerNames = [];
        for (var j = 0; j < tracerText.length; j++) {
            tracerNames[j] = tracerText[j];
        }
    }
    */
    ExcelGenerated = true;
    var selectedReport = $('input[type=radio][name=grpBy]:checked').val();
    var reportURL = '/TracerER/ERTracerDashboard/LoadTracerHeatMap';
    ExcelGridName = "gridTracerHeatMap";
    if (selectedReport === 'HeatMap') {
        reportURL = '/TracerER/ERTracerDashboard/LoadTracerHeatMap';
        ExcelGridName = "gridTracerHeatMap";
        $("#resultTracerHeatMap").html('');
    }
    else {
        reportURL = '/TracerER/ERTracerDashboard/LoadTracerDetailts';
        ExcelGridName = "gridTracerDetails"; 
        $("#resultTracerDetails").html('');
    }
    
    $.ajax({
        type: "Post",
        async: true,
        cache: false,
        url: reportURL,
        data: {
            search: SetSearchCriteria(false)
//            tracerName: tracerNames.toString()
        },
        dataType: "html",
        success: function (data) {
            $('#loadReport').html(data);     
        }
    });
    //$('.loading').hide();
    ExcelBindData(ExcelGridName);
    closeSlide("btnSearchCriteria", "slideSearch");
}

function ResetCriteriaDates() {

}

function SaveToMyReports(deleteReport) {
    var searchCriteria = GetParameterValues();

    var parameterSet = [
        { SelectedSites: ERSites.getSelectedSites() },
        { ProgramServices: searchCriteria.ProgramIDs },
        { ReportTitle: searchCriteria.ReportTitle },
        { ReportType: searchCriteria.ReportType },
        { TracersList: searchCriteria.TracerListIDs },
        { IncludeAllSite: searchCriteria.IncludeAllSite },
        
    ];

    //Set the Report Name
    parameterSet.push({ ScheduledReportName: $('#txtScheduledReportName').val() });
    parameterSet.push({ ScheduledReportDesc: $('#txtScheduledReportDesc').val() });

    if (searchCriteria.TracerCompGreaterChecked == true) {
        parameterSet.push({ TracerCompGreaterChecked: searchCriteria.TracerCompGreaterChecked });
        parameterSet.push({ TracerCompGreater: searchCriteria.TracerCompGreater });
    }
    if (searchCriteria.TracerCompBetweenChecked == true) {
        parameterSet.push({ TracerCompBetweenChecked: searchCriteria.TracerCompBetweenChecked });
        parameterSet.push({ TracerCompBetweenLow: searchCriteria.TracerCompBetweenLow });
        parameterSet.push({ TracerCompBetweenHigh: searchCriteria.TracerCompBetweenHigh });
    }
    if (searchCriteria.TracerCompLessChecked == true) {
        parameterSet.push({ TracerCompLessChecked: searchCriteria.TracerCompLessChecked });
        parameterSet.push({ TracerCompLess: searchCriteria.TracerCompLess });
    }

    if (searchCriteria.IncludeTotalComObsValue === true) {
        parameterSet.push({ TotalCompletedObsChecked: searchCriteria.IncludeTotalComObsValue });
        parameterSet.push({ TotalCompletedObsOperator: searchCriteria.TotalCompletedObsOperator });
        parameterSet.push({ TotalCompletedObsValue: searchCriteria.TotalCompletedObsValue });
    }

    if (searchCriteria.IncludeMinimumComValue == true) {
        parameterSet.push({ IncludeMinimumComValue: searchCriteria.IncludeMinimumComValue });
        parameterSet.push({ MinimumComplianceValue: searchCriteria.MinimumComplianceValue });
    }

    //Add recurrence fields to the parameter set
    GetERRecurrenceParameters(parameterSet);

    //Add date parameters only there is a value
    GetObservationDate(parameterSet, searchCriteria.StartDate, searchCriteria.EndDate);

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
    $("#chkIncludeSites").prop("checked", getParamValue(params.ReportParameters, "IncludeAllSite") == "True" ? true : false);
    MultiSiteTracerCall(selectedSites, '2');
    $('input[name=grpBy][value="' + getParamValue(params.ReportParameters, "ReportType") + '"]').prop('checked', true);
    $("#TracersList").data("kendoMultiSelect").value(getParamValue(params.ReportParameters, "TracersList").split(","));
    if ($('input[name=grpBy]:checked').val() != "TracerDetail") {

        var totalComObsValue = getParamValue(params.ReportParameters, "TotalCompletedObsValue");
        var totalComObsChecked = getParamValue(params.ReportParameters, "TotalCompletedObsChecked");
        if (totalComObsValue != null && $.isNumeric(totalComObsValue) && totalComObsChecked == "True") {
            var operatorValue = getParamValue(params.ReportParameters, "TotalCompletedObsOperator");
            setTotalCompletedObsColor(true, operatorValue, totalComObsValue);
        }
        else {
            setTotalCompletedObsColor(false, "lt", 1);
        }
    }
    else {
        $("#graphCriteria").hide();
        $("#tracerCriteria").hide();
        $("#divSelectAllSite").hide();
    }
    if (getParamValue(params.ReportParameters, "TracerCompGreaterChecked") == "True") {
        $('#tracerCompGreaterChecked').prop('checked', true);
        $("#tracerCompGreaterValue").data("kendoNumericTextBox").value(getParamValue(params.ReportParameters, "TracerCompGreater"));
    }
    else {
        $('#tracerCompGreaterChecked').prop('checked', false);
        $("#tracerCompGreaterValue").data("kendoNumericTextBox").enable(false);
    }
    if (getParamValue(params.ReportParameters, "TracerCompBetweenChecked") == "True") {
        $('#tracerCompBetweenChecked').prop('checked', true);
        $("#tracerCompBetweeLowValue").data("kendoNumericTextBox").value(getParamValue(params.ReportParameters, "TracerCompBetweenLow"));
        $("#tracerCompBetweeHighValue").data("kendoNumericTextBox").value(getParamValue(params.ReportParameters, "TracerCompBetweenHigh"));
    }
    else {
        $('#tracerCompBetweenChecked').prop('checked', false);
        $("#tracerCompBetweeLowValue").data("kendoNumericTextBox").enable(false);
        $("#tracerCompBetweeHighValue").data("kendoNumericTextBox").enable(false);
    }
    if (getParamValue(params.ReportParameters, "TracerCompLessChecked") == "True") {
        $('#tracerCompLessChecked').prop('checked', true);
        $("#tracerCompLessValue").data("kendoNumericTextBox").value(getParamValue(params.ReportParameters, "TracerCompLess"));
    }
    else {
        $('#tracerCompLessChecked').prop('checked', false);
        $("#tracerCompLessValue").data("kendoNumericTextBox").enable(false);
    }


    if (getParamValue(params.ReportParameters, "IncludeMinimumComValue") == "True") {
        $('#minimaltracerCompValuebox').prop('checked', true);
        $("#mintracervalue").data("kendoNumericTextBox").enable(true);
        $("#mintracervalue").data("kendoNumericTextBox").value(getParamValue(params.ReportParameters, "MinimumComplianceValue"));
    }
    else {
        $('#minimaltracerCompValuebox').prop('checked', false);
        $("#mintracervalue").data("kendoNumericTextBox").enable(false);
    }
    
    SetSavedObservationDate(params.ReportParameters);

    SetERRecurrenceParameters(params);

    //Show the Criteria screen once the parameters are loaded
    ERCriteriaLoaded = true;
    OnbtnERSearchClick();

    TriggerActionByReportMode(params.ReportMode);
}

function onDetailsDataBound(e) {
    e.preventDefault();
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

        var tracerGreaterValue = $("#tracerCompGreaterValue").data("kendoNumericTextBox").value();
        var tracerBetweenLowValue= $("#tracerCompBetweeLowValue").data("kendoNumericTextBox").value();
        var tracerBetweenHighValue= $("#tracerCompBetweeHighValue").data("kendoNumericTextBox").value();
        var tracerLessValue= $("#tracerCompLessValue").data("kendoNumericTextBox").value();

        for (var j = 0; j < dataItems.length; j++) {
            var row = e.sender.tbody.find("[data-uid='" + dataItems[j].uid + "']");
            var cells = row.children();
            for (var i = 1; i < cells.length; i++) {
                var cell = cells[i];
                var CompValue = cell.textContent;
                if (($('#tracerCompGreaterChecked').is(':checked') == true) || ($('#tracerCompBetweenChecked').is(':checked') == true) || ($('#tracerCompLessChecked').is(':checked') == true)) {
                    if (CompValue.indexOf("%") > 0) {
                        var actualCompValue = regExp.exec(CompValue);
                        if ($('#tracerCompGreaterChecked').is(':checked') == true) {
                            if (parseFloat(actualCompValue[1]) >= parseFloat(tracerGreaterValue)) {
                                cell.style.backgroundColor = 'Green';
                                cell.style.color = '#FFFFFF';
                            }
                        }

                        if ($('#tracerCompBetweenChecked').is(':checked') == true) {
                            if ((parseFloat(actualCompValue[1]) < parseFloat(tracerBetweenHighValue)) && (parseFloat(actualCompValue[1]) > parseFloat(tracerBetweenLowValue))) {
                                cell.style.backgroundColor = 'Yellow';
                            }
                        }

                        if ($('#tracerCompLessChecked').is(':checked') == true) {
                            if (parseFloat(actualCompValue[1]) <= parseFloat(tracerLessValue)) {
                                cell.style.backgroundColor = '#FF3333';
                                cell.style.color = '#FFFFFF';
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
}

function stripHTML(html) {
    var tmp = document.createElement("DIV");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
}

function CreateExcel(GridName) {
    $("#" + GridName).getKendoGrid().saveAsExcel();
}

function TracerDetailExcelExport(e) {

    e.preventDefault();
    ShowLoader();
    var sheets = [
        e.workbook.sheets[0], AddExportParameters()

    ];
    sheets[0].title = "Report";
    sheets[1].title = "Report Selections";

    var tracerGreaterValue = $("#tracerCompGreaterValue").data("kendoNumericTextBox").value();
    var tracerBetweenLowValue = $("#tracerCompBetweeLowValue").data("kendoNumericTextBox").value();
    var tracerBetweenHighValue = $("#tracerCompBetweeHighValue").data("kendoNumericTextBox").value();
    var tracerLessValue = $("#tracerCompLessValue").data("kendoNumericTextBox").value();

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
                if (i >= 4) {
                    if (CompValue != "N/A") {
                        if (($('#tracerCompGreaterChecked').is(':checked') == true) || ($('#tracerCompBetweenChecked').is(':checked') == true) || ($('#tracerCompLessChecked').is(':checked') == true)) {
                            if (CompValue != "") {
                                var actualCompValue = regExp.exec(CompValue);
                                if (typeof actualCompValue != 'undefined' && actualCompValue != null) {
                                    if ($('#tracerCompGreaterChecked').is(':checked') == true) {
                                        if (parseFloat(actualCompValue[1]) >= parseFloat(tracerGreaterValue)) {
                                            row.cells[i].background = '#008000';
                                            row.cells[i].color = '#FFFFFF';
                                        }
                                    }

                                    if ($('#tracerCompBetweenChecked').is(':checked') == true) {
                                        if ((parseFloat(actualCompValue[1]) < parseFloat(tracerBetweenHighValue)) && (parseFloat(actualCompValue[1]) > parseFloat(tracerBetweenLowValue))) {
                                            row.cells[i].background = '#FFFF00';
                                        }
                                    }

                                    if ($('#tracerCompLessChecked').is(':checked') == true) {
                                        if (parseFloat(actualCompValue[1]) <= parseFloat(tracerLessValue)) {
                                            row.cells[i].background = '#FF3333';
                                            row.cells[i].color = '#FFFFFF';
                                        }
                                    }
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
    var dataURL = workbook.toDataURL();
    dataURL = dataURL.split(";base64,")[1];

    if (fromemail) {
        var email = $.parseJSON(sessionStorage.getItem('searchsetemailsession'));
        email.Title = "Tracer Dashboard Details";
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
    /*
        kendo.saveAs({
            dataURI: workbook.toDataURL(),
            fileName: $("#ReportTitle").html() + GetReportDateAdder() + ".xlsx",
            forceProxy: false,
            proxyURL: '/Export/Excel_Export_Save'
        })
        */
        
        var fileName = $("#ReportTitle").html() + GetReportDateAdder() + ".xlsx";
        $(function () {
            $.get({
                url: '/ERTracerDashboard/createErExcel',
                type: "post",
                async: true,
                data: {
                    base64: dataURL,
                    title: fileName
                },
                success: function (result) {
                    window.location = kendo.format("{0}{1}{2}{3}",
                            "/Export/exportExcelFileByLocation?ExportFileName=", fileName, "&guid=", result.fileGuid);
                }
            });
        });
        //window.location = kendo.format("{0}?contentType={1}&base64={2}&fileName={3}", "/Export/Excel_Export_Save", contentType, dataURL, fileName);
    }
    HideLoader();
    //unBlockElement("divL1tag");
}

function AddExportParameters() {
    var paramsearchset = GetParameterValues();


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
                { value: paramsearchset.ProgramNames }
                ]
            },
            {
                cells: [
                { value: "My Report Name" },
                { value: paramsearchset.ReportName }
                ]
            },
            {
                cells: [
                { value: "Custom Report Description" },
                { value: paramsearchset.ReportDescription }
                ]
            },
            {
                cells: [
                { value: "Tracer Name" },
                { value: paramsearchset.TracerListNames }
                ]
            },
            {
                cells: [
                { value: "StartDate" },
                { value: paramsearchset.StartDate }
                ]
            },
            {
                cells: [
                { value: "EndDate" },
                { value: paramsearchset.EndDate }
                ]
            },
            getCompliance1ExcelExportParameter(paramsearchset),
            getCompliance2ExcelExportParameter(paramsearchset),
            getCompliance3ExcelExportParameter(paramsearchset),
            ExcelGridName == "gridTracerHeatMap" ? getTotalCompletedObsExcelExportParameter(paramsearchset) : "",
            paramsearchset.IncludeMinimumComValue == true ? getMinimumTracerComplianceExcelExportParameter(paramsearchset) : ""
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
                        CreateExcel("gridTracerHeatMap");
                    }
                    else {
                        CreateExcel("gridTracerDetails");
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
                CreateExcel("gridTracerHeatMap");
            }
            else {
                CreateExcel("gridTracerDetails");
            }
        }
        else {
            fromemail = false;
            ShowEmailStatus("No data found matching your Criteria. Change Criteria and try again.", 'failure');
        }
    }
}
//Email Functionality end

function onTracerHeatMapDataBound(e) {
    //$('.loading').show();
    e.preventDefault();
    var gridID = '';
    if (e.sender && e.sender.wrapper && e.sender.wrapper.length > 0)
        gridID = e.sender.wrapper[0].id;

    if (gridID != null && gridID != '') {

        var grid = $("#" + gridID);
        var footer = grid.find(".k-grid-footer");
        var header = grid.find(".k-grid-header");

        var tracerGreaterValue = $("#tracerCompGreaterValue").data("kendoNumericTextBox").value();
        var tracerBetweenLowValue = $("#tracerCompBetweeLowValue").data("kendoNumericTextBox").value();
        var tracerBetweenHighValue = $("#tracerCompBetweeHighValue").data("kendoNumericTextBox").value();
        var tracerLessValue = $("#tracerCompLessValue").data("kendoNumericTextBox").value();
        var totalComOpt = $("#SetTotalCompletedObs").data("kendoDropDownList").value() == 'lt' ? "Less than" : "Greater than";
        var totalComVal = $("#totalcompletedobsvalue").data("kendoNumericTextBox").value();
        var includeMinimum = $('#minimaltracerCompValuebox').is(':checked');
        var tracerMinimumValue = $("#mintracervalue").data("kendoNumericTextBox").value();
        
        var dataItems = e.sender.dataSource.data();
        for (var j = 0; j < dataItems.length; j++) {
            var row = e.sender.tbody.find("[data-uid='" + dataItems[j].uid + "']");
            var cells = row.children();
            
            for (var i = 1; i < cells.length; i++) {
                var cell = cells[i];
                var CompValue = cell.textContent;
                if (CompValue != "N/A") {
                    if (CompValue != "") {
                        var actualCompValue = regExp.exec(CompValue);
                        if (($('#tracerCompGreaterChecked').is(':checked') == true) || ($('#tracerCompBetweenChecked').is(':checked') == true) || ($('#tracerCompLessChecked').is(':checked') == true)) {
                            if ($('#tracerCompGreaterChecked').is(':checked') == true) {
                                if (parseFloat(actualCompValue[1]) >= parseFloat(tracerGreaterValue)) {
                                    cell.style.backgroundColor = 'Green';
                                    cell.style.color = '#FFFFFF';
                                }
                            }

                            if ($('#tracerCompBetweenChecked').is(':checked') == true) {
                                if ((parseFloat(actualCompValue[1]) < parseFloat(tracerBetweenHighValue)) && (parseFloat(actualCompValue[1]) > parseFloat(tracerBetweenLowValue))) {
                                    cell.style.backgroundColor = 'Yellow';
                                }
                            }

                            if ($('#tracerCompLessChecked').is(':checked') == true) {
                                if (parseFloat(actualCompValue[1]) <= parseFloat(tracerLessValue)) {
                                    cell.style.backgroundColor = '#FF3333';
                                    cell.style.color = '#FFFFFF';
                                }
                            }
                        }
                        if (includeMinimum) {
                            if (parseFloat(actualCompValue[1]) >= parseFloat(tracerMinimumValue)) {
                                cells[i].innerHTML = '';
                                cells[i].style.backgroundColor = 'White';
                                cells[i - 1].innerHTML = '';
                            }
                        }
                    }
                    else {
                        if (includeMinimum) {
                            cells[i - 1].innerHTML = '0';
                        }
                    }
                }
                i++;
            }
            if ($('#totalcompletedobsValuebox').is(':checked') == true) {
                    var cells = row.children();
                    for (var i = 0; i < cells.length; i++) {
                        var cell = cells[i];
                        var TotalComValue = cell.textContent;
                        if (totalComOpt == "Less than") {
                            if (parseFloat(TotalComValue) < parseFloat(totalComVal)) {
                                cell.style.backgroundColor = 'LightBlue';
                        }
                            if (TotalComValue == "") {
                                cell.style.backgroundColor = 'LightBlue';
                        }
                        }
                        else {
                            if (parseFloat(TotalComValue) > parseFloat(totalComVal)) {
                                cell.style.backgroundColor = 'LightBlue';
                        }
                    }
                    i++;
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

function TracerHeatMapExcelExport(e) {

    e.preventDefault();
    ShowLoader();
    var sheets = [
        e.workbook.sheets[0], AddExportParameters()

    ];
    sheets[0].title = "Report";
    sheets[1].title = "Report Selections";

    var tracerGreaterValue = $("#tracerCompGreaterValue").data("kendoNumericTextBox").value();
    var tracerBetweenLowValue = $("#tracerCompBetweeLowValue").data("kendoNumericTextBox").value();
    var tracerBetweenHighValue = $("#tracerCompBetweeHighValue").data("kendoNumericTextBox").value();
    var tracerLessValue = $("#tracerCompLessValue").data("kendoNumericTextBox").value();
    var totalComOpt = $("#SetTotalCompletedObs").data("kendoDropDownList").value() == 'lt' ? "Less than" : "Greater than";
    var totalComVal = $("#totalcompletedobsvalue").data("kendoNumericTextBox").value();
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
                if (i >= 4 && i%2 != 0) {
                    if (CompValue != "N/A") {
                        if (CompValue != "") {
                            var actualCompValue = regExp.exec(CompValue);
                            if (typeof actualCompValue != 'undefined' && actualCompValue != null) {
                                if (($('#tracerCompGreaterChecked').is(':checked') == true) || ($('#tracerCompBetweenChecked').is(':checked') == true) || ($('#tracerCompLessChecked').is(':checked') == true)) {
                                    if ($('#tracerCompGreaterChecked').is(':checked') == true) {
                                        if (parseFloat(actualCompValue[1]) >= parseFloat(tracerGreaterValue)) {
                                            row.cells[i].background = '#008000';
                                            row.cells[i].color = '#FFFFFF';
                                        }
                                    }

                                    if ($('#tracerCompBetweenChecked').is(':checked') == true) {
                                        if ((parseFloat(actualCompValue[1]) < parseFloat(tracerBetweenHighValue)) && (parseFloat(actualCompValue[1]) > parseFloat(tracerBetweenLowValue))) {
                                            row.cells[i].background = '#FFFF00';
                                        }
                                    }

                                    if ($('#tracerCompLessChecked').is(':checked') == true) {
                                        if (parseFloat(actualCompValue[1]) <= parseFloat(tracerLessValue)) {
                                            row.cells[i].background = '#FF3333';
                                            row.cells[i].color = '#FFFFFF';
                                        }
                                    }
                                }
                                if (includeMinimum) {
                                    if (parseFloat(actualCompValue[1]) >= parseFloat(tracerMinimumValue)) {
                                        row.cells[i].value = '';
                                        row.cells[i].background = '#FFFFFF';
                                        row.cells[i - 1].value = '';
                                    }
                                }
                            }
                        }
                        else {
                            if (includeMinimum) {
                                row.cells[i - 1].value = '0';
                            }
                        }
                    }
                }
                if (i >= 4 && i % 2 == 0 && $('#totalcompletedobsValuebox').is(':checked') == true) {
                    if (totalComOpt == "Less than") {
                        if (row.cells[i].value < totalComVal)
                            row.cells[i].background = '#ADD8E6';
                        if (row.cells[i].value == "") {
                            row.cells[i].background = '#ADD8E6';
                        }
                    }
                    else
                        if (row.cells[i].value > totalComVal)
                            row.cells[i].background = '#ADD8E6';
                }
            }
        }
    }
    var newRows = [];
    rows.splice(rowlength, rowlength++, { cells: newRows });
    rows.splice(rowlength, rowlength++, { cells: newRows });
    rows.splice(rowlength, rowlength++, { cells: newRows });
    if (($('#tracerCompGreaterChecked').is(':checked') == true) || ($('#tracerCompBetweenChecked').is(':checked') == true) || ($('#tracerCompLessChecked').is(':checked') == true)) {
        newRows = [
                {
                    value: "Tracer Compliance:",
                    color: "#000000",
                    bold: true
                }
        ];
        rows.splice(rowlength, rowlength++, { cells: newRows });
        if ($('#tracerCompGreaterChecked').is(':checked') == true) {
            newRows = [
                    {
                        value: "Green indicates site scored " + tracerGreaterValue + "% (or better)",
                        colSpan: 2,
                        color: "#008000",
                        bold: true
                    }
                ];
            rows.splice(rowlength, rowlength++, { cells: newRows });
        }
        if ($('#tracerCompBetweenChecked').is(':checked') == true) {
            newRows = [
                    {
                        value: "Yellow indicates site scored between " + tracerBetweenLowValue + " and " + tracerBetweenHighValue + "%",
                        colSpan: 2,
                        color: "#000000",
                        bold: true
                    }
                ];
            rows.splice(rowlength, rowlength++, { cells: newRows });
        }
        if ($('#tracerCompLessChecked').is(':checked') == true) {
            newRows =[
                    {
                        value: "Red indicates site scored " + tracerLessValue + "% or less",
                        colSpan: 2,
                        color: "#FF3333",
                        bold: true
                    }
                ];
            rows.splice(rowlength, rowlength++, { cells: newRows });
        }
    }
    newRows = [];
    rows.splice(rowlength, ++rowlength, { cells: newRows });
    if ($('#totalcompletedobsValuebox').is(':checked') == true) {
        newRows = [
                {
                    value: "Tracer Completed Observations:",
                    color: "#000000",
                    bold: true
                }
            ];
        rows.splice(rowlength, rowlength++, { cells: newRows });
        newRows =[
                {
                    value: "Light Blue indicates site has completed " + totalComOpt + " " + totalComVal + " observation",
                    colSpan: 3,
                    color: "#000000",
                    bold: true
                }
            ];
        rows.splice(rowlength, rowlength++, { cells: newRows });
    }

    var workbook = new kendo.ooxml.Workbook({
        sheets: sheets
    });

    if (fromemail) {
        ExcelGridName = "gridTracerHeatMap";
        var dataURL = workbook.toDataURL();
        dataURL = dataURL.split(";base64,")[1];
        var email = $.parseJSON(sessionStorage.getItem('searchsetemailsession'));
        email.Title = "Tracer Dashboard Graph";
        email.ReportName = "gridTracerHeatMap";
        $(function () {

            $.post('/Email/SendExcelEmail',
                { base64: dataURL, email: email
            }, function (data) {

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
    HideLoader();
    //unBlockElement("divL1tag");
}