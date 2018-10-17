
//****************************Load Data For Criteria tab - EPScoring Report.**********************

var epScoringReportID = 27;
var siteIDForEPScoring = $('#hdnSingleSiteID').val();
var sites = "";
var selectedSites = "";
function LoadReportParameters(selectedSiteIDs) {
    if (selectedSiteIDs != null && selectedSiteIDs != '') {
        selectedSites = selectedSiteIDs;
    }
    else {
        if ($('#hdnSitesCount').val() == 1) {
            selectedSites = $('#hdnSingleSiteID').val();
        }
        else {
            selectedSites = ERSites.getSelectedSites()
        }
    }
    sites = selectedSites.replace(/,/g, '');
    EPScoringMultiSiteProgramCall(sites);
}

var MultiSiteProgramUrl = '/Corporate/CorporateReport/GetMultiSitePrograms';

function EPScoringMultiSiteProgramCall(selectedSiteIDs) {

    $.ajax({
        async: false,
        dataType: "html",
        url: MultiSiteProgramUrl,
        data: {
            selectedSiteIDs: selectedSiteIDs
        },
        success: function (response) {
            $("#divMultiSiteProgram").html(response);
            if (!isSavedReportLoading)
                MultiSiteChapterCall(selectedSiteIDs, 0, GetMultiSiteProgramSelectedValue());
        }
    });
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
                MultiScoredByCall();
        }
    });

}

function MultiScoredByCall() {
    var ChapterIDs = $("#MultiSiteChapter").data("kendoMultiSelect").value().toString();
    var StandardIDs = $('#AMPStandard').data("kendoMultiSelect").value().toString();

    var IndividualScore = $('#IScoreCheckbox').is(":checked") == true ? 1 : 0;
    var PreliminaryScore = $('#PScoreCheckbox').is(":checked") == true ? 2 : 0;
    var FinalScore = $('#FScoreCheckbox').is(":checked") == true ? 3 : 0;
    var MultiScoredByUrl = '/Corporate/EPScoring/GetScoredByForEPs';

    var ScoreType = '-1';
    if (IndividualScore > 0 || PreliminaryScore > 0 || FinalScore > 0)
        ScoreType = IndividualScore + ',' + PreliminaryScore + ',' + FinalScore;

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
            selectedScoreType: ScoreType
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
    EnableDisableNotScoredInPeriod();
    EnableDisableNotScored();
}

function onMSProgramChange(e) {

    var MultiSiteProgramIDs = [];
    var selectedProgramID = $("#MultiSiteProgram").data("kendoMultiSelect").value().toString();

    if (selectedProgramID == '-1') {
        ResetStandardsMultiSelect();
        ResetScoredByMultiSelect();
    }
    else {
        MultiSiteChapterCall(ERSites.getSelectedSites().replace(/,/g, ''), 0, selectedProgramID);
    }
}