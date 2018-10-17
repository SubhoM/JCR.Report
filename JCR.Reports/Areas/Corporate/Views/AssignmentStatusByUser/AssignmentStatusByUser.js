ExcelView = true;
exportparameters = true;
var defaultValue = "-1";
var defaultText = "All";

var LevelIdentifier = 1;
var SelectedProgramName = "";
var SelectedProgramID = 0;
var SelectedChapteID = 0;
var SelectedChapterName = "";
var SelectedStandardName = "";
var SelectedStandardID = "";
var SelectedHCOName = "";
var SelectedSiteID = 0;
var ResetFilters = $("#GetResetLink").val();
var ExportReportName = "";
var SelectedAssignedTo = 0;
var SelectedAssignedToName = "";

var noDataAvailable = false;
var hasProgramChanged = false;
var isDuplicateLoadCall = false;

function additionalData(e) {

    return { search: SetSearchCriteria(false) }
}

function GetParameterValuesFromScreen() {

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

    var SelectedAssignedToIDs = [];
    var SelectedAssignedToNames = [];
    $('#AssignmentAssignedTo :selected').each(function (i, selected) {
        SelectedAssignedToIDs[i] = $(selected).val();
        SelectedAssignedToNames[i] = GetReportHeaderUserNameFormat($(selected).text().trim());
    });
    if (SelectedAssignedToIDs.length <= 0) {
        SelectedAssignedToIDs.push(defaultValue);
        SelectedAssignedToNames.push(defaultText);
    }


    var selectedScoreTypeName = $('input[name=grpScoreType]:checked').next('label').text();

    var ScoreValueList = [];
    var ScoreValueNameList = [];

    $('input[name="grpScoreValue"]:checked').each(function (i, checked) {
        ScoreValueList[i] = $(checked).val();
        ScoreValueNameList[i] = $(checked).next('label').text();
    });

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

        SelectedScoreType: $('input[name=grpScoreType]:checked').val(),
        SelectedScoreTypeName: selectedScoreTypeName,
        SelectedAssignedToIDs: SelectedAssignedToIDs.toString(),
        SelectedAssignedToNames: SelectedAssignedToNames.toString().replace(/,/g, ", "),
        IncludeFSAEPs: $('#chkOnlyIncludeFSAEPs').is(':checked'),
        IncludeDocumentationRequired: $('#chkDocumentationRequired').is(':checked'),
        IncludeNewChangedEPs: $('#chkNewChangedEPs').is(':checked'),

        StartDate: kendo.toString($("#ObsstartDate").data("kendoDatePicker").value(), "MM/dd/yyyy"),
        EndDate: kendo.toString($("#ObsEndDate").data("kendoDatePicker").value(), "MM/dd/yyyy"),
        ReportTitle: $('#hdnReportTitle').val(),
        SelectedSiteHCOIDs: "",
        LevelIdentifier: LevelIdentifier,
        ReportType: $('input[name=ReportTypeChange]:checked').val(),
        ScoreValueList: ScoreValueList.toString(),
        ScoreValueNameList: ScoreValueNameList.toString().replace(/,/g, ", ")
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
            return SearchSetFilterData(GenfromSavedFilters, GetParameterValuesFromScreen());
        }
    }
    else {
        return SearchSetFilterData(GenfromSavedFilters, GetParameterValuesFromScreen());
    }

}

function ValidateScreen() {

    var isPageValid = true;

    if ($(":checkbox[name='grpScoreValue']").is(":checked") == false) {

        showValidationAlert("At least one score value must be checked.");

        isPageValid = false;
        return isPageValid;
    }

    return isPageValid;
}

//Withemail parameter is optional 
function GenerateReport(GenfromSavedFilters, Withemail) {

    //$('.loading').hide();
    //SetLoadingImageVisibility(false);
    hasExcelData = true;

    var isPageValid = ValidateScreen();

    if (!isPageValid)
        return false;

    GenerateReportAddCall();

}

function GenerateReportAddCall() {

    $('#loadChartView').html('');

    ExcelGenerated = true;
    // reset values
    LevelIdentifier = 1;
    SelectedProgramName = "";
    SelectedProgramID = 0;
    SelectedChapteID = 0;
    SelectedChapterName = "";
    SelectedStandardName = "";
    SelectedStandardID = "";
    SelectedEPName = "";
    SelectedEPTextID = "";
    SelectedHCOName = "";
    SelectedSiteID = 0;
    ExportReportName = "";

    var SelectedAssignedTo = 0;
    var SelectedAssignedToName = "";

    $.ajax({
        async: false,
        url: '/Corporate/AssignmentStatusByUser/LoadChart',
        dataType: "html",

        success: function (data) {
            $('#loadChartView').html(data);
            //   EnableDisableChartView(true);
            //blockElement("divL1tag");
            ReportProgramCall();
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
    SelectedProgramID = 0;
    SelectedChapteID = 0;
    SelectedChapterName = "";
    SelectedStandardName = "";
    SelectedStandardID = "";
    SelectedEPName = "";
    SelectedEPTextID = "";
    SelectedHCOName = "";
    SelectedSiteID = 0;
    ExportReportName = "";

    var SelectedAssignedTo = 0;
    var SelectedAssignedToName = "";

    $('input[name=ReportTypeChange][value=Graph]').prop('checked', true);
    $('input[name=grpScoreType][value=2]').prop('checked', true);

    CheckboxChecked('False', 'chkOnlyIncludeFSAEPs');
    CheckboxChecked('False', 'chkDocumentationRequired');
    CheckboxChecked('False', 'chkNewChangedEPs');

    CheckboxChecked('True', 'SatisfactoryCheckbox');
    CheckboxChecked('True', 'InsufficientCheckbox');
    CheckboxChecked('True', 'NotApplicableCheckbox');
    CheckboxChecked('True', 'NotScoredCheckbox');

    var dateRangedeselect = $('input[name=DateRange]:checked').val();
    $('input:radio[id*=' + dateRangedeselect + ']').prop('checked', false);
    ResetStandardsMultiSelect();
    OnReportTypeChange();
    //MultiSiteAssignedTo(); //called inside OnReportTypeChange.
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

    // We overwrite the Date Label
    $('#DateLabel').text("Due Date");

    $('input:radio[name=grpScoreType]').change(function () {
        MultiSiteAssignedTo();
    });

});

function LoadReportParameters(selectedSiteIDs) {
    if (selectedSiteIDs == null || selectedSiteIDs == '') {
        selectedSiteIDs = ERSites.getSelectedSites();
    }

    GetReportHcoIDs(selectedSiteIDs);
    MultiSiteProgramCall(selectedSiteIDs);
}

function GetReportHcoIDs(selectedSiteIDs) {
    $.ajax({
        async: false,
        type: "POST",
        data: { selectedSiteIDs: selectedSiteIDs },
        url: '/Corporate/PriorityTjcRFI/GetReportHcoIDs',
        success: function (response) {
            $("#SiteSelector_SelectedHCOIDs").val(response);
        }
    });
}

//************** Dropdown event scripts Start *************************
function onMSProgramChange(e) {

    MultiSiteChapterCall(ERSites.getSelectedSites(), 0, GetMultiSiteProgramSelectedValue());
    ResetStandardsMultiSelect();
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
            if (!isSavedReportLoading)
                MultiSiteAssignedTo();
        }
    });
}
function MultiSiteAssignedTo() {
    var search = SetSearchCriteria(false);

    $.ajax({
        async: false,
        url: '/Corporate/AssignmentStatusByUser/GetAssignmentAssignedTo',
        dataType: 'html',
        data: search,
        success: function (response) {
            $("#divMultiSiteAssignedTo").html(response);
        }
    });

}
function onAssignmentAssignedToSelect(e) {

    var dataItem = this.dataSource.view()[e.item.index()];
    var values = this.value();

    if (dataItem.FullName === "All") {
        $('#AssignmentAssignedTo').data("kendoMultiSelect").value([]);

    } else if (jQuery.inArray("-1", values)) {
        values = $.grep(values, function (value) {
            return value !== -1;
        });

        if (values == "") { this.value(values); }
    }
}
//************** Dropdown event scripts End ***************************

