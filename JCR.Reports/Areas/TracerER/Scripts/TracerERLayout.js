var ERCriteriaLoaded = false;

function OnDocumentReady() {
    // Get data from DBMEdition01.dbo.UserMenuState table, then render horizontal and vertical menus.
    IntegratedMenu.CommonCode.init($('#hdnUserID').val(), $('#hdnAuthToken').val(), $('#hdnWebApiUrl').val(), $('#hdnPageID').val(), 'reports', 'cbp-hrmenu', 'ddl-setup');
}

function OnbtnERSearchClick(sender, e) {
    ERSearchClick();
}

function onMultiTracersListSelect(e) {

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
function onMultiQuarterListSelect(e) {

    var dataItem = this.dataSource.view()[e.item.index()];
    var values = this.value();
    $('#QuartersList').data("kendoMultiSelect").value([]);

}

function ERSearchLoadParameters(clicktype) {
    var selectedSiteIDs = ERSites.getSelectedSites();
    var scheduledActionVal = $('#hdnScheduleAction').val();

    if (selectedSiteIDs == "") {
        create_sites_error_elem();
        $('#siteserror_msg').removeClass("alert-info").addClass("alert-danger");
        $('#siteserror_msg').css("display", "block");
        $('#sites_msg').html("Select at least one site.");
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
function OnbtnEREmailClick(sender, e) {
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
        ResetEPsMultiSelect();
    }
}

//Object used to set and get Selected sites
var ERSites = {
    oldSites: '',
    getSelectedSites: function () {
        return $("#SiteSelector_SelectedSiteIDs").val();
    }
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
        ResetEPsMultiSelect();
    }
}

//Resets the Standards MultiSelect control to All option
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

//Disable FSA option if at least one Certification program is selected
function DisableFSA(selectedPrograms) {
    var allPrograms = $("#MultiSiteProgram").data("kendoMultiSelect").dataSource._data;
    var selectedProgramsArr = selectedPrograms.split(",");
    var SelectedCertificationPgms = [];    
    $.each(selectedProgramsArr, function (selectedPrgIndex, selectedProgram) {
        //IsCertificationSelected = jQuery.grep(allPrograms, function (prg, dsIndex) {
        //    return (prg.ProgramID == selectedProgram && prg.ProductID == 2)
        //});

        var certificationPgm = _.find(allPrograms, function (pgm) { return (pgm.ProgramID == selectedProgram && pgm.ProductID == 2); });

        if (certificationPgm != undefined)
            SelectedCertificationPgms.push(certificationPgm);
    });

    //Check for disabling the FSA filter only if certification programs are alone selected
    if (SelectedCertificationPgms.length > 0 && (SelectedCertificationPgms.length == selectedProgramsArr.length) && $("#MultiSiteProgram").data("kendoMultiSelect").value().toString() != "-1") {
        $('#IncludeFSAcheckbox:checked').removeAttr('checked');
        $("#IncludeFSAcheckbox").attr("disabled", "disabled");
    }
    else {
        $("#IncludeFSAcheckbox").removeAttr("disabled");
    }
}

//Show Accreditation programs list in the popover
function AccreditationProgramsPopover() {
    $('#lnkAccreditationPrgInfo').on("mouseover", function () {
        $('#lnkAccreditationPrgInfo').popover({
            title: 'Accreditation Programs',
            placement: 'bottom',
            html: 'true',
            trigger: 'hover',
            template: '<div class="popover" style="font-style: normal;"><div class="arrow"></div><div class="popover-inner"><h3 class="popover-title"></h3><div id="divPopover" class="popover-content"><p></p></div></div></div>',
            content: function () {
                var popoverContent = '';
                if ($("#MultiSiteProgram").data("kendoMultiSelect") != null) {
                    var allPrograms = $("#MultiSiteProgram").data("kendoMultiSelect").dataSource._data;
                    var accredPrograms = [];

                    $.each(allPrograms, function (selectedPrgIndex, selectedProgram) {
                        if (selectedProgram.ProductID == 1)
                            accredPrograms.push({ Program: selectedProgram.ProgramName });
                    });
                    popoverContent = '<div style="left:0;"><ul style="list-style: none; padding-left: 0;">'
                    $.each(accredPrograms, function (prgIndex, prg) {
                        popoverContent += '<li>' + prg.Program + '</li>'
                    });
                    popoverContent += '</ul><div>';
                }
                return popoverContent;
            }
        });

        $('#lnkAccreditationPrgInfo').popover("show");
    });
}