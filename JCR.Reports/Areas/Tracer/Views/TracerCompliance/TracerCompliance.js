$(document).ready(function () {
    //Set the default report style selection to Graph and Data
    $('input:radio[id*="GraphandData"]').prop('checked', true);
    $('input:radio[name="TracerComplianceGroupBy"][id*="Daily"]').prop('checked', true);

    //SetDefaultTracerSelection();

    $("#resetfiltersbutton").click(function () {
        SetDefaults();
    });

    //Load the saved parameters
    if ($.isNumeric($('#lblReportScheduleID').html())) {
        GetSavedParameters($('#lblReportScheduleID').html());
    }
});

function SetDefaults() {
    $('input:radio[id*="GraphandData"]').prop("checked", true);
    $('input:radio[name="TracerComplianceGroupBy"][id*="Daily"]').prop('checked', true);
    $('IncludeFSAcheckbox').removeAttr("disabled");
    $('#TracersListForCompliance').data("kendoMultiSelect").value('');
    $('#TracersListForCompliance').data("kendoMultiSelect").input.blur();
    onInactiveCheckChange();
    //SetDefaultTracerSelection();
}

//Set the default tracers when we load or reset the filtersGroup By
function SetDefaultTracerSelection() {
    var defaultSelectedValue = "";
    var startIndex = 0;
    var itemsLength = $('#TracersListForCompliance')[0].length;

    if (itemsLength > 0) {
        if (itemsLength > 5) {
            itemsLength = 5;
            startIndex = 0;
        }
        else if (itemsLength == 1)
            startIndex = 0;
        else
            startIndex = 1;

        for (var i = startIndex; i < itemsLength; i++) {
            defaultSelectedValue += $('#TracersListForCompliance')[0][i].value + ",";
        }

        var defaultValues = defaultSelectedValue.replace(/,\s*$/, "").split(',');
        $("#TracersListForCompliance").data("kendoMultiSelect").value(defaultValues);
    }
}

//Generate report button click
function GenerateReport(GenfromSavedFilters, Withemail) {
    //Validate if the users has selected at least one Tracer
    dataLimitIssue = false;
    if (ValidateTracerNameSelection()) {
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
}

//Save the selected parameters
function SaveToMyReports(deleteReport) {
    if (ValidateTracerNameSelection()) {
        var searchset = GetParameterValues();

        var parameterSet = [
            { ProgramServices: $('#UserProgram').val() },
            { ReportTitle: searchset.ReportTitle },
            { ReportType: searchset.ReportType },
            { ReportGroupByType: searchset.GroupByObsQues },
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

        if (searchset.IncludeFsa === true)
            parameterSet.push({ IncludeFSAcheckbox: true });

        //Add recurrence fields to the parameter set
        GetRecurrenceParameters(parameterSet);

        //Add date parameters only there is a value
        GetObservationDate(parameterSet, searchset.StartDate, searchset.EndDate);

        //Save the parameters to the database
        SaveSchedule(parameterSet, deleteReport);
    }
    else {
        if (saveRecurrenceScreen == "Recurrence") { OnbtnSearchClick(); }
    }
}

//Sets the saved parameters for each control
function SetSavedParameters(params) {
    $('#txtScheduledReportName').val(params.ReportNameOverride);
    $('input[name=ReportTypeNoExcel][value="' + getParamValue(params.ReportParameters, "ReportType") + '"]').prop('checked', true);
    $('input[name=TracerComplianceGroupBy][value="' + getParamValue(params.ReportParameters, "ReportGroupByType") + '"]').prop('checked', true);

    $("#TracersCategory").data("kendoMultiSelect").value(getParamValue(params.ReportParameters, "TracersCategory").split(","));
    $("#TracersListForCompliance").data("kendoMultiSelect").value(getParamValue(params.ReportParameters, "TracersList").split(","));

    SetOrgHierarchy(params.ReportParameters);
    SetSavedObservationDate(params.ReportParameters);

    CheckboxChecked(getParamValue(params.ReportParameters, "IncludeFSAcheckbox"), 'IncludeFSAcheckbox');

    SetRecurrenceParameters(params);

    TriggerActionByReportMode(params.ReportMode);
}

//Validate at least one tracer is selected
function ValidateTracerNameSelection() {
    var selectedCount = $("#TracersListForCompliance").data("kendoMultiSelect").value().length;
    if (selectedCount <= 0) {
        create_error_elem();
        $('#showerror_msg').removeClass("alert-info").addClass("alert-danger");
        $('#showerror_msg').css("display", "block");        
        $('#show_msg').html("Select at least one Tracer");
        return false;
    }
    else {
        $('#showerror_msg').css("display", "none");
        $('#show_msg').html("");
        return true;
    }
}

var GetRDLC = $("#GetRDLC").val();

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
    $('#TracersListForCompliance :selected').each(function (i, selected) {
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
        StartDate: kendo.toString($("#ObsstartDate").data("kendoDatePicker").value(), "yyyy-MM-dd"),
        EndDate: kendo.toString($("#ObsEndDate").data("kendoDatePicker").value(), "yyyy-MM-dd"),
        IncludeFsa: $('#IncludeFSAcheckbox').is(':checked'),
        GroupByObsQues: $('input[name=TracerComplianceGroupBy]:checked').val(),
        ReportType: $('input[name=ReportTypeNoExcel]:checked').val(),
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