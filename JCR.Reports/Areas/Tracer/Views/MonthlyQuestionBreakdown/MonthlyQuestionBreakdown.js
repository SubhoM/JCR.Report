loadparameters = "MonthlyQuestionBreakdown";
var QuestionText = "";
var AllQuestionGrid = false;
ExcelView = true;
var reportTracerTypeID = 1;
hasExcelSecondGrid = true;
hasChart = true;
ExcelGridName = "gridMQB";
ExcelSecondGridName = "chartMQB";
var isGridLoaded = false;
//Get URLS from hidden fields
var savedquestionsid = [];
var ResetFilters = $("#GetResetLink").val();
var GetRDLC = $("#GetRDLC").val();
var GetChart = $('#GetChart').val();

function additionalData(e) {

    return { search: SetSearchCriteria(false) }
}

function GetParameterValues() {

    var TopLeastCompliantQuestions = "";
    var SelectedQuestions = "";
    var AllTracersMode = false;
    var TracerIDs = [];
    var QuestionIDs = [];
    var TracerListIDs = [];
    var Keyword = "";

    $('#TracersList :selected').each(function (i, selected) {
        TracerListIDs[i] = $(selected).val();
    });
    if (TracerListIDs.length <= 0) {
        TracerListIDs.push(defaultValue);
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

    if ($("#leastcompliantquestionsradio").is(":checked")) {
        TopLeastCompliantQuestions = $("#LeastComplaintQuestions").data("kendoDropDownList").value();
        TracerIDs = TracerListIDs;
        QuestionIDs = "";
    }
    else {
        TopLeastCompliantQuestions = "0";

        Keyword = $("#txtQuestionSearch").val();

        if (QuestionText == "") {
            var gridAllQuestions = $("#AllQuestions").data("kendoGrid");
            var selectedRows = $(".k-state-selected", "#AllQuestions");

            if (selectedRows.length > 0) {
                for (var i = 0; i < selectedRows.length; i++) {
                    var selectedItem = gridAllQuestions.dataItem(selectedRows[i]);
                    //   TracerIDs[i] = selectedItem.TracerCustomID;
                    QuestionIDs[i] = selectedItem.TracerQuestionID;
                }
                TracerIDs = TracerListIDs.toString();
            }
            else {

                //to do
            }
        }
    }
    
    if ($("#AllQuestionTracerscheckbox").is(":checked")) {
        AllTracersMode = true;
    }
    else {
        if (TracerListIDs.length > 0) {
            if (TracerListIDs[0] == "-1") {
                AllTracersMode = true;
            }
        }
        else {
            AllTracersMode = true;
        }
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
        TracerCategoryIDs: "",
        TracerListIDs: TracerIDs.toString(),
        OrgTypeLevel1IDs: OrgTypeLevel1IDs.toString(),
        OrgTypeLevel1Names: ConvertToAllOrCSV(OrgTypeLevel1Names),
        OrgTypeLevel2IDs: OrgTypeLevel2IDs.toString(),
        OrgTypeLevel2Names: ConvertToAllOrCSV(OrgTypeLevel2Names),
        OrgTypeLevel3IDs: OrgTypeLevel3IDs.toString(),
        OrgTypeLevel3Names: ConvertToAllOrCSV(OrgTypeLevel3Names),
        InActiveOrgTypes: $('#Orgtypecheckbox').is(':checked'),
        StartDate: kendo.toString(StartDateCtrl.value(), "yyyy-MM-dd"),
        EndDate: kendo.toString(EndDateCtrl.value(), "yyyy-MM-dd"),
        ReportType: $('input[name=ReportType]:checked').val(),
        ReportTitle: $('#hdnReportTitle').val(),
        AllTracers: AllTracersMode,
        TopLeastCompliantQuestions: TopLeastCompliantQuestions,
        TracerQuestionIDs: QuestionIDs.toString(),
        Keyword: Keyword.toString(),
        IncludeMinimalDenomValue: $('#minimaldenomValuebox').is(':checked'),
        MinimalDenomValue: $("#mindenvalue").data("kendoNumericTextBox").value(),
        MonthlyReportType: "Question",
        TracerTypeID: reportTracerTypeID,
        IncludeHavingComplianceValue: $('#havingcompValuebox').is(':checked'),
        HavingComplianceOperator: $("#HavingComplianceQuestions").data("kendoDropDownList").value(),
        HavingComplianceValue: $("#havcompvalue").data("kendoNumericTextBox").value()
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
    if (ValidDateRange(Withemail)) {
        if ($("#leastcompliantquestionsradio").is(":checked")) {
            GenerateReportAddCall(GenfromSavedFilters, Withemail);
        }
        else if (ValidateQuestionSelection(Withemail)) {
            GenerateReportAddCall(GenfromSavedFilters, Withemail);
        }
    }
}

function ValidDateRange(Withemail) {
    var isValidRange = true;
    if (moment(kendo.toString($("#ObsEndDate").data("kendoDatePicker").value(), "yyyy-MM-dd")).diff(moment(kendo.toString($("#ObsstartDate").data("kendoDatePicker").value(), "yyyy-MM-dd")), 'months', true) > 12) {
        isValidRange = false;
        if (Withemail == null) {
            $('#showerror_msg').removeClass("alert-info").addClass("alert-danger");
            $('#showerror_msg').css("display", "block");
            $('#show_msg').html("Observation Date range cannot exceed 12 months.");
        }
        else {
            $(".loading").hide();
            $('#emailerror_msg').removeClass("alert-info").addClass("alert-danger");
            $('#emailerror_msg').css("display", "block");
            $('#email_msg').html("Observation Date range cannot exceed 12 months.");
        }
    }
    return isValidRange;
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
        else {
            $(".loading").hide();
            $('#emailerror_msg').removeClass("alert-info").addClass("alert-danger");
            $('#emailerror_msg').css("display", "block");
            $('#email_msg').html("Please select one or more questions");
        }
    }
    return isValid;
}

function GenerateReportAddCall(GenfromSavedFilters, Withemail) {

    hasExcelData = true;
    isGridLoaded = false;
    
    $('#loadAview').html('');
    $('#loadChartView').html('');
    $("#loadAview").hide();
    $("#loadChartView").show();
    $('#rptTypeRadio').hide();
    ExcelGenerated = loadDataGridAtLoading;
    ExcelGridName = "gridMQB";

    if (loadDataGridAtLoading == true) {
        bindGridData();
        loadDataGridAtLoading = false;
    }

    //RDLC
    hasExcel2Data = true;
    secondAttachmentType = "RDLC";
    ChartName = "chartMQB";
    //$(".loading").show();

    ShowLoader(true);

    $.ajax({
        type: "Post",
        async:false,
        url: '/Tracer/MonthlyQuestionBreakdown/LoadMonthlyQuestionBreakdownChart',
        data: {
            search: SetSearchCriteria(false)
        },
        dataType: "html",
        success: function (data) {
            //$(".loading").hide();

            

            $('#rptTypeRadio').show();
            $('#loadChartView').html(data);
            while (!ChartBindData(ChartName)) {
                ChartBindData(ChartName);
            }

            HideLoader(true);
        }
    });


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
            url: "/Tracer/MonthlyQuestionBreakdown/_GetTotalCompliance",
            type: "GET",
            dataType: "json",
            error: function (response) {
                $('#lblTotalCompliance').text('0.0');
            },
            success: function (response) {

                $('#lblTotalCompliance').text(response);
            }
        });
}

