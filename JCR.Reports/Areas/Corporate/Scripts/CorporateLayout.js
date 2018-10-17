var ERCriteriaLoaded = false;
var epScoringReportID = 27;
var taskAssignmentID = 28;
var taskReportID = 42;
var epAssignmentScoringReportID = 32;
var cmsComplianceReportID = 34;
var EPsNotScoredinPeriod = 37;
var EPScoringReportFinalMockSurvey = 38;
var ComprehensiveScoringReport = 39;
var isCorporateSiteSelected = false;

var UserRole = {
    "ProgramAdmin": { value: 1, name: "Program Administrator" },
    "SiteManager": { value: 2, name: "Site Manager" },
    "StaffMember": { value: 4, name: "Staff Member" },
    "CorpUser": { value: 8, name: "Mock Survey User" },
    "CorpReviewer": { value: 9, name: "Mock Survey Reviewer" }
}

function EnableDisableEmail(flag) {
    var emailObject = $("#btnEmail").data("kendoButton");
    emailObject.enable(flag);

}

function OnDocumentReady() {
    isCorporateSiteSelected = $('#hdnIsCorporateSite').val().toLowerCase()== "true"? true: false;   

    if ($('#hdnUserRole').val() == UserRole.CorpReviewer.name || ($('#hdnUserRole').val() == UserRole.CorpUser.name)) {
        $('#DashBoardTab').addClass("hidden");
    }
    $('#ReportsTab').addClass("active");
    var ulQuickLinks = $("#ulQuickLinks");

    $('.navbar').on('affix.bs.affix', function () {
        $(ulQuickLinks).show();

    }).on('affix-top.bs.affix', function () {
        $(ulQuickLinks).hide();
    });

    //Load Sites for the logged-in user - START
    var lstSites = [];

    var siteObj = {};

    $.ajax({
        url: "/Corporate/Home/LoadUserSites",
        success: function (response) {
            lstSites = response;
        },
        dataType: "json",
        cache: false
    });

    $("#siteSelect").click(function () {
        setTimeout("$('[id=siteSelectInput]').focus();", 0)

        LoadTypeAhead();

    });

    function LoadTypeAhead() {

        $('#siteSelectInput').typeahead('destroy');

        $('#siteSelectInput').typeahead({
            minLength: 0,
            items: 9999,
            showHintOnFocus: true,
            source: function (query, process) {
                sites = [];
                map = {};
                $.each(lstSites, function (i, site) {
                    map[site.SiteFullName] = site;
                    sites.push(site.SiteFullName);
                });
                process(sites);
            },           
            updater: function (item) {
                siteObj = GetSelectSiteDetails(lstSites, item);
                

                if (siteObj.IsAMPAccess == 0) {
                //if (siteObj.IsTracersAccess == 0) {

                    var header = 'Confirm Navigation';
                    var title = "AMP access not enabled for this site/program. Do you want to continue?";


                    modalConfirm.OpenModal(ConfirmSiteNavigation, title, header);
                    return;
                }

                ConfirmSiteNavigation();

                return '';
            }
        });

    }

    function ConfirmSiteNavigation(callback){
        if (callback == false) {
            return;
        }

        var redirectToHome = callback ? true : false;
        

        $.ajax({
            type: "POST",
            url: "/Corporate/Home/ReloadPage",
            data: {
                _site: siteObj,
                _redirectToHome : redirectToHome
            },
            success: function (result) {
                if (redirectToHome) {
                    window.location.href = "/Transfer/RedirectToWebApp?webapp=Tracers&pageId=1";
                    return;
                }

                var url = window.location.href;
                if (url.toLowerCase().indexOf("/home/index") > -1 || url.toLowerCase().indexOf("/home/myreports") > -1
                    || url.toLowerCase().indexOf("/home/searchreports") > -1)
                { window.location.reload(); }
                //For task report it should redirect to report instead of AMP report landing page due to task report presence in both AMP and Tracer
                else if ($('#hdnReportID').val() == 42) {
                    window.location.reload();
                }
                else {
                    var newURL = url.substring(0, url.toLowerCase().indexOf("/corporate/") + 1);
                    window.location.href = newURL + "Corporate/Home/Index";
                }
            }
        });

    }

    $('#siteSelectInput').click(function (event) {
        event.stopPropagation();
    });

    // Get data from DBMEdition01.dbo.UserMenuState table, then render horizontal and vertical menus.
    IntegratedMenu.CommonCode.init($('#hdnUserID').val(), $('#hdnAuthToken').val(), $('#hdnWebApiUrl').val(), $('#hdnPageID').val(), 'reports', 'cbp-hrmenu', 'ddl-setup');

    PlaceFooter();
}

