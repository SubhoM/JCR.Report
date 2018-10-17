loadparameters = "MonthlyTracerBreakdown";
ExcelView = true;

hasExcelSecondGrid = true;
ExcelSecondGridName = "chartMTB";
hasChart = true;
var isGridLoaded = false;

//Get URLS from hidden fields

ExcelGridName = "gridMTB";
var ResetFilters = $("#GetResetLink").val();
var GetRDLC = $("#GetRDLC").val();
var GetChart = $('#GetChart').val();

function additionalData(e) {

    return { search: SetSearchCriteria(false) }
}

function GetParameterValues()
{
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

    var StartDateCtrl = $("#ObsstartDate").data("kendoDatePicker");
    var EndDateCtrl = $("#ObsEndDate").data("kendoDatePicker");

    if (kendo.toString(EndDateCtrl.value(), "yyyy-MM-dd") === null) {
        EndDateCtrl.value(moment().format('L'));
    }

    if (kendo.toString(StartDateCtrl.value(), "yyyy-MM-dd") === null) {
        StartDateCtrl.value(moment().subtract(12, 'months').format('L'));
    }

    var searchset =
    {
        TracerCategoryIDs: TracerCategoryIDs.toString(),
        TracerCategoryNames: ConvertToAllOrCSV(TracerCategoryNames),
        TracerListIDs: TracerListIDs.toString(),
        TracerListNames: ConvertToAllOrCSV(TracerListNames),
        OrgTypeLevel1IDs: OrgTypeLevel1IDs.toString(),
        OrgTypeLevel1Names: ConvertToAllOrCSV(OrgTypeLevel1Names),
        OrgTypeLevel2IDs: OrgTypeLevel2IDs.toString(),
        OrgTypeLevel2Names: ConvertToAllOrCSV(OrgTypeLevel2Names),
        OrgTypeLevel3IDs: OrgTypeLevel3IDs.toString(),
        OrgTypeLevel3Names: ConvertToAllOrCSV(OrgTypeLevel3Names),
        InActiveOrgTypes: $('#Orgtypecheckbox').is(':checked'),
        StartDate: kendo.toString($("#ObsstartDate").data("kendoDatePicker").value(), "yyyy-MM-dd"),
        EndDate: kendo.toString($("#ObsEndDate").data("kendoDatePicker").value(), "yyyy-MM-dd"),
        ReportType: $('input[name=ReportType]:checked').val(),
        ReportTitle: $('#hdnReportTitle').val(),
        IncludeMinimalDenomValue: $('#minimaldenomValuebox').is(':checked'),
        MinimalDenomValue: $("#mindenvalue").data("kendoNumericTextBox").value(),
        MonthlyReportType: "Tracer"

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
    dataLimitIssue = false;
    hasExcelData = true;
    isGridLoaded = false;


    $('#loadAview').html('');
    $('#loadChartView').html('');
    $("#loadAview").hide();
    $("#loadChartView").show();

    //$(".loading").show();

    ShowLoader(true);

    if (moment(kendo.toString($("#ObsEndDate").data("kendoDatePicker").value(), "yyyy-MM-dd")).diff(moment(kendo.toString($("#ObsstartDate").data("kendoDatePicker").value(), "yyyy-MM-dd")), 'months', true) > 12) {
        if (Withemail == null) {
            $('#showerror_msg').removeClass("alert-info").addClass("alert-danger");
            $('#showerror_msg').css("display", "block");
            $('#show_msg').html("Observation Date range cannot exceed 12 months.");
        }
        else {
            //$(".loading").hide();

            HideLoader(true);

            $('#emailerror_msg').removeClass("alert-info").addClass("alert-danger");
            $('#emailerror_msg').css("display", "block");
            $('#email_msg').html("Observation Date range cannot exceed 12 months.");
        }
    }
    else {

        $('#loadAview').html('');
        $('#loadChartView').html('');
        $('#rptTypeRadio').hide();
        ExcelGenerated = loadDataGridAtLoading;
        ExcelGridName = "gridMTB";
        ExcelSecondGridName = "chartMTB";
        if (loadDataGridAtLoading == true) {
            bindGridData();
            loadDataGridAtLoading = false;
        }

        hasExcel2Data = true;
        secondAttachmentType = "RDLC";

        //$(".loading").show();

       

        $.ajax({
            type: "Post",
            async: false,
            url: '/Tracer/MonthlyTracerBreakdown/LoadMonthlyTracerBreakdownChart',
            data: {
                search: SetSearchCriteria(false)
            },
            dataType: "html",
            success: function (data) {
                //$(".loading").hide();

                

                $('#rptTypeRadio').show();
                $('#loadChartView').html(data);               
                while (!ChartBindData(ExcelSecondGridName)) {
                    ChartBindData(ExcelSecondGridName);
                }   

                HideLoader(true);
            }
        });
    }
}

function pageRequestEnd(e) {
    setTimeout(function () {
        $('input:radio[value="GraphOnly"]').prop("checked", true);
        $("#loadAview").hide();
        $("#loadChartView").show();
        CenterOnElement('loadChartView');
    }, 500);
}

function onChartDataBound(e) {

    if ("pageRequestEnd" in window && pageRequestEnd != null && typeof (pageRequestEnd) === 'function')
        pageRequestEnd();

    $.ajax({
        url: "/Tracer/MonthlyTracerBreakdown/_GetTotalCompliance",
        type: "GET",
        cache: false,
        dataType: "json",
        error: function (response) {
            $('#lblTotalCompliance').text('0.0');
        },
        success: function (response) {
            $('#lblTotalCompliance').text(response);
        }
    });
}

function onExcelDataBound(e) {

    //Horizontal Top Scroll
    //Synced up with horizontal bottom scroll

    var dataDivHeader = e.sender.wrapper.children(".k-grid-header");
    var dataDiv = e.sender.wrapper.children(".k-grid-content");

    e.sender.wrapper.children(".topScroll").remove();

    var scrollWidth = kendo.support.scrollbar();
    var tableWidth = $("#gridMTB").find(".k-grid-content table").width();
    var columnWidth = $("#gridMTB").find(".k-grid-content-locked table").width();

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


function onSeriesClick(e) {

    $('input:radio[value="Data"]').prop("checked", true);
    bindGridData();
    $("#loadAview").show();
    $("#loadChartView").hide();
}

function ExportChartAsPDF(chartName) {
    if (hasExcelData) {
        $.ajax({
            type: "Post",
            url: "/Export/CreateSessionCriteria",
            contentType: "application/json",
            data: JSON.stringify({ search: SearchSetFilterData(true) })

        }).done(function (e) {
            $(function () {
                window.location = kendo.format("/Export/CreatePDFFile?fileName={0}&ChartName={1}", "Monthly Tracer Breakkdown", chartName);

            });
        });
    }
}

//Save the selected parameters
function SaveToMyReports(deleteReport) {
    var searchset = GetParameterValues();

    var parameterSet = [
        { ProgramServices: $('#UserProgram').val() },
        { ReportTitle: searchset.ReportTitle },
        { TracersCategory: searchset.TracerCategoryIDs },
        { TracersList: searchset.TracerListIDs },
        { OrgCampus: searchset.OrgTypeLevel3IDs },
        { OrgBuilding: searchset.OrgTypeLevel2IDs },
        { OrgDepartment: searchset.OrgTypeLevel1IDs },
        { Orgtypecheckbox: searchset.InActiveOrgTypes }
    ];

    //Set the Report Name
    if (saveRecurrenceScreen != null && saveRecurrenceScreen === "Recurrence") {
        parameterSet.push({ ScheduledReportName: $('#txtScheduledReportName1').val() });
    }
    else {
        parameterSet.push({ ScheduledReportName: $('#txtScheduledReportName').val() });
        $('#txtScheduledReportName1').val($('#txtScheduledReportName').val());
    }

    if (searchset.IncludeMinimalDenomValue === true)
        parameterSet.push({ minimaldenomValuebox: searchset.MinimalDenomValue });


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

    $("#TracersCategory").data("kendoMultiSelect").value(getParamValue(params.ReportParameters, "TracersCategory").split(","));
    $("#TracersList").data("kendoMultiSelect").value(getParamValue(params.ReportParameters, "TracersList").split(","));

    SetOrgHierarchy(params.ReportParameters);
    SetSavedObservationDate(params.ReportParameters);

    var minDenValue = getParamValue(params.ReportParameters, "minimaldenomValuebox");
    if (minDenValue != null && $.isNumeric(minDenValue)) {
        $('#minimaldenomValuebox').prop('checked', true);
        $('#mindenvalue').data("kendoNumericTextBox").value(minDenValue);
        $('#mindenvalue').data("kendoNumericTextBox").enable(true);
    }

    SetRecurrenceParameters(params);

    TriggerActionByReportMode(params.ReportMode);
}

function SetDefaults() {
  
    onInactiveCheckChange();
    
    var dateRangedeselect = $('input[name=DateRange]:checked').val();
    $('input:radio[id*=' & dateRangedeselect & ']').prop('checked', false);
    $('input:radio[name="DateRange"][value="custom"]').prop("checked", true);
    $('#noncompliantcheckbox').prop('checked', false);
    $('#mindenvalue').data("kendoNumericTextBox").value(0);
    $('#mindenvalue').data("kendoNumericTextBox").enable(false);

    $("#loadAView").hide();

    $('input:radio[value="GraphOnly"]').prop("checked", true);

}

$(document).ready(function () {
 
    $("#ObsEndDate").data("kendoDatePicker").value(moment().format('L'));
    $("#ObsstartDate").data("kendoDatePicker").value(moment().subtract(12, 'months').format('L'));
    $('input:radio[name="DateRange"][value="custom"]').prop("checked", true);

    $("#loadAView").hide();
    // Reset these additional parameters
    $("#resetfiltersbutton").click(function () {
        SetDefaults();
    });

    //Load the saved parameters
    if ($.isNumeric($('#lblReportScheduleID').html())) {
        GetSavedParameters($('#lblReportScheduleID').html());
    }

    $('input:radio[value="GraphOnly"]').click(function () {
        $("#loadAview").hide();
        $("#loadChartView").show();
    });
    $('input:radio[value="Data"]').click(function () {
        bindGridData();
        $("#loadAview").show();
        $("#loadChartView").hide();
    });


    $('#rptTypeRadio').hide();
    $('input:radio[value="GraphOnly"]').prop("checked", true);
});

function AddExportParameters() {

    var paramsearchset = $.parseJSON(sessionStorage.getItem('searchsetsession'));
    var OrgRanking3Nametext = $("#OrgRanking3Name").val() != "" ? $("#OrgRanking3Name").val() + ", " : "";
    var OrgRanking2Nametext = $("#OrgRanking2Name").val() != "" ? $("#OrgRanking2Name").val() + ", " : "";
    var inactivetextparam = "Include Inactive " + OrgRanking3Nametext + OrgRanking2Nametext + "Department.";
    var stringvalue = "";

    if ($("#hdnIsCMSProgram").val() === "True") {
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
                       { value: "Tracer Category" },
                       { value: paramsearchset.TracerCategoryNames }
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
                {
                    cells: [
                    { value: "Tracer Type" },
                    { value: "TJC Tracers" }
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
                {
                    cells: [
                    { value: inactivetextparam },
                    { value: paramsearchset.InActiveOrgTypes == true ? "True" : "False" }
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
                }
            ]
        }
    } else {
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
                       { value: "Tracer Category" },
                       { value: paramsearchset.TracerCategoryNames }
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
                {
                    cells: [
                    { value: inactivetextparam },
                    { value: paramsearchset.InActiveOrgTypes == true ? "True" : "False" }
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
                }
            ]
        }
    }

    return stringvalue;
}

function onColumnHide(e) {
    
    var grid = e.sender;
    var column = e.column;
    var colIndex = -1;
    if (column.title == "Observ")
        colIndex = 0;
    else if (column.title == "Num")
        colIndex = 1;
    else if (column.title == "Den")
        colIndex = 2;
    else if (column.title == "Comp %")
        colIndex = 3;

    if (colIndex > -1) {
        for (i = 1; i < grid.columns.length; i++) {
            var col = grid.columns[i].columns[colIndex];
            grid.hideColumn(col);
        }
    }
}

function onColumnShow(e) {
    var grid = e.sender;
    var column = e.column;
    var colIndex = -1;
    if (column.title == "Observ")
        colIndex = 0;
    else if (column.title == "Num")
        colIndex = 1;
    else if (column.title == "Den")
        colIndex = 2;
    else if (column.title == "Comp %")
        colIndex = 3;

    if (colIndex > -1) {
        for (i = 1; i < grid.columns.length; i++) {
            var col = grid.columns[i].columns[colIndex];
            grid.showColumn(col);
        }
    }
}

function bindGridData() {
    if (isGridLoaded == false) {

        if (loadDataGridAtLoading == false)
            isGridLoaded = true;

        $.ajax({
            async: false,
            url: '/Tracer/MonthlyTracerBreakdown/LoadMonthlyTracerBreakdown',
            data: {
                StartDate: kendo.toString($("#ObsstartDate").data("kendoDatePicker").value(), "yyyy-MM-dd"),
                EndDate: kendo.toString($("#ObsEndDate").data("kendoDatePicker").value(), "yyyy-MM-dd")
            },
            dataType: "html",
            success: function (data) {
                $('#loadAview').html(data);
                ExcelGenerated = true;
            }
        });
        ExcelBindData("gridMTB");
    }
}