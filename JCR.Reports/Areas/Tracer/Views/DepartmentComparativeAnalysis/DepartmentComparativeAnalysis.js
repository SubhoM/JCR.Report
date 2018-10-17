//Get URLS from hidden fields
var GetRDLC = $("#GetRDLC").val();
var ResetFilters = $("#GetResetLink").val();
var reportTracerTypeID = 1;

$(document).ready(function () {
    $("#tabstripDept").css("display", "none");
    //set the excel view or not based on radio button chagne
    $("input[name=ReportType]:radio").change(function () {
        if ($('input[name=ReportType]:checked').val() == "ExcelView") {
            ExcelView = true;
            $("#tabstripDept").css("display", "block");
        } else {
            ExcelView = false;
            //$("#tabstripDept").css("display", "none");
        }
    });
    hasExcelSecondGrid = true;
    //Set the default report style selection to Graph
    $('input:radio[id*="GraphandData"]').prop('checked', true);

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

    //Load the saved parameters
    if ($.isNumeric($('#lblReportScheduleID').html())) {
        GetSavedParameters($('#lblReportScheduleID').html());
    }
});

function additionalData(e) {

    return { search: SetSearchCriteria(false) }
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
        IncludeNonCompliantOpportunities: $('#noncompliantcheckbox').is(':checked'),
        OpportunitiesValue: $("#noncompliantvalue").data("kendoNumericTextBox").value(),
        StartDate: kendo.toString($("#ObsstartDate").data("kendoDatePicker").value(), "yyyy-MM-dd"),
        EndDate: kendo.toString($("#ObsEndDate").data("kendoDatePicker").value(), "yyyy-MM-dd"),
        ReportType: $('input[name=ReportType]:checked').val(),
        ReportTitle: $('#hdnReportTitle').val(),
        IncludeDeptNoCompObs: $('#chkIncludeDeptNoCompObs').is(':checked'),
        TracerTypeID: reportTracerTypeID
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
    if ($('input[name=ReportType]:checked').val() == "ExcelView") {
        $("#tabstripDept").css("display", "block");
        hasExcelData = true;
        //set this variable for common emailing funcationality
        if (navigator != undefined && navigator.appVersion != undefined && (navigator.appVersion.indexOf("MSIE 8") != -1)) {
            $('#resultDCADATA').html('');
            $.ajax({
                async: false,
                url: '/Tracer/DepartmentComparativeAnalysis/LoadDepartmentComparativeAnalysisDataIE8',
                dataType: "html",
                success: function (data) {
                    $('#resultDCADATA').html(data);
                }
            });

            ExcelGenerated = true;
            ExcelGridName = "gridDCADATAIE8";

            // hasExcelData = true;
            //if rdlc is loaded - empty it
            $("#loadrdlc").html("");
            ExcelBindData("gridDCADATAIE8");
            SetColumnHeader("gridDCADATAIE8", 0, true);
            var tabstrip = $("#tabstripDept").kendoTabStrip().data("kendoTabStrip");
            tabstrip.select(tabstrip.tabGroup.children("li:first"));
            //show second excel view if user checked the noncompliantcheckbox
            if ($('#noncompliantcheckbox').is(':checked')) {
                //  hasExcel2Data = true;
                $('#resultDCAOPP').html('');
                $.ajax({
                    async: false,
                    url: '/Tracer/DepartmentComparativeAnalysis/LoadDepartmentComparativeAnalysisOppIE8',
                    dataType: "html",
                    success: function (data) {
                        $('#resultDCAOPP').html(data);
                    }
                });

                $('#ObservationsHeading').css("display", "block");
                var GridTextTitle = "Observations Less Than " + $("#noncompliantvalue").data("kendoNumericTextBox").value() + "% Compliant.";
                $('#ObservationsHeading').html(GridTextTitle);
                SecondExcelBindData("gridDCAOPPIE8");
                SetColumnHeader("gridDCAOPPIE8", 0, true);

            }
            else {
                $('#ObservationsHeading').html("");
                ExcelunBindData("gridDCAOPPIE8");

            }
        }
        else {
            ExcelGenerated = true;
            ExcelGridName = "gridDCADATA";

            // hasExcelData = true;
            //if rdlc is loaded - empty it
            $("#loadrdlc").html("");
            ExcelBindData("gridDCADATA");
            SetColumnHeader("gridDCADATA", 0, true);
            var tabstrip = $("#tabstripDept").kendoTabStrip().data("kendoTabStrip");
            tabstrip.select(tabstrip.tabGroup.children("li:first"));
            //show second excel view if user checked the noncompliantcheckbox
            if ($('#noncompliantcheckbox').is(':checked')) {
                $('#ObservationsHeading').css("display", "block");
                var GridTextTitle = "Observations Less Than " + $("#noncompliantvalue").data("kendoNumericTextBox").value() + "% Compliant.";
                $('#ObservationsHeading').html(GridTextTitle);
                SecondExcelBindData("gridDCAOPP");
                SetColumnHeader("gridDCAOPP", 0, true);

            }
            else {
                $('#ObservationsHeading').html("");
                ExcelunBindData("gridDCAOPP");

            }
        }


    }

    else {
        $("#tabstripDept").css("display", "none");
        RdlcGenerated = true;
        if (navigator != undefined && navigator.appVersion != undefined && (navigator.appVersion.indexOf("MSIE 8") != -1)) {
            ExcelunBindData("gridDCADATAIE8");
            ExcelunBindData("gridDCAOPPIE8");
        }
        else {
            ExcelunBindData("gridDCADATA");
            ExcelunBindData("gridDCAOPP");
        }

        $('#ObservationsHeading').html("");

        //$(".loading").show();

        ShowLoader();

        var rdlcsearch = SetSearchCriteria(GenfromSavedFilters);

        $.ajax({
            type: "Post",
            url: GetRDLC,
            contentType: "application/json",
            data: JSON.stringify({ search: rdlcsearch, emailInput: Withemail }),
            success: function (response) {
                $("#loadrdlc").html(response);
                //$(".loading").hide();

                HideLoader();
            },
            error: function (response) { hasRdlcData = false; }
        });
    }
}

