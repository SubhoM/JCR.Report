loadparameters = "TracerDepartmentAssignment";
var TracersListDepartmentUpdate = $("#TracersListDepartmentUpdate").val();
var TracerFrequcyListUpdate = $("#TracerFrequcyListUpdate").val();
var FrequencyIds = "";
var SelectedProgramName = "";
var SelectedProgramID = 0;
var SelectedSiteID = 0;
var isDuplicateLoadCall = false;
var myarray = "";
var groupByTracerDataSource = "";
var groupByTracerAggregateDataSource = "";
var groupByTracerAggregateUrl = $("#GroupByTracerAnalysisData").val();
var datalimitmessageflag = false;
var datalimitmessage = "No details to display for Department Assignment selected.";
var dynamiccolumnNames = "";
var DynamicHeaders = "";
var dynamiccolumns = [];
var subaggregateColumns = [];
var lenOfColumn = "";
var colunmResult = "";
var staticColumnTitle = "";
var colWidth = 0;
//var rowTemplateString = "";
var ExportReportName = "TDS";
var commonTDSGridName = 'gridTracer';
var staticCoulumnCount = 0;
//var localTemplateString = "";
//var localRowTemplateString = "";
var ObjservationColumnName = "";
var localExceedFlag = "";
var localFrequencyName = "";
var groupColumnFieldName = "";
$(document).ready(function () {
    ExcelView = true;
    //set the excel view or not based on radio button chagne
    $("input[name=ReportTypeDepartmentAssignment]:radio").change(function () {
        var reportTypeValue = $('input[name=ReportTypeDepartmentAssignment]:checked').val();
    });

    //Set the default report style selection to Tracer 
    $('input:radio[id="_ReportTypeDepartmentAssignment_Tracer"]').prop("checked", true);
    $('input:radio[name="DateRange"][value="custom"]').prop("checked", true);

    //validation of MyReportName
    $('#txtScheduledReportName').unbind('keyup change input paste').bind('keyup change input paste', function (e) {
        var $this = $(this);
        var val = $this.val();
        var valLength = val.length;
        var maxCount = 50;
        if (valLength > maxCount) {
            $this.val($this.val().substring(0, maxCount));
        }
    });


    // Reset these additional parameters
    $("#resetfiltersbutton").click(function () {
        SetDefaults();
    });

    //Load the saved parameters
    if ($.isNumeric($('#lblReportScheduleID').html())) {
        GetSavedParameters($('#lblReportScheduleID').html());
    }

});

//reset the data.
function SetDefaults() {

    $('#loadDepartmentView').html('');
    $('#gridTracer').html('');
    $('#gridDepartment').html('');
    //Set the default report style selection to Tracer
    $('input:radio[id*="_ReportTypeDepartmentAssignment_Tracer"]').prop('checked', true);

    onInactiveCheckChange();
    $('input:radio[name="DateRange"][value="custom"]').prop("checked", true);
    dateRangeRadioChange();
}
//on tracerepartment screen if frequency change 
function tracerlistTracerDepartmentassignment(e) {


    $.ajax({
        type: "Post",
        url: TracersListDepartmentUpdate,
        data: {
            TracerCategoryIDs: $("#TracersCategory").data("kendoMultiSelect").value().toString(),
            TracerFrequencyIDs: $("#TracersFrequency").data("kendoMultiSelect").value().toString()
        },
        success: function (response) {
            $("#tracerList").html(response);

        }

    });

}

//on tracer category change 
function onCatChange(e) {
    //on categories chagne update the tracers list multiselect .

    $.ajax({
        type: "Get",
        url: TracerFrequcyListUpdate,
        data: { TracerCategoryIDs: $("#TracersCategory").data("kendoMultiSelect").value().toString() },

        success: function (response) {
            $("#tracerFrequency").html(response);
            tracerlistTracerDepartmentUpdate();
        }
    });

}

//on site change frequncy and Tracer name populate 
function TracerDepartmentparameters(siteID, siteName) {

    //get the input avlues from SetSearchCriteria fucntion
    var searchinputset = GetParameterValues();

    //reset the below values to empty as the    
    searchinputset.TracerListIDs = "";
    FrequencyIds = searchinputset.TracerFrequencyIDs;

    loadTracerFreqencyList();

    //tracers list mulitselect update
    tracerlistTracerDepartmentUpdate();

    orgTypeLevelFilter(searchinputset);

    //orglevel1Departmentupdate(searchinputset);
    OrganizationTypeInactiveupdate();

}

//on change sit to load frequcy list
function loadTracerFreqencyList() {
    //on categories chagne update the tracers list multiselect .

    $.ajax({
        type: "Get",
        url: TracerFrequcyListUpdate,
        data: { TracerCategoryIDs: $("#TracersCategory").data("kendoMultiSelect").value().toString() },

        success: function (response) {
            $("#tracerFrequency").html(response);
        }
    });

}

//default frequency all value based on TracerList population.
function tracerlistTracerDepartmentUpdate() {

    $.ajax({
        type: "Get",
        url: TracersListDepartmentUpdate,
        data: {
            TracerCategoryIDs: $("#TracersCategory").data("kendoMultiSelect").value().toString(),
            TracerFrequencyIDs: $("#TracersFrequency").data("kendoMultiSelect").value().toString()
        },
        success: function (response) {
            $("#tracerList").html(response);
        }
    });

}

function orglevel1Departmentupdate(searchinput2) {

    $("#OrgRanking1Name").remove();
    $.ajax({
        type: "Get",
        async: false,
        url: OrganizationTypeListL1Update,
        contentType: "application/json",
        data: JSON.stringify({ search: searchinput2 }),
        success: function (response) {
            $("#tracerorgdepartment").html(response);
        }
    });
    if (PreserveSelectedList) {
        if (deptselectedlist.toString() != "-1" && deptselectedlist.toString() != "") {
            $("#OrgDepartment").data("kendoMultiSelect").value(deptselectedlist);
        }
    }


}

