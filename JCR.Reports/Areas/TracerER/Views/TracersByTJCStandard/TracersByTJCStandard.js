loadparameters = "TracersByTJCStandard";
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
var SelectedStandardTextID = "";
var SelectedEPTextID = "";
var SelectedEPName = "";
var SelectedHCOName = "";
var SelectedSiteID = 0;
var ResetFilters = $("#GetResetLink").val();
var groupbySite = true;
var ExportReportName = "";
var OrgRanking3Name = "";
var OrgRanking2Name = "";
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
    $('#TracersStandard :selected').each(function (i, selected) {
        SelectedStandardIDs[i] = $(selected).val();
        SelectedStandardNames[i] = $(selected).text().trim();
    });
    if (SelectedStandardIDs.length <= 0) {
        SelectedStandardIDs.push(defaultValue);
        SelectedStandardNames.push(defaultText);
    }


    var EPTextIDs = [];
    var StandardLabelAndEPLabels = [];
    $('#TracersEP :selected').each(function (i, selected) {
        EPTextIDs[i] = $(selected).val();
        StandardLabelAndEPLabels[i] = $(selected).text();
    });
    if (EPTextIDs.length <= 0) {
        EPTextIDs.push(defaultValue);
        StandardLabelAndEPLabels.push(defaultText);
    }


    var searchset =
{
    SelectedSiteIDs: ERSites.getSelectedSites(),// $("#SiteSelector_SelectedSiteIDs").val(),
    ProgramIDs: ProgramIDs.toString(),
    ProgramNames: ProgramNames.toString().replace(/,/g, ", "),
    SelectedChapterIDs: SelectedChapterIDs.toString(),
    SelectedChapterNames: SelectedChapterNames.toString(),
    shortChaptersShow: shortChaptersShow.toString().replace(/,/g, ", "),
    SelectedStandardIDs: SelectedStandardIDs.toString(),
    SelectedStandardNames: SelectedStandardNames.toString().replace(/,/g, ", "),
    EPTextIDs: EPTextIDs.toString(),
    StandardLabelAndEPLabels: StandardLabelAndEPLabels.toString().replace(/,/g, ", "),
    IncludeFSA: $('#IncludeFSAcheckbox').is(':checked'),
    StartDate: kendo.toString($("#ObsstartDate").data("kendoDatePicker").value(), "MM/dd/yyyy"),
    EndDate: kendo.toString($("#ObsEndDate").data("kendoDatePicker").value(), "MM/dd/yyyy"),
    ReportType: $('input[name=ERGroupBYProgramLevel]:checked').val(),
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
            return SearchSetFilterData(GenfromSavedFilters, GetParameterValues());
        }
    }
    else {
        return SearchSetFilterData(GenfromSavedFilters, GetParameterValues());
    }

}

