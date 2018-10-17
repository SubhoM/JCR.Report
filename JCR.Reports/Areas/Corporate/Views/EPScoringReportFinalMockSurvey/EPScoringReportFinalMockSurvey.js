
var defaultValue = "-1";
var defaultText = "All";
ExcelView = false;
var GenerateForEmail = false;
var ExportReportName = "";
var reportTitleWithMockSurvey = 'Final and Mock Survey Scoring';
var reportTitleWithFinal = 'Final Scoring';

var DocumentationDataSource = [
    { text: "All", value: "1" },
    { text: "Presence of", value: "2" },
    { text: "Absence of", value: "3" }
];
useStickyDate = true;

function CreateDocumentationDropdown(ctrlName, placeHolderText) {

    $("#" + ctrlName).kendoMultiSelect({
        dataTextField: "text",
        dataValueField: "value",
        dataSource: DocumentationDataSource,
        value: 1,
        placeholder: placeHolderText,
        select: function (e) {
            $("#" + ctrlName).data("kendoMultiSelect").value([]);
        }
    });

    addarrowtomultiselect(ctrlName);
};

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

function ShowHideMockSurveyDetails() {
    
    if (isCorporateSiteSelected == true) {
        ExportReportName = reportTitleWithMockSurvey;
        CheckboxChecked('True', 'MScoreCheckbox');
        $('#divMockSurveyDetails').show();
        $('#divMockSurveyDocumentations').show();
    }
    else {
        ExportReportName = reportTitleWithFinal;
        CheckboxChecked('False', 'MScoreCheckbox');
        $('#divMockSurveyDetails').hide();
        $('#divMockSurveyDocumentations').hide();
    }
    $('#ReportTitle').text(ExportReportName);
    SetEmailSubject(); // Explicitly call to change the email subject line because the Report title is changing dynamically.
}

function onMockSurveyScoreCheckChange() {
    
    var MockSurveyNameList = $("#MockSurveyNameList").data("kendoMultiSelect");
    var dropdownlistMockSurveyFindings = $("#divMockSurveyFindings").data("kendoMultiSelect");
    var dropdownlistMockSurveyRecommendations = $("#divMockSurveyRecommendations").data("kendoMultiSelect");

    if (getMockSurveyScoreCheckBoxValue()) {
        MockSurveyNameList.enable(true);
        dropdownlistMockSurveyFindings.enable(true);
        dropdownlistMockSurveyRecommendations.enable(true);
    }
    else {
        MockSurveyNameList.enable(false);
        dropdownlistMockSurveyFindings.enable(false);
        dropdownlistMockSurveyRecommendations.enable(false);
        MockSurveyNameList.value("-1");
        dropdownlistMockSurveyFindings.value(1);
        dropdownlistMockSurveyRecommendations.value(1);
    }

}

function onMSProgramChange(e) {
    
    var MultiSiteProgramIDs = [];
    var selectedProgramID = $("#MultiSiteProgram").data("kendoMultiSelect").value().toString();
    SetStickyDate(selectedProgramID);
    if (selectedProgramID == '-1') {
        ResetStandardsMultiSelect();
        ResetScoredByMultiSelect();
        if (isCorporateSiteSelected)
            ResetMockSurveyNameListMultiSelect();
    }
    else {
        MultiSiteChapterCall(ERSites.getSelectedSites().replace(/,/g, ''), 0, selectedProgramID);
    }

    create_error_elem();
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
            
            if (!isSavedReportLoading) {
                MultiScoredByCall();

                if (isCorporateSiteSelected)
                    MockSurveyNameListCall();
            }
        }
    });
}

function MultiScoredByCall() {
    
    var ChapterIDs = $("#MultiSiteChapter").data("kendoMultiSelect").value().toString();
    var StandardIDs = $('#AMPStandard').data("kendoMultiSelect").value().toString();

    var FinalScore = $('#FScoreCheckbox').is(":checked") == true ? 3 : 0;
    var MockSurveyScore = $('#MScoreCheckbox').is(":checked") == true ? 4 : 0;
    var MultiScoredByUrl = '/Corporate/EPScoring/GetScoredByForEPs';

    var ScoreType = '';
    if ($('#FScoreCheckbox').is(":checked") == true)
        ScoreType += '3,';

    if ($('#MScoreCheckbox').is(":checked") == true)
        ScoreType += '4,';

    if (ScoreType == '') {
        var dataSource = new kendo.data.DataSource({
            data: [
                { UserName: "All", UserID: "-1" }
            ]
        });
        $("#divMultiSiteEpScoredBy").data("kendoMultiSelect").setDataSource(dataSource);
        $("#divMultiSiteEpScoredBy").data("kendoMultiSelect").value("-1");
        return;
    }

    if ($('#hdnSitesCount').val() == 1) {
        sites = $('#hdnSingleSiteID').val();
    }
    else {
        sites = ERSites.getSelectedSites();
    }
    selectedSites = sites.replace(/,/g, '');


    $.ajax({
        async: false,
        cache: false,
        dataType: "html",
        url: MultiScoredByUrl,
        data: {
            siteID: selectedSites,
            selectedProgramID: GetMultiSiteProgramSelectedValue().replace(/,/g, ''),
            selectedChapterIDs: ChapterIDs,
            selectedStandardIDs: StandardIDs,
            selectedScoreType: ScoreType.replace(/,\s*$/, "")
        },
        success: function (response) {
            $("#divMultiSiteEpScoredBy").html(response);
        }
    });
}