//************** Graph, Summary, Detail View scripts Start *************************
function showlevelGraph() {
    switch (LevelIdentifier) {
        case 1:
            if (noDataAvailable && hasProgramChanged == false)
                $('#divlevelchart').css("display", "none");
            else
                $('#divlevelchart').css("display", "block");

            $('#divleveldata').css("display", "none");
            $('#divleveldetail').css("display", "none");
            break;
        case 2:
            $('#divlevel2chart').css("display", "block");
            $('#divlevel2data').css("display", "none");
            $('#divlevel2detail').css("display", "none");
            break;
        case 3:
            $('#divlevel3chart').css("display", "block");
            $('#divlevel3data').css("display", "none");
            $('#divlevel3detail').css("display", "none");
            break;

    }
}
function showlevelData() {

    switch (LevelIdentifier) {
        case 1:
            var grid = $("#divleveldata").data("kendoGrid");
            if (!grid) {

                isDuplicateLoadCall = true;
                Level1dataSource = Level1datasourcecall();
                Level1dataSource.sync();
                isDuplicateLoadCall = false;

                createLevel1Data();
            }
            else {
                grid.dataSource.page(1);
            }


            if (noDataAvailable && hasProgramChanged == false)
                $('#divleveldata').css("display", "none");
            else
                $('#divleveldata').css("display", "block");

            $('#divlevelchart').css("display", "none");
            $('#divleveldetail').css("display", "none");

            break;
        case 2:
            var grid = $("#divlevel2data").data("kendoGrid");
            if (!grid) {
                createLevel2Data();
            }
            else {
                grid.dataSource.page(1);
            }

            $('#divlevel2chart').css("display", "none");
            $('#divlevel2detail').css("display", "none");
            $('#divlevel2data').css("display", "block");
            break;
        case 3:
            var grid = $("#divlevel3data").data("kendoGrid");
            if (!grid) {

                isDuplicateLoadCall = true;
                Level3dataSource = Level3datasourcecall();
                Level3dataSource.sync();
                isDuplicateLoadCall = false;

                createLevel3Data();
            }
            else {
                grid.dataSource.page(1);
            }

            $('#divlevel3chart').css("display", "none");
            $('#divlevel3detail').css("display", "none");
            $('#divlevel3data').css("display", "block");
            break;

    }

}
function showlevelDetails() {

    switch (LevelIdentifier) {
        case 1:
            var grid = $("#divleveldetail").data("kendoGrid");
            if (!grid) {
                var Level1detailSource = detailsourcecall();
                createLevelDetail(Level1detailSource);
            }
            else {
                grid.dataSource.page(1);
            }

            if (noDataAvailable && hasProgramChanged == false)
                $('#divleveldetail').css("display", "none");
            else
                $('#divleveldetail').css("display", "block");

            $('#divleveldata').css("display", "none");
            $('#divlevelchart').css("display", "none");
            break;
        case 2:
            var grid = $("#divlevel2detail").data("kendoGrid");
            if (!grid) {
                var Level2detailSource = detailsourcecall();
                createLevelDetail(Level2detailSource);
            }
            else {
                grid.dataSource.page(1);
            }

            $('#divlevel2detail').css("display", "block");
            $('#divlevel2data').css("display", "none");
            $('#divlevel2chart').css("display", "none");
            break;
        case 3:
            var grid = $("#divlevel3detail").data("kendoGrid");
            if (!grid) {
                var Level3detailSource = detailsourcecall();
                createLevelDetail(Level3detailSource);
            }
            else {
                grid.dataSource.page(1);
            }

            $('#divlevel3detail').css("display", "block");
            $('#divlevel3data').css("display", "none");
            $('#divlevel3chart').css("display", "none");
            break;

    }
}
//************** Graph, Summary, Detail View scripts End *************************

