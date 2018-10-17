//Get URLS from hidden fields
var GetRDLC = $("#GetRDLC").val();
var TracersCategoriesUpdate = $("#TracersCategoriesUpdate").val();
var ProgramsUpdate = $('#ProgramsUpdate').val();
var TracersChapterUpdate = $("#TracersChaptersUpdate").val();
var TracersCMSUpdate = $("#TracersCMSUpdate").val();
var UpdateProgramsInSessionURL = $("#UpdateProgramsInSession").val();
var PreferredProgramUpdate = $("#PreferredProgramUpdate").val();
var CMSTag = "";
var CMSTagText = "";
ExcelView = true;
var defaultValue = "-1";
var defaultText = "All";
loadparameters = "TracerByCMS";
//on site change // update categories and tracers list
function loadrespectiveparameters(siteID, siteName) {
    if (ExcelGridName != null && ExcelGridName != undefined && ExcelGridName != "")
        HideGrid(ExcelGridName);

    ResetAll();

    if (typeof SetDefaults == 'function') {
        SetDefaults();
    }
    //RecordSiteChangeEvent(siteID);
    //cat mulitselect update

    //cat mulitselect update
    CategoryUpdate(siteID, siteName);

    UpdateChapter();
    UpdateCMS();


  
}
//Updates the selected program in session
function UpdateProgramsInSession(programId, programName) {
    $.ajax({
        async: false,
        type: "POST",
        url: UpdateProgramsInSessionURL,
        data: {
            selectedProgramId: programId,
            selectedProgramName: programName
        }
    });
}
//Updates the selected program in the preference table
function UpdatePreferredProgram(siteID, programId) {
    $.ajax({
        type: "POST",
        url: PreferredProgramUpdate,
        data: {
            selectedSiteId: siteID,
            selectedProgramId: programId
        }
    });
}

function ToggleMultiselects(value) {
    var chapterMultiSelect = $("#TracersChapter").data("kendoMultiSelect");

    chapterMultiSelect.enable(value);
    $("#TracersCMS").data("kendoMultiSelect").enable(value);

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

function UpdatePrograms(siteID, siteName) {
    $.ajax({
        type: "GET",
        url: ProgramsUpdate,
        data: {
            selectedsiteid: siteID,
            selectedsitename: siteName,
            allPrograms: false
        },
        success: function (response) {
            $("#divPrograms").html(response);
        },
        //Default program has to be set based on user preference, so set the program session variables first with a synchronous ajax call before updating other search parameters
        async: false
    });
}

//function UpdateSites() {
//    $.ajax({
//        type: "GET",
//        url: "/Shared/LoadSites",
//        data: {
//            allSites : false
//        },
//        success: function (response) {
//            $("#divSites").html(response);
//        },
//        //Default program has to be set based on user preference, so set the program session variables first with a synchronous ajax call before updating other search parameters
//        async: false
//    });
//}

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
            UpdateCMS();
        }
    });
}

function UpdateCMS() {
    //$(".loading").show();

    ShowLoader();

    ToggleMultiselects(false);
    //cat chapter update
    $.ajax({
        type: "Post",
        url: TracersCMSUpdate,
        data: {
            selectedsiteid: $('#UserSite').val(),
            selectedsitename: $('#UserSiteName').val(),
            chapterid: $("#TracersChapter").data("kendoMultiSelect").value().toString()
        },
        success: function (response) {
            //$(".loading").hide();

            HideLoader();

            $("#tracercms").html(response);
            ToggleMultiselects(true);
        }
    });
}

function onChapChange(e) {
    UpdateCMS();
}

//on tracer category change
function onCatChange(e) {

}