function SetColumnHeader(GridName, startIndex, optionalscrollable) {
    optionalscrollable = (typeof optionalscrollable === 'undefined') ? 'true' : optionalscrollable;
    // hide the org hierarchy columns and rename as applicable
    if ($("#OrgRanking3Name").val() == "") {
        $("#" + GridName).data("kendoGrid").hideColumn(startIndex);
        $("#" + GridName).data("kendoGrid").columns[startIndex].title = "";
        $("#" + GridName).data("kendoGrid").columns[startIndex].field = "";
    }
    else {

        $("#" + GridName).data("kendoGrid").columns[startIndex].title = $("#OrgRanking3Name").val();
        $("#" + GridName).data("kendoGrid").columns[startIndex].field = "OrgName_Rank3";
        $("#" + GridName).data("kendoGrid").showColumn(startIndex);
        $("#" + GridName + " thead [data-field=OrgName_Rank3] .k-link").html($("#OrgRanking3Name").val());
        if (optionalscrollable)
        { $("#" + GridName + " .k-grid-header-wrap > table > thead > tr > th[data-field=OrgName_Rank3]").attr("data-title", $("#OrgRanking3Name").val()); }
        else { $("#" + GridName + " .k-grid-header > tr > th[data-field=OrgName_Rank3]").attr("data-title", $("#OrgRanking3Name").val()); }
    }

    if ($("#OrgRanking2Name").val() == "") {
        $("#" + GridName).data("kendoGrid").hideColumn(startIndex + 1);
        $("#" + GridName).data("kendoGrid").columns[startIndex + 1].title = "";
        $("#" + GridName).data("kendoGrid").columns[startIndex + 1].field = "";
    }
    else {
        $("#" + GridName).data("kendoGrid").columns[startIndex + 1].title = $("#OrgRanking2Name").val();
        $("#" + GridName).data("kendoGrid").columns[startIndex + 1].field = "OrgName_Rank2";
        $("#" + GridName).data("kendoGrid").showColumn(startIndex + 1);
        $("#" + GridName + " thead [data-field=OrgName_Rank2] .k-link").html($("#OrgRanking2Name").val());
        if (optionalscrollable)
        { $("#" + GridName + " .k-grid-header-wrap > table > thead > tr > th[data-field=OrgName_Rank2]").attr("data-title", $("#OrgRanking2Name").val()); }
        else { $("#" + GridName + " .k-grid-header > tr > th[data-field=OrgName_Rank2]").attr("data-title", $("#OrgRanking2Name").val()); }
    }
    if (navigator != undefined && navigator.appVersion != undefined && (navigator.appVersion.indexOf("MSIE 8") != -1)) {        //this is for only ie condition ( microsoft internet explore )

        $("#" + GridName + " .k-grid-toolbar").append('  <i> Note: This browser version does not support advanced Excel View features. Refer Help for more information.</i>');
    }
}

function NavProgramSelect(_productID, _programID, _programName, _advCertListTypeID) {
    var currentProgramID = $("#hdnProgramID").val();
    if (currentProgramID == _programID)
        return false;

    $.ajax({
        type: "POST",
        url: "/Corporate/Home/UpdatePrograms",
        data: {
            productID: _productID,
            programID: _programID,
            programName: _programName,
            advCertListTypeID: _advCertListTypeID
        },
        success: function (result) {
            var url = window.location.href;
            if (url.toLowerCase().indexOf("/home/index") > -1 || url.toLowerCase().indexOf("/home/myreports") > -1
                || url.toLowerCase().indexOf("/home/searchreports") > -1)
            { window.location.reload(); }
            else if ($('#hdnReportID').val() == 42) {
                window.location.reload();
            }
            else {
                var newURL = url.substring(0, url.toLowerCase().indexOf("/corporate/") + 1);
                window.location.href = newURL + "Corporate/Home/Index";
            }
        }
    });
}

function GetSelectSiteDetails(SiteArray, SiteFullName) {

    var _site = {};

    $.each(SiteArray, function () {
        if (this.SiteFullName == SiteFullName) {
            _site = this;

            return false;
        }
    });

    return _site;
}


//Object used to set and get Selected sites
var ERSites = {
    oldSites: '',
    getSelectedSites: function () {
        if ($('#hdnSitesCount').val() == 1)
            return $('#hdnSingleSiteID').val();
        else
            return $("#SiteSelector_SelectedSiteIDs").val();
    }
}

$('.NavigationTab').mouseover(function () {
    $(this).addClass('open');
});