function DisplayLevel() {

    LevelIdentifier = LevelIdentifier > 1 ? LevelIdentifier - 1 : LevelIdentifier;

    $("#previousLevelButton").removeClass('k-button k-state-focused');
    switch (LevelIdentifier) {
        case 1:
            $("#divpreviouslevel").css("display", "none");

            $('#divL1Viewtag').css("display", "block");
            $('#divtoplevel1').css("display", "block");
            $('#divtoplevelProgram').css("display", "block");

            $('#divlevelchart').css("display", "block");
            $('#divleveldata').css("display", "none");
            $('#divleveldetail').css("display", "none");

            $('#divtoplevel2').css("display", "none");
            var levelkendogrid = $("#divlevel2data");
            if (levelkendogrid.data("kendoGrid")) {

                $("#divlevel2data").data("kendoGrid").destroy();
                $("#divlevel2data").empty();

            }
            var level2detailkendoGrid = $("#divlevel2detail");
            if (level2detailkendoGrid.data("kendoGrid")) {
                $("#divlevel2detail").data("kendoGrid").destroy();
                $("#divlevel2detail").empty();
            }

            break;
        case 2:
            $('#divL1Viewtag').css("display", "block");

            $('#divtoplevel2').css("display", "block");
            $('#divtoplevel3').css("display", "none");

            $('#divlevel2chart').css("display", "block");
            $('#divlevel2data').css("display", "none");
            $('#divlevel2detail').css("display", "none");

            var levelkendogrid = $("#divlevel3data");
            if (levelkendogrid.data("kendoGrid")) {

                $("#divlevel3data").data("kendoGrid").destroy();
                $("#divlevel3data").empty();
            }
            var level3detailskendoGrid = $("#divlevel3detail");
            if (level3detailskendoGrid.data("kendoGrid")) {
                $("#divlevel3detail").data("kendoGrid").destroy();
                $("#divlevel3detail").empty();
            }

            break;
        case 3:
            $('#divL1Viewtag').show();

            $('#divtoplevel3').css("display", "block");
            $('#divtoplevel4').css("display", "none");

            $('#divlevel3chart').css("display", "block");
            $('#divlevel3data').css("display", "none");
            $('#divlevel3details').css("display", "none");

            var level4detailkendoGrid = $("#divlevel4detail");
            if (level4detailkendoGrid.data("kendoGrid")) {
                $("#divlevel4detail").data("kendoGrid").destroy();
                $("#divlevel4detail").empty();
            }

            break;

    }
    $("#exportoexcel").css("display", "none");
    $("#exporttopdf").css("display", "block");
    var ChartSearch = SetParametersByLevel();
    DisplayLevelParameters(ChartSearch);

}
function DisplayLevelParameters(ChartSearch) {

    switch (LevelIdentifier) {
        case 1:
            $("#spanSelParameters1").html("Status by User");

            if ($("#SiteSelector_SelectedHCOIDs").val().length > 0)
                $("#spanSelParameters2").html("HCOID: " + $("#SiteSelector_SelectedHCOIDs").val());
            else
                $("#spanSelParameters2").html("HCOID: " + ChartSearch.SelectedSiteHCOIDs);

            $("#spanSelParameters3").html("");
            $("#spanSelParameters4").html("Chapter: " + ChartSearch.shortChaptersShow);
            $("#spanSelParameters5").html("Standard: " + ChartSearch.SelectedStandardNames);
            $("#spanSelParameters6").html("Assignment Type: " + ChartSearch.SelectedScoreTypeName);
            $("#spanSelParameters7").html("Score Value: " + ChartSearch.ScoreValueNameList);
            $("#spanSelParameters8").html("Assigned To: " + ChartSearch.SelectedAssignedToNames);

            break;
        case 2:
            $("#spanSelParameters1").html("Status by Chapter");
            $("#spanSelParameters2").html("HCOID: " + ChartSearch.SelectedSiteHCOIDs);
            $("#spanSelParameters3").html("Program: " + SelectedProgramName);

            $("#spanSelParameters4").html("Chapter: " + ChartSearch.shortChaptersShow);
            $("#spanSelParameters5").html("Standard: " + ChartSearch.SelectedStandardNames);
            $("#spanSelParameters6").html("Assignment Type: " + ChartSearch.SelectedScoreTypeName);
            $("#spanSelParameters7").html("Score Value: " + ChartSearch.ScoreValueNameList);
            $("#spanSelParameters8").html("Assigned To: " + SelectedAssignedToName);

            break;
        case 3:

            $("#spanSelParameters1").html("Status by Standard");
            $("#spanSelParameters2").html("HCOID: " + ChartSearch.SelectedSiteHCOIDs);
            $("#spanSelParameters3").html("Program: " + SelectedProgramName);

            $("#spanSelParameters4").html("Chapter: " + SelectedChapterName);
            $("#spanSelParameters5").html("Standard: " + ChartSearch.SelectedStandardNames);
            $("#spanSelParameters6").html("Assignment Type: " + ChartSearch.SelectedScoreTypeName);
            $("#spanSelParameters7").html("Score Value: " + ChartSearch.ScoreValueNameList);
            $("#spanSelParameters8").html("Assigned To: " + SelectedAssignedToName);

            break;
        case 4:

            $("#spanSelParameters1").html("Status by EP");
            $("#spanSelParameters2").html("HCOID: " + ChartSearch.SelectedSiteHCOIDs);
            $("#spanSelParameters3").html("Program: " + SelectedProgramName);

            $("#spanSelParameters4").html("Chapter: " + SelectedChapterName);
            $("#spanSelParameters5").html("Standard: " + SelectedStandardName);
            $("#spanSelParameters6").html("Assignment Type: " + ChartSearch.SelectedScoreTypeName);
            $("#spanSelParameters7").html("Score Value: " + ChartSearch.ScoreValueNameList);
            $("#spanSelParameters8").html("Assigned To: " + SelectedAssignedToName);
            break;
    }

    if (ChartSearch.StartDate != null && ChartSearch.EndDate != null) {
        $("#spanSelParameters9").html("Due Date for " + ChartSearch.StartDate + " - " + ChartSearch.EndDate);
    }
    else if (ChartSearch.StartDate != null && ChartSearch.EndDate == null) {
        $("#spanSelParameters9").html("Due Date since " + ChartSearch.StartDate);
    }
    else if (ChartSearch.StartDate == null && ChartSearch.EndDate != null) {
        $("#spanSelParameters9").html("Due Date through " + ChartSearch.EndDate);
    }
    else {
        $("#spanSelParameters9").html("Due Date: All");
    }

    ScrollToTopCall();
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
function setChartHeight(chartname, arraylength) {

    var heightchart = arraylength * 45;
    if (heightchart < 250)
    { heightchart = 250; }

    $('#' + chartname).css("height", heightchart);
}
function onDB(e) {
    e.sender.options.series[0].labels.visible = function (point) {
        if (point.value < 1) {
            return false
        }
        else { return point.value }
    }
    e.sender.options.series[1].labels.visible = function (point) {
        if (point.value < 1) {
            return false
        }
        else { return point.value }
    }
    e.sender.options.series[2].labels.visible = function (point) {
        if (point.value < 1) {
            return false
        }
        else { return point.value }
    }
}

//************** Level 1 scripts Start *************************
var ScoreCompletePercentage = 'ScoreCompletePercentage';
var ScorePastDueDatePercentage = 'ScorePastDueDatePercentage';
var ScoreNotCompletePercentage = 'ScoreNotCompletePercentage';

function createLevel1Chart() {

    $("#divlevelchart").kendoChart({
        dataSource: Level1dataSourceChart,
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
            type: "bar",
            stack: {
                type: "100%"
            },
            labels: {
                visible: true,
                font: "bold 14px  Arial,Helvetica,sans-serif",
                background: "transparent",
                position: "center",
                template: function (e) {

                    var percentage = 0;
                    var numerator = 0;
                    var totalCount = e.dataItem.EPCount;
                    var seriesFieldName = e.series.field;

                    switch (seriesFieldName) {
                        case ScoreCompletePercentage:
                            percentage = e.dataItem.ScoreCompletePercentage;
                            numerator = e.dataItem.ScoreCompleteCount;
                            break;

                        case ScorePastDueDatePercentage:
                            percentage = e.dataItem.ScorePastDueDatePercentage;
                            numerator = e.dataItem.ScorePastDueDateCount;
                            break;

                        case ScoreNotCompletePercentage:
                            percentage = e.dataItem.ScoreNotCompletePercentage;
                            numerator = e.dataItem.ScoreNotCompleteCount;
                            break;

                    }

                    if (percentage <= 15) {
                        return percentage.toFixed(2) + "%";
                    }
                    else { return percentage.toFixed(2) + "% (" + numerator + "/" + totalCount + ")"; }

                }
            }
        },
        series:
        [{
            field: ScoreCompletePercentage,
            name: "Score Complete",
            color: "#5da5da",
            labels: {
                color: "black"
            }
        }, {
            field: ScorePastDueDatePercentage,
            name: "Score Past Due Date",
            color: "#faa43a",
            labels: {
                color: "black"
            }
        }
        , {
            field: ScoreNotCompletePercentage,
            name: "Score Not Complete",
            color: "#b7b7b7",
            labels: {
                color: "black"
            }
        }

        ],
        categoryAxis: {
            field: "AxisKey",
            value: "AxisKey",
            labels: {
                visual: function (e) {
                    var layout = new kendo.drawing.Layout(e.rect, {
                        justifyContent: "center"
                    });

                    var userNameLabel = new kendo.drawing.Text(e.dataItem.UserName);
                    userNameLabel.options.set("font", "bold 12px sans-serif");

                    layout.append(userNameLabel, new kendo.drawing.Text('(' + e.dataItem.SiteFullName + ')'));

                    layout.reflow();
                    return layout;
                }
            },
            //labels: {
            //    visual: function (e) {
            //        var data = e.dataItem;
            //        var html = $('<table><tr><td style=\"text-align:center\"><b>' + data.UserName + '<b></td></tr><tr><td>(' + data.SiteFullName + ')</td></tr></table>')
            //          .appendTo(document.body);

            //        var visual = new kendo.drawing.Group();
            //        var rect = e.rect;

            //        kendo.drawing.drawDOM(html)
            //                      .done(function (group) {
            //                          html.remove();
            //                          var layout = new kendo.drawing.Layout(rect, {
            //                              justifyContent: "center"
            //                          });
            //                          layout.append(group);
            //                          layout.reflow();
            //                          visual.append(layout);
            //                      });

            //        return visual;
            //    }
            //},
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
            //template: "#= series.name #: #= kendo.format('{0:n2}%',value) #"
            template: function (e) {

                var percentage = 0;
                var numerator = 0;
                var totalCount = e.dataItem.EPCount;
                var seriesFieldName = e.series.field;
                var seriesName = e.series.name;

                switch (seriesFieldName) {
                    case ScoreCompletePercentage:
                        percentage = e.dataItem.ScoreCompletePercentage;
                        numerator = e.dataItem.ScoreCompleteCount;
                        break;

                    case ScorePastDueDatePercentage:
                        percentage = e.dataItem.ScorePastDueDatePercentage;
                        numerator = e.dataItem.ScorePastDueDateCount;
                        break;

                    case ScoreNotCompletePercentage:
                        percentage = e.dataItem.ScoreNotCompletePercentage;
                        numerator = e.dataItem.ScoreNotCompleteCount;
                        break;

                }

                return seriesName + ": " + percentage.toFixed(2) + "% (" + numerator + "/" + totalCount + ")";

            }

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
        resizable: true,
        dataBound: LargeGridResize,
        height: 450,
        pageable: {
            refresh: true,
            pageSizes: [20, 50, 100]
        },
        columns: [

            { field: "SiteID", hidden: "true", menu: false }, { field: "SiteName", width: 175, title: "Site Name" },
             { field: "HCOID", width: 120, title: "HCOID" },
             { field: "Location", width: 130, title: "Location" },
             { field: "UserID", hidden: "true", menu: false }, { field: "UserName", width: 175, title: "Username" },
             { field: "ProgramID", hidden: "true", menu: false, menu: false }, { field: "Program", width: 175, title: "Program" },
             { field: "EPCount", width: 150, title: "EP Count" },
             { field: "ScoreCompleteCount", width: 150, title: "Score Complete Count" },
             { field: "ScoreCompletePercentage", width: 150, title: "Score Complete %" },
             { field: "ScoreNotCompleteCount", width: 170, title: "Score Not Complete Count" },
             { field: "ScoreNotCompletePercentage", width: 150, title: "Score Not Complete %" },
             { field: "ScorePastDueDateCount", width: 170, title: "Score Past Due Date Count" },
             { field: "ScorePastDueDatePercentage", width: 150, title: "Score Past Due Date %" }
        ]

    });

}

function LoadChartParameters() {
    var ChartSearch = SetSearchCriteria(false);

    ChartSearch.ProgramIDs = SelectedProgramID;
    ChartSearch.ProgramNames = SelectedProgramName;
    ChartSearch.IsDuplicateLoadCall = isDuplicateLoadCall;

    DisplayLevelParameters(ChartSearch);

    return ChartSearch;
}

var Level1dataSource = "";
var Level1dataSourceChart = "";
function Level1datasourcecall(preventPaging) {

    preventPaging = preventPaging | false;
    ChartSearch = LoadChartParameters();

    hasExcelData = true;
    noDataAvailable = false;

    if (preventPaging) {
        return new kendo.data.DataSource({
            transport: {
                read: {
                    url: "/Corporate/AssignmentStatusByUser/GetReportData",
                    type: "post",
                    dataType: "json",
                    data: { search: ChartSearch, LevelIdentifier: 1 }
                }
            },
            requestEnd: function (e) {
                Level1datasourcecallRequestEnd(e);
            }
        });
    }
    else {
        return new kendo.data.DataSource({
            transport: {
                read: {
                    url: "/Corporate/AssignmentStatusByUser/GetReportData",
                    type: "post",
                    dataType: "json",
                    data: { search: ChartSearch, LevelIdentifier: 1 }
                }
            },
            requestEnd: function (e) {
                Level1datasourcecallRequestEnd(e);
            },
            pageSize: 20
        });
    }
}

function Level1datasourcecallRequestEnd(e) {
    if (e.response != null) {

        if (e.response.length === 0) {
            closeSlide("btnEmail", "slideEmail");
            hasExcelData = false;
            noDataAvailable = true;

            $('#divError').show();
            $('#divError').html("No data found matching your Criteria and for the selected Program. Change Criteria or Program and try again.");
            EnableDisableEmail(false);

            $('#divlevelchart').hide();
            $('#divleveldata').hide();

        }
        else {
            $('#divError').hide();
            setChartHeight("divlevelchart", e.response.length);

            EnableDisableEmail(true);

            //show screen for Graph or Summary

            var selectedView = GetSelectedViewValue();

            if (selectedView === "L1selectGraph") {
                $('#divlevelchart').show();
            } else if (selectedView === "L1selectData") {
                $('#divleveldata').show();
            }

        }
        closeSlide("btnSearchCriteria", "slideSearch");


    }
    //unBlockElement("divL1tag");
}

function onLevel1SeriesClick(e) {

    EnableDisableChartView(true);
    LevelIdentifier = 2;

    $('#divtoplevel1').css("display", "none");
    $('#divtoplevelProgram').css("display", "none");

    $('#divtoplevel2').css("display", "block");
    $('#divlevel2chart').css("display", "block");
    $('#divlevel2data').css("display", "none");
    $('#divlevel2detail').css("display", "none");
    Level2Load(e.dataItem);

    $("#divpreviouslevel").css("display", "block");

    $("#exportoexcel").css("display", "none");
    $("#exporttopdf").css("display", "block");
}
function onLevel1Click(e) {

    EnableDisableChartView(true);
    $('input:radio[id*="radioL1Graph"]').prop('checked', true);
    LevelIdentifier = 2;
    $('#divtoplevel1').css("display", "none");
    $('#divtoplevelProgram').css("display", "none");
    var data = this.dataItem(this.select());

    if (data != null) {

        $('#divtoplevel2').css("display", "block");
        $('#divlevel2chart').css("display", "block");
        $('#divlevel2data').css("display", "none");
        $('#divlevel2detail').css("display", "none");
        Level2Load(data);

        $("#divpreviouslevel").css("display", "block");

        $("#exportoexcel").css("display", "none");
        $("#exporttopdf").css("display", "block");
    }
}
//************** Level 1 scripts End *************************

//************** Level 2 scripts Start *************************
function createLevel2Chart() {

    $("#divlevel2chart").kendoChart({
        dataSource: Level2dataSource,
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
            type: "bar",
            stack: {
                type: "100%"
            },
            labels: {
                visible: true,
                font: "bold 14px  Arial,Helvetica,sans-serif",
                background: "transparent",
                position: "center",
                template: function (e) {

                    var percentage = 0;
                    var numerator = 0;
                    var totalCount = e.dataItem.EPCount;
                    var seriesFieldName = e.series.field;

                    switch (seriesFieldName) {
                        case ScoreCompletePercentage:
                            percentage = e.dataItem.ScoreCompletePercentage;
                            numerator = e.dataItem.ScoreCompleteCount;
                            break;

                        case ScorePastDueDatePercentage:
                            percentage = e.dataItem.ScorePastDueDatePercentage;
                            numerator = e.dataItem.ScorePastDueDateCount;
                            break;

                        case ScoreNotCompletePercentage:
                            percentage = e.dataItem.ScoreNotCompletePercentage;
                            numerator = e.dataItem.ScoreNotCompleteCount;
                            break;

                    }

                    if (percentage <= 15) {
                        return percentage.toFixed(2) + "%";
                    }
                    else { return percentage.toFixed(2) + "% (" + numerator + "/" + totalCount + ")"; }

                }
            }
        },
        series:
        [{
            field: ScoreCompletePercentage,
            name: "Score Complete",
            color: "#5da5da",
            labels: {
                color: "black"

            }
        }, {
            field: ScorePastDueDatePercentage,
            name: "Score Past Due Date",
            color: "#faa43a",
            labels: {
                color: "black",
            }
        }
        , {
            field: ScoreNotCompletePercentage,
            name: "Score Not Complete",
            color: "#b7b7b7",
            labels: {
                color: "black"
            }
        }

        ],
        categoryAxis: {
            field: "ChapterCode",
            value: "ChapterID",
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
            //template: "#= series.name #: #= kendo.format('{0:n2}%',value) #"
            template: function (e) {

                var percentage = 0;
                var numerator = 0;
                var totalCount = e.dataItem.EPCount;
                var seriesFieldName = e.series.field;
                var seriesName = e.series.name;

                switch (seriesFieldName) {
                    case ScoreCompletePercentage:
                        percentage = e.dataItem.ScoreCompletePercentage;
                        numerator = e.dataItem.ScoreCompleteCount;
                        break;

                    case ScorePastDueDatePercentage:
                        percentage = e.dataItem.ScorePastDueDatePercentage;
                        numerator = e.dataItem.ScorePastDueDateCount;
                        break;

                    case ScoreNotCompletePercentage:
                        percentage = e.dataItem.ScoreNotCompletePercentage;
                        numerator = e.dataItem.ScoreNotCompleteCount;
                        break;

                }

                return seriesName + ": " + percentage.toFixed(2) + "% (" + numerator + "/" + totalCount + ")";

            }

        },
        seriesClick: onLevel2SeriesClick
    });

}
function createLevel2Data() {

    $("#divlevel2data").kendoGrid({
        dataSource: Level2dataSource,
        change: onLevel2Click,
        excel: { allPages: true },
        excelExport: ERexcelExport,
        selectable: true,
        sortable: true,
        resizable: true,
        dataBound: LargeGridResize,
        height: 450,
        pageable: {
            refresh: true,
            pageSizes: [20, 50, 100]
        },
        columns: [

             { field: "SiteID", hidden: "true", menu: false }, { field: "SiteName", width: 175, title: "Site Name" },
             { field: "HCOID", width: 120, title: "HCOID" },
             { field: "Location", width: 130, title: "Location" },
             { field: "ProgramID", hidden: "true", menu: false }, { field: "Program", width: 175, title: "Program" },
             { field: "ChapterID", hidden: "true", menu: false }, { field: "ChapterCode", width: 175, title: "Chapter" },
             { field: "EPCount", width: 150, title: "EP Count" },
             { field: "ScoreCompleteCount", width: 150, title: "Score Complete Count" },
             { field: "ScoreCompletePercentage", width: 150, title: "Score Complete %" },
             { field: "ScoreNotCompleteCount", width: 170, title: "Score Not Complete Count" },
             { field: "ScoreNotCompletePercentage", width: 150, title: "Score Not Complete %" },
             { field: "ScorePastDueDateCount", width: 170, title: "Score Past Due Date Count" },
             { field: "ScorePastDueDatePercentage", width: 150, title: "Score Past Due Date %" }
        ]

    });
}

