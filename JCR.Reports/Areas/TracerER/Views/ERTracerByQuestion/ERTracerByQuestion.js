loadparameters = "TracerByQuesion";
ExcelView = true;
exportparameters = true;
var defaultValue = "-1";
var defaultText = "All";
var LevelIdentifier = 1;
var SelectedProgramName = "Hospital";
var SelectedProgramID = 2;
var SelectedHCOName = "";
var SelectedSiteID = 0;
var SelectedTracerCustomID = 0;
var SelectedTracerCustomName = "";
var SelectedQuestionNo = 0;
var SelectedQuestionText = "";
var SelectedQuestionID = 0;
var ResetFilters = $("#GetResetLink").val();
var groupbySite = false;
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

    var DepartmentListIDs = [];
    var DepartmentListNames = [];
    $('#DepartmentList :selected').each(function (i, selected) {
        DepartmentListIDs[i] = $(selected).val();
        DepartmentListNames[i] = $(selected).text();
    });
    if (DepartmentListIDs.length <= 0) {
        DepartmentListIDs.push(defaultValue);
        DepartmentListNames.push(defaultText);
    }

    var searchset =
{
    SelectedSiteIDs: $("#SiteSelector_SelectedSiteIDs").val(),
    ProgramIDs: ProgramIDs.toString(),
    ProgramNames: ProgramNames.toString().replace(/,/g, ", "),
    TracerListIDs: TracerListIDs.toString(),
    TracerListNames: ConvertToAllOrCSV(TracerListNames),
    DepartmentListIDs: DepartmentListIDs.toString(),
    DepartmentListNames: ConvertToAllOrCSV(DepartmentListNames),
    TracerQuestionIDs: '',
    IncludeFSA: $('#IncludeFSAcheckbox').is(':checked'),
    StartDate: kendo.toString($("#ObsstartDate").data("kendoDatePicker").value(), "MM/dd/yyyy"),
    EndDate: kendo.toString($("#ObsEndDate").data("kendoDatePicker").value(), "MM/dd/yyyy"),
    ReportType: 'ByTracer',
    ReportTitle: $('#hdnReportTitle').val(),
    SelectedSiteHCOIDs: "",
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
    groupbySite = false;
    ExcelGenerated = true;
    // reset values
    LevelIdentifier = 1;
    SelectedProgramName = "Hospital";
    SelectedProgramID = 2;
    SelectedHCOName = "";
    SelectedSiteID = 0;
    ExportReportName = "";
    SelectedTracerCustomID = 0;
    SelectedTracerCustomName = "";
    SelectedQuestionNo = 0;
    SelectedQuestionText = "";
    SelectedQuestionID = 0;

    $.ajax({
        async: false,
        url: '/TracerER/ERTracerByQuestion/LoadERTracerByQuestionReport',
        dataType: "html",
        success: function (data) {
            $('#loadChartView').html(data);
            //blockElement("divL1tag");
            Level1Load();
        }
    });
}

function SetDefaults() {
    $('#loadChartView').html('');
    LevelIdentifier = 1;
    SelectedProgramName = "Hospital";
    SelectedProgramID = 2;
    groupbySite = false;
    SelectedHCOName = "";
    SelectedSiteID = 0;
    ExportReportName = "";
    SelectedTracerCustomID = 0;
    SelectedTracerCustomName = "";
    SelectedQuestionNo = 0;
    SelectedQuestionText = "";
    SelectedQuestionID = 0;
    var dateRangedeselect = $('input[name=DateRange]:checked').val();
    $('input:radio[id*=' + dateRangedeselect + ']').prop('checked', false);

}

