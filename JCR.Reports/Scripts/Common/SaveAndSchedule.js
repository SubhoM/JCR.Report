var LoadSavedParametersUrl = '/SaveandScheduledReports/LoadSavedParameters';
var recurrenceTypeObj = {
    Daily: "Daily",
    Weekly: "Weekly",
    Monthly: "Monthly",
    Quarterly: "Quarterly",
    None: "None"
};

/******************AJAX calls*******************************START*/
//Load the saved parameters.
function GetSavedParameters(reportScheduleID) {
    $.ajax({
        type: "POST",
        url: LoadSavedParametersUrl,
        data: {
            reportScheduleID: reportScheduleID
        },
        success: function (response) {
            SetSavedParameters(response);
        }
    });
}
//Save the parameters to ER schedule tables
function SaveSchedule(objDictionary, deleteReport) {
    var msgdelay = true;
    if (deleteReport != null && deleteReport === true) {
        objDictionary.push({ ReportDelete: 1 });
        if (objDictionary.ScheduledReportName === "" || typeof objDictionary.ScheduledReportName === 'undefined')
        { objDictionary.ScheduledReportName = "Limit Exceeded Report"; }
        msgdelay = false;
    }
    else {
        objDictionary.push({ ReportDelete: 0 });
    }
    $.ajax({
        contentType: 'application/json; charset=utf-8',
        dataType: 'json',
        type: 'POST',
        url: '/SaveandScheduledReports/SaveReport',
        data: JSON.stringify({ 'objDictionary': objDictionary }),
        success: function (response) {
            ShowStatusMessage(response, 'success', msgdelay);
            UpdateReportID(false);
            ClearWeeklyMonthlySelections();
        },
        failure: function (response) {
            ShowStatusMessage(response, 'failure', msgdelay);
        }
    });
}

//Updates the report schedule id
function UpdateReportID(valClearSession) {
    $.ajax({
        type: 'POST',
        data: { clearSession: valClearSession },
        url: '/SaveandScheduledReports/UpdateReportID',
        success: function (response) {
            $('#divScheduledReport').html(response);
            //to remove duplicate divScheduledReport div inside divScheduledReport div
            $('#divScheduledReport').contents().unwrap();
            $('#txtScheduledReportName1').val($('#txtScheduledReportName').val());
//           $('#divScheduledReportDesc').html(response);
//           $('#txtScheduledReportDesc1').val($('#txtScheduledReportDesc').val());
        }
    });
}

/******************AJAX calls*******************************END*/

//Shows the status message
function ShowStatusMessage(response, status, msgdelay) {
    var divErrorMain = "", divErrorChild = "", divErrorMessage = "";
    if (saveRecurrenceScreen === "Criteria") {
        create_error_elem();
        divErrorMain = "#showerror_msg";
        divErrorChild = "#error_msg";
        divErrorMessage = "#show_msg";
    }
    else {
        create_recurrence_error_elem();
        divErrorMain = "#recurrence_error_msg";
        divErrorChild = "#recurrenceerror_msg";
        divErrorMessage = "#recurrence_msg";
    }

    if (status === 'success') {
        $(divErrorMain).removeClass("alert-danger").addClass("alert-info");
        $(divErrorMain).css("display", "block");
        $(divErrorChild).slideDown('slow');
        $(divErrorMessage).html(response);
        if (msgdelay) {
            $(divErrorChild).delay(5000).slideUp('slow');
        }
        //  else {
        // closeSlide("btnSearchCriteria", "slideSearch");
        //  }
    }
    else {
        $(divErrorMain).removeClass("alert-info").addClass("alert-danger");
        $(divErrorMain).css("display", "block");
        $(divErrorMessage).html(response);
    }
}

//Gets the parameter value from the array
var getParamValue = function (reportParams, paramName) {
    for (var i = 0, len = reportParams.length; i < len; i++) {
        if (reportParams[i].ReportParameterName === paramName)
            return reportParams[i].ParameterValue;
    }
    return null;
}

//Checks if the property value is True and sets the checked property
function CheckboxChecked(value, ctrlName) {
    if (value !== null && value === 'True') {
        $('#' + ctrlName).prop('checked', true);
    }
    else {
        $('#' + ctrlName).prop('checked', false);
    }
}