function ResetScoredByMultiSelect() {
    if ($("#MultiSiteEpScoredBy").length > 0) {
        var dataSource = new kendo.data.DataSource({
            data: [
                { UserName: "All", UserID: "-1" }
            ]
        });
        $("#MultiSiteEpScoredBy").data("kendoMultiSelect").setDataSource(dataSource);
        $("#MultiSiteEpScoredBy").data("kendoMultiSelect").value("-1");
    }
}

function MockSurveyNameListCall() {

    if ($('#hdnSitesCount').val() == 1) {
        sites = $('#hdnSingleSiteID').val();
    }
    else {
        sites = ERSites.getSelectedSites();
    }
    selectedSites = sites.replace(/,/g, '');

    var programID = GetMultiSiteProgramSelectedValue().replace(/,/g, '');

    if (programID == '') {
        programID = 0;
    }

    $.ajax({
        async: false,
        cache: false,
        dataType: "html",
        url: '/Corporate/EPScoringReportFinalMockSurvey/GetMockSurveyNameList',
        data: {
            selectedSiteIDs: selectedSites,
            programID: programID
        },
        success: function (response) {
            $("#divMockSurveyNameList").html(response);
            onMockSurveyScoreCheckChange();
        }
    });
}

function ResetMockSurveyNameListMultiSelect() {
    if ($("#MockSurveyNameList").length > 0) {
        var dataSource = new kendo.data.DataSource({
            data: [
                { MockSurveyName: "All", MockSurveyID: "-1" }
            ]
        });
        $("#MockSurveyNameList").data("kendoMultiSelect").setDataSource(dataSource);
        $("#MockSurveyNameList").data("kendoMultiSelect").value("-1");
    }
}

function onMockSurveySelect(e) {
    var dataItem = this.dataSource.view()[e.item.index()];
    var values = this.value();

    if (dataItem.MockSurveyName === "All") {
        $('#MockSurveyNameList').data("kendoMultiSelect").value([]);

    } else if (jQuery.inArray("-1", values)) {
        values = $.grep(values, function (value) {
            return value !== -1;
        });

        if (values == "") { this.value(values); }
    }
}

function onMSScoredBySelect(e) {
    var dataItem = this.dataSource.view()[e.item.index()];
    var values = this.value();

    if (dataItem.UserName === "All") {
        $('#MultiSiteEpScoredBy').data("kendoMultiSelect").value([]);

    } else if (jQuery.inArray("-1", values)) {
        values = $.grep(values, function (value) {
            return value !== -1;
        });

        if (values == "") { this.value(values); }
    }
}

function onMSScoredByChange() {
}

$(window).resize(function () {
    console.log("windowFuntion");
    var btntitle = $("#toggle").attr("title");
    if (btntitle == "Maximize") 
        gridAutoHeight($('#loadExcelGrid').getKendoGrid(), 246);
    else
        gridAutoHeight($('#loadExcelGrid').getKendoGrid(), 82);
});