//Withemail parameter is optional 
function GenerateReport(GenfromSavedFilters, Withemail) {

    ShowLoader(true);

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
    SelectedStandardTextID = "";
    SelectedEPName = "";
    SelectedEPTextID = "";
    SelectedHCOName = "";
    SelectedSiteID = 0;
    ExportReportName = "";
    OrgRanking3Name = "";
    OrgRanking2Name = "";
    // groupbySite = true;

    $.ajax({
        async: false,
        url: '/TracerER/TracersByTJCStandard/LoadCompliancebyProgramL1',
        dataType: "html",
        success: function (data) {
            $('#loadChartView').html(data);
            //   EnableDisableChartView(true);
            //blockElement("divL1tag");
            Level1Load();

            HideLoader(true);
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
    $('input:radio[id*="BySite"]').prop('checked', true);
    var dateRangedeselect = $('input[name=DateRange]:checked').val();
    $('input:radio[id*=' + dateRangedeselect + ']').prop('checked', false);
    ResetStandardsMultiSelect();
    ResetEPsMultiSelect();

}

$(document).ready(function () {
    // Reset these additional parameters
    $("#resetfiltersbutton").click(function () {
        SetDefaults();
    });

    if ($.isNumeric($('#lblReportScheduleID').html())) {
        GetSavedParameters($('#lblReportScheduleID').html());
    }

    $('input:radio[id*="BySite"]').prop('checked', true);

    //Show Accreditation programs list in the popover
    AccreditationProgramsPopover();
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
            if (groupbySite) {
                var checkLevel2Dataexists = $("#divlevel2data");
                if (!checkLevel2Dataexists.data("kendoGrid")) {
                    createLevel2Data();
                }

                $('#divlevel2data').css("display", "block");
                $('#divlevel2chart').css("display", "none");
            }
            else {
                var checkLevel3Dataexists = $("#divlevel3data");
                if (!checkLevel3Dataexists.data("kendoGrid")) {
                    createLevel3Data();
                }

                $('#divlevel3data').css("display", "block");
                $('#divlevel3chart').css("display", "none");
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
            }
            else {
                var checkLevel2Dataexists = $("#divlevel2data");
                if (!checkLevel2Dataexists.data("kendoGrid")) {
                    createLevel2Data();
                }

                $('#divlevel2data').css("display", "block");
                $('#divlevel2chart').css("display", "none");
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
            if (groupbySite) {
                $('#divlevel2chart').css("display", "block");
                $('#divlevel2data').css("display", "none");
            }
            else {
                $('#divlevel3chart').css("display", "block");
                $('#divlevel3data').css("display", "none");
            }

            break;
        case 3:
            if (groupbySite) {
                $('#divlevel3chart').css("display", "block");
                $('#divlevel3data').css("display", "none");
            }
            else {
                $('#divlevel2chart').css("display", "block");
                $('#divlevel2data').css("display", "none");
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

    $("#previousLevelButton").removeClass('k-button k-state-focused');
    switch (LevelIdentifier) {
        case 1:
            $("#divpreviouslevel").css("display", "none");
            $('#divtoplevel1').css("display", "block");
            $('#divlevelchart').css("display", "block");
            $('#divleveldata').css("display", "none");
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
            }

            break;
        case 3:
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
            var levelkendogrid = $("#divlevel5data");
            if (levelkendogrid.data("kendoGrid")) {

                $("#divlevel5data").data("kendoGrid").destroy();
                $("#divlevel5data").empty();
            }
            break;
        case 5:

            //  $("input[type=radio]").attr('disabled', false);
            $('input:radio[name*="L1selectView"]').attr('disabled', false);
            $('#divtoplevel5').css("display", "block");
            $('#divtoplevel6').css("display", "none");
            $('#divlevel5chart').css("display", "block");
            $('#divlevel5data').css("display", "none");
            //  $("#divlevel6data").data("kendoGrid").destroy();
            //  $("#divlevel6data").empty();
            var levelkendogrid = $("#divlevel6data");
            if (levelkendogrid.data("kendoGrid")) {

                $("#divlevel6data").data("kendoGrid").destroy();
                $("#divlevel6data").empty();
            }
            //  $("#exportoexcel").css("display", "none");
            //   $("#exporttopdf").css("display", "block");
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
    //  
    //  var shortChaptersShow = ChartSearch.SelectedChapterNames === "All" ? "All, " : ChartSearch.SelectedChapterNames + ",";
    //  shortChaptersShow = shortChaptersShow.replace(/(\-)(.*?)(\,)/gi, ", ").slice(0, -2);

    switch (LevelIdentifier) {
        case 1:
            $("#spanSelParameters1").html("Overall Compliance by Program");

            $("#spanSelParameters2").html("Program: " + ChartSearch.ProgramNames);
            if (groupbySite) {
                $("#spanSelParameters3").html("HCOID: " + $("#SiteSelector_SelectedHCOIDs").val());
                $("#spanSelParameters4").html("Chapter: " + ChartSearch.shortChaptersShow);
            }
            else {
                $("#spanSelParameters4").html("HCOID: " + $("#SiteSelector_SelectedHCOIDs").val());
                $("#spanSelParameters3").html("Chapter: " + ChartSearch.shortChaptersShow);
            }

            if (ChartSearch.EPTextIDs === "-1")
            { $("#spanSelParameters5").html("Standard: " + ChartSearch.SelectedStandardNames); }
            else
            { $("#spanSelParameters5").html("Standard: " + ChartSearch.StandardLabelAndEPLabels); }


            break;
        case 2:
            if (groupbySite) {

                $("#spanSelParameters1").html(SelectedProgramName + " - Compliance by Site");
                $("#spanSelParameters2").html("HCOID: " + $("#SiteSelector_SelectedHCOIDs").val());
                $("#spanSelParameters3").html("Chapter: " + ChartSearch.shortChaptersShow);

                if (ChartSearch.EPTextIDs === "-1")
                { $("#spanSelParameters4").html("Standard: " + ChartSearch.SelectedStandardNames); }
                else
                { $("#spanSelParameters4").html("Standard: " + ChartSearch.StandardLabelAndEPLabels); }
            }
            else {
                $("#spanSelParameters1").html(SelectedProgramName + " - Compliance by Chapter");
                $("#spanSelParameters2").html("Chapter: " + ChartSearch.shortChaptersShow);
                $("#spanSelParameters3").html("HCOID: " + $("#SiteSelector_SelectedHCOIDs").val());
                if (ChartSearch.EPTextIDs === "-1")
                { $("#spanSelParameters4").html("Standard: " + ChartSearch.SelectedStandardNames); }
                else
                { $("#spanSelParameters4").html("Standard: " + ChartSearch.StandardLabelAndEPLabels); }
            }

            $("#spanSelParameters5").html("");


            break;
        case 3:
            if (groupbySite) {
                $("#spanSelParameters1").html(SelectedHCOName + " - Compliance by Chapter");
                $("#spanSelParameters2").html("Program: " + SelectedProgramName);
                $("#spanSelParameters3").html("Chapter: " + ChartSearch.shortChaptersShow);
                if (ChartSearch.EPTextIDs === "-1")
                { $("#spanSelParameters4").html("Standard: " + ChartSearch.SelectedStandardNames); }
                else
                { $("#spanSelParameters4").html("Standard: " + ChartSearch.StandardLabelAndEPLabels); }
            }
            else {
                $("#spanSelParameters1").html(SelectedChapterName + " - Compliance by Site");
                $("#spanSelParameters2").html("Program: " + SelectedProgramName);
                $("#spanSelParameters3").html("HCOID: " + $("#SiteSelector_SelectedHCOIDs").val());
                if (ChartSearch.EPTextIDs === "-1")
                { $("#spanSelParameters4").html("Standard: " + ChartSearch.SelectedStandardNames); }
                else
                { $("#spanSelParameters4").html("Standard: " + ChartSearch.StandardLabelAndEPLabels); }
            }
            $("#spanSelParameters5").html("");
            break;
        case 4:
            if (groupbySite) {
                $("#spanSelParameters1").html(SelectedChapterName + " - Compliance by Standard");
                $("#spanSelParameters2").html("Program: " + SelectedProgramName);
                $("#spanSelParameters3").html("Site: " + SelectedHCOName);
            }
            else {
                $("#spanSelParameters1").html(SelectedHCOName + " - Compliance by Standard");
                $("#spanSelParameters2").html("Program: " + SelectedProgramName);
                $("#spanSelParameters3").html("Chapter: " + SelectedChapterName);
            }

            if (ChartSearch.EPTextIDs === "-1")
            { $("#spanSelParameters4").html("Standard: " + ChartSearch.SelectedStandardNames); }
            else
            { $("#spanSelParameters4").html("Standard: " + ChartSearch.StandardLabelAndEPLabels); }
            //  $("#spanSelParameters4").html("");
            $("#spanSelParameters5").html("");
            break;
        case 5:
            $("#spanSelParameters1").html(SelectedStandardName + " - Compliance by EP");
            //   $("#spanSelParameters3").html("EP: " + ChartSearch.StandardLabelAndEPLabels);
            $("#spanSelParameters2").html("Program: " + SelectedProgramName);
            if (groupbySite) {
                $("#spanSelParameters3").html("Site: " + SelectedHCOName);
                $("#spanSelParameters4").html("Chapter: " + SelectedChapterName);
            }
            else {
                $("#spanSelParameters4").html("Site: " + SelectedHCOName);
                $("#spanSelParameters3").html("Chapter: " + SelectedChapterName);
            }
            $("#spanSelParameters5").html("EP: " + ChartSearch.StandardLabelAndEPLabels);

            break;
        case 6:
            $("#spanSelParameters1").html(SelectedStandardName + " - " + ChartSearch.StandardLabelAndEPLabels + " Details");
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
    if (groupbySite) {
        groupatparameter = "Group By at Program Level: By Site"
    }
    else {
        groupatparameter = "Group By at Program Level: By Chapter"
    }
    if (ChartSearch.IncludeFSA) {
        //   $("#spanSelParameters7").css("display", "block");
        $("#spanSelParameters7").html(groupatparameter + ", Only FSA EPs");
    }
    else {
        $("#spanSelParameters7").html(groupatparameter);
        //$("#spanSelParameters7").css("display", "none");
    }

    if ($("#hdnIsCMSProgram").val() === "True") {
        var currentMarkup = $("#spanSelParameters7").html() + "<br>TJC Tracers";
        $("#spanSelParameters7").html(currentMarkup);
    }

    ScrollToTopCall();
}

//Level 1 scripts start
function createLevel1Chart() {
    $("#divlevelchart").kendoChart({
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
            field: "ProgramName",
            value: "ProgramID",
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
            template: "#= series.name #: #= kendo.format('{0:n1}%',value) #"

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
        selectable: true,
        sortable: true,
        columns: [

             { field: "ProgramID", hidden: "true" }, { field: "ProgramName", width: 175, title: "Program", footerTemplate: "Total:" },
             { field: "ProgramCode", hidden: "true" },
             { field: "TracerCount", width: 150, title: "Tracer Count", footerTemplate: "#=sum#" },
             { field: "ObservationCount", width: 150, title: "Total Completed Observations", footerTemplate: "#=sum#" },
             { field: "QuestionCount", width: 150, title: "Question Count", footerTemplate: "#=sum#" },
             { field: "NACount", width: 150, title: "Total N/A", footerTemplate: "#=sum#" },
             { field: "Numerator", width: 150, title: "Total Numerator", footerTemplate: "#=sum#" },
             { field: "Denominator", width: 150, title: "Total Denominator", footerTemplate: "#=sum#" },
             {
                 field: "CompliancePercent", width: 150, title: "Overall Compliance %"
                 , format: "{0:0.0}"
            , footerTemplate: "# if(data.Denominator.sum == 0) " +
                                           "{#  #= kendo.toString(0, '0.0') #%  #} " +
                                           "else {# #= kendo.toString((data.Numerator.sum/data.Denominator.sum)*100, '0.0') #% #}#"
             }, { field: "NonCompliancePercent", hidden: "true" }]
    });

}
//dataSource.aggregates().stock.sum

// code to call first level 
function Level1Load() {

    Level1dataSource = datasourcecall();
    Level1dataSource.sync();

    createLevel1Chart();
    $('#divlevelchart').css("display", "block");
}

var Level1dataSource = "";
function datasourcecall() {

    var ChartSearch = SetSearchCriteria(false);
    DisplayLevelParameters(ChartSearch);
    // setChartHeight("divlevelchart", 2);
    hasExcelData = true;

    return new kendo.data.DataSource({
        transport: {
            read: {
                // the remote service url
                url: "/TracerER/TracersByTJCStandard/TracersByTJCStandard_Data",

                // the request type
                type: "post",

                // the data type of the returned result
                dataType: "json",

                // additional custom parameters sent to the remote service
                data: { search: ChartSearch, LevelIdentifier: 1 }
            }
        },
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
                }
                else {
                    setChartHeight("divlevelchart", e.response.length);
                    closeSlide("btnSearchCriteria", "slideSearch");
                }
            }
            // EnableDisableChartView(false);
            //unBlockElement("divL1tag");
        },
        aggregate: [{ field: "ProgramName", aggregate: "count" },
                                  { field: "TracerCount", aggregate: "sum" },
                                  { field: "ObservationCount", aggregate: "sum" },
                                  { field: "QuestionCount", aggregate: "sum" },
                                  { field: "NACount", aggregate: "sum" },
                                  { field: "Numerator", aggregate: "sum" },
                                  { field: "Denominator", aggregate: "sum" },
                                  { field: "CompliancePercent", aggregate: "average" }]
    });
}

function onLevel1SeriesClick(e) {
    EnableDisableChartView(true);
    LevelIdentifier = 2;

    $('#divtoplevel1').css("display", "none");

    if (groupbySite) {

        $('#divtoplevel2').css("display", "block");
        $('#divlevel2chart').css("display", "block");
        $('#divlevel2data').css("display", "none");
        Level2Load(e.dataItem.ProgramID, e.dataItem.ProgramName);

    }
    else {


        $('#divtoplevel3').css("display", "block");
        $('#divlevel3chart').css("display", "block");
        $('#divlevel3data').css("display", "none");
        Level3Load("", "", e.dataItem.ProgramID, e.dataItem.ProgramName);
    }

    $("#divpreviouslevel").css("display", "block");
}
function onLevel1Click(e) {
    EnableDisableChartView(true);
    $('input:radio[id*="radioL1Graph"]').prop('checked', true);
    LevelIdentifier = 2;
    $('#divtoplevel1').css("display", "none");
    var data = this.dataItem(this.select());

    if (data != null) {
        if (groupbySite) {
            $('#divtoplevel2').css("display", "block");
            $('#divlevel2chart').css("display", "block");
            $('#divlevel2data').css("display", "none");
            Level2Load(data.ProgramID, data.ProgramName);
        }
        else {
            $('#divtoplevel3').css("display", "block");
            $('#divlevel3chart').css("display", "block");
            $('#divlevel3data').css("display", "none");
            Level3Load("", "", data.ProgramID, data.ProgramName);
        }

        $("#divpreviouslevel").css("display", "block");

        $("#exportoexcel").css("display", "none");
        $("#exporttopdf").css("display", "block");
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
    e.sender.options.series[2].labels.visible = function (point) {
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
        $('#divtoplevel2').css("display", "none");
        $('#divtoplevel3').css("display", "block");
        $('#divlevel3chart').css("display", "block");
        $('#divlevel3data').css("display", "none");
        Level3Load(e.dataItem.SiteID, e.dataItem.SiteFullName);

    }
    else {
        // to do 4th level


        LevelIdentifier = 4;
        $('#divtoplevel2').css("display", "none");
        $('#divtoplevel4').css("display", "block");
        $('#divlevel4chart').css("display", "block");
        $('#divlevel4data').css("display", "none");
        Level4Load(e.dataItem.SiteID, e.dataItem.SiteFullName, "", "");
    }
}
function onLevel2Click(e) {
    EnableDisableChartView(true);
    $('input:radio[id*="radioL1Graph"]').prop('checked', true);

    var data = this.dataItem(this.select());

    if (data != null) {
        if (groupbySite) {
            LevelIdentifier = 3;
            $('#divtoplevel2').css("display", "none");
            $('#divtoplevel3').css("display", "block");
            $('#divlevel3chart').css("display", "block");
            $('#divlevel3data').css("display", "none");
            Level3Load(data.SiteID, data.SiteFullName);
        }
        else {
            // to do 4th level
            LevelIdentifier = 4;
            $('#divtoplevel2').css("display", "none");
            $('#divtoplevel4').css("display", "block");
            $('#divlevel4chart').css("display", "block");
            $('#divlevel4data').css("display", "none");
            Level4Load(data.SiteID, data.SiteFullName, "", "");
        }

        $("#exportoexcel").css("display", "none");
        $("#exporttopdf").css("display", "block");
    }
}

function createLevel2Chart() {
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
                format: "Not Applicable: {0:n1}% "

            }
        }

        ],
        categoryAxis: {
            field: "SiteFullName",

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
            template: "#= series.name #: #= kendo.format('{0:n1}%',value) #"
        },
        seriesClick: onLevel2SeriesClick
    });


}
function createLevel2Data() {
    $("#divlevel2data").kendoGrid({
        dataSource: Level2dataSource,
        change: onLevel2Click,
        selectable: true,
        sortable: true,
        excel: { allPages: true },
        excelExport: ERexcelExport,
        columns: [
             { field: "SiteID", hidden: "true" }, { field: "SiteName", width: 270, title: "Site Name", footerTemplate: "Total:" },
             { field: "HCOID", width: 80, title: "HCO ID" },
             { field: "SiteFullName", hidden: "true" }, { field: "Location", width: 150, title: "Location" },
             { field: "TracerCount", width: 120, title: "Tracer Count", footerTemplate: "#=sum#" },
            { field: "ObservationCount", width: 120, title: "Total Completed Observations", footerTemplate: "#=sum#" },
             { field: "QuestionCount", width: 120, title: "Question Count", footerTemplate: "#=sum#" },
             { field: "NACount", width: 120, title: "Total N/A", footerTemplate: "#=sum#" },
             { field: "Numerator", width: 120, title: "Total Numerator", footerTemplate: "#=sum#" },
             { field: "Denominator", width: 120, title: "Total Denominator", footerTemplate: "#=sum#" },
             {
                 field: "CompliancePercent", width: 160, title: "Overall Compliance %"
                 , format: "{0:0.0}"
   , footerTemplate: "# if(data.Denominator.sum == 0) " +
                                           "{#  #= kendo.toString(0, '0.0') #%  #} " +
                                           "else {# #= kendo.toString((data.Numerator.sum/data.Denominator.sum)*100, '0.0') #% #}#"
             }, { field: "NonCompliancePercent", hidden: "true" }]
    });
}