function onCMSChange(e) {
    //UpdateEPs();
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

    var TracerCMSTags = [];
    var TracerCMSTagsNames = [];

    if (CMSTag == '') {
        $('#TracersCMS :selected').each(function (i, selected) {
            TracerCMSTags[i] = $(selected).val();
            TracerCMSTagsNames[i] = $(selected).text();
        });
    }
    else {
        TracerCMSTags[0] = CMSTag;
        TracerCMSTagsNames[0] = CMSTagText;
    }

    if (TracerCMSTags.length <= 0) {
        TracerCMSTags.push(defaultValue);
    }

    var searchset =
    {
        TracerCategoryIDs: TracerCategoryIDs.toString(),
        TracerCategoryNames: TracerCategoryNames.toString(),
        TracerChapterIDs: TracerChapterIDs.toString(),
        TracerChapterNames: TracerChapterNames.toString(),
        CMSTags: TracerCMSTags.toString(),
        TracerCMSTagsNames: TracerCMSTagsNames.toString(),
        IncludeNonCompliantOpportunities: $('#noncompliantcheckbox').is(':checked'),
        OpportunitiesValue: $("#noncompliantvalue").data("kendoNumericTextBox").value(),
        StartDate: kendo.toString($("#ObsstartDate").data("kendoDatePicker").value(), "yyyy-MM-dd"),
        EndDate: kendo.toString($("#ObsEndDate").data("kendoDatePicker").value(), "yyyy-MM-dd"),
        ReportType: $('input[name=ReportTypeExcel]:checked').val(),
        ReportTitle: $('#hdnReportTitle').val()
    }

    return searchset;
}

function SetSearchCriteria() {
    var searchset =
    {
        SiteID: $('#UserSite').val(),
        SiteName: $('#UserSiteName').val(),
        TracerCategoryIDs: $("#TracersCategory").data("kendoMultiSelect").value().toString(),

    }
    return searchset;
}

function additionalData(e) {

    return { search: SetSearchCriteria(false) }
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
        { ReportTitle: searchset.ReportTitle },
        { ReportType: searchset.ReportType },
        { ProgramServices: $('#UserProgram').val() },
        { TracersCategory: searchset.TracerCategoryIDs },
        { TracersChapter: searchset.TracerChapterIDs },
        { TracersCMS: searchset.CMSTags }
    ];

    //Set the Report Name
    if (saveRecurrenceScreen != null && saveRecurrenceScreen === "Recurrence") {
        parameterSet.push({ ScheduledReportName: $('#txtScheduledReportName1').val() });
    }
    else {
        parameterSet.push({ ScheduledReportName: $('#txtScheduledReportName').val() });
        $('#txtScheduledReportName1').val($('#txtScheduledReportName').val());
    }

    if (searchset.IncludeNonCompliantOpportunities === true)
        parameterSet.push({ noncompliantcheckbox: searchset.OpportunitiesValue });

    //Add recurrence fields to the parameter set
    GetRecurrenceParameters(parameterSet);

    //Add date parameters only there is a value
    GetObservationDate(parameterSet, searchset.StartDate, searchset.EndDate);

    //Save the parameters to the database
    SaveSchedule(parameterSet, deleteReport);
}

function HideGrid(gridName) {
    $("#" + gridName).hide();
    $("#" + gridName).data("kendoGrid").unbind();
}

//on button click generate the rdlc report
function GenerateReport(GenfromSavedFilters, Withemail) {
    dataLimitIssue = false;
    CMSTag = "";
    CMSTagText = "";
    $('#loadAview').html('');
    $('#loadChartView').html('');
    $('#complianceDetail').css("display", "none");
    //set this variable for common emailing funcationality
    ExcelGenerated = true;
    hasExcelData = true;
    if ($('input[name=ReportTypeExcel]:checked').val() == "ExcelView") {



        if (navigator != undefined && navigator.appVersion != undefined && (navigator.appVersion.indexOf("MSIE 8") != -1)) {        //this is for only ie condition ( microsoft internet explore )

            $.ajax({
                async: false,
                url: '/Tracer/TracerByCMS/LoadTracerByCMSIE8',
                dataType: "html",
                success: function (data) {
                    $('#loadAview').html(data);
                }
            });
            ExcelGridName = "gridTCCMSIE8";
            ExcelBindData("gridTCCMSIE8");
            SetColumnHeader("gridTCCMSIE8", 9);
        }
        else {
            $.ajax({
                async: false,
                url: '/Tracer/TracerByCMS/LoadTracerByCMS',
                dataType: "html",
                success: function (data) {
                    $('#loadAview').html(data);
                }
            });



            ExcelGridName = "gridTCCMS";
            ExcelBindData("gridTCCMS");
            SetColumnHeader("gridTCCMS", 9);
        }
        $('#loadAview').css("display", "block");
        $('#loadChartView').css("display", "none");
        // CMSTag = "";
    }
    else {

        $.ajax({
            async: false,
            url: '/Tracer/TracerByCMS/LoadTracerByCMSGraph',
            dataType: "html",
            success: function (data) {
                $('#loadChartView').html(data);
            }
        });


        $("#gridTCMSChart .k-grid-toolbar").append('  <div align="center" style="margin-top: -20px;"> Click a Tag to get details</div>');

        $('#loadAview').css("display", "none");
        $('#loadChartView').css("display", "block");
        ExcelBindData("gridTCMSChart");
        ExcelGridName = "gridTCMSChart";



    }
}