//Sets the saved values in  Org Hierarchy multiselect controls
function SetOrgHierarchy(reportParams) {
    var orgCampusValues = getParamValue(reportParams, "OrgCampus");
    if ($("#OrgCampus").data("kendoMultiSelect") != null && orgCampusValues != null && orgCampusValues != "")
        $("#OrgCampus").data("kendoMultiSelect").value(orgCampusValues.split(","));

    var orgBuildingValues = getParamValue(reportParams, "OrgBuilding");
    if ($("#OrgBuilding").data("kendoMultiSelect") != null && orgBuildingValues != null && orgBuildingValues != "")
        $("#OrgBuilding").data("kendoMultiSelect").value(orgBuildingValues.split(","));

    $("#OrgDepartment").data("kendoMultiSelect").value(getParamValue(reportParams, "OrgDepartment").split(","));
    CheckboxChecked(getParamValue(reportParams, "Orgtypecheckbox"), 'Orgtypecheckbox');
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
            $("#ObsEndDate").data("kendoDatePicker").value(endDate);
        }
        else {
            dateRangeRadioChange(valDateRange);
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

        }

    }
}

//Triggers Generate or Copy functionality based on the Action type selected in My Reports or Search reports screen
function TriggerActionByReportMode(reportMode) {
    if (reportMode === 2) //Generate
    {
        $('.primarySearchButton').trigger("click"); //Trigger Generate button click
    }
    else if (reportMode === 3) //Copy 
    {
        UpdateReportID(false); //Clears the report id label
    }
    else if (reportMode === 5) //Recurrence 
    {
        //Open Recurrence pop-up
        btnRecurrenceClick();
    }
}

//Updates Recurrence fields in the parameter set
function GetRecurrenceParameters(parameterSet) {
    parameterSet.push({ EmailTo: $("#EmailToMaskedTextbox1").val().substr($("#EmailToMaskedTextbox1").val().trim().length - 1).toString() != ";" ? $("#EmailToMaskedTextbox1").val() : $("#EmailToMaskedTextbox1").val().trim().slice(0, -1) });//$('#EmailToMaskedTextbox1').val() });
    parameterSet.push({ EmailCC: $("#EmailCCMaskedTextbox1").val().substr($("#EmailCCMaskedTextbox1").val().trim().length - 1).toString() != ";" ? $("#EmailCCMaskedTextbox1").val() : $("#EmailCCMaskedTextbox1").val().trim().slice(0, -1) });//$('#EmailCCMaskedTextbox1').val() });
    parameterSet.push({ EmailBCC: $("#EmailBCCMaskedTextbox1").val().substr($("#EmailBCCMaskedTextbox1").val().trim().length - 1).toString() != ";" ? $("#EmailBCCMaskedTextbox1").val() : $("#EmailBCCMaskedTextbox1").val().trim().slice(0, -1) });
    parameterSet.push({ Subject: $('#EmailSubjectMaskedTextbox1').val() });
    parameterSet.push({ Comment: $('#EmailCommentMaskedTextbox1').val() });

    var scheduleType = $("input[name=RecurrenceType]:checked").val();
    if (scheduleType == recurrenceTypeObj.Daily) {
        parameterSet.push({ ScheduleTypeID: 1 });
    }
    else if (scheduleType == recurrenceTypeObj.Weekly) {
        parameterSet.push({ ScheduleTypeID: 2 });
        var daysChecked = "";
        $("#divDaysOfWeek input:checked").each(function () {
            daysChecked += $(this).val() + ",";
        });

        parameterSet.push({ DaysOfWeek: daysChecked });
    }
    else if (scheduleType == recurrenceTypeObj.Monthly) {
        parameterSet.push({ ScheduleTypeID: 3 });
        parameterSet.push({ DaysOfMonth: $('#DaysOfMonth').val() });
    }
    else if (scheduleType == recurrenceTypeObj.Quarterly) {
        parameterSet.push({ ScheduleTypeID: 4 });
        parameterSet.push({ PeriodOfQuarter: $('#PeriodOfQuarter').val() });
    }

    else
        parameterSet.push({ ScheduleTypeID: 0 });
}