// code to call second level 
function Level2Load(ProgramID, ProgramName, ChapterID, ChapterCode) {

    if (groupbySite) {
        SelectedProgramName = ProgramName;
        SelectedProgramID = ProgramID;
    }
    else {
        SelectedChapterName = ChapterCode;
        SelectedChapteID = ChapterID;
    }


    Level2dataSource = Level2datasourcecall();
    Level2dataSource.sync();
    createLevel2Chart();

}

var Level2dataSource = "";
function Level2datasourcecall() {

    var ChartSearch = SetSearchCriteria(true);
    ChartSearch.ProgramIDs = SelectedProgramID;
    ChartSearch.ProgramNames = SelectedProgramName;
    if (groupbySite) {
        // do nothing

    }
    else {
        ChartSearch.SelectedChapterIDs = SelectedChapteID;
        ChartSearch.SelectedChapterNames = SelectedChapterName;
    }


    DisplayLevelParameters(ChartSearch);

    //var array = $("#SiteSelector_SelectedHCOIDs").val().split(',');

    //setChartHeight("divlevel2chart", array.length);




    return new kendo.data.DataSource({
        transport: {
            read: {
                // the remote service url
                url: "/TracerER/TracersByTJCStandard/TracersByTJCStandard_Data",

                // the request type
                type: "post",

                // the data type of the returned result
                dataType: "json",

                // additional custom parameters sent to the remote service
                data: { search: ChartSearch, LevelIdentifier: 2 }
            }
        },
        requestEnd: function (e) {
            if (e.response != null) {
                setChartHeight("divlevel2chart", e.response.length);
            }
            EnableDisableChartView(false);
        },
        aggregate: [{ field: "HCOID", aggregate: "count" },
                                  { field: "TracerCount", aggregate: "sum" },
                                  { field: "ObservationCount", aggregate: "sum" },
                                  { field: "QuestionCount", aggregate: "sum" },
                                  { field: "NACount", aggregate: "sum" },
                                  { field: "Numerator", aggregate: "sum" },
                                  { field: "Denominator", aggregate: "sum" },
                                  { field: "CompliancePercent", aggregate: "average" }]
    });
}
// Level 2 scripts end

