/// <reference path="AMPCorporateSummary.js" />

ExcelView = true;
exportparameters = true;
var defaultValue = "-1";
var defaultText = "All";
var saferMatrixReport = 31;
var LevelIdentifier = 1;
var LevelTypeIdentifier = 1;
var SelectedProgramName = "Hospital";
var SelectedProgramID = 2;
var SelectedChapteID = 0;
var SelectedChapterName = "";
var SelectedStandardName = "";
var SelectedStandardTextID = "";
var SelectedHCOName = "";
var SelectedSiteID = 0;
var SelectedSiteName = "";
var ResetFilters = $("#GetResetLink").val();
var groupbySite = true;
var ExportReportName = "";
var LikeliHood = '';
var Scope = '';
var MatrixID = 0;
var ProgramChangedGraph = false;
var ProgramChangedSummary = false;
var ProgramChangedDetail = false;
var saferMatrixGenerated = false;

function additionalData(e) {

    return { search: SetSearchCriteria(false) }
}


function SetSearchCriteria(GenfromSavedFilters) {

    if (GenfromSavedFilters != undefined) {
        if (GenfromSavedFilters) {
            return SearchSetFilterData(GenfromSavedFilters, '');
        }
        else {
            return SearchSetFilterData(GenfromSavedFilters, GetParameterValues());
        }
    }
    else {
        return SearchSetFilterData(GenfromSavedFilters, GetParameterValues());
    }

}


function LoadReportParameters(selectedSiteIDs) {
    GetReportHcoIDs(selectedSiteIDs);
    MultiSiteProgramCall(selectedSiteIDs);

    if ($('#hdnIsUserCorporate').val() === 'True')
        $('#CScore').show();
    else
        $('#CScore').hide();
}

function IsSingleSite(isTrue) {
    if (isTrue) {
        $('#grpByRow').css("display", "none");
        $('input[name="grpBy"][value="Chapter"]').prop('checked', true);
    }
    else {
        $('#grpByRow').css("display", "block");
        $('input[name="grpBy"][value="Site"]').prop('checked', true);
    }
}

function LoadMultiSiteMockSurveyCriteria(selectedSiteIDs) {
    $.ajax({
        async: false,
        type: "POST",
        dataType: "html",
        url: '/Corporate/CorporateReport/GetMockSurveyCriteria',
        data: {
            selectedSiteIDs: selectedSiteIDs
        },
        success: function (response) {
            $('#divMockSurveyCriteria').html(response);
        }
    });
}

function GetReportHcoIDs(selectedSiteIDs) {
    $.ajax({
        async: false,
        type: "POST",
        data: { selectedSiteIDs: selectedSiteIDs },
        url: '/Corporate/CorporateReport/GetReportHcoIDs',
        success: function (response) {
            $("#SiteSelector_SelectedHCOIDs").val(response);
        }
    });
}

var MultiSiteProgramUrl = '/Corporate/CorporateReport/GetMultiSitePrograms';

function MultiSiteProgramCall(selectedSiteIDs) {

    $.ajax({
        async: false,
        dataType: "html",
        url: MultiSiteProgramUrl,
        data: {
            selectedSiteIDs: selectedSiteIDs
        },
        success: function (response) {
            $("#divMultiSiteProgram").html(response);
            MultiSiteChapterCall(selectedSiteIDs, 0, GetMultiSiteProgramSelectedValue());
        }
    });
}

function GetMultiSiteProgramSelectedValue() {
    if ($("#MultiSiteProgram").data("kendoMultiSelect").value().toString() == "-1") {
        var ProgramselectedOptions = $.map($('#MultiSiteProgram option'), function (e) { if ($(e).val() == -1) { return '' } else { return $(e).val(); } });
        return ProgramselectedOptions.join(',');
    }
    else {
        return $("#MultiSiteProgram").data("kendoMultiSelect").value().toString();
    }

}

var MultiSiteChapterUrl = '/Corporate/CorporateReport/GetMultiSiteChapters';


function MultiSiteChapterCall(selectedSiteIDs, allPrograms, selectedProgramIDs) {

    $.ajax({
        async: false,
        dataType: "html",
        url: MultiSiteChapterUrl,
        data: {
            selectedSiteIDs: selectedSiteIDs,
            allPrograms: allPrograms,
            selectedProgramIDs: selectedProgramIDs
        },
        success: function (response) {
            $("#divMultiSiteChapter").html(response);
            UpdateStandards();
        }
    });
}

function onMSProgramChange(e) {
    var MultiSiteProgramIDs = [];
    MultiSiteChapterCall($("#SiteSelector_SelectedSiteIDs").val(), 0, GetMultiSiteProgramSelectedValue());

    ResetStandardsMultiSelect();
    ResetEPsMultiSelect();
    UpdateEPs();
}

function onMSChapterChange(e) {
    UpdateStandards();
}

function onStdChange(e) {
    UpdateEPs();
}


function UpdateStandards() {
    $.ajax({
        async: false,
        url: "/Corporate/CorporateReport/GetMultiSiteStandards",
        dataType: "html",
        data: {
            selectedProgramIDs: GetMultiSiteProgramSelectedValue(),
            selectedChapterIDs: $("#MultiSiteChapter").data("kendoMultiSelect").value().toString()
        },
        success: function (response) {
            $("#divMultiSiteStandard").html(response);
            UpdateEPs();
        }
    });
}

function UpdateEPs() {
    //string selectedProgramIDs, string selectedChapterIDs, string selectedStandards
    $.ajax({
        async: false,
        url: "/Corporate/CorporateReport/GetMultiSiteEPs",
        dataType: "html",
        data: {
            selectedProgramIDs: GetMultiSiteProgramSelectedValue(),
            selectedChapterIDs: $("#MultiSiteChapter").data("kendoMultiSelect").value().toString(),
            selectedStandards: $("#AMPStandard").data("kendoMultiSelect").value().toString()
        },
        success: function (response) {
            $("#divMultiSiteEP").html(response);
        }
    });
}

function SaveToMyReports(deleteReport) {
    var searchCriteria = GetParameterValues();

    var parameterSet = [
        { SelectedSites: ERSites.getSelectedSites() },
        { ProgramServices: searchCriteria.ProgramIDs },
        { ReportTitle: searchCriteria.ReportTitle },
        { ChapterIDs: searchCriteria.SelectedChapterIDs },
        { StandardIDs: searchCriteria.SelectedStandardIDs },
        { EPIDs: searchCriteria.SelectedEPIDs },
        { GrpBy: searchCriteria.GrpBy },
        { EPScoreType: searchCriteria.ScoreType },
        { IncludeFSAcheckbox: searchCriteria.IncludeFSA }
    ];

    //DateRange
    //Add date parameters only there is a value
    GetObservationDate(parameterSet, searchCriteria.StartDate, searchCriteria.EndDate);

    parameterSet.push({ ScheduledReportName: $('#txtScheduledReportName').val() });

    //Add recurrence fields to the parameter set
    GetERRecurrenceParameters(parameterSet);

    //Save the parameters to the database
    SaveSchedule(parameterSet, deleteReport);
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
    var shortChaptersShow = [];
    $('#MultiSiteChapter :selected').each(function (i, selected) {
        SelectedChapterIDs[i] = $(selected).val();
        SelectedChapterNames[i] = $(selected).text();
        shortChaptersShow[i] = $(selected).text().split('-')[0].trim();
    });
    if (SelectedChapterIDs.length <= 0) {
        SelectedChapterIDs.push(defaultValue);
        SelectedChapterNames.push(defaultText);
    }

    var SelectedStandardIDs = [];
    var SelectedStandardNames = [];
    $('#AMPStandard :selected').each(function (i, selected) {
        SelectedStandardIDs[i] = $(selected).val();
        SelectedStandardNames[i] = $(selected).text().trim();
    });
    if (SelectedStandardIDs.length <= 0) {
        SelectedStandardIDs.push(defaultValue);
        SelectedStandardNames.push(defaultText);
    }

    var SelectedEPIDs = [];
    var SelectedEPNames = [];
    $('#AMPEP :selected').each(function (i, selected) {
        SelectedEPIDs[i] = $(selected).val();
        SelectedEPNames[i] = $(selected).text().trim();
    });
    if (SelectedEPIDs.length <= 0) {
        SelectedEPIDs.push(defaultValue);
        SelectedEPNames.push(defaultText);
    }

    if ($('#hdnSitesCount').val() == 1) {
        SelectedSiteName = $('#hdnSingleSiteName').val();
    }
    else {
        SelectedSiteName = $("#SiteSelector_SelectedSiteName").val();
    }

    var searchset = {
        SelectedSiteName: SelectedSiteName,
        SelectedSiteIDs: ERSites.getSelectedSites(),
        ProgramIDs: ProgramIDs.toString(),
        ProgramNames: ProgramNames.toString().replace(/,/g, ", "),
        SelectedChapterIDs: SelectedChapterIDs.toString(),
        SelectedChapterNames: SelectedChapterNames.toString(),
        shortChaptersShow: shortChaptersShow.toString().replace(/,/g, ", "),
        SelectedStandardIDs: SelectedStandardIDs.toString(),
        SelectedStandardNames: SelectedStandardNames.toString().replace(/,/g, ", "),
        SelectedEPIDs: SelectedEPIDs.toString(),
        SelectedEPNames: SelectedEPNames.toString().replace(/,/g, ", "),

        GrpBy: $('input[name=grpBy]:checked').val(),

        IncludeFSA: $('#FSAGraphCheckbox').is(':checked'),
        StartDate: kendo.toString($("#ObsstartDate").data("kendoDatePicker").value(), "MM/dd/yyyy"),
        EndDate: kendo.toString($("#ObsEndDate").data("kendoDatePicker").value(), "MM/dd/yyyy"),
        ReportTitle: $('#hdnReportTitle').val(),
        SelectedSiteHCOIDs: "",
        LevelIdentifier: LevelIdentifier,
        LevelTypeIdentifier: LevelTypeIdentifier,

        ScoreType: $('input[name=scoretype]:checked').val(),
        LikeliHood: LikeliHood,
        Scope: Scope,
        MatrixID: MatrixID
    }

    return searchset;
}

