var GetRDLC = $("#GetRDLC").val();

var reportTracerTypeID = 1;

function additionalData(e) {

    return { search: SetSearchCriteria(false) }
}

function GetParameterValues() {
    var TracerCategoryIDs = [];
    var TracerCategoryNames = [];

    $('#TracersCategory :selected').each(function (i, selected) {
        TracerCategoryIDs[i] = $(selected).val();
        TracerCategoryNames[i] = $(selected).text();
    });
    if (TracerCategoryIDs.length <= 0) {
        TracerCategoryIDs.push(defaultValue);
        TracerCategoryNames.push(defaultText);
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
        TracerCategoryNames: ConvertToAllOrCSV(TracerCategoryNames),
        TracerListIDs: TracerListIDs.toString(),
        TracerListNames: ConvertToAllOrCSV(TracerListNames),
        OrgTypeLevel1IDs: OrgTypeLevel1IDs.toString(),
        OrgTypeLevel1Names: ConvertToAllOrCSV(OrgTypeLevel1Names),
        OrgTypeLevel2IDs: OrgTypeLevel2IDs.toString(),
        OrgTypeLevel2Names: ConvertToAllOrCSV(OrgTypeLevel2Names),
        OrgTypeLevel3IDs: OrgTypeLevel3IDs.toString(),
        OrgTypeLevel3Names: ConvertToAllOrCSV(OrgTypeLevel3Names),
        InActiveOrgTypes: $('#Orgtypecheckbox').is(':checked'),
        IncludeFollowup: $('#IncludeFollowupcheckbox').is(':checked'),
        IncludeNonCompliantOpportunities: $('#noncompliantcheckbox').is(':checked'),
        IncludeNA: $('#IncludeNAcheckbox').is(':checked'),
        IncludeFSA: $('#IncludeFSAcheckbox').is(':checked'),
        OpportunitiesValue: $("#noncompliantvalue").data("kendoNumericTextBox").value(),
        StartDate: kendo.toString($("#ObsstartDate").data("kendoDatePicker").value(), "yyyy-MM-dd"),
        EndDate: kendo.toString($("#ObsEndDate").data("kendoDatePicker").value(), "yyyy-MM-dd"),
        ReportTypeSumDet: $('input[name=ReportTypeSumDet]:checked').val(),
        GroupByObsQues: $('input[name=GroupByObsQues]:checked').val(),
        ReportTitle: $('#hdnReportTitle').val(),
        TracerTypeID: reportTracerTypeID
    }

    return searchset;
}

function SetSearchCriteria(GenfromSavedFilters) {
    //clearallmultiselectsearch();

    //only for rdlc GenfromSavedFilters is set to true only from email button
    //layout.js file common code
    return SearchSetFilterData(GenfromSavedFilters, GetParameterValues());
}