$('.NavigationTab').mouseout(function () {
    $(this).removeClass('open');
});

function PlaceFooter() {
    var footerTop;

    if ($('#loadChartView').height() > 100)
        footerTop = $('#loadChartView').height() + 200;
    else
        footerTop = $('#body').height() + 500;

    $('#CorpLayOutFooter').offset({
        top: footerTop
    });
}

function ERSearchClick() {

    if (ERSites.oldSites === ERSites.getSelectedSites()) {
        ERCriteriaLoaded = true;
    }
    else { ERSites.oldSites = ERSites.getSelectedSites(); }

    var tmpERCriteriaLoaded = ERCriteriaLoaded;
    ERSearchLoadParameters("criteria");

    if (!tmpERCriteriaLoaded) {
        ResetStandardsMultiSelect();
    }

    PlaceFooter();

    $('#topNavbar').removeClass('affix').addClass('affix-top');
    $(ulQuickLinks).hide();
}

function OnbtnEmailClick(sender, e) {
    if (ERSites.oldSites === ERSites.getSelectedSites()) {
        ERCriteriaLoaded = true;
    }
    else {
        ERSites.oldSites = ERSites.getSelectedSites();
    }

    var tmpERCriteriaLoaded = ERCriteriaLoaded;
    ERSearchLoadParameters("email");

    if (!tmpERCriteriaLoaded) {
        ResetStandardsMultiSelect();
        if (typeof (ResetScoredByMultiSelect) == "function") ResetScoredByMultiSelect();
    }
    saveRecurrenceScreen = "Email";
}

function SetEmailSubject() {
    $(".EmailSubjectMaskedTextbox").val("AMP: " + $("#ReportTitle").html());
}