//Withemail parameter is optional 
function GenerateReport(GenfromSavedFilters, Withemail) {
    //$('.loading').hide();

    ShowLoader(true);

    //SetLoadingImageVisibility(false);
    hasExcelData = true;
    saferMatrixGenerated = false;

    setTimeout(function () { GenerateReportAddCall();}, 500);
    
}

function GenerateReportAddCall() {

    

    $('#loadChartView').html('');

    if ($('input[name=grpBy]:checked').val() == "Site") {
        groupbySite = true;
    } else {
        groupbySite = false;
    }
    ExcelGenerated = true;
    // reset values
    LevelIdentifier = 1;
    SelectedProgramName = "Hospital";

    SelectedProgramID = GetMultiSiteProgramSelectedValue();
    SelectedChapteID = 0;
    SelectedChapterName = "";
    SelectedStandardName = "";
    SelectedStandardTextID = "";
    SelectedEPName = "";
    SelectedEPTextID = "";
    SelectedHCOName = "";
    SelectedSiteID = 0;
    ExportReportName = "";
    OrgRanking3Name = "";
    OrgRanking2Name = "";


    $.ajax({
        async: false,
        url: '/Corporate/SaferMatrix/LoadSaferMatrix',
        dataType: "html",

        success: function (data) {
            $('#loadChartView').html(data);
            //   EnableDisableChartView(true);

            //blockElement("divL1tag");


            Level1Load('', '');

            
        },
        error: function (response) {
            var err = response;

            
        }
    });
}

function SetDefaults() {
    $('#loadChartView').html('');
    LevelIdentifier = 1;
    SelectedProgramName = "Hospital";
    SelectedProgramID = 2;
    SelectedChapteID = 0;
    SelectedChapterName = "";
    SelectedStandardName = "";
    SelectedStandardTextID = "";
    SelectedEPName = "";
    SelectedEPTextID = "";
    SelectedHCOName = "";
    SelectedSiteID = 0;
    ExportReportName = "";
    groupbySite = true;
    OrgRanking3Name = "";
    OrgRanking2Name = "";
    if ($('#hdnSitesCount').val() == 1) {
        $('input[name=grpBy][value=Chapter]').prop('checked', true);

    }
    else {
        $('input[name=grpBy][value=Site]').prop('checked', true);

    }
    $('input[name=scoretype][value=3]').prop('checked', true);

    CheckboxChecked('False', 'FSAGraphCheckbox');
    var dateRangedeselect = $('input[name=DateRange]:checked').val();
    $('input:radio[id*=' + dateRangedeselect + ']').prop('checked', false);
    ResetCriteriaDates();
    ResetStandardsMultiSelect();
    EnableDisableEmail(false);
}

$(document).ready(function () {
    // Reset these additional parameters
    $("#resetfiltersbutton").click(function () {


        SetDefaults();
    });

    if ($.isNumeric($('#lblReportScheduleID').html())) {
        GetSavedParameters($('#lblReportScheduleID').html());
    }

});

function showlevelSummary() {
    switch (LevelIdentifier) {
        case 1:
            var checkLevel1Summaryexists = $("#divlevelSummary");
            if (!checkLevel1Summaryexists.data("kendoGrid")) {
                createLevel1Summary('', '');
            }

            $('#divlevelchartParent').css("display", "none");
            $('#divleveldata').css("display", "none");
            $('#divlevelSummary').css("display", "inline-block");

            if (ProgramChangedSummary) {
                ProgramChangedSummary = false;
                LevelReload();
            }
            break;
        case 2:
            if (groupbySite) {
                var checkLevel2Summaryexists = $("#divlevel2Summary");
                if (!checkLevel2Summaryexists.data("kendoGrid")) {
                    createLevel2Summary();
                }

                $('#divlevel2data').css("display", "none");
                $('#divlevel2chart').css("display", "none");
                $('#divlevel2Summary').css("display", "inline-block");
            }
            else {
                var checkLevel3Summaryexists = $("#divlevel3Summary");
                if (!checkLevel3Summaryexists.data("kendoGrid")) {
                    createLevel3Summary();
                }

                $('#divlevel3data').css("display", "none");
                $('#divlevel3chart').css("display", "none");
                $('#divlevel3Summary').css("display", "inline-block");
            }

            break;
        case 3:
            if (groupbySite) {
                var checkLevel3Summaryexists = $("#divlevel3Summary");
                if (!checkLevel3Summaryexists.data("kendoGrid")) {
                    createLevel3Summary();
                }

                $('#divlevel3data').css("display", "none");
                $('#divlevel3chart').css("display", "none");
                $('#divlevel3Summary').css("display", "inline-block");
            }
            else {
                var checkLevel2Summaryexists = $("#divlevel2Summary");
                if (!checkLevel2Summaryexists.data("kendoGrid")) {
                    createLevel2Summary();
                }

                $('#divlevel2data').css("display", "none");
                $('#divlevel2chart').css("display", "none");
                $('#divlevel2Summary').css("display", "inline-block");
            }

            break;
        case 4:
            var checkLevel4Summaryexists = $("#divlevel4Summary");
            if (!checkLevel4Summaryexists.data("kendoGrid")) {

                createLevel4Summary();
            }

            $('#divlevel4data').css("display", "none");
            $('#divlevel4chart').css("display", "none");
            $('#divlevel4Summary').css("display", "inline-block");
            break;
    }
}

function showlevelData() {

    switch (LevelIdentifier) {
        case 1:
            var checkLevel1Dataexists = $("#divleveldata");
            if (!checkLevel1Dataexists.data("kendoGrid")) {
                createLevel1Data('', '');
            }

            $('#divlevelchartParent').css("display", "none");
            $('#divleveldata').css("display", "block");
            $('#divlevelSummary').css("display", "none");
            if (ProgramChangedDetail) {
                ProgramChangedDetail = false;
                LevelReload();
            }
            break;
        case 2:
            if (groupbySite) {
                var checkLevel2Dataexists = $("#divlevel2data");
                if (!checkLevel2Dataexists.data("kendoGrid")) {
                    createLevel2Data();
                }

                $('#divlevel2data').css("display", "block");
                $('#divlevel2chart').css("display", "none");
                $('#divlevel2Summary').css("display", "none");
            }
            else {
                var checkLevel3Dataexists = $("#divlevel3data");
                if (!checkLevel3Dataexists.data("kendoGrid")) {
                    createLevel3Data();
                }

                $('#divlevel3data').css("display", "block");
                $('#divlevel3chart').css("display", "none");
                $('#divlevel3Summary').css("display", "none");
            }

            break;
        case 3:
            if (groupbySite) {
                var checkLevel3Dataexists = $("#divlevel3data");
                if (!checkLevel3Dataexists.data("kendoGrid")) {
                    createLevel3Data();
                }

                $('#divlevel3data').css("display", "block");
                $('#divlevel3chart').css("display", "none");
                $('#divlevel3Summary').css("display", "none");
            }
            else {
                var checkLevel2Dataexists = $("#divlevel2data");
                if (!checkLevel2Dataexists.data("kendoGrid")) {
                    createLevel2Data();
                }

                $('#divlevel2data').css("display", "block");
                $('#divlevel2chart').css("display", "none");
                $('#divlevel2Summary').css("display", "none");
            }

            break;
        case 4:
            var checkLevel4Dataexists = $("#divlevel4data");
            if (!checkLevel4Dataexists.data("kendoGrid")) {

                createLevel4Data();
            }

            $('#divlevel4data').css("display", "block");
            $('#divlevel4chart').css("display", "none");
            $('#divlevel4Summary').css("display", "none");
            break;
        case 5:
            var checkLevel5Dataexists = $("#divlevel5data");
            if (!checkLevel5Dataexists.data("kendoGrid")) {
                createLevel5Data();
            }

            $('#divlevel5data').css("display", "block");
            $('#divlevel5chart').css("display", "none");
            break;


    }

}
function showlevelGraph() {

    switch (LevelIdentifier) {
        case 1:
            $('#divlevelchartParent').css("display", "block");
            $('#divleveldata').css("display", "none");
            $('#divlevelSummary').css("display", "none");
            if (ProgramChangedGraph) {
                ProgramChangedGraph = false;
                LevelReload();
            }
            break;
        case 2:
            if (groupbySite) {
                $('#divlevel2chart').css("display", "block");
                $('#divlevel2data').css("display", "none");
                $('#divlevel2Summary').css("display", "none");
            }
            else {
                $('#divlevel3chart').css("display", "block");
                $('#divlevel3data').css("display", "none");
                $('#divlevel3Summary').css("display", "none");
            }

            break;
        case 3:
            if (groupbySite) {
                $('#divlevel3chart').css("display", "block");
                $('#divlevel3data').css("display", "none");
                $('#divlevel3Summary').css("display", "none");
            }
            else {
                $('#divlevel2chart').css("display", "block");
                $('#divlevel2data').css("display", "none");
                $('#divlevel2Summary').css("display", "none");
            }


            break;
        case 4:
            $('#divlevel4chart').css("display", "block");
            $('#divlevel4data').css("display", "none");
            $('#divlevel4Summary').css("display", "none");
            break;
        case 5:
            $('#divlevel5data').css("display", "none");
            break;


    }

}