//Save the selected parameters
function SaveToMyReports(deleteReport) {


    var searchset = GetParameterValues();

    var parameterSet = [
        { TracersCategory: searchset.TracerCategoryIDs },
        { ReportGroupByType: searchset.ReportType },
        { ReportTitle: searchset.ReportTitle },
        { ProgramServices: $('#UserProgram').val() },
        { TracersFrequency: searchset.TracerFrequencyIDs },
        { TracersList: searchset.TracerListIDs },
        { OrgCampus: searchset.OrgTypeLevel3IDs },
        { OrgBuilding: searchset.OrgTypeLevel2IDs },
        { OrgDepartment: searchset.OrgTypeLevel1IDs }

    ];

    if (searchset.EndDate == null) {
        $("#ObsEndDate").data("kendoDatePicker").value(moment().format('L'));
        searchset.EndDate = kendo.toString($("#ObsEndDate").data("kendoDatePicker").value(), "yyyy-MM-dd")
    }

    //Set the Report Name
    if (saveRecurrenceScreen != null && saveRecurrenceScreen === "Recurrence") {
        parameterSet.push({ ScheduledReportName: $('#txtScheduledReportName1').val() });
    }
    else {
        parameterSet.push({ ScheduledReportName: $('#txtScheduledReportName').val() });
        $('#txtScheduledReportName1').val($('#txtScheduledReportName').val());
    }

    if (searchset.InActiveOrgTypes === true)
        parameterSet.push({ Orgtypecheckbox: true });

    //Add recurrence fields to the parameter set
    GetRecurrenceParameters(parameterSet);

    //Add date parameters only there is a value
    GetObservationDate(parameterSet, searchset.StartDate, searchset.EndDate);

    //Save the parameters to the database
    SaveSchedule(parameterSet, deleteReport);
}

//Sets the saved parameters for each control
function SetSavedParameters(params) {
    $('#txtScheduledReportName').val(params.ReportNameOverride);
    $('input[name=ReportTypeDepartmentAssignment][value="' + getParamValue(params.ReportParameters, "ReportGroupByType") + '"]').prop('checked', true);
    $("#TracersFrequency").data("kendoMultiSelect").value(getParamValue(params.ReportParameters, "TracersFrequency").split(","));
    $("#TracersList").data("kendoMultiSelect").value(getParamValue(params.ReportParameters, "TracersList").split(","));
    $("#TracersCategory").data("kendoMultiSelect").value(getParamValue(params.ReportParameters, "TracersCategory").split(","));
    SetOrgHierarchy(params.ReportParameters);

    SetSavedObservationDate(params.ReportParameters);

    SetRecurrenceParameters(params);

    TriggerActionByReportMode(params.ReportMode);
}

//Sets the saved observation date in the datepickers
function SetSavedObservationDate(reportParams) {
    var valDateRange = getParamValue(reportParams, "DateRange");
    $('input[name=DateRange]').prop('checked', false);
    if (valDateRange != null) {
        if (valDateRange === 'custom') {
            $('input[name=DateRange][value=custom]').prop('checked', true);
            var startDate = kendo.toString(kendo.parseDate(getParamValue(reportParams, "ObsstartDate")), 'MM/dd/yyyy');
            $("#ObsstartDate").data("kendoDatePicker").value(startDate);

            var endDate = kendo.toString(kendo.parseDate(getParamValue(reportParams, "ObsEndDate")), 'MM/dd/yyyy');
            if (endDate == null) {
                $("#ObsEndDate").data("kendoDatePicker").value(moment().format('L'));
            }
            else {
                $("#ObsEndDate").data("kendoDatePicker").value(endDate);
            }
        }
        else {
            switch (valDateRange) {
                case "last30days":
                    $('input[name=DateRange][value=last30days]').prop('checked', true);
                    break;
                case "last1months": case "lastmonth":
                    $('input[name=DateRange][value=lastmonth]').prop('checked', true);
                    break;
                case "last6months": case "lastsixmonths":
                    $('input[name=DateRange][value=lastsixmonths]').prop('checked', true);
                    break;
                case "last12months":
                    $('input[name=DateRange][value=last12months]').prop('checked', true);
                    break;
                case "last1quarters": case "lastquarter":
                    $('input[name=DateRange][value=lastquarter]').prop('checked', true);
                    break;
                case "custom":
                    $('input[name=DateRange][value=custom]').prop('checked', true);
                    break;
                default:
                    $('input[name=DateRange][value=custom]').prop('checked', true);
            }
            dateRangeRadioChange(valDateRange, true);
        }

    }
}

//Withemail parameter is optional 
function GenerateReport(GenfromSavedFilters, Withemail) {
    dataLimitIssue = false;
    ExcelGenerated = true;
    ExcelGridName = "gridTracer";

    ShowLoader();

    var ChartSearch = GetParameterValues();

    GenerateReportAddCall(ChartSearch);

}

function GenerateReportAddCall(ChartSearch) {



    // reset values
    LevelIdentifier = 1;
    SelectedProgramName = "";
    SelectedProgramID = 0;
    SelectedSiteID = 0;
    ExportReportName = "";
    $('#loadDepartmentView').html('');
    $('#loadDepartmentView').show();
    var searchset =
        {
            FrequencyName: ChartSearch.TracerFrequencyNames.toString(),
            ActiveFrequencyName: ChartSearch.ActiveFrequencyName.toString(),
            TracerCategoryIDs: ChartSearch.TracerCategoryIDs.toString(),
            TracerFrequencyIDs: ChartSearch.TracerFrequencyIDs.toString(),
            ReportType: ChartSearch.ReportType.toString()
        };

    if (($("#TracersFrequency > option").length) == 1) {

        $('#showerror_msg').removeClass("alert-info").addClass("alert-danger");
        $('#showerror_msg').css("display", "block");
        $('#show_msg').html(" No frequency available. Unable to generate report.  ");
        HideLoader();
        return;
    }

    if (ChartSearch.EndDate == null) {
        fromemail = true;
        $("#ObsEndDate").data("kendoDatePicker").value(moment().format('L'));
        ChartSearch.EndDate = kendo.toString($("#ObsEndDate").data("kendoDatePicker").value(), "yyyy-MM-dd")
    }

    if ((ChartSearch.StartDate == null) || (ChartSearch.EndDate == null)) {

        $('#showerror_msg').removeClass("alert-info").addClass("alert-danger");
        $('#showerror_msg').css("display", "block");
        $('#show_msg').html(" Observation Date cannot be blank  ");
        return;
    }

    ChartSearch.ProgramIDs = SelectedProgramID;
    ChartSearch.ProgramNames = SelectedProgramName;
    ChartSearch.IsDuplicateLoadCall = isDuplicateLoadCall;

    $.ajax({
        async: false,
        url: '/Tracer/TracerDepartmentAssignment/LoadDepartmentAssigmentTab',
        dataType: "html",
        data: ChartSearch, //searchset,
        cache: false,
        success: function (data) {
            $('#loadDepartmentView').html(data);

            if ($("#frequencyListDetailsSelect li.active")[0] == null) {
                $('#showerror_msg').removeClass("alert-info").addClass("alert-danger");
                $('#showerror_msg').css("display", "block");
                $('#show_msg').html("No data found matching your criteria. ");
                ExcelGenerated = false;
                return;
            }

            OnLoadAggregatedTracerData(ChartSearch, '', commonTDSGridName);

            HideLoader();
        },
        error: function (response) {
            var err = response;

            HideLoader();
        }
    });
}