// Level 3 scripts start
function createLevel3Chart() {
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
            field: "ChapterCode",

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
            template: "#= series.name #: #= kendo.format('{0:n1}%',value) #"
        },
        seriesClick: onLevel3SeriesClick
    });


}
function createLevel3Data() {
    $("#divlevel3data").kendoGrid({
        dataSource: Level3dataSource,
        selectable: true,
        sortable: true,
        change: onLevel3Click,
        excel: { allPages: true },
        excelExport: ERexcelExport,
        columns: [
            { field: "ChapterID", hidden: "true" }, { field: "ChapterCode", width: 125, title: "Chapter", footerTemplate: "Total:" },
            { field: "ChapterName", hidden: "true" },
            // Developer Comment:  (Asked to remove in UserStory: 51682)
            //{ field: "TracerCount", width: 150, title: "Tracer Count", footerTemplate: "#=sum#" },
            //{ field: "ObservationCount", width: 150, title: "Total Completed Observations", footerTemplate: "#=sum#" },
            { field: "QuestionCount", width: 150, title: "Question Count", footerTemplate: "#=sum#" },
            { field: "NACount", width: 150, title: "Total N/A", footerTemplate: "#=sum#" },
            { field: "Numerator", width: 150, title: "Total Numerator", footerTemplate: "#=sum#" },
            { field: "Denominator", width: 150, title: "Total Denominator", footerTemplate: "#=sum#" },
            {
                field: "CompliancePercent", width: 200, title: "Overall Compliance %"
                , format: "{0:0.0}"
            , footerTemplate: "# if(data.Denominator.sum == 0) " +
                                        "{#  #= kendo.toString(0, '0.0') #%  #} " +
                                        "else {# #= kendo.toString((data.Numerator.sum/data.Denominator.sum)*100, '0.0') #% #}#"
            }, { field: "NonCompliancePercent", hidden: "true" }]
});
}
// code to call third level 

function Level3Load(SiteID, SiteFullName, ProgramID, ProgramName) {
    // SelectedProgramName = ProgramName;
    if (groupbySite) {
        SelectedHCOName = SiteFullName;
        SelectedSiteID = SiteID;
    }
    else {
        SelectedProgramName = ProgramName;
        SelectedProgramID = ProgramID;
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
    if (groupbySite) {

        ChartSearch.SelectedSiteIDs = SelectedSiteID;

    }
    else {
        // do nothing
        // var array = $("#SiteSelector_SelectedHCOIDs").val().split(',');

        // setChartHeight("divlevel2chart", array.length);
    }

    DisplayLevelParameters(ChartSearch);
    //setChartHeight("divlevel3chart", 12);


    return new kendo.data.DataSource({
        transport: {
            read: {
                // the remote service url
                url: "/TracerER/TracersByTJCStandard/TracersByTJCStandard_Data",

                // the request type
                type: "post",

                // the data type of the returned result
                dataType: "json",

                // additional custom parameters sent to the remote service
                data: { search: ChartSearch, LevelIdentifier: 3 }
            }
        },
        requestEnd: function (e) {
            if (e.response != null) {
                setChartHeight("divlevel3chart", e.response.length);
            }
            EnableDisableChartView(false);
        },
        // describe the result format
        schema: {
            // the data, which the data source will be bound to is in the "list" field of the response
            model: {
                ChapterID: "ChapterID",
                ChapterCode: "ChapterCode", ChapterName: "ChapterName", TracerCount: "TracerCount", ObservationCount: "ObservationCount", QuestionCount: "QuestionCount", NACount: "NACount",
                Numerator: "Numerator", Denominator: "Denominator", CompliancePercent: "CompliancePercent", NonCompliancePercent: "NonCompliancePercent", NACompliancePercent: "NACompliancePercent"

            }
        },

        aggregate: [{ field: "ChapterID", aggregate: "count" },
                                  { field: "TracerCount", aggregate: "sum" },
                                   { field: "ObservationCount", aggregate: "sum" },
                                  { field: "QuestionCount", aggregate: "sum" },
                                  { field: "NACount", aggregate: "sum" },
                                  { field: "Numerator", aggregate: "sum" },
                                  { field: "Denominator", aggregate: "sum" },
                                  { field: "CompliancePercent", aggregate: "average" }]
    });
}

function onLevel3SeriesClick(e) {
    EnableDisableChartView(true);
    if (groupbySite) {
        LevelIdentifier = 4;
        $('#divtoplevel3').css("display", "none");
        $('#divtoplevel4').css("display", "block");
        $('#divlevel4chart').css("display", "block");
        $('#divlevel4data').css("display", "none");
        Level4Load("", "", e.dataItem.ChapterID, e.dataItem.ChapterCode);
    }
    else {
        LevelIdentifier = 3;
        $('#divtoplevel2').css("display", "block");
        $('#divtoplevel3').css("display", "none");
        $('#divlevel2chart').css("display", "block");
        $('#divlevel2data').css("display", "none");
        Level2Load("", "", e.dataItem.ChapterID, e.dataItem.ChapterCode);
    }
}

function onLevel3Click(e) {
    EnableDisableChartView(true);

    $('input:radio[id*="radioL1Graph"]').prop('checked', true);
    var data = this.dataItem(this.select());

    if (data != null) {
        if (groupbySite) {
            LevelIdentifier = 4;
            $('#divtoplevel3').css("display", "none");
            $('#divtoplevel4').css("display", "block");
            $('#divlevel4chart').css("display", "block");
            $('#divlevel4data').css("display", "none");
            Level4Load("", "", data.ChapterID, data.ChapterCode);
        }
        else {

            LevelIdentifier = 3;

            $('#divtoplevel2').css("display", "block");
            $('#divtoplevel3').css("display", "none");
            $('#divlevel2chart').css("display", "block");
            $('#divlevel2data').css("display", "none");
            Level2Load("", "", data.ChapterID, data.ChapterCode);
        }

        $("#exportoexcel").css("display", "none");
        $("#exporttopdf").css("display", "block");
    }
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
            template: "#= series.name #: #= kendo.format('{0:n1}%',value) #"
        },
        seriesClick: onLevel4SeriesClick
    });


}
function createLevel4Data() {
    $("#divlevel4data").kendoGrid({
        dataSource: Level4dataSource,
        selectable: true,
        sortable: true,
        change: onLevel4Click,
        excel: { allPages: true },
        excelExport: ERexcelExport,
        columns: [
            { field: "StandardTextID", hidden: "true" }, { field: "StandardLabel", width: 150, title: "Standard", footerTemplate: "Total:" },
             // Developer Comment:  (Asked to remove in UserStory: 51682)
             //{ field: "TracerCount", width: 150, title: "Tracer Count", footerTemplate: "#=sum#" },
             //{ field: "ObservationCount", width: 150, title: "Total Completed Observations", footerTemplate: "#=sum#" },
             { field: "QuestionCount", width: 150, title: "Question Count", footerTemplate: "#=sum#" },
             { field: "NACount", width: 150, title: "Total N/A", footerTemplate: "#=sum#" },
             { field: "Numerator", width: 150, title: "Total Numerator", footerTemplate: "#=sum#" },
             { field: "Denominator", width: 150, title: "Total Denominator", footerTemplate: "#=sum#" },
             {
                 field: "CompliancePercent", width: 200, title: "Overall Compliance %"
                 , format: "{0:0.0}"
              , footerTemplate: "# if(data.Denominator.sum == 0) " +
                                           "{#  #= kendo.toString(0, '0.0') #%  #} " +
                                           "else {# #= kendo.toString((data.Numerator.sum/data.Denominator.sum)*100, '0.0') #% #}#"
             }, { field: "NonCompliancePercent", hidden: "true" }]
    });
}