function DisplayLevel() {


    LevelIdentifier = LevelIdentifier > 1 ? LevelIdentifier - 1 : LevelIdentifier;

    if (!groupbySite) {
        LevelIdentifier = LevelIdentifier == 3 ? LevelIdentifier - 1 : LevelIdentifier;
    }
    $("#previousLevelButton").removeClass('k-button k-state-focused');
    switch (LevelIdentifier) {
        case 1:
            MatrixID = 0;

            $("#divpreviouslevel").css("display", "none");
            $('#divL1Viewtag').css("display", "block");

            $('#divtoplevel1').css("display", "block");
            $('#divlevelchartParent').css("display", "block");
            $('#divlevelSummary').css("display", "none");
            $('#divleveldata').css("display", "none");

            $('#divlevel4chart').css("display", "block");
            $('#divlevel4data').css("display", "none");

            if (groupbySite) {
                $('#divtoplevel2').css("display", "none");
                var levelkendogrid = $("#divlevel2data");
                if (levelkendogrid.data("kendoGrid")) {

                    $("#divlevel2data").data("kendoGrid").destroy();
                    $("#divlevel2data").empty();
                }
            }
            else {
                var levelkendogrid = $("#divlevel3data");
                if (levelkendogrid.data("kendoGrid")) {

                    $("#divlevel3data").data("kendoGrid").destroy();
                    $("#divlevel3data").empty();
                }
                $('#divtoplevel3').css("display", "none");
            }
            break;
        case 2:
            $('#divL1Viewtag').css("display", "block");
            if (groupbySite) {
                $('#divtoplevel2').css("display", "block");
                $('#divtoplevel3').css("display", "none");
                $('#divlevel2chart').css("display", "block");
                $('#divlevel2data').css("display", "none");
                var levelkendogrid = $("#divlevel3data");
                if (levelkendogrid.data("kendoGrid")) {

                    $("#divlevel3data").data("kendoGrid").destroy();
                    $("#divlevel3data").empty();
                }
            }
            else {
                $('#divtoplevel3').css("display", "block");
                $('#divtoplevel2').css("display", "none");
                $('#divlevel3chart').css("display", "block");
                $('#divlevel3data').css("display", "none");

                var levelkendogrid = $("#divlevel2data");
                if (levelkendogrid.data("kendoGrid")) {

                    $("#divlevel2data").data("kendoGrid").destroy();
                    $("#divlevel2data").empty();
                }
                $('#divlevel4chart').css("display", "block");
                $('#divlevel4data').css("display", "none");
            }

            break;
        case 3:
            $('#divL1Viewtag').css("display", "block");
            if (groupbySite) {
                $('#divtoplevel3').css("display", "block");
                $('#divtoplevel4').css("display", "none");
                $('#divlevel3chart').css("display", "block");
                $('#divlevel3data').css("display", "none");


            }
            else {
                $('#divtoplevel4').css("display", "none");
                $('#divtoplevel2').css("display", "block");
                $('#divlevel2chart').css("display", "block");
                $('#divlevel2data').css("display", "none");

            }
            $('#divlevel4chart').css("display", "block");
            $('#divlevel4data').css("display", "none");

            var levelkendogrid = $("#divlevel4data");
            if (levelkendogrid.data("kendoGrid")) {

                $("#divlevel4data").data("kendoGrid").destroy();
                $("#divlevel4data").empty();
            }
            break;
        case 4:
            $('#divtoplevel4').css("display", "block");
            $('#divtoplevel5').css("display", "none");
            $('#divlevel4chart').css("display", "block");
            $('#divlevel4data').css("display", "none");
            break;
    }
    $("#exportoexcel").css("display", "none");
    $("#exporttopdf").css("display", "block");
    DisplayLevelParameters();

}

function setSiteID() {
    if ($("#SiteSelector_SelectedHCOIDs").val().length > 0)
        $("#spanSelParameters3").html("HCOID: " + $("#SiteSelector_SelectedHCOIDs").val());
    else
        $("#spanSelParameters3").html("HCOID: " + ChartSearch.SelectedSiteHCOIDs);


}
function DisplayLevelParameters(ChartSearch) {

    if (ChartSearch === undefined) {
        ChartSearch = SetParameters();
        ChartSearch.LikeliHood = LikeliHood;
        ChartSearch.Scope = Scope;

        GetReportHcoIDs(ChartSearch.SelectedSiteIDs);

    }



    $('#spanSelParameters2').html('Chapter: ' + ChartSearch.shortChaptersShow + '; ' + 'Standard: ' + ChartSearch.SelectedStandardNames + '; ' + 'EP: ' + ChartSearch.SelectedEPNames);


    setTimeout(function () {
        setSiteID();
    }, 2000);


    $("#spanSelParameters4").html("");
    $("#spanSelParameters5").html("");
    $('#spanSelParameters6').html("");
    switch (LevelIdentifier) {
        case 1:
            if (LevelTypeIdentifier === 1)
                $("#spanSelParameters1").html("SAFER Matrix by Program");
            else
                $("#spanSelParameters1").html("SAFER Findings by Program");
            break;
        case 2:
            if (groupbySite) {
                $("#spanSelParameters1").html("SAFER Findings by Site");
            }
            else {
                $("#spanSelParameters1").html("SAFER Findings by Chapter");
            }
            $("#spanSelParameters2").html("Program: " + SelectedProgramName + '; ' + $("#spanSelParameters2").html());
            $('#spanSelParameters6').html("Likelihood: " + ChartSearch.LikeliHood + '; ' + 'Scope: ' + ChartSearch.Scope);
            break;
        case 3:

            $("#spanSelParameters1").html("SAFER Findings by Chapter");
            $("#spanSelParameters2").html("Program: " + SelectedProgramName + '; ' + $("#spanSelParameters2").html());
            $('#spanSelParameters6').html("Likelihood: " + ChartSearch.LikeliHood + '; ' + 'Scope: ' + ChartSearch.Scope);

            break;
        case 4:

            $("#spanSelParameters1").html("SAFER Findings by EP");
            $("#spanSelParameters2").html("Program: " + SelectedProgramName + '; ' + $("#spanSelParameters2").html());
            $('#spanSelParameters6').html("Likelihood: " + ChartSearch.LikeliHood + '; ' + 'Scope: ' + ChartSearch.Scope);

            break;
    }

    var scoreType = '';
    switch (ChartSearch.ScoreType) {
        case '1':
            scoreType = '; Score Type: Individual';
            break;
        case '2':
            scoreType = '; Score Type: Preliminary';
            break;
        case '3':
            scoreType = '; Score Type: Final';
            break;
        case '4':
            scoreType = '; Score Type: Mock Survey';
            break;
    }

    if (ChartSearch.StartDate != null && ChartSearch.EndDate != null) {
        $("#spanSelParameters4").html("Score Date: " + ChartSearch.StartDate + " - " + ChartSearch.EndDate + scoreType);
    }
    else if (ChartSearch.StartDate != null && ChartSearch.EndDate == null) {
        $("#spanSelParameters4").html("Score Date since " + ChartSearch.StartDate + scoreType);
    }
    else if (ChartSearch.StartDate == null && ChartSearch.EndDate != null) {
        $("#spanSelParameters4").html("Score Date through " + ChartSearch.EndDate + scoreType);
    }
    else {
        $("#spanSelParameters4").html("All Score Dates" + scoreType);
    }

    var groupatparameter = "";
    if (groupbySite) {
        groupatparameter = "Group By at Program Level: By Site"
    }
    else {
        groupatparameter = "Group By at Program Level: By Chapter"
    }
    if (ChartSearch.IncludeFSA) {
        groupatparameter = groupatparameter + ", Only FSA EPs";
    }
    $("#spanSelParameters5").html(groupatparameter);


    //{ $("#spanSelParameters8").html("Mock Survey: " + ChartSearch.SelectedMockSurveyNames); }
    //{ $("#spanSelParameters9").html("Participated as Team Lead: " + ChartSearch.SelectedMockSurveyLeadNames); }
    //{ $("#spanSelParameters10").html("Participated as Team Member: " + ChartSearch.SelectedMockSurveyMemberNames); }
    ScrollToTopCall();
}


//Level 1 scripts start
function createLevel1Chart(data, ChartSearch) {

    detailsTemplate = kendo.template($('#SaferMatrixTemplate').html());

    try {
        $('#divlevelchart').html(detailsTemplate(data));
        $('#divlevelchart').css("display", "block");
        saferMatrixGenerated = true;
        $('#showerror_msgInternal').slideUp('slow');
    }
    catch (ex) { }

    $('.negativeMargin').matchHeight();

    if (ChartSearch.ScoreType === "4") {
        $('#immediateThreatRow').css('display', 'block');
    }
    else {
        $('#immediateThreatRow').css('display', 'none');
    }

}



var Level1SummarySource = "";
function levelOneSummaryData(programId, programName) {
    var ChartSearch = SetSearchCriteria(false);
    DisplayLevelParameters(ChartSearch);


    if (programName.length > 0) {
        ChartSearch.ProgramIDs = programId;
        ChartSearch.ProgramNames = programName;
    }

    hasExcelData = true;
    return new kendo.data.DataSource({
        transport: {
            read: {
                // the remote service url
                url: "/Corporate/SaferMatrix/SaferReport_Data",

                // the request type
                type: "post",

                // the data type of the returned result
                dataType: "json",

                // additional custom parameters sent to the remote service
                data: { search: ChartSearch, LevelIdentifier: 1, LevelTypeIdentifier: 2 }
            }
        },
        aggregate: [{ field: "EPs", aggregate: "sum" }],
        requestEnd: function (e) {

            if (e.response != null) {

                if (e.response.length === 0) {
                }
                else {
                    closeSlide("btnSearchCriteria", "slideSearch");

                }
            }
            // EnableDisableChartView(false);
            //unBlockElement("divL1tag");

            
        }
    });
}
function createLevel1Summary(programId, programName) {
    Level1SummarySource = levelOneSummaryData(programId, programName);
    Level1SummarySource.sync();
    $("#divlevelSummary").kendoGrid({
        dataSource: Level1SummarySource,
        change: onLevel1Click,
        excel: { allPages: true },
        excelExport: ERexcelExport,
        selectable: true,
        sortable: true,
        scrollable: false,
        columns: [

            { field: "ScoreName", width: 175, title: "Likelihood/Scope" },
            { field: "EPs", width: 150, title: "# of EPs", aggregates: ["sum"], footerTemplate: "Total Count: #=sum#" }

        ]
    });
}