//Excel Sheet export
function ERExcelExportByTSData() {

    //$(".loading").show();

    ShowLoader();

    $("#gridTracer").getKendoGrid().saveAsExcel();
    
    //$(".loading").hide();

    HideLoader();

}
function OnLoadAggregatedTracerData(ChartSearch, frequencyName, gridName) {

    ChartSearch.ProgramIDs = SelectedProgramID;
    ChartSearch.ProgramNames = SelectedProgramName;
    ChartSearch.IsDuplicateLoadCall = isDuplicateLoadCall;


    if (gridName == commonTDSGridName) {
        $("#exportoexcelTDS").hide();
        subHeaderTitleDesing(ChartSearch);
        $("#tracerColumnExtendMsg").html('');
    }


    $('#' + gridName).html('');
    $('#' + gridName).show();

    if (frequencyName != '') {
        ChartSearch.ActiveFrequencyName = frequencyName;
    }

    else {
        if ($("#frequencyListDetailsSelect li.active")[0] == null) {
            $("#tracerColumnExtendMsg").html("* not matched frequency * ");
            return;
        }
        else {
            ChartSearch.ActiveFrequencyName = $("#frequencyListDetailsSelect li.active")[0].innerText.trim();
        }
    }
    localExceedFlag = "FALSE";
    localFrequencyName = ChartSearch.ActiveFrequencyName;


    //$(".loading").show();

    ShowLoader();

    $("#recordStatusMsg").html("");
    $("#spanSelParameters10").html("");

    //load the control based on frequency type id.
    $.ajax({

        url: groupByTracerAggregateUrl,
        contentType: 'application/json; charset=utf-8',
        dataType: 'json',
        type: 'POST',
        data: JSON.stringify({ 'search': ChartSearch }),

        success: function (data) {

            //$(".loading").hide();

            HideLoader();

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
                ExportReportName += " by " + ChartSearch.ReportType;

                $("#exportoexcelTDS").show();
                var tracerDepartmentDataSource = JSON.parse(data.outputData);


                //reterive column key names.
                dynamiccolumnNames = _.allKeys(tracerDepartmentDataSource[0]);

                //error message define.
                if (data.ExceedFlag == 'TRUE') {
                    localExceedFlag = "TRUE";
                    $("#spanSelParameters10").html("This output represents total limit of 90 latest data columns for the selected date range");
                }

                //Column Headers Dynamically define
                DynamicHeaders = checkDynamicColumns(dynamiccolumnNames, ChartSearch);

                LoadTracerDepartGridData(tracerDepartmentDataSource, ChartSearch, DynamicHeaders, 'gridTracer');

            }

            else {
                ExcelGenerated = false;
                hasExcelData = false;
                $("#gridTracer").hide();
                $("#recordStatusMsg").html("No data found matching your criteria.");
                return;
            }
        },
        error: function (response) {
            ExcelGenerated = false;
            var err = response;
            //$(".loading").hide();

            HideLoader();
        }
    });


    ScrollToTopCall();

}

function LoadTracerDepartGridData(tracerDepartmentDataSource,
    ChartSearch, dynamicColumnHeaders, gridName) {

    groupColumnFieldName = "";

    switch (ChartSearch.ReportType) {
        case "Tracer":
            groupColumnFieldName = "TracerName";

            break;
        case "Department":
            groupColumnFieldName = "Department";

            break;
    }

    var dataSource1 = new kendo.data.DataSource({
        data: tracerDepartmentDataSource,
        group: { field: groupColumnFieldName, aggregates: subaggregateColumns },
        pageSize: 20,
        aggregate: subaggregateColumns
    });
    //var altRowTemplateString = rowTemplateString.replace('tr class="', 'tr class="k-alt ');
    $("#" + gridName).kendoGrid({

        dataSource: dataSource1,
        pageable: {
            refresh: true,
            pageSizes: [20, 50, 100]
        },
        dataBound: LargeGridResize,
        columns: dynamicColumnHeaders,
        resizable: true,
        sortable: true,
        groupable: true,
        selectable: true,
        excel: { allPages: true },
        excelExport: ERexcelExportTDS
        //,
        //altRowTemplate: altRowTemplateString, rowTemplate: rowTemplateString
    });

    dataSource1.read();

    var grid = $("#" + gridName).getKendoGrid();
    if (grid != null) {
        var table = grid._isLocked() ? grid.lockedTable : grid.table;

        table.on('click.kendoGrid', '.k-grouping-row .k-i-collapse, .k-grouping-row .k-i-expand', myGroupableClickHandler);
    }


}


function myGroupableClickHandler(e) {

    var expand = $(this)[0].className.indexOf("collapse") != -1 ? true : false;

    if (expand)
        $(this).closest("tr").nextUntil('tr.k-grouping-row').css("display", "table-row");
    else
        $(this).closest("tr").nextUntil('tr.k-grouping-row').css("display", "none");


}


