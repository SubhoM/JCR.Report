var defaultValue = "-1";
var defaultText = "All";
var TracersListUpdate = $("#TracersListUpdate").val();
loadparameters = "QuestionEPRelation";
var hasChart = false;
function loadrespectiveparameters(siteID, siteName) {
    //get the input avlues from SetSearchCriteria fucntion
    var searchinputset = SetSearchCriteria();
  
    searchinputset.TracerListIDs = "";

    tracerlistupdate();
   // EPMigrationChangeDateCall();

}

function EPMigrationChangeDateCall() {

    $.ajax({
        async: false,
        dataType: "html",
        url: "/Tracer/QuesEPRelation/GetCycleInfo",
        success: function (response) {
            $("#divEPMigrationChangeDate").html(response);
        }
    });
}
function onTracerStatusChange() {
    tracerlistupdate();
}

function tracerlistupdate() {
    $.ajax({
        type: "Post",
        url: TracersListUpdate,
        data: {
            selectedsiteid: $('#UserSite').val(),
            selectedsitename: $('#UserSiteName').val(),
            TracerStatus: $("#TracerStatus").data("kendoMultiSelect").value().toString()

        },
        success: function (response) {
            $("#tracerList").html(response);
        }
    });
}

$(document).ready(function () {
    loadparameters = "QuestionEPRelation";
    EPMigrationChangeDateCall();
    ExcelView = true;
    // Reset these additional parameters
    $("#resetfiltersbutton").click(function () {
        SetDefaults();
    });

    //Load the saved parameters
    if ($.isNumeric($('#lblReportScheduleID').html())) {
        GetSavedParameters($('#lblReportScheduleID').html());
    }

    $("#typeOfObservationAlert").html("");
});

//Get URLS from hidden fields

//var ResetFilters = $("#GetResetLink").val();

function additionalData(e) {

    return { search: SetSearchCriteria(false) }
}

function GetParameterValues() {
   

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

    var TracerStatusIDs = [];
    var TracerStatusNames = [];
    $('#TracerStatus :selected').each(function (i, selected) {
        TracerStatusIDs[i] = $(selected).val();
        TracerStatusNames[i] = $(selected).text();
    });
    if (TracerStatusIDs.length <= 0) {
        TracerStatusIDs.push(defaultValue);
        TracerStatusNames.push(defaultText);
    }
    var EPMigrationChangeDateIDs = [];
    var EPMigrationChangeDateNames = [];
    $('#EPMigrationChangeDate :selected').each(function (i, selected) {
        EPMigrationChangeDateIDs[i] = $(selected).val();
        EPMigrationChangeDateNames[i] = $(selected).text();
    });
    if (EPMigrationChangeDateIDs.length <= 0) {
        EPMigrationChangeDateIDs.push(defaultValue);
        EPMigrationChangeDateNames.push(defaultText);
    }

    var EPMigrationChangeTypeIDs = [];
    var EPMigrationChangeTypeNames = [];
    $('#EPMigrationChangeType :selected').each(function (i, selected) {
        EPMigrationChangeTypeIDs[i] = $(selected).val();
        EPMigrationChangeTypeNames[i] = $(selected).text();
    });
    if (EPMigrationChangeTypeIDs.length <= 0) {
        EPMigrationChangeTypeIDs.push(defaultValue);
        EPMigrationChangeTypeNames.push(defaultText);
    }
    var searchset =
    {
       
        TracerListIDs: TracerListIDs.toString(),
        TracerListNames: ConvertToAllOrCSV(TracerListNames),
        ReportType: 'ExcelView',
        ReportTitle: $('#hdnReportTitle').val(),
        TracerStatusIDs: TracerStatusIDs.toString(),
        TracerStatusNames: ConvertToAllOrCSV(TracerStatusNames),
        EPMigrationChangeDate: EPMigrationChangeDateIDs.toString(),
        EPMigrationChangeDateNames: ConvertToAllOrCSV(EPMigrationChangeDateNames),
        EPMigrationChangeType: EPMigrationChangeTypeIDs.toString(),
        EPMigrationChangeTypeNames: ConvertToAllOrCSV(EPMigrationChangeTypeNames),
       
    }
    return searchset;
}