function onSeriesClick(e) {

    $('input:radio[value="Data"]').prop("checked", true);
    bindGridData();
    $("#loadAview").show();
    $("#loadChartView").hide();
}

function ExportChartAsPDF(chartName){
    if (hasExcelData) {
        $.ajax({
            type: "Post",
            url: "/Export/CreateSessionCriteria",
            contentType: "application/json",
            data: JSON.stringify({ search: SearchSetFilterData(true) })

        }).done(function (e) {
            $(function () {
                window.location = kendo.format("/Export/CreatePDFFile?fileName={0}&ChartName={1}", "Monthly Question Breakkdown",chartName);
                
            });
        });
    }
}


//Save the selected parameters
function SaveToMyReports(deleteReport) {
    create_error_elem();
    var isDataValid = true;
    if ($("#Selectquestionsradio").is(":checked") === true)
        isDataValid = ValidateQuestionSelection();

    if (ValidDateRange() && isDataValid === true) {
        var searchCriteria = GetParameterValues();

        var parameterSet = [
            { ProgramServices: $('#UserProgram').val() },
            { ReportTitle: searchCriteria.ReportTitle },
            { OrgCampus: searchCriteria.OrgTypeLevel3IDs },
            { OrgBuilding: searchCriteria.OrgTypeLevel2IDs },
            { OrgDepartment: searchCriteria.OrgTypeLevel1IDs },
            { Orgtypecheckbox: searchCriteria.InActiveOrgTypes }
        ];

        //Set the Report Name
        if (saveRecurrenceScreen != null && saveRecurrenceScreen === "Recurrence") {
            parameterSet.push({ ScheduledReportName: $('#txtScheduledReportName1').val() });
        }
        else {
            parameterSet.push({ ScheduledReportName: $('#txtScheduledReportName').val() });
            $('#txtScheduledReportName1').val($('#txtScheduledReportName').val());
        }


        if (searchCriteria.IncludeMinimalDenomValue === true)
            parameterSet.push({ minimaldenomValuebox: searchCriteria.MinimalDenomValue });

        if (searchCriteria.IncludeHavingComplianceValue === true) {
            parameterSet.push({ HavingComplianceChecked: searchCriteria.IncludeHavingComplianceValue });
            parameterSet.push({ HavingComplianceOperator: searchCriteria.HavingComplianceOperator });
            parameterSet.push({ HavingComplianceValue: searchCriteria.HavingComplianceValue });
        }

        if ($('#leastcompliantquestionsradio').is(':checked')){
            parameterSet.push({ leastcompliantquestionsradio: searchCriteria.TopLeastCompliantQuestions });
            parameterSet.push({ AllQuestionTracerscheckbox: searchCriteria.AllTracers });
            parameterSet.push({ TracersList: searchCriteria.TracerListIDs });
        }
        else {
            parameterSet.push({ TracersList: searchCriteria.TracerListIDs });
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

function SetDefaults() {

    onInactiveCheckChange();
    $('input:radio[name="DateRange"][value="custom"]').prop("checked", true);
    var dateRangedeselect = $('input[name=DateRange]:checked').val();
    $('input:radio[id*=' & dateRangedeselect & ']').prop('checked', false);
    $('input:radio[id*="leastcompliantquestionsradio"]').prop('checked', true);
    setLeastCompliantQuestion(true);
    $('input:radio[id*="Graph"]').prop('checked', true);
    if (AllQuestionGrid) { $("#AllQuestions").data("kendoGrid").dataSource.data([]); }

    // $("#SelectedQuestions").data("kendoGrid").dataSource.data([]);
    $("#txtQuestionSearch").val("");
    $('#divselectedquestionCount').css("display", "none");
    $("#divselectedquestionCount").html("0 Questions selected");
    QuestionText = "";
    $("#divQuestionResultsMsg").html("Search Results");
    //AllQuestionTracerscheckbox
    $("#AllQuestionTracerscheckbox").prop('checked', false);
    $("#divtiebreakermessage").html("");

    $('#noncompliantcheckbox').prop('checked', false);
    $('#mindenvalue').data("kendoNumericTextBox").value(0);
    $('#mindenvalue').data("kendoNumericTextBox").enable(false);
    $("#loadAView").hide();

    $('input:radio[value="GraphOnly"]').prop("checked", true);
}

$(document).ready(function () {
    $("#AllQuestions").data("kendoGrid").destroy();
    $("#ObsEndDate").data("kendoDatePicker").value(moment().format('L'));
    $("#ObsstartDate").data("kendoDatePicker").value(moment().subtract(12, 'months').format('L'));
    $('input:radio[name="DateRange"][value="custom"]').prop("checked", true);
    // Reset these additional parameters
    $("#resetfiltersbutton").click(function () {
        SetDefaults();
    });

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

    reportTracerTypeID = $('input[name=RegulationType]:checked').val() === "TJC" ? 1 : 2;
    $('input:radio[value="GraphOnly"]').prop("checked", true);
    $('#rptTypeRadio').hide();
});

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

    SetOrgHierarchy(params.ReportParameters);
    SetSavedObservationDate(params.ReportParameters);

    var minDenValue = getParamValue(params.ReportParameters, "minimaldenomValuebox");
    if (minDenValue != null && $.isNumeric(minDenValue)) {
        $('#minimaldenomValuebox').prop('checked', true);
        $('#mindenvalue').data("kendoNumericTextBox").value(minDenValue);
        $('#mindenvalue').data("kendoNumericTextBox").enable(true);
    }


    var havCompValue = getParamValue(params.ReportParameters, "HavingComplianceValue");
    var havingComplianceChecked = getParamValue(params.ReportParameters, "HavingComplianceChecked");
    if (havCompValue != null && $.isNumeric(havCompValue) && havingComplianceChecked == "True") {
        $('#havingcompValuebox').prop('checked', true);

        var operatorValue = getParamValue(params.ReportParameters, "HavingComplianceOperator");
        $('#HavingComplianceQuestions').data("kendoDropDownList").value(operatorValue);
        $('#HavingComplianceQuestions').data("kendoDropDownList").enable(true);

        $('#havcompvalue').data("kendoNumericTextBox").value(havCompValue);
        $('#havcompvalue').data("kendoNumericTextBox").enable(true);
    }
    var tracerlistvalues = getParamValue(params.ReportParameters, "TracersList");
    //var tracersectionlistvalues = getParamValue(params.ReportParameters, "TracerSectionsList");
    //Check top least or select questions
    var leastcompliantquestionsradio = getParamValue(params.ReportParameters, "leastcompliantquestionsradio");
    if (leastcompliantquestionsradio != null && leastcompliantquestionsradio != "") {
        $('input:radio[id*="leastcompliantquestionsradio"]').prop('checked', true);
        $("#LeastComplaintQuestions").data("kendoDropDownList").value(leastcompliantquestionsradio);
        if (tracerlistvalues != null)
            $("#TracersList").data("kendoMultiSelect").value(tracerlistvalues.split(","));
        if (getParamValue(params.ReportParameters, "AllQuestionTracerscheckbox") === 'True')
            $('#AllQuestionTracerscheckbox').prop('checked', true);
    }
    else {


        //select questions
        if (tracerlistvalues != null)
            $("#TracersList").data("kendoMultiSelect").value(tracerlistvalues.split(","));
        //if (tracersectionlistvalues != null)
        //  $("#TracerSectionsList").data("kendoMultiSelect").value(tracersectionlistvalues.split(","));

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
            $('.primarySearchButton').trigger("click");
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


function dataBoundProgress(e) {
    var grid = this;
    var tiebreakerCheckremove = 0;

    if ($("#leastcompliantquestionsradio").is(":checked")) {
        tiebreakerCheckremove = $("#LeastComplaintQuestions").data("kendoDropDownList").value();

    }

    var dataView = grid.dataSource.data();
    var dataCount = dataView.length;
    if (dataCount > tiebreakerCheckremove && tiebreakerCheckremove > 0) {
        var lastRow = dataView[dataCount - 1];
        var penultimateRow = dataView[dataCount - 2];
        var columnCount = lastRow.MonthwiseTracer.length - 1;
        if (lastRow.MonthwiseTracer[columnCount].CompliancePercentage === penultimateRow.MonthwiseTracer[columnCount].CompliancePercentage) {
            var tiebreakermsg = "Multiple questions found at " + penultimateRow.MonthwiseTracer[columnCount].CompliancePercentage + "% compliance. Questions with higher denominator values are included in the result."
            $("#divtiebreakermessage").html(tiebreakermsg);
            $("#rptTypeRadio").css('top', '15px');
        }
        else
        {
            $("#divtiebreakermessage").html("");
            $("#rptTypeRadio").css('top', '0px');
        }
        grid.dataSource.remove(lastRow);
    }
    //Horizontal Top Scroll
    //Synced up with horizontal bottom scroll
    
    var dataDivHeader = e.sender.wrapper.children(".k-grid-header");
    var dataDiv = e.sender.wrapper.children(".k-grid-content");
    
    e.sender.wrapper.children(".topScroll").remove();

    var scrollWidth = kendo.support.scrollbar();
    var tableWidth = $("#gridMQB").find(".k-grid-content table").width();
    var columnWidth = $("#gridMQB").find(".k-grid-content-locked table").width();

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

function leastCompliantRadioselection(TopLeastCompliantQuestions, AllSelectedQuestions) {
    var stringselected = "";

    if (TopLeastCompliantQuestions != "0") {
        if (QuestionText == "") {
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
        if (QuestionText == "") {
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
                        leastCompliantRadioselection(paramsearchset.TopLeastCompliantQuestions, paramsearchset.AllSelectedQuestions),
                        {
                            cells: [
                            { value: "Across all Tracers" },
                            { value: paramsearchset.AllTracers == true ? "True" : "False" }
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
                            { value: "Include only questions having compliance" },
                            { value: paramsearchset.IncludeHavingComplianceValue == true ? "True" : "False" }
                            ]
                        },
                        {
                            cells: [
                            { value: "Greater than/lesser than" },
                            { value: paramsearchset.HavingComplianceOperator == 'lt' ? "Lesser than" : "Greater Than" }
                            ]
                        },
                        {
                            cells: [
                            { value: "Compliance Value" },
                            { value: paramsearchset.HavingComplianceValue.toString() }
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
                        leastCompliantRadioselection(paramsearchset.TopLeastCompliantQuestions, paramsearchset.AllSelectedQuestions),
                        {
                            cells: [
                            { value: "Across all Tracers" },
                            { value: paramsearchset.AllTracers == true ? "True" : "False" }
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
                            { value: "Include only questions having compliance" },
                            { value: paramsearchset.IncludeHavingComplianceValue == true ? "True" : "False" }
                            ]
                        },
                        {
                            cells: [
                            { value: "Greater than/lesser than" },
                            { value: paramsearchset.HavingComplianceOperator == 'lt' ? "Lesser than" : "Greater Than" }
                            ]
                        },
                        {
                            cells: [
                            { value: "Compliance Value" },
                            { value: paramsearchset.HavingComplianceValue.toString() }
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
            url: '/Tracer/MonthlyQuestionBreakdown/LoadMonthlyQuestionBreakdown',
            data: {
                StartDate: kendo.toString($("#ObsstartDate").data("kendoDatePicker").value(), "yyyy-MM-dd"),
                EndDate: kendo.toString($("#ObsEndDate").data("kendoDatePicker").value(), "yyyy-MM-dd")
            },
            dataType: "html",
            success: function (data) {
                $('#loadAview').html(data);
                ExcelGenerated = true;

                while (!ExcelBindData("gridMQB")) {
                    ExcelBindData("gridMQB");
                }
                $('#rptTypeRadio').show();

            }
        });
    }
}