function dateRangeRadioChange(selectedObservationValue, isRecurrenceSave) {
    var StartDateCtrl = $("#ObsstartDate").data("kendoDatePicker");
    var EndDateCtrl = $("#ObsEndDate").data("kendoDatePicker");
    var dateRangeselected = $('input[name=DateRange]:checked').val();
    if (dateRangeselected != null && (typeof isRecurrenceSave === 'undefined')) {
        switch (dateRangeselected) {
            case "last30days":
                StartDateCtrl.value(moment().subtract(30, 'days').format('L'));
                EndDateCtrl.value(moment().subtract(1, 'days').format('L'));
                break;
            case "lastmonth":
                StartDateCtrl.value(moment().subtract(1, 'months').startOf('month').format('L'));
                EndDateCtrl.value(moment().subtract(1, 'months').endOf('month').format('L'));
                break;
            case "lastquarter":
                StartDateCtrl.value(moment().subtract(1, 'quarters').startOf('quarter').format('L'));
                EndDateCtrl.value(moment().subtract(1, 'quarters').endOf('quarter').format('L'));
                break;
            case "lastsixmonths":
                StartDateCtrl.value(moment().subtract(6, 'months').startOf('month').format('L'));
                EndDateCtrl.value(moment().subtract(1, 'months').endOf('month').format('L'));
                break;
            case "last12months":
                StartDateCtrl.value(moment().subtract(12, 'months').startOf('month').format('L'));
                EndDateCtrl.value(moment().subtract(1, 'months').endOf('month').format('L'));
                break;
            case "custom":
                StartDateCtrl.value(moment().subtract(1, 'years').format('L'));
                EndDateCtrl.value(moment().format('L'));
        }
    }
    else {
        if (selectedObservationValue != null) {
            var observationDate = selectedObservationValue.toString();
            var observationValue = observationDate.split(",");
            var dateValue = observationValue[0];
            var dayValue = observationValue[1];
            if (dateValue != "0") {
                if (observationDate.indexOf(',') > -1) {
                    if (dateValue != "") {
                        StartDateCtrl.value(moment().subtract(dateValue, dayValue).startOf(dayValue).format('L'));
                        EndDateCtrl.value(moment().subtract(1, dayValue).endOf(dayValue).format('L'));
                    }
                    else {
                        $("#ObsstartDate").data("kendoDatePicker").value("");
                        $("#ObsEndDate").data("kendoDatePicker").value("");
                    }
                }
                else {
                    switch (selectedObservationValue) {
                        case "last30days":
                            StartDateCtrl.value(moment().subtract(30, 'days').format('L'));
                            EndDateCtrl.value(moment().subtract(1, 'days').format('L'));
                            break;
                        case "lastmonth":
                            StartDateCtrl.value(moment().subtract(1, 'months').startOf('month').format('L'));
                            EndDateCtrl.value(moment().subtract(1, 'months').endOf('month').format('L'));
                            break;
                        case "lastquarter":
                            StartDateCtrl.value(moment().subtract(1, 'quarters').startOf('quarter').format('L'));
                            EndDateCtrl.value(moment().subtract(1, 'quarters').endOf('quarter').format('L'));
                            break;
                        case "lastsixmonths":
                            StartDateCtrl.value(moment().subtract(6, 'months').startOf('month').format('L'));
                            EndDateCtrl.value(moment().subtract(1, 'months').endOf('month').format('L'));
                            break;
                        case "last12months":
                            StartDateCtrl.value(moment().subtract(12, 'months').startOf('month').format('L'));
                            EndDateCtrl.value(moment().subtract(1, 'months').endOf('month').format('L'));
                            break;
                        default:
                            var observationDateValue = selectedObservationValue.toString();
                            var frequencyValue = observationDateValue.split(/\d+/g);
                            var dateValue = observationDateValue.match(/\d+/g).toString();
                            var dayValue = frequencyValue[1].toString();
                            StartDateCtrl.value(moment().subtract(dateValue, dayValue).startOf(dayValue).format('L'));
                            EndDateCtrl.value(moment().subtract(1, dayValue).endOf(dayValue).format('L'));
                    }
                }
            }
            else {
                $('input[name=DateRange]').prop('checked', false);
                $("#ObsstartDate").data("kendoDatePicker").value("");
                $("#ObsEndDate").data("kendoDatePicker").value("");
            }
        }
    }
}


