var TracerCustomID = 0;
ExcelView = true;
exportparameters = true;
var dynamiccolumnNames = "";
var defaultValue = "-1";
var defaultText = "All";
var ResetFilters = $("#GetResetLink").val();
var commonDepartmentGridName = 'gridTracerDepartment';
var reportTracerTypeID = 1;
var staticCoulumnCount = 0;
var regExp = /([^)]+)\%/;
var LimitDepartment = 0;
var LocalOutputDepartmentList = "";

$(document).ready(function () {

    //Set the default report style selection to Graph
    $('input:radio[id*="Graph"]').prop('checked', true);
    ExcelGridName = "gridTracerDepartment";
    $("#btnBacktoChart")
     .bind("click", function () {
         TracerCustomID = 0;
         ExcelGridName = "gridTracerDepartment";
         $('#LoadDetailView').css("display", "none");
         $('#tracerComplianceDetail').css("display", "none");
         $('#loadChartView').css("display", "block");

     });
    $("input[name=ReportTypeExcel]:radio").change(function () {
        if ($('input[name=ReportTypeExcel]:checked').val() == "ExcelView") {
            TracerCustomID = 0;
            LocalOutputDepartmentList = "";
            if (!ExcelGenerated) {
                $('#tracerComplianceDetail').css("display", "none");
            }
            ExcelGridName = "gridTracerCompDept";
            ExcelGenerated = false;
            $("#graphCriteria").hide();
        } else {

            ExcelGridName = "gridTracerDepartment";
            ExcelGenerated = false;
            $("#graphCriteria").show();
        }
    })
    setTotalCompletedObsColor(true, "lt", 1);
    setTotalCompletedObsRange(true, true, true, 100, 90, 100, 90);
    $('input:radio[id*="TJC"]').prop("checked", true);

    $("input[name=RegulationType]:radio").change(function () {
        reportTracerTypeID = $('input[name=RegulationType]:checked').val() === "TJC" ? 1 : 2;
        CategoryUpdate($('#UserSite').val(), $('#UserSiteName').val());
        tracerlistupdate();
    });

    // Reset these additional parameters
    $("#resetfiltersbutton").click(function () {
        SetDefaults();
    });

    if ($.isNumeric($('#lblReportScheduleID').html())) {
        GetSavedParameters($('#lblReportScheduleID').html());
    }

});
function additionalData(e) {

    return { search: SetSearchCriteria(false) }
}
//reset the data.
function SetDefaults() {

    onInactiveCheckChange();
    setTotalCompletedObsColor(true, "lt", 1);
    setTotalCompletedObsRange(true, true, true, 100, 90, 100, 90);
    var dateRangedeselect = $('input[name=DateRange]:checked').val();
    $('input:radio[id*=' & dateRangedeselect & ']').prop('checked', false);
    $('input:radio[id*="TJC"]').prop("checked", true);
    $("#divtiebreakermessage").html("");
    TracerCustomID = 0;
    LocalOutputDepartmentList = "";
}