// common scripts end
//Email Functionality start
function ERSendEmail() {

    var isSingleProgramSelectionMode = IsSingleProgramSelectionMode();
    if (isSingleProgramSelectionMode) {
        if ($('#hdnReportID').val() == epScoringReportID || $('#hdnReportID').val() == epAssignmentScoringReportID || $('#hdnReportID').val() == cmsComplianceReportID
            || $('#hdnReportID').val() == EPsNotScoredinPeriod || $('#hdnReportID').val() == EPScoringReportFinalMockSurvey || $('#hdnReportID').val() == ComprehensiveScoringReport)
        { ERSendEmailForEPScoring(); }
        else if ($('#hdnReportID').val() == taskAssignmentID) {
            ERSendEmailbyReport();
        }
        else if ($('#hdnReportID').val() == taskReportID) {
            ERSendEmailForTaskReport();
        }
    }
    else {
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
}
//Email Functionality end

//Resets the Standards MultiSelect control to All option
function ResetStandardsMultiSelect() {
    if ($("#AMPStandard").length > 0) {
        var dataSource = new kendo.data.DataSource({
            data: [
                { StandardLabel: "All", StandardID: "-1" }
            ]
        });
        $("#AMPStandard").data("kendoMultiSelect").setDataSource(dataSource);
        $("#AMPStandard").data("kendoMultiSelect").value("-1");
    }
}

//Resets the EPs MultiSelect control to All option
function ResetEPsMultiSelect() {
    if ($("#AMPEP").length > 0) {
        var dataSource = new kendo.data.DataSource({
            data: [
                { StandardLabelAndEPLabel: "All", EPTextID: "-1" }
            ]
        });
        $("#AMPEP").data("kendoMultiSelect").setDataSource(dataSource);
        $("#AMPEP").data("kendoMultiSelect").value("-1");
    }
}

function OnbtnERSearchClick(sender, e) {
    ERSearchClick();
}

function onTaskStatusSelect(e) {
    var dataItem = this.dataSource.view()[e.item.index()];
    var values = this.value();

    if (dataItem.TaskStatusName === "All") {
        $('#TaskStatus').data("kendoMultiSelect").value([]);

    } else if (jQuery.inArray("-1", values)) {
        values = $.grep(values, function (value) {
            return value !== -1;
        });

        if (values == "") { this.value(values); }
    }
}
function onTaskAssignedToSelect(e) {
    var dataItem = this.dataSource.view()[e.item.index()];
    var values = this.value();

    if (dataItem.FullName === "All") {
        $('#TaskAssignedTo').data("kendoMultiSelect").value([]);

    } else if (jQuery.inArray("-1", values)) {
        values = $.grep(values, function (value) {
            return value !== -1;
        });

        if (values == "") { this.value(values); }
    }
}
function onTaskAssignedBySelect(e) {
    var dataItem = this.dataSource.view()[e.item.index()];
    var values = this.value();

    if (dataItem.FullName === "All") {
        $('#TaskAssignedBy').data("kendoMultiSelect").value([]);

    } else if (jQuery.inArray("-1", values)) {
        values = $.grep(values, function (value) {
            return value !== -1;
        });

        if (values == "") { this.value(values); }
    }
}

function ERSearchLoadParameters(clicktype) {
    var selectedSiteIDs = ERSites.getSelectedSites();
    var scheduledActionVal = $('#hdnScheduleAction').val();

    if (selectedSiteIDs == "") {
        create_sites_error_elem();
        $('#siteserror_msg').removeClass("alert-info").addClass("alert-danger");
        $('#siteserror_msg').css("display", "block");
        $('#sites_msg').html("At least one site is required.");
        ERCriteriaLoaded = false;
    }
    else {
        $("#btnSites" + " .k-image").attr("src", "/Images/glyphicons-90-building.png");
        if (!ERCriteriaLoaded)
            LoadReportParameters(selectedSiteIDs);

        if (clicktype == "criteria") {
            if (scheduledActionVal == "") {
                OnBtnClick("btnSearchCriteria", "slideSearch");
            }

            closeSlide("btnEmail", "slideEmail");
            saveRecurrenceScreen = "Criteria"; //Used to identify the save to reports trigger
        }
        else {
            if (ExcelGenerated && !hasExcelData) {
                ExcelGenerated = false;
            }
            OnBtnClick("btnEmail", "slideEmail");
            closeSlide("btnSearchCriteria", "slideSearch");
        }

        if (scheduledActionVal != "") {
            if (scheduledActionVal == ScheduleAction.Generate) {
                SetButtonClass("btnSites", "btn-default");
                $('#btnSites').removeClass("activeTab");
            }
            $('#hdnScheduleAction').val('');
        }
        else
            closeSlide("btnSites", "slideSitesTree");

        //Initialize the idle timer
        ResetTimer(TimeoutWarning);
    }
}

/* Common Criteria data load for AMP reports - START*/

/*  isSavedReportLoading flag is used to check while loading the relevant dropdowns when getting updated
    like Program load -> Chapter refresh -> Standard refresh 
    To prevent duplicate call when trying to Load Report
*/
var isSavedReportLoading = false;
var MultiSiteProgramUrl = '/Corporate/CorporateReport/GetMultiSitePrograms';
function MultiSiteProgramCall(selectedSiteIDs) {
    $.ajax({
        async: false,
        cache: false,
        dataType: "html",
        url: MultiSiteProgramUrl,
        data: {
            selectedSiteIDs: selectedSiteIDs
        },
        success: function (response) {
            $("#divMultiSiteProgram").html(response);
            if (!isSavedReportLoading) {

                if (parseInt($('#hdnReportID').val()) == cmsComplianceReportID) {
                    MultiSiteCoPCall(GetMultiSiteProgramSelectedValue());
                }
                else {
                    var selectedProgramIDs = GetMultiSiteProgramSelectedValue();
                    if (typeof (SetStickyDate) == "function") { SetStickyDate(selectedProgramIDs); }
                    MultiSiteChapterCall(selectedSiteIDs, 0, selectedProgramIDs);
                }

            }
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
        cache: false,
        dataType: "html",
        url: MultiSiteChapterUrl,
        data: {
            selectedSiteIDs: selectedSiteIDs,
            allPrograms: allPrograms,
            selectedProgramIDs: selectedProgramIDs
        },
        success: function (response) {
            $("#divMultiSiteChapter").html(response);
            
            if (!isSavedReportLoading && $('#hdnReportID').val() != ComprehensiveScoringReport)
                UpdateStandards();
        }
    });
}

function onMSChapterChange(e) {

    if ($('#hdnReportID').val() != ComprehensiveScoringReport)
        UpdateStandards();

    if (typeof (updateMultiSiteAssigned) == "function") { updateMultiSiteAssigned(); }
}

function onStdChange(e) {
    if (typeof (UpdateEPs) == "function") { UpdateEPs(); }

    if (typeof (MultiScoredByCall) == "function" && $('#hdnReportID').val() == epScoringReportID) { MultiScoredByCall(); }
    if (typeof (updateMultiSiteAssigned) == "function") { updateMultiSiteAssigned(); }
}
function onEmailCcedToSelect(e) {
    var dataItem = this.dataSource.view()[e.item.index()];
    var values = this.value();

    if (dataItem.FullName === "All") {
        $('#EmailCcedTo').data("kendoMultiSelect").value([]);

    } else if (jQuery.inArray("-1", values)) {
        values = $.grep(values, function (value) {
            return value !== -1;
        });

        if (values == "") { this.value(values); }
    }
}
function onMSChapterSelect(e) {
    var dataItem = this.dataSource.view()[e.item.index()];
    var values = this.value();

    if ($('#hdnReportID').val() == ComprehensiveScoringReport) {
        $('#MultiSiteChapter').data("kendoMultiSelect").value([]);
    }
    else {

        if (dataItem.ChapterText === "All") {
            $('#MultiSiteChapter').data("kendoMultiSelect").value([]);

        } else if (jQuery.inArray("-1", values)) {
            values = $.grep(values, function (value) {
                return value !== -1;
            });

            if (values == "") { this.value(values); }
        }
    }
}

function onStdSelect(e) {
    var dataItem = this.dataSource.view()[e.item.index()];
    var values = this.value();
    if (dataItem.StandardLabel === "All") {
        $('#AMPStandard').data("kendoMultiSelect").value([]);
    } else if (jQuery.inArray("-1", values)) {
        values = $.grep(values, function (value) {
            return value !== -1;
        });
        if (values == "") this.value(values);
    }
    if (typeof (UpdateEPs) == "function") { UpdateEPs(); }
}

function IsSingleProgramSelectionMode() {

    var isSingleProgramSelectionMode = false;
    switch (parseInt($('#hdnReportID').val())) {
        case epScoringReportID:
        case taskAssignmentID:
        case taskReportID:
        case epAssignmentScoringReportID:
        case cmsComplianceReportID:
        case EPsNotScoredinPeriod:
        case EPScoringReportFinalMockSurvey:
        case ComprehensiveScoringReport:
            isSingleProgramSelectionMode = true;
            break;
        default:
            isSingleProgramSelectionMode = false;
            break;
    }
    return isSingleProgramSelectionMode;
}

function onMSProgramSelect(e) {

    var isSingleProgramSelectionMode = IsSingleProgramSelectionMode();

    if (isSingleProgramSelectionMode == true) {
        $('#MultiSiteProgram').data("kendoMultiSelect").value([]);

    } else {
        var dataItem = this.dataSource.view()[e.item.index()];
        var values = this.value();

        if (dataItem.ProgramName === "All") {
            $('#MultiSiteProgram').data("kendoMultiSelect").value([]);

        } else if (jQuery.inArray("-1", values)) {
            values = $.grep(values, function (value) {
                return value !== -1;
            });

            if (values == "") { this.value(values); }
        }

    }

}

function onAMPEPSelect(e) {
    var dataItem = this.dataSource.view()[e.item.index()];
    var values = this.value();
    if (dataItem.StandardLabelAndEPLabel === "All") {
        $('#AMPEP').data("kendoMultiSelect").value([]);
    } else if (jQuery.inArray("-1", values)) {
        values = $.grep(values, function (value) {
            return value !== -1;
        });
        if (values == "") this.value(values);
    }

}

function onMSCoPChange(e) {
    UpdateTags();
}

function onMSCoPSelect(e) {

    var dataItem = this.dataSource.view()[e.item.index()];
    var values = this.value();

    if (dataItem.CopName === "All") {
        $('#MultiSiteCoP').data("kendoMultiSelect").value([]);

    } else if (jQuery.inArray("-1", values)) {
        values = $.grep(values, function (value) {
            return value !== -1;
        });

        if (values == "") { this.value(values); }
    }
}

function onTagChange(e) {
    if (typeof (updateMultiSiteIdentifiedBy) == "function" && $('#hdnReportID').val() == cmsComplianceReportID) { updateMultiSiteIdentifiedBy(); }
}

function onTagSelect(e) {

    var dataItem = this.dataSource.view()[e.item.index()];
    var values = this.value();

    if (dataItem.TagCode === "All") {
        $('#MultiSiteTag').data("kendoMultiSelect").value([]);

    } else if (jQuery.inArray("-1", values)) {
        values = $.grep(values, function (value) {
            return value !== -1;
        });

        if (values == "") this.value(values);
    }

}

function ResetTagsMultiSelect() {
    if ($("#MultiSiteTag").length > 0) {
        var dataSource = new kendo.data.DataSource({
            data: [
                { TagCode: "All", TagID: "-1" }
            ]
        });
        $("#MultiSiteTag").data("kendoMultiSelect").setDataSource(dataSource);
        $("#MultiSiteTag").data("kendoMultiSelect").value("-1");
    }
}
/* Common Criteria data load for AMP reports - END*/