function dataBoundProgress(e) {
    var grid = this;

    $(".progress").each(function () {
        var row = $(this).closest("tr");
        var model = grid.dataItem(row);
        var val = $(this).kendoProgressBar({
            value: Math.round(model.Compliance),
            type: "percent"
        });

        if (model.TotalDenominator === 0) {
            val.children("span").css("background-color", "grey");
            val.data("kendoProgressBar").progressStatus.text("Not Applicable:100%");
        }
    });
}

function OnChangeShowDetails(arg) {
    $('#loadAview').html('');
    if (navigator != undefined && navigator.appVersion != undefined && (navigator.appVersion.indexOf("MSIE 8") != -1)) {        //this is for only ie condition ( microsoft internet explore )
        $.ajax({
            async: false,
            url: '/Tracer/TracerByCMS/LoadTracerByCMSIE8',
            dataType: "html",
            success: function (data) {
                $('#loadAview').html(data);
            }
        });
        ExcelGridName = "gridTCCMSIE8";
    }
    else {
        $.ajax({
            async: false,
            url: '/Tracer/TracerByCMS/LoadTracerByCMS',
            dataType: "html",
            success: function (data) {
                $('#loadAview').html(data);
            }
        });
        ExcelGridName = "gridTCCMS";
    }

    var data = this.dataItem(this.select());
    CMSTag = data.TagID;//IMP
    CMSTagText = data.CMSTag;


    $('#complianceDetail').css("display", "block");

    $('#loadAview').css("display", "block");
    $('#loadChartView').css("display", "none");

    ExcelBindData(ExcelGridName);
    SetColumnHeader(ExcelGridName, 9);
}

function SetDefaults() {
    //Set the default report style selection to Graph
    $('input:radio[id*="Graph"]').prop('checked', true);
    CMSTag = "";
    CMSTagText = "";
    $('#noncompliantvalue').data("kendoNumericTextBox").value(100);
    $('#noncompliantvalue').data("kendoNumericTextBox").enable(false);

}

$(document).ready(function () {
  //  UpdateSites();
    //set the excel view or not based on radio button chagne
    $("input[name=ReportType]:radio").change(function () {

        var reportTypeValue = $('input[name=ReportType]:checked').val();
        if (reportTypeValue == "ExcelView") { ExcelView = true; } else { ExcelView = false; }


    });

    $("#btnBacktoChart")
     .bind("click", function () {
         CMSTag = "";
         CMSTagText = "";
         ExcelGridName = "gridTCMSChart";

         $('#loadAview').css("display", "none");
         $('#complianceDetail').css("display", "none");
         $('#loadChartView').css("display", "block");

     });

    //set the excel view or not based on radio button chagne
    $("input[name=ReportTypeExcel]:radio").change(function () {
        if ($('input[name=ReportTypeExcel]:checked').val() == "ExcelView") {
            CMSTag = "";
            CMSTagText = "";
            if (!ExcelGenerated) {
                $('#complianceDetail').css("display", "none");
            }
            ExcelGridName = "gridTCCMS";
            ExcelGenerated = false;
        } else {

            ExcelGridName = "gridTCMSChart";
            ExcelGenerated = false;
        }
    })

    SetDefaults();
    // Reset these additional parameters
    $("#resetfiltersbutton").click(function () {
        SetDefaults();
    });

    //Load the saved parameters
    if ($.isNumeric($('#lblReportScheduleID').html())) {
        GetSavedParameters($('#lblReportScheduleID').html());
    }

    $('#ProgramsUL li .AvailablePrograms').hide().filter(function () {
        return $(this).text().toLowerCase().indexOf('hospital') != -1;
    }).show();
    $('#programsearchli').css("display", "none");
});

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
                    { value: "Tracer Category" },
                    { value: paramsearchset.TracerCategoryNames }
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
                    { value: "Tag" },
                    { value: paramsearchset.TracerCMSTagsNames }
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
                    { value: "Tracer Type" },
                    { value: "TJC Tracers" }
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
                    { value: "Tracer Category" },
                    { value: paramsearchset.TracerCategoryNames }
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
                    { value: "Tag" },
                    { value: paramsearchset.TracerCMSTagsNames }
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
                }
            ]
        }
    }
    return stringvalue;
}

