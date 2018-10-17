loadparameters = "ComplianceQuestion";
var AllQuestionGrid = false;
var QuestionText = "";
var QuestionID = 0;
ExcelView = true;
var TracerIDsHoldforDetailScope = [];
//Get URLS from hidden fields
exportparameters = true;
var defaultValue = "-1";
var defaultText = "All";
var savedquestionsid = [];
var ResetFilters = $("#GetResetLink").val();

var reportTracerTypeID = 1;
var updateSelectedQuestions = false;
var TracerListNames = [];

function additionalData(e) {

    return { search: SetSearchCriteria(false) }
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
    TracerListNames = [];

    var TracerListIDs = [];
   
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
            //var parami = 0;
            for (var i = 0; i < selectedRows.length; i++) {
                var selectedItem = gridAllQuestions.dataItem(selectedRows[i]);
                QuestionIDs[i] = selectedItem.TracerQuestionID;
                //parami = i + 1;
                //SelectedQuestionTexts[i] = "\n " + "Question-" + parami + " )" + selectedItem.QuestionText;
            }
            SelectedQuestionTexts = "You have selected " + selectedRows.length + " Questions.";
            TracerIDsHoldforDetailScope = TracerListIDs.toString();
            TracerIDs = TracerIDsHoldforDetailScope;
        }
        else {

            // to do
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
        ReportType: $('input[name=ReportTypeExcel]:checked').val(),
        ReportTitle: $('#hdnReportTitle').val(),
        ReportID: $('#lblReportScheduleID').text(),
        ReportName: $('#txtScheduledReportName').val(),
        ReportDescription: $('#txtScheduledReportDesc').val(),
        TopLeastCompliantQuestions: TopLeastCompliantQuestions,
        SelectedQuestionIDs: QuestionIDs.toString(),
        TracerIds: TracerIDs.toString(),
        AllTracers: AllTracersMode,
        SelectedQuestionTracerIDs: TracerIDs.toString(),
        QuestionID : QuestionID,
        AllSelectedQuestions: SelectedQuestionTexts.toString(),
        Keyword: Keyword.toString(),
        IncludeMinimalDenomValue: $('#minimaldenomValuebox').is(':checked'),
        MinimalDenomValue: $("#mindenvalue").data("kendoNumericTextBox").value(),
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
    hasExcelData = true;
    dataLimitIssue = false;
    if ($("#leastcompliantquestionsradio").is(":checked")) {
        GenerateReportAddCall();
    }
    else {
        if (QuestionText == "") {
            if (ValidateQuestionSelection(Withemail))
                GenerateReportAddCall();

        }
        else {
            GenerateReportAddCall();
        }
    }
}

function GenerateReportAddCall() {

    ShowLoader(true);

    $('#LoadDetailView').html('');
    $('#loadChartView').html('');
    $('#complianceDetail').css("display", "none");
    var searchData = GetParameterValues();
    
    ExcelGenerated = true;
    if ($('input[name=ReportTypeExcel]:checked').val() == "ExcelView") {
        if (navigator != undefined && navigator.appVersion != undefined && (navigator.appVersion.indexOf("MSIE 8") != -1)) {        //this is for only ie condition ( microsoft internet explore )
            $.ajax({
                async: false,
                url: '/Tracer/ComplianceQuestion/LoadComplianceQuestionDetailIE8',
                dataType: "html",
                success: function (data) {
                    $('#LoadDetailView').html(data);
                }
            });
            $('#loadChartView').css("display", "none");
            $('#LoadDetailView').css("display", "block");
            ExcelBindData("gridCompQuesDetIE8");

            ExcelGridName = "gridCompQuesDetIE8";
            SetColumnHeader("gridCompQuesDetIE8", 9);

        }
        else {
            $.ajax({
                async: false,
                url: '/Tracer/ComplianceQuestion/LoadComplianceQuestionDetail',
                dataType: "html",
                success: function (data) {
                    $('#LoadDetailView').html(data);
                }
            });
            $('#loadChartView').css("display", "none");
            $('#LoadDetailView').css("display", "block");
            ExcelBindData("gridCompQuesDet");

            ExcelGridName = "gridCompQuesDet";
            $("#" + ExcelGridName).data("kendoGrid").hideColumn(27);
            $("#" + ExcelGridName).data("kendoGrid").columns[27].title = "";
            $("#" + ExcelGridName).data("kendoGrid").columns[27].field = "";
            SetColumnHeader("gridCompQuesDet", 9);
        }
        /*
        if (TracerListNames.length === 1) {
            if ($.inArray('All', TracerListNames) > -1) {
                $("#gridCompQuesDet").data("kendoGrid").dataSource.sort({ field: "OverallCompliance", dir: "asc" });
            }
            else {
                $("#gridCompQuesDet").data("kendoGrid").dataSource.sort({ field: "QuesNo", dir: "asc" });
            }
            //grid.dataSource.Sort(sort => sort.Add("City").Ascending());
        }
        */
        //finally set questionText = "" 
        QuestionID = 0;        
        }
     
    else {
        $.ajax({
            async: false,
            url: '/Tracer/ComplianceQuestion/LoadComplianceQuestionChart',
            dataType: "html",
            success: function (data) {
                $('#loadChartView').html(data);
            }
        });
        $('#LoadDetailView').css("display", "none");
        $('#loadChartView').css("display", "block");
        ExcelBindData("gridCompQuesChart");

        ExcelGridName = "gridCompQuesChart";
        $("#gridCompQuesChart .k-grid-toolbar").append('  <div align="center" style="margin-top: -20px;"> Click a Question to get details</div>');
        //$.each(TracerListNames, function (i, el) {
        //    if ($.inArray(el, uniqueTarcerListNames) === -1) uniqueTarcerListNames.push(el);
        //});
        if (TracerListNames.length === 1) {
            if ($.inArray('All', TracerListNames) > -1) {
            }
            else {
                $("#gridCompQuesChart").data("kendoGrid").showColumn("QuesNo");
            }
        }
    }
}