var Level1data = "";
function levelOneData(programId, programName) {

    var ChartSearch = SetSearchCriteria(false);
    DisplayLevelParameters(ChartSearch);

    if (programName.length > 0) {
        ChartSearch.ProgramIDs = programId;
        ChartSearch.ProgramNames = programName;
    }

    hasExcelData = true;
    return new kendo.data.DataSource({
        transport: {
            read: {
                // the remote service url
                url: "/Corporate/SaferMatrix/SaferReport_Data",

                // the request type
                type: "post",

                // the data type of the returned result
                dataType: "json",

                // additional custom parameters sent to the remote service
                data: { search: ChartSearch, LevelIdentifier: 1, LevelTypeIdentifier: 3 }
            }
        },
        pageSize: 20,
        requestEnd: function (e) {

            if (e.response != null) {

                if (e.response.length === 0) {
                }
                else {
                    closeSlide("btnSearchCriteria", "slideSearch");

                }
            }
            // EnableDisableChartView(false);
            //unBlockElement("divL1tag");
        }
    });
}
function createLevel1Data(programId, programName) {
    Level1data = levelOneData(programId, programName);
    Level1data.sync();

    $("#divleveldata").kendoGrid({
        dataSource: Level1data,
        pageable: {
            refresh: true,
            pageSizes: [20, 50, 100]
        },
        change: onLevel1Click,
        excel: { allPages: true },
        excelExport: ERexcelExport,
        selectable: true,
        sortable: true,
        columns: [
            { field: "SiteName", width: 175, title: "Site Name" },
            { field: "HCOID", width: 175, title: "HCO ID" },
            { field: "Program", width: 175 },
            { field: "Location", width: 175 },
            { field: "ChapterText", width: 175 },
            { field: "StandardLabel", width: 175 },
            { field: "EPLabel", width: 35, title: "EP" },
            { field: "Likelihood", width: 175, title: "Likelihood to Harm" },
            { field: "Scope", width: 175 },
            { field: "Findings", width: 150, title: "Findings", hidden: "true" },
            { field: "Recommendations", width: 150, title: "Recommendations", hidden: "true" },
            { field: "POA", width: 150, title: "POA", hidden: "true" },
            { field: "MOS", width: 150, title: "Sustainment Plan", hidden: "true", menu: false },
            { field: "OrgNotes", width: 150, title: "Internal Org Notes", hidden: "true", menu: false },
            { field: "CompliantDate", width: 150, title: "POA Compliant by Date", hidden: "true", menu: false, },
            { field: "DocumentList", width: 150, title: "Linked Documents", hidden: "true", menu: false },
            { command: { text: "View Documentation", click: showDocuments }, title: "Documentation", width: "180px" }
        ]
    });

}




// code to call first level 

function Level1Load(programId, programName) {

    datasourcecall(programId, programName);
    //Level1dataSource.read();
    if (programName.length < 1)
        ReportProgramCall();
    $('#divlevelchartParent').css("display", "block");
    EnableDisableEmail(true);
}

var Level1dataSource = "";
function datasourcecall(programId, programName) {

    

    var ChartSearch = SetSearchCriteria(false);
    ChartSearch.MatrixID = 0;
    DisplayLevelParameters(ChartSearch);

    if (programName.length > 0) {
        ChartSearch.ProgramIDs = programId;
        ChartSearch.ProgramNames = programName;
    }


    $.ajax({
        url: '/Corporate/SaferMatrix/SaferReport_Data',
        cache: false,
        async: false,
        type: 'POST',
        data: JSON.stringify({ search: ChartSearch, LevelIdentifier: 1, LevelTypeIdentifier: 1 }),
        contentType: "application/json; charset=utf-8",
        success: function (e) {
            createLevel1Chart(e, ChartSearch);
            setChartHeight("divlevelchart", e.length);
            closeSlide("btnSearchCriteria", "slideSearch");

            //unBlockElement("divL1tag");

            HideLoader(true);
          
        },
        error: function (e) {
        
                closeSlide("btnEmail", "slideEmail");
                closeSlide("btnSearchCriteria", "slideSearch");

                $('#error_msgInternal').html('<div id="showerror_msgInternal" class="alert alert-info alert-dismissible" role="alert" style="display:none;">      <button type="button" class="close" data-dismiss="alert">            <span aria-hidden="true">&times;</span><span class="sr-only">Close</span>        </button>        <div id="show_msgInternal"></div>    </div>')
                $('#error_msgInternal').css("display", "block");
                $('#showerror_msgInternal').removeClass("alert-info").addClass("alert-danger");
                $('#showerror_msgInternal').slideDown('slow');
                $('#show_msgInternal').html("No data found for the selected program. Change the program and try again.");
                $('#divlevelchart').css("display", "none");
            

                //unBlockElement("divL1tag");

                HideLoader(true);
        }
    });

}

function SetLikelihoodScope(e) {
    LikeliHood = '';
    Scope = '';
    MatrixID = e;
    var stin = e.match(/.{1,2}/g);
    var likelihood = stin[0];
    var scope = stin[1];
    switch (likelihood) {
        case '10':
            LikeliHood = 'Immediate Threat To Life(ITL)';
            break;
        case '11':
            LikeliHood = 'Low';
            break;
        case '12':
            LikeliHood = 'Moderate';
            break;
        case '13':
            LikeliHood = 'High';
            break;
    }

    switch (scope) {
        case '00':
            Scope = 'Immediate Threat To Life(ITL)';
            break;
        case '21':
            Scope = 'Limited';
            break;
        case '22':
            Scope = 'Pattern';
            break;
        case '23':
            Scope = 'WideSpread';
            break;
    }

}

function onLevel1SeriesClick(e) {
    SetLikelihoodScope(e);
    EnableDisableChartView(true);
    LevelIdentifier = 2;

    $('#divtoplevel1').css("display", "none");

    if (groupbySite) {

        $('#divtoplevel2').css("display", "block");
        $('#divlevel2chart').css("display", "block");
        $('#divlevel2data').css("display", "none");
        Level2Load(e);

    }
    else {
        $('#divtoplevel3').css("display", "block");
        $('#divlevel3chart').css("display", "block");
        $('#divlevel3data').css("display", "none");

        Level3Load(e);

    }

    $("#divpreviouslevel").css("display", "block");
}
function empty(v) {
    var type = typeof v;
    if (type === 'undefined')
        return true;

    if (v === null)
        return true;
    if (v == undefined)
        return true;
    else
        return false;

}
function onLevel1Click(e) {
    EnableDisableChartView(true);
    $('input:radio[id*="radioL1Graph"]').prop('checked', true);
    LevelIdentifier = 2;
    //$('#divtoplevel1').css("display", "none");
    var data = this.dataItem(this.select());

    if (data != null) {
        var scoreID = '';
        var horiScore = '';
        var vertiScore = '';

        if (data.HorizontalScoreID != null)
            horiScore = data.HorizontalScoreID;
        else if (data.ScopeID != null)
            horiScore = data.ScopeID;

        if (data.VerticalScoreID != null)
            vertiScore = data.VerticalScoreID;
        else if (data.LikeID != null)
            vertiScore = data.LikeID;

        scoreID = vertiScore.toString() + horiScore.toString();

        onLevel1SeriesClick(scoreID.toString())
    }
}
// Level 1 scripts end

function setChartHeight(chartname, arraylength) {

    var heightchart = arraylength * 50;
    if (heightchart < 300)
    { heightchart = 300; }

    $('#' + chartname).css("height", heightchart);
}
function onDB(e) {
    //e.sender.options.series[0].labels.visible = function (point) {
    //    if (point.value < 1) {
    //        return false
    //    }
    //    else { return point.value }
    //}

}

// Level 2 scripts start
function onLevel2SeriesClick(e) {

    EnableDisableChartView(true);

    SelectedSiteID = e.dataItem.SiteID;
    SelectedSiteName = e.dataItem.SiteName;
    GetReportHcoIDs(SelectedSiteID);

    if (groupbySite) {
        LevelIdentifier = 3;
        $('#divtoplevel2').css("display", "none");
        $('#divtoplevel3').css("display", "block");
        $('#divlevel3chart').css("display", "block");
        $('#divlevel3data').css("display", "none");
        Level3Load(e.dataItem.SiteID, e.dataItem.SiteName);

    }
    else {
        LevelIdentifier = 4;
        $('#divtoplevel2').css("display", "none");
        $('#divtoplevel4').css("display", "block");
        $('#divlevel4chart').css("display", "block");
        $('#divlevel4data').css("display", "none");
        Level4Load();
    }
}
function onLevel2Click(e) {

    EnableDisableChartView(true);
    $('input:radio[id*="radioL1Graph"]').prop('checked', true);

    var data = this.dataItem(this.select());

    if (data != null) {
        var dataItemTarget = {
            SiteID: data.SiteID,
            SiteName: data.SiteName
        };

        var target = {
            dataItem: dataItemTarget
        }
        onLevel2SeriesClick(target);
    }
}

