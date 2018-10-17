
var defaultValue = "-1";
var defaultText = "All";
ExcelView = false;
var GenerateForEmail = false;
var ExportReportName = "Comprehensive Scoring Report";
useStickyDate = true;

function LoadReportParameters(selectedSiteIDs) {
    ERCriteriaLoaded = true;
    LoadStickyDate(selectedSiteIDs);
    GetReportHCOIDs(selectedSiteIDs);
    MultiSiteProgramCall(selectedSiteIDs);
}

function GetReportHCOIDs(selectedSiteIDs) {
    $.ajax({
        async: false,
        type: "POST",
        data: { selectedSiteIDs: selectedSiteIDs },
        url: '/Corporate/CorporateReport/GetReportHCOIDs',
        success: function (response) {
            $("#SiteSelector_SelectedHCOIDs").val(response[0]["ReportHCOIDs"]);
        }
    });
}

function onMSProgramChange(e) {

    var MultiSiteProgramIDs = [];
    var selectedProgramID = $("#MultiSiteProgram").data("kendoMultiSelect").value().toString();
    SetStickyDate(selectedProgramID);
    MultiSiteChapterCall(ERSites.getSelectedSites().replace(/,/g, ''), 0, selectedProgramID);
    
    create_error_elem();
}

$(document).ready(function () {
    
    $("input[name=ReportLevelChange]:radio").change(function () {
        if ($('#DetailReport').is(':checked')) {
            $('#IncludeCMSCheckbox').removeAttr("disabled");
        }
        else {
            $('#IncludeCMSCheckbox').attr("disabled", 'disabled');
            $('#IncludeCMSCheckbox').attr('checked', false);
        }
    });

    // Reset these additional parameters
    $("#resetfiltersbutton").click(function () {
        SetDefaults();
    });

    if ($.isNumeric($('#lblReportScheduleID').html())) {
        GetSavedParameters($('#lblReportScheduleID').html());
    }

});

function SetDefaults() {
    $('#loadrdlc').html('');
    $('#loadExcelGrid').html('');
    defaultValue = "-1";
    defaultText = "All";
    ExcelView = false;
    GenerateForEmail = false;

    LoadDefaultProgramSelect();
    EnableDisableEmail(false);
    CheckboxChecked('True', 'DetailReport');
    CheckboxChecked('False', 'IncludeCMSCheckbox');

    $("#MultiSiteProgram").data("kendoMultiSelect").trigger("change"); 
}
var GetRDLC = $("#GetRDLC").val();

function ValidateScreen() {
    var isPageValid = true;

    var ProgramID = $("#MultiSiteProgram").data("kendoMultiSelect").value().toString();
    if (ProgramID == '-1' || ProgramID == '') {

        showValidationAlert("Program is required.");

        isPageValid = false;
        return isPageValid;
    }

    var chapterID = $('#MultiSiteChapter').data("kendoMultiSelect").value().toString();
    if (chapterID == '-1' || chapterID == '') {

        showValidationAlert("Chapter is required.");

        isPageValid = false;
        return isPageValid;
    }

    return isPageValid;
}

function SetSearchCriteria(GenfromSavedFilters) {
    //only for rdlc GenfromSavedFilters is set to true only from email button
    //layout.js file common code
    return SearchSetFilterData(GenfromSavedFilters, GetParameterValues());
}

//Withemail parameter is optional 
function GenerateReport(GenfromSavedFilters, Withemail) {
    //$('.loading').hide();
    //SetLoadingImageVisibility(false);
    hasExcelData = true;

    var isPageValid = ValidateScreen();

    if (!isPageValid)
        return false;
    
    if ($('#DetailReport').is(':checked')) {

        if (GenerateForEmail) {
            var email = $.parseJSON(sessionStorage.getItem('searchsetemailsession'));
            GenerateReport_RDLC(GenfromSavedFilters, email, 'Detail');
            GenerateForEmail = false;
        }
        else {
            GenerateReport_RDLC(GenfromSavedFilters, Withemail, 'Detail');
        }
    }
}

function GenerateReport_RDLC(GenfromSavedFilters, Withemail, ReportType) {
    $("#divExportToExcel").hide();
    $("#loadExcelGrid").hide();
    dataLimitIssue = false;
    //$(".loading").show();

    ShowLoader();

    var rdlcsearch = SetSearchCriteria(GenfromSavedFilters);
    RdlcGenerated = true;


    $.ajax({
        type: "Post",
        url: '/Corporate/ComprehensiveScoring/_GetComprehensiveScoringRDLCData',
        contentType: "application/json",
        data: JSON.stringify({ search: rdlcsearch, emailInput: Withemail, ReportType: ReportType }),
        success: function (response) {
            $("#divL1tag").show();
            $("#loadrdlc").html(response);
            $("#loadrdlc").show();
            //$(".loading").hide();

            HideLoader();
        }
    });
}