//Updates ER Recurrence fields in the parameter set
function GetERRecurrenceParameters(parameterSet) {
    parameterSet.push({ EmailTo: $("#EmailToMaskedTextbox").val().substr($("#EmailToMaskedTextbox").val().trim().length - 1).toString() != ";" ? $("#EmailToMaskedTextbox").val() : $("#EmailToMaskedTextbox").val().trim().slice(0, -1) });
    parameterSet.push({ EmailCC: $("#EmailCCMaskedTextbox").val().substr($("#EmailCCMaskedTextbox").val().trim().length - 1).toString() != ";" ? $("#EmailCCMaskedTextbox").val() : $("#EmailCCMaskedTextbox").val().trim().slice(0, -1) });
    parameterSet.push({ EmailBCC: $("#EmailBCCMaskedTextbox").val().substr($("#EmailBCCMaskedTextbox").val().trim().length - 1).toString() != ";" ? $("#EmailBCCMaskedTextbox").val() : $("#EmailBCCMaskedTextbox").val().trim().slice(0, -1) });
    parameterSet.push({ Subject: $('#EmailSubjectMaskedTextbox').val() });
    parameterSet.push({ Comment: $('#EmailCommentMaskedTextbox').val() });
    if ($("#hdnReportID").val() == 42) {
        var scheduleType = $("input[name=RecurrenceType]:checked").val();
        if (scheduleType == recurrenceTypeObj.Daily) {
            parameterSet.push({ ScheduleTypeID: 1 });
        }
        else if (scheduleType == recurrenceTypeObj.Weekly) {
            parameterSet.push({ ScheduleTypeID: 2 });
            var daysChecked = "";
            $("#divDaysOfWeek input:checked").each(function () {
                daysChecked += $(this).val() + ",";
            });

            parameterSet.push({ DaysOfWeek: daysChecked });
        }
        else if (scheduleType == recurrenceTypeObj.Monthly) {
            parameterSet.push({ ScheduleTypeID: 3 });
            parameterSet.push({ DaysOfMonth: $('#DaysOfMonth').val() });
        }
        else if (scheduleType == recurrenceTypeObj.Quarterly) {
            parameterSet.push({ ScheduleTypeID: 4 });
            parameterSet.push({ PeriodOfQuarter: $('#PeriodOfQuarter').val() });
        }
        else
            parameterSet.push({ ScheduleTypeID: 0 });
    }
}