function createLevel2Chart() {

    $("#divlevel2chart").kendoChart({

        dataSource: Level2dataSource,
        title: {
            text: "Click graph for more details",
            color: "#C61835"
        },
        seriesDefaults: {
            type: "bar",
            labels: {
                visible: false,
                font: "bold 14px  Arial,Helvetica,sans-serif",
                position: "center",
                background: "transparent"
            }
        },
        legend: {
            position: "bottom"
        },
        series: [{
            field: "EPs",
            name: "Site Name",
            color: "#6495ED",
            axis: "Default",
            spacing: 1,
            gap: 1,
            labels: {
                visible: true,
                position: "center",
                padding: {
                    top: 30
                }
            }
        }],
        panes: [{
            name: "default-pane"
        }],
        categoryAxis: {
            field: "SiteName"
        },
        valueAxes: [{
            name: "Default",
            title: {
                text: "EPs"
            },
            pane: "default-pane"
        }],
        tooltip: {
            visible: true,
            format: "N0"
        },
        //End CateogryAxis
        seriesClick: onLevel2SeriesClick
    });
}

function createLevel2Summary() {

    $("#divlevel2Summary").kendoGrid({
        dataSource: Level2dataSource,
        change: onLevel2Click,
        excel: { allPages: true },
        excelExport: ERexcelExport,
        selectable: true,
        sortable: true,
        scrollable: false,
        columns: [

            { field: "SiteName", width: 175, title: "Site Name" },
            { field: "EPs", width: 150, title: "# of EPs", aggregates: ["sum"], footerTemplate: "Total Count: #=sum#" }

        ]
    });
}


var Level2data = "";
function levelTwoData() {

    var ChartSearch = SetSearchCriteria(false);
    ChartSearch.ProgramIDs = SelectedProgramID;
    ChartSearch.ProgramNames = SelectedProgramName;
    ChartSearch.MatrixID = MatrixID;
    ChartSearch.LikeliHood = LikeliHood;
    ChartSearch.Scope = Scope;
    DisplayLevelParameters(ChartSearch);

    hasExcelData = true;
    return new kendo.data.DataSource({
        transport: {
            read: {
                // the remote service url
                url: "/Corporate/SaferMatrix/SaferReport_Data",

                // the request type
                type: "post",

                // the data type of the returned result
                dataType: "json",

                // additional custom parameters sent to the remote service
                data: { search: ChartSearch, LevelIdentifier: 2, LevelTypeIdentifier: 3 }
            }
        },
        pageSize: 20,
        requestEnd: function (e) {

            if (e.response != null) {

                if (e.response.length === 0) {
                }
                else {
                    closeSlide("btnSearchCriteria", "slideSearch");

                }
            }
            // EnableDisableChartView(false);
            //unBlockElement("divL2tag");
        }
    });
}

function createLevel2Data() {
    Level2data = levelTwoData();
    Level2data.sync();

    $("#divlevel2data").kendoGrid({
        dataSource: Level2data,
        pageable: {
            refresh: true,
            pageSizes: [20, 50, 100]
        },
        change: onLevel2Click,
        excel: { allPages: true },
        excelExport: ERexcelExport,
        selectable: true,
        sortable: true,
        columns: [
            { field: "SiteName", width: 175, title: "Site Name" },
            { field: "HCOID", width: 175, title: "HCO ID" },
            { field: "Program", width: 175 },
            { field: "Location", width: 175 },
            { field: "ChapterText", width: 175 },
            { field: "StandardLabel", width: 175 },
            { field: "EPLabel", width: 35, title: "EP" },
            { field: "Likelihood", width: 175, title: "Likelihood to Harm" },
            { field: "Scope", width: 175 },
            { field: "Findings", width: 150, title: "Findings", hidden: "true" },
            { field: "Recommendations", width: 150, title: "Recommendations", hidden: "true" },
            { field: "POA", width: 150, title: "POA", hidden: "true" },
            { field: "MOS", width: 150, title: "Sustainment Plan", hidden: "true", menu: false },
            { field: "OrgNotes", width: 150, title: "Internal Org Notes", hidden: "true", menu: false },
            { field: "CompliantDate", width: 150, title: "POA Compliant by Date", hidden: "true", menu: false, },
            { field: "DocumentList", width: 150, title: "Linked Documents", hidden: "true", menu: false },
            { command: { text: "View Documentation", click: showDocuments }, title: "Documentation", width: "180px" }
        ]
    });
}

// code to call second level 
function Level2Load(e) {


    Level2dataSource = Level2datasourcecall();
    Level2dataSource.sync();
    createLevel2Chart();

}

var Level2dataSource = "";
var Level2MaxCount = 80;
function Level2datasourcecall() {

    var ChartSearch = SetSearchCriteria(true);
    ChartSearch.ProgramIDs = SelectedProgramID;
    ChartSearch.ProgramNames = SelectedProgramName;
    ChartSearch.MatrixID = MatrixID;
    ChartSearch.LikeliHood = LikeliHood;
    ChartSearch.Scope = Scope;

    if (groupbySite) {
        // do nothing
    }
    else {
        ChartSearch.SelectedChapterIDs = SelectedChapteID;
        ChartSearch.SelectedChapterNames = SelectedChapterName;
    }


    DisplayLevelParameters(ChartSearch);

    return new kendo.data.DataSource({
        transport: {
            read: {
                // the remote service url

                url: "/Corporate/SaferMatrix/SaferReport_Data",
                // the request type
                type: "post",

                // the data type of the returned result
                dataType: "json",

                // additional custom parameters sent to the remote service
                data: { search: ChartSearch, LevelIdentifier: 2, LevelTypeIdentifier: 1 }
            }
        },
        aggregate: [{ field: "EPs", aggregate: "sum" }],
        requestEnd: function (e) {
            if (e.response != null) {
                //setChartHeight("divlevel2chart", e.response.length);
                //Get the max FindingCount
            }
            EnableDisableChartView(false);
        }
    });
}
// Level 2 scripts end

// Level 3 scripts start
function createLevel3Chart() {
    $("#divlevel3chart").kendoChart({

        dataSource: Level3dataSource,
        title: {
            text: "Click graph for more details",
            color: "#C61835"
        },
        seriesDefaults: {
            type: "bar",
            labels: {
                visible: true,
                font: "bold 14px  Arial,Helvetica,sans-serif",
                position: "center",
                background: "transparent",

            }
        },
        legend: {
            position: "bottom"
        },
        plotArea: {
            margin: {
                top: 20,
                left: 5,
                right: 5,
                bottom: 5
            }
        },
        series: [{
            field: "EPs",
            name: "Chapter",
            color: "#6495ED",
            axis: "Default",
            spacing: 1,
            gap: 1
        }],
        panes: [{
            name: "default-pane",
            clip: false
        }],
        categoryAxis: {
            field: "ChapterCode"
        },
        valueAxes: [{
            name: "Default",
            title: {
                text: "EPs"
            },
            min: 0,
            pane: "default-pane"
        }],
        tooltip: {
            visible: true,
            format: "N0"
        },
        //End CateogryAxis
        seriesClick: onLevel3SeriesClick
    });

}

var Level3data = "";
function levelThreeData() {

    var ChartSearch = SetSearchCriteria(false);
    ChartSearch.ProgramIDs = SelectedProgramID;
    ChartSearch.ProgramNames = SelectedProgramName;
    ChartSearch.MatrixID = MatrixID;
    ChartSearch.LikeliHood = LikeliHood;
    ChartSearch.Scope = Scope;


    if (groupbySite) {
        ChartSearch.SelectedSiteIDs = SelectedSiteID;
    }

    DisplayLevelParameters(ChartSearch);

    hasExcelData = true;
    return new kendo.data.DataSource({
        transport: {
            read: {
                // the remote service url
                url: "/Corporate/SaferMatrix/SaferReport_Data",

                // the request type
                type: "post",

                // the data type of the returned result
                dataType: "json",

                // additional custom parameters sent to the remote service
                data: { search: ChartSearch, LevelIdentifier: 3, LevelTypeIdentifier: 3 }
            }
        },
        pageSize: 20,
        requestEnd: function (e) {

            if (e.response != null) {

                if (e.response.length === 0) {
                }
                else {
                    closeSlide("btnSearchCriteria", "slideSearch");

                }
            }
            // EnableDisableChartView(false);
            //unBlockElement("divL3tag");
        }
    });
}


function createLevel3Data() {
    Level3data = levelThreeData();
    Level3data.sync();
    $("#divlevel3data").kendoGrid({
        dataSource: Level3data,
        pageable: {
            refresh: true,
            pageSizes: [20, 50, 100]
        },
        change: onLevel3Click,
        excel: { allPages: true },
        excelExport: ERexcelExport,
        selectable: false,
        sortable: true,
        columns: [
            { field: "SiteName", width: 175, title: "Site Name" },
            { field: "HCOID", width: 175, title: "HCO ID" },
            { field: "Program", width: 175 },
            { field: "Location", width: 175 },
            { field: "ChapterText", width: 175 },
            { field: "StandardLabel", width: 175 },
            { field: "EPLabel", width: 35, title: "EP" },
            { field: "Likelihood", width: 175, title: "Likelihood to Harm" },
            { field: "Scope", width: 175 },
            { field: "Findings", width: 150, title: "Findings", hidden: "true" },
            { field: "Recommendations", width: 150, title: "Recommendations", hidden: "true" },
            { field: "POA", width: 150, title: "POA", hidden: "true" },
            { field: "MOS", width: 150, title: "Sustainment Plan", hidden: "true", menu: false },
            { field: "OrgNotes", width: 150, title: "Internal Org Notes", hidden: "true", menu: false },
            { field: "CompliantDate", width: 150, title: "POA Compliant by Date", hidden: "true", menu: false, },
            { field: "DocumentList", width: 150, title: "Linked Documents", hidden: "true", menu: false },
            { command: { text: "View Documentation", click: showDocuments }, title: "Documentation", width: "180px" }
        ]
    });
}