$(document).ready(function () {
    // Reset these additional parameters
    $("#resetfiltersbutton").click(function () {
        SetDefaults();
    });

    if ($.isNumeric($('#lblReportScheduleID').html())) {
        GetSavedParameters($('#lblReportScheduleID').html());
    }
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
            $('#divlevelchart').hide();
            $('#divleveldata').show();

            break;
        case 2:
                var checkLevel2Dataexists = $("#divlevel2data");
                if (!checkLevel2Dataexists.data("kendoGrid")) {
                    createLevel2Data();
                }
                $('#divlevel2chart').hide();
                $('#divlevel2data').show();
       
            break;
        case 3:
       
                var checkLevel3Dataexists = $("#divlevel3data");
                if (!checkLevel3Dataexists.data("kendoGrid")) {
                    createLevel3Data();
                }
                $('#divlevel3chart').hide();
                $('#divlevel3data').show();

            break;
        case 4:
            var checkLevel4Dataexists = $("#divlevel4data");
            if (!checkLevel4Dataexists.data("kendoGrid")) {
                createLevel4Data();
            }
            $('#divlevel4chart,#divLevel4ChartHeader').hide();
            $('#divlevel4data').show();

            break;
    }
}
function showlevelGraph() {

    switch (LevelIdentifier) {
        case 1:
            $('#divleveldata').hide();
            $('#divlevelchart').show();
            break;
        case 2:
            $('#divlevel2data').hide();
            $('#divlevel2chart').show();
            break;
        case 3:
            $('#divlevel3data').hide();
            $('#divlevel3chart,#divLevel3ChartHeader').show();
                $(".chartquestion").each(function () {
                    $(this).data("kendoChart").refresh();
                });
            break;
        case 4:
            $('#divlevel4data').hide();
            $('#divlevel4chart').show();
            break;
    }

}
function DisplayLevel() {
    LevelIdentifier = LevelIdentifier > 1 ? LevelIdentifier - 1 : LevelIdentifier;
    $("#previousLevelButton").removeClass('k-button k-state-focused');
    switch (LevelIdentifier) {
        case 1:
            $('#divpreviouslevel,#divleveldata,#divtoplevel2').hide();
            $('#divtoplevel1,#divlevelchart').show();
                var levelkendogrid = $("#divlevel2data");
                if (levelkendogrid.data("kendoGrid")) {
                    $("#divlevel2data").data("kendoGrid").destroy();
                    $("#divlevel2data").empty();
                }

             break;
        case 2:
            $('#divtoplevel3,#divlevel2data').hide();
            $('#divtoplevel2,#divlevel2chart').show();
                var levelkendogrid = $("#divlevel3data");
                if (levelkendogrid.data("kendoGrid")) {
                    $("#divlevel3data").data("kendoGrid").destroy();
                    $("#divlevel3data").empty();
                }
             break;
        case 3:
            $('#divtoplevel4,#divlevel3data').hide();
            $('#divtoplevel3,#divlevel3chart,#divLevel3ChartHeader').show();
            var levelkendogrid = $("#divlevel4data");
            if (levelkendogrid.data("kendoGrid")) {
                $("#divlevel4data").data("kendoGrid").destroy();
                $("#divlevel4data").empty();
            }
            break;
        case 4:
            var levelkendogrid = $("#divlevel5data");
            if (levelkendogrid.data("kendoGrid")) {
                $("#divlevel5data").data("kendoGrid").destroy();
                $("#divlevel5data").empty();
            }
            $('#divtoplevel5,#divlevel4data').hide();
            $('#divtoplevel4,#divlevel4chart').show();
            $('input:radio[name*="L1selectView"]').attr('disabled', false);
            break;
    }
    $('#exportoexcel').hide();
    $('#exporttopdf').show();
    DisplayLevelParameters();

}
function DisplayLevelParameters(ChartSearch) {

    if (ChartSearch === undefined) {
        ChartSearch = SetSearchCriteria(true);
    }
    
    switch (LevelIdentifier) {
        case 1:
                $("#spanSelParameters1").html("Overall Compliance by Program");
                $("#spanSelParameters2").html("Program: " + ChartSearch.ProgramNames);
                $("#spanSelParameters3").html("Tracer: " + ChartSearch.TracerListNames);
                $("#spanSelParameters4").html("HCOID: " + $("#SiteSelector_SelectedHCOIDs").val());
           
            break;
        case 2:
                $("#spanSelParameters1").html(SelectedProgramName + " - Compliance by Tracer");
                $("#spanSelParameters2").html("Tracer: " + ChartSearch.TracerListNames);
                $("#spanSelParameters3").html("HCOID: " + $("#SiteSelector_SelectedHCOIDs").val());
                $("#spanSelParameters4").html("");
            break;
        case 3:
         
                $("#spanSelParameters1").html(SelectedTracerCustomName + " - Compliance by Question");
                $("#spanSelParameters2").html("Program: " + SelectedProgramName);
                $("#spanSelParameters3").html("HCOID: " + $("#SiteSelector_SelectedHCOIDs").val());
                $("#spanSelParameters4").html("");
            break;
        case 4:
                $("#spanSelParameters1").html(SelectedTracerCustomName + " - Compliance by Site");
                $("#spanSelParameters2").html("Program: " + SelectedProgramName);
                $("#spanSelParameters3").html("HCOID: " + $("#SiteSelector_SelectedHCOIDs").val());
                $("#spanSelParameters4").html("Question: " + SelectedQuestionText);

            break;
        case 5:
            $("#spanSelParameters1").html(SelectedTracerCustomName + " - Question " + SelectedQuestionNo + " Details");
            $("#spanSelParameters2").html("Program: " + SelectedProgramName);
            $("#spanSelParameters3").html("HCOID: " + SelectedHCOName);
            $("#spanSelParameters4").html("Question: " + SelectedQuestionText);
            break;
    }
    $("#spanSelParameters8").html("Department: " + ChartSearch.DepartmentListNames);
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
  
   
    if (ChartSearch.IncludeFSA) {
        $("#spanSelParameters7").html("Only FSA EPs");
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

             { field: "ProgramID", hidden: "true" }, { field: "ProgramName", width: 200, title: "Program", footerTemplate: "Total:" },
             { field: "ProgramCode", hidden: "true" },
             { field: "TracerCount", width: 200, title: "Tracer Count", footerTemplate: "#=sum#" },
             { field: "ObservationCount", width: 200, title: "Total Completed Observations", footerTemplate: "#=sum#" },
             { field: "QuestionCount", width: 200, title: "Question Count", footerTemplate: "#=sum#" },
             { field: "NACount", width: 200, title: "Total N/A", footerTemplate: "#=sum#" },
             { field: "Numerator", width: 200, title: "Total Numerator", footerTemplate: "#=sum#" },
             { field: "Denominator", width: 200, title: "Total Denominator", footerTemplate: "#=sum#" },
             { field: "CompliancePercent", width: 200, title: "Overall Compliance %"
               , format: "{0:0.0}"
                   , footerTemplate: "# if(data.Denominator.sum == 0) " +
                                           "{#  #= kendo.toString(0, '0.0') #%  #} " +
                                           "else {# #= kendo.toString((data.Numerator.sum/data.Denominator.sum)*100, '0.0') #% #}#"
             }, { field: "NonCompliancePercent", hidden: "true" }]
    });
}

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
    //setChartHeight("divlevelchart", 2);
    hasExcelData = true;

    return new kendo.data.DataSource({
        transport: {
            read: {
                url: "/TracerER/ERTracerByQuestion/ERTracerByQuestion_Data",
                type: "post",
                dataType: "json",
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
                    $('#showerror_msg').slideDown('slow');
                    $('#show_msg').html("No data found matching your Criteria. Change Criteria and try again.");
                    $('#showerror_msg').delay(5000).slideUp('slow');
                }
                else {
                    setChartHeight("divlevelchart", e.response.length);
                    closeSlide("btnSearchCriteria", "slideSearch");
                }
            }
            //  EnableDisableChartView(false);
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
    $('#divtoplevel1,#divlevel2data').hide();
    $('#divtoplevel2,#divlevel2chart,#divpreviouslevel').show();
    Level2Load(e.dataItem.ProgramID, e.dataItem.ProgramName);
}
function onLevel1Click(e) {
    EnableDisableChartView(true);
    $('input:radio[id*="radioL1Graph"]').prop('checked', true);
    LevelIdentifier = 2;
    $('#divtoplevel1').hide();
    var data = this.dataItem(this.select());
    if (data != null) {
        $('#divlevel2data,#exportoexcel').hide();
        $('#divtoplevel2,#divlevel2chart,#divpreviouslevel,#exporttopdf').show();
        Level2Load(data.ProgramID, data.ProgramName);
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
//By Tracers
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
                format: "Not Applicable: {0:n1}%"

            }
        }
        ],
        categoryAxis: {
            field: "TracerCustomName",

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
        selectable: true,
        sortable: true,
        change: onLevel2Click,
        excel: { allPages: true },
        excelExport: ERexcelExport,
        columns: [
            { field: "TracerCustomID", hidden: "true" }, { field: "TracerCustomName", width: 200, title: "Tracer Name", footerTemplate: "Total:" },
            { field: "ObservationCount", width: 200, title: "Total Completed Observations", footerTemplate: "#=sum#" },
            { field: "QuestionCount", width: 200, title: "Question Count", footerTemplate: "#=sum#" },
            { field: "NACount", width: 200, title: "Total N/A", footerTemplate: "#=sum#" },
            { field: "Numerator", width: 200, title: "Total Numerator", footerTemplate: "#=sum#" },
            { field: "Denominator", width: 200, title: "Total Denominator", footerTemplate: "#=sum#" },
            { field: "CompliancePercent", width: 200, title: "Overall Compliance %"
                , format: "{0:0.0}"
                , footerTemplate: "# if(data.Denominator.sum == 0) " +
                "{#  #= kendo.toString(0, '0.0') #%  #} " +
                "else {# #= kendo.toString((data.Numerator.sum/data.Denominator.sum)*100, '0.0') #% #}#"
            }, { field: "NonCompliancePercent", hidden: "true" }]
    });
}
// code to call third level 