//Updates Observation date fields in the parameter set
function GetObservationDate(parameterSet, searchStartDate, searchEndDate) {
    var valDateRange = null;
    var valObsstartDate = null;
    var valObsEndDate = null;
    var selectedObservationValue = null;
    if (saveRecurrenceScreen != null && saveRecurrenceScreen === "Recurrence") {
        valDateRange = $("input[name=RecurrenceRange]:checked").val();
        if (valDateRange == "last30days") {
            valDateRange = ("last" + $("#txtLastndays").val() + "days").toString().toLowerCase();
            selectedObservationValue = ($("#txtLastndays").val() + "," + "days").toString().toLowerCase();
        }
        else if (valDateRange == "lastweek") {
            valDateRange = ("last" + $("#txtLastweek").val() + $("#ddWeek").data("kendoDropDownList").text()).toString().toLowerCase();
            selectedObservationValue = ($("#txtLastweek").val() + "," + $("#ddWeek").data("kendoDropDownList").text()).toString().toLowerCase();
        }
        else if (valDateRange == "lastmonth") {
            valDateRange = ("last" + $("#txtLastmonth").val() + $("#ddMonth").data("kendoDropDownList").text()).toString().toLowerCase();
            selectedObservationValue = ($("#txtLastmonth").val() + "," + $("#ddMonth").data("kendoDropDownList").text()).toString().toLowerCase();
        }
        else if (valDateRange == "lastquarter") {
            valDateRange = ("last" + $("#txtLastquarter").val() + $("#ddQuarter").data("kendoDropDownList").text()).toString().toLowerCase();
            selectedObservationValue = ($("#txtLastquarter").val() + "," + $("#ddQuarter").data("kendoDropDownList").text()).toString().toLowerCase();
        }
        valObsstartDate = kendo.toString($("#RecurrenceSinceDate").data("kendoDatePicker").value(), "yyyy-MM-dd");

        if (valDateRange != null) {
            //Update Observation date fields in Criteria screen
            UpdateObservationDates(valDateRange, valObsstartDate, valObsEndDate, selectedObservationValue, saveRecurrenceScreen);
        }
        else {
            //For None Recurrence save the dates entered in the Criteria screen
            var recurrenceType = $("input[name=RecurrenceType]:checked").val();
            if (recurrenceType == "None") {
                valObsstartDate = searchStartDate;
                valObsEndDate = searchEndDate;
                valDateRange = $('input[name=DateRange]:checked').val();
            }
            else { $('input[name=DateRange]').removeAttr('checked'); }
        }
    }
    else {
        scheduledReportName = $('#txtScheduledReportName').val();
        scheduledReportDesc = $('#txtScheduledReportDesc').val();
        valDateRange = $("input[name=DateRange]:checked").val();

        valObsstartDate = searchStartDate;
        valObsEndDate = searchEndDate;

        //Update Observation date fields in Criteria screen for Recurrence options other than None
        if ($("input[name=RecurrenceRange]").length > 0) {
            var valRecurrenceType = $("input[name=RecurrenceType]:checked").val();
            if (valRecurrenceType == recurrenceTypeObj.None) {
                valDateRange = $("input[name=DateRange]:checked").val();
                UpdateObservationDates(valDateRange, valObsstartDate, valObsEndDate, selectedObservationValue, saveRecurrenceScreen);
            }
            else if (valRecurrenceType == recurrenceTypeObj.Daily || recurrenceTypeObj.Weekly || valRecurrenceType == recurrenceTypeObj.Monthly || valRecurrenceType == recurrenceTypeObj.Quarterly) {
                valDateRange = $("input[name=RecurrenceRange]:checked").val();
                valObsstartDate = kendo.toString($("#RecurrenceSinceDate").data("kendoDatePicker").value(), "yyyy-MM-dd");
                if (valDateRange == "last30days") {
                    valDateRange = ("last" + $("#txtLastndays").val() + "days").toString().toLowerCase();
                    selectedObservationValue = ($("#txtLastndays").val() + "," + "days").toString().toLowerCase();
                }
                else if (valDateRange == "lastweek") {
                    valDateRange = ("last" + $("#txtLastweek").val() + $("#ddWeek").data("kendoDropDownList").text()).toString().toLowerCase();
                    selectedObservationValue = ($("#txtLastweek").val() + "," + $("#ddWeek").data("kendoDropDownList").text()).toString().toLowerCase();
                }
                else if (valDateRange == "lastmonth") {
                    valDateRange = ("last" + $("#txtLastmonth").val() + $("#ddMonth").data("kendoDropDownList").text()).toString().toLowerCase();
                    selectedObservationValue = ($("#txtLastmonth").val() + "," + $("#ddMonth").data("kendoDropDownList").text()).toString().toLowerCase();
                }
                else if (valDateRange == "lastquarter") {
                    valDateRange = ("last" + $("#txtLastquarter").val() + $("#ddQuarter").data("kendoDropDownList").text()).toString().toLowerCase();
                    selectedObservationValue = ($("#txtLastquarter").val() + "," + $("#ddQuarter").data("kendoDropDownList").text()).toString().toLowerCase();
                }
                UpdateObservationDates(valDateRange, valObsstartDate, valObsEndDate, selectedObservationValue, saveRecurrenceScreen);

            }

        }
    }


    //Add date parameters only there is a value
    if (valDateRange != null && valDateRange != '')
        parameterSet.push({ DateRange: valDateRange });

    if (valObsstartDate != null && valObsstartDate != '')
        parameterSet.push({ ObsstartDate: valObsstartDate });

    if (valObsEndDate != null && valObsEndDate != '')
        parameterSet.push({ ObsEndDate: valObsEndDate });

    EnableDisableCriteriaDate();
}
function UpdateDueDates(valDateRange, recurrenceRangChecked, includePastDue, includeCurrent) {
    var selectedDueValue = "";
    var selectedDuePeriodValue = ""
    switch (valDateRange) {
        case "last30days":
            selectedDueValue = $("#txtLastndays").val().toString().toLowerCase();
            selectedDuePeriodValue = "days";
            break;
        case "lastweek":
            selectedDueValue = $("#txtLastweek").val().toString().toLowerCase();
            selectedDuePeriodValue = $("#ddWeek").data("kendoDropDownList").text().toString().toLowerCase();
            break;
        case "lastmonth":
            selectedDueValue = $("#txtLastmonth").val().toString().toLowerCase();
            selectedDuePeriodValue = $("#ddMonth").data("kendoDropDownList").text().toString().toLowerCase();
            break;
        case "lastquarter":
            selectedDueValue = $("#txtLastquarter").val().toString().toLowerCase();
            selectedDuePeriodValue = $("#ddQuarter").data("kendoDropDownList").text().toString().toLowerCase();
            break;
        default:
            selectedDueValue = "";
            selectedDuePeriodValue = "";
    }
    dueDateChange(selectedDueValue, recurrenceRangChecked, selectedDuePeriodValue, includePastDue, includeCurrent);
}
//Update Observation date fields in Criteria screen
function UpdateObservationDates(valDateRange, valObsstartDate, valObsEndDate, selectedObservationValue, saveRecurrenceScreen) {
    var isRecurrenceSave;
    if (saveRecurrenceScreen != "Recurrence" && valDateRange != null && (typeof selectedObservationValue === 'undefined')) {
        switch (valDateRange) {
            case "last30days":
                selectedObservationValue = ($("#txtLastndays").val() + "," + "days").toString().toLowerCase();
                if (selectedObservationValue == "30,days") {
                    $('input[name=DateRange][value=last30days]').prop('checked', true);
                }
                else {
                    $('input[name=DateRange][value=custom]').prop('checked', true);
                }
                break;
            case "lastweek":
                selectedObservationValue = ($("#txtLastweek").val() + "," + $("#ddWeek").data("kendoDropDownList").text()).toString().toLowerCase();
                if (selectedObservationValue == "30,days") {
                    $('input[name=DateRange][value=last30days]').prop('checked', true);
                }
                else {
                    $('input[name=DateRange][value=custom]').prop('checked', true);
                }
                break;
            case "lastmonth":
                selectedObservationValue = ($("#txtLastmonth").val() + "," + $("#ddMonth").data("kendoDropDownList").text()).toString().toLowerCase();
                if (selectedObservationValue == "1,months") {
                    $('input[name=DateRange][value=lastmonth]').prop('checked', true);
                }
                else if (selectedObservationValue == "6,months") {
                    $('input[name=DateRange][value=lastsixmonths]').prop('checked', true);
                }
                else if (selectedObservationValue == "12,months") {
                    $('input[name=DateRange][value=last12months]').prop('checked', true);
                }

                else if (selectedObservationValue == "30,days") {
                    $('input[name=DateRange][value=last30days]').prop('checked', true);
                }
                else {
                    $('input[name=DateRange][value=custom]').prop('checked', true);
                }
                break;
            case "lastquarter":
                selectedObservationValue = ($("#txtLastquarter").val() + "," + $("#ddQuarter").data("kendoDropDownList").text()).toString().toLowerCase();
                if (selectedObservationValue == "1,quarters") {
                    $('input[name=DateRange][value=lastquarter]').prop('checked', true);
                }
                else if (selectedObservationValue == "1,months") {
                    $('input[name=DateRange][value=lastmonth]').prop('checked', true);
                }
                else if (selectedObservationValue == "6,months") {
                    $('input[name=DateRange][value=lastsixmonths]').prop('checked', true);
                }
                else if (selectedObservationValue == "12,months") {
                    $('input[name=DateRange][value=last12months]').prop('checked', true);
                }
                else if (selectedObservationValue == "30,days") {
                    $('input[name=DateRange][value=last30days]').prop('checked', true);
                }
                else {
                    $('input[name=DateRange][value=custom]').prop('checked', true);
                }
                break;
            case "custom":
                $('input[name=DateRange][value=custom]').prop('checked', true);
                var startDate = kendo.toString(kendo.parseDate(valObsstartDate), 'MM/dd/yyyy');
                $("#ObsstartDate").data("kendoDatePicker").value(startDate);

                var scheduleTypeID = $("input[name=RecurrenceType]:checked").val();
                if (scheduleTypeID === recurrenceTypeObj.None) {
                    $("#ObsEndDate").data("kendoDatePicker").value(kendo.toString(kendo.parseDate(searchEndDate), 'MM/dd/yyyy'));
                    valObsEndDate = searchEndDate;
                }
                else { $("#ObsEndDate").data("kendoDatePicker").value(""); }
                break;
            default:
                $('input[name=DateRange][value=custom]').prop('checked', true);
        }
        isRecurrenceSave = false;
    }
    else if (saveRecurrenceScreen != "Recurrence" && valDateRange != null && selectedObservationValue == null) {
        var startDate = kendo.toString(kendo.parseDate(valObsstartDate), 'MM/dd/yyyy');
        $("#ObsstartDate").data("kendoDatePicker").value(startDate);
        if (scheduleTypeID === recurrenceTypeObj.None) {
            $("#ObsEndDate").data("kendoDatePicker").value(kendo.toString(kendo.parseDate(searchEndDate), 'MM/dd/yyyy'));
            valObsEndDate = searchEndDate;
        }
        switch (valDateRange) {
            case "last30days":
                $('input[name=DateRange][value=last30days]').prop('checked', true);
                break;
            case "lastmonth":
                $('input[name=DateRange][value=lastmonth]').prop('checked', true);
                break;
            case "lastsixmonths":
                $('input[name=DateRange][value=lastsixmonths]').prop('checked', true);
                break;
            case "last12months":
                $('input[name=DateRange][value=last12months]').prop('checked', true);
                break;
            case "lastquarter":
                $('input[name=DateRange][value=lastquarter]').prop('checked', true);
                break;
            case "custom":
                $('input[name=DateRange][value=custom]').prop('checked', true);
                break;
        }
    }
    else {
        switch (valDateRange) {
            case "last30days":
                $('input[name=DateRange][value=last30days]').prop('checked', true);
                break;
            case "last1months":
                $('input[name=DateRange][value=lastmonth]').prop('checked', true);
                break;
            case "last6months":
                $('input[name=DateRange][value=lastsixmonths]').prop('checked', true);
                break;
            case "last12months":
                $('input[name=DateRange][value=last12months]').prop('checked', true);
                break;
            case "last1quarters":
                $('input[name=DateRange][value=lastquarter]').prop('checked', true);
                break;
            case "custom":
                $('input[name=DateRange][value=custom]').prop('checked', true);
                var startDate = kendo.toString(kendo.parseDate(valObsstartDate), 'MM/dd/yyyy');
                $("#ObsstartDate").data("kendoDatePicker").value(startDate);

                var scheduleTypeID = $("input[name=RecurrenceType]:checked").val();
                if (scheduleTypeID === recurrenceTypeObj.None) {
                    $("#ObsEndDate").data("kendoDatePicker").value(kendo.toString(kendo.parseDate(searchEndDate), 'MM/dd/yyyy'));
                    valObsEndDate = searchEndDate;
                }
                else { $("#ObsEndDate").data("kendoDatePicker").value(""); }
                break;
            default:
                $('input[name=DateRange][value=custom]').prop('checked', true);
        }
        isRecurrenceSave = true;
    }

    dateRangeRadioChange(selectedObservationValue, isRecurrenceSave);
}