//Sets the saved parameters for each control
function SetSavedParameters(params) {
    $('#txtScheduledReportName').val(params.ReportNameOverride);
    $('input[name=ReportTypeExcel][value="' + getParamValue(params.ReportParameters, "ReportType") + '"]').prop('checked', true);

    $("#TracersCategory").data("kendoMultiSelect").value(getParamValue(params.ReportParameters, "TracersCategory").split(","));
    $("#TracersChapter").data("kendoMultiSelect").value(getParamValue(params.ReportParameters, "TracersChapter").split(","));
    $("#TracersCMS").data("kendoMultiSelect").value(getParamValue(params.ReportParameters, "TracersCMS").split(","));

    SetSavedObservationDate(params.ReportParameters);

    var nonCompliancePercent = getParamValue(params.ReportParameters, "noncompliantcheckbox");
    if (nonCompliancePercent != null && $.isNumeric(nonCompliancePercent)) {
        $('#noncompliantcheckbox').prop('checked', true);
        $('#noncompliantvalue').data("kendoNumericTextBox").value(nonCompliancePercent);
        $('#noncompliantvalue').data("kendoNumericTextBox").enable(true);
    }

    SetRecurrenceParameters(params);

    if (params.ReportMode === 2) //Generate
    {
        $('.primarySearchButton').trigger("click"); //Trigger Generate button click
    }
    else if (params.ReportMode === 3) //Copy 
    {
        UpdateReportID(false); //Clears the report id label
    }
}

function pdfExport(e) {

    e.preventDefault();
    //$('.loading').show();
    var dataSource = $("#gridTCMSChart").data("kendoGrid").dataSource;
    var filters = dataSource.filter();
    var sorts = dataSource.sort();
    var allData = dataSource.data();
    var query = new kendo.data.Query(allData);
    var data = query.filter(filters).data;
    var dataSortBy = "";
    var dataSortOrder = "";

    if (sorts != null) {
        if (sorts.length > 0) {
            dataSortBy = sorts[0].field.toString();
            dataSortOrder = sorts[0].dir.toString();
        }
    }

    var filtereddataCMS = [];
    jQuery.each(data, function (i, val) {
        filtereddataCMS[i] = val.TagID.toString();

    });

    if (fromemail) {
        if (hasExcelData) {

            $.ajax({
                type: "Post",
                url: "/Export/CreateSessionCriteriaCMS",
                contentType: "application/json",
                data: JSON.stringify({ search: SearchSetFilterData(true), filtereddataCMS: filtereddataCMS.toString() })

            }).done(function (e) {
                $(function () {
                    $.post('/Email/SendPDFEmail',
                      { ExcelGridName: 'Tracer by CMS', email: $.parseJSON(sessionStorage.getItem('searchsetemailsession')), SortBy: dataSortBy, SortOrder: dataSortOrder }, function (data) {
                          fromemail = false;
                          if (data != "Preping Second Attachment") {
                              if (data != "Successfully sent report to the email account(s)") {
                                  $('#emailerror_msg').removeClass("alert-info").addClass("alert-danger");
                              }
                              else {
                                  $('#emailerror_msg').removeClass("alert-danger").addClass("alert-info");
                              }
                              $('#emailerror_msg').css("display", "block");
                              $('#email_msg').html(data);
                          }

                      });
                });
            });
        }
    }
    else { 
    $.ajax({
        type: "Post",
        url: "/Export/CreateSessionCriteriaCMS",
        contentType: "application/json",
        data: JSON.stringify({ search: SearchSetFilterData(true), filtereddataCMS: filtereddataCMS.toString() })

    }).done(function (e) {

        window.location = kendo.format("{0}{1}{2}{3}",
       "/Tracer/TracerByCMS/CMSPDF_Export?SortBy=", dataSortBy, "&SortOrder=", dataSortOrder);
    });
    }
    //$('.loading').hide();

}