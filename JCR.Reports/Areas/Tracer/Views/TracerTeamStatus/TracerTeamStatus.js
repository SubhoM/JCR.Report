$(document).ready(function () {
    //// Reset these additional parameters
    $("#resetfiltersbutton").click(function () {
        onInactiveCheckChange();
    });

    //Load the saved parameters
    if ($.isNumeric($('#lblReportScheduleID').html())) {
        GetSavedParameters($('#lblReportScheduleID').html());
    }
});

//Get URLS from hidden fields
var GetRDLC = $("#GetRDLC").val();
var ResetFilters = $("#GetResetLink").val();
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

    var EnteredByIDs = [];
    var EnteredByNames = [];
    $('#TracersObsEnteredBy :selected').each(function (i, selected) {
        EnteredByIDs[i] = $(selected).val();
        EnteredByNames[i] = $(selected).text();
    });
    if (EnteredByIDs.length <= 0) {
        EnteredByIDs.push(defaultValue);
        EnteredByNames.push(defaultText);
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
        EnteredByIDs: EnteredByIDs.toString(),
        EnteredByNames: ConvertToAllOrCSV(EnteredByNames),
        InActiveOrgTypes: $('#Orgtypecheckbox').is(':checked'),
        StartDate: kendo.toString($("#ObsstartDate").data("kendoDatePicker").value(), "yyyy-MM-dd"),
        EndDate: kendo.toString($("#ObsEndDate").data("kendoDatePicker").value(), "yyyy-MM-dd"),
        ReportTitle: $('#hdnReportTitle').val()
    }

    return searchset;
}

function SetSearchCriteria(GenfromSavedFilters) {
    //clearallmultiselectsearch();

    //only for rdlc GenfromSavedFilters is set to true only from email button
    //layout.js file common code
    return SearchSetFilterData(GenfromSavedFilters, GetParameterValues());
}

function GenerateReport(GenfromSavedFilters, Withemail) {
    dataLimitIssue = false;
    //$(".loading").show();

    ShowLoader();

    RdlcGenerated = true;
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
        }
    });
}

//Save the selected parameters
function SaveToMyReports(deleteReport) {
    var searchCriteria = GetParameterValues();

    var parameterSet = [
        { ProgramServices: $('#UserProgram').val() },
        { ReportTitle: searchCriteria.ReportTitle },
        { TracersCategory: searchCriteria.TracerCategoryIDs },
        { TracersList: searchCriteria.TracerListIDs },
        { OrgCampus: searchCriteria.OrgTypeLevel3IDs },
        { OrgBuilding: searchCriteria.OrgTypeLevel2IDs },
        { OrgDepartment: searchCriteria.OrgTypeLevel1IDs },
        { Orgtypecheckbox: searchCriteria.InActiveOrgTypes },
        { TracersObsEnteredBy: searchCriteria.EnteredByIDs }
    ];

    //Set the Report Name
    if (saveRecurrenceScreen != null && saveRecurrenceScreen === "Recurrence") {
        parameterSet.push({ ScheduledReportName: $('#txtScheduledReportName1').val() });
    }
    else {
        parameterSet.push({ ScheduledReportName: $('#txtScheduledReportName').val() });
        $('#txtScheduledReportName1').val($('#txtScheduledReportName').val());
    }

    //Add recurrence fields to the parameter set
    GetRecurrenceParameters(parameterSet);

    //Add date parameters only there is a value
    GetObservationDate(parameterSet, searchCriteria.StartDate, searchCriteria.EndDate);

    //Save the parameters to the database
    SaveSchedule(parameterSet, deleteReport);
}

//Sets the saved parameters for each control
function SetSavedParameters(params) {
    $('#txtScheduledReportName').val(params.ReportNameOverride);

    $("#TracersCategory").data("kendoMultiSelect").value(getParamValue(params.ReportParameters, "TracersCategory").split(","));
    $("#TracersList").data("kendoMultiSelect").value(getParamValue(params.ReportParameters, "TracersList").split(","));
    $("#TracersObsEnteredBy").data("kendoMultiSelect").value(getParamValue(params.ReportParameters, "TracersObsEnteredBy").split(","));

    SetOrgHierarchy(params.ReportParameters);
    SetSavedObservationDate(params.ReportParameters);

    SetRecurrenceParameters(params);

    TriggerActionByReportMode(params.ReportMode);
}