//Set the Recurrence screen fields
function SetRecurrenceParameters(reportParams) {
    $('#EmailToMaskedTextbox1').val(reportParams.EmailTo);
    $('#EmailCCMaskedTextbox1').val(reportParams.EmailCC);
    $('#EmailBCCMaskedTextbox1').val(reportParams.EmailBCC);
    $('#EmailSubjectMaskedTextbox1').val(reportParams.Subject);
    $('#EmailCommentMaskedTextbox1').val(reportParams.Comment);
    $('#txtScheduledReportName1').val(reportParams.ReportNameOverride);
    $('#txtScheduledReportDesc1').val(reportParams.ReportDescription);

    //RecurrenceType
    var scheduleType = reportParams.ScheduleTypeID;
    if (scheduleType === 1) //Daily
    {
        $('input[name=RecurrenceType][value=' + recurrenceTypeObj.Daily + ']').prop('checked', true);
    }
    else if (scheduleType === 2) //Weekly
    {
        $('input[name=RecurrenceType][value=' + recurrenceTypeObj.Weekly + ']').prop('checked', true);
        $('#divDaysOfWeek').show();
        if (reportParams.DaysOfWeek != null)
            var items = reportParams.DaysOfWeek.split(',');
        if (items.length > 0) {
            for (var i = 0; i < items.length; i++) {
                $("#chkDay" + items[i]).prop("checked", true);
            }
        }
    }
    else if (scheduleType === 3) //Monthly
    {
        $('input[name=RecurrenceType][value=' + recurrenceTypeObj.Monthly + ']').prop('checked', true);
        $('#divDaysOfMonth').show();
        $("#DaysOfMonth").data("kendoDropDownList").value(reportParams.DaysOfMonth);
    }
    else if (scheduleType === 4) //Quarterly
    {
        $('input[name=RecurrenceType][value=' + recurrenceTypeObj.Quarterly + ']').prop('checked', true);
        $('#divPeriodOfQuarter').show();
        $("#PeriodOfQuarter").data("kendoDropDownList").value(reportParams.DaysOfQuarter);
    }
    else { $('input[name=RecurrenceType][value="None"]').prop('checked', true); }
    //RecurrenceRange
    SetSavedRecurrenceDate(reportParams.ReportParameters, scheduleType);
}