function GridToggleFunction() {
    console.log("Inside toggle2" + $(window).height());
    var btntitle = $("#toggle").attr("title");

    if (btntitle == "Maximize") {
        //Code to change the toggle button to a restore button
        $("#toggle").attr("title", "Close");
        //$("#toggle").children().removeClass("k-i-window-maximize").addClass("k-i-close");
        $("#btntoggleicon").removeClass("k-i-window-maximize").addClass("k-i-close");
        $("#btntoggle").text("Close");

        $("#topNav").hide();
        $("#topNavbar").hide();        
        $('#mnuBreadCrumbTrail').hide();
        $("#MainNavbar").hide();
        $('#mainLayoutBody').css('margin-top', '5px');      
        gridAutoHeight($("#gridCompQuesDet").getKendoGrid(), 60);
    }
    else
    {
        //Code to change the toggle button to a Maximize button
        $("#toggle").attr("title", "Maximize");
        //$("#toggle").children().removeClass("k-i-close").addClass("k-i-window-maximize");
        $("#btntoggleicon").removeClass("k-i-close").addClass("k-i-window-maximize");
        $("#btntoggle").text("Maximize");

        $("#topNav").show();
        $("#topNavbar").show();
        $('#mnuBreadCrumbTrail').show();
        $("#MainNavbar").show();
        $('#mainLayoutBody').css('margin-top', '-15px');
        gridAutoHeight($("#gridCompQuesDet").getKendoGrid(), 224);
    }    
}