function Level2Load(ProgramID, ProgramName) {
    SelectedProgramName = ProgramName;
    SelectedProgramID = ProgramID;
    Level2dataSource = Level2datasourcecall();
    Level2dataSource.sync();
    createLevel2Chart();
}

var Level2dataSource = "";
function Level2datasourcecall() {

    var ChartSearch = SetSearchCriteria(true);
    ChartSearch.ProgramIDs = SelectedProgramID;
    ChartSearch.ProgramNames = SelectedProgramName;

    DisplayLevelParameters(ChartSearch);
    return new kendo.data.DataSource({
        transport: {
            read: {
                url: "/TracerER/ERTracerByQuestion/ERTracerByQuestion_Data",
                type: "post",
                dataType: "json",
                data: { search: ChartSearch, LevelIdentifier: 2 }
            }
        },
        requestEnd: function (e) {
            if (e.response != null) {
                setChartHeight("divlevel2chart", e.response.length);
            }
            EnableDisableChartView(false);
        },
        aggregate: [{ field: "TracerCustomID", aggregate: "count" },
        { field: "QuestionCount", aggregate: "sum" },
        { field: "ObservationCount", aggregate: "sum" },
        { field: "NACount", aggregate: "sum" },
        { field: "Numerator", aggregate: "sum" },
        { field: "Denominator", aggregate: "sum" },
        { field: "CompliancePercent", aggregate: "average" }]
    });
}