$(document).ready(function () {        

    ShowHideMockSurveyDetails();

    CreateDocumentationDropdown('divPlanOfAction', 'Select Plan of Action');
    CreateDocumentationDropdown('divOrgFindings', 'Select Org Findings');
    CreateDocumentationDropdown('divOrgNotes', 'Select Org Notes');
    CreateDocumentationDropdown('divLinkedDocs', 'Select Linked Documents');
    CreateDocumentationDropdown('divMockSurveyFindings', 'Select Mock Survey Findings');
    CreateDocumentationDropdown('divMockSurveyRecommendations', 'Select MockSurvey Recommendations');

    $("#MScoreCheckbox").change(function () {
        onMockSurveyScoreCheckChange();
    });

    $("#exportoexcel").css("display", "none");
    $("#exportoexcel").click(function () {
        ERExcelExportFunction();
    });
    
    //to toggle to full screen mode for excel view
    $("#toggle").click(function () {
        GridToggleFunction();
    });

    $("input[name=ReportLevelChange]:radio").change(function () {
        if ($('#DetailReport').is(':checked') || $('#ExcelViewReport').is(':checked')) {
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
    $('input[name=grpBy][value=Summary]').prop('checked', true);

    LoadDefaultProgramSelect();
    ResetStandardsMultiSelect();
    EnableDisableEmail(false);
    
    $('#IncludeCMSCheckbox').attr("disabled", 'disabled');
    CheckboxChecked('True', 'SummaryReport');
    CheckboxChecked('True', 'FScoreCheckbox');
    CheckboxChecked('True', 'MScoreCheckbox');

    CheckboxChecked('True', 'SatisfactoryCheckbox');
    CheckboxChecked('True', 'InsufficientCheckbox');
    CheckboxChecked('True', 'NACheckbox');
    CheckboxChecked('False', 'NotScored');
    CheckboxChecked('True', 'chkAssigned');
    CheckboxChecked('False', 'chkNotAssigned');
    CheckboxChecked('False', 'chkIncludeFSA');
    CheckboxChecked('False', 'chkdocRequired');
    CheckboxChecked('False', 'chkNewChangedEps');

    var dropdownlistPlanOfAction = $("#divPlanOfAction").data("kendoMultiSelect");
    dropdownlistPlanOfAction.value(1);
    var dropdownlistOrgFindings = $("#divOrgFindings").data("kendoMultiSelect");
    dropdownlistOrgFindings.value(1);
    var dropdownlistOrgNotes = $("#divOrgNotes").data("kendoMultiSelect");
    dropdownlistOrgNotes.value(1);
    var dropdownlistLinkedDocs = $("#divLinkedDocs").data("kendoMultiSelect");
    dropdownlistLinkedDocs.value(1);


    if (isCorporateSiteSelected) {
        onMockSurveyScoreCheckChange();

        var dropdownlistMockSurveyFindings = $("#divMockSurveyFindings").data("kendoMultiSelect");
        dropdownlistMockSurveyFindings.value(1);
        var dropdownlistMockSurveyRecommendations = $("#divMockSurveyRecommendations").data("kendoMultiSelect");
        dropdownlistLinkedDocsRecommendations.value(1);
    }
    
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

    if ($('#FScoreCheckbox').is(':checked') == false && getMockSurveyScoreCheckBoxValue() == false) {

        showValidationAlert("Score Type is required.");

        isPageValid = false;
        return isPageValid;
    }


    if (($('#SatisfactoryCheckbox').is(':checked') == false && $('#InsufficientCheckbox').is(':checked') == false && $('#NACheckbox').is(':checked') == false
        && $('#NotScored').is(':checked') == false)) {

        showValidationAlert("Score Value is required.");

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

    if ($('#SummaryReport').is(':checked')) {
        if (GenerateForEmail) {
            var email = $.parseJSON(sessionStorage.getItem('searchsetemailsession'));
            GenerateReport_RDLC(GenfromSavedFilters, email, 'Summary');
            GenerateForEmail = false;
        }
        else {
            GenerateReport_RDLC(GenfromSavedFilters, Withemail, 'Summary');
        }
    }
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
    if ($('#ExcelViewReport').is(':checked')) {
        $("#exportoexcel").css("display", "block");
        GenerateReport_Excel(GenfromSavedFilters, Withemail);
    }
}

function GenerateReport_RDLC(GenfromSavedFilters, Withemail, ReportType) {
    $("#divExportToExcel").hide();
    $("#loadExcelGrid").hide();
    dataLimitIssue = false;

    //$(".loading").show();

    ShowLoader(true);

    var rdlcsearch = SetSearchCriteria(GenfromSavedFilters);
    RdlcGenerated = true;


    $.ajax({
        type: "Post",
        url: '/Corporate/EPScoringReportFinalMockSurvey/_GetEPScoringReportFinalMockSurveyRDLCData',
        contentType: "application/json",
        data: JSON.stringify({ search: rdlcsearch, emailInput: Withemail, ReportType: ReportType }),
        success: function (response) {
            $("#divL1tag").show();
            $("#loadrdlc").html(response);
            $("#loadrdlc").show();

            //$(".loading").hide();

            HideLoader(true);

        }
    });
}

var wnd, detailsTemplate;
function GenerateReport_Excel(GenfromSavedFilters, Withemail) {
    var epGrid = $("#loadExcelGrid");
    if (epGrid.data("kendoGrid")) {
        $("#loadExcelGrid").data("kendoGrid").destroy();
        $("#loadExcelGrid").empty();
    }

    //$(".loading").show();

    ShowLoader();

    var data = ExceldataSource(GenfromSavedFilters, Withemail);
    $("#loadExcelGrid").kendoGrid({
        dataSource: data,
        pageable: {
            refresh: true,
            pageSizes: [20, 50, 100]
        },
        clickable: false,
        selectable: false,
        reorderable: true,
        resizable: true,
        dataBound: LargeGridResize,
        height: "Auto",
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
        excel: { allPages: true },
        excelExport: ERexcelExport,
        columns: getGridColumns()
    });    
}

function GridToggleFunction() {
    var btntitle = $("#toggle").attr("title");
    if (btntitle == "Maximize") {
        //Code to change the toggle button to a restore button
        $("#toggle").attr("title", "Close");
        //$("#toggle").children().removeClass("k-i-window-maximize").addClass("k-i-close");
        $("#btntoggleicon").removeClass("k-i-window-maximize").addClass("k-i-close");
        $("#btntoggle").text("Close");

        $("#topNav").hide();
        $("#topNavbar").hide();
        $('#mnuBreadCrumbTrail').hide();
        $("#MainNavbar").hide();        
        $('#divL1tag').css('margin-top', '5px');
        gridAutoHeight($("#loadExcelGrid").getKendoGrid(), 82);
    }
    else
    {
        //Code to change the toggle button to a Maximize button
        $("#toggle").attr("title", "Maximize");
        //$("#toggle").children().removeClass("k-i-close").addClass("k-i-window-maximize");
        $("#btntoggleicon").removeClass("k-i-close").addClass("k-i-window-maximize");
        $("#btntoggle").text("Maximize");
        
        $("#topNav").show();
        $("#topNavbar").show();
        $('#mnuBreadCrumbTrail').show();
        $("#MainNavbar").show();        
        $('#divL1tag').css('margin-top', '0px');
        gridAutoHeight($("#loadExcelGrid").getKendoGrid(), 246);
        //ERSearchClick();
    }    
}

function gridAutoHeight(gridObj, margin) {
    try {
        if (gridObj) {
            gridObj.element.height($(window).height() - gridObj.element[0].offsetTop - (margin || 40));
            //console.log($(window).height() - gridObj.element[0].offsetTop - (margin || 40));
            gridObj.resize();
        }
    } catch (e) {
        console.log('Error resizing grid: ' + e.toString());
    }
}
function getGridColumns() {
    var columns = [
        { field: "HCOID", width: 60, title: "HCO ID", hidden: "true", menu: false },
        { field: "SiteName", width: 200, title: "Site Name", hidden: "true", menu: false },
        { field: "ProgramName", width: 150, title: "Program", hidden: "true", menu: false },
        { field: "ChapterName", width: 150, title: "Chapter", hidden: "true", menu: false },
        { field: "StandardLabel", width: 130, title: "Standard" },
        { field: "EPLabel", width: 70, title: "EP" },
        { field: "EPText", width: 300, title: "EP Description", encoded: false },
        { command: { text: "View Documentation", click: showDocuments }, title: "Documentation", width: "180px" },
        { field: "ScoreTypeName", width: 120, title: "Score Type" },
        { field: "FullName", width: 120, title: "Scored By" },
        { field: "ScoreName", width: 100, title: "Score" },
        { field: "ScoreDate", width: 120, title: "Date Scored" },
        { field: "Likelihood", width: 160, title: "Likelihood to Harm" },
        { field: "Scope", width: 100, title: "Scope" },
        { field: "FSA", width: 75, title: "FSA" },
        { field: "dcm_fl", width: 75, title: "DOC" },
        { field: "esp1_fl", width: 75, title: "ESP" },
        { field: "NewEP", width: 75, title: "New" },

        { field: "MockSurveyFindings", width: 160, title: "Mock Survey Findings", hidden: "true", menu: false },
        { field: "MockSurveyRecommendations", width: 160, title: "Mock Survey Recommendations", hidden: "true", menu: false },
        { field: "Findings", width: 160, title: "Organizational Findings", hidden: "true", menu: false },
        { field: "POA", width: 150, title: "Plan of Action", hidden: "true", menu: false },
        { field: "MOS", width: 150, title: "Sustainment Plan", hidden: "true", menu: false },
        { field: "OrgNotes", width: 150, title: "Internal Org Notes", hidden: "true", menu: false },
        { field: "CompliantDate", width: 150, title: "POA Compliant by Date", hidden: "true", menu: false },
        { field: "DocumentList", width: 150, title: "Linked Documents", hidden: "true", menu: false },

        { field: "CoPExcel", width: 60, title: "CoP", hidden: "true", menu: false }
    ];
    
    if (isCorporateSiteSelected && getMockSurveyScoreCheckBoxValue() == true) {
        columns.splice(9, 0, { field: "MockSurveyName", width: 150, title: "Mock Survey Name" });
    }

    if (getIncludeCMSCheckBoxValue()) {
        columns.push({ command: { text: "View CoP", click: showCoP }, field: "CoPHTML", title: "CoP", width: "150px" });
    }

    return columns;
}

function ExceldataSource(GenfromSavedFilters, Withemail) {
    var ExcelSearch = SetSearchCriteria(GenfromSavedFilters);
    return new kendo.data.DataSource({
        transport: {
            read: {
                url: "/Corporate/EPScoringReportFinalMockSurvey/_GetEPScoringReportFinalMockSurveyExcelData",
                type: "post",
                dataType: "json",
                data: { search: ExcelSearch }
            }
        },
        pageSize: 20,
        requestEnd: function (e) {
            $("#loadrdlc").hide();

            //$(".loading").hide();

            HideLoader();

            if (e.response != null) {
                if (e.response.length === 0) {
                    $("#divL1tag").hide();
                    $("#divExportToExcel").hide();
                    $("#loadExcelGrid").hide();
                    openSlide("btnSearchCriteria", "slideSearch");
                    $('#showerror_msg').removeClass("alert-info").addClass("alert-danger");
                    $('#showerror_msg').css("display", "block");
                    $('#show_msg').html("No data found matching your criteria.");
                    EnableDisableEmail(false);
                }
                else {
                    closeSlide("btnSearchCriteria", "slideSearch");
                    //unBlockElement("divL1tag");

                    EnableDisableEmail(true);
                    $("#divL1tag").show();
                    $("#divExportToExcel").show();
                    $("#loadExcelGrid").show();
                    GridToggleFunction();
                }
            }
        }
    });
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
    dataItem.ProgramCode = dataItem.ProgramCode.toString().trim();
    wnd.content(detailsTemplate(dataItem));
    wnd.center().open();
}

function showCoP(e) {
    wnd = $("#divDetail").kendoWindow({
        title: "CMS Medical Requirement",
        modal: true,
        visible: false,
        resizable: false,
        width: 550,
        height: 600,
        position: {
            top: 10
        }
    }).data("kendoWindow");
    wnd.title("CMS Medical Requirement");
    detailsTemplate = kendo.template($("#CoPTemplate").html());

    var dataItem = this.dataItem($(e.currentTarget).closest("tr"));
    dataItem.HCOID = dataItem.HCOID == null ? dataItem.HCOID : dataItem.HCOID.toString().trim();
    dataItem.StandardLabel = dataItem.StandardLabel.toString().trim();
    dataItem.EPLabel = dataItem.EPLabel.toString().trim();
    dataItem.ProgramCode = dataItem.ProgramCode.toString().trim();
    wnd.content(detailsTemplate(dataItem));
    wnd.center().open();
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

    var SelectedScoredByUserIDs = [];
    var SelectedScoredByUsersNames = [];
    $('#MultiSiteEpScoredBy :selected').each(function (i, selected) {
        SelectedScoredByUserIDs[i] = $(selected).val();
        SelectedScoredByUsersNames[i] = GetReportHeaderUserNameFormat($(selected).text().trim());
    });
    if (SelectedScoredByUserIDs.length <= 0) {
        SelectedScoredByUserIDs.push(defaultValue);
        SelectedScoredByUsersNames.push(defaultText);
    }
    
    var SelectedMockSurveyIds = [];
    var SelectedMockSurveyNames = [];
    $('#MockSurveyNameList :selected').each(function (i, selected) {
        SelectedMockSurveyIds[i] = $(selected).val();
        SelectedMockSurveyNames[i] = GetReportHeaderUserNameFormat($(selected).text().trim(), true);
    });
    if (SelectedMockSurveyIds.length <= 0) {
        SelectedMockSurveyIds.push(defaultValue);
        SelectedMockSurveyNames.push(defaultText);
    }


    var SelectedSiteName = "";
    if ($('#hdnSitesCount').val() == 1) {
        SelectedSiteName = $('#hdnSingleSiteName').val();
    }
    else {
        SelectedSiteName = $("#SiteSelector_SelectedSiteName").val();
    }

    var ScoreType = '';

    if ($('#FScoreCheckbox').is(":checked") == true) {
        ScoreType += '3,';
    }

    if ($('#MScoreCheckbox').is(":checked") == true) {
        ScoreType += '4,';
    }

    var ScoreValue = '';
    if ($('#InsufficientCheckbox').is(':checked')) {
        ScoreValue += '0,';
    }

    if ($('#SatisfactoryCheckbox').is(':checked')) {
        ScoreValue += '2,';
    }

    if ($('#NACheckbox').is(':checked')) {
        ScoreValue += '6,';
    }

    if ($('#NotScored').is(':checked')) {
        ScoreValue += '99,';
    }

    ScoreValue = ScoreValue.replace(/\,$/, '');


    var searchset =
        {
            SiteID: ERSites.getSelectedSites().replace(/\,$/, ''),
            SiteName: SelectedSiteName,
            ProgramID: ProgramIDs.toString().replace(/\,$/, ''),
            ProgramName: ProgramNames.toString().replace(/,/g, ", "),
            ChapterList: SelectedChapterIDs.toString(),
            ChapterNameList: SelectedChapterNames.toString(),
            StandardList: SelectedStandardIDs.toString(),
            StandardNameList: SelectedStandardNames.toString().replace(/,/g, ", "),
            MockSurveyIDList: SelectedMockSurveyIds.toString(),
            MockSurveyNameList: SelectedMockSurveyNames.toString().replace(/,/g, ", "),
            ScoreTypeList: ScoreType.replace(/\,$/, ''),
            ScoreValueList: ScoreValue,
            ScoredByList: SelectedScoredByUserIDs.toString(),
            ScoredByNameList: SelectedScoredByUsersNames.toString().replace(/,/g, ", "),
            FSA: $('#chkIncludeFSA').is(':checked') == true ? 1 : 0,
            DocRequiredValue: $('#chkdocRequired').is(':checked') == true ? 1 : 0,
            NewChangedEPs: $('#chkNewChangedEps').is(':checked') == true ? 1 : 0,
            chkIncludeCMS: getIncludeCMSCheckBoxValue() == true ? 1 : 0,
            DateStart: kendo.toString($("#ObsstartDate").data("kendoDatePicker").value(), "yyyy-MM-dd"),
            DateEnd: kendo.toString($("#ObsEndDate").data("kendoDatePicker").value(), "yyyy-MM-dd"),
            PlanOfAction: $("#divPlanOfAction").data("kendoMultiSelect").value().toString(),
            OrgFindings: $("#divOrgFindings").data("kendoMultiSelect").value().toString(),
            OrgNotes: $("#divOrgNotes").data("kendoMultiSelect").value().toString(),
            LinkedDocs: $("#divLinkedDocs").data("kendoMultiSelect").value().toString(),
            MockSurveyFindings: $("#divMockSurveyFindings").data("kendoMultiSelect").value().toString(),
            MockSurveyRecommendations: $("#divMockSurveyRecommendations").data("kendoMultiSelect").value().toString(),
            ReportType: $('input[name=ReportLevelChange]:checked').val(),
            ReportTitle: $('#txtScheduledReportName').val() == '' ? $('#hdnReportTitle').val() : $('#txtScheduledReportName').val(),
            IsCorporateAccess: isCorporateSiteSelected

        }

    return searchset;
}

function getIncludeCMSCheckBoxValue() {
    return $('#IncludeCMSCheckbox').is(':checked');
}

function getMockSurveyScoreCheckBoxValue() {
    return $('#MScoreCheckbox').is(':checked');
}

function LargeGridResize(e) {

    var gridID = '';
    if (e.sender && e.sender.wrapper && e.sender.wrapper.length > 0)
        gridID = e.sender.wrapper[0].id;

    if (gridID != null && gridID != '') {

        var grid = $("#" + gridID);
        var footer = grid.find(".k-grid-footer");
        if (footer) $(footer).hide();
        
        //hide the columns
        var epGrid = $(grid).data("kendoGrid");
        var gridData = epGrid.dataSource.view();

        for (var i = 0; i < gridData.length; i++) {
            var currentUid = gridData[i].uid;

            if (gridData[i].CoPExcel == null || gridData[i].CoPExcel == '') {
                var currenRow = epGrid.table.find("tr[data-uid='" + currentUid + "']");
                var viewCoPButton = $(currenRow).find(".k-grid-ViewCoP");
                viewCoPButton.hide();
            }
        }

        var header = grid.find(".k-grid-header");
        var contentArea = grid.find(".k-grid-content");  //This is the content Where Grid is located
        var count = grid.data("kendoGrid").dataSource.data().length;
        var headerGrouping = grid.find('.k-grouping-header');

        var headerGroupingHeight = 0;
        if (headerGrouping.height() != null) {
            headerGroupingHeight = headerGrouping.height() + 16;
        }

        //Apply the height for the content area
        /*var pagerHeight = 72;
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
        */
        $('#CorpLayOutFooter').attr("style", "top: auto; position: relative;");
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

function ERExcelExportFunction() {
    
    var epGrid = $("#loadExcelGrid").getKendoGrid();
    
    var columns = epGrid.columns;
    var colDocument = columns.filter(function (v, i) { return columns[i].title == 'Documentation'; });
    var colCoP = columns.filter(function (v, i) { return columns[i].field == 'CoPHTML'; });

    var isDocumentColumnVisible = !colDocument[0].hidden;
    var isCoPColumnVisible = colCoP.length == 0 ? false : !colCoP[0].hidden;

    epGrid.showColumn("HCOID");
    epGrid.showColumn("ProgramName");
    epGrid.showColumn("ChapterName");
    epGrid.showColumn("SiteName");

    if (isDocumentColumnVisible) {
        epGrid.showColumn("Findings");
        epGrid.showColumn("OrgNotes");
        epGrid.showColumn("POA");
        epGrid.showColumn("DocumentList");
        epGrid.showColumn("CompliantDate");
        epGrid.showColumn("MOS");

        if (isCorporateSiteSelected && getMockSurveyScoreCheckBoxValue() == true) {
            epGrid.showColumn("MockSurveyFindings");
            epGrid.showColumn("MockSurveyRecommendations");
        }

    }

    if (getIncludeCMSCheckBoxValue() == true && isCoPColumnVisible) {
        epGrid.showColumn("CoPExcel");
        epGrid.hideColumn("CoPHTML");
    }

    epGrid.saveAsExcel();

    epGrid.hideColumn("HCOID");
    epGrid.hideColumn("ProgramName");
    epGrid.hideColumn("ChapterName");
    epGrid.hideColumn("SiteName");

    if (isDocumentColumnVisible) {
        epGrid.hideColumn("Findings");
        epGrid.hideColumn("OrgNotes");
        epGrid.hideColumn("POA");
        epGrid.hideColumn("DocumentList");
        epGrid.hideColumn("CompliantDate");
        epGrid.hideColumn("MOS");

        if (isCorporateSiteSelected && getMockSurveyScoreCheckBoxValue() == true) {
            epGrid.hideColumn("MockSurveyFindings");
            epGrid.hideColumn("MockSurveyRecommendations");
        }

    }

    if (getIncludeCMSCheckBoxValue() == true && isCoPColumnVisible) {
        epGrid.hideColumn("CoPExcel");
        epGrid.showColumn("CoPHTML");
    }
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
                    if (($('#ExcelViewReport').is(':checked') == true))
                    { ERExcelExportFunction(); }
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
            if (($('#ExcelViewReport').is(':checked') == true))
            { ERExcelExportFunction(); }
        }
        else {
            fromemail = false;

            ShowEmailStatus("No data found matching your Criteria. Change Criteria and try again.", 'failure');
        }
    }
}

function AddExportParameters() {


    var Search = SetSearchCriteria(true);
    var filterBy = "";
    if (Search.FSA == 1) { filterBy = "Include FSA Eps,\n"; }
    if (Search.DocRequiredValue == 1) { filterBy += "Documentation Required,\n"; }
    if (Search.NewChangedEPs == 1) { filterBy += "New Eps"; }

    var ScoreTypeNameList = "";
    if (Search.ScoreTypeList.indexOf("3") > -1) { ScoreTypeNameList += "Final, "; }
    if (Search.ScoreTypeList.indexOf("4") > -1) { ScoreTypeNameList += "Mock Survey, "; }
    ScoreTypeNameList = ScoreTypeNameList.replace(/\, $/, '');
    var ScoreValueNameList = "";
    if (Search.ScoreValueList.indexOf("2") > -1) { ScoreValueNameList += "Satisfactory, "; }
    if (Search.ScoreValueList.indexOf("0") > -1) { ScoreValueNameList += "Insufficient, "; }
    if (Search.ScoreValueList.indexOf("6") > -1) { ScoreValueNameList += "Not Applicable, "; }
    if (Search.IncludeNotScoredRecords == 1) { ScoreValueNameList += "Not Scored"; }

    ScoreValueNameList = ScoreValueNameList.replace(/\, $/, '');
    var DocumentationList = "";

    if (Search.IsCorporateAccess && Search.ScoreTypeList.indexOf("4") > -1) {
        if (Search.MockSurveyFindings == 1) { DocumentationList = DocumentationList + "All Mock Survey Findings,\n"; }
        else if (Search.MockSurveyFindings == 2) { DocumentationList = DocumentationList + "Presence of Mock Survey Findings,\n"; }
        else if (Search.MockSurveyFindings == 3) { DocumentationList = DocumentationList + "Absence of Mock Survey Findings,"; }

        if (Search.MockSurveyRecommendations == 1) { DocumentationList = DocumentationList + "All Mock Survey Recommendations,\n"; }
        else if (Search.MockSurveyRecommendations == 2) { DocumentationList = DocumentationList + "Presence of Mock Survey Recommendations,\n"; }
        else if (Search.MockSurveyRecommendations == 3) { DocumentationList = DocumentationList + "Absence of Mock Survey Recommendations,"; }
    }

    if (Search.OrgFindings == 1) { DocumentationList += "All Organizational Findings,\n"; }
    else if (Search.OrgFindings == 2) { DocumentationList += "Presence Organizational Org Findings,\n"; }
    else if (Search.OrgFindings == 3) { DocumentationList += "Absence Organizational Org Findings,\n"; }
    if (Search.PlanOfAction == 1) { DocumentationList = DocumentationList + "All Plan Of Action,\n"; }
    else if (Search.PlanOfAction == 2) { DocumentationList = DocumentationList + "Presence Of Plan Of Action,\n"; }
    else if (Search.PlanOfAction == 3) { DocumentationList = DocumentationList + "Absence Of Plan Of Action,\n"; }
    if (Search.OrgNotes == 1) { DocumentationList = DocumentationList + "All Org Notes,\n"; }
    else if (Search.OrgNotes == 2) { DocumentationList = DocumentationList + "Presence Of Org Notes,\n"; }
    else if (Search.OrgNotes == 3) { DocumentationList = DocumentationList + "Absence Of Org Notes,\n"; }

    if (Search.LinkedDocs == 1) { DocumentationList = DocumentationList + "All Linked Documents\n"; }
    else if (Search.LinkedDocs == 2) { DocumentationList = DocumentationList + "Presence Of Linked Documents\n"; }
    else if (Search.LinkedDocs == 3) { DocumentationList = DocumentationList + "Absence Of Linked Documents"; }

    var startDate = Search.DateStart;
    var endDate = Search.DateEnd;
    var reportDate = "All Dates";

    if (Search.DateStart == "") {
        startDate = Search.DateStart;
        if (Search.DateEnd != "")
            reportDate = "for " + Search.DateStart + " - " + Search.DateEnd;
        else
            reportDate = "since " + Search.DateStart;
    }

    if (Search.DateEnd == "") {
        endDate = Search.DateEnd;
        if (Search.DateStart == "")
            reportDate = "through " + Search.DateEnd;
    }

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
                    { value: "Site Name" },
                    { value: Search.SiteName }
                ]
            },
            {
                cells: [
                    { value: "Report ID" },
                    { value: $('#lblReportScheduleID').html() }
                ]
            },
            {
                cells: [
                    { value: "My Report Name" },
                    { value: $('#txtScheduledReportName').val() == '' ? '' : $('#txtScheduledReportName').val() }
                ]
            },
            {
                cells: [
                    { value: "Program" },
                    { value: Search.ProgramName }
                ]
            },
            {
                cells: [
                    { value: "Chapter" },
                    { value: Search.ChapterAll == 1 ? "All" : Search.ChapterNameList }
                ]
            },
            {
                cells: [
                    { value: "Standard" },
                    { value: Search.StandardAll == 1 ? "All" : Search.StandardNameList }
                ]
            },
            {
                cells: [
                    { value: "Score Value" },
                    { value: ScoreValueNameList }
                ]
            },
            {
                cells: [
                    { value: "Score Type" },
                    { value: ScoreTypeNameList }
                ]
            },

            {
                cells: [
                    { value: "Score Date Range" },
                    { value: reportDate }
                ]
            },
            {
                cells: [
                    { value: "Scored By" },
                    { value: Search.ScoredByList == -1 ? "All" : Search.ScoredByNameList }
                ]
            },
            {
                cells: [
                    { value: "Include CMS Crosswalk" },
                    { value: Search.chkIncludeCMS == 1 ? "Yes" : "No" }
                ]
            },
            {
                cells: [
                    { value: "Filter By" },
                    { value: filterBy }
                ]
            },
            {
                cells: [
                    { value: "Documentation" },
                    { value: DocumentationList }
                ]
            },
        ]
    }

    if (Search.IsCorporateAccess && Search.ScoreTypeList.indexOf("4") > -1) {
        var MockSurveyParamaterItem = {
            cells: [
                { value: "Mock Survey Name" },
                { value: Search.MockSurveyNameList }
            ]
        }
        stringvalue.rows.splice(4, 0, MockSurveyParamaterItem);
    }

    return stringvalue;

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
        { ChapterIDs: searchCriteria.ChapterList },
        { StandardIDs: searchCriteria.StandardList },
        { MockSurveyIDs: searchCriteria.MockSurveyIDList },
        { ScoredBy: searchCriteria.ScoredByList },
        { PlanOfAction: searchCriteria.PlanOfAction },
        { OrgFindings: searchCriteria.OrgFindings },
        { OrgNotes: searchCriteria.OrgNotes },
        { LinkedDocuments: searchCriteria.LinkedDocs },
        { MockSurveyFindings: searchCriteria.MockSurveyFindings},
        { MockSurveyRecommendations: searchCriteria.MockSurveyRecommendations}
    ];

    //Include Score Types
    if (searchCriteria.ScoreTypeList.indexOf("3") > -1) parameterSet.push({ IncludeFinalScoreCheckbox: true });
    if (searchCriteria.ScoreTypeList.indexOf("4") > -1) parameterSet.push({ IncludeMockSurveyScoreCheckbox: true });


    //Include Score Values

    if (searchCriteria.ScoreValueList.indexOf("2") > -1) parameterSet.push({ SatisfactoryCheckbox: true });
    if (searchCriteria.ScoreValueList.indexOf("0") > -1) parameterSet.push({ InsufficientCheckbox: true });
    if (searchCriteria.ScoreValueList.indexOf("6") > -1) parameterSet.push({ NotApplicableCheckbox: true });
    if (searchCriteria.ScoreValueList.indexOf("99") > -1) parameterSet.push({ NotScoredCheckbox: true });


    //Include Filter by options
    if (searchCriteria.chkIncludeCMS == 1) parameterSet.push({ chkIncludeCMS: true });
    if (searchCriteria.FSA == 1) parameterSet.push({ IncludeFSAcheckbox: true });
    if (searchCriteria.DocRequiredValue == 1) parameterSet.push({ EPDocRequiredCheckbox: true });
    if (searchCriteria.NewChangedEPs == 1) parameterSet.push({ EPNewChangedCheckbox: true });

    //DateRange - Add date parameters only there is a value
    GetObservationDate(parameterSet, searchCriteria.DateStart, searchCriteria.DateEnd);

    parameterSet.push({ ScheduledReportName: $('#txtScheduledReportName').val() });

    //Add recurrence fields to the parameter set
    GetERRecurrenceParameters(parameterSet);

    //Save the parameters to the database
    SaveSchedule(parameterSet, deleteReport);
}