$(window).resize(function () {
    console.log("windows Resize Function");
    var btntitle = $("#toggle").attr("title");

    if (btntitle == "Maximize")
        gridAutoHeight($("#gridCompQuesDet").getKendoGrid(), 224);
    else
        gridAutoHeight($("#gridCompQuesDet").getKendoGrid(), 60);
});
function gridAutoHeight(gridObj, margin) {
    try {
        if (gridObj) {
            gridObj.element.height($(window).height() - gridObj.element[0].offsetTop - (margin || 40));
            //console.log(gridObj.element.height($(window).height() - gridObj.element[0].offsetTop - (margin || 40)));
            gridObj.resize();
        }
    } catch (e) {
        console.log('Error resizing grid: ' + e.toString());
    }
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

//Save the selected parameters
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
            parameterSet.push({ScheduledReportName: $('#txtScheduledReportName1').val()});
            parameterSet.push({ ScheduledReportDesc: $('#txtScheduledReportDesc1').val()});
        }
        else {
            parameterSet.push({ScheduledReportName: $('#txtScheduledReportName').val()});
            parameterSet.push({ScheduledReportDesc: $('#txtScheduledReportDesc').val()});
            $('#txtScheduledReportName1').val($('#txtScheduledReportName').val());
            $('#txtScheduledReportDesc1').val($('#txtScheduledReportDesc').val());
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
            parameterSet.push({ TracerSectionsList: searchCriteria.TracerSectionListIDs});
        }
        else {
            parameterSet.push({ TracersList: searchCriteria.TracerListIDs });
            parameterSet.push({ TracerSectionsList: searchCriteria.TracerSectionListIDs });
            parameterSet.push({ txtQuestionSearch: searchCriteria.Keyword });
            parameterSet.push({ AllQuestionTracerscheckbox: searchCriteria.AllTracers });
            parameterSet.push({ Selectquestionsradio: searchCriteria.SelectedQuestionIDs });
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

    var dateRangedeselect = $('input[name=DateRange]:checked').val();
    $('input:radio[id*=' & dateRangedeselect & ']').prop('checked', false);
    $('input:radio[id*="leastcompliantquestionsradio"]').prop('checked', true);
    setLeastCompliantQuestion(true);
    $('input:radio[id*="Graph"]').prop('checked', true);
    if (AllQuestionGrid) { $("#AllQuestions").data("kendoGrid").dataSource.data([]); }

    $('input:radio[id*="TJC"]').prop("checked", true);

    $("#txtQuestionSearch").val("");
    $("#divselectedquestionCount").html("0 Questions selected");
    $('#divselectedquestionCount').css("display", "none");
    QuestionID = 0;
    $("#divQuestionResultsMsg").html("Search Results");
    //AllQuestionTracerscheckbox
    $("#AllQuestionTracerscheckbox").prop('checked', false);
    $("#divtiebreakermessage").html("");

    $('#noncompliantcheckbox').prop('checked', false);
    $('#mindenvalue').data("kendoNumericTextBox").value(0);
    $('#mindenvalue').data("kendoNumericTextBox").enable(false);
}

