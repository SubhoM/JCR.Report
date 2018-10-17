//Get URLS from hidden fields
var GetRDLC = $("#GetRDLC").val();
var TracersCategoriesUpdate = $("#TracersCategoriesUpdate").val();
var TracersChapterUpdate = $("#TracersChaptersUpdate").val();
var TracersStandardUpdate = $("#TracersStandardssUpdate").val();
var TracersEPUpdate = $("#TracersEPsUpdate").val();
var defaultValue = "-1";
var defaultText = "All";

//on site change // update categories and tracers list
function loadrespectiveparameters(siteID, siteName) {
    if (ExcelGridName != null && ExcelGridName != undefined && ExcelGridName != "")
        HideGrid(ExcelGridName);

    ResetAll();

    if (typeof SetDefaults == 'function') {
        SetDefaults();
    }

    //get the input avlues from SetSearchCriteria fucntion
    var searchinputset = SetSearchCriteria();
   
    orgTypeLevelFilter(searchinputset);
    OrganizationTypeInactiveupdate();
    //RecordSiteChangeEvent(siteID);

    //cat mulitselect update
    CategoryUpdate(siteID, siteName);

    UpdateChapter();

   
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


function ToggleMultiselects(value) {
    var chapterMultiSelect = $("#TracersChapter").data("kendoMultiSelect");
    var stdMultiSelect = $("#TracersEP").data("kendoMultiSelect");
    var epMultiSelect = $("#TracersStandard").data("kendoMultiSelect");

    chapterMultiSelect.enable(value);
    stdMultiSelect.enable(value);
    epMultiSelect.enable(value);
}

function CategoryUpdate(siteID, siteName) {
    //cat mulitselect update
    $.ajax({
        type: "Post",
        url: TracersCategoriesUpdate,
        data: {
            selectedsiteid: siteID,
            selectedsitename: siteName
        },
        success: function (response) {
            $("#tracercategory").html(response);
        }
    });
}

function UpdateChapter() {
    ToggleMultiselects(false);
    $.ajax({
        type: "Post",
        url: TracersChapterUpdate,
        data: {
            selectedsiteid: $('#UserSite').val(),
            selectedsitename: $('#UserSiteName').val()
        },
        success: function (response) {

            $("#tracerchapter").html(response);
            UpdateStandards();
        }
    });
}

function UpdateStandards() {
    //$(".loading").show();

    ShowLoader();

    ToggleMultiselects(false);
    //cat chapter update
    $.ajax({
        type: "Post",
        url: TracersStandardUpdate,
        data: {
            selectedsiteid: $('#UserSite').val(),
            selectedsitename: $('#UserSiteName').val(),
            chapterid: $("#TracersChapter").data("kendoMultiSelect").value().toString()
        },
        success: function (response) {
            //$(".loading").hide();

            HideLoader();

            $("#tracerstandard").html(response);
            UpdateEPs();
        }
    });
}

function UpdateEPs() {
    //$(".loading").show();

    ShowLoader();

    ToggleMultiselects(false);
    $.ajax({
        type: "Post",
        url: TracersEPUpdate,
        data: {
            selectedsiteid: $('#UserSite').val(),
            selectedsitename: $('#UserSiteName').val(),
            chapterid: $("#TracersChapter").data("kendoMultiSelect").value().toString(),
            standardtextid: $("#TracersStandard").data("kendoMultiSelect").value().toString()
        },
        success: function (response) {
            //$(".loading").hide();

            HideLoader();

            $("#tracerep").html(response);
            ToggleMultiselects(true);
        }
    });
}

function onChapChange(e) {
    UpdateStandards();
}

function onStdChange(e) {
    //UpdateEPs();
}

//on tracer category change
function onCatChange(e) {
    //   var searchinputset = SetSearchCriteria();
    //    searchinputset.TracerChapterIDs = "";

}

//function SetSearchCriteria() {
//    var searchset =
//    {
//        SiteID: $('#UserSite').val(),
//        SiteName: $('#UserSiteName').val(),
//        TracerCategoryIDs: $("#TracersCategory").data("kendoMultiSelect").value().toString(),

//    }
//    return searchset;
//}

function additionalData(e) {

    return { search: SetSearchCriteria(false) }
}

function GetParameterValues() {
    var TracerCategoryIDs = [];
    var TracerCategoryNames = [];
    $('#TracersCategory :selected').each(function (i, selected) {
        TracerCategoryIDs[i] = $(selected).val();
        TracerCategoryNames[i] = ' ' + $(selected).text();
    });
    if (TracerCategoryIDs.length <= 0) {
        TracerCategoryIDs.push(defaultValue);
        TracerCategoryNames.push(defaultText);
    }

    var TracerChapterIDs = [];
    var TracerChapterNames = [];
    $('#TracersChapter :selected').each(function (i, selected) {
        TracerChapterIDs[i] = $(selected).val();
        TracerChapterNames[i] = $(selected).text();
    });
    if (TracerChapterIDs.length <= 0) {
        TracerChapterIDs.push(defaultValue);
        TracerChapterNames.push(defaultText);
    }

    var TracerStandardIDs = [];
    var TracerStandardNames = [];
    $('#TracersStandard :selected').each(function (i, selected) {
        TracerStandardIDs[i] = $(selected).val();
        TracerStandardNames[i] = $(selected).text();
    });
    if (TracerStandardIDs.length <= 0) {
        TracerStandardIDs.push(defaultValue);
        TracerStandardNames.push(defaultText);
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
    var OrgTypeLevel3IDs = [];
    var OrgTypeLevel3Names = [];
    $('#OrgCampus :selected').each(function (i, selected) {
        OrgTypeLevel3IDs[i] = $(selected).val();
        OrgTypeLevel3Names[i] = $(selected).text();
    });
    if (OrgTypeLevel3IDs.length <= 0) {
        OrgTypeLevel3IDs.push(defaultValue);
        OrgTypeLevel3Names.push(defaultText);
    }

    var OrgTypeLevel2IDs = [];
    var OrgTypeLevel2Names = [];
    $('#OrgBuilding :selected').each(function (i, selected) {
        OrgTypeLevel2IDs[i] = $(selected).val();
        OrgTypeLevel2Names[i] = $(selected).text();
    });
    if (OrgTypeLevel2IDs.length <= 0) {
        OrgTypeLevel2IDs.push(defaultValue);
        OrgTypeLevel2Names.push(defaultText);
    }

    var OrgTypeLevel1IDs = [];
    var OrgTypeLevel1Names = [];
    $('#OrgDepartment :selected').each(function (i, selected) {
        OrgTypeLevel1IDs[i] = $(selected).val();
        OrgTypeLevel1Names[i] = $(selected).text();
    });
    if (OrgTypeLevel1IDs.length <= 0) {
        OrgTypeLevel1IDs.push(defaultValue);
        OrgTypeLevel1Names.push(defaultText);
    }

    var searchset =
    {
        TracerCategoryIDs: TracerCategoryIDs.toString(),
        TracerCategoryNames: TracerCategoryNames.toString(),
        TracerChapterIDs: TracerChapterIDs.toString(),
        TracerStandardIDs: TracerStandardIDs.toString(),
        EPTextIDs: EPTextIDs.toString(),
        IncludeNonCompliantOpportunities: $('#noncompliantcheckbox').is(':checked'),
        OpportunitiesValue: $("#noncompliantvalue").data("kendoNumericTextBox").value(),
        StartDate: kendo.toString($("#ObsstartDate").data("kendoDatePicker").value(), "yyyy-MM-dd"),
        EndDate: kendo.toString($("#ObsEndDate").data("kendoDatePicker").value(), "yyyy-MM-dd"),
        ReportType: $('input[name=ReportType]:checked').val(),
        ReportGroupByType: $('input[name=ReportGroupByType]:checked').val(),
        IncludeCMS: $('#chkIncludeCMS').is(':checked'),
        ReportTitle: $('#hdnReportTitle').val(),
        StandardLabelAndEPLabels: StandardLabelAndEPLabels.toString(),
        TracerStandardNames: TracerStandardNames.toString(),
        TracerChapterNames: TracerChapterNames.toString(),
        OrgTypeLevel1IDs: OrgTypeLevel1IDs.toString(),
        OrgTypeLevel1Names: ConvertToAllOrCSV(OrgTypeLevel1Names),
        OrgTypeLevel2IDs: OrgTypeLevel2IDs.toString(),
        OrgTypeLevel2Names: ConvertToAllOrCSV(OrgTypeLevel2Names),
        OrgTypeLevel3IDs: OrgTypeLevel3IDs.toString(),
        OrgTypeLevel3Names: ConvertToAllOrCSV(OrgTypeLevel3Names),
        InActiveOrgTypes: $('#Orgtypecheckbox').is(':checked')
    }

    return searchset;
}

function SetSearchCriteria(GenfromSavedFilters) {
    //clearallmultiselectsearch();

    //only for rdlc GenfromSavedFilters is set to true only from email button
    //layout.js file common code
    return SearchSetFilterData(GenfromSavedFilters, GetParameterValues());
}

//Save the selected parameters
function SaveToMyReports(deleteReport) {
    var searchset = GetParameterValues();

    var parameterSet = [
        { ReportTitle: $('#hdnReportTitle').val() },
        { ReportType: $('input[name=ReportType]:checked').val() },
        { ReportGroupByType: $('input[name=ReportGroupByType]:checked').val() },
        { ProgramServices: $('#UserProgram').val() },
        { TracersCategory: searchset.TracerCategoryIDs },
        { TracersChapter: searchset.TracerChapterIDs },
        { TracersStandard: searchset.TracerStandardIDs },
        { TracersEP: searchset.EPTextIDs },
        { OrgCampus: searchset.OrgTypeLevel3IDs },
            { OrgBuilding: searchset.OrgTypeLevel2IDs },
            { OrgDepartment: searchset.OrgTypeLevel1IDs },
            { Orgtypecheckbox: searchset.InActiveOrgTypes }
    ];

    //Set the Report Name
    if (saveRecurrenceScreen != null && saveRecurrenceScreen === "Recurrence") {
        parameterSet.push({ ScheduledReportName: $('#txtScheduledReportName1').val() });
    }
    else {
        parameterSet.push({ ScheduledReportName: $('#txtScheduledReportName').val() });
        $('#txtScheduledReportName1').val($('#txtScheduledReportName').val());
    }

    if (deleteReport === true && parameterSet[12].ScheduledReportName === '') {
        parameterSet[12].ScheduledReportName = parameterSet[0].ReportTitle
    }

    if (searchset.IncludeNonCompliantOpportunities === true)
        parameterSet.push({ noncompliantcheckbox: searchset.OpportunitiesValue });

    if (searchset.IncludeCMS === true)
        parameterSet.push({ chkIncludeCMS: true });

    //if (deleteReport != null && deleteReport === true) {
    //    parameterSet.push({ ReportDelete: 1 });
    //    if (parameterSet.ScheduledReportName === "" || typeof parameterSet.ScheduledReportName === 'undefined')
    //    {
            
    //        parameterSet.push({ ScheduledReportName: "Limit Exceeded Report" });
    //    }
    //}
    //else {
    //    parameterSet.push({ ReportDelete: 0 });
    //}

    //Add recurrence fields to the parameter set
    GetRecurrenceParameters(parameterSet);

    //Add date parameters only there is a value
    GetObservationDate(parameterSet, searchset.StartDate, searchset.EndDate);

    //Save the parameters to the database
    SaveSchedule(parameterSet, deleteReport);
}

//Sets the saved parameters for each control
function SetSavedParameters(params) {
    $('#txtScheduledReportName').val(params.ReportNameOverride);
    $('input[name=ReportType][value="' + getParamValue(params.ReportParameters, "ReportType") + '"]').prop('checked', true);
    $('input[name=ReportGroupByType][value="' + getParamValue(params.ReportParameters, "ReportGroupByType") + '"]').prop('checked', true);

    $("#TracersCategory").data("kendoMultiSelect").value(getParamValue(params.ReportParameters, "TracersCategory").split(","));
    $("#TracersChapter").data("kendoMultiSelect").value(getParamValue(params.ReportParameters, "TracersChapter").split(","));
    $("#TracersStandard").data("kendoMultiSelect").value(getParamValue(params.ReportParameters, "TracersStandard").split(","));
    $("#TracersEP").data("kendoMultiSelect").value(getParamValue(params.ReportParameters, "TracersEP").split(","));
   // CheckboxChecked(getParamValue(params.ReportParameters, "Orgtypecheckbox"), 'Orgtypecheckbox');
    SetOrgHierarchy(params.ReportParameters);
    SetSavedObservationDate(params.ReportParameters);

    var nonCompliancePercent = getParamValue(params.ReportParameters, "noncompliantcheckbox");
    if (nonCompliancePercent != null && $.isNumeric(nonCompliancePercent)) {
        $('#noncompliantcheckbox').prop('checked', true);
        $('#noncompliantvalue').data("kendoNumericTextBox").value(nonCompliancePercent);
        $('#noncompliantvalue').data("kendoNumericTextBox").enable(true);
    }

    CheckboxChecked(getParamValue(params.ReportParameters, "chkIncludeCMS"), 'chkIncludeCMS');

    SetRecurrenceParameters(params);

    if (params.ReportMode === 2) //Generate
    {
        $('.primarySearchButton').trigger("click"); //Trigger Generate button click
    }
    else if (params.ReportMode === 3) //Copy 
    {
        UpdateReportID(false); //Clears the report id label
    }

    var reportTypeValue = $('input[name=ReportType]:checked').val();
    var cmsCheckBox = $("input:checkbox[id=chkIncludeCMS]")[0];
    if (reportTypeValue == "ExcelView") { ExcelView = true; } else { ExcelView = false; }
    if (reportTypeValue == "ExcelView" || reportTypeValue == "GraphOnly") {
        cmsCheckBox.disabled = true;
        cmsCheckBox.checked = false;
    }
    else {
        cmsCheckBox.disabled = false;
    }
    TriggerActionByReportMode(params.ReportMode);
}

//function SetDefaults() {
//    
//    $('input:radio[id*="GraphandData"]').prop("checked", true);
//    $('#noncompliantvalue').data("kendoNumericTextBox").value(100);
//    $('#noncompliantvalue').data("kendoNumericTextBox").enable(false);
//    onInactiveCheckChange();
//    ResetStandardsMultiSelect();
//    ResetEPsMultiSelect();
//}

function ResetStandardsMultiSelect() {
    if ($("#TracersStandard").length > 0) {
        var dataSource = new kendo.data.DataSource({
            data: [
              { Code: "All", TracerStandardID: "-1" }
            ]
        });
        $("#TracersStandard").data("kendoMultiSelect").setDataSource(dataSource);
        $("#TracersStandard").data("kendoMultiSelect").value("-1");
    }
}


//Resets the EPs MultiSelect control to All option
function ResetEPsMultiSelect() {
    if ($("#TracersEP").length > 0) {
        var dataSource = new kendo.data.DataSource({
            data: [
              { StandardLabelAndEPLabel: "All", EPTextID: "-1" }
            ]
        });
        $("#TracersEP").data("kendoMultiSelect").setDataSource(dataSource);
        $("#TracersEP").data("kendoMultiSelect").value("-1");
    }
}

function HideGrid(gridName) {
    $("#" + gridName).hide();
    $("#" + gridName).data("kendoGrid").unbind();
}

//on button click generate the rdlc report
function GenerateReport(GenfromSavedFilters, Withemail) {
    dataLimitIssue = false;
    ClearGrids();
    if ($('input[name=ReportType]:checked').val() == "ExcelView") {
        $("#loadrdlc").html("");

        hasExcelData = true;

        //set this variable for common emailing funcationality
        ExcelGenerated = true;

        if ($('input[name=ReportGroupByType]:checked').val() == "Standard") {
            if (navigator != undefined && navigator.appVersion != undefined && (navigator.appVersion.indexOf("MSIE 8") != -1)) {        //this is for only ie condition ( microsoft internet explore )

                $.ajax({
                    async: false,
                    url: '/Tracer/TracerByEP/LoadTracerByEPGroupByStandardIE8',
                    dataType: "html",
                    success: function (data) {
                        $('#loadAview').html(data);
                    }
                });
                ExcelGridName = "gridTCSTDIE8";
                ExcelBindData("gridTCSTDIE8");
                SetColumnHeader("gridTCSTDIE8", 7);
            }
            else {
                $.ajax({
                    async: false,
                    url: '/Tracer/TracerByEP/LoadTracerByEPGroupByStandard',
                    dataType: "html",
                    success: function (data) {
                        $('#loadAview').html(data);
                    }
                });
                ExcelGridName = "gridTCSTD";
                ExcelBindData("gridTCSTD");
                SetColumnHeader("gridTCSTD", 7);
            }



        }
        else if ($('input[name=ReportGroupByType]:checked').val() == "EP") {
            if (navigator != undefined && navigator.appVersion != undefined && (navigator.appVersion.indexOf("MSIE 8") != -1)) {        //this is for only ie condition ( microsoft internet explore )
                $.ajax({
                    async: false,
                    url: '/Tracer/TracerByEP/LoadTracerByEPGroupByEPIE8',
                    dataType: "html",
                    success: function (data) {
                        $('#loadAview').html(data);
                    }
                });

                ExcelGridName = "gridTCEPIE8";
                ExcelBindData("gridTCEPIE8");
                SetColumnHeader("gridTCEPIE8", 7);

            }
            else {
                $.ajax({
                    async: false,
                    url: '/Tracer/TracerByEP/LoadTracerByEPGroupByEP',
                    dataType: "html",
                    success: function (data) {
                        $('#loadAview').html(data);
                    }
                });

                ExcelGridName = "gridTCEP";
                ExcelBindData("gridTCEP");
                SetColumnHeader("gridTCEP", 7);
            }

        }
        else if ($('input[name=ReportGroupByType]:checked').val() == "EPWithQuestions") {
            if (navigator != undefined && navigator.appVersion != undefined && (navigator.appVersion.indexOf("MSIE 8") != -1)) {        //this is for only ie condition ( microsoft internet explore )
                $.ajax({
                    async: false,
                    url: '/Tracer/TracerByEP/LoadTracerByEPGroupByEPQuesIE8',
                    dataType: "html",
                    success: function (data) {
                        $('#loadAview').html(data);
                    }
                });

                ExcelGridName = "gridTCEPQIE8";
                ExcelBindData("gridTCEPQIE8");
                SetColumnHeader("gridTCEPQIE8", 7);

            }
            else {
                $.ajax({
                    async: false,
                    url: '/Tracer/TracerByEP/LoadTracerByEPGroupByEPQues',
                    dataType: "html",
                    success: function (data) {
                        $('#loadAview').html(data);
                    }
                });

                ExcelGridName = "gridTCEPQ";
                ExcelBindData("gridTCEPQ");
                SetColumnHeader("gridTCEPQ", 7);
            }


        }
        else {
            if (navigator != undefined && navigator.appVersion != undefined && (navigator.appVersion.indexOf("MSIE 8") != -1)) {        //this is for only ie condition ( microsoft internet explore )

                $.ajax({
                    async: false,
                    url: '/Tracer/TracerByEP/LoadTracerByEPGroupByEPDeptIE8',
                    dataType: "html",
                    success: function (data) {
                        $('#loadAview').html(data);
                    }
                });
                ExcelGridName = "gridTCEPDIE8";
                ExcelBindData("gridTCEPDIE8");
                SetColumnHeader("gridTCEPDIE8", 7);
            }
            else {
                $.ajax({
                    async: false,
                    url: '/Tracer/TracerByEP/LoadTracerByEPGroupByEPDept',
                    dataType: "html",
                    success: function (data) {
                        $('#loadAview').html(data);
                    }
                });
                ExcelGridName = "gridTCEPD";
                ExcelBindData("gridTCEPD");
                SetColumnHeader("gridTCEPD", 7);
            }

        }
    }

    else {
        RdlcGenerated = true;
        //$(".loading").show();

        ShowLoader();

        var rdlcsearch = SetSearchCriteria(GenfromSavedFilters);
        $.ajax({
            type: "Post",
            url: GetRDLC,
            contentType: "application/json",
            data: JSON.stringify({ search: rdlcsearch, emailInput: Withemail }),
            success: function (response) {
                $("#loadrdlc").html(response);
                //$(".loading").hide();

                HideLoader();

            }
        });

    }
}

function SetDefaults() {
    $('input:radio[id*="GraphandData"]').prop("checked", true);
    $('input:radio[id="_ReportGroupByType_EP"]').prop("checked", true);
    $('#noncompliantvalue').data("kendoNumericTextBox").value(100);
    $('#noncompliantvalue').data("kendoNumericTextBox").enable(false);
    var cmsCheckBox = $("input:checkbox[id=chkIncludeCMS]")[0];
    if (cmsCheckBox) {
        cmsCheckBox.disabled = false;
    }
    onInactiveCheckChange();
    ResetStandardsMultiSelect();
    ResetEPsMultiSelect();
}

$(document).ready(function () {
    //set the excel view or not based on radio button chagne
    $("input[name=ReportType]:radio").change(function () {

        var reportTypeValue = $('input[name=ReportType]:checked').val();
        if (reportTypeValue == "ExcelView") { ExcelView = true; } else { ExcelView = false; }

        var cmsCheckBox = $("input:checkbox[id=chkIncludeCMS]")[0];

        if (reportTypeValue == "ExcelView" || reportTypeValue == "GraphOnly") {
            cmsCheckBox.disabled = true;
            cmsCheckBox.checked = false;
        }
        else {
            cmsCheckBox.disabled = false;
        }

    });
    //Set the default report style selection to Graph
    $('input:radio[id*="GraphandData"]').prop('checked', true);
    $('input:radio[id="_ReportGroupByType_EP"]').prop("checked", true);
   // SetDefaults();
    // Reset these additional parameters
    $("#resetfiltersbutton").click(function () {
        SetDefaults();
    });

    //Load the saved parameters
    if ($.isNumeric($('#lblReportScheduleID').html())) {
        GetSavedParameters($('#lblReportScheduleID').html());
    }
});

function AddExportParameters() {

    var paramsearchset = $.parseJSON(sessionStorage.getItem('searchsetsession'));

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
                { value: "Tracer Category" },
                { value: paramsearchset.TracerCategoryNames }
                ]
            },
               {
                   cells: [
                   { value: "Report Type" },
                   { value: paramsearchset.ReportType }
                   ]
               },
              {
                  cells: [
                  { value: "Group By" },
                  { value: paramsearchset.ReportGroupByType }
                  ]
              },
            {
                cells: [
                { value: "Start Date" },
                { value: paramsearchset.StartDate }
                ]
            },
            {
                cells: [
                { value: "End Date" },
                { value: paramsearchset.EndDate }
                ]
            },
               {
                   cells: [
                   { value: "Chapter" },
                   { value: paramsearchset.TracerChapterNames }
                   ]
               },
            {
                cells: [
                { value: "Standards" },
                { value: paramsearchset.TracerStandardNames }
                ]
            },
            {
                cells: [
                { value: "EPs" },
                { value: paramsearchset.StandardLabelAndEPLabels }
                ]
            },
               {
                   cells: [
                   { value: "Only include non–compliant questions" },
                   { value: paramsearchset.IncludeNonCompliantOpportunities == true ? "True" : "False" }
                   ]
               },
                {
                    cells: [
                    { value: "Percentage compliance of non-compliant questions" },
                    { value: paramsearchset.OpportunitiesValue.toString() }
                    ]
                },
                   {
                       cells: [
                       { value: "Include CMS Crosswalk" },
                       { value: paramsearchset.IncludeCMS == true ? "True" : "False" }
                       ]
                   },
            {
                cells: [
                { value: "Department" },
                { value: paramsearchset.OrgTypeLevel1Names }
                ]
            },
            {
                cells: [
                { value: $("#OrgRanking2Name").val() },
                { value: $("#OrgRanking2Name").val() != "" ? paramsearchset.OrgTypeLevel2Names : "" }
                ]
            },
            {
                cells: [
                { value: $("#OrgRanking3Name").val() },
                { value: $("#OrgRanking3Name").val() != "" ? paramsearchset.OrgTypeLevel3Names : "" }
                ]
            }

        ]
    }
    return stringvalue;

}

