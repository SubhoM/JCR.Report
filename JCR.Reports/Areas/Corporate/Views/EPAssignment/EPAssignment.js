
$(document).ready(function () {
    // Reset these additional parameters
    $("#resetfiltersbutton").click(function () {
        SetDefaults();
    });

    if ($.isNumeric($('#lblReportScheduleID').html())) {
        GetSavedParameters($('#lblReportScheduleID').html());
    }
    $("#GraphReport").prop("checked", true);
    $('input:radio[id*="ByChapter"]').prop('checked', true);
    $('#stBoth').attr("disabled", 'disabled');

});

function ResetCriteriaDates() { }
function LoadReportParameters(selectedSiteIDs) {
    ERCriteriaLoaded = true;
    GetReportHCOIDs(selectedSiteIDs);
    MultiSiteProgramCall(selectedSiteIDs);
    MultiSiteEPAssignedTo('Preliminary', '-1', '-1', '-1');
    MultiSiteEPAssignedBy('Preliminary', '-1', '-1', '-1');

}
function GetReportHCOIDs(selectedSiteIDs) {
    $.ajax({
        async: false,
        type: "POST",
        cache: false,
        data: { selectedSiteIDs: selectedSiteIDs },
        url: '/Corporate/CorporateReport/GetReportHCOIDs',
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
        cache: false,
        url: MultiSiteProgramUrl,
        data: {
            selectedSiteIDs: selectedSiteIDs
        },
        success: function (response) {
            $("#divMultiSiteProgram").html(response);
            //  var selectedOptions = $.map($('#MultiSiteProgram option'), function (e) { if ($(e).val() == -1) { return '' } else { return $(e).val(); } });
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
        cache: false,
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


var MultiSiteTracersUrl = '/TracerER/ERSearch/GetMultiSiteTracersList';


function onMSProgramChange(e) {
    var MultiSiteProgramIDs = [];
    MultiSiteChapterCall($("#SiteSelector_SelectedSiteIDs").val(), 0, GetMultiSiteProgramSelectedValue());
    ResetStandardsMultiSelect();

    scoreTypeChange($('input[name=scoreType]:checked').val());
}

//function onMSChapterChange(e) {
//    UpdateStandards();

//}

function updateMultiSiteAssigned() {
    scoreTypeChange($('input[name=scoreType]:checked').val());
}

function UpdateStandards() {

    $.ajax({
        async: false,
        cache: false,
        url: "/Corporate/CorporateReport/GetMultiSiteStandards",
        dataType: "html",
        data: {
            selectedProgramIDs: GetMultiSiteProgramSelectedValue(),
            selectedChapterIDs: $("#MultiSiteChapter").data("kendoMultiSelect").value().toString()
        },
        success: function (response) {

            $("#divMultiSiteStandard").html(response);

        }
    });
}


function ReportTypeChange(_reportType) {

    if (_reportType === "Graph")
    { $('#stBoth').attr("disabled", 'disabled'); $("#stPreliminary").prop("checked", true); }
    else
    { $('#stBoth').removeAttr("disabled"); }



}

function scoreTypeChange(_EPUserRoleID) {

    var _pIDs = $("#MultiSiteProgram").data("kendoMultiSelect").value().toString();
    var _cIDs = $("#MultiSiteChapter").data("kendoMultiSelect").value().toString();
    var _sIDs = $("#AMPStandard").data("kendoMultiSelect").value().toString();
    MultiSiteEPAssignedTo(_EPUserRoleID, _pIDs, _cIDs, _sIDs);
    MultiSiteEPAssignedBy(_EPUserRoleID, _pIDs, _cIDs, _sIDs);

}
function MultiSiteEPAssignedTo(_EPUserRoleID, _programIDs, _chapterIDs, _standardIDs) {
    var _selectedSiteIDs = ERSites.getSelectedSites().replace(/\,$/, '');
    $.ajax({
        async: false,
        cache: false,
        dataType: "html",
        url: '/Corporate/EPAssignment/GetEPAssignedTo',
        data: {
            selectedSiteIDs: _selectedSiteIDs,
            EPUserRoleID: _EPUserRoleID,
            programIDs: _programIDs,
            chapterIDs: _chapterIDs,
            standardIDs: _standardIDs
        },
        success: function (response) {
            $("#divMultiSiteEPAssignedTo").html(response);

        }
    });
}
function MultiSiteEPAssignedBy(_EPUserRoleID, _programIDs, _chapterIDs, _standardIDs) {
    var _selectedSiteIDs = ERSites.getSelectedSites().replace(/\,$/, '');
    $.ajax({
        async: false,
        cache: false,
        dataType: "html",
        url: '/Corporate/EPAssignment/GetEPAssignedBy',
        data: {
            selectedSiteIDs: _selectedSiteIDs,
            EPUserRoleID: _EPUserRoleID,
            programIDs: _programIDs,
            chapterIDs: _chapterIDs,
            standardIDs: _standardIDs
        },
        success: function (response) {
            $("#divMultiSiteEPAssignedBy").html(response);

        }
    });
}

function onEPAssignedToSelect(e) {
    var dataItem = this.dataSource.view()[e.item.index()];
    var values = this.value();

    if (dataItem.FullName === "All") {
        $('#EPAssignedTo').data("kendoMultiSelect").value([]);
        //legendChangeFlag = false;
    } else if (jQuery.inArray("-1", values)) {
        values = $.grep(values, function (value) {
            return value !== -1;
        });

        if (values == "") { this.value(values); }
        //legendChangeFlag = true;
    }
}
function onEPAssignedBySelect(e) {
    var dataItem = this.dataSource.view()[e.item.index()];
    var values = this.value();

    if (dataItem.FullName === "All") {
        $('#EPAssignedBy').data("kendoMultiSelect").value([]);
        //legendChangeFlag = false;
    } else if (jQuery.inArray("-1", values)) {
        values = $.grep(values, function (value) {
            return value !== -1;
        });

        if (values == "") { this.value(values); }
        //legendChangeFlag = true;
    }
}

//Report output 

ExcelView = true;
exportparameters = true;
var defaultValue = "-1";
var defaultText = "All";

var LevelIdentifier = 1;
var SelectedProgramName = "Hospital";
var SelectedProgramID = 2;
var SelectedChapteID = 0;
var SelectedChapterName = "";
var SelectedStandardName = "";
var SelectedStandardID = "";
var SelectedHCOName = "";
var SelectedSiteID = 0;
var ResetFilters = $("#GetResetLink").val();
var groupbySite = true;
var ExportReportName = "";
//var legendChangeFlag = false;
var legendAssigned = "Assigned";
var legendNotAssigned = "Not Assigned";
function additionalData(e) {

    return { search: SetSearchCriteria(false) }
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

    var SelectedAssignedToIds = [];
    var SelectedAssignedToNames = [];
    $('#EPAssignedTo :selected').each(function (i, selected) {
        SelectedAssignedToIds[i] = $(selected).val();
        SelectedAssignedToNames[i] = GetReportHeaderUserNameFormat($(selected).text().trim());
    });
    if (SelectedAssignedToIds.length <= 0) {
        SelectedAssignedToIds.push(defaultValue);
        SelectedAssignedToNames.push(defaultText);
    }

    var SelectedAssignedByIds = [];
    var SelectedAssignedByNames = [];
    $('#EPAssignedBy :selected').each(function (i, selected) {
        SelectedAssignedByIds[i] = $(selected).val();
        SelectedAssignedByNames[i] = GetReportHeaderUserNameFormat($(selected).text().trim());
    });
    if (SelectedAssignedByIds.length <= 0) {
        SelectedAssignedByIds.push(defaultValue);
        SelectedAssignedByNames.push(defaultText);
    }
    var SelectedSiteName = "";
    if ($('#hdnSitesCount').val() == 1) {
        SelectedSiteName = $('#hdnSingleSiteName').val();
    }
    else {
        SelectedSiteName = $("#SiteSelector_SelectedSiteName").val();
    }

    // var scoreStsValue = "Scored and Not Scored"; //ChartSearch.IncludeNotScored ? ChartSearch.IncludeScored ? "Scored, Not Scored" : "Not Scored" : ChartSearch.IncludeScored ? "Scored" : "" ;


    var searchset =
{
    SelectedSiteIDs: ERSites.getSelectedSites().replace(/\,$/, ''),
    SelectedSiteName: SelectedSiteName,
    ProgramIDs: ProgramIDs.toString(),
    ProgramNames: ProgramNames.toString().replace(/,/g, ", "),
    SelectedChapterIDs: SelectedChapterIDs.toString(),
    SelectedChapterNames: SelectedChapterNames.toString(),
    shortChaptersShow: shortChaptersShow.toString().replace(/,/g, ", "),
    SelectedStandardIDs: SelectedStandardIDs.toString(),
    SelectedStandardNames: SelectedStandardNames.toString().replace(/,/g, ", "),
    SelectedAssignedToIDs: SelectedAssignedToIds.toString(),
    SelectedAssignedToNames: SelectedAssignedToNames.toString().replace(/,/g, ", "),
    SelectedAssignedByIDs: SelectedAssignedByIds.toString(),
    SelectedAssignedByNames: SelectedAssignedByNames.toString().replace(/,/g, ", "),
    IncludeFSA: $('#chkIncludeFSA').is(':checked'),
    docRequired: $('#chkdocRequired').is(':checked'),
    NewChangedEps: $('#chkNewChangedEps').is(':checked'),

    ScoreType: $('input[name=scoreType]:checked').val(),
    ReportType: $('input[name=ERGroupBYProgramLevel]:checked').val(),
    ReportTitle: $('#hdnReportTitle').val(),
    SelectedSiteHCOIDs: "",
    ViewType: $('input[name=ReportTypeChange]:checked').val(),
    LevelIdentifier: LevelIdentifier
}

    return searchset;
}

function SetSearchCriteria(GenfromSavedFilters) {

    //only for rdlc GenfromSavedFilters is set to true only from email button
    //layout.js file common code
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

//Withemail parameter is optional 
function GenerateReport(GenfromSavedFilters, Withemail) {
    //$('.loading').hide();
    //SetLoadingImageVisibility(false);
    hasExcelData = true;
    GenerateReportAddCall();
}

function GenerateReportAddCall() {
    $('#loadChartView').html('');

    if ($('input[name=ERGroupBYProgramLevel]:checked').val() == "BySite") {
        groupbySite = true;
    } else {
        groupbySite = false;
    }
    ExcelGenerated = true;
    // reset values
    LevelIdentifier = 1;
    SelectedProgramName = "Hospital";
    SelectedProgramID = 2;
    SelectedChapteID = 0;
    SelectedChapterName = "";
    SelectedStandardName = "";
    SelectedStandardID = "";
    SelectedHCOName = "";
    SelectedSiteID = 0;
    ExportReportName = "";
    legendChangeFlag = false;
    var ProgramIDs = [];
    var ProgramNames = [];

    $('#MultiSiteProgram :selected').each(function (i, selected) {
        ProgramIDs[i] = $(selected).val();
        ProgramNames[i] = $(selected).text();
    });
    if (ProgramIDs.length > 0) {
        if (ProgramIDs[0] == "-1") {

            var prgDS = $("#MultiSiteProgram").data("kendoMultiSelect").dataSource;
            SelectedProgramID = prgDS._data[1].ProgramID;
            SelectedProgramName = prgDS._data[1].ProgramName;
        }
        else {
            SelectedProgramID = ProgramIDs[0];
            SelectedProgramName = ProgramNames[0];
        }


    }

    $.ajax({
        async: false,
        cache: false,
        url: '/Corporate/EPAssignment/LoadL1View',
        dataType: "html",
        success: function (data) {
            $('#loadChartView').html(data);
            //blockElement("divL1tag");
            if (ProgramIDs.length == 1) {
                if (ProgramIDs[0] == "-1") {
                    ReportProgramCall();
                }
            }
            else { ReportProgramCall(); }

            if ($('input[name=ReportTypeChange]:checked').val() == "Graph") {
                if (groupbySite) {
                    Level1Load(SelectedProgramID, SelectedProgramName, false);
                }
                else { Level2Load('', '', SelectedProgramID, SelectedProgramName, false); }
            }
            else {
                $("#exportoexcel").css("display", "block");
                $("#exporttopdf").css("display", "none");
                $("#divL1Viewtag").css("display", "none");
                if (groupbySite) {

                    $("#divtoplevel1").css("display", "block");
                    $("#divtoplevel2").css("display", "none");
                }
                else {
                    $("#divtoplevel2").css("display", "block");
                    $("#divtoplevel1").css("display", "none");
                }
                showlevelDetails();
            }


        }
    });
}
function ValidateData(timeDelay) {
    return true;
}
function SetDefaults() {
    $('#loadChartView').html('');
    LevelIdentifier = 1;
    SelectedProgramName = "Hospital";
    SelectedProgramID = 2;
    SelectedChapteID = 0;
    SelectedChapterName = "";
    SelectedStandardName = "";
    SelectedStandardID = "";
    SelectedHCOName = "";
    SelectedSiteID = 0;
    ExportReportName = "";
    groupbySite = true;
    $("#GraphReport").prop("checked", true);
    $('#stBoth').attr("disabled", 'disabled');
    $('input:radio[id*="ByChapter"]').prop('checked', true);
    //legendChangeFlag = false;
    $('input[name=scoreType][value=Preliminary]').prop('checked', true);
    ResetStandardsMultiSelect();
    changeLegendNames();
    MultiSiteEPAssignedTo('Preliminary', '-1', '-1', '-1');
    MultiSiteEPAssignedBy('Preliminary', '-1', '-1', '-1');
    EnableDisableEmail(false);
}

function showlevelDetails() {
    switch (LevelIdentifier) {
        case 1:
            if (groupbySite) {
                destroyKendoGrid("divlevel1details");
                var checkLevel1Detailsexists = $("#divlevel1details");
                if (!checkLevel1Detailsexists.data("kendoGrid")) {
                    createLevelDetails("#divlevel1details");
                }
                $('#divlevel1chart,#divlevel1data').hide();
                $('#divlevel1details').show();
            }
            else {
                destroyKendoGrid("divlevel2details");
                var checkLevel2Detailsexists = $("#divlevel2details");
                if (!checkLevel2Detailsexists.data("kendoGrid")) {
                    createLevelDetails("#divlevel2details");
                }
                $('#divlevel2data, #divlevel2chart').hide();
                $('#divlevel2details').show();
            }
            break;
        case 2:
            if (groupbySite) {
                destroyKendoGrid("divlevel2details");
                var checkLevel2Detailsexists = $("#divlevel2details");
                if (!checkLevel2Detailsexists.data("kendoGrid")) {
                    createLevelDetails("#divlevel2details");
                }

                $('#divlevel2data, #divlevel2chart').hide();
                $('#divlevel2details').show();
            }
            else {
                destroyKendoGrid("divlevel3details");
                var checkLevel3Detailsexists = $("#divlevel3details");
                if (!checkLevel3Detailsexists.data("kendoGrid")) {
                    createLevelDetails("#divlevel3details");
                }

                $('#divlevel3data, #divlevel3chart').hide();
                $('#divlevel3details').show();
            }

            break;
        case 3:
            if (groupbySite) {
                destroyKendoGrid("divlevel3details");
                var checkLevel3Detailsexists = $("#divlevel3details");
                if (!checkLevel3Detailsexists.data("kendoGrid")) {
                    createLevelDetails("#divlevel3details");
                }

                $('#divlevel3data, #divlevel3chart').hide();
                $('#divlevel3details').show();
            }
            break;
    }
}



function showlevelData() {

    switch (LevelIdentifier) {
        case 1:
            if (groupbySite) {
                var checkLevel1Dataexists = $("#divlevel1data");
                if (!checkLevel1Dataexists.data("kendoGrid")) {
                    createLevel1Data();
                }

                $('#divlevel1chart,#divlevel1details').hide();
                $('#divlevel1data').show();

            }
            else {

                var checkLevel2Dataexists = $("#divlevel2data");
                if (!checkLevel2Dataexists.data("kendoGrid")) {
                    createLevel2Data();
                }

                $('#divlevel2data').show();
                $('#divlevel2chart,#divlevel2details').hide();

            }
            break;
        case 2:
            if (groupbySite) {
                var checkLevel2Dataexists = $("#divlevel2data");
                if (!checkLevel2Dataexists.data("kendoGrid")) {
                    createLevel2Data();
                }

                $('#divlevel2data').show();
                $('#divlevel2chart,#divlevel2details').hide();

            }
            else {
                var checkLevel3Dataexists = $("#divlevel3data");
                if (!checkLevel3Dataexists.data("kendoGrid")) {
                    createLevel3Data();
                }

                $('#divlevel3data').show();
                $('#divlevel3chart,#divlevel3details').hide();

            }

            break;
        case 3:
            if (groupbySite) {
                var checkLevel3Dataexists = $("#divlevel3data");
                if (!checkLevel3Dataexists.data("kendoGrid")) {
                    createLevel3Data();
                }

                $('#divlevel3data').show();
                $('#divlevel3chart, #divlevel3details').hide();

            }
            break;
    }

}
function showlevelGraph() {

    switch (LevelIdentifier) {
        case 1:
            if (groupbySite) {
                $('#divlevel1chart').show();
                $('#divlevel1data,#divlevel1details').hide();

            }
            else {
                $('#divlevel2chart').show();
                $('#divlevel2data,#divlevel2details').hide();

            }
            break;
        case 2:
            if (groupbySite) {
                $('#divlevel2chart').show();
                $('#divlevel2data,#divlevel2details').hide();

            }
            else {
                $('#divlevel3chart').show();
                $('#divlevel3data,#divlevel3details').hide();

            }

            break;
        case 3:
            if (groupbySite) {
                $('#divlevel3chart').show();
                $('#divlevel3data,#divlevel3details').hide();

            }

            break;
    }

}

function destroyKendoGrid(_gridName) {
    var levelkendogrid = $("#" + _gridName);
    if (levelkendogrid.data("kendoGrid")) {
        $("#" + _gridName).data("kendoGrid").destroy();
        $("#" + _gridName).empty();
    }
}

//function showDivTag(_divTag) {
//    $("#" + _divTag).css("display", "block");
//}
//function hideDivTag(_divTag) {
//    $("#" + _divTag).css("display", "none");
//}


function DisplayLevel() {
    LevelIdentifier = LevelIdentifier > 1 ? LevelIdentifier - 1 : LevelIdentifier;
    $("#previousLevelButton").removeClass('k-button k-state-focused');
    switch (LevelIdentifier) {
        case 1:
            $("#divpreviouslevel").hide();
            if (groupbySite) {
                $("#divtoplevel2, #divlevel1data, #divlevel1details").hide();
                $("#divtoplevel1, #divlevel1chart").show();
                destroyKendoGrid("divlevel2data");
                destroyKendoGrid("divlevel2details");
            }
            else {
                $("#divtoplevel3, #divlevel2data, #divlevel2details").hide();
                $("#divtoplevel2, #divlevel2chart").show();
                destroyKendoGrid("divlevel3data");
                destroyKendoGrid("divlevel3details");
            }
            break;
        case 2:
            if (groupbySite) {
                $("#divtoplevel3, #divlevel2data, #divlevel2details").hide();
                $("#divtoplevel2, #divlevel2chart").show();
                destroyKendoGrid("divlevel3data");
                destroyKendoGrid("divlevel3details");
            }
            else {
                //  $('input:radio[name*="L1selectView"]').attr('disabled', false);
                $("#divtoplevel4, #divlevel3data, #divlevel3details").hide();
                $("#divtoplevel3, #divlevel3chart,#divL1Viewtag").show();
                destroyKendoGrid("divlevel4data");
            }
            break;
        case 3:
            //  $('input:radio[name*="L1selectView"]').attr('disabled', false);
            $("#divtoplevel4, #divlevel3data, #divlevel3details").hide();
            $("#divtoplevel3,#divlevel3chart,#divL1Viewtag").show();
            destroyKendoGrid("divlevel4data");
            break;
    }
    $("#exportoexcel").css("display", "none");
    $("#exporttopdf").css("display", "block");
    DisplayLevelParameters();

}
function DisplayLevelParameters(ChartSearch) {

    if (ChartSearch === undefined) {
        ChartSearch = SetSearchCriteria(true);
    }
    $("#spanSelParameters9").html("Program: " + SelectedProgramName);
    switch (LevelIdentifier) {
        case 1:
            $("#divReportProgram").show();
            if (groupbySite) {
                $("#spanSelParameters1").html("Assignment by Site");
                $("#spanSelParameters2").html("Group by: Site");

            }
            else {
                $("#spanSelParameters1").html("Assignment by Chapter");
                $("#spanSelParameters2").html("Group by: Chapter");

            }
            $("#spanSelParameters3").html("HCOID: " + $("#SiteSelector_SelectedHCOIDs").val());
            $("#spanSelParameters4").html("Chapter: " + ChartSearch.shortChaptersShow);

            break;
        case 2:
            if (groupbySite) {
                $("#divReportProgram").show();
                $("#spanSelParameters1").html("Assignment by Chapter");
                $("#spanSelParameters2").html("Group by: Site");
                $("#spanSelParameters3").html("HCOID: " + SelectedHCOName);
                $("#spanSelParameters4").html("Chapter: " + ChartSearch.shortChaptersShow);

            }
            else {
                $("#divReportProgram").hide();
                $("#spanSelParameters1").html("Assignment by Standard");
                $("#spanSelParameters2").html("Group by: Chapter");
                $("#spanSelParameters3").html("HCOID: " + $("#SiteSelector_SelectedHCOIDs").val());
                $("#spanSelParameters4").html("Chapter: " + SelectedChapterName);

            }


            break;
        case 3:
            $("#divReportProgram").hide();
            if (groupbySite) {
                $("#spanSelParameters1").html("Assignment by Standard");
                $("#spanSelParameters2").html("Group by: Site");
                $("#spanSelParameters3").html("HCOID: " + SelectedHCOName);


            }
            else {
                $("#spanSelParameters1").html("Assignment by EP");
                $("#spanSelParameters2").html("Group by: Chapter");
                $("#spanSelParameters3").html("HCOID: " + $("#SiteSelector_SelectedHCOIDs").val());


            }
            $("#spanSelParameters4").html("Chapter: " + SelectedChapterName);
            break;
        case 4:
            $("#divReportProgram").hide();
            $("#spanSelParameters1").html("Assignment by EP");
            $("#spanSelParameters2").html("Group by: Site");
            $("#spanSelParameters3").html("HCOID: " + $("#SiteSelector_SelectedHCOIDs").val());
            $("#spanSelParameters4").html("Chapter: " + SelectedChapterName);


            break;

    }
    $("#spanSelParameters5").html("Standard: " + ChartSearch.SelectedStandardNames);
    $("#spanSelParameters6").html("Score Type: " + ChartSearch.ScoreType);
    $("#spanSelParameters7").html("Assigned To: " + ChartSearch.SelectedAssignedToNames);
    $("#spanSelParameters8").html("Assigned By: " + ChartSearch.SelectedAssignedByNames);

    ScrollToTopCall();
}

function changeLegendNames() {
    var isAssignedBySelected = ($('#EPAssignedBy :selected').val() != null && $('#EPAssignedBy :selected').val() != "-1");
    var isAssignedToSelected = ($('#EPAssignedTo :selected').val() != null && $('#EPAssignedTo :selected').val() != "-1");

    if (!isAssignedBySelected && !isAssignedToSelected) {
        legendAssigned = "Assigned";
        legendNotAssigned = "Not Assigned";
    }
    else if (!isAssignedBySelected && isAssignedToSelected) {
        legendAssigned = "Assigned to Selected User(s)";
        legendNotAssigned = "Not Assigned to Selected User(s)";
    }
    else if (isAssignedBySelected && !isAssignedToSelected) {
        legendAssigned = "Assigned by Selected User(s)";
        legendNotAssigned = "Not Assigned by Selected User(s)";
    }
    else {
        legendAssigned = "Assigned to and by Selected User(s)";
        legendNotAssigned = "Not Assigned to and by Selected User(s)";
    }
}

//Level 1 scripts start
function createLevel1Chart() {
    changeLegendNames();
    $("#divlevel1chart").kendoChart({
        dataSource: Level1dataSource,
        dataBound: onDB,
        title: {
            text: "Click graph for more details",
            color: "#C61835"
        },
        legend: {
            position: "bottom"
        },
        seriesDefaults: {
            type: "bar",
            stack: {
                type: "100%"
            }
        },
        series:
        [{
            field: "AssignedPercent",
            name: legendAssigned,
            color: "#5da5da",
            labels: {
                visible: true,
                position: "center",
                background: "transparent",
                template: function (e) {
                    if (e.dataItem.AssignedPercent <= "15") {
                        return e.dataItem.AssignedPercent.toFixed(1) + "%";
                    }
                    else { return e.dataItem.AssignedPercent.toFixed(1) + "% (" + e.dataItem.AssignedCount + "/" + e.dataItem.EPCount + ")"; }

                }

            }
        }, {
            field: "NotAssignedPercent",
            name: legendNotAssigned,
            color: "#b7b7b7",
            labels: {
                visible: true,
                position: "center",
                background: "transparent",
                template: function (e) {
                    if (e.dataItem.NotAssignedPercent <= "15") {
                        return e.dataItem.NotAssignedPercent.toFixed(1) + "%";
                    }
                    else {
                        return e.dataItem.NotAssignedPercent.toFixed(1) + "% (" + e.dataItem.NotAssignedCount + "/" + e.dataItem.EPCount + ")";
                    }
                }
            }
        }


        ],
        categoryAxis: {
            field: "SiteFullName",
            value: "SiteID",
            labels: {
                visual: function (e) {
                    var layout = new kendo.drawing.Layout(e.rect, {
                        justifyContent: "center"
                    });
                    var addLabel = new kendo.drawing.Text(e.dataItem.SiteFullName);
                    addLabel.options.set("font", "bold 12px sans-serif");
                    layout.append(addLabel, new kendo.drawing.Text('(EP Count : ' + e.dataItem.EPCount + ')'));
                    layout.reflow();
                    return layout;
                }
            },
            majorGridLines: {
                visible: false
            }

        },
        valueAxis: {
            min: 0,
            line: {
                visible: false
            },
            minorGridLines: {
                visible: false
            }
        },
        tooltip: {
            visible: true,
            template: function (e) {
                var sn = e.series.name;

                if (sn.indexOf("Not Assigned") == -1)
                    return sn + " : " + e.dataItem.AssignedPercent.toFixed(1) + "% (" + e.dataItem.AssignedCount + "/" + e.dataItem.EPCount + ")";

                else
                    return sn + " : " + e.dataItem.NotAssignedPercent.toFixed(1) + "% (" + e.dataItem.NotAssignedCount + "/" + e.dataItem.EPCount + ")";


            }

        },
        seriesClick: onLevel1SeriesClick
    });


}
function createLevel1Data() {

    $("#divlevel1data").kendoGrid({
        dataSource: Level1dataSource,
        change: onLevel1Click,
        selectable: true,
        sortable: true,
        scrollable: true,
        dataBound: LargeGridResize,
        height: 450,
        excel: { allPages: true },
        excelExport: ERexcelExport,
        columns: [
                     { field: "SiteID", hidden: "true" }, { field: "SiteName", width: 270, title: "Site Name" },
                     { field: "HCOID", width: 80, title: "HCO ID" },
                     { field: "SiteFullName", hidden: "true" }, { field: "Location", width: 150, title: "Location" },
                     { field: "EPCount", width: 120, title: "EP Count" },
                     { field: "AssignedCount", width: 120, title: "Assigned Count" },
                     { field: "AssignedPercent", width: 160, title: "Assigned %", format: "{0:0.0}" },
                     { field: "NotAssignedCount", width: 120, title: "Not Assigned Count" },
                    { field: "NotAssignedPercent", width: 160, title: "Not Assigned %", format: "{0:0.0}" }
        ]
    });

}


// code to call first level 
function Level1Load(ProgramID, ProgramName, programChange) {


    SelectedProgramName = ProgramName;
    SelectedProgramID = ProgramID;
    Level1dataSource = datasourcecall(programChange);
    Level1dataSource.sync();

    createLevel1Chart();
    $('#divlevel1chart').css("display", "block");
}

var Level1dataSource = "";
function datasourcecall(programChange) {

    var ChartSearch = SetSearchCriteria(false);
    ChartSearch.ProgramIDs = SelectedProgramID;
    ChartSearch.ProgramNames = SelectedProgramName;
    DisplayLevelParameters(ChartSearch);

    hasExcelData = true;

    return new kendo.data.DataSource({
        transport: {
            read: {
                url: "/Corporate/EPAssignment/EPAssignment_Data",
                type: "post",
                dataType: "json",
                data: { search: ChartSearch, LevelIdentifier: 1 }
            }
        },
        requestEnd: function (e) {
            if (e.response != null) {

                if (e.response.length === 0) {

                    hasExcelData = false;
                    var ProgramIDs = [];
                    var ProgramNames = [];
                    var chkSinglePrg = false;
                    $('#MultiSiteProgram :selected').each(function (i, selected) {
                        ProgramIDs[i] = $(selected).val();
                        ProgramNames[i] = $(selected).text();
                    });
                    if (ProgramIDs.length == 1) {
                        if (ProgramIDs[0] == "-1") {
                            chkSinglePrg = false;
                        }
                        else {
                            chkSinglePrg = true;
                        }
                    }
                    if (chkSinglePrg == true) {
                        $('#loadChartView').html('');
                        closeSlide("btnEmail", "slideEmail");
                        openSlide("btnSearchCriteria", "slideSearch");

                        $('#error_msg').html('<div id="showerror_msg" class="alert alert-info alert-dismissible" role="alert" style="display:none;">      <button type="button" class="close" data-dismiss="alert">            <span aria-hidden="true">&times;</span><span class="sr-only">Close</span>        </button>        <div id="show_msg"></div>    </div>')
                        $('#error_msg').css("display", "block");
                        $('#showerror_msg').removeClass("alert-info").addClass("alert-danger");

                        $('#showerror_msg').slideDown('slow');
                        $('#show_msg').html("No data found matching your Criteria. Change Criteria and try again.");
                        $('#showerror_msg').delay(5000).slideUp('slow');
                    }
                    else {
                        closeSlide("btnSearchCriteria", "slideSearch");
                        $("#divlevel1chart").hide();
                        $('#prg_error_msg').html('<div id="prg_showerror_msg" class="alert alert-info alert-dismissible" role="alert" style="display:none;">      <button type="button" class="close" data-dismiss="alert">            <span aria-hidden="true">&times;</span><span class="sr-only">Close</span>        </button>        <div id="prg_show_msg"></div>    </div>')
                        $('#prg_error_msg').css("display", "block");
                        $('#prg_showerror_msg').removeClass("alert-info").addClass("alert-danger");

                        $('#prg_showerror_msg').slideDown('slow');
                        $('#prg_show_msg').html("No data found matching your Criteria and for the selected Program. Change Criteria or Program and try again.");
                        if (programChange) {
                            $("#divlevel1data, #divlevel1chart,#divlevel1details,#exporttopdf,#exportoexcel").hide();

                            $('input:radio[id*="radioL1Graph"]').prop('checked', true);
                            $('input:radio[name*="L1selectView"]').attr('disabled', true);
                        }

                    }


                    EnableDisableEmail(false);
                }
                else {
                    EnableDisableEmail(true);
                    if (programChange) {
                        $("#exporttopdf").show();
                        $("#divlevel1data, #divlevel1details,#exportoexcel").hide();
                        $('input:radio[id*="radioL1Graph"]').prop('checked', true);
                        $('input:radio[name*="L1selectView"]').attr('disabled', false);
                    }
                    $('#prg_error_msg').html('<div id="prg_showerror_msg" class="alert alert-info alert-dismissible" role="alert" style="display:none;">      <button type="button" class="close" data-dismiss="alert">            <span aria-hidden="true">&times;</span><span class="sr-only">Close</span>        </button>        <div id="prg_show_msg"></div>    </div>')
                    setChartHeight("divlevel1chart", e.response.length);
                    closeSlide("btnSearchCriteria", "slideSearch");
                }
            }

            //unBlockElement("divL1tag");
        }
    });
}

function onLevel1SeriesClick(e) {
    EnableDisableChartView(true);
    LevelIdentifier = 2;
    Level2Load(e.dataItem.SiteID, e.dataItem.SiteFullName, SelectedProgramID, SelectedProgramName, false);
    $('#divtoplevel1, #divlevel2data').hide();
    $('#divtoplevel2, #divlevel2chart, #divpreviouslevel').show();


}
function onLevel1Click(e) {
    EnableDisableChartView(true);
    $('input:radio[id*="radioL1Graph"]').prop('checked', true);
    LevelIdentifier = 2;
    // $('#divtoplevel1').css("display", "none");
    var data = this.dataItem(this.select());

    if (data != null) {

        Level2Load(data.SiteID, data.SiteFullName, SelectedProgramID, SelectedProgramName, false);
        $('#divtoplevel1, #divlevel2data, #exportoexcel').hide();
        $('#divtoplevel2, #divlevel2chart, #exporttopdf, #divpreviouslevel').show();
    }
}
// Level 1 scripts end

function setChartHeight(chartname, arraylength) {

    var heightchart = arraylength * 50;
    if (heightchart < 250)
    { heightchart = 250; }

    $('#' + chartname).css("height", heightchart);
}
function onDB(e) {

    e.sender.options.series[0].labels.visible = function (point) {
        if (point.value < 4) {
            return false
        }
        else { return point.value }
    }
    e.sender.options.series[1].labels.visible = function (point) {
        if (point.value < 4) {
            return false
        }
        else { return point.value }
    }
}

// Level 2 scripts start
function onLevel2SeriesClick(e) {
    EnableDisableChartView(true);
    if (groupbySite) {
        LevelIdentifier = 3;
    }
    else {
        LevelIdentifier = 2;
    }
    Level3Load(e.dataItem.ChapterID, e.dataItem.ChapterCode);
    $('#divtoplevel2, #divlevel3data').hide();
    $('#divtoplevel3, #divlevel3chart,#divpreviouslevel').show();
}
function onLevel2Click(e) {
    EnableDisableChartView(true);
    $('input:radio[id*="radioL1Graph"]').prop('checked', true);

    var data = this.dataItem(this.select());

    if (data != null) {
        if (groupbySite) {
            LevelIdentifier = 3;
        }
        else {
            LevelIdentifier = 2;
        }
        Level3Load(data.ChapterID, data.ChapterCode);
        $('#divtoplevel2, #divlevel3data, #exportoexcel').hide();
        $('#divtoplevel3, #divlevel3chart, #exporttopdf,#divpreviouslevel').show();


    }
}

function createLevel2Chart() {
    changeLegendNames();
    $("#divlevel2chart").kendoChart({

        dataSource: Level2dataSource,
        dataBound: onDB,
        title: {
            text: "Click graph for more details",
            color: "#C61835"
        },
        overlay: {
            gradient: null
        },
        legend: {
            position: "bottom"
        },
        seriesDefaults: {
            type: "bar",
            stack: {
                type: "100%"
            }
        },
        series:
        [{
            field: "AssignedPercent",
            name: legendAssigned,
            color: "#5da5da",
            labels: {
                visible: true,
                position: "center",
                background: "transparent",
                template: function (e) {
                    if (e.dataItem.AssignedPercent <= "15") {
                        return e.dataItem.AssignedPercent.toFixed(1) + "%";
                    }
                    else { return e.dataItem.AssignedPercent.toFixed(1) + "% (" + e.dataItem.AssignedCount + "/" + e.dataItem.EPCount + ")"; }

                }

            }
        }, {
            field: "NotAssignedPercent",
            name: legendNotAssigned,
            color: "#b7b7b7",
            labels: {
                visible: true,
                position: "center",
                background: "transparent",
                template: function (e) {
                    if (e.dataItem.NotAssignedPercent <= "15") {
                        return e.dataItem.NotAssignedPercent.toFixed(1) + "%";
                    }
                    else {
                        return e.dataItem.NotAssignedPercent.toFixed(1) + "% (" + e.dataItem.NotAssignedCount + "/" + e.dataItem.EPCount + ")";
                    }
                }
            }
        }


        ],
        categoryAxis: {
            field: "ChapterCode",
            labels: {
                visual: function (e) {
                    var layout = new kendo.drawing.Layout(e.rect, {
                        justifyContent: "center"
                    });
                    var addLabel = new kendo.drawing.Text(e.dataItem.ChapterCode);
                    addLabel.options.set("font", "bold 12px sans-serif");
                    layout.append(addLabel, new kendo.drawing.Text('(EP Count : ' + e.dataItem.EPCount + ')'));
                    layout.reflow();
                    return layout;
                }
            },
            majorGridLines: {
                visible: false
            }
        },
        valueAxis: {
            min: 0,
            line: {
                visible: false
            },
            minorGridLines: {
                visible: false
            }
        },
        tooltip: {
            visible: true,
            template: function (e) {
                var sn = e.series.name;

                if (sn.indexOf("Not Assigned") == -1)
                    return sn + " : " + e.dataItem.AssignedPercent.toFixed(1) + "% (" + e.dataItem.AssignedCount + "/" + e.dataItem.EPCount + ")";

                else
                    return sn + " : " + e.dataItem.NotAssignedPercent.toFixed(1) + "% (" + e.dataItem.NotAssignedCount + "/" + e.dataItem.EPCount + ")";


            }
        },
        seriesClick: onLevel2SeriesClick
    });


}
function createLevel2Data() {
    $("#divlevel2data").kendoGrid({
        dataSource: Level2dataSource,
        change: onLevel2Click,
        selectable: true,
        scrollable: true,
        sortable: true,
        dataBound: LargeGridResize,
        height: 450,
        excel: { allPages: true },
        excelExport: ERexcelExport,
        columns: [
           { field: "ChapterID", hidden: "true" }, { field: "ChapterCode", width: 125, title: "Chapter" },
           { field: "ChapterName", hidden: "true" },
                     { field: "EPCount", width: 120, title: "EP Count" },
                     { field: "AssignedCount", width: 120, title: "Assigned Count" },
                     { field: "AssignedPercent", width: 160, title: "Assigned %", format: "{0:0.0}" },
                     { field: "NotAssignedCount", width: 120, title: "Not Assigned Count" },
                     { field: "NotAssignedPercent", width: 160, title: "Not Assigned %", format: "{0:0.0}" }]
    });
}

// code to call second level 
function Level2Load(SiteID, SiteName, ProgramID, ProgramName, programChange) {

    if (groupbySite) {
        SelectedHCOName = SiteName;
        SelectedSiteID = SiteID;
    }
    else {

        $('#divtoplevel1').hide();
        $('#divtoplevel2').show();
    }
    SelectedProgramName = ProgramName;
    SelectedProgramID = ProgramID;
    Level2dataSource = Level2datasourcecall(programChange);
    Level2dataSource.sync();
    createLevel2Chart();

}

var Level2dataSource = "";
function Level2datasourcecall(programChange) {

    var ChartSearch = ""; SetSearchCriteria(true);

    if (groupbySite) {
        ChartSearch = SetSearchCriteria(true);
        ChartSearch.SelectedSiteIDs = SelectedSiteID;
        ChartSearch.SelectedSiteName = SelectedHCOName;

    }
    else {
        ChartSearch = SetSearchCriteria(false);
    }
    ChartSearch.ProgramIDs = SelectedProgramID;
    ChartSearch.ProgramNames = SelectedProgramName;

    DisplayLevelParameters(ChartSearch);

    return new kendo.data.DataSource({
        transport: {
            read: {
                url: "/Corporate/EPAssignment/EPAssignment_Data",
                type: "post",
                dataType: "json",
                data: { search: ChartSearch, LevelIdentifier: 2 }
            }
        },
        requestEnd: function (e) {
            if (e.response != null) {

                if (e.response.length === 0) {

                    hasExcelData = false;
                    $('#prg_error_msg').html('<div id="prg_showerror_msg" class="alert alert-info alert-dismissible" role="alert" style="display:none;">      <button type="button" class="close" data-dismiss="alert">            <span aria-hidden="true">&times;</span><span class="sr-only">Close</span>        </button>        <div id="prg_show_msg"></div>    </div>')
                    $('#prg_error_msg').css("display", "block");
                    $('#prg_showerror_msg').removeClass("alert-info").addClass("alert-danger");

                    $('#prg_showerror_msg').slideDown('slow');
                    $('#prg_show_msg').html("No data found matching your Criteria and for the selected Program. Change Criteria or Program and try again.");
                    if (programChange) {
                        $("#divlevel2data, #divlevel2chart,#divlevel2details,#exporttopdf,#exportoexcel").hide();

                        $('input:radio[id*="radioL1Graph"]').prop('checked', true);
                        $('input:radio[name*="L1selectView"]').attr('disabled', true);
                    }
                    closeSlide("btnSearchCriteria", "slideSearch");
                    EnableDisableEmail(false);
                }
                else {
                    EnableDisableEmail(true);
                    if (programChange) {
                        $("#exporttopdf,#divlevel2chart").show();
                        $("#divlevel2data, #divlevel2details,#exportoexcel").hide();
                        $('input:radio[id*="radioL1Graph"]').prop('checked', true);
                        $('input:radio[name*="L1selectView"]').attr('disabled', false);
                    }
                    $('#prg_error_msg').html('<div id="prg_showerror_msg" class="alert alert-info alert-dismissible" role="alert" style="display:none;">      <button type="button" class="close" data-dismiss="alert">            <span aria-hidden="true">&times;</span><span class="sr-only">Close</span>        </button>        <div id="prg_show_msg"></div>    </div>')
                    setChartHeight("divlevel2chart", e.response.length);
                    closeSlide("btnSearchCriteria", "slideSearch");
                    EnableDisableChartView(false);
                }
            }

            //unBlockElement("divL1tag");
        }

    });
}
// Level 2 scripts end

// Level 3 scripts start
function createLevel3Chart() {
    changeLegendNames();
    $("#divlevel3chart").kendoChart({

        dataSource: Level3dataSource,
        dataBound: onDB,
        title: {
            text: "Click graph for more details",
            color: "#C61835"
        },
        overlay: {
            gradient: null
        },
        legend: {
            position: "bottom"
        },
        seriesDefaults: {
            type: "bar",
            stack: {
                type: "100%"
            }
        },
        series:
        [{
            field: "AssignedPercent",
            name: legendAssigned,
            color: "#5da5da",
            labels: {
                visible: true,
                position: "center",
                background: "transparent",
                template: function (e) {
                    if (e.dataItem.AssignedPercent <= "15") {
                        return e.dataItem.AssignedPercent.toFixed(1) + "%";
                    }
                    else { return e.dataItem.AssignedPercent.toFixed(1) + "% (" + e.dataItem.AssignedCount + "/" + e.dataItem.EPCount + ")"; }

                }

            }
        }, {
            field: "NotAssignedPercent",
            name: legendNotAssigned,
            color: "#b7b7b7",
            labels: {
                visible: true,
                position: "center",
                background: "transparent",
                template: function (e) {
                    if (e.dataItem.NotAssignedPercent <= "15") {
                        return e.dataItem.NotAssignedPercent.toFixed(1) + "%";
                    }
                    else {
                        return e.dataItem.NotAssignedPercent.toFixed(1) + "% (" + e.dataItem.NotAssignedCount + "/" + e.dataItem.EPCount + ")";
                    }
                }
            }
        }


        ],
        categoryAxis: {
            field: "StandardLabel",
            labels: {
                visual: function (e) {
                    var layout = new kendo.drawing.Layout(e.rect, {
                        justifyContent: "center"
                    });
                    var addLabel = new kendo.drawing.Text(e.dataItem.StandardLabel);
                    addLabel.options.set("font", "bold 12px sans-serif");
                    layout.append(addLabel, new kendo.drawing.Text('(EP Count : ' + e.dataItem.EPCount + ')'));
                    layout.reflow();
                    return layout;
                }
            },
            majorGridLines: {
                visible: false
            }
        },
        valueAxis: {
            min: 0,
            line: {
                visible: false
            },
            minorGridLines: {
                visible: false
            }
        },
        tooltip: {
            visible: true,
            template: function (e) {
                var sn = e.series.name;

                if (sn.indexOf("Not Assigned") == -1)
                    return sn + " : " + e.dataItem.AssignedPercent.toFixed(1) + "% (" + e.dataItem.AssignedCount + "/" + e.dataItem.EPCount + ")";

                else
                    return sn + " : " + e.dataItem.NotAssignedPercent.toFixed(1) + "% (" + e.dataItem.NotAssignedCount + "/" + e.dataItem.EPCount + ")";


            }
        },
        seriesClick: onLevel3SeriesClick
    });


}
function createLevel3Data() {
    $("#divlevel3data").kendoGrid({
        dataSource: Level3dataSource,
        selectable: true,
        sortable: true,
        scrollable: true,
        dataBound: LargeGridResize,
        height: 450,
        change: onLevel3Click,
        excel: { allPages: true },
        excelExport: ERexcelExport,
        columns: [
           { field: "StandardID", hidden: "true" }, { field: "StandardLabel", width: 150, title: "Standard" },
                    { field: "EPCount", width: 120, title: "EP Count" },
                    { field: "AssignedCount", width: 120, title: "Assigned Count" },
                    { field: "AssignedPercent", width: 160, title: "Assigned %", format: "{0:0.0}" },
                    { field: "NotAssignedCount", width: 120, title: "Not Assigned Count" },
                    { field: "NotAssignedPercent", width: 160, title: "Not Assigned %", format: "{0:0.0}" }]
    });
}
// code to call third level 

function Level3Load(ChapterID, ChapterName) {
    SelectedChapteID = ChapterID;
    SelectedChapterName = ChapterName;
    Level3dataSource = Level3datasourcecall();
    Level3dataSource.sync();
    createLevel3Chart();

}

var Level3dataSource = "";
function Level3datasourcecall() {

    var ChartSearch = SetSearchCriteria(true);

    if (groupbySite) {
        ChartSearch.SelectedSiteIDs = SelectedSiteID;
        ChartSearch.SelectedSiteName = SelectedHCOName;
    }
    ChartSearch.ProgramIDs = SelectedProgramID;
    ChartSearch.ProgramNames = SelectedProgramName;
    ChartSearch.SelectedChapterIDs = SelectedChapteID;
    ChartSearch.SelectedChapterNames = SelectedChapterName;




    DisplayLevelParameters(ChartSearch);



    return new kendo.data.DataSource({
        transport: {
            read: {
                url: "/Corporate/EPAssignment/EPAssignment_Data",
                type: "post",
                dataType: "json",
                data: { search: ChartSearch, LevelIdentifier: 3 }
            }
        },
        requestEnd: function (e) {
            if (e.response != null) {
                setChartHeight("divlevel3chart", e.response.length);
            }
            EnableDisableChartView(false);
        }
    });
}

function onLevel3SeriesClick(e) {
    EnableDisableChartView(true);
    if (groupbySite) {
        LevelIdentifier = 4;

    }
    else {
        LevelIdentifier = 3;

    }
    $('#divtoplevel3,#exporttopdf').hide();
    $('#divtoplevel4,#divlevel4data,#exportoexcel').show();

    Level4Load(e.dataItem.StandardID, e.dataItem.StandardLabel);
}

function onLevel3Click(e) {
    EnableDisableChartView(true);

    $('input:radio[id*="radioL1Data"]').prop('checked', true);
    var data = this.dataItem(this.select());

    if (data != null) {
        if (groupbySite) {
            LevelIdentifier = 4;

        }
        else {

            LevelIdentifier = 3;


        }
        $('#divtoplevel3,#exporttopdf').hide();
        $('#divtoplevel4,#divlevel4data,#exportoexcel').show();

        Level4Load(data.StandardID, data.StandardLabel);

    }
}
// Level 3 scripts end

function createLevelDetails(divLoad) {
    EnableDisableChartView(true);
    Level4dataSource = Level4datasourcecall(true);
    Level4dataSource.sync();
    createLevel4Data(divLoad);

}



// Level 4 scripts start
//function onEPADataBound(e) {


//    var data = Level4dataSource.data();
//    $.each(data, function (i, row) {

//        if (row.PastDueDate == true) {
//            $('tr[data-uid="' + row.uid + '"] ').css("color", "#f00");
//        }

//    });

//}

function createLevel4Data(divLoad) {
    $(divLoad).kendoGrid({
        dataSource: Level4dataSource,
        pageable: {
            refresh: true,
            pageSizes: [20, 50, 100]
        },
        reorderable: true,
        resizable: true,
        dataBound: LargeGridResize,
        height: 450,
        columnMenu: true,
        filterable: {
            extra: false,
            operators: {
                string: {
                    startswith: "Starts with",
                    endswith: "Ends with",
                    contains: "Contains",
                    doesnotcontain: "Does Not Contain",
                    eq: "Is equal to",
                    neq: "Is not equal to"
                }
            }
        },
        groupable: true,
        sortable: true,
        //dataBound: onEPADataBound,
        excel: { allPages: true },
        excelExport: ERexcelExport,
        columns: [
                    { field: "StandardLabel", width: 125, title: "Standard" },
                    { field: "EPLabel", width: 70, title: "EP" },
                    { field: "EPText", width: 500, title: "EP Description", encoded: false },
                    { field: "AssignedBy", width: 125, title: "Assigned By" },
                    { field: "AssignedTo", width: 125, title: "Assigned To" },
                    { field: "ScoreType", width: 125, title: "Score Type" },
                    { field: "ScoredBy", width: 150, title: "Scored By" },
                    { field: "ScoreValue", width: 125, title: "Score Value" },
                    { field: "Likelihood", width: 160, title: "Likelihood to Harm" },
                    { field: "Scope", width: 125, title: "Scope" },
                    { field: "ScoreDate", width: 125, title: "Score Date" },
                    { field: "DueDate", width: 125, title: "Due Date", encoded: false },
                    { command: { text: "View Documentation", click: showDocuments }, title: "Documentation", width: "180px" },
                    { field: "Findings", width: 160, title: "Organizational Findings", hidden: "true", menu: false },
                    { field: "POA", width: 150, title: "Plan of Action", hidden: "true", menu: false },
                    { field: "MOS", width: 150, title: "Sustainment Plan", hidden: "true", menu: false },
                    { field: "OrgNotes", width: 150, title: "Internal Org Notes", hidden: "true", menu: false },
                    { field: "CompliantDate", width: 150, title: "POA Compliant by Date", hidden: "true", menu: false },
                    { field: "DocumentList", width: 150, title: "Linked Documents", hidden: "true", menu: false },
                    { field: "SiteID", hidden: "true", menu: false },
                    { field: "SiteName", width: 270, title: "Site Name" },
                    { field: "HCOID", width: 90, title: "HCO ID" },
                    { field: "Location", width: 150, title: "Location" },
                    { field: "ProgramName", width: 125, title: "Program" },
                    { field: "ChapterCode", width: 125, title: "Chapter" },
                    { field: "ChapterName", hidden: "true", menu: false }
        ]
    })
}

function Level4Load(StandardID, StandardLabel) {
    EnableDisableChartView(true);
    SelectedStandardID = StandardID;
    SelectedStandardName = StandardLabel;

    Level4dataSource = Level4datasourcecall(false);
    Level4dataSource.sync();
    createLevel4Data("#divlevel4data");



}

var Level4dataSource = "";
function Level4datasourcecall(detailsLoad) {
    var getParameters = true;
    if ($('input[name=ReportTypeChange]:checked').val() == "Graph") {
        getParameters = true;
    }
    else {
        getParameters = false;
    }
    var ChartSearch = SetSearchCriteria(getParameters);
    ChartSearch.ProgramIDs = SelectedProgramID;
    ChartSearch.ProgramNames = SelectedProgramName;
    if (groupbySite) {
        if (LevelIdentifier != 1) {
            ChartSearch.SelectedSiteIDs = SelectedSiteID;
            ChartSearch.SelectedSiteName = SelectedHCOName;
        }
    }
    if (!detailsLoad) {
        ChartSearch.SelectedChapterIDs = SelectedChapteID;
        ChartSearch.SelectedChapterNames = SelectedChapterName;
        ChartSearch.SelectedStandardIDs = SelectedStandardID;
        ChartSearch.SelectedStandardNames = SelectedStandardName;
    }
    else {

        if (LevelIdentifier == 3) {
            ChartSearch.SelectedChapterIDs = SelectedChapteID;
            ChartSearch.SelectedChapterNames = SelectedChapterName;
        }

    }
    DisplayLevelParameters(ChartSearch);



    return new kendo.data.DataSource({
        transport: {
            read: {
                url: "/Corporate/EPAssignment/EPAssignment_Data",
                type: "post",
                dataType: "json",
                data: { search: ChartSearch, LevelIdentifier: 4 }
            }
        },
        requestEnd: function (e) {
            if (e.response != null) {

                if (e.response.length === 0) {

                }
                else {
                    EnableDisableChartView(false);
                    if (!detailsLoad) {
                        $('input:radio[id*="radioL1Data"]').prop('checked', true);
                        $('#divL1Viewtag').css("display", "none");
                    }
                    closeSlide("btnSearchCriteria", "slideSearch");
                    //unBlockElement("divL1tag");
                    EnableDisableEmail(true);
                }
            }

        },
        pageSize: 20
    });
}
// Level 4 scripts end

// Common scripts start 
function ERPDFExportByLevel() {
    var dataSource = "";
    setExportNamebyLevel();
    switch (LevelIdentifier) {
        case 1:
            if (groupbySite) {
                var levelkendogrid = $("#divlevel1data");
                if (levelkendogrid.data("kendoGrid")) {
                    dataSource = $("#divlevel1data").data("kendoGrid").dataSource;
                }

            }
            else {
                var levelkendogrid = $("#divlevel2data");
                if (levelkendogrid.data("kendoGrid")) {
                    dataSource = $("#divlevel2data").data("kendoGrid").dataSource;
                }
            }
            break;
        case 2:
            if (groupbySite) {

                var levelkendogrid = $("#divlevel2data");
                if (levelkendogrid.data("kendoGrid")) {
                    dataSource = $("#divlevel2data").data("kendoGrid").dataSource;
                }

            }
            else {

                var levelkendogrid = $("#divlevel3data");
                if (levelkendogrid.data("kendoGrid")) {
                    dataSource = $("#divlevel3data").data("kendoGrid").dataSource;
                }
            }

            break;
        case 3:

            var levelkendogrid = $("#divlevel3data");
            if (levelkendogrid.data("kendoGrid")) {
                dataSource = $("#divlevel3data").data("kendoGrid").dataSource;
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
            dataSortBy = sorts[0].field.toString();
            dataSortOrder = sorts[0].dir.toString();
        }
    }

    if (fromemail) {
        if (hasExcelData) {

            $.ajax({
                type: "Post",
                url: "/Corporate/EPAssignment/CreateERSessionCriteria",
                contentType: "application/json",
                data: JSON.stringify({ ERsearch: SetParameters() })

            }).done(function (e) {
                $(function () {
                    $.post('/Corporate/EPAssignment/SendERPDFEmail',
                      { ExcelGridName: ExportReportName, email: $.parseJSON(sessionStorage.getItem('searchsetemailsession')), ERReportName: "EPAssignment", SortBy: dataSortBy, SortOrder: dataSortOrder }, function (data) {
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
            url: "/Corporate/EPAssignment/CreateERSessionCriteria",
            contentType: "application/json",
            data: JSON.stringify({ ERsearch: SetParameters() })

        }).done(function (e) {


            $(function () {
                $.post('/Corporate/EPAssignment/createErPdf',
                  { ExcelGridName: ExportReportName, ERReportName: "EPAssignment", SortBy: dataSortBy, SortOrder: dataSortOrder }, function (data) {

                      if (data.exportCreated == "success") {
                          window.location = kendo.format("{0}{1}{2}{3}",
                            "/Export/exportPdfFileByLocation?ExportFileName=", ExportReportName, "&guid=", data.fileGuid);
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

function setExportNamebyLevel() {
    switch (LevelIdentifier) {
        case 1:

            if (groupbySite) {
                ExportReportName = "EP Assignments by Site";

            }
            else {
                ExportReportName = "EP Assignments by Chapter";
            }

            break;
        case 2:
            if (groupbySite) {
                ExportReportName = "EP Assignments by Chapter";

            }
            else {
                ExportReportName = "EP Assignments by Standard";
            }
            break;
        case 3:
            ExportReportName = "EP Assignments by Standard";
            break;


    }

}
function ERExcelExportByLevel() {
    setExportNamebyLevel();
    var divtagname = "#divlevel";
    var divNumber = 4;
    var detail = true;
    if ($('input[name=ReportTypeChange]:checked').val() == "Graph") {
        if ($('input[name=L1selectView]:checked').val() === "L1selectGraph") {
            detail = false;
        } else if ($('input[name=L1selectView]:checked').val() === "L1selectData") {
            detail = false;
        }
        else {
            detail = true;
        }
    } else { detail = true; }


    if (LevelIdentifier < 4) {
        if (groupbySite) {
            divNumber = LevelIdentifier;
        }
        else {
            divNumber = LevelIdentifier + 1;
        }
    }

    if (detail) {
        divtagname = divtagname + divNumber + "details";
    }
    else { divtagname = divtagname + divNumber + "data"; }


    if (detail) {

        var epGrid = $(divtagname).getKendoGrid();
        
        var columns = epGrid.columns;
        var colDocument = columns.filter(function (v, i) { return columns[i].title == 'Documentation'; });

        var isDocumentColumnVisible = !colDocument[0].hidden;

        if (isDocumentColumnVisible) {
            epGrid.showColumn("Findings");
            epGrid.showColumn("OrgNotes");
            epGrid.showColumn("POA");
            epGrid.showColumn("DocumentList");
            epGrid.showColumn("CompliantDate");
            epGrid.showColumn("MOS");
        }

        epGrid.saveAsExcel();

        if (isDocumentColumnVisible) {
            epGrid.hideColumn("Findings");
            epGrid.hideColumn("OrgNotes");
            epGrid.hideColumn("POA");
            epGrid.hideColumn("DocumentList");
            epGrid.hideColumn("CompliantDate");
            epGrid.hideColumn("MOS");
        }

    }
    else { $(divtagname).getKendoGrid().saveAsExcel(); }


}

function ERexcelExport(e) {
    e.preventDefault();
    var sheets = [
     e.workbook.sheets[0], AddExportParameters()
    ];
    sheets[0].title = "Report";
    sheets[1].title = "Report Selections";
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
                          ShowEmailStatus(data, 'failure');
                      }
                      else {
                          ShowEmailStatus(data, 'success');
                      }

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


    ChartSearch.SelectedSiteHCOIDs = $("#SiteSelector_SelectedHCOIDs").val();
    ChartSearch.LevelIdentifier = LevelIdentifier;
    ChartSearch.ProgramNames = SelectedProgramName;
    ChartSearch.ProgramIDs = SelectedProgramID;

    switch (LevelIdentifier) {
        case 1:
            if (groupbySite) {
                //do nothing
            }
            else {
                ChartSearch.LevelIdentifier = 2;
            }
            break;
        case 2:
            if (groupbySite) {
                ChartSearch.SelectedSiteHCOIDs = SelectedHCOName;
                ChartSearch.SelectedSiteIDs = SelectedSiteID;
            }
            else {
                ChartSearch.SelectedChapterIDs = SelectedChapteID;
                ChartSearch.SelectedChapterNames = SelectedChapterName;
                ChartSearch.LevelIdentifier = 3;
            }
            break;
        case 3:
            if (groupbySite) {
                ChartSearch.SelectedSiteHCOIDs = SelectedHCOName;
                ChartSearch.SelectedChapterIDs = SelectedChapteID;
                ChartSearch.SelectedChapterNames = SelectedChapterName;
                ChartSearch.SelectedSiteIDs = SelectedSiteID;
            }
            else {
                ChartSearch.SelectedChapterNames = SelectedChapterName;
                ChartSearch.SelectedChapterIDs = SelectedChapteID;
                ChartSearch.SelectedStandardIDs = SelectedStandardID;
                ChartSearch.SelectedStandardNames = SelectedStandardName;
                ChartSearch.LevelIdentifier = 4;
            }

            break;
        case 4:
            ChartSearch.SelectedSiteHCOIDs = SelectedHCOName;
            ChartSearch.SelectedChapterIDs = SelectedChapteID;
            ChartSearch.SelectedChapterNames = SelectedChapterName;
            ChartSearch.SelectedStandardIDs = SelectedStandardID;
            ChartSearch.SelectedStandardNames = SelectedStandardName;
            ChartSearch.SelectedSiteIDs = SelectedSiteID;
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
                { value: "Score Type" },
                { value: ChartSearch.ScoreType }
                ]
            },

            {
                cells: [
                { value: "Assigned To" },
                { value: ChartSearch.SelectedAssignedToNames }
                ]
            },
            {
                cells: [
                { value: "Assigned By" },
                { value: ChartSearch.SelectedAssignedByNames }
                ]
            },

            {
                cells: [
                { value: "Group By" },
                { value: ChartSearch.ReportType == "BySite" ? "By Site" : "By Chapter" }
                ]
            },

            {
                cells: [
                { value: "Only Include FSA EPs" },
                { value: ChartSearch.IncludeFSA == true ? "True" : "False" }
                ]
            },

            {
                cells: [
                { value: "Documentation Required" },
                { value: ChartSearch.docRequired == true ? "True" : "False" }
                ]
            },

            {
                cells: [
                { value: "New/Changed EPs" },
                { value: ChartSearch.NewChangedEps == true ? "True" : "False" }
                ]
            }
        ]
    }
    return stringvalue;

}

// common scripts end
//Email Functionality start
function ERSendEmail() {

    if (!ExcelGenerated) {

        $.ajax({
            async: false,
            cache: false,
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

//Save the selected parameters
function SaveToMyReports(deleteReport) {
    var searchCriteria = GetParameterValues();

    var parameterSet = [
      { SelectedSites: searchCriteria.SelectedSiteIDs },
      { ReportTitle: searchCriteria.ReportTitle },
      { ProgramServices: searchCriteria.ProgramIDs },
      { ChapterIDs: searchCriteria.SelectedChapterIDs },
      { StandardIDs: searchCriteria.SelectedStandardIDs },
      { EPAssignedBy: searchCriteria.SelectedAssignedToIDs },
      { EPAssignedTo: searchCriteria.SelectedAssignedByIDs },
      { EPScoreType: searchCriteria.ScoreType },
      { GrpBy: searchCriteria.ReportType },
      { ReportType: searchCriteria.ViewType }
    ];

    //Set the Report Name
    parameterSet.push({ ScheduledReportName: $('#txtScheduledReportName').val() });

    if (searchCriteria.IncludeFSA === true)
        parameterSet.push({ IncludeFSAcheckbox: true });
    if (searchCriteria.docRequired === true)
        parameterSet.push({ EPDocRequiredCheckbox: true });
    if (searchCriteria.NewChangedEps === true)
        parameterSet.push({ EPNewChangedCheckbox: true });

    //Add recurrence fields to the parameter set
    GetERRecurrenceParameters(parameterSet);


    //Save the parameters to the database
    SaveSchedule(parameterSet, deleteReport);
}

//Sets the saved parameters for each control
function SetSavedParameters(params) {
    var selectedSites = '';

    $('#txtScheduledReportName').val(params.ReportNameOverride);
    $('input[name=ERGroupBYProgramLevel][value="' + getParamValue(params.ReportParameters, "GrpBy") + '"]').prop('checked', true);
    $('input[name=ReportTypeChange][value="' + getParamValue(params.ReportParameters, "ReportType") + '"]').prop('checked', true);
    var query = $(params.ReportSiteMaps).each(function () {
        selectedSites += $(this)[0].SiteID + ',';
    });
    selectedSites = selectedSites.replace(/\,$/, ''); //Remove the last character if its a comma

    ERSites.oldSites = ERSites.getSelectedSites();

    //Load the programs

    LoadReportParameters(selectedSites);
    $("#MultiSiteProgram").data("kendoMultiSelect").value(getParamValue(params.ReportParameters, "ProgramServices").split(","));

    //Load the Chapters, Standards
    MultiSiteChapterCall(selectedSites, 1, getParamValue(params.ReportParameters, "ProgramServices"));
    $("#MultiSiteChapter").data("kendoMultiSelect").value(getParamValue(params.ReportParameters, "ChapterIDs").split(","));
    UpdateStandards();
    if (getParamValue(params.ReportParameters, "StandardIDs") != null) {
        $("#AMPStandard").data("kendoMultiSelect").value(getParamValue(params.ReportParameters, "StandardIDs").split(","));
    }
    $("#EPAssignedBy").data("kendoMultiSelect").value(getParamValue(params.ReportParameters, "EPAssignedBy").split(","));
    $("#EPAssignedTo").data("kendoMultiSelect").value(getParamValue(params.ReportParameters, "EPAssignedTo").split(","));
    $('input[name=scoreType][value="' + getParamValue(params.ReportParameters, "EPScoreType") + '"]').prop('checked', true);

    CheckboxChecked(getParamValue(params.ReportParameters, "IncludeFSAcheckbox"), 'chkIncludeFSA');
    CheckboxChecked(getParamValue(params.ReportParameters, "EPDocRequiredCheckbox"), 'chkdocRequired');
    CheckboxChecked(getParamValue(params.ReportParameters, "EPNewChangedCheckbox"), 'chkNewChangedEps');
    SetERRecurrenceParameters(params);
    TriggerActionByReportMode(params.ReportMode);
    if ($('input[name=ReportTypeChange]:checked').val() == "Graph") {
        $('#stBoth').attr("disabled", 'disabled');
    }
    else {
        $('#stBoth').removeAttr("disabled");
    }
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
        cache: false,
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

    SelectedProgramID = programId;
    SelectedProgramName = programName;

    if ($('input[name=ReportTypeChange]:checked').val() == "Graph") {
        if (LevelIdentifier == 1) {
            if (groupbySite) {
                destroyKendoGrid("divlevel1data");
                Level1Load(programId, programName, true);
            }
            else {
                destroyKendoGrid("divlevel2data");
                Level2Load('', '', programId, programName, true);
            }
        }
        else {

            if (groupbySite) {
                destroyKendoGrid("divlevel2data");
                Level2Load(SelectedSiteID, SelectedHCOName, programId, programName, true);
            }

        }
    }
    else {
        showlevelDetails();
    }

}

function showDocuments(e) {
    wnd = $("#divDetail").kendoWindow({
        title: "Documentation",
        modal: true,
        visible: false,
        resizable: false,
        width: 550,
        height: 600,
        position: {
            top: 10
        }
    }).data("kendoWindow");
    wnd.title("Documentation");
    detailsTemplate = kendo.template($("#DocumentTemplate").html());

    var dataItem = this.dataItem($(e.currentTarget).closest("tr"));
    dataItem.HCOID = dataItem.HCOID == null ? dataItem.HCOID : dataItem.HCOID.toString().trim();
    dataItem.StandardLabel = dataItem.StandardLabel.toString().trim();
    dataItem.EPLabel = dataItem.EPLabel.toString().trim();
    dataItem.ProgramCode = dataItem.ProgramName.toString().trim();
    wnd.content(detailsTemplate(dataItem));
    wnd.center().open();
}

function OnPrintDocumentation() {

    var title = document.title;
    document.title = 'EP Assignments by Chapter - Documentation';
    window.print();
    document.title = title;

}

function LargeGridResize(e) {
    
    var gridID = '';
    if (e.sender && e.sender.wrapper && e.sender.wrapper.length > 0)
        gridID = e.sender.wrapper[0].id;

    if (gridID != null && gridID != '') {
        var grid = $("#" + gridID);
        var footer = grid.find(".k-grid-footer");
        if (footer) $(footer).hide();

        var header = grid.find(".k-grid-header");
        var contentArea = grid.find(".k-grid-content");  //This is the content Where Grid is located
        var count = grid.data("kendoGrid").dataSource.data().length;
        var headerGrouping = grid.find('.k-grouping-header');

        var headerGroupingHeight = 0;
        if (headerGrouping.height() != null) {
            headerGroupingHeight = headerGrouping.height() + 16;
        }

        //Apply the height for the content area
        var pagerHeight = 72;
        var headerHeight = 0 + headerGroupingHeight; //header.height();
        
        if (count > 5) {
            grid.height(300 + headerHeight + pagerHeight);
            contentArea.height(300);
        }
        else {
            if (count < 3) {
                if (count == 1) {
                    grid.height((count * 70) + headerHeight + pagerHeight);
                    contentArea.height((count * 70));
                }
                else {
                    grid.height((count * 60) + headerHeight + pagerHeight);
                    contentArea.height((count * 60));
                }

            }
            else {
                grid.height((count * 52) + headerHeight + pagerHeight);
                contentArea.height((count * 52));
            }
        }
        $('#CorpLayOutFooter').attr("style", "top: auto; position: relative;");
    }

    if (gridID === 'divlevel4data') {
        var data = Level4dataSource.data();
        $.each(data, function (i, row) {

            if (row.PastDueDate == true) {
                $('tr[data-uid="' + row.uid + '"] ').css("color", "#f00");
            }

        });
    }

}