function onLevel2SeriesClick(e) {
    EnableDisableChartView(true);
    LevelIdentifier = 3;
    $('#divtoplevel2,#divlevel3data').hide();
    $('#divtoplevel3,#divlevel3chart,#divLevel3ChartHeader').show();
    Level3Load(e.dataItem.TracerCustomID, e.dataItem.TracerCustomName);
}
function onLevel2Click(e) {
    EnableDisableChartView(true);

    $('input:radio[id*="radioL1Graph"]').prop('checked', true);
    var data = this.dataItem(this.select());
    if (data != null) {
        LevelIdentifier = 3;
        $('#divtoplevel2,#divlevel3data,#exportoexcel').hide();
        $('#divtoplevel3,#divlevel3chart,#divLevel3ChartHeader,#exporttopdf').show();
        Level3Load(data.TracerCustomID, data.TracerCustomName);
    }
}
// Level 2 scripts end 


// Level 3 scripts start
function createLevel3Chart() {
    $("#divlevel3chart").kendoGrid({
        dataSource: Level3dataSource,
        selectable: true,
        sortable: true,
        pageable: {
            refresh: true,
            pageSizes: [20, 50, 100]
        },
        change: onLevel3SeriesClick,
        dataBound: dataBoundChart,
        columns: [
            { field: "QuestionNo", width: 100, title: "Question #", hidden: "true" },
            { field: "QuestionText", width: 450, title: "Question" },
            { field: "TracerQuestionID", hidden: "true" },
            { field: "Numerator", width: 150, title: "Total Numerator" },
            { field: "Denominator", width: 150, title: "Total Denominator" },
            { field: "CompliancePercent", title: "Overall Compliance %",
                template: kendo.template($("#ComplianceTemplate").html())
            },
            { field: "NonCompliancePercent", hidden: "true" }]
    })
}

function dataBoundChart(e) {
    var grid = this;
    var row = $(grid).closest("tr");

    var irow = 0;
    this.wrapper.find(".chartquestion").each(function () {

        $(this).kendoChart({
            overlay: {
                gradient: null
            },
            legend: {
                visible: false
            },
            chartArea: {
                background: "transparent"
            },
            seriesDefaults: {
                type: "bar",
                stack: {
                    type: "100%"
                }
            },
            categoryAxis: {
                visible: false,
                majorGridLines: {
                    visible: false
                }
            },
            tooltip: {
                visible: true,
                template: "#= series.name #: #= kendo.format('{0:n1}%',value) #"
            },
            series:
            [{
                data: [Math.round(row.prevObject[0]._data[irow].CompliancePercent * 10) / 10],

                name: "Compliance",
                color: "#5bb346",
                labels: {
                    visible: Math.round(row.prevObject[0]._data[irow].CompliancePercent) > 4,
                    position: "center",
                    background: "transparent",
                    format: "{0:n1}%"

                }
            }, {
                data: [Math.round(row.prevObject[0]._data[irow].NonCompliancePercent * 10) / 10],

                name: "Non Compliance",
                color: "#C61835",
                labels: {
                    visible: Math.round(row.prevObject[0]._data[irow].NonCompliancePercent) > 4,
                    position: "center",
                    background: "transparent",
                    format: "{0:n1}%"

                }
            }
                , {
                data: [Math.round(row.prevObject[0]._data[irow].NACompliancePercent * 10) / 10],

                name: "Not Applicable",
                color: "#939393",
                labels: {
                    visible: Math.round(row.prevObject[0]._data[irow].NACompliancePercent) > 4,
                    position: "center",
                    background: "transparent",
                    format: "Not Applicable: {0:n1}%"

                }
            }
            ]
            ,

            valueAxis: {
                min: 0,
                visible: false,
                line: {
                    visible: false
                },
                minorGridLines: {
                    visible: false
                },
                majorGridLines: {
                    visible: false
                }
            }

        });

        irow += 1;

    });

}