function createLevel3Summary() {

    $("#divlevel3Summary").kendoGrid({
        dataSource: Level3dataSource,
        change: onLevel3Click,
        excel: { allPages: true },
        excelExport: ERexcelExport,
        selectable: true,
        sortable: true,
        scrollable: false,
        columns: [
            { field: "ChapterID", hidden: true },
            { field: "ChapterText", title: "Chapter Name" },
            { field: "EPs", width: 150, title: "# of EPs", aggregates: ["sum"], footerTemplate: "Total Count: #=sum#" }

        ]
    });
}
// code to call third level 

function Level3Load(SiteId, SiteName) {

    if (groupbySite) {
        SelectedSiteID = SiteId;
        SelectedSiteName = SiteName;
    }

    Level3dataSource = Level3datasourcecall();
    Level3dataSource.sync();

    createLevel3Chart();


}

var Level3dataSource = "";
function Level3datasourcecall() {

    var ChartSearch = SetSearchCriteria(true);
    ChartSearch.ProgramIDs = SelectedProgramID;
    ChartSearch.ProgramNames = SelectedProgramName;
    ChartSearch.MatrixID = MatrixID;
    ChartSearch.LikeliHood = LikeliHood;
    ChartSearch.Scope = Scope;


    if (groupbySite) {
        ChartSearch.SelectedSiteIDs = SelectedSiteID;
    }

    DisplayLevelParameters(ChartSearch);
    //setChartHeight("divlevel3chart", 12);


    return new kendo.data.DataSource({
        transport: {
            read: {
                // the remote service url
                url: "/Corporate/SaferMatrix/SaferReport_Data",

                // the request type
                type: "post",

                // the data type of the returned result
                dataType: "json",

                // additional custom parameters sent to the remote service
                data: { search: ChartSearch, LevelIdentifier: 3, LevelTypeIdentifier: 1 }
            }
        },
        requestEnd: function (e) {
            if (e.response != null) {
                //setChartHeight("divlevel3chart", e.response.length);
            }
            EnableDisableChartView(false);
        },
        aggregate: [{ field: "EPs", aggregate: "sum" }]
    });
}

function onLevel3SeriesClick(e) {

    if (e.dataItem.ChapterID != "999") {
        EnableDisableChartView(true);

        LevelIdentifier = 4;
        $('#divtoplevel4').css("display", "block");
        $('#divtoplevel3').css("display", "none");

        $('#divlevel4data').css("display", "block");
        //showlevelData();
        Level4Load(e.dataItem.ChapterID, e.dataItem.ChapterText);
        $('input:radio[id*="radioL1Data"]').prop('checked', true);
        //$("input[type=radio]").attr('disabled', true);
        $("#exportoexcel").css("display", "block");
        $("#exporttopdf").css("display", "none");
        $('#divlevel4data').css("display", "block");
        $('#divlevel4chart').css("display", "none");
        $('#divL1Viewtag').css("display", "none");

    }


}

function onLevel3Click(e) {

    EnableDisableChartView(true);

    $('input:radio[id*="radioL1Graph"]').prop('checked', true);
    var data = this.dataItem(this.select());
    if (data != null) {

        var dataItemTarget = {
            ChapterID: data.ChapterID
        };

        var target = {
            dataItem: dataItemTarget
        }
        onLevel3SeriesClick(target);
    }
}
// Level 3 scripts end

// Level 4 scripts start
var wnd, detailsTemplate;
function createLevel4Data() {
    $("#divlevel4data").kendoGrid({
        dataSource: Level4dataSource,
        pageable: {
            refresh: true,
            pageSizes: [20, 50, 100]
        },
        clickable: false,
        selectable: false,
        sortable: true,
        cursor: "pointer",
        scrollable: true,
        excel: { allPages: true },
        excelExport: ERexcelExport,
        columns: [
            { field: "SiteName", width: 175, title: "Site Name" },
            { field: "HCOID", width: 175, title: "HCO ID" },
            { field: "Program", width: 175 },
            { field: "Location", width: 175 },
            { field: "ChapterText", width: 175 },
            { field: "StandardLabel", width: 175 },
            { field: "EPLabel", width: 35, title: "EP" },
            { field: "Likelihood", width: 175, title: "Likelihood to Harm" },
            { field: "Scope", width: 175 },
            { field: "Findings", width: 150, title: "Findings", hidden: "true" },
            { field: "Recommendations", width: 150, title: "Recommendations", hidden: "true" },
            { field: "POA", width: 150, title: "POA", hidden: "true" },
            { field: "MOS", width: 150, title: "Sustainment Plan", hidden: "true", menu: false },
            { field: "OrgNotes", width: 150, title: "Internal Org Notes", hidden: "true", menu: false },
            { field: "CompliantDate", width: 150, title: "POA Compliant by Date", hidden: "true", menu: false, },
            { field: "DocumentList", width: 150, title: "Linked Documents", hidden: "true", menu: false },
            { command: { text: "View Documentation", click: showDocuments }, title: "Documentation", width: "180px" }
        ]
    });
}

function LargeGridResize() {
    //Define Elements Needed
    var grid = $("#divlevel4data");
    var header = grid.find(".k-grid-header");

    //Get the Grid Element and Areas Inside It
    var contentArea = grid.find(".k-grid-content");  //This is the content Where Grid is located

    var count = grid.data("kendoGrid").dataSource.data().length;
    //Apply the height for the content area
    if (count > 5) {
        // alert(contentArea.height);
        grid.height(260 + header.height());
        contentArea.height(260);
    }
    else {

        if (count < 3) {
            if (count == 1) {
                grid.height((count * 70) + header.height());
                contentArea.height((count * 70));
            }
            else {
                grid.height((count * 60) + header.height());
                contentArea.height((count * 60));
            }

        }
        else {
            grid.height((count * 52) + header.height());
            contentArea.height((count * 52));
        }

    }
}
function showDocuments(e) {
    e.preventDefault();
    wnd = $("#divDetail").kendoWindow({
        title: "Documentation",
        modal: true,
        visible: false,
        resizable: false,
        width: 550,
        position: {
            top: 10
        }
    }).data("kendoWindow");
    wnd.title("Documents");
    detailsTemplate = kendo.template($("#DocumentTemplate").html());

    var dataItem = this.dataItem($(e.currentTarget).closest("tr"));
    dataItem.HCOID = dataItem.HCOID == null ? dataItem.HCOID : dataItem.HCOID.toString().trim();
    wnd.content(detailsTemplate(dataItem));
    wnd.center().open();
}

function Level4Load(ChapterID, ChapterCode) {

    SelectedChapterID = ChapterID;
    SelectedChapterName = ChapterCode;


    Level4dataSource = Level4datasourcecall();
    Level4dataSource.sync();
    // createLevel4Chart();
    createLevel4Data();
    // LargeGridResize();
}

var Level4dataSource = "";
function Level4datasourcecall() {

    var ChartSearch = SetSearchCriteria(true);

    ChartSearch.SelectedChapterIDs = SelectedChapterID;
    ChartSearch.SelectedChapterNames = SelectedChapterName
    ChartSearch.shortChaptersShow = ChartSearch.shortChaptersShow;
    ChartSearch.ProgramIDs = SelectedProgramID;
    ChartSearch.ProgramNames = SelectedProgramName;
    ChartSearch.MatrixID = MatrixID;
    ChartSearch.LikeliHood = LikeliHood;
    ChartSearch.Scope = Scope;

    if (groupbySite) {
        ChartSearch.SelectedSiteIDs = SelectedSiteID;
    }

    DisplayLevelParameters(ChartSearch);



    return new kendo.data.DataSource({
        transport: {
            read: {
                // the remote service url
                url: "/Corporate/SaferMatrix/SaferReport_Data",

                // the request type
                type: "post",

                // the data type of the returned result
                dataType: "json",

                // additional custom parameters sent to the remote service
                data: { search: ChartSearch, LevelIdentifier: 4, LevelTypeIdentifier: 1 }
            }
        },
        pageSize: 20,
        requestEnd: function (e) {
            if (e.response != null) {
                setChartHeight("divlevel4chart", e.response.length);
            }
            EnableDisableChartView(false);
        }
    });
}

// Common scripts start 
var onLevel4DataBound = function () {
    dataView = this.dataSource.view();
    for (var i = 0; i < dataView.length; i++) {
        var obj = $("#grid tbody").find("tr[data-uid=" + dataView[i].uid + "]");

        if (dataView[i].TJCFinding.length == 0) {
            $('[data-uid=' + model.uid + ']').find(".k-grid-ViewFindings").attr("style", "visibility: hidden")
        }
        if (dataView[i].Mock_Survey_Finding.length == 0) {
            $('[data-uid=' + model.uid + ']').find(".k-grid-ViewMockSurveyFindings").attr("style", "visibility: hidden")
        }
    }
};

