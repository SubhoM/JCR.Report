var GetRDLC = $("#GetRDLC").val();

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

    var ObservationStatusIDs = [];
    var ObservationStatusNames = [];
    $('#ObservationStatus :selected').each(function (i, selected) {
        ObservationStatusIDs[i] = $(selected).val();
        ObservationStatusNames[i] = $(selected).text();
    });
    if (ObservationStatusIDs.length <= 0) {
        ObservationStatusIDs.push(defaultValue);
        ObservationStatusNames.push(defaultText);
    }

    var searchCriteria = {
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
        EnteredByIDs: EnteredByIDs.toString(),
        EnteredByNames: ConvertToAllOrCSV(EnteredByNames),
        ObservationStatusReportType: $('input[name=ObservationStatusReportType ]:checked').val(),
        ObservationStatus: ObservationStatusIDs.toString(),
        ObservationStatusName: ObservationStatusNames.toString(),
        StartDate: kendo.toString($("#ObsstartDate").data("kendoDatePicker").value(), "yyyy-MM-dd"),
        EndDate: kendo.toString($("#ObsEndDate").data("kendoDatePicker").value(), "yyyy-MM-dd"),
        ReportTitle: $('#hdnReportTitle').val()
    }

    return searchCriteria;
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

    var rdlcsearch = SetSearchCriteria(GenfromSavedFilters);
    RdlcGenerated = true;
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
        error: function (response) {
            hasRdlcData = false;
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
        { ReportType: searchCriteria.ObservationStatusReportType },
        { TracersCategory: searchCriteria.TracerCategoryIDs },
        { TracersList: searchCriteria.TracerListIDs },
        { OrgCampus: searchCriteria.OrgTypeLevel3IDs },
        { OrgBuilding: searchCriteria.OrgTypeLevel2IDs },
        { OrgDepartment: searchCriteria.OrgTypeLevel1IDs },
        { Orgtypecheckbox: searchCriteria.InActiveOrgTypes },
        { TracersObsEnteredBy: searchCriteria.EnteredByIDs },
        { ObservationStatus: searchCriteria.ObservationStatus }
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
    $('input[name=ObservationStatusReportType][value="' + getParamValue(params.ReportParameters, "ReportType") + '"]').prop('checked', true);

    $("#TracersCategory").data("kendoMultiSelect").value(getParamValue(params.ReportParameters, "TracersCategory").split(","));
    $("#TracersList").data("kendoMultiSelect").value(getParamValue(params.ReportParameters, "TracersList").split(","));
    $("#TracersObsEnteredBy").data("kendoMultiSelect").value(getParamValue(params.ReportParameters, "TracersObsEnteredBy").split(","));

    SetOrgHierarchy(params.ReportParameters);
    SetSavedObservationDate(params.ReportParameters);
    $("#ObservationStatus").data("kendoMultiSelect").value(getParamValue(params.ReportParameters, "ObservationStatus").split(","));

    SetRecurrenceParameters(params);

    TriggerActionByReportMode(params.ReportMode);
}

function SetDefaults() {
    $('input:radio[id*="Detail"]').prop("checked", true);   // Reset "Report Type" to Detail report.

    // Reset "Observation Status" dropdown list to "All"
    // See http://stackoverflow.com/questions/16106682/change-selected-value-of-kendo-ui-dropdownlist
    // dropdownlist.select(0);
    //Common reset in layout.js file
    // $("#ObservationStatus").data("kendoMultiSelect").value(-1);
    $("#typeOfObservationAlert").html(allObservations);     // Reset message under [Reset] [Report] buttons.

    onInactiveCheckChange();
}

var allObservations = "<i>This report includes <strong>in-progress and completed</strong> observations.</i>";
var completedObservations = "<i>This report only includes <strong>completed</strong> observations.</i>";
var inProgressObservations = "<i>This report only includes <strong>in-progress</strong> observations.</i>";

if ($("#hdnIsCMSProgram").val() === "True") {
    allObservations        = allObservations + "<br /><br /><i>This report only includes TJC Tracers.</i>";
    completedObservations  = completedObservations + "<br /><br /><i>This report only includes TJC Tracers.</i>";
    inProgressObservations = inProgressObservations + "<br /><br /><i>This report only includes TJC Tracers.</i>";
}

$(document).ready(function () {

    $("#resetfiltersbutton").click(function () {
        SetDefaults();
    });

    $("#typeOfObservationAlert").html(allObservations);

   addarrowtomultiselect("ObservationStatus");
    removedeleteoption("ObservationStatus");

    //Load the saved parameters
    if ($.isNumeric($('#lblReportScheduleID').html())) {
        GetSavedParameters($('#lblReportScheduleID').html());
    }
});

function onObservationClose(e) {
    //  removedeleteoption("ObservationStatus");
    ObservationCloseCall();
}

function ObservationCloseCall() {

    var userAlert = $("#typeOfObservationAlert");
    var selectedvalue = $("#ObservationStatus").data("kendoMultiSelect").value();
    if (selectedvalue == -1) {
        $('#' + "ObservationStatus" + '_taglist .k-button').html("<span unselectable='on'>All</span><span>&nbsp;</span>");
        userAlert.html(allObservations);
    }
    else if (selectedvalue == 8) {
        $('#' + "ObservationStatus" + '_taglist .k-button').html("<span unselectable='on'>Complete</span><span>&nbsp;</span>");
        userAlert.html(completedObservations);
    }
    else {
        $('#' + "ObservationStatus" + '_taglist .k-button').html("<span unselectable='on'>In Progress</span><span>&nbsp;</span>");
        userAlert.html(inProgressObservations);
    }
}

function onObservationSelect(e) {
    $('#ObservationStatus').data("kendoMultiSelect").value([]);
}