//group status verification Level 2 and Leve 3
var checkDynamicColumns = function (dynamiccolumnNames, ChartSearch) {

    dynamiccolumns = [];

    var arrayLength = dynamiccolumnNames.length;
    var splitChar;
    var fromDate;
    var fromValue;
    var toDate;
    var toValue;


    lenOfColumn = "";
    colunmResult = "";
    staticColumnTitle = "";
    colWidth = 0;
    //localTemplateString = "";
    //localRowTemplateString = '<tr><td></td>';
    //rowTemplateString = "";
    subaggregateColumns = [];
    staticCoulumnCount = 0;
    for (var i = 0; i < arrayLength; i++) {

        lenOfColumn = "";
        colunmResult = "";
        staticColumnTitle = "";
        colWidth = 0;
        //localTemplateString = "";


        switch (ChartSearch.ActiveFrequencyName.toString().trim()) {
            case "Daily":
                colWidth = 80;
                lenOfColumn = dynamiccolumnNames[i].indexOf("DayOf");
                if (lenOfColumn >= 0) {
                    colunmResult = dynamiccolumnNames[i].substring(lenOfColumn + 9, dynamiccolumnNames[i].length - 2) + '/' +
                        dynamiccolumnNames[i].substring(lenOfColumn + 11, dynamiccolumnNames[i].length) + '/' +
                        dynamiccolumnNames[i].substring(lenOfColumn + 5, dynamiccolumnNames[i].length - 4);

                    dynamiccolumns.push({
                        field: dynamiccolumnNames[i],
                        width: colWidth,
                        title: colunmResult,
                        groupable: false,
                        footerTemplate: "<div style='text-align:right'>#= (sum == null) ? '' : kendo.parseInt(sum) #</div>",
                        groupFooterTemplate: "<div style='text-align:right'>#= (sum == null) ? '' : kendo.parseInt(sum) #</div>"
                    });



                    //localTemplateString = "<td class= #: (" + dynamiccolumnNames[i] + " == null) ? " + " ' ' " + " : "
                    //    + "getActualObservationCountClass(" + ObjservationColumnName + ", kendo.parseInt(" +
                    //  dynamiccolumnNames[i] + "))#> #:" + dynamiccolumnNames[i] + "#</td>";



                    subaggregateColumns.push({
                        field: dynamiccolumnNames[i],
                        aggregate: "sum"
                    });

                }
                else {
                    staticColumnDesign(dynamiccolumnNames[i], ChartSearch);

                }

                //localRowTemplateString = localRowTemplateString + localTemplateString;

                break;
            case "Weekly":
                colWidth = 125;
                lenOfColumn = dynamiccolumnNames[i].indexOf("WeekOf");
                if (lenOfColumn >= 0) {
                    colunmResult = dynamiccolumnNames[i].substring(lenOfColumn + 10, dynamiccolumnNames[i].length - 2) + '/' +
                        dynamiccolumnNames[i].substring(lenOfColumn + 12, dynamiccolumnNames[i].length) + '/' +
                        dynamiccolumnNames[i].substring(lenOfColumn + 8, dynamiccolumnNames[i].length - 4);

                    dynamiccolumns.push({
                        field: dynamiccolumnNames[i],
                        width: colWidth,
                        encoded: false,
                        groupable: false,
                        title: 'Week Of <br>' + colunmResult,
                        footerTemplate: "<div style='text-align:right'>#= (sum == null) ? '' : kendo.parseInt(sum) #</div>",
                        groupFooterTemplate: "<div style='text-align:right'>#= (sum == null) ? '' : kendo.parseInt(sum) #</div>"
                    });


                    //localTemplateString = "<td class= #: (" + dynamiccolumnNames[i] + " == null) ? " + " ' ' " + " : "
                    //    + "getActualObservationCountClass(" + ObjservationColumnName + ", kendo.parseInt(" +
                    //  dynamiccolumnNames[i] + "))#> #:" + dynamiccolumnNames[i] + "#</td>";

                    subaggregateColumns.push({
                        field: dynamiccolumnNames[i],
                        aggregate: "sum"
                    });
                }
                else {
                    staticColumnDesign(dynamiccolumnNames[i], ChartSearch);

                }
                //localRowTemplateString = localRowTemplateString + localTemplateString;
                break;
            case "Monthly":
                colWidth = 60;
                lenOfColumn = dynamiccolumnNames[i].indexOf("MonthOf");
                if (lenOfColumn >= 0) {
                    colunmResult = dynamiccolumnNames[i].substring(lenOfColumn + 7, dynamiccolumnNames[i].length - 2) + '-' +
                        dynamiccolumnNames[i].substring(lenOfColumn + 10, dynamiccolumnNames[i].length);

                    dynamiccolumns.push({
                        field: dynamiccolumnNames[i],
                        width: colWidth,
                        title: colunmResult,
                        groupable: false,
                        footerTemplate: "<div style='text-align:right'>#= (sum == null) ? '' : kendo.parseInt(sum) #</div>",
                        groupFooterTemplate: "<div style='text-align:right'>#= (sum == null) ? '' : kendo.parseInt(sum) #</div>"
                    });

                    //localTemplateString = "<td class= #: (" + dynamiccolumnNames[i] + " == null) ? " + " ' ' " + " : "
                    //      + "getActualObservationCountClass(" + ObjservationColumnName + ", kendo.parseInt(" +
                    //    dynamiccolumnNames[i] + "))#> #:" + dynamiccolumnNames[i] + "#</td>";


                    subaggregateColumns.push({
                        field: dynamiccolumnNames[i],
                        aggregate: "sum"
                    });

                }
                else {
                    staticColumnDesign(dynamiccolumnNames[i], ChartSearch);

                }
                //localRowTemplateString = localRowTemplateString + localTemplateString;
                break;
            case "Quarterly":
                colWidth = 75;
                lenOfColumn = dynamiccolumnNames[i].indexOf("Q");
                if (lenOfColumn >= 0) {
                    colunmResult = dynamiccolumnNames[i].substring(lenOfColumn, 2) + "-" + dynamiccolumnNames[i].substring(lenOfColumn + 2,
                        dynamiccolumnNames[i].length)
                    dynamiccolumns.push({
                        field: dynamiccolumnNames[i],
                        width: colWidth,
                        title: colunmResult,
                        groupable: false,
                        footerTemplate: "<div style='text-align:right'>#= (sum == null) ? '' : kendo.parseInt(sum) #</div>",
                        groupFooterTemplate: "<div style='text-align:right'>#= (sum == null) ? '' : kendo.parseInt(sum) #</div>"
                    });

                    //localTemplateString = "<td class= #: (" + dynamiccolumnNames[i] + " == null) ? " + " ' ' " + " : "
                    //         + "getActualObservationCountClass(" + ObjservationColumnName + ", kendo.parseInt(" +
                    //       dynamiccolumnNames[i] + "))#> #:" + dynamiccolumnNames[i] + "#</td>";


                    subaggregateColumns.push({
                        field: dynamiccolumnNames[i],
                        aggregate: "sum"
                    });
                }

                else {
                    staticColumnDesign(dynamiccolumnNames[i], ChartSearch);

                }
                //localRowTemplateString = localRowTemplateString + localTemplateString;
                break;
            case "Semi-Annually":
                colWidth = 130;
                lenOfColumn = dynamiccolumnNames[i].indexOf("SA");
                if (lenOfColumn >= 0) {

                    splitChar = dynamiccolumnNames[i].indexOf("_");

                    fromDate = dynamiccolumnNames[i].substring(lenOfColumn + 2, splitChar);

                    fromValue = fromDate.substring(4, fromDate.length - 2)
                        + '/' + fromDate.substring(6, fromDate.length) + '/' + fromDate.substring(2, fromDate.length - 4) + ' - ';

                    toDate = dynamiccolumnNames[i].substring(splitChar + 1, dynamiccolumnNames[i].length);

                    toValue = toDate.substring(4, toDate.length - 2) + '/' + toDate.substring(6, toDate.length) + '/' +
                        toDate.substring(2, toDate.length - 4);

                    dynamiccolumns.push({
                        field: dynamiccolumnNames[i],
                        width: colWidth,
                        title: (fromValue + toValue),
                        groupable: false,
                        footerTemplate: "<div style='text-align:right'>#= (sum == null) ? '' : kendo.parseInt(sum) #</div>",
                        groupFooterTemplate: "<div style='text-align:right'>#= (sum == null) ? '' : kendo.parseInt(sum) #</div>"
                    });

                    //localTemplateString = "<td class= #: (" + dynamiccolumnNames[i] + " == null) ? " + " ' ' " + " : "
                    //     + "getActualObservationCountClass(" + ObjservationColumnName + ", kendo.parseInt(" +
                    //   dynamiccolumnNames[i] + "))#> #:" + dynamiccolumnNames[i] + "#</td>";


                    subaggregateColumns.push({
                        field: dynamiccolumnNames[i],
                        aggregate: "sum"
                    });

                }
                else {
                    staticColumnDesign(dynamiccolumnNames[i], ChartSearch);

                }
                //localRowTemplateString = localRowTemplateString + localTemplateString;
                break;


            case "Annually":

                colWidth = 85;
                lenOfColumn = dynamiccolumnNames[i].indexOf("Year_");
                if (lenOfColumn >= 0) {
                    colunmResult = 'Year' + ' ' + dynamiccolumnNames[i].substring(lenOfColumn + 5, dynamiccolumnNames[i].length);

                    dynamiccolumns.push({
                        field: dynamiccolumnNames[i],
                        width: colWidth,
                        title: colunmResult,
                        groupable: false,
                        footerTemplate: "<div style='text-align:right'>#= (sum == null) ? '' : kendo.parseInt(sum) #</div>",
                        groupFooterTemplate: "<div style='text-align:right'>#= (sum == null) ? '' : kendo.parseInt(sum) #</div>"
                    });

                    //localTemplateString = "<td class= #: (" + dynamiccolumnNames[i] + " == null) ? " + " ' ' " + " : "
                    //     + "getActualObservationCountClass(" + ObjservationColumnName + ", kendo.parseInt(" +
                    //   dynamiccolumnNames[i] + "))#> #:" + dynamiccolumnNames[i] + "#</td>";

                    subaggregateColumns.push({
                        field: dynamiccolumnNames[i],
                        aggregate: "sum"
                    });
                }
                else {
                    staticColumnDesign(dynamiccolumnNames[i], ChartSearch);

                }
                //localRowTemplateString = localRowTemplateString + localTemplateString;
                break;

        }

    }

    //rowTemplateString = localRowTemplateString + '</tr>';

    return dynamiccolumns;
}