function GenerateReport(GenfromSavedFilters, Withemail) {
    ClearGrids();
    dataLimitIssue = false;

    ShowLoader();

    if ($('input[name=ReportTypeSumDet]:checked').val() == "ExcelView") {

        hasExcelData = true;

        $("#loadrdlc").html("");
        //set this variable for common emailing funcationality
        ExcelGenerated = true;

        if ($('input[name=GroupByObsQues]:checked').val() == "Question") {
            // By Question View

            if (navigator != undefined && navigator.appVersion != undefined && (navigator.appVersion.indexOf("MSIE 8") != -1)) {        //this is for only ie condition ( microsoft internet explore )
                $.ajax({
                    async: false,
                    url: '/Tracer/TracerComprehensive/LoadTracerComprehensiveByQuestionIE8',
                    dataType: "html",
                    success: function (data) {
                        $('#loadAview').html(data);
                        HideLoader();
                    }
                });

                ExcelGridName = "gridTCQUESIE8";
                ExcelBindData("gridTCQUESIE8")
                SetColumnHeader("gridTCQUESIE8", 5);
            }
            else {
                $.ajax({
                    async: false,
                    url: '/Tracer/TracerComprehensive/LoadTracerComprehensiveByQuestion',
                    dataType: "html",
                    success: function (data) {
                        $('#loadAview').html(data);
                        HideLoader();
                    }
                });

                ExcelGridName = "gridTCQUES";
                ExcelBindData("gridTCQUES")
                SetColumnHeader("gridTCQUES", 5);
            }

        }
        else {
            // By Response (Observation) View 
            if (navigator != undefined && navigator.appVersion != undefined && (navigator.appVersion.indexOf("MSIE 8") != -1)) {        //this is for only ie condition ( microsoft internet explore )
                $.ajax({
                    async: false,
                    url: '/Tracer/TracerComprehensive/LoadTracerComprehensiveByResponseIE8',
                    dataType: "html",
                    success: function (data) {
                        $('#loadAview').html(data);
                        HideLoader();
                    }
                });
                ExcelGridName = "gridTCRESPIE8";
                ExcelBindData("gridTCRESPIE8")
                SetColumnHeader("gridTCRESPIE8", 5);
            }
            else {
                $.ajax({
                    async: false,
                    url: '/Tracer/TracerComprehensive/LoadTracerComprehensiveByResponse',
                    dataType: "html",
                    success: function (data) {
                        $('#loadAview').html(data);
                        HideLoader();
                    }
                });
                ExcelGridName = "gridTCRESP";
                ExcelBindData("gridTCRESP")
                SetColumnHeader("gridTCRESP", 5);
            }

        }
    }

    else {
        // Its an RDLC request here - let's be sure views are not emptied
        RdlcGenerated = true;

        //$(".loading").show();

       

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

//Save the selected parameters
function SaveToMyReports(deleteReport) {
    var searchset = GetParameterValues();

    var parameterSet = [
        { ProgramServices: $('#UserProgram').val() },
        { ReportTitle: $('#hdnReportTitle').val() },
        { ReportType: searchset.ReportTypeSumDet },
        { ReportGroupByType: searchset.GroupByObsQues },
        { TracersCategory: searchset.TracerCategoryIDs },
        { TracersList: searchset.TracerListIDs },
        { OrgCampus: searchset.OrgTypeLevel3IDs },
        { OrgBuilding: searchset.OrgTypeLevel2IDs },
        { OrgDepartment: searchset.OrgTypeLevel1IDs },
        { Orgtypecheckbox: searchset.InActiveOrgTypes },
        { TracerTypeID: searchset.TracerTypeID }
    ];

    
    //Set the Report Name
    if (saveRecurrenceScreen != null && saveRecurrenceScreen === "Recurrence") {
        parameterSet.push({ ScheduledReportName: $('#txtScheduledReportName1').val() });
    }
    else {
        parameterSet.push({ ScheduledReportName: $('#txtScheduledReportName').val() });
        $('#txtScheduledReportName1').val($('#txtScheduledReportName').val());
    }
    
    if (deleteReport === true && parameterSet[11].ScheduledReportName === '') {
        parameterSet[11].ScheduledReportName = parameterSet[1].ReportTitle
    }

    if (searchset.IncludeNonCompliantOpportunities === true)
        parameterSet.push({ noncompliantcheckbox: searchset.OpportunitiesValue });

    if (searchset.IncludeFollowup === true)
        parameterSet.push({ IncludeFollowupcheckbox: true });

    if (searchset.IncludeNA === true)
        parameterSet.push({ IncludeNAcheckbox: true });

    if (searchset.IncludeFSA === true)
        parameterSet.push({ IncludeFSAcheckbox: true });

    //Add recurrence fields to the parameter set
    GetRecurrenceParameters(parameterSet);

    //Add date parameters only there is a value
    GetObservationDate(parameterSet, searchset.StartDate, searchset.EndDate);
    
    //Save the parameters to the database
    SaveSchedule(parameterSet, deleteReport);
}

//Sets the saved parameters for each control
function SetSavedParameters(params) {
    var savedTracerTypeID = getParamValue(params.ReportParameters, "TracerTypeID");
    if (savedTracerTypeID != null) {
        if (savedTracerTypeID == 1) {
            reportTracerTypeID = 1;
            $('input:radio[id*="TJC"]').prop("checked", true);
        }
        else {
            reportTracerTypeID = 2;
            $('input:radio[id*="CMS"]').prop("checked", true);
        }

        CategoryUpdate($('#UserSite').val(), $('#UserSiteName').val());
        tracerlistupdate();

        if (reportTracerTypeID == 1) {
            $('#IncludeFSA').show();
        }
        else {
            $('#IncludeFSAcheckbox').attr('checked', false);
            $('#IncludeFSA').hide();
        }
    }

    $('#txtScheduledReportName').val(params.ReportNameOverride);
    $('input[name=ReportTypeSumDet][value="' + getParamValue(params.ReportParameters, "ReportType") + '"]').prop('checked', true);
    if (getParamValue(params.ReportParameters, "ReportType") == "ExcelView")
        ExcelView = true;

    $('input[name=GroupByObsQues][value="' + getParamValue(params.ReportParameters, "ReportGroupByType") + '"]').prop('checked', true);

    $("#TracersCategory").data("kendoMultiSelect").value(getParamValue(params.ReportParameters, "TracersCategory").split(","));
    $("#TracersList").data("kendoMultiSelect").value(getParamValue(params.ReportParameters, "TracersList").split(","));

    CheckboxChecked(getParamValue(params.ReportParameters, "Orgtypecheckbox"), 'Orgtypecheckbox');

    SetOrgHierarchy(params.ReportParameters);
    SetSavedObservationDate(params.ReportParameters);

    var nonCompliancePercent = getParamValue(params.ReportParameters, "noncompliantcheckbox");
    if (nonCompliancePercent != null && $.isNumeric(nonCompliancePercent)) {
        $('#noncompliantcheckbox').prop('checked', true);
        $('#noncompliantvalue').data("kendoNumericTextBox").value(nonCompliancePercent);
        $('#noncompliantvalue').data("kendoNumericTextBox").enable(true);
    }

    CheckboxChecked(getParamValue(params.ReportParameters, "IncludeFollowupcheckbox"), 'IncludeFollowupcheckbox');
    CheckboxChecked(getParamValue(params.ReportParameters, "IncludeNAcheckbox"), 'IncludeNAcheckbox');
    CheckboxChecked(getParamValue(params.ReportParameters, "IncludeFSAcheckbox"), 'IncludeFSAcheckbox');

    SetRecurrenceParameters(params);

    TriggerActionByReportMode(params.ReportMode);
}

function SetDefaults() {
    $('input:radio[id*="Question"]').prop("checked", true);
    $('input:radio[id*="Summary"]').prop("checked", true);
    $('#noncompliantvalue').data("kendoNumericTextBox").value(100);
    $('#noncompliantvalue').data("kendoNumericTextBox").enable(false);
    
    $('input:radio[id*="TJC"]').prop("checked", true);
    onInactiveCheckChange();
}

$(document).ready(function () {
    //set the excel view or not based on radio button chagne
    $("input[name=ReportTypeSumDet]:radio").change(function () {
        if ($('input[name=ReportTypeSumDet]:checked').val() == "ExcelView") {
            ExcelView = true;

        } else {
            ExcelView = false;

        }
    });

    $("input[name=RegulationType]:radio").change(function () {

        reportTracerTypeID = $('input[name=RegulationType]:checked').val() === "TJC" ? 1 : 2;
        CategoryUpdate($('#UserSite').val(), $('#UserSiteName').val());
        tracerlistupdate();
        if (reportTracerTypeID == 1) {
            $('#IncludeFSA').show();
        }
        else {
            $('#IncludeFSAcheckbox').attr('checked', false);
            $('#IncludeFSA').hide();
        }
    });

    // Reset these additional parameters
    $("#resetfiltersbutton").click(function () {
        SetDefaults();
    });

    //Load the saved parameters
    if ($.isNumeric($('#lblReportScheduleID').html())) {
        GetSavedParameters($('#lblReportScheduleID').html());
    }
});

function getTracerTypeExcelExportParameter() {
    var stringselected = [];

    if ($("#hdnIsCMSProgram").val() === "True") {
        var stringValue = reportTracerTypeID === 1 ? "TJC Tracers" : "CMS Tracers";
        stringselected = {
            cells: [
                           { value: "Tracer Type" },
                           { value: stringValue }
            ]
        }
    }

    return stringselected;
}

function AddExportParameters() {

    var paramsearchset = $.parseJSON(sessionStorage.getItem('searchsetsession'));
    var OrgRanking3Nametext = $("#OrgRanking3Name").val() != "" ? $("#OrgRanking3Name").val() + ", " : "";
    var OrgRanking2Nametext = $("#OrgRanking2Name").val() != "" ? $("#OrgRanking2Name").val() + ", " : "";
    var inactivetextparam = "Include Inactive " + OrgRanking3Nametext + OrgRanking2Nametext + "Department.";
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
            getTracerTypeExcelExportParameter(),
                {
                    cells: [
                    { value: "Tracer Category" },
                    { value: paramsearchset.TracerCategoryNames }
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
                   { value: "Report Type" },
                   { value: paramsearchset.ReportTypeSumDet }
                   ]
               },
              {
                  cells: [
                  { value: "Group By" },
                  { value: paramsearchset.GroupByObsQues }
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
                       { value: "Only include with Follow-up required" },
                       { value: paramsearchset.IncludeFollowup == true ? "True" : "False" }
                       ]
                   },
                      {
                          cells: [
                          { value: "Include Not Applicable" },
                          { value: paramsearchset.IncludeNA == true ? "True" : "False" }
                          ]
                      },
                         {
                             cells: [
                             { value: "Only Include FSA EPs" },
                             { value: paramsearchset.IncludeFSA == true ? "True" : "False" }
                             ]
                         },
            {
                cells: [
                { value: inactivetextparam },
                { value: paramsearchset.InActiveOrgTypes == true ? "True" : "False" }
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

function onDataBoundQues(e) {
    if (reportTracerTypeID === 2) {//CMS
        $("#gridTCQUES").data("kendoGrid").columns[3].title = "Tag Standard";
        $("#gridTCQUES thead [data-field=StandardEP] .k-link").html("Tag Standard")
    }

}

function onDataBoundResponse(e) {
    if (reportTracerTypeID === 2) {//CMS
        $("#gridTCRESP").data("kendoGrid").columns[4].title = "Tag Standard";
        $("#gridTCRESP thead [data-field=StandardEP] .k-link").html("Tag Standard")
    }

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