function Level4Load(SiteID, SiteFullName, ChapterID, ChapterName) {

    if (groupbySite) {

        SelectedChapteID = ChapterID;
        SelectedChapterName = ChapterName;
    }
    else {
        SelectedHCOName = SiteFullName;
        SelectedSiteID = SiteID;
    }


    Level4dataSource = Level4datasourcecall();
    Level4dataSource.sync();
    createLevel4Chart();

}

var Level4dataSource = "";
function Level4datasourcecall() {

    var ChartSearch = SetSearchCriteria(true);
    ChartSearch.ProgramIDs = SelectedProgramID;
    ChartSearch.ProgramNames = SelectedProgramName;
    ChartSearch.SelectedChapterIDs = SelectedChapteID;
    ChartSearch.SelectedChapterNames = SelectedChapterName;
    ChartSearch.SelectedSiteIDs = SelectedSiteID;


    DisplayLevelParameters(ChartSearch);
    //setChartHeight("divlevel3chart", 12);


    return new kendo.data.DataSource({
        transport: {
            read: {
                // the remote service url
                url: "/TracerER/TracersByTJCStandard/TracersByTJCStandard_Data",

                // the request type
                type: "post",

                // the data type of the returned result
                dataType: "json",

                // additional custom parameters sent to the remote service
                data: { search: ChartSearch, LevelIdentifier: 4 }
            }
        },
        requestEnd: function (e) {
            if (e.response != null) {
                setChartHeight("divlevel4chart", e.response.length);
            }
            EnableDisableChartView(false);
        },

        aggregate: [{ field: "StandardTextID", aggregate: "count" },
                                  { field: "TracerCount", aggregate: "sum" },
                                  { field: "ObservationCount", aggregate: "sum" },
                                  { field: "QuestionCount", aggregate: "sum" },
                                  { field: "NACount", aggregate: "sum" },
                                  { field: "Numerator", aggregate: "sum" },
                                  { field: "Denominator", aggregate: "sum" },
                                  { field: "CompliancePercent", aggregate: "average" }]
    });
}

function onLevel4SeriesClick(e) {
    EnableDisableChartView(true);

    LevelIdentifier = 5;
    $('#divtoplevel5').css("display", "block");
    $('#divtoplevel4').css("display", "none");
    $('#divlevel5chart').css("display", "block");
    $('#divlevel5data').css("display", "none");
    Level5Load(e.dataItem.StandardTextID, e.dataItem.StandardLabel);
}
function onLevel4Click(e) {
    EnableDisableChartView(true);

    $('input:radio[id*="radioL1Graph"]').prop('checked', true);
    LevelIdentifier = 5;
    var data = this.dataItem(this.select());
    if (data != null) {
        $('#divtoplevel5').css("display", "block");
        $('#divtoplevel4').css("display", "none");
        $('#divlevel5chart').css("display", "block");
        $('#divlevel5data').css("display", "none");
        Level5Load(data.StandardTextID, data.StandardLabel);

        $("#exportoexcel").css("display", "none");
        $("#exporttopdf").css("display", "block");
    }
}
// Level 4 scripts end

// Level 5 scripts start
function createLevel5Chart() {
    $("#divlevel5chart").kendoChart({

        dataSource: Level5dataSource,
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
            field: "EPLabel",

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
            template: "#= series.name #: #= kendo.format('{0:n1}%',value) #"
        },
        seriesClick: onLevel5SeriesClick
    });


}
function createLevel5Data() {
    $("#divlevel5data").kendoGrid({
        dataSource: Level5dataSource,
        selectable: true,
        sortable: true,
        change: onLevel5Click,
        excel: { allPages: true },
        excelExport: ERexcelExport,
        columns: [
            { field: "EPTextID", hidden: "true" }, { field: "EPLabel", width: 200, title: "EP", footerTemplate: "Total:" },
             // Developer Comment:  (Asked to remove in UserStory: 51682)
             //{ field: "TracerCount", width: 200, title: "Tracer Count", footerTemplate: "#=sum#" },
             //{ field: "ObservationCount", width: 200, title: "Total Completed Observations", footerTemplate: "#=sum#" },
             { field: "QuestionCount", width: 200, title: "Question Count", footerTemplate: "#=sum#" },
             { field: "NACount", width: 200, title: "Total N/A", footerTemplate: "#=sum#" },
             { field: "Numerator", width: 200, title: "Total Numerator", footerTemplate: "#=sum#" }, { field: "Denominator", width: 200, title: "Total Denominator", footerTemplate: "#=sum#" },
             {
                 field: "CompliancePercent", width: 200, title: "Overall Compliance %"
                , format: "{0:0.0}"
                  , footerTemplate: "# if(data.Denominator.sum == 0) " +
                                           "{#  #= kendo.toString(0, '0.0') #%  #} " +
                                           "else {# #= kendo.toString((data.Numerator.sum/data.Denominator.sum)*100, '0.0') #% #}#"
             }, { field: "NonCompliancePercent", hidden: "true" }]
    });
}