function staticColumnDesign(databaseColumnName, ChartSearch) {
    staticColumnTitle = "";
    colWidth = 0;
    var subGroupHeader = "";
    var enCodeString = '';
    groupColumnFieldName = "";
    switch (ChartSearch.ReportType) {
        case "Tracer":
            groupColumnFieldName = "Tracer: ";
            break;
        case "Department":
            groupColumnFieldName = "Department: ";
            break;
    }

    if ((databaseColumnName.indexOf("Department")) >= 0) { return; };
    //if ((databaseColumnName.indexOf("ResponsiblePersonName")) >= 0) { return; };

    switch (databaseColumnName) {
        //case "ResponsiblePersonName":
        //    staticColumnTitle = "Person(s) Responsible";
        //    colWidth = 175;
        //    enCodeString = 'false';
        //    staticCoulumnCount = staticCoulumnCount + 1;
        //    break;
        case "OrgName_Rank1_Dept":
            staticColumnTitle = "Department";
            subGroupHeader = "Count:"
            colWidth = 170;
            staticCoulumnCount = staticCoulumnCount + 1;
            break;
        case "OrgName_Rank2":
            staticColumnTitle = $("#OrgRanking2Name").val();
            colWidth = 120;
            if (staticColumnTitle != "") {
                staticCoulumnCount = staticCoulumnCount + 1;
            }
            break;
        case "OrgName_Rank3":
            staticColumnTitle = $("#OrgRanking3Name").val();
            colWidth = 120;
            if (staticColumnTitle != "") {
                staticCoulumnCount = staticCoulumnCount + 1;
            }
            break;
        case "TracerName":
            staticColumnTitle = "Tracer Name";
            colWidth = 140;
            staticCoulumnCount = staticCoulumnCount + 1;
            break;
        case "ExpectedObsCt":
            staticColumnTitle = "Expected Obs Ct";
            colWidth = 115;
            ObjservationColumnName = databaseColumnName;
            enCodeString = 'false';
            staticCoulumnCount = staticCoulumnCount + 1;
            break;
        default:
            staticColumnTitle = databaseColumnName;
            colWidth = 160;
            staticCoulumnCount = staticCoulumnCount + 1;
            break;
    }
    if (staticColumnTitle == "") { return; }
    if (enCodeString == 'false') {
        dynamiccolumns.push({
            field: databaseColumnName,
            width: colWidth,
            title: staticColumnTitle,
            encoded: false,
            groupable: false,
            locked: true,
            groupFooterTemplate: "Count:",
            footerTemplate: "Total Count:"
            , groupHeaderTemplate: groupColumnFieldName + '#= value #'
        });
        //localTemplateString = '<td>#= ' + databaseColumnName + ' #</td>';
    }
    else {
        //localTemplateString = '<td>#= ' + databaseColumnName + ' #</td>';
        dynamiccolumns.push({
            field: databaseColumnName,
            width: colWidth,
            title: staticColumnTitle,
            locked: true
            , groupable: false
        });


    }
    return true;
}

function removecommaOrgName(OrgNamedisplay) {

    var orgName = "";



    var indexStart = _.indexOf(OrgNamedisplay, ",");

    orgName = setCharAt(OrgNamedisplay, indexStart, ' ');
    return orgName;
}
function setCharAt(str, index, chr) {
    if (index > str.length - 1) return str;
    return str.substr(0, index) + chr + str.substr(index + 1);
}