function GetParameterValues() {
    
    var TracerCategoryIDs = [];
    var TracerCategoryNames = [];
    $('#TracersCategory :selected').each(function (i, selected) {
        TracerCategoryIDs[i] = $(selected).val();
        TracerCategoryNames[i] = $(selected).text();
    });
    if (TracerCategoryIDs.length <= 0) {
        TracerCategoryIDs.push(defaultValue);
        TracerCategoryNames.push(defaultText);
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

    var OrgTypeLevel3IDs = [];
    var OrgTypeLevel3Names = [];
    $('#OrgCampus :selected').each(function (i, selected) {
        OrgTypeLevel3IDs[i] = $(selected).val();
        OrgTypeLevel3Names[i] = $(selected).text();
    });
    if (OrgTypeLevel3IDs.length <= 0) {
        OrgTypeLevel3IDs.push(defaultValue);
        OrgTypeLevel3Names.push(defaultText);
    }

    var OrgTypeLevel2IDs = [];
    var OrgTypeLevel2Names = [];
    $('#OrgBuilding :selected').each(function (i, selected) {
        OrgTypeLevel2IDs[i] = $(selected).val();
        OrgTypeLevel2Names[i] = $(selected).text();
    });
    if (OrgTypeLevel2IDs.length <= 0) {
        OrgTypeLevel2IDs.push(defaultValue);
        OrgTypeLevel2Names.push(defaultText);
    }

    var OrgTypeLevel1IDs = [];
    var OrgTypeLevel1Names = [];
    $('#OrgDepartment :selected').each(function (i, selected) {
        OrgTypeLevel1IDs[i] = $(selected).val();
        OrgTypeLevel1Names[i] = $(selected).text();
    });
    if (OrgTypeLevel1IDs.length <= 0) {
        OrgTypeLevel1IDs.push(defaultValue);
        OrgTypeLevel1Names.push(defaultText);
    }

    var departmentText = $('#OrgDepartment option').map(function () {
        return $(this).text();
    });
    var departmentNames = [];
    for (var j = 0; j < departmentText.length; j++) {
        departmentNames[j] = departmentText[j].replace(' (Inactive)', '');
    }
    var searchset =
    {
        TracerCategoryIDs: TracerCategoryIDs.toString(),
        TracerCategoryNames: ConvertToAllOrCSV(TracerCategoryNames),
        TracerListIDs: TracerListIDs.toString(),
        TracerListNames: ConvertToAllOrCSV(TracerListNames),       
        OrgTypeLevel1IDs: OrgTypeLevel1IDs.toString(),
        OrgTypeLevel1Names: ConvertToAllOrCSV(OrgTypeLevel1Names),
        OrgTypeLevel1SpecialCaseNames: ConvertToAllWithSpecialOrCSV(OrgTypeLevel1Names),
        OrgTypeLevel2IDs: OrgTypeLevel2IDs.toString(),
        OrgTypeLevel2Names: ConvertToAllOrCSV(OrgTypeLevel2Names),
        OrgTypeLevel3IDs: OrgTypeLevel3IDs.toString(),
        OrgTypeLevel3Names: ConvertToAllOrCSV(OrgTypeLevel3Names),
        InActiveOrgTypes: $('#Orgtypecheckbox').is(':checked'),
        StartDate: kendo.toString($("#ObsstartDate").data("kendoDatePicker").value(), "yyyy-MM-dd"),
        EndDate: kendo.toString($("#ObsEndDate").data("kendoDatePicker").value(), "yyyy-MM-dd"),
        ReportTitle: $('#hdnReportTitle').val(),
        ReportID: $('#lblReportScheduleID').text(),
        ReportName: $('#txtScheduledReportName').val(),
        ReportDescription: $('#txtScheduledReportDesc').val(),
        ReportType: $('input[name=ReportTypeExcel]:checked').val(),
        SelectedTracerCustomID: TracerCustomID,
        OutputDepartmentList: LocalOutputDepartmentList,
        TracerTypeID: reportTracerTypeID,
        TracerCompGreaterChecked: $('#tracerCompGreaterChecked').is(':checked'),
        TracerCompGreater: $("#tracerCompGreaterValue").data("kendoNumericTextBox").value(),
        TracerCompBetweenChecked: $('#tracerCompBetweenChecked').is(':checked'),
        TracerCompBetweenLow: $("#tracerCompBetweeLowValue").data("kendoNumericTextBox").value(),
        TracerCompBetweenHigh: $("#tracerCompBetweeHighValue").data("kendoNumericTextBox").value(),
        TracerCompLessChecked: $('#tracerCompLessChecked').is(':checked'),
        TracerCompLess: $("#tracerCompLessValue").data("kendoNumericTextBox").value(),
        IncludeTotalComObsValue: $('#totalcompletedobsValuebox').is(':checked'),
        TotalCompletedObsOperator: $("#SetTotalCompletedObs").data("kendoDropDownList").value(),
        TotalCompletedObsValue: $("#totalcompletedobsvalue").data("kendoNumericTextBox").value(),
        DepartmentNames: ConvertToAllWithSpecialOrCSV(departmentNames)
    }
    return searchset;
}
function SetSearchCriteria(GenfromSavedFilters) {

    //clearallmultiselectsearch();
    //only for rdlc GenfromSavedFilters is set to true only from email button
    //layout.js file common code
    return SearchSetFilterData(GenfromSavedFilters, GetParameterValues());
}
//Withemail parameter is optional 
function GenerateReport(GenfromSavedFilters, Withemail) {
    hasExcelData = true;
    dataLimitIssue = false;
    var ChartSearch = GetParameterValues();
    GenerateReportAddCall(ChartSearch);
}
function GenerateReportAddCall(ChartSearch) {
    $('#loadChartView').html('');
    $('#loadChartView').show();
    $('#tracerComplianceDetail').css("display", "none");
    $('#LoadDetailView').html('');
    hasExcel2Data = true;
    secondAttachmentType = "Excel";
    if ($('input[name=ReportTypeExcel]:checked').val() == "ExcelView") {
        LocalOutputDepartmentList = "";
        $.ajax({
            async: false,
            url: '/Tracer/TracerComplianceDepartment/LoadTracerComplianceDeptDetail',
            dataType: "html",
            cache: false,
            success: function (data) {
                $('#LoadDetailView').html(data);
                gridAutoHeight($('#gridTracerCompDept').getKendoGrid(), 224);
            }
        });
        $('#LoadDetailView').css("display", "block");
        $('#loadChartView').css("display", "none");

        ExcelBindData("gridTracerCompDept");

        ExcelGridName = "gridTracerCompDept";
        SetColumnHeader("gridTracerCompDept", 0);
        TracerCustomID = 0;
    }
    else {
        localExceedFlag = "FALSE";
        LocalOutputDepartmentList = "";
        $("#tracerColumnExtendMsg").html('');
        $("#recordStatusMsg").html("");
        $("#spanSelParameters10").html("");
        ExcelGridName = "gridTracerDepartment";
        $.ajax({
            type: "Post",
            async: false,
            url: '/Tracer/TracerComplianceDepartment/LoadTracerComplianceDepartmentGraph',
            data: {
                search: SetSearchCriteria(false)
            },
            dataType: "html",
            cache: false,            
            success: function (data) {
                $('#loadChartView').html(data);
                subHeaderTitleDesing(ChartSearch);
            },
            error: function (response) {
                hasExcelData = false;
                $("#resultSummary").hide();
                ExcelGenerated = false;
                var err = response;
                $('#error_msg').html('<div id="showerror_msg" class="alert alert-info alert-dismissible" role="alert" style="display:none;">      <button type="button" class="close" data-dismiss="alert">            <span aria-hidden="true">&times;</span><span class="sr-only">Close</span>        </button>        <div id="show_msg"></div>    </div>')
                $('#showerror_msg').removeClass("alert-info").addClass("alert-danger");
                $('#showerror_msg').css("display", "block");
                $('#show_msg').html("No data found matching your Criteria. Change Criteria and try again.");
            }
        });
        $('#LoadDetailView').css("display", "none");
        $('#loadChartView').css("display", "block");

        ExcelBindData("gridTracerDepartment");
        ScrollToTopCall();
    }
}
$(window).resize(function () {
    gridAutoHeight($("#gridTracerCompDept").getKendoGrid(), 224);
});
function gridAutoHeight(gridObj, margin) {
    try {
        if (gridObj) {
            gridObj.element.height($(window).height() - gridObj.element[0].offsetTop - (margin || 40));
            gridObj.resize();
        }
    } catch (e) {
        console.log('Error resizing grid: ' + e.toString());
    }
}


function subHeaderTitleDesing(ChartSearch) {

    var OrgNamedisplay = "";


    $("#spanSelParameters2").html("    " + $('#UserSiteName').val() + " - " + $('#UserProgramName').val());

    var startDate = kendo.toString($("#ObsstartDate").data("kendoDatePicker").value(), "MM/dd/yyyy");
    var endDate = kendo.toString($("#ObsEndDate").data("kendoDatePicker").value(), "MM/dd/yyyy");

    if (startDate != null && endDate != null) {
        $("#spanSelParameters3").html("Tracer updates for " + startDate + " - " + endDate);
    }
    else if (startDate != null && endDate == null) {
        $("#spanSelParameters3").html("Tracer updates since " + startDate);
    }
    else if (startDate == null && endDate != null) {
        $("#spanSelParameters3").html("Tracer updates through " + endDate);
    }
    else {
        $("#spanSelParameters3").html("All Tracer Dates");
    }

    $("#spanSelParameters4").html(" " + $("#OrgRanking1Name").val() + ": " + ChartSearch.OrgTypeLevel1Names);

    if (ChartSearch.TracerCompGreaterChecked == true) {
        $("#spanSelParameters5").html(" " + "Cell Color for Compliance Greater Than or Equal to " + ChartSearch.TracerCompGreater + "% is: Green " + "<canvas id='havingCompCanvas' width='15' height='15' style='background-color:Green;border:1px solid;vertical-align:text-bottom;'></canvas>");
    }
    if (ChartSearch.TracerCompBetweenChecked == true) {
        $("#spanSelParameters6").html(" " + "Cell Color for Compliance Between " + ChartSearch.TracerCompBetweenLow + " and " + ChartSearch.TracerCompBetweenHigh + "% is: Yellow " + "<canvas id='havingCompCanvas' width='15' height='15' style='background-color:Yellow;border:1px solid;vertical-align:text-bottom;'></canvas>");
    }
    if (ChartSearch.TracerCompLessChecked == true) {
        $("#spanSelParameters7").html(" " + "Cell Color for Compliance Less Than or Equal to " + ChartSearch.TracerCompLess + "% is: Red " + "<canvas id='havingCompCanvas' width='15' height='15' style='background-color:Red;border:1px solid;vertical-align:text-bottom;'></canvas>");
    }
    if (ChartSearch.IncludeTotalComObsValue == true) {
        $("#spanSelParameters8").html(" " + "Cell Color for Total Completed Observations " + (ChartSearch.TotalCompletedObsOperator == 'lt' ? "Less than " : "Greater Than ") + ChartSearch.TotalCompletedObsValue + " is: Light Blue " + "<canvas id='havingCompCanvas' width='15' height='15' style='background-color:LightBlue;border:1px solid;vertical-align:text-bottom;'></canvas>");
    }
    if ($('#Orgtypecheckbox').is(':checked') === true) {
        $("#spanSelParameters9").html(ChartSearch.OrgInactiveNames);
    }
}
//Excel Sheet export
function ERExcelExportByTracerDept() {

    $('.loading').show();
    $("#gridTracerDepartment").getKendoGrid().saveAsExcel();


    $('.loading').hide();
}
function PivotExportTracerDept(e) {

    //blockElement("divL1tag");

    e.preventDefault();
    var sheets = [
        e.workbook.sheets[0], AddExportParameters()

    ];
    sheets[0].title = "Report";
    sheets[1].title = "Report Selections";

    var rows = e.workbook.sheets[0].rows;
    var tracerGreaterValue = $("#tracerCompGreaterValue").data("kendoNumericTextBox").value();
    var tracerBetweenLowValue = $("#tracerCompBetweeLowValue").data("kendoNumericTextBox").value();
    var tracerBetweenHighValue = $("#tracerCompBetweeHighValue").data("kendoNumericTextBox").value();
    var tracerLessValue = $("#tracerCompLessValue").data("kendoNumericTextBox").value();
    var totalComOpt = $("#SetTotalCompletedObs").data("kendoDropDownList").value() == 'lt' ? "Less than" : "Greater than";
    var totalComVal = $("#totalcompletedobsvalue").data("kendoNumericTextBox").value();
    var rowlength = rows.length;
    for (var ri = 0; ri < rowlength; ri++) {
        var row = rows[ri];
        for (var ci = 0; ci < row.cells.length; ci++) {
            var cell = row.cells[ci];
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
                if (ci >= 3 && ci % 2 == 0) {
                    if (row.cells[ci].value != "N/A") {
                        if (row.cells[ci].value != "") {
                            var actualCompValue = regExp.exec(row.cells[ci].value);
                            if (($('#tracerCompGreaterChecked').is(':checked') == true) || ($('#tracerCompBetweenChecked').is(':checked') == true) || ($('#tracerCompLessChecked').is(':checked') == true)) {
                                if ($('#tracerCompGreaterChecked').is(':checked') == true) {
                                    if (parseFloat(actualCompValue[1]) >= parseFloat(tracerGreaterValue)) {
                                        row.cells[ci].background = '#008000';
                                        row.cells[ci].color = '#FFFFFF';
                                    }
                                }

                                if ($('#tracerCompBetweenChecked').is(':checked') == true) {
                                    if ((parseFloat(actualCompValue[1]) < parseFloat(tracerBetweenHighValue)) && (parseFloat(actualCompValue[1]) > parseFloat(tracerBetweenLowValue))) {
                                        row.cells[ci].background = '#FFFF00';
                                    }
                                }

                                if ($('#tracerCompLessChecked').is(':checked') == true) {
                                    if (parseFloat(actualCompValue[1]) <= parseFloat(tracerLessValue)) {
                                        row.cells[ci].background = '#FF3333';
                                        row.cells[ci].color = '#FFFFFF';
                                    }
                                }
                            }
                        }
                    }
                }
                if (ci >= 3 && ci % 2 != 0 && $('#totalcompletedobsValuebox').is(':checked') == true) {
                    
                    if (totalComOpt == "Less than") {
                        if (row.cells[ci].value < totalComVal)
                            row.cells[ci].background = '#ADD8E6';
                        if (row.cells[ci].value == "") {
                            row.cells[ci].background = '#ADD8E6';
                        }
                    }
                    else
                        if (row.cells[ci].value > totalComVal)
                            row.cells[ci].background = '#ADD8E6';
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
                        value: "Green indicates department scored " + tracerGreaterValue + "% (or better)",
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
                        value: "Yellow indicates department scored between " + tracerBetweenLowValue + " and " + tracerBetweenHighValue + "%",
                        colSpan: 2,
                        color: "#000000",
                        bold: true
                    }
            ];
            rows.splice(rowlength, rowlength++, { cells: newRows });
        }
        if ($('#tracerCompLessChecked').is(':checked') == true) {
            newRows = [
                    {
                        value: "Red indicates department scored " + tracerLessValue + "% or less",
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
        newRows = [
                {
                    value: "Light Blue indicates department has completed " + totalComOpt + " " + totalComVal + " observation",
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
        var dataURL = workbook.toDataURL();
        dataURL = dataURL.split(";base64,")[1];
        var email = $.parseJSON(sessionStorage.getItem('searchsetemailsession'));
        email.Title = ExportReportName + "-Graph";
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
var tiebreakercompliancevalue = "";
function dataBoundtiebreaker(e) {
    e.preventDefault();
    var gridID = '';
    if (e.sender && e.sender.wrapper && e.sender.wrapper.length > 0)
        gridID = e.sender.wrapper[0].id;

    if (gridID != null && gridID != '') {
        var grid = this;

        if (reportTracerTypeID === 2) {//CMS
            var columns = $("#gridTracerCompDept").data("kendoGrid").options.columns;
            if (columns.length > 0) {
                for (var i = 0; i < columns.length; i++) {
                    if (columns[i].field == "StandardEPs") { // columns[i].title -- You can also use title property here but for this you have to assign title for all columns
                        $("#gridTracerCompDept").data("kendoGrid").columns[i].title = "Tag Standard";
                        $("#gridTracerCompDept thead [data-field=StandardEPs] .k-link").html("Tag Standard")
                        break;
                    }
                }
            }
        }


        //Horizontal Top Scroll
        //Synced up with horizontal bottom scroll
        var dataDiv = e.sender.wrapper.children(".k-grid-content");
        var scrollPosition = e.sender.wrapper.children(".k-grid-header");

        e.sender.wrapper.children(".topScroll").remove();

        var scrollWidth = kendo.support.scrollbar();
        var tableWidth = e.sender.tbody.width();

        var topScroll = $("<div class='topScroll' style='height:" + scrollWidth + "px;margin-right:" + scrollWidth + "px;'>" +
                          "<div style='width:" + tableWidth + "px;'></div>" +
                          "</div>").insertBefore(scrollPosition);
        topScroll.scrollLeft(dataDiv.scrollLeft());

        topScroll.on("scroll", function () {
            dataDiv.scrollLeft(topScroll.scrollLeft());
        });

        dataDiv.on("scroll", function () {
            topScroll.scrollLeft(dataDiv.scrollLeft());
        });
    }
}
function onTracerClickChange(arg) {

    $('#LoadDetailView').html('');
    $.ajax({
        async: false,
        url: '/Tracer/TracerComplianceDepartment/LoadTracerComplianceDeptDetail',
        dataType: "html",
        success: function (data) {
            $('#LoadDetailView').html(data);
        }
    });
    ExcelGridName = "gridTracerCompDept";
    //$("#" + ExcelGridName).data("kendoGrid").hideColumn(28);
    //$("#" + ExcelGridName).data("kendoGrid").columns[28].title = "";
    //$("#" + ExcelGridName).data("kendoGrid").columns[28].field = "";


    var data = this.dataItem(this.select());
    TracerCustomID = data.TracerCustomID;//IMP
    OutputDepartmentList = data.OutputDepartmentIds;
    
    $('#tracerComplianceDetail').css("display", "block");

    $('#LoadDetailView').css("display", "block");
    $('#loadChartView').css("display", "none");


    ExcelBindData(ExcelGridName);
    SetColumnHeader(ExcelGridName, 0);
}
function SaveToMyReports(deleteReport) {
    create_error_elem();

    var searchCriteria = GetParameterValues();

    var parameterSet = [
        { ProgramServices: $('#UserProgram').val() },
        { ReportTitle: searchCriteria.ReportTitle },
        { ReportType: searchCriteria.ReportType },
        { OrgCampus: searchCriteria.OrgTypeLevel3IDs },
        { OrgBuilding: searchCriteria.OrgTypeLevel2IDs },
        { OrgDepartment: searchCriteria.OrgTypeLevel1IDs },
        { Orgtypecheckbox: searchCriteria.InActiveOrgTypes },
        { TracerTypeID: searchCriteria.TracerTypeID },
        { TracersList: searchCriteria.TracerListIDs },
        { TracersCategory: searchCriteria.TracerCategoryIDs }
    ];

    //Set the Report Name
    if (saveRecurrenceScreen != null && saveRecurrenceScreen === "Recurrence") {
        parameterSet.push({ ScheduledReportName: $('#txtScheduledReportName1').val() });
        parameterSet.push({ ScheduledReportDesc: $('#txtScheduledReportDesc1').val() });
    }
    else {
        parameterSet.push({ ScheduledReportName: $('#txtScheduledReportName').val() });
        parameterSet.push({ ScheduledReportDesc: $('#txtScheduledReportDesc').val() });
        $('#txtScheduledReportName1').val($('#txtScheduledReportName').val());
        $('#txtScheduledReportDesc1').val($('#txtScheduledReportDesc').val());
    }

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

    //Add recurrence fields to the parameter set
    GetRecurrenceParameters(parameterSet);

    //Add date parameters only there is a value
    GetObservationDate(parameterSet, searchCriteria.StartDate, searchCriteria.EndDate);

    //Save the parameters to the database
    SaveSchedule(parameterSet, deleteReport);
    if (saveRecurrenceScreen == "Recurrence") { OnbtnSearchClick(); }
}
//Sets the saved parameters for each control
function SetSavedParameters(params) {

    var savedTracerTypeID = getParamValue(params.ReportParameters, "TracerTypeID");
    if (savedTracerTypeID != null) {
        if (savedTracerTypeID == 1) {
            reportTracerTypeID = 1;
            $('input:radio[id*="TJC"]').prop("checked", true);
        }
        else {
            reportTracerTypeID = 2;
            $('input:radio[id*="CMS"]').prop("checked", true);
        }
    }

    $('#txtScheduledReportName').val(params.ReportNameOverride);
    $('#txtScheduledReportDesc').val(params.ReportDescription);
    $('input[name=ReportTypeExcel][value="' + getParamValue(params.ReportParameters, "ReportType") + '"]').prop('checked', true);
    if ($('input[name=ReportTypeExcel]:checked').val() == "ExcelView") {
        ExcelGridName = "gridTracerCompDept";
    }
    SetOrgHierarchy(params.ReportParameters);
    SetSavedObservationDate(params.ReportParameters);
    if ($('input[name=ReportTypeExcel]:checked').val() != "ExcelView") {
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
    }

    $("#TracersList").data("kendoMultiSelect").value(getParamValue(params.ReportParameters, "TracersList").split(","));
    $("#TracersCategory").data("kendoMultiSelect").value(getParamValue(params.ReportParameters, "TracersCategory").split(","));

    SetRecurrenceParameters(params);

    if (params.ReportMode === 2) //Generate
    {
        //Trigger Generate button click
        if ($("#Selectquestionsradio").is(":checked"))
            setTimeout(function () { $('.primarySearchButton').trigger("click") }, 2000);
        else
            setTimeout(function () { $('.primarySearchButton').trigger("click") }, 1000);
    }
    else if (params.ReportMode === 3) //Copy 
    {
        UpdateReportID(false); //Clears the report id label
    }
    else if (params.ReportMode === 5) //Recurrence 
    {
        //Open Recurrence pop-up
        btnRecurrenceClick();
    }

    //TriggerActionByReportMode(params.ReportMode);
    //setTimeout(TriggerActionByReportMode(params.ReportMode), 500);
}
function LargeTracerGridResize(e) {
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
        var lockedArea = grid.find(".k-grid-content-locked");
        var count = grid.data("kendoGrid").dataSource.data().length;

        //Apply the height for the content area
        
        if (count > 5) {
            grid.css('min-height', 300 + header.height());
            contentArea.height(300);
            lockedArea.height(300);
        }
        else {
            if (count < 3) {
                if (count == 1) {
                    grid.css('min-height', (count * 90) + header.height() + 55);
                    contentArea.height((count * 90) + 55);
                    lockedArea.height((count * 90) + 55);
                }
                else {
                    grid.css('min-height', (count * 60) + header.height() + 60);
                    contentArea.height((count * 60) + 60);
                    lockedArea.height((count * 60) + 60);
                }
            }
            else {

                grid.css('min-height', (count * 52) + header.height());
                contentArea.height((count * 52));
                lockedArea.height((count * 52));
            }
        }
        
        grid.data('kendoGrid')._adjustLockedHorizontalScrollBar();
        var tracerGreaterValue = $("#tracerCompGreaterValue").data("kendoNumericTextBox").value();
        var tracerBetweenLowValue = $("#tracerCompBetweeLowValue").data("kendoNumericTextBox").value();
        var tracerBetweenHighValue = $("#tracerCompBetweeHighValue").data("kendoNumericTextBox").value();
        var tracerLessValue = $("#tracerCompLessValue").data("kendoNumericTextBox").value();
        var totalComOpt = $("#SetTotalCompletedObs").data("kendoDropDownList").value() == 'lt' ? "Less than" : "Greater than";
        var totalComVal = $("#totalcompletedobsvalue").data("kendoNumericTextBox").value();

        var dataItems = e.sender.dataSource.data();

        for (var j = 0; j < dataItems.length; j++) {
            var row = e.sender.tbody.find("[data-uid='" + dataItems[j].uid + "']");
            if (($('#tracerCompGreaterChecked').is(':checked') == true) || ($('#tracerCompBetweenChecked').is(':checked') == true) || ($('#tracerCompLessChecked').is(':checked') == true)) {
                var cells = row.children();
                for (var i = 1; i < cells.length; i++) {
                    var cell = cells[i];
                    var CompValue = cell.textContent;
                    if (CompValue != "N/A") {
                        if (CompValue != "") {
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
                    i++;
                }
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
        //For click question text


        //Horizontal Top Scroll
        //Synced up with horizontal bottom scroll
        var dataDivHeader = e.sender.wrapper.children(".k-grid-header");
        var dataDiv = e.sender.wrapper.children(".k-grid-content");

        e.sender.wrapper.children(".topScroll").remove();

        var scrollWidth = kendo.support.scrollbar();
        var tableWidth = $("#gridTracerDepartment").find(".k-grid-content table").width();
        var columnWidth = $("#gridTracerDepartment").find(".k-grid-content-locked table").width();

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
        e.preventDefault();
        setTimeout(function () {
            //get the indicator header
            var groupIndicatorHeader = $('.k-group-indicator').parent();
            if (!groupIndicatorHeader) return;
            //check if it is draggable eneabled
            var kendoDraggableObj = $(groupIndicatorHeader).data('kendoDraggable');
            if (kendoDraggableObj) kendoDraggableObj.destroy();
        }, 0);

        //disable column resizing
        lockgrid = $("#gridTracerDepartment").data("kendoGrid");
        lockgrid.resizable.bind("start", function (e) {
            if ($(e.currentTarget).data("th").data("field") == "TracerCustomName") {
                e.preventDefault();
                setTimeout(function () {
                    lockgrid.wrapper.removeClass("k-grid-column-resizing");
                    $(document.body).add(".k-grid th").css("cursor", "");
                });
            }
        });
    }
}
function stripHTML(html) {
    var tmp = document.createElement("DIV");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
}

function AddExportParameters() {
    var paramsearchset = GetParameterValues();
    var OrgRanking3Nametext = $("#OrgRanking3Name").val() != "" ? $("#OrgRanking3Name").val() + ", " : "";
    var OrgRanking2Nametext = $("#OrgRanking2Name").val() != "" ? $("#OrgRanking2Name").val() + ", " : "";
    var inactivetextparam = "Include Inactive " + OrgRanking3Nametext + OrgRanking2Nametext + "Department";
    var stringvalue = "";
    var TracerListNames = [];
    var TracersCategory = [];
    
    var outputExceeMessage = "";
    var backGroundcolor = "";

    if (LimitDepartment > 100) {
        outputExceeMessage = "This output represents total limit of 100 alphabetically sorted departments for the selected department(s)";
        backGroundcolor = "#ff0000";
    }

    $('#TracersList :selected').each(function (i, selected) {

        TracerListNames[i] = $(selected).text();
    });
    $('#TracersCategory :selected').each(function (i, selected) {

        TracersCategory[i] = $(selected).text();
    });
    if (ExcelGridName != "gridTracerCompDept") {
        stringvalue = {
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
                            { value: "Site" },
                            { value: $("#litSelectedSite").text() }
                            ]
                        },
                        {
                            cells: [
                            { value: "Program" },
                            { value: $("#UserProgramName").val() }
                            ]
                        },
                        {
                            cells: [
                            { value: "Report ID" },
                            { value: paramsearchset.ReportID }
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
                            { value: TracerListNames.toString() }
                            ]
                        },
                        getTracerTypeExcelExportParameter(),
                        {
                            cells: [
                            { value: "Tracer Category" },
                            { value: TracersCategory.toString() }
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
                        getTotalCompletedObsExcelExportParameter(paramsearchset),
                        {
                            cells: [
                            { value: "Department" },
                            { value: paramsearchset.OrgTypeLevel1Names }
                            ]
                        },
                        {
                            cells: [
                            { value: $("#OrgRanking2Name").val() },
                            { value: $("#OrgRanking2Name").val() != "" ? paramsearchset.OrgTypeLevel2Names : "" }
                            ]
                        },
                        {
                            cells: [
                            { value: $("#OrgRanking3Name").val() },
                            { value: $("#OrgRanking3Name").val() != "" ? paramsearchset.OrgTypeLevel3Names : "" }
                            ]
                        },
                        {
                            cells: [
                            { value: inactivetextparam },
                            { value: paramsearchset.InActiveOrgTypes == true ? "True" : "False" }
                            ]
                        },
                        {
                            cells: [
                                { value: outputExceeMessage, color: backGroundcolor }
                            ]
                        }
            ]
        }
    }
    else {
        stringvalue = {
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
                            { value: "Site" },
                            { value: $("#litSelectedSite").text() }
                            ]
                        },
                        {
                            cells: [
                            { value: "Program" },
                            { value: $("#UserProgramName").val() }
                            ]
                        },
                        {
                            cells: [
                            { value: "Report ID" },
                            { value: paramsearchset.ReportID }
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
                            { value: TracerListNames.toString() }
                            ]
                        },
                        getTracerTypeExcelExportParameter(),
                        {
                            cells: [
                            { value: "Tracer Category" },
                            { value: TracersCategory.toString() }
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
                        {
                            cells: [
                            { value: "Department" },
                            { value: paramsearchset.OrgTypeLevel1Names }
                            ]
                        },
                        {
                            cells: [
                            { value: $("#OrgRanking2Name").val() },
                            { value: $("#OrgRanking2Name").val() != "" ? paramsearchset.OrgTypeLevel2Names : "" }
                            ]
                        },
                        {
                            cells: [
                            { value: $("#OrgRanking3Name").val() },
                            { value: $("#OrgRanking3Name").val() != "" ? paramsearchset.OrgTypeLevel3Names : "" }
                            ]
                        },
                        {
                            cells: [
                            { value: inactivetextparam },
                            { value: paramsearchset.InActiveOrgTypes == true ? "True" : "False" }
                            ]
                        },
                        {
                            cells: [
                                { value: outputExceeMessage, color: backGroundcolor }
                            ]
                        }
            ]
        }
    }
    return stringvalue;
}
function OnRequestEnd(e) {
    if (e.response != null) {
        if (e.response.Errors === null || e.response.Errors === undefined)//NO errors{
        {
            closeSlide("btnSearchCriteria", "slideSearch");
            hasExcelData = true;
            
            if (ExcelGridName == "gridTracerDepartment") {
                closeSlide("btnSearchCriteria", "slideSearch");
                hasExcelData = true;
                ExcelGenerated = true;
                ExportReportName = $("#ReportTitle").html();
     
                $("#exportoexcelTracerDept").show();
                if (ExceedFlag == 'TRUE') {
                    localExceedFlag = "TRUE";
                    $("#spanSelParameters10").html("This output represents total limit of 100 alphabetically sorted departments for the selected department(s)");
                }
            }
            else {
                var tiebreakermsg = "";
                if(e.response.Total != 0){
                    LimitDepartment = e.response.Data[e.response.Total - 1].LimitDepartment;
                    if (LimitDepartment > 100) {
                        tiebreakermsg = tiebreakermsg + "<br/>This output represents total limit of 100 alphabetically sorted departments for the selected department(s)";
                    }
                    $("#divtiebreakermessage").html(tiebreakermsg);
                }
            }
        }
        else {
            closeSlide("btnEmail", "slideEmail");
            openSlide("btnSearchCriteria", "slideSearch");
            hasExcelData = false;
            if (e.response.Errors.indexOf("limit") >= 0) {
                dataLimitIssue = true;
                OnLimitissue();
            }

            else {
                $('#error_msg').html('<div id="showerror_msg" class="alert alert-info alert-dismissible" role="alert" style="display:none;">      <button type="button" class="close" data-dismiss="alert">            <span aria-hidden="true">&times;</span><span class="sr-only">Close</span>        </button>        <div id="show_msg"></div>    </div>')
                $('#showerror_msg').removeClass("alert-info").addClass("alert-danger");
                $('#showerror_msg').css("display", "block");
                $('#show_msg').html(e.response.Errors);
            }
        }
    }
    //Hide the loading animation
    $('.loading').hide();

}