function Level5Load(StandardTextID, StandardLabel) {
    SelectedStandardTextID = StandardTextID;
    SelectedStandardName = StandardLabel;

    Level5dataSource = Level5datasourcecall();
    Level5dataSource.sync();
    createLevel5Chart();

}

var Level5dataSource = "";
function Level5datasourcecall() {

    var ChartSearch = SetSearchCriteria(true);

    ChartSearch.ProgramIDs = SelectedProgramID;
    ChartSearch.ProgramNames = SelectedProgramName;
    ChartSearch.SelectedChapterIDs = SelectedChapteID;
    ChartSearch.SelectedChapterNames = SelectedChapterName;
    ChartSearch.SelectedSiteIDs = SelectedSiteID;
    ChartSearch.SelectedStandardIDs = SelectedStandardTextID;
    ChartSearch.SelectedStandardNames = SelectedStandardName;

    DisplayLevelParameters(ChartSearch);



    return new kendo.data.DataSource({
        transport: {
            read: {
                // the remote service url
                url: "/TracerER/TracersByTJCStandard/TracersByTJCStandard_Data",

                // the request type
                type: "post",

                // the data type of the returned result
                dataType: "json",

                // additional custom parameters sent to the remote service
                data: { search: ChartSearch, LevelIdentifier: 5 }
            }
        },
        requestEnd: function (e) {
            if (e.response != null) {
                setChartHeight("divlevel5chart", e.response.length);
            }
            EnableDisableChartView(false);
        },


        aggregate: [{ field: "EPTextID", aggregate: "count" },
                                  { field: "TracerCount", aggregate: "sum" },
                                  { field: "ObservationCount", aggregate: "sum" },
                                  { field: "QuestionCount", aggregate: "sum" },
                                  { field: "NACount", aggregate: "sum" },
                                  { field: "Numerator", aggregate: "sum" },
                                  { field: "Denominator", aggregate: "sum" },
                                  { field: "CompliancePercent", aggregate: "average" }]
    });
}

function onLevel5SeriesClick(e) {
    EnableDisableChartView(true);

    LevelIdentifier = 6;
    $('#divtoplevel6').css("display", "block");
    $('#divtoplevel5').css("display", "none");

    $('#divlevel6data').css("display", "block");
    Level6Load(e.dataItem.EPTextID, e.dataItem.EPLabel);
    $('input:radio[id*="radioL1Data"]').prop('checked', true);
    // $("input[type=radio]").attr('disabled', true);
    $("#exportoexcel").css("display", "block");
    $("#exporttopdf").css("display", "none");

    //EnableDisableChartView(false);
    //$('input:radio[name*="L1selectView"]').attr('disabled', true);
}
function onLevel5Click(e) {
    EnableDisableChartView(true);

    $('input:radio[id*="radioL1Data"]').prop('checked', true);
    LevelIdentifier = 6;
    var data = this.dataItem(this.select());
    if (data != null) {
        $('#divtoplevel6').css("display", "block");
        $('#divtoplevel5').css("display", "none");
        $('#divlevel6data').css("display", "block");
        Level6Load(data.EPTextID, data.EPLabel);
        // $("input[type=radio]").attr('disabled', true);
        //L1selectView
        $("#exportoexcel").css("display", "block");
        $("#exporttopdf").css("display", "none");

        //EnableDisableChartView(false);
        //$('input:radio[name*="L1selectView"]').attr('disabled', true);
    }
}
// Level 5 scripts end

// Level 6 scripts start
function createLevel6Data() {
    $("#divlevel6data").kendoGrid({
        dataSource: Level6dataSource,
        pageable: {
            refresh: true,
            pageSizes: [20, 50, 100]
        },
        sortable: true,
        excel: { allPages: true },
        excelExport: ERexcelExport,
        columns: [
            { field: "TracerCustomName", width: 200, title: "Tracer", footerTemplate: "Total:" },
             { field: "TracerCustomID", hidden: "true" },
             { field: "TracerResponseTitle", width: 250, title: "Observation" },
             { field: "TracerResponseID", hidden: "true" },
             { field: "QuestionNo", width: 75, title: "Ques No" },
             { field: "QuestionText", width: 250, title: "Question" },
             { field: "OrganizationName_Rank3", width: 100, title: "OrgName_Rank3" },
             { field: "OrganizationName_Rank2", width: 100, title: "OrgName_Rank2" },
             { field: "OrganizationName_Rank1_Dept", width: 100, title: "Department" },
              { field: "ObservationDate", width: 150, title: "Observation Date" },
              { field: "LastUpdated", width: 150, title: "Last Updated" },
               { field: "UpdatedByUserName", width: 150, title: "Updated By" },
                { field: "ObservationNote", width: 200, title: "Observation Notes" },
                 { field: "TracerQuestionNote", width: 200, title: "Question Notes" },
                 { field: "Numerator", width: 125, title: "Num", footerTemplate: "#=sum#" },
             { field: "Denominator", width: 125, title: "Den", footerTemplate: "#=sum#" },

        {
            field: "CompliancePercent", width: 125, title: "Compliance %", format: "{0:0.0}"
            , footerTemplate: "# if(data.Denominator.sum == 0) " +
                                           "{#  #= kendo.toString(0, '0.0') #%  #} " +
                                           "else {# #= kendo.toString((data.Numerator.sum/data.Denominator.sum)*100, '0.0') #% #}#"
        }
        ]
    })
}
function SetColumnHeader(GridName, startIndex) {

    // hide the org hierarchy columns and rename as applicable
    if (OrgRanking3Name == "") {
        $("#" + GridName).data("kendoGrid").hideColumn(startIndex);
        $("#" + GridName).data("kendoGrid").columns[startIndex].title = "";
        $("#" + GridName).data("kendoGrid").columns[startIndex].field = "";
    }
    else {

        $("#" + GridName).data("kendoGrid").columns[startIndex].title = OrgRanking3Name;
        $("#" + GridName).data("kendoGrid").columns[startIndex].field = "OrganizationName_Rank3";
        $("#" + GridName).data("kendoGrid").showColumn(startIndex);
        $("#" + GridName + " thead [data-field=OrganizationName_Rank3] .k-link").html(OrgRanking3Name);
        $("#" + GridName + " .k-grid-header > tr > th[data-field=OrganizationName_Rank3]").attr("data-title", OrgRanking3Name);



    }

    if (OrgRanking2Name == "") {
        $("#" + GridName).data("kendoGrid").hideColumn(startIndex + 1);
        $("#" + GridName).data("kendoGrid").columns[startIndex + 1].title = "";
        $("#" + GridName).data("kendoGrid").columns[startIndex + 1].field = "";
    }
    else {
        $("#" + GridName).data("kendoGrid").columns[startIndex + 1].title = OrgRanking2Name;
        $("#" + GridName).data("kendoGrid").columns[startIndex + 1].field = "OrganizationName_Rank2";
        $("#" + GridName).data("kendoGrid").showColumn(startIndex + 1);
        $("#" + GridName + " thead [data-field=OrganizationName_Rank2] .k-link").html(OrgRanking2Name);
        $("#" + GridName + " .k-grid-header > tr > th[data-field=OrganizationName_Rank2]").attr("data-title", OrgRanking2Name);
    }

}
function Level6Load(EPTextID, EPLabel) {

    SelectedEPTextID = EPTextID;
    SelectedEPName = EPLabel;

    Level6dataSource = Level6datasourcecall();
    Level6dataSource.sync();
    createLevel6Data();

    $.ajax({
        type: "POST",
        data: { selectedSiteID: SelectedSiteID, selectedProgramID: SelectedProgramID },
        url: '/ERSearch/GetOrganizationTypesHeaderString',
        success: function (data) {

            var a = data.split(" > ");
            a.reverse();

            if (a.length >= 2) { OrgRanking2Name = a[1]; } else { OrgRanking2Name = ""; }
            if (a.length >= 3) { OrgRanking3Name = a[2]; } else { OrgRanking3Name = ""; }

            SetColumnHeader("divlevel6data", 6);
        }
    });

}