$(document).ready(function () {



    //Set the default report style selection to Graph
    $('input:radio[id*="Graph"]').prop('checked', true);
    ExcelGridName = "gridCompQuesChart";
    $("#AllQuestions").data("kendoGrid").destroy();
    $("#btnBacktoChart")
     .bind("click", function () {
         QuestionID = 0;
         ExcelGridName = "gridCompQuesChart";
         $('#LoadDetailView').css("display", "none");
         $('#complianceDetail').css("display", "none");
         $('#loadChartView').css("display", "block");

     });
    //set the excel view or not based on radio button chagne
    $("input[name=ReportTypeExcel]:radio").change(function () {
        if ($('input[name=ReportTypeExcel]:checked').val() == "ExcelView") {
            QuestionID = 0;
            if (!ExcelGenerated) {
                $('#complianceDetail').css("display", "none");
            }
            ExcelGridName = "gridCompQuesDet";
            ExcelGenerated = false;
        } else {

            ExcelGridName = "gridCompQuesChart";
            ExcelGenerated = false;
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

    // Reset these additional parameters
    $("#resetfiltersbutton").click(function () {
        SetDefaults();
    });

    if ($.isNumeric($('#lblReportScheduleID').html())) {
        GetSavedParameters($('#lblReportScheduleID').html());
    }
});



//Sets the saved parameters for each control
function SetSavedParameters(params) {

    var savedTracerTypeID = getParamValue(params.ReportParameters, "TracerTypeID");
    if (savedTracerTypeID != null) {
        if (savedTracerTypeID == 1){
            reportTracerTypeID = 1;
            $('input:radio[id*="TJC"]').prop("checked", true);}
        else {
            reportTracerTypeID = 2;
            $('input:radio[id*="CMS"]').prop("checked", true);
        }

        $('input:radio[id*="leastcompliantquestionsradio"]').prop('checked', true);
        setLeastCompliantQuestion(true);
        if (AllQuestionGrid) { $("#AllQuestions").data("kendoGrid").dataSource.data([]); }

        $("#divselectedquestionCount").html("0 Questions selected");
        $('#divselectedquestionCount').css("display", "none");

        UpdateTracerListForQuestions();
        clearKendoGrid();
    }

    $('#txtScheduledReportName').val(params.ReportNameOverride);
    $('#txtScheduledReportDesc').val(params.ReportDescription);
    $('input[name=ReportTypeExcel][value="' + getParamValue(params.ReportParameters, "ReportType") + '"]').prop('checked', true);
    if ($('input[name=ReportTypeExcel]:checked').val() == "ExcelView") {
        ExcelGridName = "gridCompQuesDet";
    }
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
    var tracersectionlistvalues = getParamValue(params.ReportParameters, "TracerSectionsList");
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
        if (tracersectionlistvalues != null)
            $("#TracerSectionsList").data("kendoMultiSelect").value(tracersectionlistvalues.split(","));
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

function OnChangeShowDetails(arg) {

    $('#LoadDetailView').html('');

    $.ajax({
        async: false,
        url: '/Tracer/ComplianceQuestion/LoadComplianceQuestionDetail',
        dataType: "html",
        success: function (data) {
            $('#LoadDetailView').html(data);
        }
    });
    ExcelGridName = "gridCompQuesDet";
    $("#" + ExcelGridName).data("kendoGrid").hideColumn(27);
    $("#" + ExcelGridName).data("kendoGrid").columns[27].title = "";
    $("#" + ExcelGridName).data("kendoGrid").columns[27].field = "";
    

    var data = this.dataItem(this.select());
    QuestionID = data.QuestionID;
    QuestionText = data.QuestionText;//IMP

    $('#complianceDetail').css("display", "block");

    $('#LoadDetailView').css("display", "block");
    $('#loadChartView').css("display", "none");


    ExcelBindData(ExcelGridName);
    SetColumnHeader(ExcelGridName, 9);
}

function dataBoundProgress(e) {
    var grid = this;
    var tiebreakercount = 0;
    var tiebreakerCheckremove = 0;

    if ($("#leastcompliantquestionsradio").is(":checked")) {
        tiebreakerCheckremove = $("#LeastComplaintQuestions").data("kendoDropDownList").value();

    }
    var dataView = grid.dataSource.data();
    var dataCount = dataView.length;
    if (dataCount > tiebreakerCheckremove && tiebreakerCheckremove > 0) {
        var lastRow = dataView[dataCount - 1];
        var penultimateRow = dataView[dataCount - 2];

        if (lastRow.Compliance === penultimateRow.Compliance) {
            var tiebreakermsg = "Multiple questions found at " + penultimateRow.Compliance + "% compliance. Questions with higher denominator values are included in the result."
            $("#divtiebreakermessage").html(tiebreakermsg);
        }
        else
            $("#divtiebreakermessage").html("");
        grid.dataSource.remove(lastRow);
    }
    
    $(".progress").each(function () {
        var row = $(this).closest("tr");
        var model = grid.dataItem(row);
        
        var val = $(this).kendoProgressBar({
            value: Math.round(model.Compliance),
            type: "percent"
        });
        if (model.TotalDenominator === 0) {
            val.children("span").css("background-color", "grey");
            val.data("kendoProgressBar").progressStatus.text("Not Applicable:100%");
        }
            
    });
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

function getTracerTypeExcelExportParameter() {
    var stringselected = [];
    
    if ($("#hdnIsCMSProgram").val() === "True") {
        var stringValue = reportTracerTypeID === 1 ? "TJC Tracers" : "CMS Tracers";
        stringselected = {
            cells: [
                           { value: "Tracer Type" },
                           { value: stringValue }
            ]
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
    var TracerListNames = [];
    var TracerSectionListNames = [];
    var txtQuestionSearch = "";
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
                            { value:  paramsearchset.ReportID}
                            ]
                        },
                        {
                            cells: [
                            { value: "My Report Name" },
                            { value:  paramsearchset.ReportName}
                            ]
                        },
                        {
                            cells: [
                            { value: "Custom Report Description" },
                            { value: paramsearchset.ReportDescription}
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

function excelExportIE8Question(e) {
    e.preventDefault();
    if (fromemail) {
        if (hasExcelData) {

            $.ajax({
                type: "Post",
                url: "/Export/CreateSessionCriteriaQuestion",
                contentType: "application/json",
                data: JSON.stringify({ search: SearchSetFilterData(true), filtereddataQID: "" })

            }).done(function (e) {
                $(function () {
                    $.post('/Email/SendExcelEmailIE8',
                      { ExcelGridName: ExcelGridName, email: $.parseJSON(sessionStorage.getItem('searchsetemailsession')) }, function (data) {
                          fromemail = false;

                          if (data != "Successfully sent report to the email account(s)") {
                              $('#emailerror_msg').removeClass("alert-info").addClass("alert-danger");
                          }
                          else {
                              $('#emailerror_msg').removeClass("alert-danger").addClass("alert-info");
                          }
                          $('#emailerror_msg').css("display", "block");
                          $('#email_msg').html(data);


                      });
                });
            });

        }
        else {
            fromemail = false;
            $('#emailerror_msg').removeClass("alert-info").addClass("alert-danger");
            $('#emailerror_msg').css("display", "block");
            $('#email_msg').html("No data found matching your Criteria. Change Criteria and try again.");
        }

    } else {
        e.preventDefault();
        if (hasExcelData) {

            var excelgridname = ExcelGridName;
            var excelfilename = $("#ReportTitle").html();


            $.ajax({
                type: "Post",
                url: "/Export/CreateSessionCriteriaQuestion",
                contentType: "application/json",
                data: JSON.stringify({ search: SearchSetFilterData(true), filtereddataQID: "" })

            }).done(function (e) {

                window.location = kendo.format("{0}?fileName={1}&ExcelGridName={2}",
               "/Export/CreateExcelFileQuestion",
               excelfilename,
                excelgridname);
            });
        }
    }
}
var tiebreakercompliancevalue = "";
function dataBoundtiebreaker(e) {
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
        $("#gridCompQuesDet").data("kendoGrid").columns[3].title = "Tag Standard";
        $("#gridCompQuesDet thead [data-field=StandardEPs] .k-link").html("Tag Standard")
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

            if (ExcelGridName == "gridCompQuesChart") {
                // do nothing
            }
            else {
                if (tiebreakerCheck != 0 && e.response.Data[e.response.Total - 1].QID > tiebreakerCheck) {

                    if (e.response.Data[e.response.Total - 2].OverallCompliance == e.response.Data[e.response.Total - 1].OverallCompliance) {
                        var tiebreakermsg = "Multiple questions found at " + e.response.Data[e.response.Total - 2].OverallCompliance + " % compliance. Questions with higher denominator values are included in the result."
                        $("#divtiebreakermessage").html(tiebreakermsg);

                    }

                }

            }
            GridToggleFunction();
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

    HideLoader(true);

}

function pdfExport(e) {

    e.preventDefault();
    //$('.loading').show();
    var dataSource = $("#gridCompQuesChart").data("kendoGrid").dataSource;
    var filters = dataSource.filter();
    var sorts = dataSource.sort();
    var allData = dataSource.data();
    var query = new kendo.data.Query(allData);
    var data = query.filter(filters).data;
    var dataSortBy = "";
    var dataSortOrder = "";

    if (sorts != null) {
        if (sorts.length > 0) {
            //  sorts[0].
            dataSortBy = sorts[0].field.toString();
            dataSortOrder = sorts[0].dir.toString();
        }
    }

    var filtereddataQID = [];
    jQuery.each(data, function (i, val) {
        filtereddataQID[i] = val.QID.toString();

    });

    if (fromemail) {
        if (hasExcelData) {
            $.ajax({
                type: "Post",
                url: "/Export/CreateSessionCriteriaQuestion",
                contentType: "application/json",
                data: JSON.stringify({ search: SearchSetFilterData(true), filtereddataQID: filtereddataQID.toString() })

            }).done(function (e) {

                $(function () {
                    $.post('/Email/SendPDFEmail',
                      { ExcelGridName: 'Compliance by Question', email: $.parseJSON(sessionStorage.getItem('searchsetemailsession')), SortBy: dataSortBy, SortOrder: dataSortOrder }, function (data) {
                          fromemail = false;
                          if (data != "Preping Second Attachment") {
                              if (data != "Successfully sent report to the email account(s)") {
                                  $('#emailerror_msg').removeClass("alert-info").addClass("alert-danger");
                              }
                              else {
                                  $('#emailerror_msg').removeClass("alert-danger").addClass("alert-info");
                              }
                              $('#emailerror_msg').css("display", "block");
                              $('#email_msg').html(data);
                          }

                      });
                });
            });
        }
    }
    else{
    $.ajax({
        type: "Post",
        url: "/Export/CreateSessionCriteriaQuestion",
        contentType: "application/json",
        data: JSON.stringify({ search: SearchSetFilterData(true), filtereddataQID: filtereddataQID.toString() })

    }).done(function (e) {

        window.location = kendo.format("{0}{1}{2}{3}",
       "/Tracer/ComplianceQuestion/ComplianceQuestion_Export?SortBy=", dataSortBy, "&SortOrder=", dataSortOrder);
    });
    }
    //$('.loading').hide();

}