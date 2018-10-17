function LoadReportParameters(selectedSiteIDs) {
    if (selectedSiteIDs == null || selectedSiteIDs == '') {
        selectedSiteIDs = ERSites.getSelectedSites();
    }

    GetReportHcoIDs(selectedSiteIDs);
    MultiSiteProgramCall(selectedSiteIDs);
    LoadMultiSiteMockSurveyCriteria(selectedSiteIDs);
}

function GetReportHcoIDs(selectedSiteIDs) {
    $.ajax({
        async: false,
        type: "POST",
        data: { selectedSiteIDs: selectedSiteIDs },
        url: '/Corporate/CorporateReport/GetReportHcoIDs',
        success: function (response) {
            $("#SiteSelector_SelectedHCOIDs").val(response);
        }
    });
}

function LoadMultiSiteMockSurveyCriteria(selectedSiteIDs) {
    $.ajax({
        async: false,
        type: "POST",
        dataType: "html",
        url: '/Corporate/CorporateReport/GetMockSurveyCriteria',
        data: {
            selectedSiteIDs: selectedSiteIDs
        },
        success: function (response) {
            $('#divMockSurveyCriteria').html(response);
        }
    });
}

function onMockSurveySelect(e) {
    var dataItem = this.dataSource.view()[e.item.index()];
    var values = this.value();

    if (dataItem.MockSurveyName === "All") {
        $('#mockSurveyList').data("kendoMultiSelect").value([]);

    } else if (jQuery.inArray("-1", values)) {
        values = $.grep(values, function (value) {
            return value !== -1;
        });

        if (values == "") { this.value(values); }
    }
}

function onmockSurveyLeadSelect(e) {
    var dataItem = this.dataSource.view()[e.item.index()];
    var values = this.value();

    if (dataItem.UserName === "All") {
        $('#mockSurveyLeadList').data("kendoMultiSelect").value([]);

    } else if (jQuery.inArray("-1", values)) {
        values = $.grep(values, function (value) {
            return value !== -1;
        });

        if (values == "") { this.value(values); }
    }
}

function onmockSurveyMemberSelect(e) {
    var dataItem = this.dataSource.view()[e.item.index()];
    var values = this.value();

    if (dataItem.UserName === "All") {
        $('#mockSurveyMemberList').data("kendoMultiSelect").value([]);

    } else if (jQuery.inArray("-1", values)) {
        values = $.grep(values, function (value) {
            return value !== -1;
        });

        if (values == "") { this.value(values); }
    }
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
        }
    });
}

function onMSProgramChange(e) {
    MultiSiteChapterCall(ERSites.getSelectedSites().replace(/,/g, ''), 0, GetMultiSiteProgramSelectedValue());
    ResetStandardsMultiSelect();
}

//Save the selected parameters
function SaveToMyReports(deleteReport) {
    var searchCriteria = GetParameterValues();

    var parameterSet = [
        { SelectedSites: ERSites.getSelectedSites() },
        { ProgramServices: searchCriteria.ProgramIDs },
        { ReportTitle: searchCriteria.ReportTitle },
        { ChapterIDs: searchCriteria.SelectedChapterIDs },
        { StandardIDs: searchCriteria.SelectedStandardIDs },
        { GrpBy: searchCriteria.GrpBy },
        { IncludeRFICheckBox: searchCriteria.IncludeRFI },
        { IncludeFSAcheckbox: searchCriteria.IncludeFSA },
        { MockSurveyIDs: searchCriteria.SelectedMockSurveyIDs },
        { MockSurveyTeamLeadIDs: searchCriteria.SelectedMockSurveyLeadIDs },
        { MockSurveyTeamMemberIDs: searchCriteria.SelectedMockSurveyMemberIDs }
    ];

    //DateRange
    //Add date parameters only there is a value
    GetObservationDate(parameterSet, searchCriteria.StartDate, searchCriteria.EndDate);

    parameterSet.push({ ScheduledReportName: $('#txtScheduledReportName').val() });

    //Add recurrence fields to the parameter set
    GetERRecurrenceParameters(parameterSet);

    //Save the parameters to the database
    SaveSchedule(parameterSet, deleteReport);
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

    var SelectedMockSurveyIDs = [];
    var SelectedMockSurveyNames = [];
    $('#mockSurveyList :selected').each(function (i, selected) {
        SelectedMockSurveyIDs[i] = $(selected).val();
        SelectedMockSurveyNames[i] = $(selected).text().trim();
    });
    if (SelectedMockSurveyIDs.length <= 0) {
        SelectedMockSurveyIDs.push(defaultValue);
        SelectedMockSurveyNames.push(defaultText);
    }

    var SelectedMockSurveyLeadIDs = [];
    var SelectedMockSurveyLeadNames = [];
    $('#mockSurveyLeadList :selected').each(function (i, selected) {
        SelectedMockSurveyLeadIDs[i] = $(selected).val();
        SelectedMockSurveyLeadNames[i] = $(selected).text().trim();
    });
    if (SelectedMockSurveyLeadIDs.length <= 0) {
        SelectedMockSurveyLeadIDs.push(defaultValue);
        SelectedMockSurveyLeadNames.push(defaultText);
    }

    var SelectedMockSurveyMemberIDs = [];
    var SelectedMockSurveyMemberNames = [];
    $('#mockSurveyMemberList :selected').each(function (i, selected) {
        SelectedMockSurveyMemberIDs[i] = $(selected).val();
        SelectedMockSurveyMemberNames[i] = $(selected).text().trim();
    });
    if (SelectedMockSurveyMemberIDs.length <= 0) {
        SelectedMockSurveyMemberIDs.push(defaultValue);
        SelectedMockSurveyMemberNames.push(defaultText);
    }

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

        GrpBy: $('input[name=grpBy]:checked').val(),

        IncludeFSA: $('#FSAGraphCheckbox').is(':checked'),
        IncludeRFI: $('#RFIGraphCheckbox').is(':checked'),
        StartDate: kendo.toString($("#ObsstartDate").data("kendoDatePicker").value(), "MM/dd/yyyy"),
        EndDate: kendo.toString($("#ObsEndDate").data("kendoDatePicker").value(), "MM/dd/yyyy"),
        ReportTitle: $('#hdnReportTitle').val(),
        SelectedSiteHCOIDs: "",
        LevelIdentifier: LevelIdentifier,

        SelectedMockSurveyIDs: SelectedMockSurveyIDs.toString(),
        SelectedMockSurveyNames: SelectedMockSurveyNames.toString().replace(/,/g, ", "),

        SelectedMockSurveyLeadIDs: SelectedMockSurveyLeadIDs.toString(),
        SelectedMockSurveyLeadNames: SelectedMockSurveyLeadNames.toString().replace(/,/g, ", "),

        SelectedMockSurveyMemberIDs: SelectedMockSurveyMemberIDs.toString(),
        SelectedMockSurveyMemberNames: SelectedMockSurveyMemberNames.toString().replace(/,/g, ", ")
    }

    return searchset;
}