var Level6dataSource = "";
function Level6datasourcecall() {

    var ChartSearch = SetSearchCriteria(true);

    ChartSearch.ProgramIDs = SelectedProgramID;
    ChartSearch.ProgramNames = SelectedProgramName;
    ChartSearch.SelectedChapterIDs = SelectedChapteID;
    ChartSearch.SelectedChapterNames = SelectedChapterName;
    ChartSearch.SelectedSiteIDs = SelectedSiteID;
    ChartSearch.SelectedStandardIDs = SelectedStandardTextID;
    ChartSearch.SelectedStandardNames = SelectedStandardName;
    ChartSearch.EPTextIDs = SelectedEPTextID;
    ChartSearch.StandardLabelAndEPLabels = SelectedEPName;
    DisplayLevelParameters(ChartSearch);



    return new kendo.data.DataSource({
        transport: {
            read: {
                // the remote service url
                url: "/TracerER/TracersByTJCStandard/TracersByTJCStandard_Data",

                // the request type
                type: "post",

                // the data type of the returned result
                dataType: "json",

                // additional custom parameters sent to the remote service
                data: { search: ChartSearch, LevelIdentifier: 6 }
            }
        },
        requestEnd: function (e) {
            if (e.response != null) {
                // setChartHeight("divlevel5chart", e.response.length);
            }
            EnableDisableChartView(false);
            $('input:radio[name*="L1selectView"]').attr('disabled', true);
        },
        pageSize: 20,
        aggregate: [{ field: "TracerQuestionAnswerID", aggregate: "count" },
                                  { field: "Numerator", aggregate: "sum" },
                                  { field: "Denominator", aggregate: "sum" },
                                  { field: "CompliancePercent", aggregate: "average" }]
    });
}
// Level 6 scripts end

