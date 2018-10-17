var GetRDLC = $("#GetRDLC").val();
var reportTracerTypeID = 1;

$(document).ready(function () {
    //Load the saved parameters
    if ($.isNumeric($('#lblReportScheduleID').html())) {
        GetSavedParameters($('#lblReportScheduleID').html());
    }
});

//Generate report button click
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
        }
    });
}

//Save the selected parameters
function SaveToMyReports(deleteReport) {
    var searchset = GetParameterValues();

    var parameterSet = [
        { ProgramServices: $('#UserProgram').val() },
        { ReportTitle: searchset.ReportTitle },
        { TracersCategory: searchset.TracerCategoryIDs }
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
    GetObservationDate(parameterSet, searchset.StartDate, searchset.EndDate);

    //Save the parameters to the database
    SaveSchedule(parameterSet, deleteReport);
}

//Sets the saved parameters for each control
function SetSavedParameters(params) {
    $('#txtScheduledReportName').val(params.ReportNameOverride);
    $("#TracersCategory").data("kendoMultiSelect").value(getParamValue(params.ReportParameters, "TracersCategory").split(","));
    SetSavedObservationDate(params.ReportParameters);

    SetRecurrenceParameters(params);

    TriggerActionByReportMode(params.ReportMode);
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

    var searchset =
    {
        TracerCategoryIDs: TracerCategoryIDs.toString(),
        TracerCategoryNames: ConvertToAllOrCSV(TracerCategoryNames),
        StartDate: kendo.toString($("#ObsstartDate").data("kendoDatePicker").value(), "yyyy-MM-dd"),
        EndDate: kendo.toString($("#ObsEndDate").data("kendoDatePicker").value(), "yyyy-MM-dd"),
        ReportTitle: $('#hdnReportTitle').val(),
        ReportType: $('input[name=ReportType]:checked').val(),
        InActiveOrgTypes: $('#Orgtypecheckbox').is(':checked'),
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