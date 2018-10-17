ExcelView = true;
exportparameters = true;
var defaultValue = "-1";
var defaultText = "All";

var LevelIdentifier = 1;
var SelectedProgramName = "";
var SelectedProgramID = -1;
var SelectedChapterID = -1;
var SelectedChapterName = "";
var SelectedStandardName = "";
var SelectedStandardID = "";
var SelectedHCOName = "";
var SelectedSiteID = 0;
var ResetFilters = $("#GetResetLink").val();
var groupbyChapter = true;
var ExportReportName = "";
var isDuplicateLoadCall = false;

function additionalData(e) {

    return { search: SetSearchCriteria(false) }
}

function GetParameterValuesForTJC() {
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

    var searchset =
    {
        SelectedSiteIDs: ERSites.getSelectedSites(),
        ProgramIDs: ProgramIDs.toString(),
        ProgramNames: ProgramNames.toString().replace(/,/g, ", "),
        SelectedChapterIDs: SelectedChapterIDs.toString(),
        SelectedChapterNames: SelectedChapterNames.toString(),
        shortChaptersShow: shortChaptersShow.toString().replace(/,/g, ", "),
        SelectedStandardIDs: SelectedStandardIDs.toString(),
        SelectedStandardNames: SelectedStandardNames.toString().replace(/,/g, ", "),

        GrpBy: $('input[name=grpBy]:checked').val(),

        IncludeFSA: $('#FSAGraphCheckbox').is(':checked'),
        IncludeRFI: $('#RFIGraphCheckbox').is(':checked'),
        IncludePre: $('#PreGraphCheckbox').is(':checked'),
        IncludeFin: $('#FinGraphCheckbox').is(':checked'),
        StartDate: kendo.toString($("#ObsstartDate").data("kendoDatePicker").value(), "MM/dd/yyyy"),
        EndDate: kendo.toString($("#ObsEndDate").data("kendoDatePicker").value(), "MM/dd/yyyy"),
        ReportTitle: $('#hdnReportTitle').val(),
        SelectedSiteHCOIDs: "",
        LevelIdentifier: LevelIdentifier
    }

    return searchset;
}

function SetSearchCriteria(GenfromSavedFilters) {
    //clearallmultiselectsearch();
    //only for rdlc GenfromSavedFilters is set to true only from email button
    //layout.js file common code
    if (GenfromSavedFilters != undefined) {
        if (GenfromSavedFilters) {
            return SearchSetFilterData(GenfromSavedFilters, '');
        }
        else {
            return SearchSetFilterData(GenfromSavedFilters, GetParameterValuesForTJC());
        }
    }
    else {
        return SearchSetFilterData(GenfromSavedFilters, GetParameterValuesForTJC());
    }

}

//Withemail parameter is optional 
function GenerateReport(GenfromSavedFilters, Withemail) {
    //$('.loading').hide();
    //SetLoadingImageVisibility(false);
    hasExcelData = true;
    if (($('#RFIGraphCheckbox').is(':checked') == true) || ($('#PreGraphCheckbox').is(':checked') == true) || ($('#FinGraphCheckbox').is(':checked') == true)) {
        GenerateReportAddCall();
    }
    else {
        $('#error_msg').html('<div id="showerror_msg" class="alert alert-info alert-dismissible" role="alert" style="display:none;">      <button type="button" class="close" data-dismiss="alert">            <span aria-hidden="true">&times;</span><span class="sr-only">Close</span>        </button>        <div id="show_msg"></div>    </div>')
        $('#error_msg').css("display", "block");
        $('#showerror_msg').removeClass("alert-info").addClass("alert-danger");
        //$('#showerror_msg').css("display", "block");
        $('#showerror_msg').slideDown('slow');
        $('#show_msg').html("At least 1 findings checkbox must be checked.");
        $('#showerror_msg').delay(5000).slideUp('slow');
    }
}

function GenerateReportAddCall() {
    $('#loadChartView').html('');

    if ($('input[name=grpBy]:checked').val() == "Chapter") {
        groupbyChapter = true;
    } else {
        groupbyChapter = false;
    }
    ExcelGenerated = true;
    // reset values
    LevelIdentifier = 1;
    SelectedProgramName = "";
    SelectedProgramID = -1;
    SelectedChapterID = -1;
    SelectedChapterName = "";
    SelectedStandardName = "";
    SelectedStandardID = "";
    SelectedEPName = "";
    SelectedEPTextID = "";
    SelectedHCOName = "";
    SelectedSiteID = 0;
    ExportReportName = "";
    OrgRanking3Name = "";
    OrgRanking2Name = "";
    // groupbyChapter = true;

    $.ajax({
        async: false,
        url: '/Corporate/PriorityTjcRFI/LoadRFISummary',
        dataType: "html",

        success: function (data) {
            $('#loadChartView').html(data);
            //   EnableDisableChartView(true);
            //blockElement("divL1tag");
            Level1Load();
        },
        error: function (response) {
            var err = response;
        }
    });
}