// Common scripts start 
function ERPDFExportByLevel() {
    var dataSource = "";
    switch (LevelIdentifier) {
        case 1:
            ExportReportName = "Tracers By TJC Standard - Overall Compliance by Program";
            var levelkendogrid = $("#divleveldata");
            if (levelkendogrid.data("kendoGrid")) {
                dataSource = $("#divleveldata").data("kendoGrid").dataSource;
            }
            break;
        case 2:
            if (groupbySite) {
                ExportReportName = "Tracers By TJC Standard - Compliance by Site";
                var levelkendogrid = $("#divlevel2data");
                if (levelkendogrid.data("kendoGrid")) {
                    dataSource = $("#divlevel2data").data("kendoGrid").dataSource;
                }

            }
            else {
                ExportReportName = "Tracers By TJC Standard - Compliance by Chapter";
                var levelkendogrid = $("#divlevel3data");
                if (levelkendogrid.data("kendoGrid")) {
                    dataSource = $("#divlevel3data").data("kendoGrid").dataSource;
                }
            }

            break;
        case 3:
            if (groupbySite) {
                ExportReportName = "Tracers By TJC Standard - Compliance by Chapter";
                var levelkendogrid = $("#divlevel3data");
                if (levelkendogrid.data("kendoGrid")) {
                    dataSource = $("#divlevel3data").data("kendoGrid").dataSource;
                }
            }
            else {
                ExportReportName = "Tracers By TJC Standard - Compliance by Site";
                var levelkendogrid = $("#divlevel2data");
                if (levelkendogrid.data("kendoGrid")) {
                    dataSource = $("#divlevel2data").data("kendoGrid").dataSource;
                }
            }

            break;
        case 4:
            ExportReportName = "Tracers By TJC Standard - Compliance by Standard";
            var levelkendogrid = $("#divlevel4data");
            if (levelkendogrid.data("kendoGrid")) {
                dataSource = $("#divlevel4data").data("kendoGrid").dataSource;
            }
            break;
        case 5:
            ExportReportName = "Tracers By TJC Standard - Compliance by EP";
            var levelkendogrid = $("#divlevel5data");
            if (levelkendogrid.data("kendoGrid")) {
                dataSource = $("#divlevel5data").data("kendoGrid").dataSource;
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
                url: "/Export/CreateERSessionCriteria",
                contentType: "application/json",
                data: JSON.stringify({ ERsearch: SetParameters() })

            }).done(function (e) {
                $(function () {
                    $.post('/Email/SendERPDFEmail',
                      { ExcelGridName: ExportReportName, email: $.parseJSON(sessionStorage.getItem('searchsetemailsession')), ERReportName: "TracersByTJCStandard", SortBy: dataSortBy, SortOrder: dataSortOrder }, function (data) {
                          fromemail = false;
                          if (data != "Preping Second Attachment") {
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
            });
        }
    }
    else {

        $.ajax({
            type: "Post",
            url: "/Export/CreateERSessionCriteria",
            contentType: "application/json",
            data: JSON.stringify({ ERsearch: SetParameters() })

        }).done(function (e) {


            $(function () {
                $.post('/Email/createErPdf',
                  { ExcelGridName: ExportReportName, ERReportName: "TracersByTJCStandard", SortBy: dataSortBy, SortOrder: dataSortOrder }, function (data) {

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
            ExportReportName = "Tracers By TJC Standard - Overall Compliance by Program";
            $("#divleveldata").getKendoGrid().saveAsExcel();
            break;
        case 2:
            if (groupbySite) {
                ExportReportName = "Tracers By TJC Standard - Compliance by Site";
                $("#divlevel2data").getKendoGrid().saveAsExcel();
            }
            else {
                ExportReportName = "Tracers By TJC Standard - Compliance by Chapter";
                $("#divlevel3data").getKendoGrid().saveAsExcel();
            }

            break;
        case 3:
            if (groupbySite) {
                ExportReportName = "Tracers By TJC Standard - Compliance by Chapter";
                $("#divlevel3data").getKendoGrid().saveAsExcel();
            }
            else {
                ExportReportName = "Tracers By TJC Standard - Compliance by Site";
                $("#divlevel2data").getKendoGrid().saveAsExcel();
            }


            break;
        case 4:
            ExportReportName = "Tracers By TJC Standard - Compliance by Standard";
            $("#divlevel4data").getKendoGrid().saveAsExcel();
            break;
        case 5:
            ExportReportName = "Tracers By TJC Standard - Compliance by EP";
            $("#divlevel5data").getKendoGrid().saveAsExcel();
            break;
        case 6:
            ExportReportName = "Tracers By TJC Standard - EP Details";
            $("#divlevel6data").getKendoGrid().saveAsExcel();
            break;

    }
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

    // var shortChaptersShow = ChartSearch.SelectedChapterNames === "All" ? "All, " : ChartSearch.SelectedChapterNames + ",";
    //   shortChaptersShow = shortChaptersShow.replace(/(\-)(.*?)(\,)/gi, ", ").slice(0, -2);
    ChartSearch.SelectedSiteHCOIDs = $("#SiteSelector_SelectedHCOIDs").val();
    ChartSearch.LevelIdentifier = LevelIdentifier;
    switch (LevelIdentifier) {
        case 1:

            ChartSearch.SelectedChapterNames = ChartSearch.shortChaptersShow;
            break;
        case 2:
            if (groupbySite) {
                ChartSearch.ProgramNames = SelectedProgramName;
                ChartSearch.ProgramIDs = SelectedProgramID;
                ChartSearch.SelectedChapterNames = ChartSearch.shortChaptersShow;

            }
            else {
                ChartSearch.ProgramNames = SelectedProgramName;
                ChartSearch.SelectedChapterNames = ChartSearch.shortChaptersShow;
                ChartSearch.ProgramIDs = SelectedProgramID;
                ChartSearch.LevelIdentifier = 3;
            }
            break;
        case 3:
            if (groupbySite) {
                ChartSearch.SelectedSiteHCOIDs = SelectedHCOName;
                ChartSearch.ProgramNames = SelectedProgramName;
                ChartSearch.SelectedChapterNames = ChartSearch.shortChaptersShow;
                ChartSearch.ProgramIDs = SelectedProgramID;
                ChartSearch.SelectedSiteIDs = SelectedSiteID;

            }
            else {
                ChartSearch.ProgramNames = SelectedProgramName;
                ChartSearch.SelectedChapterNames = SelectedChapterName;
                ChartSearch.SelectedChapterIDs = SelectedChapteID;
                ChartSearch.ProgramIDs = SelectedProgramID;

                ChartSearch.LevelIdentifier = 2;
            }

            break;
        case 4:
            ChartSearch.SelectedSiteHCOIDs = SelectedHCOName;
            ChartSearch.ProgramIDs = SelectedProgramID;
            ChartSearch.ProgramNames = SelectedProgramName;
            ChartSearch.SelectedChapterIDs = SelectedChapteID;
            ChartSearch.SelectedChapterNames = SelectedChapterName;
            ChartSearch.SelectedSiteIDs = SelectedSiteID;
            break;
        case 5:
            ChartSearch.SelectedSiteHCOIDs = SelectedHCOName;
            ChartSearch.ProgramIDs = SelectedProgramID;
            ChartSearch.ProgramNames = SelectedProgramName;
            ChartSearch.SelectedChapterIDs = SelectedChapteID;
            ChartSearch.SelectedChapterNames = SelectedChapterName;
            ChartSearch.SelectedSiteIDs = SelectedSiteID;
            ChartSearch.SelectedStandardIDs = SelectedStandardTextID;
            ChartSearch.SelectedStandardNames = SelectedStandardName;
            break;
        case 6:
            ChartSearch.SelectedSiteHCOIDs = SelectedHCOName;
            ChartSearch.ProgramIDs = SelectedProgramID;
            ChartSearch.ProgramNames = SelectedProgramName;
            ChartSearch.SelectedChapterIDs = SelectedChapteID;
            ChartSearch.SelectedChapterNames = SelectedChapterName;
            ChartSearch.SelectedSiteIDs = SelectedSiteID;
            ChartSearch.SelectedStandardIDs = SelectedStandardTextID;
            ChartSearch.SelectedStandardNames = SelectedStandardName;
            ChartSearch.EPTextIDs = SelectedEPTextID;
            ChartSearch.StandardLabelAndEPLabels = SelectedEPName;
            break;

    }

    return ChartSearch;

}
function AddExportParameters() {


    var ChartSearch = SetParameters();
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
                    { value: ChartSearch.StandardLabelAndEPLabels }
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
                    { value: "Group By at Program Level" },
                    { value: ChartSearch.ReportType == "BySite" ? "By Site" : "By Chapter" }
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
                    { value: ChartSearch.StandardLabelAndEPLabels }
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
                    { value: "Group By at Program Level" },
                    { value: ChartSearch.ReportType == "BySite" ? "By Site" : "By Chapter" }
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
    var searchCriteria = GetParameterValues();

    var parameterSet = [
        { SelectedSites: ERSites.getSelectedSites() },
        { ProgramServices: searchCriteria.ProgramIDs },
        { ReportTitle: searchCriteria.ReportTitle },
        { ReportGroupByType: searchCriteria.ReportType },
        { TracersChapter: searchCriteria.SelectedChapterIDs },
        { TracersStandard: searchCriteria.SelectedStandardIDs },
        { TracersEP: searchCriteria.EPTextIDs }
    ];

    //Set the Report Name
    parameterSet.push({ ScheduledReportName: $('#txtScheduledReportName').val() });

    if (searchCriteria.IncludeFSA === true)
        parameterSet.push({ IncludeFSAcheckbox: true });

    //Add recurrence fields to the parameter set
    GetERRecurrenceParameters(parameterSet);

    //Add date parameters only there is a value
    GetObservationDate(parameterSet, searchCriteria.StartDate, searchCriteria.EndDate);

    //Save the parameters to the database
    SaveSchedule(parameterSet, deleteReport);
}

//Sets the saved parameters for each control
function SetSavedParameters(params) {
    var selectedSites = '';

    $('#txtScheduledReportName').val(params.ReportNameOverride);
    $('input[name=ERGroupBYProgramLevel][value="' + getParamValue(params.ReportParameters, "ReportGroupByType") + '"]').prop('checked', true);

    var query = $(params.ReportSiteMaps).each(function () {
        selectedSites += $(this)[0].SiteID + ',';
    });
    selectedSites = selectedSites.replace(/\,$/, ''); //Remove the last character if its a comma

    ERSites.oldSites = ERSites.getSelectedSites();

    //Load the programs
    //MultiSiteProgramCall(selectedSites);
    LoadReportParameters(selectedSites);
    $("#MultiSiteProgram").data("kendoMultiSelect").value(getParamValue(params.ReportParameters, "ProgramServices").split(","));

    //Load the Chapters, Standards and EPs
    MultiSiteChapterCall(1, getParamValue(params.ReportParameters, "ProgramServices"));
    $("#MultiSiteChapter").data("kendoMultiSelect").value(getParamValue(params.ReportParameters, "TracersChapter").split(","));
    $("#TracersStandard").data("kendoMultiSelect").value(getParamValue(params.ReportParameters, "TracersStandard").split(","));
    $("#TracersEP").data("kendoMultiSelect").value(getParamValue(params.ReportParameters, "TracersEP").split(","));

    SetSavedObservationDate(params.ReportParameters);

    CheckboxChecked(getParamValue(params.ReportParameters, "IncludeFSAcheckbox"), 'IncludeFSAcheckbox');

    SetERRecurrenceParameters(params);

    //Show the Criteria screen once the parameters are loaded
    //ERCriteriaLoaded = true;
    OnbtnERSearchClick();

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