var deptselectedlist = [];
var campselectedlist = [];
var buildselectedlist = [];
var OrganizationTypeListL3Update = $("#OrganizationTypeListL3Update").val();
var OrganizationTypeListL2Update = $("#OrganizationTypeListL2Update").val();
var OrganizationTypeListL1Update = $("#OrganizationTypeListL1Update").val();
var OrganizationTypeInactive = $("#OrganizationTypeInactive").val();

function orgTypeLevelFilter(searchinputset) {
    //Organization type list multiple mulitselect(s) update

    orglevel3update(searchinputset);
    orglevel2update(searchinputset);
    orglevel1update(searchinputset);
}
//on level3 orgnization type Change filter the level 2 and level 1 multiselect boxes.
function onlevel3Change(e) {
    PreserveSelectedList = false;
    var searchinputset = SetSearchCriteria();
    searchinputset.OrgTypeLevel2IDs = "";
    orglevel2update(searchinputset);
    orglevel1update(searchinputset);
}
//on level2 orgnization type Change filter level 1 multiselect boxes.
function onlevel2Change(e) {
    PreserveSelectedList = false;
    var searchinputset = SetSearchCriteria();
    orglevel1update(searchinputset);

}

function OrganizationTypeInactiveupdate() {

    $.ajax({
        type: "Post",
        async: false,
        url: OrganizationTypeInactive,
        contentType: "application/json",
        success: function (response) {
            $("#inactiveCheckbox").html(response);
        },
        error: function (response) {
        }
    });
}
function orglevel3update(searchinput) {

    searchinput.OrgTypeLevel3IDs = "";
    $("#OrgRanking3Name").remove();
    $.ajax({
        type: "Post",
        async: false,
        url: OrganizationTypeListL3Update,
        contentType: "application/json",
        data: JSON.stringify({ search: searchinput }),
        success: function (response) {
            $("#tracerorgcampus").html(response);
        }
    });
    if (PreserveSelectedList) {
        if (campselectedlist.toString() != "-1" && campselectedlist.toString() != "") {
            $("#OrgCampus").data("kendoMultiSelect").value(campselectedlist);
        }
    }

}
function orglevel2update(searchinput1) {

    $("#OrgRanking2Name").remove();
    $.ajax({
        type: "Post",
        async: false,
        url: OrganizationTypeListL2Update,
        contentType: "application/json",
        data: JSON.stringify({ search: searchinput1 }),
        success: function (response) {
            $("#tracerorgbuilding").html(response);
        }
    });
    if (PreserveSelectedList) {
        if (buildselectedlist.toString() != "-1" && buildselectedlist.toString() != "") {
            $("#OrgBuilding").data("kendoMultiSelect").value(buildselectedlist);
        }
    }

}

function orglevel1update(searchinput2) {

    $("#OrgRanking1Name").remove();
    $.ajax({
        type: "Post",
        async: false,
        url: OrganizationTypeListL1Update,
        contentType: "application/json",
        data: JSON.stringify({ search: searchinput2 }),
        success: function (response) {
            $("#tracerorgdepartment").html(response);
        }
    });
    if (PreserveSelectedList) {
        if (deptselectedlist.toString() != "-1" && deptselectedlist.toString() != "") {
            $("#OrgDepartment").data("kendoMultiSelect").value(deptselectedlist);
        }
    }


}