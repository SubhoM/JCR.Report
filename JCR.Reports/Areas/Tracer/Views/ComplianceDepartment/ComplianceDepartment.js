loadparameters = "ComplianceQuestion";
var AllQuestionGrid = false;
var QuestionText = "";
var QuestionID = 0;
ExcelView = true;
var TracerIDsHoldforDetailScope = [];
//Get URLS from hidden fields
exportparameters = true;
var dynamiccolumnNames = "";
var defaultValue = "-1";
var defaultText = "All";
var colunmResult = "";
var savedquestionsid = [];
var ResetFilters = $("#GetResetLink").val();
var commonDepartmentGridName = 'gridDepartment';
var reportTracerTypeID = 1;
var updateSelectedQuestions = false;
var staticCoulumnCount = 0;
var TracerListNames = [];
var departmentText = [];
var regExp = /([^)]+)\%/;
var LimitDepartment = 0;
var LocalOutputDepartmentList = "";

$(document).ready(function () {

    //Set the default report style selection to Graph
    $('input:radio[id*="Graph"]').prop('checked', true);
    ExcelGridName = "gridDepartment";
    $("#AllQuestions").data("kendoGrid").destroy();
    $("#btnBacktoChart")
     .bind("click", function () {
         QuestionID = 0;
         ExcelGridName = "gridDepartment";
         $('#LoadDetailView').css("display", "none");
         $('#complianceDetail').css("display", "none");
         $('#loadChartView').css("display", "block");

     });
    $("input[name=ReportTypeExcel]:radio").change(function () {
        if ($('input[name=ReportTypeExcel]:checked').val() == "ExcelView") {
            QuestionID = 0;
            LocalOutputDepartmentList = "";
            if (!ExcelGenerated) {
                $('#complianceDetail').css("display", "none");
            }
            ExcelGridName = "gridCompDept";
            ExcelGenerated = false;
            $("#graphCriteria").hide();
            $('#tracerCompGreaterChecked').prop("checked", false);
            $('#tracerCompBetweenChecked').prop("checked", false);
            $('#tracerCompLessChecked').prop("checked", false);
        } else {

            ExcelGridName = "gridDepartment";
            ExcelGenerated = false;
            $("#graphCriteria").show();
            $('#tracerCompGreaterChecked').prop("checked", true);
            $('#tracerCompBetweenChecked').prop("checked", true);
            $('#tracerCompLessChecked').prop("checked", true);
        }
    })
    $('input:radio[id*="TJC"]').prop("checked", true);

    $("input[name=RegulationType]:radio").change(function () {

        $('input:radio[id*="leastcompliantquestionsradio"]').prop('checked', true);
        setLeastCompliantQuestion(true);
        if (AllQuestionGrid) { $("#AllQuestions").data("kendoGrid").dataSource.data([]); }

        $("#divselectedquestionCount").html("0 Questions selected");
        $('#divselectedquestionCount').css("display", "none");

        reportTracerTypeID = $('input[name=RegulationType]:checked').val() === "TJC" ? 1 : 2;
        UpdateTracerListForQuestions();
        clearKendoGrid();
    });
    setTotalCompletedObsRange(true, true, true, 100, 90, 100, 90);
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

    var dateRangedeselect = $('input[name=DateRange]:checked').val();
    $('input:radio[id*=' & dateRangedeselect & ']').prop('checked', false);
    $('input:radio[id*="leastcompliantquestionsradio"]').prop('checked', true);
    setLeastCompliantQuestion(true);
    if (AllQuestionGrid) { $("#AllQuestions").data("kendoGrid").dataSource.data([]); }
    setTotalCompletedObsRange(true, true, true, 100, 90, 100, 90);
    $('input:radio[id*="TJC"]').prop("checked", true);

    $("#txtQuestionSearch").val("");
    $("#divselectedquestionCount").html("0 Questions selected");
    $('#divselectedquestionCount').css("display", "none");
    QuestionID = 0;
    LocalOutputDepartmentList = "";
    $("#divQuestionResultsMsg").html("Search Results");
    //AllQuestionTracerscheckbox
    $("#AllQuestionTracerscheckbox").prop('checked', false);
    $("#divtiebreakermessage").html("");

    $('#noncompliantcheckbox').prop('checked', false);
    $('#mindenvalue').data("kendoNumericTextBox").value(0);
    $('#mindenvalue').data("kendoNumericTextBox").enable(false);
}
function GetParameterValues() {
    var TopLeastCompliantQuestions = "";
    var SelectedQuestions = "";
    var AllTracersMode = false;
    var OrgTypeLevel3IDs = [];
    var OrgTypeLevel3Names = [];
    var TracerIDs = [];
    var TracerSectionIDs = [];
    var QuestionIDs = [];
    var SelectedQuestionTexts = [];
    var Keyword = "";

    var TracerListIDs = [];
    TracerListNames = [];
    $('#TracersList :selected').each(function (i, selected) {
        TracerListIDs[i] = $(selected).val();
        TracerListNames[i] = $(selected).text();
    });
    if (TracerListIDs.length <= 0) {
        TracerListIDs.push(defaultValue);
        TracerListNames.push(defaultText);
    }

    var TracerSectionListIDs = [];
    var TracerSectionListNames = [];
    $('#TracerSectionsList :selected').each(function (i, selected) {
        TracerSectionListIDs[i] = $(selected).val();
        TracerSectionListNames[i] = $(selected).text();
    });
    if (TracerSectionListIDs.length <= 0) {
        TracerSectionListIDs.push(defaultValue);
        TracerSectionListNames.push(defaultText);
    }

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

    if ($("#leastcompliantquestionsradio").is(":checked")) {
        TopLeastCompliantQuestions = $("#LeastComplaintQuestions").data("kendoDropDownList").value();
        TracerIDs = TracerListIDs;
        TracerSectionIDs = TracerSectionListIDs;
        QuestionIDs = "";
        //AllTracersMode = true;
    }
    else {
        TopLeastCompliantQuestions = "0";

        Keyword = $("#txtQuestionSearch").val();


        var gridAllQuestions = $("#AllQuestions").data("kendoGrid");
        var selectedRows = $(".k-state-selected", "#AllQuestions");

        if (selectedRows.length > 0) {
            for (var i = 0; i < selectedRows.length; i++) {
                var selectedItem = gridAllQuestions.dataItem(selectedRows[i]);
                QuestionIDs[i] = selectedItem.TracerQuestionID;
            }
            SelectedQuestionTexts = "You have selected "+ selectedRows.length + " Questions.";
            TracerIDsHoldforDetailScope = TracerListIDs.toString();
            TracerIDs = TracerIDsHoldforDetailScope;
        }
        else {
            QuestionIDs = savedquestionsid.toString();
        }
    }
    if ($("#AllQuestionTracerscheckbox").is(":checked")) {
        AllTracersMode = true;
        TracerIDs = "";

    }
    else {

        if (TracerListIDs.length > 0) {
            if (TracerListIDs[0] == "-1") {
                AllTracersMode = true;
                TracerIDs = "";
            }
        }
        else {
            AllTracersMode = true;
            TracerIDs = "";
        }
    }

    var searchset =
    {
        TracerListIDs: TracerListIDs.toString(),
        TracerListNames: ConvertToAllOrCSV(TracerListNames),
        TracerSectionListIDs: TracerSectionListIDs.toString(),
        TracerSectionListNames: ConvertToAllOrCSV(TracerSectionListNames),
        OrgTypeLevel1IDs: OrgTypeLevel1IDs.toString(),
        OrgTypeLevel1Names: ConvertToAllOrCSV(OrgTypeLevel1Names),
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
        TopLeastCompliantQuestions: TopLeastCompliantQuestions,
        TracerQuestionIDs: QuestionIDs.toString(),
        TracerIds: TracerIDs.toString(),
        AllTracers: AllTracersMode,
        QuestionID: QuestionID,
        OutputDepartmentList:LocalOutputDepartmentList,
        AllSelectedQuestions: SelectedQuestionTexts.toString(),
        Keyword: Keyword.toString(),
        IncludeMinimalDenomValue: $('#minimaldenomValuebox').is(':checked'),
        MinimalDenomValue: $("#mindenvalue").data("kendoNumericTextBox").value(),
        TracerTypeID: reportTracerTypeID,
        TracerCompGreaterChecked: $('#tracerCompGreaterChecked').is(':checked'),
        TracerCompGreater: $("#tracerCompGreaterValue").data("kendoNumericTextBox").value(),
        TracerCompBetweenChecked: $('#tracerCompBetweenChecked').is(':checked'),
        TracerCompBetweenLow: $("#tracerCompBetweeLowValue").data("kendoNumericTextBox").value(),
        TracerCompBetweenHigh: $("#tracerCompBetweeHighValue").data("kendoNumericTextBox").value(),
        TracerCompLessChecked: $('#tracerCompLessChecked').is(':checked'),
        TracerCompLess: $("#tracerCompLessValue").data("kendoNumericTextBox").value()
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
    $('#complianceDetail').css("display", "none");
    $('#LoadDetailView').html('');
    hasExcel2Data = true;
    secondAttachmentType = "Excel";
    if ($('input[name=ReportTypeExcel]:checked').val() == "ExcelView") {
        LocalOutputDepartmentList = "";
        $.ajax({
            async: false,
            url: '/Tracer/ComplianceDepartment/LoadComplianceDeptDetail',
            dataType: "html",
            cache: false,
            success: function (data) {
                $('#LoadDetailView').html(data);
            }
        });
        $('#LoadDetailView').css("display", "block");
        $('#loadChartView').css("display", "none");

        ExcelBindData("gridCompDept");

        ExcelGridName = "gridCompDept";
        $("#" + ExcelGridName).data("kendoGrid").hideColumn(27);
        $("#" + ExcelGridName).data("kendoGrid").columns[27].title = "";
        $("#" + ExcelGridName).data("kendoGrid").columns[27].field = "";
        SetColumnHeader("gridCompDept", 0);
        QuestionID = 0;
    }
    else {
        $.ajax({
            async: false,
            url: '/Tracer/ComplianceDepartment/LoadComplianceDepartmentPivot',
            dataType: "html",
            cache: false,
            success: function (data) {
                $('#loadChartView').html(data);              
                OnLoadAggregatedTracerData(ChartSearch, commonDepartmentGridName);
            },
            error: function (response) {
                var err = response;
            }
        });
        $('#LoadDetailView').css("display", "none");
        $('#loadChartView').css("display", "block");
    }   
}
function OnLoadAggregatedTracerData(ChartSearch, gridName) {

    if (gridName == commonDepartmentGridName) {
        $("#exportoexcelDept").hide();
        subHeaderTitleDesing(ChartSearch);
        $("#tracerColumnExtendMsg").html('');
    }

    $('#' + gridName).html('');
    $('#' + gridName).show();

    localExceedFlag = "FALSE";
    LocalOutputDepartmentList = "";
    $("#recordStatusMsg").html("");
    $("#spanSelParameters12").html("");
    $.ajax({
        url: '/Tracer/ComplianceDepartment/LoadComplianceDepartmentGrid',
        contentType: 'application/json; charset=utf-8',
        dataType: 'json',
        cache: false,
        type: 'POST',
        data: JSON.stringify({ 'search': ChartSearch }),

        success: function (data) {
            if (data.RecordStatus == 'TRUE') {
                $('#showerror_msg').removeClass("alert-info").addClass("alert-danger");
                $('#showerror_msg').css("display", "block");
                $('#show_msg').html("No data found matching your criteria. ");
                ExcelGenerated = false;
                return;
            }
            closeSlide("btnSearchCriteria", "slideSearch");
            if (data.outputData.length > 3) {

                hasExcelData = true;
                ExcelGenerated = true;
                ExportReportName = $("#ReportTitle").html();
          
                $("#exportoexcelDept").show();
                var DepartmentDataSource = JSON.parse(data.outputData);


                //reterive column key names.
                dynamiccolumnNames = _.allKeys(DepartmentDataSource[0]);
                //error message define.
                if (data.ExceedFlag == 'TRUE') {
                    localExceedFlag = "TRUE";
                    $("#spanSelParameters12").html("This output represents total limit of 100 alphabetically sorted departments for the selected department(s)");
                    LocalOutputDepartmentList = data.OutputDepartmentList;
                }
                //Column Headers Dynamically define
                DynamicHeaders =
                    //dynamiccolumnNames;
                    checkDynamicColumns(dynamiccolumnNames, ChartSearch);

                LoadDepartGridData(DepartmentDataSource, ChartSearch, DynamicHeaders, 'gridDepartment');
             //   $(".loading").hide();
            }

            else {
                ExcelGenerated = false;
                hasExcelData = false;
                $("#gridDepartment").hide();
                $("#recordStatusMsg").html("No data found matching your criteria.");
                return;
            }
        },
        error: function (response) {
            dataLimitIssue = true;
            OnLimitissue();
            hasExcelData = false;
            $("#gridDepartment").hide();
            ExcelGenerated = false;
            var err = response;
        }
    });
    ScrollToTopCall();
}

function LoadDepartGridData(DepartmentDataSource,
    ChartSearch, dynamicColumnHeaders, gridName) {

    var dataSource1 = new kendo.data.DataSource({
        data: DepartmentDataSource,
        pageSize: 20,
    });
    $("#" + gridName).kendoGrid({
        //autoBind:false,
        dataSource: dataSource1,
        pageable: {
            refresh: true,
            pageSizes: [20, 50, 100]
        },
        dataBound: LargeGridResize,
        toolbar: [{
                    type: "separator",
                    template: "<div align='center' style='margin-top: 10px;'> Click a Question to get details</div>"
                   }
                ],
        columns: dynamicColumnHeaders,
        resizable: true,
        sortable: true,
        groupable: false,
        selectable: true,
        excel: { allPages: true },
        excelExport: PivotExportDept,
        change: onClickChange
    });

    dataSource1.read();
}
var checkDynamicColumns = function (dynamiccolumnNames, ChartSearch) {
    dynamiccolumns = [];
    departmentText = $('#OrgDepartment option').map(function () {
        return $(this).text();
    });
    var arrayLength = dynamiccolumnNames.length;
    staticCoulumnCount = 0;
    var departmentNames = [];
    var staticFieldName = ['QuestionText', 'OverallComp', 'QuesNo', 'QuestionID', 'OrgName_Rank1_DeptID'];
    for (var j = 0; j < departmentText.length; j++) {
        departmentNames[j] = departmentText[j].replace(/\#/g, '').replace(/\./g, '').replace(/\"/g, '').replace(/\\/g, '').replace(' (Inactive)', '');
    }
    for (var i = 0; i < arrayLength; i++) {
        var colWidth = 100;
        if ($.inArray(dynamiccolumnNames[i], staticFieldName) == -1) {
            var indexValue = departmentNames.indexOf(dynamiccolumnNames[i]);
            dynamiccolumns.push({
                field: '["' + dynamiccolumnNames[i] + '"]',
                width: colWidth,
                title: departmentText[indexValue],
                groupable: false,
                attributes: { style: "text-align:right" }
            });
        }
        else {
            staticColumnDesign(dynamiccolumnNames[i], ChartSearch);
        }
    }
    return dynamiccolumns;
}
function staticColumnDesign(databaseColumnName, ChartSearch) {
    staticColumnTitle = "";
    colWidth = 0;
    var subGroupHeader = "";

    switch (databaseColumnName) {
        case "QuestionText":
            staticColumnTitle = "Question Text";
            colWidth = 700;
            hidden = false;
            staticCoulumnCount = staticCoulumnCount + 1;
            compare = true;
            attributes = { style: "text-align:left" };
            break;
        case "OverallComp":
            staticColumnTitle = "Overall Comp%";
            colWidth = 100;
            hidden = false;
            staticCoulumnCount = staticCoulumnCount + 1;
            compare = {
                compare: function (a, b) {
                    return a.OverallComp.split("%")[0] - b.OverallComp.split("%")[0];
                }
            };
            attributes = { style: "text-align:right" };
            break;
        case "QuesNo":
            staticColumnTitle = "Q#";
            colWidth = 50;
            hidden = false;
            compare = true;
            staticCoulumnCount = staticCoulumnCount + 1;
            attributes = { style: "text-align:right" };
            break;
        default:
            staticColumnTitle = databaseColumnName;
            hidden = true;
            compare = true;
            colWidth = 200;
            staticCoulumtnCount = staticCoulumnCount + 1;
            break;
    }
    if (staticColumnTitle == "") { return; }
    dynamiccolumns.push({
        field: databaseColumnName,
        width: colWidth,
        title: staticColumnTitle,
        hidden: hidden,
        locked: true,
        groupable: false,
        resizable: true,
        attributes: attributes,
        encoded: false,
        sortable: compare
    });
    return true;
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

    if (ChartSearch.TopLeastCompliantQuestions == "0") {
        $("#spanSelParameters5").html(" " + "Selected Questions");
    }

    $("#spanSelParameters6").html(" " + "Across All Tracers: " + (ChartSearch.AllTracers == true ? "True" : "False"));
    
    $("#spanSelParameters7").html(" " + "Include minimal total denominator value of " + ChartSearch.MinimalDenomValue);
 
    if (ChartSearch.TracerCompGreaterChecked == true) {
        $("#spanSelParameters8").html(" " + "Cell Color for Compliance Greater Than or Equal to " + ChartSearch.TracerCompGreater + "% is: Green " + "<canvas id='havingCompCanvas' width='15' height='15' style='background-color:Green;border:1px solid;vertical-align:text-bottom;'></canvas>");
    }
    if (ChartSearch.TracerCompBetweenChecked == true) {
        $("#spanSelParameters9").html(" " + "Cell Color for Compliance Between " + ChartSearch.TracerCompBetweenLow + " and " + ChartSearch.TracerCompBetweenHigh + "% is: Yellow " + "<canvas id='havingCompCanvas' width='15' height='15' style='background-color:Yellow;border:1px solid;vertical-align:text-bottom;'></canvas>");
    }
    if (ChartSearch.TracerCompLessChecked == true) {
        $("#spanSelParameters10").html(" " + "Cell Color for Compliance Less Than or Equal to " + ChartSearch.TracerCompLess + "% is: Red " + "<canvas id='havingCompCanvas' width='15' height='15' style='background-color:Red;border:1px solid;vertical-align:text-bottom;'></canvas>");
    }
    if ($('#Orgtypecheckbox').is(':checked') === true) {
        $("#spanSelParameters11").html(ChartSearch.OrgInactiveNames);
    }
}
//Excel Sheet export
function ERExcelExportByDept() {

    //$('.loading').show();
    $("#gridDepartment").getKendoGrid().saveAsExcel();


    //$('.loading').hide();
}
function PivotExportDept(e) {

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
    var rowlength = rows.length;
    for (var ri = 0; ri < rowlength; ri++) {
        var row = rows[ri];
        for (var ci = 0; ci < row.cells.length; ci++) {
            var cell = row.cells[ci];
            if (cell.value && typeof (cell.value) === "string" && cell.value.length > 10) {
                // Use jQuery.fn.text to remove the HTML and get only the text                
                cell.value = stripHTML(cell.value);
            }
            
            if (row.type == "data") {
                if (ci >= staticCoulumnCount) {
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
        var tiebreakerCheckremove = 0;
    
        if ($("#leastcompliantquestionsradio").is(":checked")) {
            tiebreakerCheckremove = $("#LeastComplaintQuestions").data("kendoDropDownList").value();

        }
        if (tiebreakerCheckremove != 0) {
            var data = this.dataSource.data();
            // Find those records that have desc_tipo_pagamento set to "test"
            // and return them in `res` array
            var res = $.grep(data, function (d) {
                tiebreakercompliancevalue = d.Compliance;
                return d.QID == Number(tiebreakerCheckremove) + 1;
            });

            $(res).each(function (removeIndex) {
                var removeItemId = this;
                grid.dataSource.remove(removeItemId);
            });
        }
        if (reportTracerTypeID === 2) {//CMS
            var columns = $("#gridCompDept").data("kendoGrid").options.columns;
            if (columns.length > 0) {
                for (var i = 0; i < columns.length; i++) {
                    if (columns[i].field == "StandardEPs") { // columns[i].title -- You can also use title property here but for this you have to assign title for all columns
                        $("#gridCompDept").data("kendoGrid").columns[i].title = "Tag Standard";
                        $("#gridCompDept thead [data-field=StandardEPs] .k-link").html("Tag Standard")
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
function onClickChange(arg) {

    $('#LoadDetailView').html('');
    //$('.loading').show();
    $.ajax({
        async: false,
        url: '/Tracer/ComplianceDepartment/LoadComplianceDeptDetail',
        dataType: "html",
        success: function (data) {
            $('#LoadDetailView').html(data);
            //$('.loading').hide();
        }
    });
    ExcelGridName = "gridCompDept";
    $("#" + ExcelGridName).data("kendoGrid").hideColumn(27);
    $("#" + ExcelGridName).data("kendoGrid").columns[27].title = "";
    $("#" + ExcelGridName).data("kendoGrid").columns[27].field = "";


    var data = this.dataItem(this.select());
    QuestionID = data.QuestionID;//IMP
    OutputDepartmentList = LocalOutputDepartmentList;
    QuestionText = data.QuestionText;

    $('#complianceDetail').css("display", "block");

    $('#LoadDetailView').css("display", "block");
    $('#loadChartView').css("display", "none");


    ExcelBindData(ExcelGridName);
    SetColumnHeader(ExcelGridName, 0);
}
function SaveToMyReports(deleteReport) {
    create_error_elem();

    var isDataValid = true;
    if ($("#Selectquestionsradio").is(":checked") === true)
        isDataValid = ValidateQuestionSelection();

    if (isDataValid) {
        var searchCriteria = GetParameterValues();

        var parameterSet = [
            { ProgramServices: $('#UserProgram').val() },
            { ReportTitle: searchCriteria.ReportTitle },
            { ReportType: searchCriteria.ReportType },
            { OrgCampus: searchCriteria.OrgTypeLevel3IDs },
            { OrgBuilding: searchCriteria.OrgTypeLevel2IDs },
            { OrgDepartment: searchCriteria.OrgTypeLevel1IDs },
            { Orgtypecheckbox: searchCriteria.InActiveOrgTypes },
            { TracerTypeID: searchCriteria.TracerTypeID }
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


        if (searchCriteria.IncludeMinimalDenomValue === true)
            parameterSet.push({ minimaldenomValuebox: searchCriteria.MinimalDenomValue });

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

        if ($('#leastcompliantquestionsradio').is(':checked')) {
            parameterSet.push({ leastcompliantquestionsradio: searchCriteria.TopLeastCompliantQuestions });
            parameterSet.push({ AllQuestionTracerscheckbox: searchCriteria.AllTracers });
            parameterSet.push({ TracersList: searchCriteria.TracerListIDs });
            parameterSet.push({ TracerSectionsList: searchCriteria.TracerSectionListIDs });
        }
        else {
            parameterSet.push({ TracersList: searchCriteria.TracerListIDs });
            parameterSet.push({ TracerSectionsList: searchCriteria.TracerSectionListIDs });
            parameterSet.push({ txtQuestionSearch: searchCriteria.Keyword });
            parameterSet.push({ AllQuestionTracerscheckbox: searchCriteria.AllTracers });
            parameterSet.push({ Selectquestionsradio: searchCriteria.TracerQuestionIDs });
        }

        //Add recurrence fields to the parameter set
        GetRecurrenceParameters(parameterSet);

        //Add date parameters only there is a value
        GetObservationDate(parameterSet, searchCriteria.StartDate, searchCriteria.EndDate);

        //Save the parameters to the database
        SaveSchedule(parameterSet, deleteReport);
    }
    else {
        if (saveRecurrenceScreen == "Recurrence") { OnbtnSearchClick(); }
    }
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

        $('input:radio[id*="leastcompliantquestionsradio"]').prop('checked', true);
        setLeastCompliantQuestion(true);
        if (AllQuestionGrid) {
            $("#AllQuestions").data("kendoGrid").dataSource.data([]);
        }
        $("#divselectedquestionCount").html("0 Questions selected");
        $('#divselectedquestionCount').css("display", "none");

        UpdateTracerListForQuestions();
        clearKendoGrid();
    }

    $('#txtScheduledReportName').val(params.ReportNameOverride);
    $('#txtScheduledReportDesc').val(params.ReportDescription);
    $('input[name=ReportTypeExcel][value="' + getParamValue(params.ReportParameters, "ReportType") + '"]').prop('checked', true);
    if ($('input[name=ReportTypeExcel]:checked').val() == "ExcelView") {
        ExcelGridName = "gridCompDept";
    }
    SetOrgHierarchy(params.ReportParameters);
    SetSavedObservationDate(params.ReportParameters);


    var minDenValue = getParamValue(params.ReportParameters, "minimaldenomValuebox");
    if (minDenValue != null && $.isNumeric(minDenValue)) {
        $('#minimaldenomValuebox').prop('checked', true);
        $('#mindenvalue').data("kendoNumericTextBox").value(minDenValue);
        $('#mindenvalue').data("kendoNumericTextBox").enable(true);
    }
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
    }
    else {
        $("#graphCriteria").hide();
    }
    //Check top least or select questions
    var leastcompliantquestionsradio = getParamValue(params.ReportParameters, "leastcompliantquestionsradio");
    if (leastcompliantquestionsradio != null && leastcompliantquestionsradio != "") {
        $('input:radio[id*="leastcompliantquestionsradio"]').prop('checked', true);
        $("#LeastComplaintQuestions").data("kendoDropDownList").value(leastcompliantquestionsradio);
        $("#TracersList").data("kendoMultiSelect").value(getParamValue(params.ReportParameters, "TracersList").split(","));
        $("#TracerSectionsList").data("kendoMultiSelect").value(getParamValue(params.ReportParameters, "TracerSectionsList").split(","));
        if (getParamValue(params.ReportParameters, "AllQuestionTracerscheckbox") === 'True')
            $('#AllQuestionTracerscheckbox').prop('checked', true);

    }
    else {
        //select questions
        $("#TracersList").data("kendoMultiSelect").value(getParamValue(params.ReportParameters, "TracersList").split(","));
        $("#TracerSectionsList").data("kendoMultiSelect").value(getParamValue(params.ReportParameters, "TracerSectionsList").split(","));
        var Selectquestionsradio = getParamValue(params.ReportParameters, "Selectquestionsradio");
        if (Selectquestionsradio != null && Selectquestionsradio != "") {
            $('input:radio[id*="Selectquestionsradio"]').prop('checked', true);
            setLeastCompliantQuestion(false);
            radioTracersChange();
            savedquestionsid = Selectquestionsradio.toString();
            var txtQuestionSearch = getParamValue(params.ReportParameters, "txtQuestionSearch");
            $("#txtQuestionSearch").val(txtQuestionSearch);
            //AllQuestionTracerscheckbox
            if (getParamValue(params.ReportParameters, "AllQuestionTracerscheckbox") === 'True')
                $('#AllQuestionTracerscheckbox').prop('checked', true);

            checkedIds = {};
            searchQuestionLoad();
            $('#question_content').css("display", "block");
            $(".allselcheckbox").prop('checked', false);
            maxuncheck = true;
            updateSelectedQuestions = true;
            setTimeout(SetSelectedQuestions, 1000, true);
        }
    }

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
function LargeGridResize(e) {
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

        //Apply the height for the content area

        if (count > 5) {
            grid.css('min-height', 300 + header.height());
            contentArea.height(300);
        }
        else {
            if (count < 3) {
                if (count == 1) {
                    grid.css('min-height', (count * 90) + header.height() + 55);
                    contentArea.height((count * 90) + 55);
                }
                else {
                    grid.css('min-height', (count * 60) + header.height() + 60);
                    contentArea.height((count * 60) + 60);
                }
            }
            else {

                grid.css('min-height', (count * 52) + header.height());
                contentArea.height((count * 52));
            }
        }

        var tracerGreaterValue = $("#tracerCompGreaterValue").data("kendoNumericTextBox").value();
        var tracerBetweenLowValue = $("#tracerCompBetweeLowValue").data("kendoNumericTextBox").value();
        var tracerBetweenHighValue = $("#tracerCompBetweeHighValue").data("kendoNumericTextBox").value();
        var tracerLessValue = $("#tracerCompLessValue").data("kendoNumericTextBox").value();
        var dataItems = e.sender.dataSource.data();

        for (var j = 0; j < dataItems.length; j++) {
            var row = e.sender.tbody.find("[data-uid='" + dataItems[j].uid + "']");
            if (($('#tracerCompGreaterChecked').is(':checked') == true) || ($('#tracerCompBetweenChecked').is(':checked') == true) || ($('#tracerCompLessChecked').is(':checked') == true)) {
                var cells = row.children();
                for (var i = 0; i < cells.length; i++) {
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
        var tableWidth = $("#gridDepartment").find(".k-grid-content table").width();
        var columnWidth = $("#gridDepartment").find(".k-grid-content-locked table").width();

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
        lockgrid = $("#gridDepartment").data("kendoGrid");
        lockgrid.resizable.bind("start", function (e) {
            if ($(e.currentTarget).data("th").data("field") == "QuestionText") {
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
function ValidateQuestionSelection(Withemail) {
    var isValid = true;

    var selectedRowsCheck = $(".k-state-selected", "#AllQuestions");
    if (selectedRowsCheck.length == 0) {
        isValid = false;
        if (Withemail == null) {
            $('#showerror_msg').removeClass("alert-info").addClass("alert-danger");
            $('#showerror_msg').css("display", "block");
            $('#show_msg').html("Please select one or more questions");
        }
    }

    return isValid;
}
function leastCompliantRadioselection(TopLeastCompliantQuestions, AllSelectedQuestions) {
    var stringselected = "";

    if (TopLeastCompliantQuestions != "0") {
        if (QuestionID == 0) {
            stringselected = {
                cells: [
               { value: "Top Least Compliant Questions Value" },
               { value: TopLeastCompliantQuestions }
                ]
            }
        } else {
            stringselected = {
                cells: [
                                       { value: "Selected Question" },
                                     { value: QuestionText }
                ]
            }

        }
    }
    else {
        if (QuestionID == 0) {
            stringselected = {
                cells: [
                                       { value: "Selected Questions" },
                                     { value: AllSelectedQuestions }
                ]
            }
        }
        else {
            stringselected = {
                cells: [
                                       { value: "Selected Question" },
                                     { value: QuestionText }
                ]
            }
        }
    }


    return stringselected;

}

function AddExportParameters() {
    var paramsearchset = GetParameterValues();
    var OrgRanking3Nametext = $("#OrgRanking3Name").val() != "" ? $("#OrgRanking3Name").val() + ", " : "";
    var OrgRanking2Nametext = $("#OrgRanking2Name").val() != "" ? $("#OrgRanking2Name").val() + ", " : "";
    var inactivetextparam = "Include Inactive " + OrgRanking3Nametext + OrgRanking2Nametext + "Department.";
    var stringvalue = "";
    var TracerListNames = [];
    var TracerSectionListNames = [];
    var txtQuestionSearch = "";

    var outputExceeMessage = "";
    var backGroundcolor = "";

    if (LimitDepartment > 100) {
        outputExceeMessage = "This output represents total limit of 100 alphabetically sorted departments for the selected department(s)";
        backGroundcolor = "#ff0000";
    }

    txtQuestionSearch = $("#txtQuestionSearch").val();
    $('#TracersList :selected').each(function (i, selected) {

        TracerListNames[i] = $(selected).text();
    });
    $('#TracerSectionsList :selected').each(function (i, selected) {

        TracerSectionListNames[i] = $(selected).text();
    });

    if (paramsearchset.TopLeastCompliantQuestions != "0") {
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
                        leastCompliantRadioselection(paramsearchset.TopLeastCompliantQuestions, paramsearchset.AllSelectedQuestions),
                        {
                            cells: [
                            { value: "Tracer Name" },
                            { value: TracerListNames.toString() }
                            ]
                        },
                        {
                            cells: [
                            { value: "Tracer Section" },
                            { value: TracerSectionListNames.toString() }
                            ]
                        },
                        {
                            cells: [
                            { value: "Across all Tracers" },
                            { value: paramsearchset.AllTracers == true ? "True" : "False" }
                            ]
                        },
                        getTracerTypeExcelExportParameter(),
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
                            { value: "Include minimal total denominator" },
                            { value: paramsearchset.IncludeMinimalDenomValue == true ? "True" : "False" }
                            ]
                        },
                        {
                            cells: [
                            { value: "Minimal total denominator value" },
                            { value: paramsearchset.MinimalDenomValue.toString() }
                            ]
                        },
                        getCompliance1ExcelExportParameter(paramsearchset),
                        getCompliance2ExcelExportParameter(paramsearchset),
                        getCompliance3ExcelExportParameter(paramsearchset),
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
                        leastCompliantRadioselection(paramsearchset.TopLeastCompliantQuestions, paramsearchset.AllSelectedQuestions),
                         {
                             cells: [
                             { value: "Tracer Name" },
                             { value: TracerListNames.toString() }
                             ]
                         },
                         {
                             cells: [
                             { value: "Tracer Section" },
                             { value: TracerSectionListNames.toString() }
                             ]
                         },
                          {
                              cells: [
                              { value: "Keyword" },
                              { value: txtQuestionSearch }
                              ]
                          },
                        {
                            cells: [
                            { value: "Across all Tracers" },
                            { value: paramsearchset.AllTracers == true ? "True" : "False" }
                            ]
                        },
                        getTracerTypeExcelExportParameter(),
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
                            { value: "Include minimal total denominator" },
                            { value: paramsearchset.IncludeMinimalDenomValue == true ? "True" : "False" }
                            ]
                        },
                        {
                            cells: [
                            { value: "Minimal total denominator value" },
                            { value: paramsearchset.MinimalDenomValue.toString() }
                            ]
                        },
                        getCompliance1ExcelExportParameter(paramsearchset),
                        getCompliance2ExcelExportParameter(paramsearchset),
                        getCompliance3ExcelExportParameter(paramsearchset),
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
            var tiebreakerCheck = 0;
            if ($("#leastcompliantquestionsradio").is(":checked")) {
                tiebreakerCheck = $("#LeastComplaintQuestions").data("kendoDropDownList").value();

            }

            if (ExcelGridName == "gridDepartment") {
                // do nothing
            }
            else {
                var tiebreakermsg = "";
                if (tiebreakerCheck != 0 && e.response.Data[e.response.Total - 1].QID > tiebreakerCheck) {

                    if (e.response.Data[e.response.Total - 2].OverallCompliance == e.response.Data[e.response.Total - 1].OverallCompliance) {
                        tiebreakermsg = "Multiple questions found at " + e.response.Data[e.response.Total - 2].OverallCompliance + " % compliance. Questions with higher denominator values are included in the result."
                    }
                }
                LimitDepartment = e.response.Data[e.response.Total - 1].LimitDepartment;
                if (LimitDepartment > 100) {
                    tiebreakermsg = tiebreakermsg + "<br/>This output represents total limit of 100 alphabetically sorted departments for the selected department(s)";
                }
                $("#divtiebreakermessage").html(tiebreakermsg);
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
    //$('.loading').hide();

}