function ERPDFExportByLevel() {

    var dataSource = "";

    switch (LevelIdentifier) {
        case 1:
            ExportReportName = "SAFER Findings Report - Group by Program";
            var levelkendogrid = $("#divleveldata");
            if (levelkendogrid.data("kendoGrid")) {
                dataSource = $("#divleveldata").data("kendoGrid").dataSource;
            }
            break;
        case 2:
            if (groupbySite) {
                ExportReportName = "SAFER Findings Report - Group by Site";
                var levelkendogrid = $("#divlevel2data");
                if (levelkendogrid.data("kendoGrid")) {
                    dataSource = $("#divlevel2data").data("kendoGrid").dataSource;
                }

            }
            else {
                ExportReportName = "SAFER Findings Report - Group by Chapter";

                var levelkendogrid = $("#divlevel3data");
                if (levelkendogrid.data("kendoGrid")) {
                    dataSource = $("#divlevel3data").data("kendoGrid").dataSource;
                }

                //var levelkendogrid = $("#divlevel3chart");
                //if (levelkendogrid.data("kendoChart")) {
                //    dataSource = $("#divlevel3chart").data("kendoChart").dataSource;
                //}


            }

            break;
        case 3:
            ExportReportName = "SAFER Findings Report - Group by Chapter";
            var levelkendogrid = $("#divlevel3data");
            if (levelkendogrid.data("kendoGrid")) {
                dataSource = $("#divlevel3data").data("kendoGrid").dataSource;
            }

            break;
        case 4:
            ExportReportName = "SAFER Findings Report - Findings by EP";
            var levelkendogrid = $("#divlevel4data");
            if (levelkendogrid.data("kendoGrid")) {
                dataSource = $("#divlevel4data").data("kendoGrid").dataSource;
            }
            break;

    }
    var sorts = "";
    if (dataSource != "") {
        sorts = dataSource.sort();
    }
    var dataSortBy = "";
    var dataSortOrder = "";

    if (sorts != null) {
        if (sorts.length > 0) {
            //  sorts[0].
            dataSortBy = sorts[0].field.toString();
            dataSortOrder = sorts[0].dir.toString();
        }
    }

    if (fromemail) {
        if (hasExcelData) {

            $.ajax({
                type: "Post",
                url: "/Corporate/SaferMatrix/CreateERSessionCriteria",
                contentType: "application/json",
                data: JSON.stringify({ ERsearch: SetParameters() })

            }).done(function (e) {
                $(function () {
                    $.post('/Corporate/SaferMatrix/SendERPDFEmail',
                        { ExcelGridName: ExportReportName, email: $.parseJSON(sessionStorage.getItem('searchsetemailsession')), ERReportName: "CorporateFinding", SortBy: dataSortBy, SortOrder: dataSortOrder }, function (data) {
                            fromemail = false;
                            if (data != "Preping Second Attachment") {
                                if (data != "Successfully sent report to the email account(s)") {
                                    ShowEmailStatus(data, 'failure');
                                }
                                else {
                                    ShowEmailStatus(data, 'success');
                                }
                            }

                        });
                });
            });
        }
    }
    else {

        $.ajax({
            type: "Post",
            url: "/Corporate/SaferMatrix/CreateERSessionCriteria",
            contentType: "application/json",
            data: JSON.stringify({ ERsearch: SetParameters() })

        }).done(function (e) {


            $(function () {
                $.post(
                    '/Corporate/SaferMatrix/createErPdf',
                    { ExcelGridName: ExportReportName, ERReportName: "CorporateFinding", SortBy: dataSortBy, SortOrder: dataSortOrder }, function (data) {

                        if (data.exportCreated == "success") {
                            window.location = kendo.format("{0}{1}{2}{3}",
                                "/Export/exportPdfFileByLocation?ExportFileName=", ExportReportName,"&guid=", data.fileGuid);
                        }
                        else {
                            // to do - display failed export message
                        }
                        //unBlockElement("divL1tag");
                    });
            });

        });

    }
}
function ERExcelExportByLevel() {

    var isDetailView = false;
    var detailViewID = '';

    switch (LevelIdentifier) {
        case 1:
            ExportReportName = "SAFER Matrix Report - Findings by Program";

            switch (LevelTypeIdentifier) {
                case 1:
                case 2:
                    $("#divlevelSummary").getKendoGrid().saveAsExcel();
                    break;
                case 3:
                    isDetailView = true;
                    detailViewID = "#divleveldata";
                    break;
            }
            break;
        case 2:
            switch (LevelTypeIdentifier) {
                case 1:
                case 2:
                    if (groupbySite) {
                        ExportReportName = "SAFER Matrix Report - Findings by Site";
                        $("#divlevel2Summary").getKendoGrid().saveAsExcel();
                    }
                    else {
                        ExportReportName = "SAFER Matrix Report - Findings by Chapter";
                        $("#divlevel3Summary").getKendoGrid().saveAsExcel();
                    }
                    break;
                case 3:
                    isDetailView = true;
                    if (groupbySite) {
                        ExportReportName = "SAFER Matrix Report - Findings by Site";
                        detailViewID = "#divlevel2data";
                    }
                    else {
                        ExportReportName = "SAFER Matrix Report - Findings by Chapter";
                        detailViewID = "#divlevel3data";
                    }
                    break;
            }

            break;
        case 3:
            switch (LevelTypeIdentifier) {
                case 1:
                case 2:

                    if (groupbySite) {
                        ExportReportName = "SAFER Matrix Report - Findings by Site";
                        $("#divlevel3Summary").getKendoGrid().saveAsExcel();
                    }
                    break;
                case 3:

                    if (groupbySite) {
                        ExportReportName = "SAFER Matrix Report - Findings by Site";
                        isDetailView = true;
                        detailViewID = "#divlevel3data";
                    }
                    break;
            }
            break;
        case 4:
            ExportReportName = "SAFER Matrix Report - Finding by EP";
            isDetailView = true;
            detailViewID = "#divlevel4data";
            break;
    }

    if (isDetailView) {
        ShowHideDocumentationColumns(detailViewID, true);
        $(detailViewID).getKendoGrid().saveAsExcel();
        ShowHideDocumentationColumns(detailViewID, false);

    }
}

function stripHTML(html) {
    var tmp = document.createElement("DIV");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
}

function ERexcelExport(e) {
    e.preventDefault();
    var sheets = [
        e.workbook.sheets[0], AddExportParameters()

    ];
    sheets[0].title = "Report";
    sheets[1].title = "Report Selections";



    var rows = e.workbook.sheets[0].rows;

    for (var ri = 0; ri < rows.length; ri++) {
        var row = rows[ri];
        if (row.type != "header") {
            for (var ci = 0; ci < row.cells.length; ci++) {
                var cell = row.cells[ci];

                if (cell.value != null && kendo.parseDate(cell.value.toString()) != null) {//Valid date
                    cell.value = kendo.toString(kendo.parseDate(cell.value), 'MM/dd/yyyy');
                }

                if (cell.value && typeof (cell.value) === "string" && cell.value.length > 25) {
                    // Use jQuery.fn.text to remove the HTML and get only the text                
                    cell.value = stripHTML(cell.value);
                    // Set the alignment
                    // cell.hAlign = "right";
                }
            }
        }

    }


    var workbook = new kendo.ooxml.Workbook({
        sheets: sheets
    });

    if (fromemail) {
        var dataURL = workbook.toDataURL();
        dataURL = dataURL.split(";base64,")[1];
        var email = $.parseJSON(sessionStorage.getItem('searchsetemailsession'));
        email.Title = ExportReportName;
        $(function () {

            $.post('/Email/SendExcelEmail',
                { base64: dataURL, email: email }, function (data) {

                    if (data != "Preping Second Attachment") {
                        fromemail = false;
                        if (data != "Successfully sent report to the email account(s)") {
                            //$('#emailerror_msg').removeClass("alert-info").addClass("alert-danger");
                            ShowEmailStatus(data, 'failure');
                        }
                        else {
                            //$('#emailerror_msg').removeClass("alert-danger").addClass("alert-info");
                            ShowEmailStatus(data, 'success');
                        }
                        //$('#emailerror_msg').css("display", "block");
                        //$('#email_msg').html(data);
                    }

                });
        });

    }
    else {

        kendo.saveAs({
            dataURI: workbook.toDataURL(),
            fileName: ExportReportName + GetReportDateAdder() + ".xlsx",
            forceProxy: false,
            proxyURL: '/Export/Excel_Export_Save'
        })

        //unBlockElement("divL1tag");
    }
}

function SetParameters() {
    var ChartSearch = SetSearchCriteria(true);

    ChartSearch.ReportTitle = $('#txtScheduledReportName').val();
    ChartSearch.SelectedSiteHCOIDs = $("#SiteSelector_SelectedHCOIDs").val();
    ChartSearch.LevelIdentifier = LevelIdentifier;
    if (groupbySite)
        ChartSearch.ReportType = "BySite";
    else
        ChartSearch.ReportType = "ByChapter";

    ChartSearch.MatrixID = MatrixID;
    switch (LevelIdentifier) {
        case 1:
            ChartSearch.LevelIdentifier = 1;
            ChartSearch.ProgramNames = SelectedProgramName;
            ChartSearch.ProgramIDs = SelectedProgramID;
            ChartSearch.MatrixID = 0;
            break;
        case 2:
            if (groupbySite) {
                ChartSearch.ProgramNames = SelectedProgramName;
                ChartSearch.ProgramIDs = SelectedProgramID;
                ChartSearch.LevelIdentifier = 2;

            }
            else {
                ChartSearch.ProgramNames = SelectedProgramName;
                ChartSearch.ProgramIDs = SelectedProgramID;
                ChartSearch.LevelIdentifier = 3;
                ChartSearch.SelectedChapterNames = SelectedChapterName;
                //ChartSearch.SelectedChapterIDs = SelectedChapteID ;
            }
            break;
        case 3:
            if (groupbySite) {
                ChartSearch.ProgramNames = SelectedProgramName;
                ChartSearch.ProgramIDs = SelectedProgramID;
                ChartSearch.SelectedSiteIDs = SelectedSiteID;
            }
            else {
                ChartSearch.ProgramNames = SelectedProgramName;
                ChartSearch.ProgramIDs = SelectedProgramID;
                ChartSearch.SelectedSiteIDs = SelectedSiteID;
                ChartSearch.SelectedChapterNames = SelectedChapterName;
                ChartSearch.SelectedChapterIDs = SelectedChapterID;
                ChartSearch.LevelIdentifier = 4;
            }

            break;
        case 4:
            if (groupbySite) {
                ChartSearch.ProgramNames = SelectedProgramName;
                ChartSearch.ProgramIDs = SelectedProgramID;
                ChartSearch.SelectedChapterNames = SelectedChapterName;
                ChartSearch.SelectedChapterIDs = SelectedChapterID;
                ChartSearch.SelectedSiteIDs = SelectedSiteID;
                ChartSearch.LevelIdentifier = 4;
            }
            else {

                ChartSearch.ProgramNames = SelectedProgramName;
                ChartSearch.ProgramIDs = SelectedProgramID;
                ChartSearch.SelectedSiteIDs = SelectedSiteID;
                ChartSearch.SelectedChapterNames = SelectedChapterName;
                ChartSearch.SelectedChapterIDs = SelectedChapterID;
                ChartSearch.LevelIdentifier = 4;
            }
            break;
    }
    return ChartSearch;

}
function AddExportParameters() {

    var ChartSearch = SetParameters();

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
                    { value: "Site / HCO ID" },
                    { value: ChartSearch.SelectedSiteHCOIDs }
                ]
            },
            {
                cells: [
                    { value: "Program" },
                    { value: ChartSearch.ProgramNames }
                ]
            },
            {
                cells: [
                    { value: "Chapter" },
                    { value: ChartSearch.SelectedChapterNames }
                ]
            },
            {
                cells: [
                    { value: "Standard" },
                    { value: ChartSearch.SelectedStandardNames }
                ]
            },
            {
                cells: [
                    { value: "EP" },
                    { value: ChartSearch.SelectedEPNames }
                ]
            },

            {
                cells: [
                    { value: "Start Date" },
                    { value: ChartSearch.StartDate }
                ]
            },
            {
                cells: [
                    { value: "End Date" },
                    { value: ChartSearch.EndDate }
                ]
            },

            {
                cells: [
                    { value: "Group By" },
                    { value: groupbySite == true ? "Site" : "Chapter" }
                ]
            },

            {
                cells: [
                    { value: "Score Type" },
                    { value: GetScoreType() }
                ]
            },
            {
                cells: [
                    { value: "Only Include FSA EPs" },
                    { value: ChartSearch.IncludeFSA == true ? "True" : "False" }
                ]
            }
        ]
    }
    return stringvalue;

}