//Set the ER Recurrence screen fields
function SetERRecurrenceParameters(reportParams) {
    $('#EmailToMaskedTextbox').val(reportParams.EmailTo);
    $('#EmailCCMaskedTextbox').val(reportParams.EmailCC);
    $('#EmailBCCMaskedTextbox').val(reportParams.EmailBCC);
    $('#EmailSubjectMaskedTextbox').val(reportParams.Subject);
    $('#EmailCommentMaskedTextbox').val(reportParams.Comment);

    if ($("#hdnReportID").val() == 42) {
        $('#txtScheduledReportName1').val(reportParams.ReportNameOverride);
        //RecurrenceType
        var scheduleType = reportParams.ScheduleTypeID;
        if (scheduleType === 1) //Daily
        {
            $('input[name=RecurrenceType][value=' + recurrenceTypeObj.Daily + ']').prop('checked', true);
        }
        else if (scheduleType === 2) //Weekly
        {
            $('input[name=RecurrenceType][value=' + recurrenceTypeObj.Weekly + ']').prop('checked', true);
            $('#divDaysOfWeek').show();
            if (reportParams.DaysOfWeek != null)
                var items = reportParams.DaysOfWeek.split(',');
            if (items.length > 0) {
                for (var i = 0; i < items.length; i++) {
                    $("#chkDay" + items[i]).prop("checked", true);
                }
            }
        }
        else if (scheduleType === 3) //Monthly
        {
            $('input[name=RecurrenceType][value=' + recurrenceTypeObj.Monthly + ']').prop('checked', true);
            $('#divDaysOfMonth').show();
            $("#DaysOfMonth").data("kendoDropDownList").value(reportParams.DaysOfMonth);
        }
        else if (scheduleType === 4) //Quarterly
        {
            $('input[name=RecurrenceType][value=' + recurrenceTypeObj.Quarterly + ']').prop('checked', true);
            $('#divPeriodOfQuarter').show();
            $("#PeriodOfQuarter").data("kendoDropDownList").value(reportParams.DaysOfQuarter);
        }
        else { $('input[name=RecurrenceType][value="None"]').prop('checked', true); }
        SetSavedERRecurrenceDate(reportParams.ReportParameters, scheduleType);
    }
}
//Sets the saved ERrecurrence date option
function SetSavedERRecurrenceDate(reportParams, scheduleType) {
    //Show/Hide the date range panel
    ShowHideDateRangeOptions($("input[name=RecurrenceType]:checked").val());
    var regex = /\,/g;
    var selRecurrence = getParamValue(reportParams, "SelectedRecurrence").split(regex);
    if (scheduleType === 1)// Daily
    {
        if (selRecurrence[0] == "true") {
            $('input[name=RecurrenceRange][value=last30days]').prop('checked', true);
            $('#txtLastndays').val(selRecurrence[1]);
        }
    }
    else if (scheduleType === 2)// Weekly
    {
        if (selRecurrence[0] == "true") {
            $('input[name=RecurrenceRange][value=lastweek]').prop('checked', true);
            $('#txtLastweek').val(selRecurrence[1]);
            $("#ddWeek").data("kendoDropDownList").text(selRecurrence[2]);
        }
    }
    else if (scheduleType === 3)// Monthly
    {
        if (selRecurrence[0] == "true") {
            $('input[name=RecurrenceRange][value=lastmonth]').prop('checked', true);
            $('#txtLastmonth').val(selRecurrence[1]);
            $("#ddMonth").data("kendoDropDownList").text(selRecurrence[2]);
        }
    }
    else if (scheduleType === 4)// Quarterly
    {
        if (selRecurrence[0] == "true") {
            $('input[name=RecurrenceRange][value=lastquarter]').prop('checked', true);
            $('#txtLastquarter').val(selRecurrence[1]);
            $("#ddQuarter").data("kendoDropDownList").text(selRecurrence[2]);
        }
    }
    var selectedDueValue = typeof selRecurrence[1] == 'undefined' ? -1 : selRecurrence[1];
    var recurrenceRangChecked = selRecurrence[0] == "true" ? true : false;
    var selectedDuePeriodValue = typeof selRecurrence[2] !== 'undefined' ? selRecurrence[2].toString().toLowerCase() : "";
    var includePastDue = getParamValue(reportParams, "IncludePastDue") == "True" ? true : false;
    var includeCurrent =  getParamValue(reportParams, "IncludeCurrent") == "True" ? true : false;
    if (selectedDuePeriodValue == '') {
        selectedDuePeriodValue = scheduleType == 1 ? 'days' :
                            scheduleType == 2 ? 'weeks' :
                            scheduleType == 3 ? 'months' :
                            scheduleType == 4 ? 'quarters' : '';
    }
    dueDateChange(selectedDueValue, recurrenceRangChecked, selectedDuePeriodValue, includePastDue, includeCurrent);
}

