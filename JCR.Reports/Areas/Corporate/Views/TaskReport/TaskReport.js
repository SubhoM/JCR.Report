var MultiSiteChapterUrl = '/Corporate/CorporateReport/GetMultiSiteChapters';
var ProgramID = $("#hdnProgramID").val();
var GetRDLC = $("#GetRDLC").val();
exportparameters = true;
var GenerateForEmail = false;
var isCMS = false;
$(document).ready(function () {
    addarrowtomultiselect("OrgDepartment");
    if ($("#OrgRanking2Name").val() != "") {
        addarrowtomultiselect("OrgBuilding");
        // removedeleteoption("OrgBuilding");
    }
    if ($("#OrgRanking3Name").val() != "") {
        addarrowtomultiselect("OrgCampus");
        // removedeleteoption("OrgCampus");
    }
    addarrowtomultiselect("TracersList"); 

    $("#resetfiltersbutton").click(function () {
        SetDefaults();
    });

    if ($.isNumeric($('#lblReportScheduleID').html())) {
        GetSavedParameters($('#lblReportScheduleID').html());
    }
    $('input[name=ReportLevelChange][value=Summary]').prop('checked', true);
    loaddueDates();
    loadAssignDates();
    $("#hSelectSite").html("Select Site:");
});
var defaultValue = "-1";
var defaultText = "All";