function subHeaderTitleDesing(ChartSearch) {

    var OrgNamedisplay = "";


    $("#spanSelParameters2").html("    " + $('#UserSiteName').val());

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

    $("#spanSelParameters4").html("Frequency: " + ChartSearch.TracerFrequencyNames);
    $("#spanSelParameters5").html("Group by: " + ChartSearch.ReportType);
    $("#spanSelParameters6").html("Program: " + $('#UserProgramName').val());
    $("#spanSelParameters7").html("Tracers: " + ChartSearch.TracerNames);
    if ($("#OrgRanking3Name").val() != '') {
        OrgNamedisplay = $("#OrgRanking3Name").val() + ": " + ChartSearch.OrgTypeLevel3Names;
    }
    if ($("#OrgRanking2Name").val() != '') {
        if (OrgNamedisplay != '')
        { OrgNamedisplay = OrgNamedisplay + " " + $("#OrgRanking2Name").val() + ": " + ChartSearch.OrgTypeLevel2Names; }
        else {
            OrgNamedisplay = $("#OrgRanking2Name").val() + ": " + ChartSearch.OrgTypeLevel2Names;
        }

    }
    if ($("#OrgRanking1Name").val() != '') {
        OrgNamedisplay = OrgNamedisplay + " " + $("#OrgRanking1Name").val() + ": " + ChartSearch.OrgTypeLevel1Names;
    }

    $("#spanSelParameters8").html(OrgNamedisplay);

    if ($('#Orgtypecheckbox').is(':checked') === true) {
        $("#spanSelParameters9").html(ChartSearch.OrgInactiveNames);
    }



}

function onDepartAssignmentMenuItemSelect(frequencyName) {

    event.preventDefault();
    event.stopPropagation();


    $("li[role='presentation']").each(
        function (index) {
            $(this).removeClass('active');
        });



    var ChartSearch = GetParameterValues();
    ChartSearch.ActiveFrequencyName = frequencyName;


    OnLoadAggregatedTracerData(ChartSearch, frequencyName, commonTDSGridName);

    $('#' + frequencyName).addClass('active');

    return false;
}



function GetParameterValues() {
    var ActiveFrequencyName = "";
    var TopLeastCompliantQuestions = "";
    var SelectedQuestions = "";
    var AllTracersMode = false;
    var TracerIDs = [];
    var TracerFrequencyIDs = [];
    var TracerFrequencyNames = [];

    var QuestionIDs = [];
    var TracerListIDs = [];
    var TracerNames = [];
    var Keyword = "";
    var OrgInactiveNames = "";
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



    $('#TracersList :selected').each(function (i, selected) {
        TracerListIDs[i] = $(selected).val();
        TracerNames[i] = $(selected).text();
    });
    if (TracerListIDs.length <= 0) {
        TracerListIDs.push(defaultValue);
        TracerNames.push(defaultText);
    }


    $('#TracersFrequency :selected').each(function (i, selected) {
        TracerFrequencyIDs[i] = $(selected).val();
        TracerFrequencyNames[i] = $(selected).text();

    });
    if (TracerFrequencyIDs.length <= 0) {
        TracerFrequencyIDs.push(defaultValue);
        TracerFrequencyNames.push(defaultText);

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



    if ($('#Orgtypecheckbox').is(':checked') === true) {
        OrgInactiveNames = "Including Inactive ";
    }
    else {
        OrgInactiveNames = "  ";
    }

    if ($("#OrgRanking3Name") != null) {
        OrgInactiveNames = OrgInactiveNames + $("#OrgRanking3Name").val();
    }
    if ($("#OrgRanking2Name") != null) {
        OrgInactiveNames = OrgInactiveNames + ", " + $("#OrgRanking2Name").val();
    }
    if ($("#OrgRanking1Name") != null) {
        OrgInactiveNames = OrgInactiveNames + ", " + $("#OrgRanking1Name").val();
    }
    myarray = [];

    var selectIndex;
    if (TracerFrequencyIDs.toString() != "-1") {
        myarray = TracerFrequencyIDs.toString().split(',');
    }
    else {
        $('#TracersFrequency > option').each(function () {
            if ($(this).val() != -1)
                myarray.push($(this).val());
        });

    }




    selectIndex = _.min(myarray);
    if (selectIndex == "-1") { selectIndex = 0; } else { selectIndex = parseInt(selectIndex) - 1; }



    switch (selectIndex) {
        case 0:
            ActiveFrequencyName = "Daily";
            break;
        case 1:
            ActiveFrequencyName = "Weekly";
            break;
        case 2:
            ActiveFrequencyName = "Monthly";
            break;
        case 3:
            ActiveFrequencyName = "Quarterly";
            break;
        case 4:
            ActiveFrequencyName = "Semi-Annually";
            break;
        case 5:
            ActiveFrequencyName = "Annually";
            break;
    }

    var searchset =
        {
            TracerCategoryIDs: TracerCategoryIDs.toString(),
            TracerCategoryNames: ConvertToAllOrCSV(TracerCategoryNames),
            TracerNames: ConvertToAllOrCSV(TracerNames),
            ActiveFrequencyName: ActiveFrequencyName.toString(),
            OrgInactiveNames: OrgInactiveNames.toString(),
            TracerListIDs: TracerListIDs.toString(),
            OrgTypeLevel1IDs: OrgTypeLevel1IDs.toString(),
            OrgTypeLevel1Names: ConvertToAllOrCSV(OrgTypeLevel1Names),
            OrgTypeLevel2IDs: OrgTypeLevel2IDs.toString(),
            OrgTypeLevel2Names: ConvertToAllOrCSV(OrgTypeLevel2Names),
            OrgTypeLevel3IDs: OrgTypeLevel3IDs.toString(),
            OrgTypeLevel3Names: ConvertToAllOrCSV(OrgTypeLevel3Names),
            TracerFrequencyIDs: TracerFrequencyIDs.toString(),
            InActiveOrgTypes: $('#Orgtypecheckbox').is(':checked'),
            StartDate: kendo.toString($("#ObsstartDate").data("kendoDatePicker").value(), "yyyy-MM-dd"),
            EndDate: kendo.toString($("#ObsEndDate").data("kendoDatePicker").value(), "yyyy-MM-dd"),
            ReportTitle: $('#hdnReportTitle').val(),
            ReportType: $('input[name=ReportTypeDepartmentAssignment]:checked').val(),
            AllTracers: AllTracersMode,
            TracerFrequencyNames: ConvertToAllOrCSV(TracerFrequencyNames)

        }


    return searchset;
}

function SetSearchCriteria(GenfromSavedFilters) {

    //clearallmultiselectsearch();

    //only for rdlc GenfromSavedFilters is set to true only from email button
    //layout.js file common code
    return SearchSetFilterData(GenfromSavedFilters, GetParameterValues());
}
function additionalData(e) {

    return { search: SetSearchCriteria(false) }
}

function getActualObservationCountClass(expectedCount, actualObjservationCount) {

    if (actualObjservationCount < expectedCount) {
        return "TDSRedColor";
    }
    else {
        return "";
    }
}

function stripHTML(html) {
    var tmp = document.createElement("DIV");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
}

function ERexcelExportTDS(e) {

    //blockElement("divL1tag");

    e.preventDefault();
    var sheets = [
        e.workbook.sheets[0], AddExportParameters()

    ];
    sheets[0].title = localFrequencyName;
    sheets[1].title = "Report Selections";

    var rows = e.workbook.sheets[0].rows;


    for (var ri = 0; ri < rows.length; ri++) {
        var row = rows[ri];

        for (var ci = 0; ci < row.cells.length; ci++) {
            var cell = row.cells[ci];

            if (cell.value && typeof (cell.value) === "string" && cell.value.length > 10) {
                // Use jQuery.fn.text to remove the HTML and get only the text                
                cell.value = stripHTML(cell.value);
            }
            if (row.type == "data") {
                if (ci >= staticCoulumnCount) {
                    if (getActualObservationCountClass(row.cells[1].value, row.cells[ci].value) != "")
                        row.cells[ci].background = "#ff0000";
                }
            }
            if (row.type == "group-footer" || row.type == "footer") {
                cell.hAlign = "right";
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
            fileName: $("#ReportTitle").html() + GetReportDateAdder() + ".xlsx",
            forceProxy: false,
            proxyURL: '/Export/Excel_Export_Save'
        })


    }
    //unBlockElement("divL1tag");
}

function AddExportParameters() {

    var OrgRanking3Nametext = $("#OrgRanking3Name").val() != "" ? $("#OrgRanking3Name").val() + ", " : "";
    var OrgRanking2Nametext = $("#OrgRanking2Name").val() != "" ? $("#OrgRanking2Name").val() + ", " : "";
    var inactivetextparam = "Include Inactive " + OrgRanking3Nametext + OrgRanking2Nametext + "Department.";

    var ChartSearch = GetParameterValues();

    var outputExceeMessage = "", backGroundcolor = "";

    if (localExceedFlag == 'TRUE') {
        outputExceeMessage = "*This output represents total limit of 90 latest data columns for the selected date range";
        backGroundcolor = "#ff0000";

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
                    { value: "Site " },
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
                    { value: "Tracer Category" },
                    { value: ChartSearch.TracerCategoryNames }
                ]
            },
            {
                cells: [
                    { value: "Tracer Name" },
                    { value: ChartSearch.TracerNames }
                ]
            },
            {
                cells: [
                    { value: "Tracer Frequency" },
                    { value: ChartSearch.TracerFrequencyNames }
                ]
            },
            {
                cells: [
                    { value: "Group By" },
                    { value: ChartSearch.ReportType }
                ]
            },
            {
                cells: [
                    { value: "Start Date" },
                    { value: ChartSearch.StartDate }
                ]
            },
            {
                cells: [
                    { value: "End Date" },
                    { value: ChartSearch.EndDate }
                ]
            },
            {
                cells: [
                    { value: inactivetextparam },
                    { value: ChartSearch.InActiveOrgTypes == true ? "True" : "False" }
                ]
            },
            {
                cells: [
                    { value: "Department" },
                    { value: ChartSearch.OrgTypeLevel1Names }
                ]
            },
            {
                cells: [
                    { value: $("#OrgRanking2Name").val() },
                    { value: $("#OrgRanking2Name").val() != "" ? ChartSearch.OrgTypeLevel2Names : "" }
                ]
            },
            {
                cells: [
                    { value: $("#OrgRanking3Name").val() },
                    { value: $("#OrgRanking3Name").val() != "" ? ChartSearch.OrgTypeLevel3Names : "" }
                ]
            },
            {
                cells: [
                    { value: outputExceeMessage, color: backGroundcolor }

                ]
            }

        ]
    }
    return stringvalue;

}