//Sets the saved recurrence date option
function SetSavedRecurrenceDate(reportParams, scheduleType) {
    //Show/Hide the date range panel
    ShowHideDateRangeOptions($("input[name=RecurrenceType]:checked").val());

    var valDateRange = getParamValue(reportParams, "DateRange");
    if (valDateRange == "lastsixmonths") {
        valDateRange = "last6months";
    }
    else if (valDateRange == "lastmonth") {
        valDateRange = "last1months";
    }
    else if (valDateRange == "lastquarter") {
        valDateRange = "last1quarters";
    }


    if (valDateRange === 'custom') {
        var startDate = kendo.toString(kendo.parseDate(getParamValue(reportParams, "ObsstartDate")), 'MM/dd/yyyy');
        $("#RecurrenceSinceDate").data("kendoDatePicker").value(startDate);
        $('input[name=RecurrenceRange][value=custom]').prop('checked', true);
    }
    else {
        var regex = /(\d+)/g;
        var txtValue = null;
        if (scheduleType === 1)// Daily
        {
            $('input[name=RecurrenceRange][value=last30days]').prop('checked', true);
            txtValue = (valDateRange.match(regex));
            if (txtValue[0] != null) {
                $('#txtLastndays').val(txtValue[0]);
            }
        }
        else if (scheduleType === 2)// Weekly
        {
            $('input[name=RecurrenceRange][value=lastweek]').prop('checked', true);
            txtValue = (valDateRange.match(regex));
            if (txtValue[0] != null) {
                $('#txtLastweek').val(txtValue[0]);
            }
            var dropdownValue = valDateRange.split(/[0-9]+/);
            if (dropdownValue[1] != null) {
                var dropdownText = dropdownValue[1];
                $("#ddWeek").data("kendoDropDownList").text(dropdownText);
            }
        }
        else if (scheduleType === 3)// Monthly
        {
            $('input[name=RecurrenceRange][value=lastmonth]').prop('checked', true);
            txtValue = (valDateRange.match(regex));
            if (txtValue[0] != null) {
                $('#txtLastmonth').val(txtValue[0]);
            }
            var dropdownValue = valDateRange.split(/[0-9]+/);
            if (dropdownValue[1] != null) {
                var dropdownText = dropdownValue[1];
                $("#ddMonth").data("kendoDropDownList").text(dropdownText);
            }
        }
        else if (scheduleType === 4)// Quarterly
        {
            $('input[name=RecurrenceRange][value=lastquarter]').prop('checked', true);
            txtValue = (valDateRange.match(regex));
            if (txtValue[0] != null) {
                $('#txtLastquarter').val(txtValue[0]);
            }
            var dropdownValue = valDateRange.split(/[0-9]+/);
            if (dropdownValue[1] != null) {
                var dropdownText = dropdownValue[1];
                $("#ddQuarter").data("kendoDropDownList").text(dropdownText);
            }
        }
    }
    EnableDisableCriteriaDate();
}