function GetScoreType() {
    switch ($('input[name=scoretype]:checked').val()) {
        case "1":
            return "Individual";
        case "2":
            return "Preliminary";
        case "3":
            return "Final";
        case "4":
            return "Mock Survey";
    }
}
// common scripts end

//Email Functionality start
function ERSendEmail() {

    if (!ExcelGenerated) {

        $.ajax({
            async: false,
            url: GenerateReport(false)
        }).done(function () {

            setTimeout(function () {

                if (hasExcelData) {
                    fromemail = true;

                    if ($('input[name=L1selectView]:checked').val() === "L1selectGraph") {

                        ERPDFExportByLevel();
                    } else {
                        ERExcelExportByLevel();
                    }


                }
                else {
                    fromemail = false;
                    //$('#emailerror_msg').removeClass("alert-info").addClass("alert-danger");
                    //$('#emailerror_msg').css("display", "block");
                    //$('#email_msg').html("No data found matching your Criteria. Change Criteria and try again.");
                    ShowEmailStatus("No data found matching your Criteria. Change Criteria and try again.", 'failure');
                }



            }, 2000);
        })


    }
    else {
        if (hasExcelData) {

            fromemail = true;

            if ($('input[name=L1selectView]:checked').val() === "L1selectGraph") {

                ERPDFExportByLevel();
            } else {
                ERExcelExportByLevel();
            }


        }
        else {
            fromemail = false;
            ShowEmailStatus("No data found matching your Criteria. Change Criteria and try again.", 'failure');
        }
    }
}
//Email Functionality end

var SelectedSitesReport = '';
//Sets the saved parameters for each control
function SetSavedParameters(params) {
    var selectedSites = '';

    $('#txtScheduledReportName').val(params.ReportNameOverride);
    var query = $(params.ReportSiteMaps).each(function () {
        selectedSites += $(this)[0].SiteID + ',';
    });
    selectedSites = selectedSites.replace(/\,$/, ''); //Remove the last character if its a comma
    SelectedSitesReport = selectedSites;
    ERSites.oldSites = ERSites.getSelectedSites();

    //Load the programs
    LoadReportParameters(selectedSites);
    $("#MultiSiteProgram").data("kendoMultiSelect").value(getParamValue(params.ReportParameters, "ProgramServices").split(","));

    //Load the Chapters, Standards and EPs
    MultiSiteChapterCall(selectedSites, 1, getParamValue(params.ReportParameters, "ProgramServices"));
    $("#MultiSiteChapter").data("kendoMultiSelect").value(getParamValue(params.ReportParameters, "ChapterIDs").split(","));

    UpdateStandards();
    if (getParamValue(params.ReportParameters, "StandardIDs") != null) {
        $("#AMPStandard").data("kendoMultiSelect").value(getParamValue(params.ReportParameters, "StandardIDs").split(","));
    }
    UpdateEPs();
    if (getParamValue(params.ReportParameters, "EPIDs") != null) {
        $("#AMPEP").data("kendoMultiSelect").value(getParamValue(params.ReportParameters, "EPIDs").split(","));
    }

    $('input[name=grpBy][value=' + (getParamValue(params.ReportParameters, "GrpBy")) + ']').prop('checked', true);
    $('input[name=scoretype][value=' + (getParamValue(params.ReportParameters, "EPScoreType")) + ']').prop('checked', true);


    CheckboxChecked(getParamValue(params.ReportParameters, "IncludeFSAcheckbox"), 'FSAGraphCheckbox');
    SetERRecurrenceParameters(params);
    SetSavedObservationDate(params.ReportParameters);

    TriggerActionByReportMode(params.ReportMode);
}

//Disables the Graph/Data, Export and Show Previous level options while the graph/data is loading
function EnableDisableChartView(bDisable) {
    if (bDisable) {
        $('#loadChartView').attr("disabled", "disabled");
        $('#loadChartView :input').attr("disabled", "disabled");
        $('#loadChartView :button').attr("disabled", "disabled");
    }
    else {
        $('#loadChartView').removeAttr("disabled");
        $('#loadChartView :input').removeAttr("disabled");
        $('#loadChartView :button').removeAttr("disabled");
    }
}

function ReportProgramCall() {

    var programIDs = [];
    $('#MultiSiteProgram :selected').each(function (i, selected) {
        programIDs[i] = $(selected).val();
    });
    if (programIDs.length <= 0) {
        programIDs.push(defaultValue);
    }

    $.ajax({
        async: false,
        dataType: "html",
        url: '/Corporate/CorporateReport/GetProgramsList',
        data: {
            selectedSiteIDs: ERSites.getSelectedSites(), selectedProgramIDs: programIDs.toString()
        },
        success: function (response) {
            $("#divReportProgram").html(response);
        }
    });
}



function onProgramMenuSelect(programId, programName) {

    if (SelectedProgramID != programId) {
        ProgramChangedGraph = true;
        ProgramChangedSummary = true;
        ProgramChangedDetail = true;
    }
    SelectedProgramID = programId;
    SelectedProgramName = programName;
    LevelReload();
}

function LevelReload() {
    switch (LevelTypeIdentifier) {
        case 1:
            Level1Load(SelectedProgramID, SelectedProgramName);
            break
        case 2:
            createLevel1Summary(SelectedProgramID, SelectedProgramName);
            break;
        case 3:
            createLevel1Data(SelectedProgramID, SelectedProgramName);
            break;
    }
}

function OnPrintDocumentation() {

    var title = document.title;
    document.title = 'Safer Matrix Report - Documentation';
    window.print();
    document.title = title;

}

function ShowHideDocumentationColumns(divDetailsGrid, isVisible) {

    var scoreType = $('input[name=scoretype]:checked').val();

    if (isVisible) {

        if (scoreType === '4') {
            var findingsIndex = $(divDetailsGrid + " th[data-field=Findings]").attr('data-index');
            var POAIndex = $(divDetailsGrid + " th[data-field=POA]").attr('data-index');

            $(divDetailsGrid).getKendoGrid().columns[findingsIndex].title = 'Findings';
            $(divDetailsGrid).getKendoGrid().columns[POAIndex].title = 'POA';

            $(divDetailsGrid).getKendoGrid().showColumn("Findings");
            $(divDetailsGrid).getKendoGrid().showColumn("Recommendations");
            $(divDetailsGrid).getKendoGrid().showColumn("POA");
        }
        else {
            var findingsIndex = $(divDetailsGrid + " th[data-field=Findings]").attr('data-index');
            var POAIndex = $(divDetailsGrid + " th[data-field=POA]").attr('data-index');

            $(divDetailsGrid).getKendoGrid().columns[findingsIndex].title = 'Organizational Findings';
            $(divDetailsGrid).getKendoGrid().columns[POAIndex].title = 'Plan of Action';

            $(divDetailsGrid).getKendoGrid().showColumn("Findings");
            $(divDetailsGrid).getKendoGrid().showColumn("OrgNotes");
            $(divDetailsGrid).getKendoGrid().showColumn("POA");
            $(divDetailsGrid).getKendoGrid().showColumn("DocumentList");
            $(divDetailsGrid).getKendoGrid().showColumn("CompliantDate");
            $(divDetailsGrid).getKendoGrid().showColumn("MOS");
        }

    }
    else {

        if (scoreType === '4') {
            $(divDetailsGrid).getKendoGrid().hideColumn("Findings");
            $(divDetailsGrid).getKendoGrid().hideColumn("Recommendations");
            $(divDetailsGrid).getKendoGrid().hideColumn("POA");
        }
        else {
            $(divDetailsGrid).getKendoGrid().hideColumn("Findings");
            $(divDetailsGrid).getKendoGrid().hideColumn("OrgNotes");
            $(divDetailsGrid).getKendoGrid().hideColumn("POA");
            $(divDetailsGrid).getKendoGrid().hideColumn("DocumentList");
            $(divDetailsGrid).getKendoGrid().hideColumn("CompliantDate");
            $(divDetailsGrid).getKendoGrid().hideColumn("MOS");
        }
    }

}