function GetParameterValues() {

    var ProgramIDs = [];
    var ProgramNames = [];
    $('#MultiSiteProgram :selected').each(function (i, selected) {
        ProgramIDs[i] = $(selected).val();
        ProgramNames[i] = $(selected).text();
    });
    if (ProgramIDs.length <= 0) {
        ProgramIDs.push(defaultValue);
        ProgramNames.push(defaultText);
    }
    var SelectedChapterIDs = [];
    var SelectedChapterNames = [];

    $('#MultiSiteChapter :selected').each(function (i, selected) {
        SelectedChapterIDs[i] = $(selected).val();
        SelectedChapterNames[i] = $(selected).text();

    });
    if (SelectedChapterIDs.length <= 0) {
        SelectedChapterIDs.push(defaultValue);
        SelectedChapterNames.push(defaultText);
    }

    var SelectedSiteName = "";
    if ($('#hdnSitesCount').val() == 1) {
        SelectedSiteName = $('#hdnSingleSiteName').val();
    }
    else {
        SelectedSiteName = $("#SiteSelector_SelectedSiteName").val();
    }

    var searchset =
        {
            SiteID: ERSites.getSelectedSites().replace(/\,$/, ''),
            SiteName: SelectedSiteName,
            ProgramID: ProgramIDs.toString().replace(/\,$/, ''),
            ProgramName: ProgramNames.toString().replace(/,/g, ", "),
            ChapterID: SelectedChapterIDs.toString(),
            ChapterName: SelectedChapterNames.toString(),
            chkIncludeCMS: getIncludeCMSCheckBoxValue() == true ? 1 : 0,
            DateStart: kendo.toString($("#ObsstartDate").data("kendoDatePicker").value(), "yyyy-MM-dd"),
            DateEnd: kendo.toString($("#ObsEndDate").data("kendoDatePicker").value(), "yyyy-MM-dd"),
            ReportType: $('input[name=ReportLevelChange]:checked').val(),
            ReportTitle: $('#txtScheduledReportName').val() == '' ? $('#hdnReportTitle').val() : $('#txtScheduledReportName').val(),
            IsCorporateAccess: isCorporateSiteSelected
        }

    return searchset;
}

function getIncludeCMSCheckBoxValue() {
    return $('#IncludeCMSCheckbox').is(':checked');
}

function ERSendEmailForEPScoring() {
    GenerateForEmail = true;
    if (!ExcelGenerated) {

        $.ajax({
            async: true,
            url: GenerateReport(false)
        }).done(function () {

            setTimeout(function () {

                if (hasExcelData) {
                    fromemail = true;
                }
                else {
                    fromemail = false;
                    ShowEmailStatus("No data found matching your Criteria. Change Criteria and try again.", 'failure');
                }
            }, 2000);
        })
    }
    else {
        if (hasExcelData) {
            fromemail = true;
        }
        else {
            fromemail = false;
            ShowEmailStatus("No data found matching your Criteria. Change Criteria and try again.", 'failure');
        }
    }
}

function SaveToMyReports(deleteReport) {

    var isPageValid = ValidateScreen();

    if (!isPageValid)
        return false;

    var searchCriteria = SetSearchCriteria(false);

    var parameterSet = [
        { ReportTitle: $('#hdnReportTitle').val() },
        { ReportType: $("input[name=ReportLevelChange]:checked").val() },
        { SelectedSites: searchCriteria.SiteID },
        { ProgramServices: searchCriteria.ProgramID },
        { ChapterIDs: searchCriteria.ChapterID },
    ];

    //Include Filter by options
    if (searchCriteria.chkIncludeCMS == 1) parameterSet.push({ chkIncludeCMS: true });
    
    //DateRange - Add date parameters only there is a value
    GetObservationDate(parameterSet, searchCriteria.DateStart, searchCriteria.DateEnd);

    parameterSet.push({ ScheduledReportName: $('#txtScheduledReportName').val() });

    //Add recurrence fields to the parameter set
    GetERRecurrenceParameters(parameterSet);

    //Save the parameters to the database
    SaveSchedule(parameterSet, deleteReport);
}

//Sets the saved parameters for each control
function SetSavedParameters(params) {

    var selectedSites = '';
    //setting this flag, so as to not update the related dropdowns 
    //and to manually load it, so as to prevent the duplicate call
    isSavedReportLoading = true;

    $('#txtScheduledReportName').val(params.ReportNameOverride);

    var query = $(params.ReportSiteMaps).each(function () {
        selectedSites += $(this)[0].SiteID + ',';
    });
    selectedSites = selectedSites.replace(/\,$/, ''); //Remove the last character if its a comma

    ERSites.oldSites = ERSites.getSelectedSites();

    LoadReportParameters(selectedSites);

    $("#MultiSiteProgram").data("kendoMultiSelect").value(getParamValue(params.ReportParameters, "ProgramServices").split(","));

    //Load the Chapters, Standards
    MultiSiteChapterCall(selectedSites, 0, getParamValue(params.ReportParameters, "ProgramServices"));
    $("#MultiSiteChapter").data("kendoMultiSelect").value(getParamValue(params.ReportParameters, "ChapterIDs").split(","));
    
    $('input[name=ReportLevelChange][value=' + (getParamValue(params.ReportParameters, "ReportType")) + ']').prop('checked', true);
    if (getParamValue(params.ReportParameters, "ReportType") != "" && getParamValue(params.ReportParameters, "ReportType") != "Summary") {
        $('#IncludeCMSCheckbox').removeAttr("disabled");
    }
    else {
        $('#IncludeCMSCheckbox').attr("disabled", 'disabled');
    }
    CheckboxChecked(getParamValue(params.ReportParameters, "chkIncludeCMS"), 'IncludeCMSCheckbox');
    
    SetERRecurrenceParameters(params);
    SetSavedObservationDate(params.ReportParameters);
    TriggerActionByReportMode(params.ReportMode);
    isSavedReportLoading = false;
}
