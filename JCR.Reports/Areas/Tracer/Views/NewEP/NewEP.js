var defaultValue = "-1";
var defaultText = "All";

loadparameters = "QuestionEPRelation";
var hasChart = false;
function loadrespectiveparameters(siteID, siteName) {
    //get the input avlues from SetSearchCriteria fucntion
    var searchinputset = SetSearchCriteria();
  
    searchinputset.TracerListIDs = "";


}

function EPMigrationChangeDateCall() {

    $.ajax({
        async: false,
        dataType: "html",
        url: "/Tracer/NewEP/GetCycleInfoNewEP",
        success: function (response) {
            $("#divEPMigrationChangeDate").html(response);
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

    var searchset =
    {
       
  
        ReportType: 'ExcelView',
        ReportTitle: $('#hdnReportTitle').val(),
   
        EPMigrationChangeDate: EPMigrationChangeDateIDs.toString(),
        EPMigrationChangeDateNames: ConvertToAllOrCSV(EPMigrationChangeDateNames),
    
       
    }
    return searchset;
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
        url: '/Tracer/NewEP/LoadNewEP',
        dataType: "html",
        success: function (data) {
            $('#loadAview').html(data);
            HideLoader();
        }
    });
    ExcelGenerated = true;
    ExcelGridName = "gridNEWEPDATA";
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
            { EPMigrationChangeDate: searchset.EPMigrationChangeDate }
           
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
                    { value: "Tracer Type" },
                    { value: "TJC Tracers" }
                    ]
                },
                {
                    cells: [
                    { value: "Effective Date" },
                    { value: paramsearchset.EPMigrationChangeDateNames }
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
                    { value: "Effective Date" },
                    { value: paramsearchset.EPMigrationChangeDateNames }
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