//Disable Criteria screen dates if 'None' recurrence type is selected in the Recurrence tab
function EnableDisableCriteriaDate() {
    if ($("input[name=RecurrenceType]:checked").val() != null && $("input[name=RecurrenceType]:checked").val() !== recurrenceTypeObj.None) {
        $('#divrangeobs input').prop("disabled", "disabled");
        $('#ObservationDate input').prop("disabled", "disabled");
        $('#ObsstartDate').data('kendoDatePicker').enable(false);
        $('#ObsEndDate').data('kendoDatePicker').enable(false);
    }
    else {
        $('#divrangeobs input').removeAttr("disabled");
        $('#ObservationDate input').removeAttr("disabled");
        $('#ObsstartDate').data('kendoDatePicker').enable(true);
        $('#ObsEndDate').data('kendoDatePicker').enable(true);
    }
}


//Disable Criteria screen due dates if 'None' recurrence type is selected in the Recurrence tab
function EnableDisableDueDate() {
    if ($("input[name=RecurrenceType]:checked").val() != null && $("input[name=RecurrenceType]:checked").val() !== recurrenceTypeObj.None && $("input[name=RecurrenceRange]:checked").val() != null) {
        $('#fromDueDate').data('kendoDatePicker').enable(false);
        $('#toDueDate').data('kendoDatePicker').enable(false);
    }
    else if ($('#chkPastDue').is(':checked') == true || $('#chkCurrent').is(':checked') == true) {
        $('#fromDueDate').data('kendoDatePicker').enable(false);
        $('#toDueDate').data('kendoDatePicker').enable(false);
    }
    else {
        $("#fromDueDate").data("kendoDatePicker").value("");
        $("#toDueDate").data("kendoDatePicker").value("");
        $('#fromDueDate').data('kendoDatePicker').enable(true);
        $('#toDueDate').data('kendoDatePicker').enable(true);
    }
}

//Clear the Weekday and Day of the month selections when Quarterly or None recurrences are selected
function ClearWeeklyMonthlySelections() {
    if ($("input[name=RecurrenceType]").length > 0) {
        var scheduleType = $("input[name=RecurrenceType]:checked").val();
        if (scheduleType != recurrenceTypeObj.Weekly && scheduleType != recurrenceTypeObj.Monthly) {
            $('#divDaysOfWeek :checked').removeAttr('checked');
            $("#DaysOfMonth").data("kendoDropDownList").value("1");
        }
    }
}