function LargeGridResize(e) {
    var gridID = '';
    if (e.sender && e.sender.wrapper && e.sender.wrapper.length > 0)
        gridID = e.sender.wrapper[0].id;

    if (gridID != null && gridID != '') {

        var grid = $("#" + gridID);
        var footer = grid.find(".k-grid-footer");
        var header = grid.find(".k-grid-header");

        var groupingHeader = grid.find('.k-grouping-header');
        groupingHeader.addClass('k-state-disabled');
        groupingHeader.unbind();

        var groupingHeader = grid.find('.k-grouping-header');
        groupingHeader.addClass('k-state-disabled');
        groupingHeader.unbind();

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
        $('#CorpLayOutFooter').attr("style", "top: auto; position: relative;");

        var dataItems = e.sender.dataSource.data();
        for (var j = 0; j < dataItems.length; j++) {
            var expCount = dataItems[j]["ExpectedObsCt"];

            var row = e.sender.tbody.find("[data-uid='" + dataItems[j].uid + "']");

            var cells = row.children();
            for (var i = 0; i < cells.length; i++) {
                var cell = cells[i];
                cell.style.textAlign = "right";
                var actualObsCount = cell.textContent;
                if (parseInt(actualObsCount) < expCount) {
                    cell.style.backgroundColor = "red";
                }
            }
        }
        //Horizontal Top Scroll
        //Synced up with horizontal bottom scroll
        var dataDivHeader = e.sender.wrapper.children(".k-grid-header");
        var dataDiv = e.sender.wrapper.children(".k-grid-content");

        e.sender.wrapper.children(".topScroll").remove();

        var scrollWidth = kendo.support.scrollbar();
        var tableWidth = $("#gridTracer").find(".k-grid-content table").width();
        var columnWidth = $("#gridTracer").find(".k-grid-content-locked table").width();

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
    setTimeout(function () {
        //get the indicator header
        var groupIndicatorHeader = $('.k-group-indicator').parent();
        if (!groupIndicatorHeader) return;
        //check if it is draggable eneabled
        var kendoDraggableObj = $(groupIndicatorHeader).data('kendoDraggable');
        if (kendoDraggableObj) kendoDraggableObj.destroy();
    }, 0);

}

