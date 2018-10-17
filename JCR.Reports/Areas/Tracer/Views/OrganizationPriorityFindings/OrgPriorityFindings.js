var GetRDLC = $("#GetRDLC").val();

$(document).ready(function () {
    //Set the default report style selection to Graph and Data
    $('input:radio[id*="GraphandData"]').prop('checked', true);

    //Enable/Disable Include CMS checkbox based on Report type selection
    $('input[name=ReportTypeNoExcel]').click(function () {
        if ($(this).is(':checked')) {
            if ($(this).val() == "GraphOnly") {
                $('#chkIncludeCMS').attr("disabled", true);
                $('#chkIncludeCMS').removeAttr("checked");
            }
            else
                $('#chkIncludeCMS').removeAttr("disabled");
        }
    });

    $("#resetfiltersbutton").click(function () {
        SetDefaults();
    });

    //Load the saved parameters
    if ($.isNumeric($('#lblReportScheduleID').html())) {
        GetSavedParameters($('#lblReportScheduleID').html());
    }
});

//Method called during Site changed event and Reset button click
function SetDefaults()
{
    $('input:radio[id*="GraphandData"]').prop("checked", true);
    $('#chkIncludeCMS').removeAttr("disabled");
    $('#TopFindings').data("kendoDropDownList").select(1);
}

//Generate report button click
function GenerateReport(GenfromSavedFilters, Withemail) {
    dataLimitIssue = false;
    RdlcGenerated = true;
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
        }
    });
}

//Save the selected parameters
function SaveToMyReports(deleteReport) {
    var searchset = GetParameterValues();

    var parameterSet = [
        { ProgramServices: $('#UserProgram').val() },
        { ReportTitle: searchset.ReportTitle },
        { ReportType: searchset.ReportType },
        { TracersCategory: searchset.TracerCategoryIDs },
        { TopFindings: searchset.TopFindings }
    ];

    //Set the Report Name
    if (saveRecurrenceScreen != null && saveRecurrenceScreen === "Recurrence") {
        parameterSet.push({ ScheduledReportName: $('#txtScheduledReportName1').val() });
    }
    else {
        parameterSet.push({ ScheduledReportName: $('#txtScheduledReportName').val() });
        $('#txtScheduledReportName1').val($('#txtScheduledReportName').val());
    }

    if (searchset.IncludeCMS === true)
        parameterSet.push({ chkIncludeCMS: true });

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
    $('input[name=ReportTypeNoExcel][value="' + getParamValue(params.ReportParameters, "ReportType") + '"]').prop('checked', true);
    $("#TracersCategory").data("kendoMultiSelect").value(getParamValue(params.ReportParameters, "TracersCategory").split(","));
    $("#TopFindings").data("kendoDropDownList").value(getParamValue(params.ReportParameters, "TopFindings"));
    SetSavedObservationDate(params.ReportParameters);
    CheckboxChecked(getParamValue(params.ReportParameters, "chkIncludeCMS"), 'chkIncludeCMS');

    SetRecurrenceParameters(params);

    TriggerActionByReportMode(params.ReportMode);
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

    var searchset =
    {
        TracerCategoryIDs: TracerCategoryIDs.toString(),
        TracerCategoryNames: ConvertToAllOrCSV(TracerCategoryNames),
        StartDate: kendo.toString($("#ObsstartDate").data("kendoDatePicker").value(), "yyyy-MM-dd"),
        EndDate: kendo.toString($("#ObsEndDate").data("kendoDatePicker").value(), "yyyy-MM-dd"),
        ReportType: $('input[name=ReportTypeNoExcel]:checked').val(),
        TopFindings: $("#TopFindings").data("kendoDropDownList").value(),
        IncludeCMS: $('#chkIncludeCMS').is(':checked'),
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