function SetDefaults() {
    $('#loadChartView').html('');
    LevelIdentifier = 1;
    SelectedProgramName = "";
    SelectedProgramID = -1;
    SelectedChapterID = -1;
    SelectedChapterName = "";
    SelectedStandardName = "";
    SelectedStandardID = "";
    SelectedEPName = "";
    SelectedEPTextID = "";
    SelectedHCOName = "";
    SelectedSiteID = 0;
    ExportReportName = "";
    groupbyChapter = true;
    OrgRanking3Name = "";
    OrgRanking2Name = "";
    $('input[name=grpBy][value=Chapter]').prop('checked', true);
    CheckboxChecked('False', 'FSAGraphCheckbox');
    CheckboxChecked('True', 'RFIGraphCheckbox');
    CheckboxChecked('True', 'PreGraphCheckbox');
    CheckboxChecked('True', 'FinGraphCheckbox');
    var dateRangedeselect = $('input[name=DateRange]:checked').val();
    $('input:radio[id*=' + dateRangedeselect + ']').prop('checked', false);
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

function showlevelData() {
    switch (LevelIdentifier) {
        case 1:
            var checkLevel1Dataexists = $("#divleveldata");
            if (!checkLevel1Dataexists.data("kendoGrid")) {
                createLevel1Data();
            }

            $('#divlevelchart').css("display", "none");
            $('#divleveldata').css("display", "block");
            break;
        case 2:
            if (groupbyChapter) {
                var checkLevel2Dataexists = $("#divlevel2data");
                if (!checkLevel2Dataexists.data("kendoGrid")) {
                    createLevel2Data();
                }

                $('#divlevel2data').css("display", "block");
                $('#divlevel2chart').css("display", "none");
                $('#divlevel2details').css("display", "none");
            }
            else {
                var checkLevel3Dataexists = $("#divlevel3data");
                if (!checkLevel3Dataexists.data("kendoGrid")) {
                    createLevel3Data();
                }

                $('#divlevel3data').css("display", "block");
                $('#divlevel3chart').css("display", "none");
                $('#divlevel4details').css("display", "none");
            }

            break;
        case 3:
            if (groupbyChapter) {
                var checkLevel3Dataexists = $("#divlevel3data");
                if (!checkLevel3Dataexists.data("kendoGrid")) {
                    createLevel3Data();
                }

                $('#divlevel3data').css("display", "block");
                $('#divlevel3chart').css("display", "none");
                $('#divlevel4details').css("display", "none");
            }
            else {
                var checkLevel2Dataexists = $("#divlevel2data");
                if (!checkLevel2Dataexists.data("kendoGrid")) {
                    createLevel2Data();
                }

                $('#divlevel2data').css("display", "block");
                $('#divlevel2chart').css("display", "none");
                $('#divlevel2details').css("display", "none");
            }

            break;
        case 4:
            var checkLevel4Dataexists = $("#divlevel4data");
            if (!checkLevel4Dataexists.data("kendoGrid")) {

                createLevel4Data();
            }

            $('#divlevel4data').css("display", "block");
            $('#divlevel4chart').css("display", "none");
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
            $('#divlevelchart').css("display", "block");
            $('#divleveldata').css("display", "none");
            break;
        case 2:
            if (groupbyChapter) {
                $('#divlevel2chart').css("display", "block");
                $('#divlevel2data').css("display", "none");
                $('#divlevel2details').css("display", "none");
            }
            else {
                $('#divlevel3chart').css("display", "block");
                $('#divlevel3data').css("display", "none");
                $('#divlevel4details').css("display", "none");
            }

            break;
        case 3:
            if (groupbyChapter) {
                $('#divlevel3chart').css("display", "block");
                $('#divlevel3data').css("display", "none");
                $('#divlevel4details').css("display", "none");
            }
            else {
                $('#divlevel2chart').css("display", "block");
                $('#divlevel2data').css("display", "none");
                $('#divlevel2details').css("display", "none");
            }
            break;
        case 4:
            $('#divlevel4chart').css("display", "block");
            $('#divlevel4data').css("display", "none");
            break;
        case 5:
            $('#divlevel5chart').css("display", "block");
            $('#divlevel5data').css("display", "none");
            break;
    }
}

function DisplayLevel() {
    LevelIdentifier = LevelIdentifier > 1 ? LevelIdentifier - 1 : LevelIdentifier;

    //Skip a level if group by Standard, and already in EP level 
    if (!groupbyChapter) {
        LevelIdentifier = LevelIdentifier == 3 ? LevelIdentifier - 1 : LevelIdentifier;
    }
    $("#previousLevelButton").removeClass('k-button k-state-focused');
    switch (LevelIdentifier) {
        case 1:
            $("#divpreviouslevel").css("display", "none");
            $('#divL1Viewtag').css("display", "block");
            $('#divtoplevel1').css("display", "block");
            $('#divlevelchart').css("display", "block");
            $('#divleveldata').css("display", "none");
            $('#divlevel2details').css("display", "none");
            $('#radioL1Detail').css("display", "none");
            $('#inputL1Detail').css("display", "none");
            $('#divlevel4chart').css("display", "block");
            $('#divlevel4data').css("display", "none");
            if (groupbyChapter) {
                $('#divtoplevel2').css("display", "none");
                var levelkendogrid = $("#divlevel2data");
                if (levelkendogrid.data("kendoGrid")) {
                    $("#divlevel2data").data("kendoGrid").destroy();
                    $("#divlevel2data").empty();
                }
                var level2detailskendoGrid = $("#divlevel2details");
                if (level2detailskendoGrid.data("kendoGrid")) {
                    $("#divlevel2details").data("kendoGrid").destroy();
                    $("#divlevel2details").empty();
                }
            }
            else {
                var levelkendogrid = $("#divlevel3data");
                if (levelkendogrid.data("kendoGrid")) {

                    $("#divlevel3data").data("kendoGrid").destroy();
                    $("#divlevel3data").empty();

                }
                var level3detailskendoGrid = $("#divlevel4details");
                if (level3detailskendoGrid.data("kendoGrid")) {
                    $("#divlevel4details").data("kendoGrid").destroy();
                    $("#divlevel4details").empty();
                }
                $('#divtoplevel3').css("display", "none");
            }


            break;
        case 2:
            $('#divL1Viewtag').css("display", "block");
            if (groupbyChapter) {
                $('#divtoplevel2').css("display", "block");
                $('#divtoplevel3').css("display", "none");
                $('#divlevel2chart').css("display", "block");
                $('#radioL1Detail').css("display", "block");
                $('#inputL1Detail').css("display", "block");
                $('#divlevel2data').css("display", "none");

                $('#divlevel2details').css("display", "none");

                var levelkendogrid = $("#divlevel3data");
                if (levelkendogrid.data("kendoGrid")) {
                    $("#divlevel3data").data("kendoGrid").destroy();
                    $("#divlevel3data").empty();
                }
                var level3detailskendoGrid = $("#divlevel4details");
                if (level3detailskendoGrid.data("kendoGrid")) {
                    $("#divlevel4details").data("kendoGrid").destroy();
                    $("#divlevel4details").empty();
                }
            }
            else {
                $('#divtoplevel3').css("display", "block");
                $('#divtoplevel2').css("display", "none");                
                $('#divlevel3chart').css("display", "block");
                $('#divlevel3data').css("display", "none");
                $('#divlevel4details').css("display", "none");

                var levelkendogrid = $("#divlevel2data");
                if (levelkendogrid.data("kendoGrid")) {
                    $("#divlevel2data").data("kendoGrid").destroy();
                    $("#divlevel2data").empty();
                }
                var level2detailskendoGrid = $("#divlevel2details");
                if (level2detailskendoGrid.data("kendoGrid")) {
                    $("#divlevel2details").data("kendoGrid").destroy();
                    $("#divlevel2details").empty();
                }
                $('#divlevel4chart').css("display", "block");
                $('#divlevel4data').css("display", "none");
            }

            break;
        case 3:
            $('#divL1Viewtag').css("display", "block");
            $('#radioL1Detail').css("display", "block");
            $('#inputL1Detail').css("display", "block");
            if (groupbyChapter) {
                $('#divtoplevel3').css("display", "block");
                $('#divtoplevel4').css("display", "none");
                $('#divlevel3chart').css("display", "block");
                $('#divlevel3data').css("display", "none");
                $('#divlevel4details').css("display", "none");
            }
            else {
                $('#divtoplevel4').css("display", "none");
                $('#divtoplevel2').css("display", "block");
                $('#divlevel2chart').css("display", "block");
                $('#divlevel2data').css("display", "none");
                $('#divlevel2details').css("display", "none");

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
            $('#radioL1Detail').css("display", "none");
            $('#inputL1Detail').css("display", "none");

            var levelkendogrid = $("#divlevel5data");
            if (levelkendogrid.data("kendoGrid")) {
                $("#divlevel5data").data("kendoGrid").destroy();
                $("#divlevel5data").empty();
            }
            break;
        case 5:
            $('input:radio[name*="L1selectView"]').attr('disabled', false);
            $('#divtoplevel5').css("display", "block");
            $('#divtoplevel6').css("display", "none");
            $('#divlevel5chart').css("display", "block");
            $('#divlevel5data').css("display", "none");
            var levelkendogrid = $("#divlevel6data");
            if (levelkendogrid.data("kendoGrid")) {
                $("#divlevel6data").data("kendoGrid").destroy();
                $("#divlevel6data").empty();
            }
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

    switch (LevelIdentifier) {
        case 1:
            $("#spanSelParameters1").html("Findings by Program");

            if ($("#SiteSelector_SelectedHCOIDs").val().length > 0)
                $("#spanSelParameters2").html("HCOID: " + $("#SiteSelector_SelectedHCOIDs").val());
            else
                $("#spanSelParameters2").html("HCOID: " + ChartSearch.SelectedSiteHCOIDs);

            $("#spanSelParameters3").html("Chapter: " + ChartSearch.shortChaptersShow);
            $("#spanSelParameters4").html("Standard: " + ChartSearch.SelectedStandardNames);

            break;
        case 2:
            if (groupbyChapter) {

                $("#spanSelParameters1").html(SelectedProgramName + " - Findings by Chapter");
                $("#spanSelParameters2").html("HCOID: " + $("#SiteSelector_SelectedHCOIDs").val());
                $("#spanSelParameters3").html("Chapter: " + ChartSearch.shortChaptersShow);
                $("#spanSelParameters4").html("Standard: " + ChartSearch.SelectedStandardNames);
            }
            else {
                $("#spanSelParameters1").html(SelectedProgramName + " - Findings by Standard");
                $("#spanSelParameters2").html("Chapter: " + ChartSearch.shortChaptersShow);
                $("#spanSelParameters3").html("HCOID: " + $("#SiteSelector_SelectedHCOIDs").val());
                $("#spanSelParameters4").html("Standard: " + ChartSearch.SelectedStandardNames);
            }

            $("#spanSelParameters5").html("");

            break;
        case 3:

            $("#spanSelParameters1").html(SelectedChapterName + " - Findings by Standard");
            $("#spanSelParameters2").html("Program: " + SelectedProgramName);
            $("#spanSelParameters3").html("HCOID: " + $("#SiteSelector_SelectedHCOIDs").val());
            $("#spanSelParameters4").html("Standard: " + ChartSearch.SelectedStandardNames);
            $("#spanSelParameters5").html("");

            break;
        case 4:

            $("#spanSelParameters1").html(SelectedStandardName + " -  Findings by EP");
            $("#spanSelParameters2").html("Program: " + SelectedProgramName);
            $("#spanSelParameters3").html("HCOID: " + $("#SiteSelector_SelectedHCOIDs").val());

            if ((SelectedChapterName == null || SelectedChapterName == "") && SelectedStandardName != "") {
                SelectedChapterName = SelectedStandardName.split(".")[0];
            }
            $("#spanSelParameters4").html("Chapter: " + SelectedChapterName);
            $("#spanSelParameters5").html("");
            break;
    }

    if (ChartSearch.StartDate != null && ChartSearch.EndDate != null) {
        $("#spanSelParameters6").html("Observation updates for " + ChartSearch.StartDate + " - " + ChartSearch.EndDate);
    }
    else if (ChartSearch.StartDate != null && ChartSearch.EndDate == null) {
        $("#spanSelParameters6").html("Observation  updates since " + ChartSearch.StartDate);
    }
    else if (ChartSearch.StartDate == null && ChartSearch.EndDate != null) {
        $("#spanSelParameters6").html("Observation updates through " + ChartSearch.EndDate);
    }
    else {
        $("#spanSelParameters6").html("All Observation Dates");
    }

    var groupatparameter = "";
    if (groupbyChapter) {
        groupatparameter = "Group By: Chapter"
    }
    else {
        groupatparameter = "Group By: Standard"
    }
    if (ChartSearch.IncludeFSA) {
        groupatparameter = groupatparameter + ", Only FSA EPs";
        //   $("#spanSelParameters7").css("display", "block");
    }
    $("#spanSelParameters7").html(groupatparameter);
    var findingtext = '';
    if (ChartSearch.IncludeRFI) {
        findingtext = findingtext + " Display RFIs in Graph,";
    }
    if (ChartSearch.IncludePre) {
        findingtext = findingtext + " Preliminary Score,";
    }
    if (ChartSearch.IncludeFin) {
        findingtext = findingtext + " Final Score,";
    }
    findingtext = findingtext.substring(1, findingtext.length - 1);
    { $("#spanSelParameters8").html("Findings : " + findingtext); }
    ScrollToTopCall();
}


//group status verification level1
var checkGraphStatus = function () {

    var completedStatus = [];
    if ($('#PreGraphCheckbox').is(':checked') == true) {
        completedStatus.push({
            field: "PSCount",
            name: "Preliminary",
            color: "#78C5F0"
        });
    }

    if ($('#FinGraphCheckbox').is(':checked') == true) {
        completedStatus.push({
            field: "FSCount",
            name: "Final",
            color: "#307D99"
        });
    }
    if (($('#RFIGraphCheckbox').is(':checked') == true)) {

        completedStatus.push({
            field: "RFICount",
            name: "TJC RFI",
            color: "#C13D2F"
        });
    }



    return completedStatus;
}


//Level 1 scripts start
function createLevel1Chart() {

    $("#divlevelchart").kendoChart({
        dataSource: Level1dataSource,
        dataBound: onDB,
        data: {
            Accept: "application/json"
        },
        title: {
            text: "Click graph for more details",
            color: "#C61835"
        },
        legend: {
            position: "bottom"
        },
        seriesDefaults: {
            type: "column",
            stack: true,
            labels: {
                visible: true,
                font: "bold 14px  Arial,Helvetica,sans-serif",
                background: "transparent",
                color: "white",
                position: "center",
                format: "NO"
            }
        },
        series:
        checkGraphStatus(),
        valueAxes: [{
            name: "Default",
            title: {
                text: "Findings"
            },
            min: 0
        }],
        categoryAxis: {
            field: "ProgramName",
            value: "ProgramID",
            majorGridLines: {
                visible: false
            },
            labels: {
                rotation: 315
            }
        },
        tooltip: {
            visible: true,
            format: "N0"
        },
        seriesClick: onLevel1SeriesClick
    });
}

function createLevel1Data() {

    $("#divleveldata").kendoGrid({
        dataSource: Level1dataSource,
        change: onLevel1Click,
        excel: { allPages: true },
        excelExport: ERexcelExport,
        selectable: false,
        sortable: true,
        pageable: {
            refresh: true,
            pageSizes: [20, 50, 100]
        },
        columns: [
             { field: "ProgramID", hidden: "true" },
             { field: "ProgramName", width: 175, title: "Program" },
             { field: "RFICount", width: 150, title: "RFI Count" },
             { field: "PSCount", width: 150, title: "Preliminary Score Count" },
             { field: "FSCount", width: 150, title: "Final Score Count " }
        ]
    });
}

// code to call first level 
function Level1Load() {
    Level1dataSource = Level1datasourcecall();
    Level1dataSource.sync();

    createLevel1Chart();
    $('#divlevelchart').css("display", "block");
    $('#radioL1Detail').css("display", "none");
    $('#inputL1Detail').css("display", "none");
}

var Level1dataSource = "";
function Level1datasourcecall() {
    var ChartSearch = SetSearchCriteria(false);
    DisplayLevelParameters(ChartSearch);
    hasExcelData = true;

    return new kendo.data.DataSource({
        transport: {
            read: {
                url: "/Corporate/PriorityTjcRFI/RFIReport_Data",
                type: "post",
                dataType: "json",
                data: { search: ChartSearch, LevelIdentifier: 1 }
            }
        },
        pageSize: 20,
        requestEnd: function (e) {
            if (e.response != null) {

                if (e.response.length === 0) {
                    $('#loadChartView').html('');
                    closeSlide("btnEmail", "slideEmail");
                    openSlide("btnSearchCriteria", "slideSearch");

                    hasExcelData = false;
                    $('#error_msg').html('<div id="showerror_msg" class="alert alert-info alert-dismissible" role="alert" style="display:none;">      <button type="button" class="close" data-dismiss="alert">            <span aria-hidden="true">&times;</span><span class="sr-only">Close</span>        </button>        <div id="show_msg"></div>    </div>')
                    $('#error_msg').css("display", "block");
                    $('#showerror_msg').removeClass("alert-info").addClass("alert-danger");
                    //$('#showerror_msg').css("display", "block");
                    $('#showerror_msg').slideDown('slow');
                    $('#show_msg').html("No data found matching your Criteria. Change Criteria and try again.");
                    $('#showerror_msg').delay(5000).slideUp('slow');
                    EnableDisableEmail(false);
                }
                else {
                    //Set the Chart y-axis to integer only
                    var max = 1;
                    for (var i = 0; i < e.response.length; i++) {
                        var TotalCount = e.response[i].FSCount + e.response[i].PSCount + e.response[i].RFICount;

                        if (TotalCount > max)
                            max = TotalCount;
                    };

                    if (max <= 10)
                        $("#divlevelchart").data('kendoChart').options.valueAxis.majorUnit = 2;
                    else
                        $("#divlevelchart").data('kendoChart').options.valueAxis.majorUnit = undefined;

                    setChartHeight("divlevelchart", e.response.length);
                    closeSlide("btnSearchCriteria", "slideSearch");
                    EnableDisableEmail(true);
                }
            }
            //unBlockElement("divL1tag");
        }
    });
}

function onLevel1SeriesClick(e) {
    EnableDisableChartView(true);
    $('#radioL1Detail').css("display", "block");
    $('#inputL1Detail').css("display", "block");
    LevelIdentifier = 2;

    $('#divtoplevel1').css("display", "none");

    if (groupbyChapter) {

        $('#divtoplevel2').css("display", "block");
        $('#divlevel2chart').css("display", "block");
        $('#divlevel2data').css("display", "none");
        Level2Load(e.dataItem.ProgramID, e.dataItem.ProgramName, e.dataItem.ChapterID, e.dataItem.Label);

    }
    else {
        $('#divtoplevel3').css("display", "block");
        $('#divlevel3chart').css("display", "block");
        $('#divlevel3data').css("display", "none");
        $('#divlevel4details').css("display", "none");

        Level3Load(e.dataItem.ProgramID, e.dataItem.ProgramName);
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
    $('#radioL1Detail').css("display", "block");
    $('#inputL1Detail').css("display", "block");
    $('input:radio[id*="radioL1Graph"]').prop('checked', true);
    LevelIdentifier = 2;
    $('#divtoplevel1').css("display", "none");
    var data = this.dataItem(this.select());

    if (data != null) {
        if (groupbyChapter) {
            $('#divtoplevel2').css("display", "block");
            $('#divlevel2chart').css("display", "block");
            $('#divlevel2data').css("display", "none");
            $('#divlevel2details').css("display", "none");
            Level2Load(data.ProgramID, data.ProgramName, data.ChapterID, data.labels);
        }
        else {
            $('#divtoplevel3').css("display", "block");
            $('#divlevel3chart').css("display", "block");
            $('#divlevel3data').css("display", "none");
            $('#divlevel4details').css("display", "none");
            Level3Load(data.ProgramID, data.ProgramName); if (!groupbyChapter) {
                $.ajax({
                    async: false,
                    url: '/Corporate/PriorityTjcRFI/GetCountForOthers',
                    dataType: "html",
                    success: function (response) {
                        $("#spanSelParameters11").html("Others: Finding count - " + response.FindingCount);

                    },
                    error: function (response) {
                        var err = response;
                    }
                });
            }
        }

        $("#divpreviouslevel").css("display", "block");

        $("#exportoexcel").css("display", "none");
        $("#exporttopdf").css("display", "block");
    }
}
// Level 1 scripts end

function setChartHeight(chartname, arraylength) {
    var heightchart = arraylength * 50;
    if (heightchart < 350)
    { heightchart = 350; }

    $('#' + chartname).css("height", heightchart);
}
function onDB(e) {

    if (e.sender.options.series[0] != null) {

        e.sender.options.series[0].labels.visible = function (point) {
            if (point.value < 1) {
                return false
            }
            else { return point.value }
        }
    }
    if (e.sender.options.series[1] != null) {
        e.sender.options.series[1].labels.visible = function (point) {
            if (point.value < 1) {
                return false
            }
            else { return point.value }
        }

    }
    if (e.sender.options.series[2] != null) {
        e.sender.options.series[2].labels.visible = function (point) {
            if (point.value < 1) {
                return false
            }
            else { return point.value }
        }

    }
    

    //Remove cumulative percentage axis if there is only one value
    if ((e.sender.options.categoryAxis.dataItems != null && e.sender.options.categoryAxis.dataItems.length == 1) && (e.sender.options.valueAxis != null && e.sender.options.valueAxis.length > 1)) {
        e.sender.options.valueAxis.splice(1, 1);
        var rightYAxis = $.grep(e.sender.options.series, function (e) { return e.axis == "%"; });
        if (rightYAxis != null)
            e.sender.options.series.pop();
    }
}

// Level 2 scripts start
function onLevel2SeriesClick(e) {
    EnableDisableChartView(true);
    if (groupbyChapter) {
        LevelIdentifier = 3;
        $('#divtoplevel2').css("display", "none");
        $('#divtoplevel3').css("display", "block");
        $('#divlevel3chart').css("display", "block");
        $('#divlevel3data').css("display", "none");
        $('#divlevel4details').css("display", "none");
        Level3Load(e.dataItem.ProgramID, e.dataItem.ProgramName, e.dataItem.ChapterID, e.dataItem.Label);
    }
    else {
        $('#divtoplevel2').css("display", "none");
        $('#divtoplevel4').css("display", "block");
        $('#divlevel4chart').css("display", "block");
        $('#divlevel4data').css("display", "none");
        Level4Load(e.dataItem.StandardID, e.dataItem.Label);
    }
}
function onLevel2Click(e) {
    EnableDisableChartView(true);
    $('input:radio[id*="radioL1Graph"]').prop('checked', true);
    LevelIdentifier = 3;
    var data = this.dataItem(this.select());

    if (data != null) {
        if (groupbyChapter) {
            LevelIdentifier = 3;
            $('#divtoplevel2').css("display", "none");
            $('#divtoplevel3').css("display", "block");
            $('#divlevel3chart').css("display", "block");
            $('#divlevel3data').css("display", "none");
            $('#divlevel4details').css("display", "none");
            Level3Load(e.dataItem.ProgramID, e.dataItem.ProgramName, e.dataItem.ChapterID, e.dataItem.Label);
        }
        else {
            // to do 4th level
            LevelIdentifier = 4;
            $('#divtoplevel2').css("display", "none");
            $('#divtoplevel4').css("display", "block");
            $('#divlevel4chart').css("display", "block");
            $('#divlevel4data').css("display", "none");
            Level4Load(e.dataItem.StandardID, e.dataItem.Label);
        }

        $("#exportoexcel").css("display", "none");
        $("#exporttopdf").css("display", "block");
    }
}

//group status verification Level 2 and Leve 3
var checkGraphStatusLevel = function (levelStatus) {

    var completedStatus = [];

    if ($('#PreGraphCheckbox').is(':checked') == true) {
        completedStatus.push({
            field: "PSCount",
            name: "Preliminary",
            color: "#78C5F0",
            visible: true,
            axis: "Default",
            width: 90,
            gap: 0.3
        });
    }

    if ($('#FinGraphCheckbox').is(':checked') == true) {
        completedStatus.push({
            field: "FSCount",
            name: "Final",
            color: "#307D99",
            visible: true,
            axis: "Default",
            width: 90,            
            gap: 0.3
        });
    }

    if (($('#RFIGraphCheckbox').is(':checked') == true)) {
        completedStatus.push({
            field: "RFICount",
            name: "TJC RFI",
            color: "#C13D2F",
            visible: true,
            axis: "Default",
            width: 90,            
            gap: 0.3

        });
    }

    if (levelStatus == 2) {
        completedStatus.push({
            type: "line",
            style: "rigid",
            name: "Cumulative",
            color: "#010101",
            missingValues: "interpolate",
            markers: {
                background: "#010101",
                type: "square"
            },
            labels: {
                color: "transparent",
                format: "{0:n0}",
                 visible: false
            },
            width: 1,
            field: "CumulativePerc",
            axis: "%"
        });


    } else if (levelStatus == 3) {
        completedStatus.push({
            type: "line",
            style: "rigid",
            name: "Cumulative %",
            color: "#010101",
            missingValues: "interpolate",
            markers: {
                background: "#010101",
                type: "square"
            },
            labels: {
                color: "transparent",
                format: "{0:n0}",
                visible: false
            },
            width: 1,
            field: "CumulativePerc",
            axis: "%"
        });
    }
    return completedStatus;
}







function createLevel2Chart() {

    $("#divlevel2chart").kendoChart({

        dataSource: Level2dataSourceChart,
        dataBound: onDB,
        title: {
            text: "Click graph for more details",
            color: "#C61835"
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
        seriesDefaults: {
            type: "column",
            stack: true,
            labels: {
                visible: false,
                font: "bold 14px  Arial,Helvetica,sans-serif",
                position: "center",
                background: "transparent"
            }
        },
        series:checkGraphStatusLevel(2),
        valueAxes: [{
            name: "Default",
            title: {
                text: "Findings"
            },
            min: 0,
            // max: Level2MaxCount, //80,//Level2MaxCount,
            //  majorUnit: 5,
            pane: "default-pane"
        }, {
            name: "%",
            min: 0,
            max: 100,
            title: {
                text: "Cumulative %",
                rotation: 450
            },
            color: "#4e4141"
        }],
        panes: [{
            name: "default-pane",
            clip: false
        }],
        categoryAxis: {

            field: "Label",
            axisCrossingValue: [0, 40],
            labels: {
                visible: true,
                rotation: 270
            }

        },
        tooltip: {
            visible: true,
            format: "N0"
        },
        //End CateogryAxis
        seriesClick: onLevel2SeriesClick
    });
}
//New functionality added for detail view
var Level3detailsSource = "";
function showlevelDetails() {
    switch (LevelIdentifier) {
        case 2:
            if (groupbyChapter) {
                var checkLevel2DetailsExists = $("#divlevel2details");
                if (!checkLevel2DetailsExists.data("kendoGrid")) {
                    Level2detailsSource = Level2detailsourcecall();
                    createLevel2Details(Level2detailsSource);
                }
                $('#divlevel2details').css("display", "block");
                $('#divlevel2data').css("display", "none");
                $('#divlevel2chart').css("display", "none");
            }
            else {
                var checkLevel3DetailsExists = $("#divlevel4details");
                if (!checkLevel3DetailsExists.data("kendoGrid")) {
                    Level3detailsSource = Level3detailsourcecall();
                    createLevel3Details(Level3detailsSource);
                }
                $('#divlevel4details').css("display", "block");
                $('#divlevel3data').css("display", "none");
                $('#divlevel3chart').css("display", "none");
            }

            break;
        case 3:
            if (groupbyChapter) {
                var checkLevel3DetailsExists = $("#divlevel4details");
                if (!checkLevel3DetailsExists.data("kendoGrid")) {
                    Level3detailsSource = Level3detailsourcecall();
                    createLevel3Details(Level3detailsSource);
                }
                $('#divlevel4details').css("display", "block");
                $('#divlevel3data').css("display", "none");
                $('#divlevel3chart').css("display", "none");
            }
            else {
                var checkLevel2DetailsExists = $("#divlevel2details");
                if (!checkLevel2DetailsExists.data("kendoGrid")) {
                    Level2detailsSource = Level2detailsourcecall();
                    createLevel2Details(Level2detailsSource);
                }

                $('#divlevel2data').css("display", "none");
                $('#divlevel2chart').css("display", "none");
                $('#divlevel2details').css("display", "block");
            }
            break;

    }
}
function createLevel2Details(Level2detailsSource) {
    $("#divlevel2details").kendoGrid({
        dataSource: Level2detailsSource,
        clickable: false,
        selectable: false,
        sortable: true,
        cursor: "pointer",
        scrollable: true,
        dataBound: LargeGridResize,
        //height: 450,
        excel: { allPages: true },
        excelExport: ERexcelExport,
        pageable: {
            refresh: true,
            pageSizes: [20, 50, 100]
        },
        columns: [
                    { field: "HCO_ID", width: 70, title: "HCO ID" },
                    { field: "Program", width: 75, title: "Program" },
                    { field: "State", width: 45, title: "State" },
                    { field: "HospitalName", width: 150, title: "Hospital Name" },
                    { field: "Chapter", width: 150, title: "Chapter" },
                    { field: "Standard", width: 100, title: "Standard" },
                    { field: "EP", width: 35, title: "EP" },
                    { command: { text: "View Documentation", click: showDocuments }, title: "Documentation", width: "180px" },
                    { field: "TJCFinding", width: 150, title: "Last TJC Survey Findings", hidden: "true" },
                    { field: "TJCScore", width: 130, title: "TJC Score" },
                    { field: "TJCSAFERScoreLikelihood", width: 235, title: "TJC SAFER Score: Likelihood to Harm" },
                    { field: "TJCSAFERScoreScope", width: 160, title: "TJC SAFER Score: Scope" },
                    { field: "TJCScoreDate", width: 135, title: "TJC Score Date" },
                    { field: "PreliminaryScore", width: 135, title: "Preliminary Score" },
                    { field: "PreliminarySAFERScoreLikelihood", width: 270, title: "Preliminary SAFER Score: Likelihood to Harm" },
                    { field: "PreliminarySAFERScoreScope", width: 200, title: "Preliminary SAFER Score: Scope" },
                    { field: "PreliminaryScoreDate", width: 150, title: "Preliminary Score Date" },
                    { field: "FinalScore", width: 130, title: "Final Score" },
                    { field: "FinalSAFERScoreLikelihood", width: 240, title: "Final SAFER Score: Likelihood to Harm" },
                    { field: "FinalSAFERScoreScope", width: 170, title: "Final SAFER Score: Scope" },
                    { field: "FinalScoreDate", width: 125, title: "Final Score Date" },
                    { field: "OrgFindings", title: "Organization Findings", width: 140, hidden: "true" },
                    { field: "PlanOfAction", width: 130, title: "Plan Of Action", hidden: "true" },
                    { field: "CompliantByDate", title: "POA Compliant By Date", width: 150, hidden: "true" },
                    { field: "SustainmentPlan", title: "Sustainment Plan", width: 130, hidden: "true" },
                    { field: "InternalNotes", title: "Internal Notes", width: 130, hidden: "true" }
        ]

    });

}

function createLevel3Details(Level3detailsSource) {
    $("#divlevel4details").kendoGrid({
        dataSource: Level3detailsSource,
        clickable: false,
        selectable: false,
        sortable: true,
        cursor: "pointer",
        scrollable: true,
        dataBound: LargeGridResize,
        //height: 450,
        excel: { allPages: true },
        excelExport: ERexcelExport,
        pageable: {
            refresh: true,
            pageSizes: [20, 50, 100]
        },
        columns: [
                    { field: "HCO_ID", width: 70, title: "HCO ID" },
                    { field: "Program", width: 75, title: "Program" },
                    { field: "State", width: 45, title: "State" },
                    { field: "HospitalName", width: 150, title: "Hospital Name" },
                    { field: "Chapter", width: 150, title: "Chapter" },
                    { field: "Standard", width: 100, title: "Standard" },
                    { field: "EP", width: 35, title: "EP" },
                    { command: { text: "View Documentation", click: showDocuments }, title: "Documentation", width: "180px" },
                    { field: "TJCFinding", width: 150, title: "Last TJC Survey Findings", hidden: "true" },
                    { field: "TJCScore", width: 130, title: "TJC Score" },
                    { field: "TJCSAFERScoreLikelihood", width: 235, title: "TJC SAFER Score: Likelihood to Harm" },
                    { field: "TJCSAFERScoreScope", width: 160, title: "TJC SAFER Score: Scope" },
                    { field: "TJCScoreDate", width: 135, title: "TJC Score Date" },
                    { field: "PreliminaryScore", width: 135, title: "Preliminary Score" },
                    { field: "PreliminarySAFERScoreLikelihood", width: 270, title: "Preliminary SAFER Score: Likelihood to Harm" },
                    { field: "PreliminarySAFERScoreScope", width: 200, title: "Preliminary SAFER Score: Scope" },
                    { field: "PreliminaryScoreDate", width: 150, title: "Preliminary Score Date" },
                    { field: "FinalScore", width: 130, title: "Final Score" },
                    { field: "FinalSAFERScoreLikelihood", width: 240, title: "Final SAFER Score: Likelihood to Harm" },
                    { field: "FinalSAFERScoreScope", width: 170, title: "Final SAFER Score: Scope" },
                    { field: "FinalScoreDate", width: 125, title: "Final Score Date" },
                    { field: "OrgFindings", title: "Organization Findings", width: 140, hidden: "true" },
                    { field: "PlanOfAction", width: 130, title: "Plan Of Action", hidden: "true" },
                    { field: "CompliantByDate", title: "POA Compliant By Date", width: 150, hidden: "true" },
                    { field: "SustainmentPlan", title: "Sustainment Plan", width: 130, hidden: "true" },
                    { field: "InternalNotes", title: "Internal Notes", width: 130, hidden: "true" }
        ]

    });

}
function createLevel2Data() {
    //When there is only one finding, removing cumulative % axis throws an error in the chart.
    //Workaround is to rebind the grid first time with a different datasource
    var Level2dataSource1;
    if (Level2dataSource == "") {
        isDuplicateLoadCall = true;
        Level2dataSource1 = Level2datasourcecall();
        Level2dataSource1.sync();
    }
    else {
        Level2dataSource1 = Level2dataSource;
    }

    $("#divlevel2data").kendoGrid({
        dataSource: Level2dataSource1,

        change: onLevel2Click,
        selectable: false,
        sortable: true,
        excel: { allPages: true },
        excelExport: ERexcelExport,
        pageable: {
            refresh: true,
            pageSizes: [20, 50, 100]
        },
        columns: [
            { field: "ChapterID", hidden: "true" },
             { field: "Label", width: 80, title: "Chapter" },
             { field: "RFICount", width: 100, title: "RFI Count" },
             { field: "PSCount", width: 100, title: "Preliminary Score Count" },
             { field: "FSCount", width: 100, title: "Final Score Count" },
             { field: "TotalPercen", width: 120, title: "Percent of Total" },
             { field: "CumulativePerc", width: 100, title: "Cumulative %" }]
    });
}

// code to call second level 
function Level2Load(ProgramID, ProgramName, ChapterID, ChapterCode) {

    if (groupbyChapter) {
        SelectedProgramName = ProgramName;
        SelectedProgramID = ProgramID;
    }
    else {
        SelectedChapterName = ChapterCode;
        SelectedChapterID = ChapterID;
    }

    isDuplicateLoadCall = false;

    Level2dataSourceChart = Level2datasourcecall(true);
    Level2dataSourceChart.sync();

    Level2dataSource = "";
    createLevel2Chart();

}

var Level2dataSource = "";
var Level2detailsSource = "";
var Level2MaxCount = 80;
var Level2dataSourceChart = "";

function Level2detailsourcecall() {
    var ChartSearch = SetSearchCriteria(true);
    ChartSearch.ProgramIDs = SelectedProgramID;
    ChartSearch.ProgramNames = SelectedProgramName;
    if (!groupbyChapter) {
        ChartSearch.SelectedChapterIDs = SelectedChapterID;
        ChartSearch.SelectedChapterNames = SelectedChapterName;
    }

    DisplayLevelParameters(ChartSearch);

    return new kendo.data.DataSource({
        transport: {
            read: {
                url: "/Corporate/PriorityTjcRFI/RFIEPLevelDetails_Data",
                type: "post",
                dataType: "json",
                data: { search: ChartSearch, LevelIdentifier: 2 }
            }
        },
        pageSize: 20,
        requestEnd: function (e) {
            if (e.response != null) {
                setChartHeight("divlevel4chart", e.response.length);
            }
            EnableDisableChartView(false);
        },

        columns: [
                   { field: "HCO_ID", width: 70, title: "HCO ID" },
                   { field: "Program", width: 75, title: "Program" },
                   { field: "State", width: 45, title: "State" },
                   { field: "HospitalName", width: 150, title: "Hospital Name" },
                   { field: "Chapter", width: 150, title: "Chapter" },
                   { field: "Standard", width: 100, title: "Standard" },
                   { field: "EP", width: 35, title: "EP" },
                   { command: { text: "View Documentation", click: showDocuments }, title: "Documentation", width: "180px" },
                   { field: "TJCFinding", width: 150, title: "Last TJC Survey Findings", hidden: "true" },
                   { field: "TJCScore", width: 150, title: "TJC Score" },
                   { field: "TJCSAFERScoreLikelihood", width: 150, title: "TJC SAFER Score - Likelihood to Harm" },
                   { field: "TJCSAFERScoreScope", width: 150, title: "TJC SAFER Score - Scope" },
                   { field: "TJCScoreDate", width: 150, title: "TJC Score Date" },
                   { field: "PreliminaryScore", width: 150, title: "Preliminary Score" },
                   { field: "PreliminarySAFERScoreLikelihood", width: 150, title: "Preliminary SAFER Score - Likelihood to Harm" },
                   { field: "PreliminarySAFERScoreScope", width: 150, title: "Preliminary SAFER Score - Scope" },
                   { field: "PreliminaryScoreDate", width: 150, title: "Preliminary Score Date" },
                   { field: "FinalScore", width: 150, title: "Final Score" },
                   { field: "FinalSAFERScoreLikelihood", width: 80, title: "Final SAFER Score - Likelihood to Harm" },
                   { field: "FinalSAFERScoreScope", width: 150, title: "Final SAFER Score - Scope" },
                   { field: "FinalScoreDate", width: 80, title: "Final Score Date" },
                   { field: "OrgFindings", title: "Organization Findings", width: 140, hidden: "true" },
                   { field: "PlanOfAction", width: 130, title: "Plan Of Action", hidden: "true" },
                   { field: "CompliantByDate", title: "POA Compliant By Date", width: 150, hidden: "true" },
                   { field: "SustainmentPlan", title: "Sustainment Plan", width: 130, hidden: "true" },
                   { field: "InternalNotes", title: "Internal Notes", width: 130, hidden: "true" }
        ]
    });
}
function Level2datasourcecall(preventPaging) {
    preventPaging = preventPaging | false;
    var ChartSearch = SetSearchCriteria(true);
    ChartSearch.ProgramIDs = SelectedProgramID;
    ChartSearch.ProgramNames = SelectedProgramName;
    ChartSearch.IsDuplicateLoadCall = isDuplicateLoadCall;

    if (!groupbyChapter) {
        ChartSearch.SelectedChapterIDs = SelectedChapterID;
        ChartSearch.SelectedChapterNames = SelectedChapterName;
    }

    DisplayLevelParameters(ChartSearch);

    if (preventPaging) {
        return new kendo.data.DataSource({
            transport: {
                read: {
                    url: "/Corporate/PriorityTjcRFI/RFIReport_Data",
                    type: "post",
                    dataType: "json",
                    data: { search: ChartSearch, LevelIdentifier: 2 }
                }
            },
            requestEnd: function (e) {
                Level2datasourcecallRequestEnd(e);
            }
        });
    }
    else {
        return new kendo.data.DataSource({
            transport: {
                read: {
                    url: "/Corporate/PriorityTjcRFI/RFIReport_Data",
                    type: "post",
                    dataType: "json",
                    data: { search: ChartSearch, LevelIdentifier: 2 }
                }
            },
            requestEnd: function (e) {
                Level2datasourcecallRequestEnd(e);
            },
            pageSize: 20
        });

    }
}

function Level2datasourcecallRequestEnd(e) {
    if (e.response != null) {
        //Set the Chart y-axis to integer only
        var max = 1;
        for (var i = 0; i < e.response.length; i++) {
            var TotalCount = e.response[i].FSCount + e.response[i].PSCount + e.response[i].RFICount;

            if (TotalCount > max)
                max = TotalCount;

            //Round of cumulative % to 100 if it exceeds 100%
            if (e.response[i].CumulativePerc >= 100)
                e.response[i].CumulativePerc = 100;
        };

        if (max <= 10)
            $("#divlevel2chart").data('kendoChart').options.valueAxis[0].majorUnit = 2;
        else
            $("#divlevel2chart").data('kendoChart').options.valueAxis[0].majorUnit = undefined;

        setChartHeight("divlevel2chart", e.response.length);

        //Get the max FindingCount
        var CCAMax, RFIMax;
        CCAMax = 0;
        RFIMax = 0;
        for (var i = 0 ; i < e.response.length ; i++) {
            if (!CCAMax || parseInt(e.response[i]["FindingCount"]) > parseInt(CCAMax["FindingCount"]))
                CCAMax = e.response[i]["FindingCount"];
        }
        for (var i = 0 ; i < e.response.length ; i++) {
            if (!RFIMax || parseInt(e.response[i]["RFICount"]) > parseInt(RFIMax["RFICount"]))
                RFIMax = e.response[i]["RFICount"];
        }
        var MaxCount = CCAMax + RFIMax;
        if (MaxCount > Level2MaxCount)
            Level2MaxCount = MaxCount;

    }
    EnableDisableChartView(false);
}
// Level 2 scripts end

// Level 3 scripts start
function createLevel3Chart() {
    $("#divlevel3chart").kendoChart({

        dataSource: Level3dataSourceChart,
        dataBound: onDB,
        title: {
            text: "Click graph for more details",
            color: "#C61835"
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
        seriesDefaults: {
            type: "column",
            stack: true,
            labels: {
                visible: true,
                font: "bold 14px  Arial,Helvetica,sans-serif",
                background: "transparent",
                position: "center"
            }
        },
        series: checkGraphStatusLevel(3),

        valueAxes: [{
            name: "Default",
            title: {
                text: "Findings"
            },
            min: 0,
            //max: 10,//Level2MaxCount,
            // majorUnit: 50,
            pane: "default-pane"
        },
            {
                name: "%",
                min: 0,
                max: 100,
                title: {
                    text: "Cumulative %",
                    rotation: 450
                },
                color: "#4e4141"
            }],
        panes: [{
            name: "default-pane",
            clip: false
        }],
        categoryAxis: {

            field: "Label",
            axisCrossingValue: [0, 140],
            labels: {
                visible: true,
                rotation: 270
            }

        },
        tooltip: {
            visible: true,
            format: "N0"
        },
        //End CateogryAxis
        seriesClick: onLevel3SeriesClick
    });


}
function createLevel3Data() {
    //When there is only one finding, removing cumulative % axis throws an error in the chart.
    //Workaround is to rebind the grid first time with a different datasource
    var Level3dataSource1;
    if (Level3dataSource == "") {
        isDuplicateLoadCall = true;
        Level3dataSource1 = Level3datasourcecall();
        Level3dataSource1.sync();
    }
    else {
        Level3dataSource1 = Level3dataSource;
    }

    $("#divlevel3data").kendoGrid({
        dataSource: Level3dataSource1,
        selectable: false,
        sortable: true,
        change: onLevel3Click,
        excel: { allPages: true },
        excelExport: ERexcelExport,
        pageable: {
            refresh: true,
            pageSizes: [20, 50, 100]
        },
        columns: [
             { field: "Label", width: 80, title: "Standard" },
             { field: "RFICount", width: 100, title: "RFI Count" },
             { field: "PSCount", width: 100, title: "Preliminary Score Count" },
             { field: "FSCount", width: 100, title: "Final Score Count" },
             { field: "Percentage", width: 100, title: "Percent of Total" },
             { field: "CumulativePerc", width: 100, title: "Cumulative %" }]
    });
}

// code to call third level
function Level3Load(ProgramID, ProgramNames, ChapterID, ChapterCode, StandardID, StandardName) {
    if (ProgramID) {
        SelectedProgramName = ProgramNames;
        SelectedProgramID = ProgramID;
    }

    if (groupbyChapter) {
        SelectedChapterID = ChapterID;
        SelectedChapterName = ChapterCode;
    }

    isDuplicateLoadCall = false;

    Level3dataSourceChart = Level3datasourcecall(true);
    Level3dataSourceChart.sync();

    Level3dataSource = "";
    createLevel3Chart();
    SetStandardLabel();

}
function SetStandardLabel() {

    var OtherInfo;
    $.ajax({
        async: false,
        url: '/Corporate/PriorityTjcRFI/GetCountForOthers',
        dataType: "html",
        success: function (response) {
            var max = response;
            max = JSON.parse(max);
            $("#spanStandardDetail").html("*This graph represents " + max + "% of the total findings for selected sites and criteria.");
            $("#divlevel3Detail").css("display", "block");

        },
        error: function (response) {
            var err = response;
        }
    });
}

var Level3dataSource = "";
var Level3dataSourceChart = "";
function Level3datasourcecall(preventPaging) {
    preventPaging = preventPaging | false;
    var ChartSearch = SetSearchCriteria(true);
    ChartSearch.ProgramIDs = SelectedProgramID;
    ChartSearch.ProgramNames = SelectedProgramName;
    ChartSearch.IsDuplicateLoadCall = isDuplicateLoadCall;

    if (groupbyChapter) {
        ChartSearch.SelectedChapterIDs = SelectedChapterID;
        ChartSearch.SelectedChapterNames = SelectedChapterName;
    }

    DisplayLevelParameters(ChartSearch);

    if (preventPaging) {
        return new kendo.data.DataSource({
            transport: {
                read: {
                    url: "/Corporate/PriorityTjcRFI/RFIReport_Data",
                    type: "post",
                    dataType: "json",
                    data: { search: ChartSearch, LevelIdentifier: 3 }
                }
            },
            requestEnd: function (e) {
                Level3datasourcecallRequestEnd(e);
            }
        });
    }
    else {
        return new kendo.data.DataSource({
            transport: {
                read: {
                    url: "/Corporate/PriorityTjcRFI/RFIReport_Data",
                    type: "post",
                    dataType: "json",
                    data: { search: ChartSearch, LevelIdentifier: 3 }
                }
            },
            requestEnd: function (e) {
                Level3datasourcecallRequestEnd(e);
            },
            pageSize: 20
        });

    }
}

function Level3datasourcecallRequestEnd(e) {
    if (e.response != null) {
        //Set the Chart y-axis to integer only
        var max = 1;
        for (var i = 0; i < e.response.length; i++) {
            var TotalCount = e.response[i].FSCount + e.response[i].PSCount + e.response[i].RFICount;

            if (TotalCount > max)
                max = TotalCount;

            //Round of cumulative % to 100 if it exceeds 100%
            if (e.response[i].CumulativePerc >= 100)
                e.response[i].CumulativePerc = 100;
        };

        if (max <= 10)
            $("#divlevel3chart").data('kendoChart').options.valueAxis[0].majorUnit = 2;
        else
            $("#divlevel3chart").data('kendoChart').options.valueAxis[0].majorUnit = undefined;

        setChartHeight("divlevel3chart", e.response.length);
    }
    EnableDisableChartView(false);
}

function onLevel3SeriesClick(e) {
    if (e.dataItem.StandardID != "999") {
        EnableDisableChartView(true);

        LevelIdentifier = 4;
        $('#divtoplevel4').css("display", "block");
        $('#divtoplevel3').css("display", "none");
        $('#divlevel4data').css("display", "block");
        Level4Load(e.dataItem.StandardID, e.dataItem.Label);
        $('input:radio[id*="radioL1Data"]').prop('checked', true);
        $("#exportoexcel").css("display", "block");
        $("#exporttopdf").css("display", "none");
        $('#divlevel4data').css("display", "block");
        $('#divlevel4chart').css("display", "none");
        $('#divL1Viewtag').css("display", "none");
    }
}

function onLevel3Click(e) {
    EnableDisableChartView(true);
    $('#radioL1Detail').css("display", "none");
    $('#inputL1Detail').css("display", "none");
    $('input:radio[id*="radioL1Graph"]').prop('checked', true);
    var data = this.dataItem(this.select());
    if (data != null) {
        EnableDisableChartView(true);

        LevelIdentifier = 4;
        $('#divtoplevel4').css("display", "block");
        $('#divtoplevel3').css("display", "none");

        $('#divlevel4data').css("display", "block");
        Level4Load(e.dataItem.StandardID, e.dataItem.Label);
        $('input:radio[id*="radioL1Data"]').prop('checked', true);
        $("#exportoexcel").css("display", "block");
        $("#exporttopdf").css("display", "none");
        $("#exportoexcel").css("display", "none");
        $("#exporttopdf").css("display", "block");
    }
}

function Level3detailsourcecall() {
    var ChartSearch = SetSearchCriteria(true);
    ChartSearch.ProgramIDs = SelectedProgramID;
    ChartSearch.ProgramNames = SelectedProgramName;
    if (groupbyChapter) {
        ChartSearch.SelectedChapterIDs = SelectedChapterID;
        ChartSearch.SelectedChapterNames = SelectedChapterName;
    }

    DisplayLevelParameters(ChartSearch);

    return new kendo.data.DataSource({
        transport: {
            read: {
                url: "/Corporate/PriorityTjcRFI/RFIEPLevelDetails_Data",
                type: "post",
                dataType: "json",
                data: { search: ChartSearch, LevelIdentifier: 3 }
            }
        },
        pageSize: 20,
        columns: [
                   { field: "HCO_ID", width: 70, title: "HCO ID" },
                   { field: "Program", width: 75, title: "Program" },
                   { field: "State", width: 45, title: "State" },
                   { field: "HospitalName", width: 150, title: "Hospital Name" },
                   { field: "Chapter", width: 150, title: "Chapter" },
                   { field: "Standard", width: 100, title: "Standard" },
                   { field: "EP", width: 35, title: "EP" },
                   { command: { text: "View Documentation", click: showDocuments }, title: "Documentation", width: "180px" },
                   { field: "TJCScore", width: 150, title: "TJC Score" },
                   { field: "TJCSAFERScoreLikelihood", width: 150, title: "TJC SAFER Score - Likelihood to Harm" },
                   { field: "TJCSAFERScoreScope", width: 150, title: "TJC SAFER Score - Scope" },
                   { field: "TJCScoreDate", width: 150, title: "TJC Score Date" },
                   { field: "PreliminaryScore", width: 150, title: "Preliminary Score" },
                   { field: "PreliminarySAFERScoreLikelihood", width: 150, title: "Preliminary SAFER Score - Likelihood to Harm" },
                   { field: "PreliminarySAFERScoreScope", width: 150, title: "Preliminary SAFER Score - Scope" },
                   { field: "PreliminaryScoreDate", width: 150, title: "Preliminary Score Date" },
                   { field: "FinalScore", width: 150, title: "Final Score" },
                   { field: "FinalSAFERScoreLikelihood", width: 80, title: "Final SAFER Score - Likelihood to Harm" },
                   { field: "FinalSAFERScoreScope", width: 150, title: "Final SAFER Score - Scope" },
                   { field: "FinalScoreDate", width: 80, title: "Final Score Date" }

        ]
    });
}
// Level 3 scripts end

// Level 4 scripts start
function createLevel4Chart() {
    $("#divlevel4chart").kendoChart({

        dataSource: Level4dataSource,
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
            field: "CompliancePercent",
            name: "Compliance",
            color: "#5bb346",
            labels: {
                visible: true,
                position: "center",
                background: "transparent",
                format: "{0:n1}%"

            }
        }, {
            field: "NonCompliancePercent",
            name: "Non Compliance",
            color: "#C61835",
            labels: {
                visible: true,
                position: "center",
                background: "transparent",
                format: "{0:n1}%"

            }
        }
        , {
            field: "NACompliancePercent",
            name: "Not Applicable",
            color: "#939393",
            labels: {
                visible: true,
                position: "center",
                background: "transparent",
                format: "Not Applicable: {0:n1}%"

            }
        }

        ],
        categoryAxis: {
            field: "StandardLabel",

            majorGridLines: {
                visible: true
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
            template: "#= series.name #: #= kendo.format('{0:n1}%',value) #"
        },
        seriesClick: onLevel4SeriesClick
    });


}

var wnd, detailsTemplate;

function createLevel4Data() {
    $("#divlevel4data").kendoGrid({
        dataSource: Level4dataSource,
        //selectable: false,
        sortable: true,
        //cursor: "pointer",
        dataBound: LargeGridResize,
        //height: 450,
        excel: { allPages: true },
        excelExport: ERexcelExport,
        pageable: {
            refresh: true,
            pageSizes: [20, 50, 100]
        },
        columns: [
                    { field: "HCO_ID", width: 70, title: "HCO ID" },
                    { field: "Program", width: 75, title: "Program" },
                    { field: "State", width: 45, title: "State" },
                    { field: "HospitalName", width: 150, title: "Hospital Name" },
                    { field: "Chapter", width: 150, title: "Chapter" },
                    { field: "Standard", width: 100, title: "Standard" },
                    { field: "EP", width: 35, title: "EP" },
                    { command: { text: "View Documentation", click: showDocuments }, title: "Documentation", width: "180px" },
                    { field: "TJCFinding", width: 150, title: "Last TJC Survey Findings", hidden: "true" },
                    { field: "TJCScore", width: 130, title: "TJC Score" },
                    { field: "TJCSAFERScoreLikelihood", width: 235, title: "TJC SAFER Score: Likelihood to Harm" },
                    { field: "TJCSAFERScoreScope", width: 160, title: "TJC SAFER Score: Scope" },
                    { field: "TJCScoreDate", width: 135, title: "TJC Score Date" },
                    { field: "PreliminaryScore", width: 135, title: "Preliminary Score" },
                    { field: "PreliminarySAFERScoreLikelihood", width: 270, title: "Preliminary SAFER Score: Likelihood to Harm" },
                    { field: "PreliminarySAFERScoreScope", width: 200, title: "Preliminary SAFER Score: Scope" },
                    { field: "PreliminaryScoreDate", width: 150, title: "Preliminary Score Date" },
                    { field: "FinalScore", width: 130, title: "Final Score" },
                    { field: "FinalSAFERScoreLikelihood", width: 240, title: "Final SAFER Score: Likelihood to Harm" },
                    { field: "FinalSAFERScoreScope", width: 170, title: "Final SAFER Score: Scope" },
                    { field: "FinalScoreDate", width: 125, title: "Final Score Date" },
                    { field: "OrgFindings", title: "Organization Findings", width: 140, hidden: "true" },
                    { field: "PlanOfAction", width: 130, title: "Plan Of Action", hidden: "true" },
                    { field: "CompliantByDate", title: "POA Compliant By Date", width: 150, hidden: "true" },
                    { field: "SustainmentPlan", title: "Sustainment Plan", width: 130, hidden: "true" },
                    { field: "InternalNotes", title: "Internal Notes", width: 130, hidden: "true" }
        ]

    });


}

function LargeGridResize(e) {
    var gridID = '';
    if (e.sender && e.sender.wrapper && e.sender.wrapper.length > 0)
        gridID = e.sender.wrapper[0].id;

    if (gridID != null && gridID != '') {
        var grid = $("#" + gridID);

        var footer = grid.find(".k-grid-footer");

        if (footer) $(footer).hide();

        //Define Elements Needed
        var header = grid.find(".k-grid-header");

        //Get the Grid Element and Areas Inside It
        var contentArea = grid.find(".k-grid-content");  //This is the content Where Grid is located

        var count = grid.data("kendoGrid").dataSource.data().length;
        //Apply the height for the content area
        if (count > 5) {
            grid.height(350 + header.height());
            contentArea.height(350);
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
        $('#CorpLayOutFooter').attr("style", "top: auto; position: relative;");
    }
}

function showDocuments(e) {
    wnd = $("#divDetail").kendoWindow({
        title: "Documentation",
        modal: true,
        visible: true,
        resizable: false,
        width: 550,
        position: {
            top: 10
        }
    }).data("kendoWindow");
    wnd.title("Documents");
    detailsTemplate = kendo.template($("#DocumentTemplate").html());

    var dataItem = this.dataItem($(e.currentTarget).closest("tr"));
    wnd.content(detailsTemplate(dataItem));
    wnd.center().open();
}

function Level4Load(StandardID, StandardLabel) {
    SelectedStandardID = StandardID;
    SelectedStandardName = StandardLabel;


    Level4dataSource = Level4datasourcecall();
    Level4dataSource.sync();
    // createLevel4Chart();
    createLevel4Data();
    // LargeGridResize();
}

var Level4dataSource = "";
function Level4datasourcecall() {
    var ChartSearch = SetSearchCriteria(true);

    ChartSearch.ProgramIDs = SelectedProgramID;
    ChartSearch.ProgramNames = SelectedProgramName;
    ChartSearch.SelectedChapterIDs = SelectedChapterID;
    ChartSearch.SelectedChapterNames = SelectedChapterName;
    ChartSearch.SelectedStandardIDs = SelectedStandardID;
    ChartSearch.SelectedStandardNames = SelectedStandardName;

    DisplayLevelParameters(ChartSearch);

    return new kendo.data.DataSource({
        transport: {
            read: {
                url: "/Corporate/PriorityTjcRFI/RFIReport_Data",
                type: "post",
                dataType: "json",
                data: { search: ChartSearch, LevelIdentifier: 4 }
            }
        },
        pageSize: 20,
        requestEnd: function (e) {
            if (e.response != null) {
                setChartHeight("divlevel4chart", e.response.length);
            }
            EnableDisableChartView(false);
        },
        aggregate: [{ field: "HCO_ID", aggregate: "count" },
                    { field: "ProgramSettingName", aggregate: "count" },
                    { field: "Region_Name", aggregate: "count" },
                    { field: "Site_State", aggregate: "count" },
                    { field: "Hospital_Name", aggregate: "count" },
                    { field: "ChapterText", aggregate: "count" },
                    { field: "StandardLabel", aggregate: "count" },
                    { field: "EPLabel", aggregate: "count" },
                    { field: "criticalitytier", aggregate: "count" },
                    { field: "criticality_level", aggregate: "count" },
                    { field: "FSARequired", aggregate: "count" },
                    { field: "scorecategory", aggregate: "count" },
                    { field: "hasmos", aggregate: "count" },
                    { field: "TJCFinding", aggregate: "count" },
                    { field: "TJCScore_Insufficient", aggregate: "count" },
                    //{ field: "TJCFindingPlain", aggregate: "count" },
                    { field: "TJCSurveyDate", aggregate: "count" },
                    { field: "CorpScore", aggregate: "count" },
                    { field: "CorpScore_Insufficient", aggregate: "count" },
                    { field: "Mock_Survey_Finding", aggregate: "count" },
                    { field: "MockSurveyDate", aggregate: "count" },
                    { field: "MSTeamLead", aggregate: "count" },
                    { field: "POA", aggregate: "count" },
                    { field: "POADate", aggregate: "count" },
                    { field: "MOS", aggregate: "count" },
                    { field: "MOSDate", aggregate: "count" },
                    { field: "TJC_Corp_Insufficient", aggregate: "count" },
                    { field: "MSStatus", aggregate: "count" }

        ]
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
            ExportReportName = "Priority Findings RFI Report - Findings by Program";
            var levelkendogrid = $("#divleveldata");
            if (levelkendogrid.data("kendoGrid")) {
                dataSource = $("#divleveldata").data("kendoGrid").dataSource;
            }
            break;
        case 2:
            if (groupbyChapter) {
                ExportReportName = "Priority Findings RFI Report - Findings by Chapter";
                var levelkendogrid = $("#divlevel2data");
                if (levelkendogrid.data("kendoGrid")) {
                    dataSource = $("#divlevel2data").data("kendoGrid").dataSource;
                }

            }
            else {
                ExportReportName = "Priority Findings RFI Report - Findings by Standard";
                var levelkendogrid = $("#divlevel3data");
                if (levelkendogrid.data("kendoGrid")) {
                    dataSource = $("#divlevel3data").data("kendoGrid").dataSource;
                }
            }

            break;
        case 3:
            ExportReportName = "Priority Findings RFI Report - Findings by Standard";
            var levelkendogrid = $("#divlevel3data");
            if (levelkendogrid.data("kendoGrid")) {
                dataSource = $("#divlevel3data").data("kendoGrid").dataSource;
            }

            break;
        case 4:
            ExportReportName = "Priority Findings RFI Report - Finding by EP";
            var levelkendogrid = $("#divlevel4data");
            if (levelkendogrid.data("kendoGrid")) {
                dataSource = $("#divlevel4data").data("kendoGrid").dataSource;
            }
            break;
            //case 5:
            //    ExportReportName = "Corporate Report - Compliance by EP";
            //    var levelkendogrid = $("#divlevel5data");
            //    if (levelkendogrid.data("kendoGrid")) {
            //        dataSource = $("#divlevel5data").data("kendoGrid").dataSource;
            //    }
            //    break;

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
                url: "/Corporate/PriorityTjcRFI/CreateERSessionCriteria",
                contentType: "application/json",
                data: JSON.stringify({ ERsearch: SetParameters() })

            }).done(function (e) {
                $(function () {
                    $.post('/Corporate/PriorityTjcRFI/SendERPDFEmail',
                      { ExcelGridName: ExportReportName, email: $.parseJSON(sessionStorage.getItem('searchsetemailsession')), ERReportName: "PriorityTjcRFIFinding", SortBy: dataSortBy, SortOrder: dataSortOrder }, function (data) {
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
            url: "/Corporate/PriorityTjcRFI/CreateERSessionCriteria",
            contentType: "application/json",
            data: JSON.stringify({ ERsearch: SetParameters() })

        }).done(function (e) {


            $(function () {
                $.post(
                    '/Corporate/PriorityTjcRFI/createErPdf',
                  { ExcelGridName: ExportReportName, ERReportName: "CorporateFinding", SortBy: dataSortBy, SortOrder: dataSortOrder }, function (data) {

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
function ERExcelExportByLevel() {
    switch (LevelIdentifier) {
        case 1:
            ExportReportName = "Priority Findings RFI Report - Findings by Program";
            $("#divleveldata").getKendoGrid().saveAsExcel();
            break;
        case 2:
            if (groupbyChapter) {
                ExportReportName = "Priority Findings RFI Report - Findings by Chapter";
                if ($('#radioL1Data').is(':checked'))
                { $("#divlevel2data").getKendoGrid().saveAsExcel(); }
                else
                {
                    $("#divlevel2details").getKendoGrid().showColumn("TJCFinding");
                    $("#divlevel2details").getKendoGrid().showColumn("OrgFindings");
                    $("#divlevel2details").getKendoGrid().showColumn("PlanOfAction");
                    $("#divlevel2details").getKendoGrid().showColumn("CompliantByDate");
                    $("#divlevel2details").getKendoGrid().showColumn("SustainmentPlan");
                    $("#divlevel2details").getKendoGrid().showColumn("InternalNotes");

                    $("#divlevel2details").getKendoGrid().saveAsExcel();

                    $("#divlevel2details").getKendoGrid().hideColumn("TJCFinding");
                    $("#divlevel2details").getKendoGrid().hideColumn("OrgFindings");
                    $("#divlevel2details").getKendoGrid().hideColumn("PlanOfAction");
                    $("#divlevel2details").getKendoGrid().hideColumn("CompliantByDate");
                    $("#divlevel2details").getKendoGrid().hideColumn("SustainmentPlan");
                    $("#divlevel2details").getKendoGrid().hideColumn("InternalNotes");
                }
            }
            else {
                ExportReportName = "Priority Findings RFI Report - Findings by Standard";
                if ($('#radioL1Data').is(':checked'))
                { $("#divlevel3data").getKendoGrid().saveAsExcel(); }
                else
                {
                    $("#divlevel4details").getKendoGrid().showColumn("TJCFinding");
                    $("#divlevel4details").getKendoGrid().showColumn("OrgFindings");
                    $("#divlevel4details").getKendoGrid().showColumn("PlanOfAction");
                    $("#divlevel4details").getKendoGrid().showColumn("CompliantByDate");
                    $("#divlevel4details").getKendoGrid().showColumn("SustainmentPlan");
                    $("#divlevel4details").getKendoGrid().showColumn("InternalNotes");

                    $("#divlevel4details").getKendoGrid().saveAsExcel();

                    $("#divlevel4details").getKendoGrid().hideColumn("TJCFinding");
                    $("#divlevel4details").getKendoGrid().hideColumn("OrgFindings");
                    $("#divlevel4details").getKendoGrid().hideColumn("PlanOfAction");
                    $("#divlevel4details").getKendoGrid().hideColumn("CompliantByDate");
                    $("#divlevel4details").getKendoGrid().hideColumn("SustainmentPlan");
                    $("#divlevel4details").getKendoGrid().hideColumn("InternalNotes");
                }
            }

            break;
        case 3:
            if (groupbyChapter) {
                ExportReportName = "Priority Findings RFI Report - Findings by Standard";
                if ($('#radioL1Data').is(':checked'))
                { $("#divlevel3data").getKendoGrid().saveAsExcel(); }
                else
                {
                    $("#divlevel4details").getKendoGrid().showColumn("TJCFinding");
                    $("#divlevel4details").getKendoGrid().showColumn("OrgFindings");
                    $("#divlevel4details").getKendoGrid().showColumn("PlanOfAction");
                    $("#divlevel4details").getKendoGrid().showColumn("CompliantByDate");
                    $("#divlevel4details").getKendoGrid().showColumn("SustainmentPlan");
                    $("#divlevel4details").getKendoGrid().showColumn("InternalNotes");

                    $("#divlevel4details").getKendoGrid().saveAsExcel();

                    $("#divlevel4details").getKendoGrid().hideColumn("TJCFinding");
                    $("#divlevel4details").getKendoGrid().hideColumn("OrgFindings");
                    $("#divlevel4details").getKendoGrid().hideColumn("PlanOfAction");
                    $("#divlevel4details").getKendoGrid().hideColumn("CompliantByDate");
                    $("#divlevel4details").getKendoGrid().hideColumn("SustainmentPlan");
                    $("#divlevel4details").getKendoGrid().hideColumn("InternalNotes");
                }
            }


            break;
        case 4:
            ExportReportName = "Priority Findings RFI Report - Finding by EP";
            $("#divlevel4data").getKendoGrid().showColumn("TJCFinding");
            $("#divlevel4data").getKendoGrid().showColumn("OrgFindings");
            $("#divlevel4data").getKendoGrid().showColumn("PlanOfAction");
            $("#divlevel4data").getKendoGrid().showColumn("CompliantByDate");
            $("#divlevel4data").getKendoGrid().showColumn("SustainmentPlan");
            $("#divlevel4data").getKendoGrid().showColumn("InternalNotes");

            $("#divlevel4data").getKendoGrid().saveAsExcel();

            $("#divlevel4data").getKendoGrid().hideColumn("TJCFinding");
            $("#divlevel4data").getKendoGrid().hideColumn("OrgFindings");
            $("#divlevel4data").getKendoGrid().hideColumn("PlanOfAction");
            $("#divlevel4data").getKendoGrid().hideColumn("CompliantByDate");
            $("#divlevel4data").getKendoGrid().hideColumn("SustainmentPlan");
            $("#divlevel4data").getKendoGrid().hideColumn("InternalNotes");
            break;
        case 5:
            ExportReportName = "Corporate Report - Compliance by EP";
            $("#divlevel5data").getKendoGrid().saveAsExcel();
            break;
        case 6:
            ExportReportName = "Corporate Report - EP Details";
            $("#divlevel6data").getKendoGrid().saveAsExcel();
            break;

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

                if (cell.value && typeof (cell.value) === "string" && cell.value.length > 25) {
                    // Use jQuery.fn.text to remove the HTML and get only the text                
                    cell.value = stripHTML(cell.value);
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

    ChartSearch.ReportTitle = $('#txtScheduledReportName').val();
    ChartSearch.SelectedSiteHCOIDs = $("#SiteSelector_SelectedHCOIDs").val();
    ChartSearch.LevelIdentifier = LevelIdentifier;
    if (groupbyChapter)
        ChartSearch.ReportType = "ByChapter";
    else
        ChartSearch.ReportType = "ByStandard";

    switch (LevelIdentifier) {
        case 1:
            ChartSearch.LevelIdentifier = 1;
            break;
        case 2:
            if (groupbyChapter) {
                ChartSearch.ProgramNames = SelectedProgramName;
                ChartSearch.ProgramIDs = SelectedProgramID;
                ChartSearch.LevelIdentifier = 2;
            }
            else {
                ChartSearch.ProgramNames = SelectedProgramName;
                ChartSearch.ProgramIDs = SelectedProgramID;
                ChartSearch.LevelIdentifier = 3;
            }
            break;
        case 3:
            if (groupbyChapter) {
                ChartSearch.ProgramNames = SelectedProgramName;
                ChartSearch.ProgramIDs = SelectedProgramID;
                ChartSearch.SelectedChapterNames = SelectedChapterName;
                ChartSearch.SelectedChapterIDs = SelectedChapterID;
            }
            else {
                ChartSearch.ProgramNames = SelectedProgramName;
                ChartSearch.ProgramIDs = SelectedProgramID;

                ChartSearch.SelectedChapterNames = SelectedChapterName;
                ChartSearch.SelectedChapteIDs = SelectedChapterID;
                ChartSearch.SelectedStandardIDs = SelectedStandardID;
                ChartSearch.SelectedStandardNames = SelectedStandardName;
                ChartSearch.LevelIdentifier = 4;
            }

            break;
        case 4:
            if (groupbyChapter) {
                ChartSearch.ProgramNames = SelectedProgramName;
                ChartSearch.ProgramIDs = SelectedProgramID;
                ChartSearch.SelectedChapterNames = SelectedChapterName;
                ChartSearch.SelectedChapterID = SelectedChapterID;
                ChartSearch.SelectedStandardIDs = SelectedStandardID;
                ChartSearch.SelectedStandardNames = SelectedStandardName;
                ChartSearch.LevelIdentifier = 4;
            }
            else {

                ChartSearch.ProgramNames = SelectedProgramName;
                ChartSearch.ProgramIDs = SelectedProgramID;

                ChartSearch.SelectedChapterNames = SelectedChapterName;
                ChartSearch.SelectedChapterID = SelectedChapterID;
                ChartSearch.SelectedStandardIDs = SelectedStandardID;
                ChartSearch.SelectedStandardNames = SelectedStandardName;
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
            //{
            //    cells: [
            //    { value: "EP" },
            //    { value: ChartSearch.StandardLabelAndEPLabels }
            //    ]
            //},

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
                { value: groupbyChapter == true ? "Chapter" : "Standard" }
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
                 { value: "Display RFIs" },
                 { value: ChartSearch.IncludeRFI == true ? "True" : "False" }
                 ]
             },
              {
                  cells: [
                  { value: "Display Preliminary Score" },
                  { value: ChartSearch.IncludePre == true ? "True" : "False" }
                  ]
              },
               {
                   cells: [
                   { value: "Display Final Score" },
                   { value: ChartSearch.IncludeFin == true ? "True" : "False" }
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
            //$('#emailerror_msg').removeClass("alert-info").addClass("alert-danger");
            //$('#emailerror_msg').css("display", "block");
            //$('#email_msg').html("No data found matching your Criteria. Change Criteria and try again.");
            ShowEmailStatus("No data found matching your Criteria. Change Criteria and try again.", 'failure');
        }
    }
}
//Email Functionality end

//Save the selected parameters
function SaveToMyReports(deleteReport) {
    var searchCriteria = GetParameterValuesForTJC();

    var parameterSet = [
        { SelectedSites: ERSites.getSelectedSites() },
        { ReportTitle: searchCriteria.ReportTitle },
        { GrpBy: searchCriteria.GrpBy },
        { ProgramServices: searchCriteria.ProgramIDs },
        { ChapterIDs: searchCriteria.SelectedChapterIDs },
        { StandardIDs: searchCriteria.SelectedStandardIDs },
        { IncludeRFICheckBox: searchCriteria.IncludeRFI },
        { IncludeFSAcheckbox: searchCriteria.IncludeFSA },
        { IncludePreliminaryScoreCheckbox: searchCriteria.IncludePre },
        { IncludeFinalScoreCheckbox: searchCriteria.IncludeFin },
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
//Sets the saved parameters for each control
function SetSavedParameters(params) {
    var selectedSites = '';

    $('#txtScheduledReportName').val(params.ReportNameOverride);

    var query = $(params.ReportSiteMaps).each(function () {
        selectedSites += $(this)[0].SiteID + ',';
    });
    selectedSites = selectedSites.replace(/\,$/, ''); //Remove the last character if its a comma

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

    $('input[name=grpBy][value=' + (getParamValue(params.ReportParameters, "GrpBy")) + ']').prop('checked', true);


    CheckboxChecked(getParamValue(params.ReportParameters, "IncludeFSAcheckbox"), 'FSAGraphCheckbox');
    CheckboxChecked(getParamValue(params.ReportParameters, "IncludeRFICheckBox"), 'RFIGraphCheckbox');
    CheckboxChecked(getParamValue(params.ReportParameters, "IncludePreliminaryScoreCheckbox"), 'PreGraphCheckbox');
    CheckboxChecked(getParamValue(params.ReportParameters, "IncludeFinalScoreCheckbox"), 'FinGraphCheckbox');
    SetSavedObservationDate(params.ReportParameters);

    SetERRecurrenceParameters(params);

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

function OnPrintDocumentation() {

    var title = document.title;
    document.title = 'Priority Joint Commission RFI Report - Documentation';
    window.print();
    document.title = title;

}