//Save the selected parameters
function SaveToMyReports(deleteReport) {
    var searchset = GetParameterValues();

    var parameterSet =
        [
            { ProgramServices: $('#UserProgram').val() },
            { ReportTitle: searchset.ReportTitle },
            { ReportType: searchset.ReportType },
            { TracersCategory: searchset.TracerCategoryIDs },
            { TracersList: searchset.TracerListIDs },
            { OrgCampus: searchset.OrgTypeLevel3IDs },
            { OrgBuilding: searchset.OrgTypeLevel2IDs },
            { OrgDepartment: searchset.OrgTypeLevel1IDs },
            { Orgtypecheckbox: searchset.InActiveOrgTypes },
            { chkIncludeDeptNoCompObs: searchset.IncludeDeptNoCompObs },
            { TracerTypeID: searchset.TracerTypeID }
        ];

    //Set the Report Name
    if (saveRecurrenceScreen != null && saveRecurrenceScreen === "Recurrence") {
        parameterSet.push({ ScheduledReportName: $('#txtScheduledReportName1').val() });
    }
    else {
        parameterSet.push({ ScheduledReportName: $('#txtScheduledReportName').val() });
        $('#txtScheduledReportName1').val($('#txtScheduledReportName').val());
    }

    if (deleteReport === true && parameterSet[11].ScheduledReportName === '') {
        parameterSet[11].ScheduledReportName = parameterSet[1].ReportTitle
    }

    if (searchset.IncludeNonCompliantOpportunities === true)
        parameterSet.push({ noncompliantcheckbox: searchset.OpportunitiesValue });

    if (searchset.IncludeDeptNoCompObs === true)
        parameterSet.push({ IncludeDeptNoCompObs: searchset.IncludeDeptNoCompObs });

    //Add recurrence fields to the parameter set
    GetRecurrenceParameters(parameterSet);

    //Add date parameters only there is a value
    GetObservationDate(parameterSet, searchset.StartDate, searchset.EndDate);

    //Save the parameters to the database
    SaveSchedule(parameterSet, deleteReport);
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

        CategoryUpdate($('#UserSite').val(), $('#UserSiteName').val());
        tracerlistupdate();
    }

    $('#txtScheduledReportName').val(params.ReportNameOverride);
    $('input[name=ReportType][value="' + getParamValue(params.ReportParameters, "ReportType") + '"]').prop('checked', true);
    if (getParamValue(params.ReportParameters, "ReportType") == "ExcelView")
        ExcelView = true;

    $("#TracersCategory").data("kendoMultiSelect").value(getParamValue(params.ReportParameters, "TracersCategory").split(","));
    $("#TracersList").data("kendoMultiSelect").value(getParamValue(params.ReportParameters, "TracersList").split(","));

    SetOrgHierarchy(params.ReportParameters);
    SetSavedObservationDate(params.ReportParameters);

    var nonCompliancePercent = getParamValue(params.ReportParameters, "noncompliantcheckbox");
    if (nonCompliancePercent != null && $.isNumeric(nonCompliancePercent)) {
        $('#noncompliantcheckbox').prop('checked', true);
        $('#noncompliantvalue').data("kendoNumericTextBox").value(nonCompliancePercent);
        $('#noncompliantvalue').data("kendoNumericTextBox").enable(true);
        tabtoggle();

    }

    CheckboxChecked(getParamValue(params.ReportParameters, "IncludeDeptNoCompObs"), 'chkIncludeDeptNoCompObs');

    
    SetRecurrenceParameters(params);

    setTimeout(TriggerActionByReportMode(params.ReportMode), 500);
}

function SetDefaults() {
    $('input:radio[id*="GraphandData"]').prop("checked", true);
    $('input:radio[id*="TJC"]').prop("checked", true);
    $('#noncompliantvalue').data("kendoNumericTextBox").value(100);
    $('#noncompliantvalue').data("kendoNumericTextBox").enable(false);
    // onInactiveCheckChange();
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
            getTracerTypeExcelExportParameter(),
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
                { value: "Start Date" },
                { value: paramsearchset.StartDate }
                ]
            },
            {
                cells: [
                { value: "End Date" },
                { value: paramsearchset.EndDate }
                ]
            },
               {
                   cells: [
                   { value: "Include details of Non–compliant questions" },
                   { value: paramsearchset.IncludeNonCompliantOpportunities == true ? "True" : "False" }
                   ]
               },
                {
                    cells: [
                    { value: "Percentage compliance of non-compliant questions" },
                    { value: paramsearchset.OpportunitiesValue.toString() }
                    ]
                },
            {
                cells: [
                { value: "Include all Departments" },
                { value: paramsearchset.IncludeDeptNoCompObs == true ? "True" : "False" }
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
    return stringvalue;

}

function SecondExcelBindData(GridName) {
    $("#" + GridName).data("kendoGrid").dataSource.read();
    $("#" + GridName).css("display", "block");
}