function createLevel3Data() {
    $("#divlevel3data").kendoGrid({
        dataSource: Level3dataSource,
        selectable: true,
        sortable: true,
        excel: { allPages: true },
        pageable: {
            refresh: true,
            pageSizes: [20, 50, 100]
        },
        change: onLevel3Click,
        excelExport: ERexcelExport,
        columns: [
            { field: "QuestionNo", width: 150, title: "Question #", hidden: "true" }, { field: "QuestionText", width: 250, title: "Question", footerTemplate: "Total:" },
            { field: "TracerQuestionID", hidden: "true" },
            // Developer Comment:  (Asked to remove in UserStory: 51596)
            //{ field: "ObservationCount", width: 200, title: "Observation Count", footerTemplate: "#=sum#" },
            { field: "QuestionCount", width: 200, title: "Question Count", footerTemplate: "#=sum#" },
            { field: "NACount", width: 200, title: "Total N/A", footerTemplate: "#=sum#" },
            { field: "Numerator", width: 200, title: "Total Numerator", footerTemplate: "#=sum#" },
            { field: "Denominator", width: 200, title: "Total Denominator", footerTemplate: "#=sum#" },
            { field: "CompliancePercent", width: 200, title: "Overall Compliance %", format: "{0:0.0}"
                , footerTemplate: "# if(data.Denominator.sum == 0) " +
                "{#  #= kendo.toString(0, '0.0') #%  #} " +
                "else {# #= kendo.toString((data.Numerator.sum/data.Denominator.sum)*100, '0.0') #% #}#"
            },
            { field: "NonCompliancePercent", hidden: "true" }]
    });
}

function Level3Load( TracerCustomID, TracerCustomName) {
    SelectedTracerCustomName = TracerCustomName;
    SelectedTracerCustomID = TracerCustomID;
    Level3dataSource = Level3datasourcecall();
    Level3dataSource.sync();
    createLevel3Chart();
}

var Level3dataSource = "";
function Level3datasourcecall() {

    var ChartSearch = SetSearchCriteria(true);
    ChartSearch.ProgramIDs = SelectedProgramID;
    ChartSearch.ProgramNames = SelectedProgramName;
    ChartSearch.TracerListIDs = SelectedTracerCustomID;
    ChartSearch.TracerListNames = SelectedTracerCustomName;
    DisplayLevelParameters(ChartSearch);
    return new kendo.data.DataSource({
        transport: {
            read: {
                url: "/TracerER/ERTracerByQuestion/ERTracerByQuestion_Data",
                type: "post",
                dataType: "json",
                data: { search: ChartSearch, LevelIdentifier: 3 }
            }
        },
        requestEnd: function (e) {
            EnableDisableChartView(false);
        },
        pageSize: 20,
        aggregate: [{ field: "QuestionNo", aggregate: "count" },
         // Developer Comment:  (Asked to remove in UserStory: 51596)
        //{ field: "ObservationCount", aggregate: "sum" },
        { field: "QuestionCount", aggregate: "sum" },
        { field: "NACount", aggregate: "sum" },
        { field: "Numerator", aggregate: "sum" },
        { field: "Denominator", aggregate: "sum" },
        { field: "CompliancePercent", aggregate: "average" }]
    });
}

function onLevel3SeriesClick(e) {
    EnableDisableChartView(true);

    LevelIdentifier = 4;
    var data = this.dataItem(this.select());

    if (data != null) {
        $('#divtoplevel3,#divlevel4data,#exportoexcel').hide();
        $('#divtoplevel4,#divlevel4chart,#exporttopdf').show();
        Level4Load(data.QuestionNo, data.TracerQuestionID, data.QuestionText);
    }
}
function onLevel3Click(e) {
    EnableDisableChartView(true);

    $('input:radio[id*="radioL1Graph"]').prop('checked', true);
    LevelIdentifier = 4;
    var data = this.dataItem(this.select());
    if (data != null) {
        $('#divtoplevel3,#divlevel4data,#exportoexcel').hide();
        $('#divtoplevel4,#divlevel4chart,#exporttopdf').show();
        Level4Load(data.QuestionNo, data.TracerQuestionID, data.QuestionText);
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
        seriesClick: onLevel4SeriesClick
    });


}
function createLevel4Data() {
    $("#divlevel4data").kendoGrid({
        dataSource: Level4dataSource,
        change: onLevel4Click,
        selectable: true,
        sortable: true,
        excel: { allPages: true },
        excelExport: ERexcelExport,
        columns: [
             { field: "SiteID", hidden: "true" }, { field: "SiteName", width: 300, title: "Site Name", footerTemplate: "Total:" }, { field: "HCOID", width: 100, title: "HCO ID" },
             { field: "SiteFullName", hidden: "true" }, { field: "Location", width: 300, title: "Location" },
             { field: "TracerCount", width: 200, title: "Tracer Count", footerTemplate: "#=sum#" },
             // Developer Comment:  (Asked to remove in UserStory: 51596)
             //{ field: "ObservationCount", width: 200, title: "Observation Count", footerTemplate: "#=sum#" },
             { field: "QuestionCount", width: 200, title: "Question Count", footerTemplate: "#=sum#" },
             { field: "NACount", width: 200, title: "Total N/A", footerTemplate: "#=sum#" },
             { field: "Numerator", width: 200, title: "Total Numerator", footerTemplate: "#=sum#" },
             { field: "Denominator", width: 200, title: "Total Denominator", footerTemplate: "#=sum#" },
             { field: "CompliancePercent", width: 200, title: "Overall Compliance %"
                 , format: "{0:0.0}"
                  , footerTemplate: "# if(data.Denominator.sum == 0) " +
                                           "{#  #= kendo.toString(0, '0.0') #%  #} " +
                                           "else {# #= kendo.toString((data.Numerator.sum/data.Denominator.sum)*100, '0.0') #% #}#"
             }, { field: "NonCompliancePercent", hidden: "true" }]
    });
}
// code to call second level 