function onDataBound(e) {
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

function SetSearchCriteria(GenfromSavedFilters) {
    
    return SearchSetFilterData(GenfromSavedFilters, GetParameterValues());
}

//Withemail parameter is optional 
function GenerateReport(GenfromSavedFilters, Withemail) {

    //$(".loading").show();

    ShowLoader();

    $.ajax({
        async: false,
        cache: false,
        url: '/Tracer/QuesEPRelation/LoadQuestionEPRelation',
        dataType: "html",
        success: function (data) {
            $('#loadAview').html(data);
            HideLoader();
        }
    });
    ExcelGenerated = true;
    ExcelGridName = "gridQEPDATA";
    ExcelBindData(ExcelGridName);

}

//Save the selected parameters
function SaveToMyReports(deleteReport) {
    var searchset = GetParameterValues();

    var parameterSet =
        [
            { ProgramServices: $('#UserProgram').val() },
            { ReportTitle: searchset.ReportTitle },
            { ReportType: searchset.ReportType },
            { TracersList: searchset.TracerListIDs },
            { TracerStatus: searchset.TracerStatusIDs },
            { EPMigrationChangeDate: searchset.EPMigrationChangeDate },
            { EPMigrationChangeType: searchset.EPMigrationChangeType },
            { RoleID: $('#hdnRoleID').val() }
           
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

    

    //Save the parameters to the database
    SaveSchedule(parameterSet, deleteReport);
}

//Sets the saved parameters for each control
function SetSavedParameters(params) {
    $('#txtScheduledReportName').val(params.ReportNameOverride);
  
        ExcelView = true;

    $("#TracersList").data("kendoMultiSelect").value(getParamValue(params.ReportParameters, "TracersList").split(","));
    $("#TracerStatus").data("kendoMultiSelect").value(getParamValue(params.ReportParameters, "TracerStatus").split(","));
    $("#EPMigrationChangeType").data("kendoMultiSelect").value(getParamValue(params.ReportParameters, "EPMigrationChangeType").split(","));
    $("#EPMigrationChangeDate").data("kendoMultiSelect").value(getParamValue(params.ReportParameters, "EPMigrationChangeDate").split(","));
    SetRecurrenceParameters(params);

    TriggerActionByReportMode(params.ReportMode);
}

//Sets the saved recurrence date option
function SetSavedRecurrenceDate(reportParams) {
    //Show/Hide the date range panel
    ShowHideDateRangeOptions($("input[name=RecurrenceType]:checked").val());

 
}

function SetDefaults() {
    
}

function AddExportParameters() {

    var paramsearchset = $.parseJSON(sessionStorage.getItem('searchsetsession'));
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
                    { value: "Tracer Status" },
                    { value: paramsearchset.TracerStatusNames }
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
                    { value: "Tracer Type" },
                    { value: "TJC Tracers" }
                    ]
                },
                {
                    cells: [
                    { value: "Effective Date" },
                    { value: paramsearchset.EPMigrationChangeDateNames }
                    ]
                },

                {
                    cells: [
                    { value: "EP Change" },
                    { value: paramsearchset.EPMigrationChangeTypeNames }
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
                    { value: "Tracer Status" },
                    { value: paramsearchset.TracerStatusNames }
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
                    { value: "Effective Date" },
                    { value: paramsearchset.EPMigrationChangeDateNames }
                    ]
                },

                {
                    cells: [
                    { value: "EP Change" },
                    { value: paramsearchset.EPMigrationChangeTypeNames }
                    ]
                }
            ]
        }
    }

    return stringvalue;
}

function ValidateData(timeDelay) {
    return true;
}

function ResetCriteriaDates() {

}

function EnableDisableCriteriaDate() {
}