//to do
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
    UpdateStandards();
    if (getParamValue(params.ReportParameters, "StandardIDs") != null) {
        $("#AMPStandard").data("kendoMultiSelect").value(getParamValue(params.ReportParameters, "StandardIDs").split(","));
    }

    $('input[name=ReportLevelChange][value=' + (getParamValue(params.ReportParameters, "ReportType")) + ']').prop('checked', true);
    if (getParamValue(params.ReportParameters, "ReportType") != "" && getParamValue(params.ReportParameters, "ReportType") != "Summary") {
        $('#IncludeCMSCheckbox').removeAttr("disabled");
    }
    else {
        $('#IncludeCMSCheckbox').attr("disabled", 'disabled');
    }
    CheckboxChecked(getParamValue(params.ReportParameters, "chkIncludeCMS"), 'IncludeCMSCheckbox');
    CheckboxChecked(getParamValue(params.ReportParameters, "IncludeFinalScoreCheckbox"), 'FScoreCheckbox');
    CheckboxChecked(getParamValue(params.ReportParameters, "IncludeMockSurveyScoreCheckbox"), 'MScoreCheckbox');

    CheckboxChecked(getParamValue(params.ReportParameters, "SatisfactoryCheckbox"), 'SatisfactoryCheckbox');
    CheckboxChecked(getParamValue(params.ReportParameters, "InsufficientCheckbox"), 'InsufficientCheckbox');
    CheckboxChecked(getParamValue(params.ReportParameters, "NotApplicableCheckbox"), 'NACheckbox');
    CheckboxChecked(getParamValue(params.ReportParameters, "NotScoredCheckbox"), 'NotScored');


    CheckboxChecked(getParamValue(params.ReportParameters, "IncludeFSAcheckbox"), 'chkIncludeFSA');
    CheckboxChecked(getParamValue(params.ReportParameters, "EPDocRequiredCheckbox"), 'chkdocRequired');
    CheckboxChecked(getParamValue(params.ReportParameters, "EPNewChangedCheckbox"), 'chkNewChangedEps');

    MultiScoredByCall();
    $("#MultiSiteEpScoredBy").data("kendoMultiSelect").value(getParamValue(params.ReportParameters, "ScoredBy").split(","));

    $("#divPlanOfAction").data("kendoMultiSelect").value(getParamValue(params.ReportParameters, "PlanOfAction"));
    $("#divOrgFindings").data("kendoMultiSelect").value(getParamValue(params.ReportParameters, "OrgFindings"));
    $("#divOrgNotes").data("kendoMultiSelect").value(getParamValue(params.ReportParameters, "OrgNotes"));
    $("#divLinkedDocs").data("kendoMultiSelect").value(getParamValue(params.ReportParameters, "LinkedDocuments"));

    if (isCorporateSiteSelected) {

        MockSurveyNameListCall();
        $("#MockSurveyNameList").data("kendoMultiSelect").value(getParamValue(params.ReportParameters, "MockSurveyIDs").split(","));

        $("#divMockSurveyFindings").data("kendoMultiSelect").value(getParamValue(params.ReportParameters, "MockSurveyFindings"));
        $("#divMockSurveyRecommendations").data("kendoMultiSelect").value(getParamValue(params.ReportParameters, "MockSurveyRecommendations"));
        onMockSurveyScoreCheckChange();
    }

    SetERRecurrenceParameters(params);
    SetSavedObservationDate(params.ReportParameters);
    TriggerActionByReportMode(params.ReportMode);
    isSavedReportLoading = false;
}

function OnPrintDocumentation() {

    var title = document.title;
    document.title = ExportReportName + ' - Documentation';
    window.print();
    document.title = title;

}

function OnPrintCoP() {

    var title = document.title;
    document.title = ExportReportName + ' - CMS Medical Requirement';
    window.print();
    document.title = title;

}