function Level4Load(QuestionNo, TracerQuestionID, QuestionText) {
    SelectedQuestionNo = QuestionNo;
    SelectedQuestionText = QuestionText;
    SelectedQuestionID = TracerQuestionID;
    Level4dataSource = Level4datasourcecall();
    Level4dataSource.sync();
    createLevel4Chart();

}

var Level4dataSource = "";
function Level4datasourcecall() {

    var ChartSearch = SetSearchCriteria(true);
    ChartSearch.ProgramIDs = SelectedProgramID;
    ChartSearch.ProgramNames = SelectedProgramName;
    ChartSearch.TracerListIDs = SelectedTracerCustomID;
    ChartSearch.TracerListNames = SelectedTracerCustomName;
    ChartSearch.TracerQuestionIDs = SelectedQuestionID;

    DisplayLevelParameters(ChartSearch);

    return new kendo.data.DataSource({
        transport: {
            read: {
                url: "/TracerER/ERTracerByQuestion/ERTracerByQuestion_Data",
                type: "post",
                dataType: "json",
                data: { search: ChartSearch, LevelIdentifier: 4 }
            }
        },
        requestEnd: function (e) {
            if (e.response != null) {
                setChartHeight("divlevel4chart", e.response.length);
            }
            EnableDisableChartView(false);
        },

        aggregate: [{ field: "HCOID", aggregate: "count" },
                               { field: "TracerCount", aggregate: "sum" },
                               // Developer Comment:  (Asked to remove in UserStory: 51596)
                               //{ field: "ObservationCount", aggregate: "sum" },
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
    $('input:radio[id*="radioL1Data"]').prop('checked', true);
    $('#divtoplevel4,#exporttopdf').hide();
    $('#divtoplevel5,#divlevel5data,#exportoexcel').show();
    Level5Load(e.dataItem.SiteID, e.dataItem.SiteFullName);

}
function onLevel4Click(e) {
    EnableDisableChartView(true);
    $('input:radio[id*="radioL1Data"]').prop('checked', true);

    var data = this.dataItem(this.select());
    if (data != null) {
        LevelIdentifier = 5;
        $('#divtoplevel4,#exporttopdf').hide();
        $('#divtoplevel5,#divlevel5data,#exportoexcel').show();
        Level5Load(data.SiteID, data.SiteFullName);
    }
}
// Level 4 scripts end

// Level 5 scripts start
function createLevel5Data() {
    $("#divlevel5data").kendoGrid({
        dataSource: Level5dataSource,
        pageable: {
            refresh: true,
            pageSizes: [20, 50, 100]
        },
        sortable: true,
        excel: { allPages: true },
        excelExport: ERexcelExport,
        columns: [
            { field: "Observation", width: 300, title: "Observation" },
            { field: "QuestionNo", width: 125, title: "Question Number" },
            { field: "QuestionText", width: 350, title: "Question Text" },
            { field: "StandardEP", width: 125, title: "Standard - EP(s)" },
            { field: "OrganizationName_Rank3", width: 200, title: "OrgName_Rank3" },
            { field: "OrganizationName_Rank2", width: 200, title: "OrgName_Rank2" },
            { field: "OrganizationName_Rank1_Dept", width: 200, title: "Department" },
            { field: "SurveyTeam", width: 200, title: "Survey Team" },
            { field: "MedicalStaffInvolved", width: 200, title: "Medical Staff Involved" },
            { field: "Location", width: 200, title: "Location" },
            { field: "UniqueIdentifier", width: 200, title: "Unique Identifier" },
            { field: "EquipmentObserved", width: 200, title: "Equipment Observed" },
            { field: "ContractedService", width: 200, title: "Contracted Service" },
            { field: "StaffInterviewed", width: 200, title: "Staff Interviewed" },
            { field: "ObservationNote", width: 200, title: "Observation Notes" },
            { field: "ObservationDate", width: 200, title: "Observation Date" },
            { field: "LastUpdated", width: 200, title: "Last Updated" },
            { field: "UpdatedByUserName", width: 200, title: "Updated By" },
            { field: "Numerator", width: 200, title: "Num", footerTemplate: "#=sum#" },
            { field: "Denominator", width: 200, title: "Den", footerTemplate: "#=sum#" },
            { field: "CompliancePercent", width: 125, title: "Compliance %", format: "{0:0.0}"
             , footerTemplate: "# if(data.Denominator.sum == 0) " +
                                           "{#  #= kendo.toString(0, '0.0') #%  #} " +
                                           "else {# #= kendo.toString((data.Numerator.sum/data.Denominator.sum)*100, '0.0') #% #}#"
            },
            { field: "TracerQuestionNote", width: 200, title: "Question Notes" }
        ]
    });
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
function Level5Load(SiteID, SiteFullName) {
    SelectedHCOName = SiteFullName;
    SelectedSiteID = SiteID;
    Level5dataSource = Level5datasourcecall();
    Level5dataSource.sync();
    createLevel5Data();

    $.ajax({
        type: "POST",
        data: { selectedSiteID: SelectedSiteID, selectedProgramID: SelectedProgramID },
        url: '/ERSearch/GetOrganizationTypesHeaderString',
        success: function (data) {
            var a = data.split(" > ");
            a.reverse();
            if (a.length >= 2) { OrgRanking2Name = a[1]; } else { OrgRanking2Name = ""; }
            if (a.length >= 3) { OrgRanking3Name = a[2]; } else { OrgRanking3Name = ""; }
            SetColumnHeader("divlevel5data", 4);
        }
    });

}

var Level5dataSource = "";
function Level5datasourcecall() {
 
    var ChartSearch = SetSearchCriteria(true);
    ChartSearch.ProgramIDs = SelectedProgramID;
    ChartSearch.ProgramNames = SelectedProgramName;
    ChartSearch.TracerListIDs = SelectedTracerCustomID;
    ChartSearch.TracerListNames = SelectedTracerCustomName;
    ChartSearch.SelectedSiteIDs = SelectedSiteID;
    ChartSearch.TracerQuestionIDs = SelectedQuestionID;
    DisplayLevelParameters(ChartSearch);
    return new kendo.data.DataSource({
        transport: {
            read: {
                url: "/TracerER/ERTracerByQuestion/ERTracerByQuestion_Data",
                type: "post",
                dataType: "json",
                data: { search: ChartSearch, LevelIdentifier: 5 }
            }

        },
        requestEnd: function (e) {
            EnableDisableChartView(false);
            $('input:radio[name*="L1selectView"]').attr('disabled', true);
            if (e.response != null) {

                if (e.response.length > 0) {
                    SelectedQuestionNo = e.response[0].QuestionNo;
                    $("#spanSelParameters1").html(SelectedTracerCustomName + " - Question " + SelectedQuestionNo + " Details");

                }
            }
            
        },
        pageSize: 20,
        aggregate: [{ field: "TracerResponseID", aggregate: "count" },
                               { field: "Numerator", aggregate: "sum" },
                                  { field: "Denominator", aggregate: "sum" },
                                  { field: "CompliancePercent", aggregate: "average" }]
    });
}
// Level 5 scripts end

// Common scripts start 
function ERPDFExportByLevel() {
    var dataSource = "";

    switch (LevelIdentifier) {
        case 1:
            ExportReportName = "Tracer By Question - Overall Compliance by Program";
            var levelkendogrid = $("#divleveldata");
            if (levelkendogrid.data("kendoGrid")) {
                dataSource = $("#divleveldata").data("kendoGrid").dataSource;
            }

            break;
        case 2:
            ExportReportName = "Tracer By Question - Compliance by Tracer";
                var levelkendogrid = $("#divlevel2data");
                if (levelkendogrid.data("kendoGrid")) {
                    dataSource = $("#divlevel2data").data("kendoGrid").dataSource;
                }
            break;
        case 3:
            ExportReportName = "Tracer By Question - Compliance by Question";
                var levelkendogrid = $("#divlevel3chart");
                if (levelkendogrid.data("kendoGrid")) {
                    dataSource = $("#divlevel3chart").data("kendoGrid").dataSource;
                }
            break;
        case 4:
            ExportReportName = "Tracer By Question - Compliance by Site";
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
                      { ExcelGridName: ExportReportName, email: $.parseJSON(sessionStorage.getItem('searchsetemailsession')), ERReportName: "ERTracerByQuestion", SortBy: dataSortBy, SortOrder: dataSortOrder }, function (data) {
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
            url: "/Export/CreateERSessionCriteria",
            contentType: "application/json",
            data: JSON.stringify({ ERsearch: SetParameters() })

        }).done(function (e) {
            $(function () {
                $.post('/Email/createErPdf',
                    { ExcelGridName: ExportReportName, ERReportName: "ERTracerByQuestion", SortBy: dataSortBy, SortOrder: dataSortOrder }, function (data) {
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
            ExportReportName = "Tracer By Question - Overall Compliance by Program";
            $("#divleveldata").getKendoGrid().saveAsExcel();
            break;
        case 2:
            ExportReportName = "Tracer By Question - Compliance by Tracer";
            $("#divlevel2data").getKendoGrid().saveAsExcel();
            break;
        case 3:
            ExportReportName = "Tracer By Question - Compliance by Question";
            $("#divlevel3data").getKendoGrid().saveAsExcel();
            break;
        case 4:
            ExportReportName = "Tracer By Question - Compliance by Site";
            $("#divlevel4data").getKendoGrid().saveAsExcel();
            break;
        case 5:
            ExportReportName = "Tracer By Question - Question Details";
            $("#divlevel5data").getKendoGrid().saveAsExcel();
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
    switch (LevelIdentifier) {
        case 1:
            break;
        case 2:
                ChartSearch.ProgramIDs = SelectedProgramID;
                ChartSearch.ProgramNames = SelectedProgramName;
            break;
        case 3:
                ChartSearch.ProgramNames = SelectedProgramName;
                ChartSearch.ProgramIDs = SelectedProgramID;
                ChartSearch.TracerListNames = SelectedTracerCustomName;
                ChartSearch.TracerListIDs = SelectedTracerCustomID;
             break;
        case 4:
            ChartSearch.ProgramIDs = SelectedProgramID;
            ChartSearch.ProgramNames = SelectedProgramName;
            ChartSearch.TracerListIDs = SelectedTracerCustomID;
            ChartSearch.TracerListNames = SelectedTracerCustomName + " > " + SelectedQuestionText;
            ChartSearch.TracerQuestionIDs = SelectedQuestionID;
            break;
        case 5:
            ChartSearch.SelectedSiteHCOIDs = SelectedHCOName;
            ChartSearch.SelectedSiteIDs = SelectedSiteID;
            ChartSearch.ProgramNames = SelectedProgramName;
            ChartSearch.ProgramIDs = SelectedProgramID;
            ChartSearch.TracerListIDs = SelectedTracerCustomID;
            ChartSearch.TracerQuestionIDs = SelectedQuestionID;
            ChartSearch.TracerListNames = SelectedTracerCustomName + " > " + SelectedQuestionNo + " > " + SelectedQuestionText;
            break;
    }

    return ChartSearch;

}
function AddExportParameters() {
    var ChartSearch = SetParameters();
    var ParameterNameTracer = "Tracer";
    if (LevelIdentifier == 5)
    { ParameterNameTracer = "Tracer > Question # > Question Text"; }
    if (LevelIdentifier == 4)
    { ParameterNameTracer = "Tracer > Question Text"; }
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
                { value: ParameterNameTracer },
                { value: ChartSearch.TracerListNames }
                ]
            },
            {
                cells: [
                    { value: "Department" },
                    { value: ChartSearch.DepartmentListNames }
                ]
            },
            {
                cells: [{ value: "Tracer Type" },
                        { value: "TJC Tracers" }]
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
                { value: ChartSearch.IncludeFSA == true ? "True" : "False" }
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
        { SelectedSites: ERSites.getSelectedSites() },
        { ProgramServices: searchCriteria.ProgramIDs },
        { ReportTitle: searchCriteria.ReportTitle },
        { ReportGroupByType: searchCriteria.ReportType },
        { TracersList: searchCriteria.TracerListIDs },
        { OrgDepartment: searchCriteria.DepartmentListIDs }
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
    var query = $(params.ReportSiteMaps).each(function () {
        selectedSites += $(this)[0].SiteID + ',';
    });
    selectedSites = selectedSites.replace(/\,$/, ''); //Remove the last character if its a comma

    ERSites.oldSites = ERSites.getSelectedSites();

    //Load the programs
    $.ajax({
        type: "POST",
        async: false,
        data: { selectedSiteIDs: selectedSites },
        url: '/TracerER/TracersByTJCStandard/GetHCOIDsString',
        success: function (data) {
            $("#SiteSelector_SelectedHCOIDs").val(data);
        }
    });

    MultiSiteProgramCall(selectedSites);
    $("#MultiSiteProgram").data("kendoMultiSelect").value(getParamValue(params.ReportParameters, "ProgramServices").split(","));

    MultiSiteTracerCall(selectedSites, getParamValue(params.ReportParameters, "ProgramServices"));
    $("#TracersList").data("kendoMultiSelect").value(getParamValue(params.ReportParameters, "TracersList").split(","));

    MultiSiteDepartmentCall(selectedSites, getParamValue(params.ReportParameters, "ProgramServices"));
    $("#DepartmentList").data("kendoMultiSelect").value(getParamValue(params.ReportParameters, "OrgDepartment").split(","));

    SetSavedObservationDate(params.ReportParameters);

    CheckboxChecked(getParamValue(params.ReportParameters, "IncludeFSAcheckbox"), 'IncludeFSAcheckbox');

    SetERRecurrenceParameters(params);

    //Show the Criteria screen once the parameters are loaded
    ERCriteriaLoaded = true;
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