function Level2Load(Level1ClickedRowData) {

    //blockElement("divL1tag");

    SelectedSiteID = Level1ClickedRowData.SiteID;
    SelectedHCOName = Level1ClickedRowData.ReportHCOID;
    SelectedProgramID = Level1ClickedRowData.ProgramID;
    SelectedProgramName = Level1ClickedRowData.Program;
    SelectedAssignedTo = Level1ClickedRowData.UserID;
    SelectedAssignedToName = GetReportHeaderUserNameFormat(Level1ClickedRowData.UserName);

    Level2dataSource = Level2datasourcecall();
    Level2dataSource.sync();
    createLevel2Chart();

}

var Level2dataSource = "";
var Level3dataSourceChart = "";
function Level2datasourcecall(preventPaging) {

    preventPaging = preventPaging | false;
    var ChartSearch = SetParametersByLevel();
    ChartSearch.IsDuplicateLoadCall = isDuplicateLoadCall;
    DisplayLevelParameters(ChartSearch);

    if (preventPaging) {
        return new kendo.data.DataSource({
            transport: {
                read: {
                    url: "/Corporate/AssignmentStatusByUser/GetReportData",
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
                    url: "/Corporate/AssignmentStatusByUser/GetReportData",
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
        setChartHeight("divlevel2chart", e.response.length);
    }
    EnableDisableChartView(false);
    //unBlockElement("divL1tag");
}

function onLevel2SeriesClick(e) {
    EnableDisableChartView(true);
    LevelIdentifier = 3;
    $('#divtoplevel2').css("display", "none");

    $('#divtoplevel3').css("display", "block");
    $('#divlevel3chart').css("display", "block");
    $('#divlevel3data').css("display", "none");
    $('#divlevel3detail').css("display", "none");
    Level3Load(e.dataItem);

    $("#divpreviouslevel").css("display", "block");

    $("#exportoexcel").css("display", "none");
    $("#exporttopdf").css("display", "block");
}
function onLevel2Click(e) {
    EnableDisableChartView(true);
    $('input:radio[id*="radioL1Graph"]').prop('checked', true);
    LevelIdentifier = 3;
    $('#divtoplevel2').css("display", "none");
    var data = this.dataItem(this.select());

    if (data != null) {

        $('#divtoplevel3').css("display", "block");
        $('#divlevel3chart').css("display", "block");
        $('#divlevel3data').css("display", "none");
        $('#divlevel3detail').css("display", "none");
        Level3Load(data);

        $("#divpreviouslevel").css("display", "block");

        $("#exportoexcel").css("display", "none");
        $("#exporttopdf").css("display", "block");
    }
}
//************** Level 2 scripts End ****************************

//************** Level 3 scripts Start *************************
function createLevel3Chart() {

    $("#divlevel3chart").kendoChart({
        dataSource: Level3dataSourceChart,
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
            type: "bar",
            stack: {
                type: "100%"
            },
            labels: {
                visible: true,
                font: "bold 14px  Arial,Helvetica,sans-serif",
                background: "transparent",
                position: "center",
                template: function (e) {

                    var percentage = 0;
                    var numerator = 0;
                    var totalCount = e.dataItem.EPCount;
                    var seriesFieldName = e.series.field;

                    switch (seriesFieldName) {
                        case ScoreCompletePercentage:
                            percentage = e.dataItem.ScoreCompletePercentage;
                            numerator = e.dataItem.ScoreCompleteCount;
                            break;

                        case ScorePastDueDatePercentage:
                            percentage = e.dataItem.ScorePastDueDatePercentage;
                            numerator = e.dataItem.ScorePastDueDateCount;
                            break;

                        case ScoreNotCompletePercentage:
                            percentage = e.dataItem.ScoreNotCompletePercentage;
                            numerator = e.dataItem.ScoreNotCompleteCount;
                            break;

                    }

                    if (percentage <= 15) {
                        return percentage.toFixed(2) + "%";
                    }
                    else { return percentage.toFixed(2) + "% (" + numerator + "/" + totalCount + ")"; }

                }
            }
        },
        series:
        [{
            field: ScoreCompletePercentage,
            name: "Score Complete",
            color: "#5da5da",
            labels: {
                color: "black"

            }
        }, {
            field: ScorePastDueDatePercentage,
            name: "Score Past Due Date",
            color: "#faa43a",
            labels: {
                color: "black",
            }
        }
        , {
            field: ScoreNotCompletePercentage,
            name: "Score Not Complete",
            color: "#b7b7b7",
            labels: {
                color: "black"
            }
        }

        ],
        categoryAxis: {
            field: "StandardLabel",
            value: "StandardID",
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
            //template: "#= series.name #: #= kendo.format('{0:n2}%',value) #"
            template: function (e) {

                var percentage = 0;
                var numerator = 0;
                var totalCount = e.dataItem.EPCount;
                var seriesFieldName = e.series.field;
                var seriesName = e.series.name;

                switch (seriesFieldName) {
                    case ScoreCompletePercentage:
                        percentage = e.dataItem.ScoreCompletePercentage;
                        numerator = e.dataItem.ScoreCompleteCount;
                        break;

                    case ScorePastDueDatePercentage:
                        percentage = e.dataItem.ScorePastDueDatePercentage;
                        numerator = e.dataItem.ScorePastDueDateCount;
                        break;

                    case ScoreNotCompletePercentage:
                        percentage = e.dataItem.ScoreNotCompletePercentage;
                        numerator = e.dataItem.ScoreNotCompleteCount;
                        break;

                }

                return seriesName + ": " + percentage.toFixed(2) + "% (" + numerator + "/" + totalCount + ")";

            }

        },
        seriesClick: onLevel3SeriesClick
    });

}
function createLevel3Data() {

    $("#divlevel3data").kendoGrid({
        dataSource: Level3dataSource,
        change: onLevel3Click,
        excel: { allPages: true },
        excelExport: ERexcelExport,
        selectable: true,
        sortable: true,
        resizable: true,
        dataBound: LargeGridResize,
        height: 450,
        pageable: {
            refresh: true,
            pageSizes: [20, 50, 100]
        },
        columns: [

             { field: "SiteID", hidden: "true", menu: false }, { field: "SiteName", width: 175, title: "Site Name" },
             { field: "HCOID", width: 120, title: "HCOID" },
             { field: "Location", width: 130, title: "Location" },
             { field: "ProgramID", hidden: "true", menu: false }, { field: "Program", width: 175, title: "Program" },
             { field: "StandardID", hidden: "true", menu: false }, { field: "StandardLabel", width: 175, title: "Standard" },
             { field: "EPCount", width: 150, title: "EP Count" },
             { field: "ScoreCompleteCount", width: 150, title: "Score Complete Count" },
             { field: "ScoreCompletePercentage", width: 150, title: "Score Complete %" },
             { field: "ScoreNotCompleteCount", width: 170, title: "Score Not Complete Count" },
             { field: "ScoreNotCompletePercentage", width: 150, title: "Score Not Complete %" },
             { field: "ScorePastDueDateCount", width: 170, title: "Score Past Due Date Count" },
             { field: "ScorePastDueDatePercentage", width: 150, title: "Score Past Due Date %" }
        ]

    });
}

function Level3Load(Level2ClickedRowData) {

    //blockElement("divL1tag");

    SelectedSiteID = Level2ClickedRowData.SiteID;
    SelectedProgramID = Level2ClickedRowData.ProgramID;
    SelectedProgramName = Level2ClickedRowData.Program;
    SelectedChapteID = Level2ClickedRowData.ChapterID;
    SelectedChapterName = Level2ClickedRowData.ChapterCode;
    SelectedAssignedTo = Level2ClickedRowData.UserID;
    SelectedAssignedToName = GetReportHeaderUserNameFormat(Level2ClickedRowData.UserName);

    isDuplicateLoadCall = false;
    //Level3dataSource = Level3datasourcecall();
    //Level3dataSource.pageSize(20);
    //Level3dataSource.sync();

    //isDuplicateLoadCall = true;
    Level3dataSourceChart = Level3datasourcecall(true);
    Level3dataSourceChart.sync();

    //isDuplicateLoadCall = false;
    Level3dataSource = "";
    createLevel3Chart();

}

var Level3dataSource = "";
var Level3dataSourceChart = "";
function Level3datasourcecall(preventPaging) {

    preventPaging = preventPaging | false;
    var ChartSearch = SetParametersByLevel();
    ChartSearch.IsDuplicateLoadCall = isDuplicateLoadCall;
    DisplayLevelParameters(ChartSearch);


    if (preventPaging) {
        return new kendo.data.DataSource({
            transport: {
                read: {
                    url: "/Corporate/AssignmentStatusByUser/GetReportData",
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
                    url: "/Corporate/AssignmentStatusByUser/GetReportData",
                    type: "post",
                    dataType: "json",
                    data: {
                        search: ChartSearch, LevelIdentifier: 3
                    }
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
        setChartHeight("divlevel3chart", e.response.length);
    }
    EnableDisableChartView(false);
    //unBlockElement("divL1tag");
}

function onLevel3SeriesClick(e) {

    EnableDisableChartView(true);
    LevelIdentifier = 4;
    $('#divtoplevel3').css("display", "none");

    $('#divtoplevel4').css("display", "block");
    $('#divlevel4detail').css("display", "block");
    Level4Load(e.dataItem);

    $("#exportoexcel").css("display", "block");
    $("#exporttopdf").css("display", "none");
}
function onLevel3Click(e) {

    EnableDisableChartView(true);
    LevelIdentifier = 4;
    $('#divtoplevel3').css("display", "none");
    var data = this.dataItem(this.select());

    if (data != null) {

        $('#divtoplevel4').css("display", "block");
        $('#divlevel4detail').css("display", "block");
        Level4Load(data);

        $("#divpreviouslevel").css("display", "block");

        $("#exportoexcel").css("display", "block");
        $("#exporttopdf").css("display", "none");
    }
}
//************** Level 3 scripts End ****************************

//************** Level 4 scripts Start *************************
function Level4Load(Level3ClickedRowData) {

    //blockElement("divL1tag");
    $('input:radio[id*="radioL1Detail"]').prop('checked', true);
    $('#divL1Viewtag').hide();
    SelectedSiteID = Level3ClickedRowData.SiteID;
    SelectedProgramID = Level3ClickedRowData.ProgramID;
    SelectedProgramName = Level3ClickedRowData.Program;
    SelectedChapteID = Level3ClickedRowData.ChapterID;
    SelectedChapterName = Level3ClickedRowData.ChapterCode;
    SelectedStandardID = Level3ClickedRowData.StandardID;
    SelectedStandardName = Level3ClickedRowData.StandardLabel;
    SelectedAssignedTo = Level3ClickedRowData.UserID;
    SelectedAssignedToName = GetReportHeaderUserNameFormat(Level3ClickedRowData.UserName);

    var Level4detailSource = detailsourcecall();
    createLevelDetail(Level4detailSource);
}
//************** Level 4 scripts End ****************************

//************** Detail View scripts Start *************************
function createLevelDetail(LeveldetailSource) {

    var detailGridName = '';

    switch (LevelIdentifier) {
        case 1:
            detailGridName = '#divleveldetail';
            break;
        case 2:
            detailGridName = '#divlevel2detail';
            break;
        case 3:
            detailGridName = '#divlevel3detail';
            break;
        case 4:
            detailGridName = '#divlevel4detail';
            break;

    }

    $(detailGridName).kendoGrid({
        dataSource: LeveldetailSource,
        excel: { allPages: true },
        excelExport: ERexcelExport,
        selectable: false,
        sortable: true,
        resizable: true,
        dataBound: LargeGridResize,
        height: 450,
        clickable: false,
        reorderable: true,
        resizable: true,
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
        pageable: {
            refresh: true,
            pageSizes: [20, 50, 100]
        },
        columns: [

            { field: "StandardLabel", width: 150, title: "Standard" },
            { field: "EPLabel", width: 50, title: "EP" },
            { field: "EPText", width: 300, title: "EP Description", encoded: false },
            { command: { text: "View Documentation", click: showDocuments }, title: "Documentation", width: "180px" },
            { field: "ScoreType", width: 150, title: "Assignment Type" },
            { field: "AssignedBy", width: 150, title: "Assigned By" },
            { field: "AssignedTo", width: 150, title: "Assigned To" },
            { field: "ScoredBy", width: 150, title: "Scored By" },
            { field: "ScoreValue", width: 140, title: "Score Value" },
            { field: "Likelihood", width: 150, title: "Likelihood to Harm" },
            { field: "Scope", width: 150, title: "Scope" },
            {
                field: "ScoreDate", width: 150, title: "Score Date",
                template: "#= (ScoreDate == null) ? '' : kendo.toString(kendo.parseDate(ScoreDate), 'MM/dd/yyyy') #"
            },
            {
                field: "DueDate", width: 150, title: "Due Date",
                template: "#= (DueDate == null) ? '' : kendo.toString(kendo.parseDate(DueDate), 'MM/dd/yyyy') #"
            },
            { field: "Findings", width: 160, title: "Organizational Findings", hidden: "true", menu: false },
            { field: "POA", width: 150, title: "Plan of Action", hidden: "true", menu: false },
            { field: "MOS", width: 150, title: "Sustainment Plan", hidden: "true", menu: false },
            { field: "OrgNotes", width: 150, title: "Internal Org Notes", hidden: "true", menu: false },
            { field: "CompliantDate", width: 150, title: "POA Compliant by Date", hidden: "true", menu: false, },
            { field: "DocumentList", width: 150, title: "Linked Documents", hidden: "true", menu: false },
            { field: "SiteID", hidden: "true", menu: false }, { field: "SiteName", width: 175, title: "Site Name" },
            { field: "HCOID", width: 120, title: "HCOID" },
            { field: "Location", width: 130, title: "Location" },
            { field: "ProgramID", hidden: "true", menu: false }, { field: "Program", width: 175, title: "Program" },
            { field: "ChapterID", hidden: "true", menu: false }, { field: "Chapter", width: 175, title: "Chapter" }
        ]

    });

}
function detailsourcecall() {

    EnableDisableChartView(true);
    //blockElement("divL1tag");

    var ChartSearch = SetParametersByLevel();
    hasExcelData = true;
    noDataAvailable = false;

    //this will be called from Level 3 user click.
    switch (LevelIdentifier) {
        case 4:
            DisplayLevelParameters(ChartSearch);
            break;
    }

    return new kendo.data.DataSource({
        transport: {
            read: {
                url: "/Corporate/AssignmentStatusByUser/GetReportDetailData",
                type: "post",
                dataType: "json",
                data: { search: ChartSearch, LevelIdentifier: LevelIdentifier }
            }
        },
        pageSize: 20,
        requestEnd: function (e) {
            if (e.response != null) {

                if (e.response.length === 0) {
                    closeSlide("btnEmail", "slideEmail");
                    hasExcelData = false;
                    noDataAvailable = true;
                    $('#divError').show();
                    $('#divError').html("No data found matching your Criteria and for the selected Program. Change Criteria or Program and try again.");
                    EnableDisableEmail(false);
                    $("#divleveldetail").hide();
                }
                else {
                    $('#divError').hide();
                    EnableDisableEmail(true);
                    if (LevelIdentifier === 1) {
                        $("#divleveldetail").show();

                        var assignedToColumnPosition = 6;
                        var assignedToColumnOrder = 0;
                        
                        var grid = $("#divleveldetail").data("kendoGrid");
                        grid.reorderColumn(assignedToColumnOrder, grid.columns[assignedToColumnPosition]);
                    }
                }
                closeSlide("btnSearchCriteria", "slideSearch");
            }
            EnableDisableChartView(false);
            //unBlockElement("divL1tag");
        }
    });
}
//************** Detail View scripts End ***************************

// Common scripts start 
function ERPDFExportByLevel() {

    var dataSource = "";

    ExportReportName = "Assignment Status";

    switch (LevelIdentifier) {
        case 1:
            ExportReportName += " by User";
            var levelkendogrid = $("#divleveldata");
            if (levelkendogrid.data("kendoGrid")) {
                dataSource = $("#divleveldata").data("kendoGrid").dataSource;
            }
            break;
        case 2:
            ExportReportName += " by Chapter";
            var levelkendogrid = $("#divlevel2data");
            if (levelkendogrid.data("kendoGrid")) {
                dataSource = $("#divlevel2data").data("kendoGrid").dataSource;
            }

            break;
        case 3:
            ExportReportName += " by Standard";
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
            //  sorts[0].
            dataSortBy = sorts[0].field.toString();
            dataSortOrder = sorts[0].dir.toString();
        }
    }

    if (fromemail) {
        if (hasExcelData) {
            $.ajax({
                type: "Post",
                url: "/Corporate/AssignmentStatusByUser/CreateERSessionCriteria",
                contentType: "application/json",
                data: JSON.stringify({ ERsearch: SetParametersByLevel() })

            }).done(function (e) {
                $(function () {
                    $.post('/Corporate/AssignmentStatusByUser/SendERPDFEmail',
                      { ExcelGridName: ExportReportName, email: $.parseJSON(sessionStorage.getItem('searchsetemailsession')), ERReportName: "AssignmentStatusByUser", SortBy: dataSortBy, SortOrder: dataSortOrder }, function (data) {
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
            url: "/Corporate/AssignmentStatusByUser/CreateERSessionCriteria",
            contentType: "application/json",
            data: JSON.stringify({ ERsearch: SetParametersByLevel() })

        }).done(function (e) {


            $(function () {
                $.post(
                    '/Corporate/AssignmentStatusByUser/createErPdf',
                  { ExcelGridName: ExportReportName, ERReportName: "AssignmentStatusByUser", SortBy: dataSortBy, SortOrder: dataSortOrder }, function (data) {

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


    ExportReportName = "Assignment Status";

    var selectedView = GetSelectedViewValue();
    var isDetailView = false;
    var detailViewID = '';

    switch (LevelIdentifier) {
        case 1:
            ExportReportName += " by User";
            if (selectedView === "L1selectData") {
                $("#divleveldata").getKendoGrid().saveAsExcel();
            }
            else {
                isDetailView = true;
                detailViewID = "#divleveldetail";
            }

            break;
        case 2:
            ExportReportName += " by Chapter";
            if (selectedView === "L1selectData") {
                $("#divlevel2data").getKendoGrid().saveAsExcel();
            }
            else {
                isDetailView = true;
                detailViewID = "#divlevel2detail";
            }

            break;
        case 3:
            ExportReportName += " by Standard";
            if (selectedView === "L1selectData") {
                $("#divlevel3data").getKendoGrid().saveAsExcel();
            }
            else {
                isDetailView = true;
                detailViewID = "#divlevel3detail";
            }

            break;
        case 4:
            ExportReportName += " by EP";
            isDetailView = true;
            detailViewID = "#divlevel4detail";
            break;

    }

    if (isDetailView) {
        var epGrid = $(detailViewID).getKendoGrid();
        
        var columns = epGrid.columns;
        var colDocument = columns.filter(function (v, i) { return columns[i].title == 'Documentation'; });

        var isDocumentColumnVisible = !colDocument[0].hidden;

        ShowHideDocumentationColumns(detailViewID, isDocumentColumnVisible);
        $(detailViewID).getKendoGrid().saveAsExcel();
        ShowHideDocumentationColumns(detailViewID, false);

    }
}

function ShowHideDocumentationColumns(divDetailsGrid, isVisible) {

    if (isVisible) {

        $(divDetailsGrid).getKendoGrid().showColumn("Findings");
        $(divDetailsGrid).getKendoGrid().showColumn("OrgNotes");
        $(divDetailsGrid).getKendoGrid().showColumn("POA");
        $(divDetailsGrid).getKendoGrid().showColumn("DocumentList");
        $(divDetailsGrid).getKendoGrid().showColumn("CompliantDate");
        $(divDetailsGrid).getKendoGrid().showColumn("MOS");

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

function SetParametersByLevel() {
    var ChartSearch = SetSearchCriteria(true);

    ChartSearch.ReportTitle = $('#txtScheduledReportName').val();
    ChartSearch.SelectedSiteHCOIDs = $("#SiteSelector_SelectedHCOIDs").val();
    ChartSearch.LevelIdentifier = LevelIdentifier;

    //update the level paramater to get relevant data.
    switch (LevelIdentifier) {
        case 1:
            ChartSearch.ProgramIDs = SelectedProgramID;
            ChartSearch.ProgramNames = SelectedProgramName;
            break;
        case 2:
            ChartSearch.SelectedSiteIDs = SelectedSiteID;
            ChartSearch.SelectedSiteHCOIDs = SelectedHCOName;
            ChartSearch.ProgramIDs = SelectedProgramID;
            ChartSearch.ProgramNames = SelectedProgramName;
            ChartSearch.SelectedAssignedToIDs = SelectedAssignedTo;
            ChartSearch.SelectedAssignedToNames = SelectedAssignedToName;
            break;
        case 3:
            ChartSearch.SelectedSiteIDs = SelectedSiteID;
            ChartSearch.SelectedSiteHCOIDs = SelectedHCOName;
            ChartSearch.ProgramIDs = SelectedProgramID;
            ChartSearch.ProgramNames = SelectedProgramName;
            ChartSearch.SelectedChapterIDs = SelectedChapteID;
            ChartSearch.SelectedChapterNames = SelectedChapterName;
            ChartSearch.SelectedAssignedToIDs = SelectedAssignedTo;
            ChartSearch.SelectedAssignedToNames = SelectedAssignedToName;
            break;
        case 4:

            ChartSearch.SelectedSiteIDs = SelectedSiteID;
            ChartSearch.SelectedSiteHCOIDs = SelectedHCOName;
            ChartSearch.ProgramIDs = SelectedProgramID;
            ChartSearch.ProgramNames = SelectedProgramName;
            ChartSearch.SelectedChapterIDs = SelectedChapteID;
            ChartSearch.SelectedChapterNames = SelectedChapterName;
            ChartSearch.SelectedStandardIDs = SelectedStandardID;
            ChartSearch.SelectedStandardNames = SelectedStandardName;
            ChartSearch.SelectedAssignedToIDs = SelectedAssignedTo;
            ChartSearch.SelectedAssignedToNames = SelectedAssignedToName;

            break;
    }

    return ChartSearch;

}
function AddExportParameters() {


    var ChartSearch = SetParametersByLevel();

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
                    { value: "Assignment Type" },
                    { value: ChartSearch.SelectedScoreTypeName }
                    ]
                },
                {
                    cells: [
                    { value: "Score Value" },
                    { value: ChartSearch.ScoreValueNameList }
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
                 { value: "Only Include FSA EPs" },
                 { value: ChartSearch.IncludeFSAEPs == true ? "True" : "False" }
                 ]
             },
             {
                 cells: [
                 { value: "Documentation required" },
                 { value: ChartSearch.IncludeDocumentationRequired == true ? "True" : "False" }
                 ]
             },
              {
                  cells: [
                  { value: "New/Changed EPs" },
                  { value: ChartSearch.IncludeNewChangedEPs == true ? "True" : "False" }
                  ]
              }

        ]
    }
    return stringvalue;

}

//Save the selected parameters
function SaveToMyReports(deleteReport) {

    var isPageValid = ValidateScreen();

    if (!isPageValid)
        return false;

    var searchCriteria = GetParameterValuesFromScreen();

    var parameterSet = [
        { SelectedSites: ERSites.getSelectedSites() },
        { ReportTitle: searchCriteria.ReportTitle },
        { ReportType: searchCriteria.ReportType },
        { ProgramServices: searchCriteria.ProgramIDs },
        { ChapterIDs: searchCriteria.SelectedChapterIDs },
        { StandardIDs: searchCriteria.SelectedStandardIDs },
        { EPScoreType: searchCriteria.SelectedScoreType },
        { EPAssignedTo: searchCriteria.SelectedAssignedToIDs },
        { IncludeFSAcheckbox: searchCriteria.IncludeFSAEPs },
        { EPDocRequiredCheckbox: searchCriteria.IncludeDocumentationRequired },
        { EPNewChangedCheckbox: searchCriteria.IncludeNewChangedEPs }
    ];

    //Include Score Value
    if (searchCriteria.ScoreValueList.indexOf("2") > -1)
        parameterSet.push({ SatisfactoryCheckbox: true });
    else
        parameterSet.push({ SatisfactoryCheckbox: false });

    if (searchCriteria.ScoreValueList.indexOf("0") > -1)
        parameterSet.push({ InsufficientCheckbox: true });
    else
        parameterSet.push({ InsufficientCheckbox: false });

    if (searchCriteria.ScoreValueList.indexOf("6") > -1)
        parameterSet.push({ NotApplicableCheckbox: true });
    else
        parameterSet.push({ NotApplicableCheckbox: false });

    if (searchCriteria.ScoreValueList.indexOf("99") > -1)
        parameterSet.push({ NotScoredCheckbox: true });
    else
        parameterSet.push({ NotScoredCheckbox: false });

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
    //setting this flag, so as to not update the related dropdowns 
    //and to manually load it, so as to prevent the duplicate call
    isSavedReportLoading = true;

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


    var reportType = getParamValue(params.ReportParameters, "ReportType");

    if (reportType == null)
        reportType = 'Graph';

    $('input[name=ReportTypeChange][value=' + reportType + ']').prop('checked', true);

    OnReportTypeChange();
    $('input[name=grpScoreType][value="' + getParamValue(params.ReportParameters, "EPScoreType") + '"]').prop('checked', true);

    var SatisfactoryCheckbox = getParamValue(params.ReportParameters, "SatisfactoryCheckbox");
    var InsufficientCheckbox = getParamValue(params.ReportParameters, "InsufficientCheckbox");
    var NotApplicableCheckbox = getParamValue(params.ReportParameters, "NotApplicableCheckbox");
    var NotScoredCheckbox = getParamValue(params.ReportParameters, "NotScoredCheckbox");

    if (SatisfactoryCheckbox == null)
        SatisfactoryCheckbox = 'True';

    if (InsufficientCheckbox == null)
        InsufficientCheckbox = 'True';

    if (NotApplicableCheckbox == null)
        NotApplicableCheckbox = 'True';

    if (NotScoredCheckbox == null)
        NotScoredCheckbox = 'True';

    CheckboxChecked(SatisfactoryCheckbox, 'SatisfactoryCheckbox');
    CheckboxChecked(InsufficientCheckbox, 'InsufficientCheckbox');
    CheckboxChecked(NotApplicableCheckbox, 'NotApplicableCheckbox');
    CheckboxChecked(NotScoredCheckbox, 'NotScoredCheckbox');

    MultiSiteAssignedTo();
    if (getParamValue(params.ReportParameters, "EPAssignedTo") != null) {
        $("#AssignmentAssignedTo").data("kendoMultiSelect").value(getParamValue(params.ReportParameters, "EPAssignedTo").split(","));
    }

    CheckboxChecked(getParamValue(params.ReportParameters, "IncludeFSAcheckbox"), 'chkOnlyIncludeFSAEPs');
    CheckboxChecked(getParamValue(params.ReportParameters, "EPDocRequiredCheckbox"), 'chkDocumentationRequired');
    CheckboxChecked(getParamValue(params.ReportParameters, "EPNewChangedCheckbox"), 'chkNewChangedEPs');

    SetSavedObservationDate(params.ReportParameters);
    SetERRecurrenceParameters(params);
    TriggerActionByReportMode(params.ReportMode);

    isSavedReportLoading = false;
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

            SelectedProgramID = $("#hdnSelectedProgramID").val();
            SelectedProgramName = $("#hdnSelectedProgramName").val();

            onProgramMenuSelect(SelectedProgramID, SelectedProgramName);

        }
    });
}

function onProgramMenuSelect(programId, programName) {

    SelectedProgramID = programId;
    SelectedProgramName = programName;
    hasProgramChanged = true;
    OnProgramChangeLoadData();
}

function OnProgramChangeLoadData() {

    if (hasProgramChanged) {

        hasProgramChanged = false;
        //clear the data
        var leveldatakendoGrid = $("#divleveldata");
        if (leveldatakendoGrid.data("kendoGrid")) {
            $("#divleveldata").data("kendoGrid").destroy();
            $("#divleveldata").empty();
        }

        var leveldetailkendoGrid = $("#divleveldetail");
        if (leveldetailkendoGrid.data("kendoGrid")) {
            $("#divleveldetail").data("kendoGrid").destroy();
            $("#divleveldetail").empty();
        }

        if ($('input[name=ReportTypeChange]:checked').val() == 'Graph') {

            isDuplicateLoadCall = false;
            Level1dataSourceChart = Level1datasourcecall(true);
            Level1dataSourceChart.sync();

            Level1dataSource = "";
            //create the chart to get the latest data updated.
            createLevel1Chart();
        }
        else {
            //blockElement("divL1tag");
            $('input:radio[id*="radioL1Detail"]').prop('checked', true);
            $('#divL1Viewtag').hide();
            LoadChartParameters();

        }

    }

    OnRadioButtonViewChange();

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
    dataItem.ProgramCode = dataItem.Program.toString().trim();
    wnd.content(detailsTemplate(dataItem));
    wnd.center().open();
}

function OnPrintDocumentation() {

    var title = document.title;
    document.title = 'Assignemnt Status by User Report - Documentation';
    window.print();
    document.title = title;

}

function OnReportTypeChange() {

    var reportType = $('input[name=ReportTypeChange]:checked').val();

    if (reportType == "Graph") {
        $('#rdBoth').attr("disabled", 'disabled');
        $("#rdPreliminary").prop("checked", true);

        if (!isSavedReportLoading)
            MultiSiteAssignedTo();
    }
    else {
        $('#rdBoth').removeAttr("disabled");
    }

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
}