function SetDefaults() {
    $('#loadrdlc').html('');
    $('input[name=ReportLevelChange][value=Summary]').prop('checked', true);
    $("#fromDueDate").data("kendoDatePicker").value("");
    $("#toDueDate").data("kendoDatePicker").value("");
    $("#fromAssiDate").data("kendoDatePicker").value("");
    $("#toAssiDate").data("kendoDatePicker").value("");
    $('#chkPastDue').prop('checked', false);
    $("#TaskAssignedBy").data("kendoMultiSelect").value("-1");
    $("#TaskAssignedTo").data("kendoMultiSelect").value("-1");
    $("#TracersList").data("kendoMultiSelect").value("-1");
    $("#MultiSiteChapter").data("kendoMultiSelect").value("-1");
    $("#OrgCampus").data("kendoMultiSelect").value("-1");
    $("#OrgBuilding").data("kendoMultiSelect").value("-1");
    $("#OrgDepartment").data("kendoMultiSelect").value("-1");
    ResetStandardsMultiSelect();
    ResetEPsMultiSelect();
    ResetTagsMultiSelect();
    EnableDisableEmail(false);
    $("#TaskStatus").data("kendoMultiSelect").value(1);

}
function loaddueDates() {
    $("#fromDueDate").kendoDatePicker({
        format: "MM/dd/yyyy",
        parseFormats: ["MM-dd-yyyy", "MM/dd/yyyy", "MM-dd-yy", "MM/dd/yy"],
        depth: "year",
        change: function () {

            ValidateStartDate(4000, '#fromDueDate', '#toDueDate');
        }
    });

    $("#toDueDate").kendoDatePicker({
        format: "MM/dd/yyyy",
        parseFormats: ["MM-dd-yyyy", "MM/dd/yyyy", "MM-dd-yy", "MM/dd/yy"],
        depth: "year",
        change: function () {

            ValidateEndDate(4000, '#fromDueDate', '#toDueDate');
        }
    });

    $("#fromDueDate").keypress(function (e) {
        return AllowNumericOnly(e);
    });
    $("#toDueDate").keypress(function (e) {
        return AllowNumericOnly(e);
    });

    $("#fromDueDate").on("paste", function (e) {
        return ValidateClipboardText();
    });
    $("#toDueDate").on("paste", function (e) {
        return ValidateClipboardText();
    });

    $("#fromDueDate").closest("span.k-datepicker").width(100);
    $("#toDueDate").closest("span.k-datepicker").width(100);
}
function loadAssignDates() {
    $("#fromAssiDate").kendoDatePicker({
        format: "MM/dd/yyyy",
        parseFormats: ["MM-dd-yyyy", "MM/dd/yyyy", "MM-dd-yy", "MM/dd/yy"],
        depth: "year",
        change: function () {

            ValidateStartDate(4000, '#fromAssiDate', '#toAssiDate');
        }
    });

    $("#toAssiDate").kendoDatePicker({
        format: "MM/dd/yyyy",
        parseFormats: ["MM-dd-yyyy", "MM/dd/yyyy", "MM-dd-yy", "MM/dd/yy"],
        depth: "year",
        change: function () {

            ValidateEndDate(4000, '#fromAssiDate', '#toAssiDate');
        }
    });

    $("#fromAssiDate").keypress(function (e) {
        return AllowNumericOnly(e);
    });
    $("#toAssiDate").keypress(function (e) {
        return AllowNumericOnly(e);
    });

    $("#fromAssiDate").on("paste", function (e) {
        return ValidateClipboardText();
    });
    $("#toAssiDate").on("paste", function (e) {
        return ValidateClipboardText();
    });

    $("#fromAssiDate").closest("span.k-datepicker").width(100);
    $("#toAssiDate").closest("span.k-datepicker").width(100);
}
function ValidateData(timeDelay) {
    if ($('#fromDueDate').is(':disabled') == false) {
        return ValidateStartDate(4000, '#fromAssiDate', '#toAssiDate') && ValidateEndDate(4000, '#fromAssiDate', '#toAssiDate') && ValidateStartDate(4000, '#fromDueDate', '#toDueDate') && ValidateEndDate(4000, '#fromDueDate', '#toDueDate');
    }
    else {
        return true;
    }
    
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
//Withemail parameter is optional 
function GenerateReport(GenfromSavedFilters, Withemail) {
    //$('.loading').hide();
    //SetLoadingImageVisibility(false);
    EnableDisableEmail(true);
    hasExcelData = true;
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
    else if ($('#DetailReport').is(':checked')) {

        if (GenerateForEmail) {
            var email = $.parseJSON(sessionStorage.getItem('searchsetemailsession'));
            GenerateReport_RDLC(GenfromSavedFilters, email, 'Detail');
            GenerateForEmail = false;
        }
        else {
            GenerateReport_RDLC(GenfromSavedFilters, Withemail, 'Detail');
        }
    }
    else if($('#ExcelViewReport').is(':checked')) {
        //$('.loading').show();
        $('#loadrdlc').hide();
        $.ajax({
            async: false,
            url: '/Corporate/TaskReport/LoadTaskExcelReport',
            dataType: "html",
            cache: false,
            success: function (data) {
                // $('.loading').hide();
                $('#LoadDetailView').html(data);
                $("#LoadDetailView").show();
            }
        });
        $('#LoadDetailView').css("display", "block");
        ExcelBindData("gridTaskRptExcel");

        ExcelGridName = "gridTaskRptExcel";
        if (!isCMS) {
            $("#" + ExcelGridName).data("kendoGrid").hideColumn(12);
            $("#" + ExcelGridName).data("kendoGrid").columns[12].title = "";
            $("#" + ExcelGridName).data("kendoGrid").columns[12].field = "";
        }
        SetColumnHeader("gridTaskRptExcel", 16);
    }
}
function GenerateReport_RDLC(GenfromSavedFilters, Withemail, ReportType) {
    $("#LoadDetailView").hide();
    dataLimitIssue = false;

    //$(".loading").show();

    ShowLoader();

    var rdlcsearch = SetSearchCriteria(GenfromSavedFilters);
    RdlcGenerated = true;
    $.ajax({
        type: "Post",
        url: GetRDLC,
        contentType: "application/json",
        data: JSON.stringify({ search: rdlcsearch, emailInput: Withemail, ReportType: ReportType }),
        success: function (response) {
            $("#loadrdlc").html(response);
            $("#loadrdlc").show();
            //$(".loading").hide();

            HideLoader();
        }
    });
}

//Validate Start date
function ValidateStartDate(timeDelay, toCtrl, fromCtrl) {
    var IsDateValid = true;
    var ObsStartDateCtrl = $(toCtrl);
    var startDate = $(toCtrl).val();
    var endDate = $(fromCtrl).val();
    var today = new Date();
    var ErrorMessage = "";
    var dtStartDate = new Date(startDate);
    var dtEndDate = new Date(endDate);
    var bValidStartDate = DateValidator(startDate);
    var bValidEndDate = DateValidator(endDate);

    if (!bValidStartDate && startDate.length > 0) {
        ErrorMessage = "Enter valid From Date (mm/dd/yyyy)";
        IsDateValid = false;
    }

    if (bValidStartDate && bValidEndDate) {
        if (dtStartDate > dtEndDate) {
            ErrorMessage = "From-date should be before To-date.";
            IsDateValid = false;
        }
    }


    if (!IsDateValid) {
        ShowToolTip(ObsStartDateCtrl, ErrorMessage, "top", timeDelay);
    }
    return IsDateValid;
}

//Validate End Date
function ValidateEndDate(timeDelay, toCtrl, fromCtrl) {
    var IsDateValid = true;
    var ObsEndDateCtrl = $(fromCtrl);
    var startDate = $(toCtrl).val();
    var endDate = $(fromCtrl).val();
    var today = new Date();
    var ErrorMessage = "";
    var dtStartDate = new Date(startDate);
    var dtEndDate = new Date(endDate);
    var bValidStartDate = DateValidator(startDate);
    var bValidEndDate = DateValidator(endDate);

    if (!bValidEndDate && endDate.length > 0) {
        ErrorMessage = "Enter valid To Date (mm/dd/yyyy)";
        IsDateValid = false;
    }

    if (bValidStartDate && bValidEndDate) {
        if (dtStartDate > dtEndDate) {
            ErrorMessage = "To Date cannot be before From Date";
            IsDateValid = false;
        }
    }


    if (!IsDateValid) {
        ShowToolTip(ObsEndDateCtrl, ErrorMessage, "bottom", timeDelay);
    }
    return IsDateValid;
}
function onListSelect(e) {
    var dataItem = this.dataSource.view()[e.item.index()];
    var values = this.value();
    if (dataItem.TracerCustomName === "All") {
        $('#TracersList').data("kendoMultiSelect").value([]);
    } else if (jQuery.inArray("-1", values)) {
        values = $.grep(values, function (value) {
            return value !== -1;
        });
        if (values == "") { this.value(values); }
    }

}

function onTracerChange(e) {
    if (typeof leastComplianctTracerChange == 'function') {
        leastComplianctTracerChange();
    }
}
function LoadReportParameters(selectedSiteIDs) {
    ERCriteriaLoaded = true;

    GetReportHCOIDs(selectedSiteIDs);
    CheckCMSSite(selectedSiteIDs);
    MultiSiteChapterCall(selectedSiteIDs, 0, ProgramID);
    if (isCMS) {
        MultiSiteCoPCall(ProgramID);
    }
    MultiSiteAssignedTo(selectedSiteIDs);
    MultiSiteAssignedBy(selectedSiteIDs);
    MultiSiteEmailCcedTo(selectedSiteIDs);
    MultiSiteTaskStatus();
    MultiSiteTracerList(selectedSiteIDs, ProgramID);
    MultiSiteCampusList(selectedSiteIDs, ProgramID);
    MultiSiteBuildingList(selectedSiteIDs, ProgramID);
    MultiSiteDepartmentList(selectedSiteIDs, ProgramID);
    create_error_elem();

}
function CheckCMSSite(selectedSiteIDs) {
    $.ajax({
        async: false,
        type: "POST",
        data: { selectedSiteIDs: selectedSiteIDs },
        url: "/Corporate/CorporateReport/IsCMSSite",
        success: function(response) {
            isCMS = response;
            if (!isCMS) {
                $("#CMS").hide();
            }
            else {
                $("#CMS").show();
            }
        }
    });
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
function MultiSiteAssignedTo(selectedSiteIDs) {

    $.ajax({
        async: false,
        dataType: "html",
        url: '/Corporate/TaskReport/GetTaskAssignedTo',
        data: {
            selectedSiteIDs: selectedSiteIDs
        },
        success: function (response) {
            $("#divMultiSiteAssignedTo").html(response);
        }
    });
}
function MultiSiteAssignedBy(selectedSiteIDs) {

    $.ajax({
        async: false,
        dataType: "html",
        url: '/Corporate/TaskReport/GetTaskAssignedBy',
        data: {
            selectedSiteIDs: selectedSiteIDs
        },
        success: function (response) {
            $("#divMultiSiteAssignedBy").html(response);

        }
    });
}
function MultiSiteEmailCcedTo(selectedSiteIDs) {

    $.ajax({
        async: false,
        dataType: "html",
        url: '/Corporate/TaskReport/GetTaskEmailCcedTo',
        data: {
            selectedSiteIDs: selectedSiteIDs
        },
        success: function (response) {
            $("#divMultiSiteEmailCcedTo").html(response);

        }
    });
}
function MultiSiteTracerList(selectedSiteIDs, selectedProgramIDs) {
    $.ajax({
        async: false,
        dataType: "html",
        url: '/Corporate/TaskReport/GetTracersList',
        data: {
            selectedSiteIDs: selectedSiteIDs,
            selectedProgramIDs: selectedProgramIDs
        },
        success: function (response) {
            $("#divMultiSiteTracers").html(response);
        }
    });
}
function MultiSiteCampusList(selectedSiteIDs, ProgramID) {
    $.ajax({
        async: false,
        dataType: "html",
        url: '/Corporate/TaskReport/DistributeOrgTypeListLevel3',
        data: {
            selectedSiteIDs: selectedSiteIDs,
            selectedProgramIDs: ProgramID
        },
        success: function (response) {
            $("#divMultiSiteCampus").html(response);
        }
    });
}
function MultiSiteBuildingList(selectedSiteIDs, ProgramID) {
    $.ajax({
        async: false,
        dataType: "html",
        url: '/Corporate/TaskReport/DistributeOrgTypeListLevel2',
        data: {
            selectedSiteIDs: selectedSiteIDs,
            selectedProgramIDs: ProgramID
        },
        success: function (response) {
            $("#divMultiSiteBuildings").html(response);
        }
    });
}
function MultiSiteDepartmentList(selectedSiteIDs, ProgramID) {
    $.ajax({
        async: false,
        dataType: "html",
        url: '/Corporate/TaskReport/DistributeOrgTypeListLevel1',
        data: {
            selectedSiteIDs: selectedSiteIDs,
            selectedProgramIDs: ProgramID
        },
        success: function (response) {
            $("#divMultiSiteDepartments").html(response);
        }
    });
}
function MultiSiteTaskStatus() {

    $.ajax({
        async: false,
        dataType: "html",
        url: '/Corporate/TaskReport/GetTaskStatus',
        success: function (response) {
            $("#divTaskStatus").html(response);
            $("#TaskStatus").data("kendoMultiSelect").value(1);
        }
    });
}

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
function UpdateStandards() {

    $.ajax({
        async: false,
        url: "/Corporate/CorporateReport/GetMultiSiteStandards",
        dataType: "html",
        data: {
            selectedProgramIDs: ProgramID,
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
            selectedProgramIDs: ProgramID,
            selectedChapterIDs: $("#MultiSiteChapter").data("kendoMultiSelect").value().toString(),
            selectedStandards: $("#AMPStandard").data("kendoMultiSelect").value().toString()
        },
        success: function (response) {
            $("#divMultiSiteEP").html(response);
        }
    });
}
function onMSChapterChange(e) {
    UpdateStandards();
}

function onStdChange(e) {
    UpdateEPs();
}
function ResetCriteriaDates() {
    //do nothing
}
function MultiSiteCoPCall(selectedProgramIDs) {

    $.ajax({
        async: false,
        dataType: "html",
        url: "/Corporate/CorporateReport/GetMultiSiteCoPs",
        data: {
            selectedProgramIDs: selectedProgramIDs
        },
        success: function (response) {
            $("#divMultiSiteCoP").html(response);
            UpdateTags();
        }
    });
}

function UpdateTags() {

    $.ajax({
        async: false,
        url: "/Corporate/CorporateReport/GetMultiSiteTags",
        dataType: "html",
        data: {
            selectedProgramIDs: ProgramID,
            selectedCoPIDs: $("#MultiSiteCoP").data("kendoMultiSelect").value().toString()
        },
        success: function (response) {
            $("#divMultiSiteTag").html(response);
        }
    });
}
function orgTypeLevelFilter(searchinputset) {
    //Organization type list multiple mulitselect(s) update
    orglevel3update(searchinputset, selectedSiteIDs, ProgramID);
    orglevel2update(searchinputset, selectedSiteIDs, ProgramID);
    orglevel1update(searchinputset, selectedSiteIDs, ProgramID);
}
//on level3 orgnization type Change filter the level 2 and level 1 multiselect boxes.
function onlevel3Change(e) {
    PreserveSelectedList = false;
    var searchinputset = SetSearchCriteria();
    searchinputset.OrgTypeLevel2IDs = "";
    selectedSiteIDs = searchinputset.SelectedSiteIDs;
    orglevel2update(searchinputset, selectedSiteIDs, ProgramID);
    orglevel1update(searchinputset, selectedSiteIDs, ProgramID);
}
//on level2 orgnization type Change filter level 1 multiselect boxes.
function onlevel2Change(e) {
    PreserveSelectedList = false;
    var searchinputset = SetSearchCriteria();
    selectedSiteIDs = searchinputset.SelectedSiteIDs;
    orglevel1update(searchinputset, selectedSiteIDs, ProgramID);

}
function OrgCampusTypeSelect(e) {
    var dataItem = this.dataSource.view()[e.item.index()];
    var values = this.value();
    if (dataItem.OrganizationTitle === "All") {
        $('#OrgCampus').data("kendoMultiSelect").value([]);
    } else if (jQuery.inArray("-1", values)) {
        values = $.grep(values, function (value) {
            return value !== -1;
        });
        if (values == "") { this.value(values); }
    }

}
function OrgBuildingTypeSelect(e) {
    var dataItem = this.dataSource.view()[e.item.index()];
    var values = this.value();
    if (dataItem.OrganizationTitle === "All") {
        $('#OrgBuilding').data("kendoMultiSelect").value([]);
    } else if (jQuery.inArray("-1", values)) {
        values = $.grep(values, function (value) {
            return value !== -1;
        });
        if (values == "") { this.value(values); }
    }

}
function OrgDepartmentTypeSelect(e) {
    var dataItem = this.dataSource.view()[e.item.index()];
    var values = this.value();

    if (dataItem.OrganizationTitle === "All") {
        $('#OrgDepartment').data("kendoMultiSelect").value([]);
    } else if (jQuery.inArray("-1", values)) {
        values = $.grep(values, function (value) {
            return value !== -1;
        });
        if (values == "") { this.value(values); }
    }
}
function GetParameterValues() {

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

    var SelectedEpIDs = [];
    var SelectedEpNames = [];
    $('#AMPEP :selected').each(function (i, selected) {
        SelectedEpIDs[i] = $(selected).val();
        SelectedEpNames[i] = $(selected).text().trim();
    });
    if (SelectedEpIDs.length <= 0) {
        SelectedEpIDs.push(defaultValue);
        SelectedEpNames.push(defaultText);
    }

    var SelectedAssignedToIds = [];
    var SelectedAssignedToNames = [];
    $('#TaskAssignedTo :selected').each(function (i, selected) {
        SelectedAssignedToIds[i] = $(selected).val();
        SelectedAssignedToNames[i] = GetReportHeaderUserNameFormat($(selected).text().trim(),true);
    });
    if (SelectedAssignedToIds.length <= 0) {
        SelectedAssignedToIds.push(defaultValue);
        SelectedAssignedToNames.push(defaultText);
    }

    var SelectedAssignedByIds = [];
    var SelectedAssignedByNames = [];
    $('#TaskAssignedBy :selected').each(function (i, selected) {
        SelectedAssignedByIds[i] = $(selected).val();
        SelectedAssignedByNames[i] = GetReportHeaderUserNameFormat($(selected).text().trim(),true);
    });
    if (SelectedAssignedByIds.length <= 0) {
        SelectedAssignedByIds.push(defaultValue);
        SelectedAssignedByNames.push(defaultText);
    }

    var SelectedEmailCcedIds = [];
    var SelectedEmailCcedNames = [];
    $('#EmailCcedTo :selected').each(function (i, selected) {
        SelectedEmailCcedIds[i] = $(selected).val();
        SelectedEmailCcedNames[i] = GetReportHeaderUserNameFormat($(selected).text().trim(),true);
    });
    if (SelectedEmailCcedIds.length <= 0) {
        SelectedEmailCcedIds.push(defaultValue);
        SelectedEmailCcedNames.push(defaultText);
    }

    var SelectedTaskStatusIds = [];
    var SelectedTaskStatusNames = [];
    $('#TaskStatus :selected').each(function (i, selected) {
        SelectedTaskStatusIds[i] = $(selected).val();
        SelectedTaskStatusNames[i] = $(selected).text().trim();
    });
    if (SelectedTaskStatusIds.length <= 0) {
        SelectedTaskStatusIds.push(defaultValue);
        SelectedTaskStatusNames.push(defaultText);
    }

    var SelectedCoPIDs = [];
    var SelectedCoPNames = [];
    $('#MultiSiteCoP :selected').each(function (i, selected) {
        SelectedCoPIDs[i] = $(selected).val();
        SelectedCoPNames[i] = $(selected).text();

    });
    if (SelectedCoPIDs.length <= 0) {
        SelectedCoPIDs.push(defaultValue);
        SelectedCoPNames.push(defaultText);
    }

    var SelectedTagIDs = [];
    var SelectedTagNames = [];
    $('#MultiSiteTag :selected').each(function (i, selected) {
        SelectedTagIDs[i] = $(selected).val();
        SelectedTagNames[i] = $(selected).text().trim();
    });
    if (SelectedTagIDs.length <= 0) {
        SelectedTagIDs.push(defaultValue);
        SelectedTagNames.push(defaultText);
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

    var SelectedSiteName = "";
    if ($('#hdnSitesCount').val() == 1) {
        SelectedSiteName = $('#hdnSingleSiteName').val();
    }
    else {
        SelectedSiteName = $("#SiteSelector_SelectedSiteName").val();
    }

    var scheduleType = $("input[name=RecurrenceType]:checked").val();
    var scheduleRecc = $("input[name=RecurrenceRange]:checked").length;
    var selectedRecurrenceDays = "";
    var selectedRecurrenceDD = "";
    var dueInCheckBox = false;
    var SelectedRecurrence = "";
    if (scheduleType == "Daily" && scheduleRecc == 1) {
        selectedRecurrenceDays = $('#txtLastndays').val();
        dueInCheckBox = true;
        SelectedRecurrence = dueInCheckBox + "," + selectedRecurrenceDays + "," +"Days";
    }
    else if (scheduleType == "Weekly" && scheduleRecc == 1) {
        selectedRecurrenceDays = $('#txtLastweek').val();
        selectedRecurrenceDD = $("#ddWeek").data("kendoDropDownList").text();
        dueInCheckBox = true;
        SelectedRecurrence = dueInCheckBox + "," + selectedRecurrenceDays + "," + selectedRecurrenceDD;
    }
    else if (scheduleType == "Monthly" && scheduleRecc == 1) {
        selectedRecurrenceDays = $('#txtLastmonth').val();
        selectedRecurrenceDD = $("#ddMonth").data("kendoDropDownList").text();
        dueInCheckBox = true;
        SelectedRecurrence = dueInCheckBox + "," + selectedRecurrenceDays + "," + selectedRecurrenceDD;
    }
    else if (scheduleType == "Quarterly" && scheduleRecc == 1) {
        selectedRecurrenceDays = $('#txtLastquarter').val();
        selectedRecurrenceDD = $("#ddQuarter").data("kendoDropDownList").text();
        dueInCheckBox = true;
        SelectedRecurrence = dueInCheckBox + "," + selectedRecurrenceDays + "," + selectedRecurrenceDD;
    }
    else if ($('#chkCurrent').is(':checked') && scheduleRecc != 1) {
        var selectionValue = $("label[for*='chkCurrent']").text().split(" ")[2];
        SelectedRecurrence = selectionValue == "Day" ? "false,0,days" :
                                selectionValue == "Month" ? "false,0,months" :
                                selectionValue == "Quarter" ? "false,0,quarters" :
                                selectionValue == "Week" ? "false,0,weeks" : "";
    }
    var searchset =
    {
        SelectedSiteIDs: ERSites.getSelectedSites().replace(/\,$/, ''),
        SelectedSiteNames: SelectedSiteName,
        SelectedChapterIDs: SelectedChapterIDs.toString(),
        SelectedChapterNames: SelectedChapterNames.toString(),
        SelectedStandardIDs: SelectedStandardIDs.toString(),
        SelectedStandardNames: SelectedStandardNames.toString().replace(/,/g, ", "),
        SelectedEpIDs: SelectedEpIDs.toString(),
        SelectedEpNames: SelectedEpNames.toString().replace(/,/g, ", "),
        SelectedCoPIDs: SelectedCoPIDs.toString().replace(/,/g, ", "),
        SelectedCoPNames: SelectedCoPNames.toString().replace(/,/g, ", "),
        SelectedTagIDs: SelectedTagIDs.toString().replace(/,/g, ", "),
        SelectedTagNames: SelectedTagNames.toString().replace(/,/g, ", "),
        SelectedAssignedToIDs: SelectedAssignedToIds.toString(),
        SelectedAssignedToNames: SelectedAssignedToNames.sort(lastNameSort).toString().replace(/,/g, ", "),
        SelectedAssignedByIDs: SelectedAssignedByIds.toString(),
        SelectedAssignedByNames: SelectedAssignedByNames.sort(lastNameSort).toString().replace(/,/g, ", "),
        SelectedEmailCcedIds: SelectedEmailCcedIds.toString(),
        SelectedEmailCcedNames: SelectedEmailCcedNames.sort(lastNameSort).toString().replace(/,/g, ", "),
        TracerListIDs: TracerListIDs.toString(),
        TracerListNames: TracerListNames.toString().replace(/,/g, ", "),
        OrgTypeLevel1IDs: OrgTypeLevel1IDs.toString(),
        OrgTypeLevel1Names: OrgTypeLevel1Names.toString().replace(/,/g, ", "),
        OrgTypeLevel2IDs: OrgTypeLevel2IDs.toString(),
        OrgTypeLevel2Names: OrgTypeLevel2Names.toString().replace(/,/g, ", "),
        OrgTypeLevel3IDs: OrgTypeLevel3IDs.toString(),
        OrgTypeLevel3Names: OrgTypeLevel3Names.toString().replace(/,/g, ", "),
        SelectedTaskStatusIDs: SelectedTaskStatusIds.toString(),
        SelectedTaskStatusNames: SelectedTaskStatusNames.toString().replace(/,/g, ", "),
        IncludePastDue: $('#chkPastDue').is(':checked'),
        IncludeCurrent: $('#chkCurrent').is(':checked'),
        ReportType: $('input[name=ReportLevelChange]:checked').val(),
        DueFromDate: kendo.toString($("#fromDueDate").data("kendoDatePicker").value(), "MM/dd/yyyy"),
        DueToDate: kendo.toString($("#toDueDate").data("kendoDatePicker").value(), "MM/dd/yyyy"),
        AssignFromDate: kendo.toString($("#fromAssiDate").data("kendoDatePicker").value(), "MM/dd/yyyy"),
        AssignToDate: kendo.toString($("#toAssiDate").data("kendoDatePicker").value(), "MM/dd/yyyy"),
        ReportTitle: $('#txtScheduledReportName').val() == '' ? $('#hdnReportTitle').val() : $('#txtScheduledReportName').val(),
        SelectedRecurrence: SelectedRecurrence,
    }
    return searchset;
}


//Save the selected parameters
function SaveToMyReports(deleteReport) {
    // create_error_elem();
    var searchCriteria = GetParameterValues();
    var parameterSet = [
       { ReportTitle: searchCriteria.ReportTitle },
       { SelectedSites: searchCriteria.SelectedSiteIDs },
       { ProgramServices: ProgramID },
       { ChapterIDs: searchCriteria.SelectedChapterIDs },
       { StandardIDs: searchCriteria.SelectedStandardIDs },
       { EPIDs: searchCriteria.SelectedEpIDs },
       { CoPIDs: searchCriteria.SelectedCoPIDs },
       { TagIDs: searchCriteria.SelectedTagIDs },
       { TaskAssignedBy: searchCriteria.SelectedAssignedByIDs },
       { TaskAssignedTo: searchCriteria.SelectedAssignedToIDs },
       { EmailCcedTo: searchCriteria.SelectedEmailCcedIds },
       { TaskStatus: searchCriteria.SelectedTaskStatusIDs },
       { ReportType: searchCriteria.ReportType },
       { IncludePastDue: searchCriteria.IncludePastDue },
       { IncludeCurrent: searchCriteria.IncludeCurrent},
       { fromDueDate: searchCriteria.DueFromDate == null ? "" : searchCriteria.DueFromDate },
       { toDueDate: searchCriteria.DueToDate == null ? "" : searchCriteria.DueToDate },
       { fromAssignedDate: searchCriteria.AssignFromDate == null ? "" : searchCriteria.AssignFromDate },
       { toAssignedDate: searchCriteria.AssignToDate == null ? "" : searchCriteria.AssignToDate },
       { OrgCampus: searchCriteria.OrgTypeLevel3IDs },
       { OrgBuilding: searchCriteria.OrgTypeLevel2IDs },
       { OrgDepartment: searchCriteria.OrgTypeLevel1IDs },
       { TracersList: searchCriteria.TracerListIDs },
       { SelectedRecurrence: searchCriteria.SelectedRecurrence },
   ];

    if (saveRecurrenceScreen != null && saveRecurrenceScreen === "Email") {
            parameterSet.push({ ScheduledReportName: $('#txtScheduledReportName1').val() });
    }
    else {
        parameterSet.push({ ScheduledReportName: $('#txtScheduledReportName').val() });
        $('#txtScheduledReportName1').val($('#txtScheduledReportName').val());
    }

    //Add recurrence fields to the parameter set
    GetERRecurrenceParameters(parameterSet);

    //Save the parameters to the database
    SaveSchedule(parameterSet, deleteReport);
}
//Sets the saved parameters for each control
function SetSavedParameters(params) {
    var selectedSites = '';
    var query = $(params.ReportSiteMaps).each(function () {
        selectedSites += $(this)[0].SiteID + ',';
    });
    selectedSites = selectedSites.replace(/\,$/, '');
    ERSites.oldSites = ERSites.getSelectedSites();
    $('#txtScheduledReportName').val(params.ReportNameOverride);
    LoadReportParameters(selectedSites);
    //Load the Chapters, Standards and EPs
    MultiSiteChapterCall(selectedSites, 1, getParamValue(params.ReportParameters, "ProgramServices"));
    $("#MultiSiteChapter").data("kendoMultiSelect").value(getParamValue(params.ReportParameters, "ChapterIDs").split(","));
    UpdateStandards();
    if (getParamValue(params.ReportParameters, "StandardIDs") != null) {
        $("#AMPStandard").data("kendoMultiSelect").value(getParamValue(params.ReportParameters, "StandardIDs").split(","));
        UpdateEPs();
        if (getParamValue(params.ReportParameters, "EPIDs") != null) {
            $("#AMPEP").data("kendoMultiSelect").value(getParamValue(params.ReportParameters, "EPIDs").split(","));
        }
    }

    MultiSiteCoPCall(getParamValue(params.ReportParameters, "ProgramServices"));
    $("#MultiSiteCoP").data("kendoMultiSelect").value(getParamValue(params.ReportParameters, "CoPIDs").split(","));
    UpdateTags();
    if (getParamValue(params.ReportParameters, "TagIDs") != null) {
        $("#MultiSiteTag").data("kendoMultiSelect").value(getParamValue(params.ReportParameters, "TagIDs").split(","));
    }

    $("#TaskAssignedBy").data("kendoMultiSelect").value(getParamValue(params.ReportParameters, "TaskAssignedBy").split(","));
    $("#TaskAssignedTo").data("kendoMultiSelect").value(getParamValue(params.ReportParameters, "TaskAssignedTo").split(","));
    $("#EmailCcedTo").data("kendoMultiSelect").value(getParamValue(params.ReportParameters, "EmailCcedTo").split(","));
    $("#TaskStatus").data("kendoMultiSelect").value(getParamValue(params.ReportParameters, "TaskStatus").split(","));


    $('input[name=ReportLevelChange][value=' + (getParamValue(params.ReportParameters, "ReportType")) + ']').prop('checked', true);

    var fDueDate = kendo.toString(kendo.parseDate(getParamValue(params.ReportParameters, "fromDueDate")), 'MM/dd/yyyy');
    $("#fromDueDate").data("kendoDatePicker").value(fDueDate);

    var fromAssiDate = kendo.toString(kendo.parseDate(getParamValue(params.ReportParameters, "fromAssignedDate")), 'MM/dd/yyyy');
    $("#fromAssiDate").data("kendoDatePicker").value(fromAssiDate);

    var toAssiDate = kendo.toString(kendo.parseDate(getParamValue(params.ReportParameters, "toAssignedDate")), 'MM/dd/yyyy');
    $("#toAssiDate").data("kendoDatePicker").value(toAssiDate);

    var tracerlistvalues = getParamValue(params.ReportParameters, "TracersList");
    if (tracerlistvalues != null)
        $("#TracersList").data("kendoMultiSelect").value(tracerlistvalues.split(","));
    SetOrgHierarchy(params.ReportParameters);
    if (getParamValue(params.ReportParameters, "IncludePastDue") != "False") {
        $("#chkPastDue").prop("checked", true);
    }
    else {
        var tDueDate = kendo.toString(kendo.parseDate(getParamValue(params.ReportParameters, "toDueDate")), 'MM/dd/yyyy');
        $("#toDueDate").data("kendoDatePicker").value(tDueDate);
    }
    if (getParamValue(params.ReportParameters, "IncludeCurrent") != "False") {
        $("#chkCurrent").prop("checked", true);
    }  
    SetERRecurrenceParameters(params);

    TriggerActionByReportMode(params.ReportMode);
}

function dueDateChange(selectedDueValue, recurrenceRangChecked, selectedDuePeriodValue, includePastDue, includeCurrent) {
    CheckRecurrenceDateSelection();
    if (selectedDuePeriodValue === 'days') {
        $("label[for*='chkCurrent']").html('');
        $("label[for*='chkCurrent']").html('Include Current Day');
    }
    else if (selectedDuePeriodValue === 'weeks') {
        $("label[for*='chkCurrent']").html('');
        $("label[for*='chkCurrent']").html('Include Current Week');
    }
    else if (selectedDuePeriodValue === 'months') {
        $("label[for*='chkCurrent']").html('');
        $("label[for*='chkCurrent']").html('Include Current Month');
    }
    else if (selectedDuePeriodValue === 'quarters') {
        $("label[for*='chkCurrent']").html('');
        $("label[for*='chkCurrent']").html('Include Current Quarter');
    }
    if (recurrenceRangChecked == false && includeCurrent == true) {
        var checkCurentStatus = $("label[for*='chkCurrent']").text().split(" ")[2];
        selectedDuePeriodValue = checkCurentStatus == "Day" ? "days" :
                            checkCurentStatus == "Month" ? "months" :
                            checkCurentStatus == "Quarter" ? "quarters" :
                            checkCurentStatus == "Week" ? "weeks" : "";

    }
    var fromDate = includeCurrent != false ? 0 : 1;
    if (selectedDueValue != -1) {
        selectedDueValue = recurrenceRangChecked == false ? 0 : selectedDueValue;
        switch (selectedDuePeriodValue) {
            case "days":
                $("#fromDueDate").data("kendoDatePicker").value(moment().add(fromDate, "days").format('L'));
                $("#toDueDate").data("kendoDatePicker").value(moment().add(selectedDueValue, selectedDuePeriodValue).format('L'));
                break;
            case "weeks":
                $("#fromDueDate").data("kendoDatePicker").value(moment().add(fromDate, selectedDuePeriodValue).startOf('week').format('L'))
                $("#toDueDate").data("kendoDatePicker").value(moment().add(selectedDueValue, selectedDuePeriodValue).endOf('week').format('L'));
                break;
            case "months":
                $("#fromDueDate").data("kendoDatePicker").value(moment().add(fromDate, selectedDuePeriodValue).startOf('month').format('L'))
                $("#toDueDate").data("kendoDatePicker").value(moment().add(selectedDueValue, selectedDuePeriodValue).endOf('month').format('L'));
                break;
            case "quarters":
                $("#fromDueDate").data("kendoDatePicker").value(moment().add(fromDate, selectedDuePeriodValue).startOf('quarter').format('L'))
                $("#toDueDate").data("kendoDatePicker").value(moment().add(selectedDueValue, selectedDuePeriodValue).endOf('quarter').format('L'));
                break;
            default:
                $("#fromDueDate").data("kendoDatePicker").value("");
                $("#toDueDate").data("kendoDatePicker").value("");
                break;
        }
    }
    if (includePastDue != false) {
        $("#fromDueDate").data("kendoDatePicker").value("");
        if ($("#toDueDate").data("kendoDatePicker").value() == null) {
            $('#toDueDate').data('kendoDatePicker').value(moment().add(-1, 'days').format('L'));
        }
    }
    EnableDisableDueDate();
}


function ResetDueDates() {
    $("#toDueDate").data("kendoDatePicker").value("");

    $('#toDueDate').data('kendoDatePicker').enable(true);
}

function AddExportParameters() {
    var paramsearchset = $.parseJSON(sessionStorage.getItem('searchsetsession'));
    var OrgRanking3Nametext = $("#OrgRanking3Name").val() != "" ? $("#OrgRanking3Name").val() + ", " : "";
    var OrgRanking2Nametext = $("#OrgRanking2Name").val() != "" ? $("#OrgRanking2Name").val() + ", " : "";
    var stringvalue = "";
    var SelectedSiteName = "";
    if ($('#hdnSitesCount').val() == 1) {
        SelectedSiteName = $('#hdnSingleSiteName').val();
    }
    else {
        SelectedSiteName = $("#SiteSelector_SelectedSiteName").val();
    }
    var dueDate = "";
    if (paramsearchset.DueFromDate == null) {
        if (paramsearchset.DueToDate == null) {
            dueDate = "All Dates";
        }
        else{
            dueDate = "through " + paramsearchset.DueToDate.toString("MM/dd/yyyy");
        }
    }
    else{
        if (paramsearchset.DueToDate == null) {
            dueDate = "since " + paramsearchset.DueFromDate.toString("MM/dd/yyyy");
        }
        else{
            dueDate = paramsearchset.DueFromDate.toString("MM/dd/yyyy") + "-" + paramsearchset.DueToDate.toString("MM/dd/yyyy");;
        }
    }
    var assignDate = "";
    if (paramsearchset.AssignFromDate == null) {
        if (paramsearchset.AssignToDate == null) {
            assignDate = "All Dates";
        }
        else{
            assignDate = "through " + paramsearchset.AssignToDate.toString("MM/dd/yyyy");
        }
    }
    else{
        if(paramsearchset.AssignToDate == null){
            assignDate = "since " + paramsearchset.AssignFromDate.toString("MM/dd/yyyy");
        }
        else{
            assignDate = paramsearchset.AssignFromDate.toString("MM/dd/yyyy") + "-" + paramsearchset.AssignToDate.toString("MM/dd/yyyy");;
        }
    }
    if (isCMS) {
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
                            { value: SelectedSiteName }
                            ]
                        },
                        {
                            cells: [
                            { value: "Program" },
                            { value: $("#hdnProgramName").val() }
                            ]
                        },
                        {
                            cells: [
                            { value: "Assigned To" },
                            { value: paramsearchset.SelectedAssignedToNames }
                            ]
                        },
                        {
                            cells: [
                            { value: "Assigned By" },
                            { value: paramsearchset.SelectedAssignedByNames }
                            ]
                        },
                        {
                            cells: [
                            { value: "Email Cc'd To" },
                            { value: paramsearchset.SelectedEmailCcedNames }
                            ]
                        },
                        {
                            cells: [
                            { value: "Status" },
                            { value: paramsearchset.SelectedTaskStatusNames }
                            ]
                        },
                        {
                            cells: [
                            { value: "Due Date" },
                            { value: dueDate }
                            ]
                        },
                        {
                            cells: [
                            { value: "Assigned Date" },
                            { value: assignDate }
                            ]
                        },
                        {
                            cells: [
                            { value: "Chapter" },
                            { value: paramsearchset.SelectedChapterNames }
                            ]
                        },
                        {
                            cells: [
                            { value: "Standard" },
                            { value: paramsearchset.SelectedStandardNames }
                            ]
                        },
                        {
                            cells: [
                            { value: "EP" },
                            { value: paramsearchset.SelectedEpNames }
                            ]
                        },
                        {
                            cells: [
                                { value: "CoP" },
                                { value: paramsearchset.SelectedCoPNames }
                            ]
                        },
                        {
                            cells: [
                                { value: "Tag" },
                                { value: paramsearchset.SelectedTagNames }
                            ],

                        },
                        {
                            cells: [
                            { value: "Tracer Name" },
                            { value: paramsearchset.TracerListNames }
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

    }
    else {
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
                            { value: SelectedSiteName }
                            ]
                        },
                        {
                            cells: [
                            { value: "Program" },
                            { value: $("#hdnProgramName").val() }
                            ]
                        },
                        {
                            cells: [
                            { value: "Assigned To" },
                            { value: paramsearchset.SelectedAssignedToNames }
                            ]
                        },
                        {
                            cells: [
                            { value: "Assigned By" },
                            { value: paramsearchset.SelectedAssignedByNames }
                            ]
                        },
                        {
                            cells: [
                            { value: "Email Cc'd To" },
                            { value: paramsearchset.SelectedEmailCcedNames }
                            ]
                        },
                        {
                            cells: [
                            { value: "Status" },
                            { value: paramsearchset.SelectedTaskStatusNames }
                            ]
                        },
                        {
                            cells: [
                            { value: "Due Date" },
                            { value: dueDate }
                            ]
                        },
                        {
                            cells: [
                            { value: "Assigned Date" },
                            { value: assignDate }
                            ]
                        },
                        {
                            cells: [
                            { value: "Chapter" },
                            { value: paramsearchset.SelectedChapterNames }
                            ]
                        },
                        {
                            cells: [
                            { value: "Standard" },
                            { value: paramsearchset.SelectedStandardNames }
                            ]
                        },
                        {
                            cells: [
                            { value: "EP" },
                            { value: paramsearchset.SelectedEpNames }
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
    }
    return stringvalue;
}

function ERExcelExportTask() {

    //$('.loading').show();
    $("#gridTaskRptExcel").getKendoGrid().saveAsExcel();


    //$('.loading').hide();
}

function ERexcelExportTDS(e) {

    blockElement("divL1tag");

    e.preventDefault();
    var sheets = [
        e.workbook.sheets[0], AddExportParameters()

    ];
    sheets[0].title = "Task Report";
    sheets[1].title = "Report Selections";

    var rows = e.workbook.sheets[0].rows;


    for (var ri = 0; ri < rows.length; ri++) {
        var row = rows[ri];

        for (var ci = 0; ci < row.cells.length; ci++) {
            var cell = row.cells[ci];

            if (cell.value && typeof (cell.value) === "string") {
                // Use jQuery.fn.text to remove the HTML and get only the text                
                cell.value = stripHTML(cell.value);
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
        email.Title = $("#ReportTitle").html();
        $(function () {

            $.post('/Email/SendExcelEmail',
                { base64: dataURL, email: email }, function (data) {
                    console.log(data);
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
            fileName: $("#ReportTitle").html() + GetReportDateAdder() + ".xlsx",
            forceProxy: false,
            proxyURL: '/Export/Excel_Export_Save'
        });
    }
    unBlockElement("divL1tag");
}

function stripHTML(html) {
    var tmp = document.createElement("DIV");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
}

function ERSendEmailForTaskReport() {
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
                    { ERExcelExportTask(); }
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
            { ERExcelExportTask(); }
        }
        else {
            fromemail = false;

            ShowEmailStatus("No data found matching your Criteria. Change Criteria and try again.", 'failure');
        }
    }
}

function EnableDisableRecurrence(flag) {
    var emailObject = $("#btnRecurrence").data("kendoButton");
    emailObject.enable(flag);
}

function dataBoundExcelView(e) {
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
