//Get URLS from hidden fields
var TracersCategoriesUpdate = $("#TracersCategoriesUpdate").val();
var TracersChapterUpdate = $("#TracersChaptersUpdate").val();
var TracersStandardUpdate = $("#TracersStandardssUpdate").val();
var TracersEPUpdate = $("#TracersEPsUpdate").val();
var TracersListUpdate = $("#TracersListUpdate").val();
var TracerSectionsListUpdate = $("#TracerSectionsListUpdate").val();
var TracersListForComplianceUpdate = $("#TracersListForComplianceUpdate").val();
var TaskAssignedToUpdate = $("#TaskAssignedToUpdate").val();
var TracersListForObservationStatus = $("#TracersListForObservationStatus").val();
var OrganizationTypeListL3Update = $("#OrganizationTypeListL3Update").val();
var OrganizationTypeListL2Update = $("#OrganizationTypeListL2Update").val();
var OrganizationTypeListL1Update = $("#OrganizationTypeListL1Update").val();
var TracersObsEnteredByUpdate = $("#TracersObsEnteredByUpdate").val();
var OrganizationTypeInactive = $("#OrganizationTypeInactive").val();
var deptselectedlist = [];
var campselectedlist = [];
var buildselectedlist = [];
var defaultValue = "-1";
var defaultText = "All";

//on site change // update categories and tracers list
function loadrespectiveparameters(siteID, siteName) {
    CategoryUpdate(siteID, siteName);

    //get the input avlues from SetSearchCriteria fucntion
    var searchinputset = SetSearchCriteria();
    //reset the below values to empty as the
    searchinputset.TracerCategoryIDs = "";
    searchinputset.TracerListIDs = "";

    //tracers list mulitselect update
    if (TracersListForComplianceUpdate == null)
        tracerlistupdate();
    else
        UpdateTracerListForCompliance();

    orgTypeLevelFilter(searchinputset);
    OrganizationTypeInactiveupdate();

    if (TracersObsEnteredByUpdate !== undefined) {
        tracersobsenteredbyupdate(searchinputset);
    }
}

function ComplianceQuestionparameters(siteID, siteName) {
    //get the input avlues from SetSearchCriteria fucntion
    var searchinputset = SetSearchCriteria();
    //reset the below values to empty as the
    searchinputset.TracerCategoryIDs = "";
    searchinputset.TracerListIDs = "";

    tracerlistComplianceQuestionupdate();
    orgTypeLevelFilter(searchinputset);
    OrganizationTypeInactiveupdate();
}

function CategoryUpdate(siteID, siteName) {
    
    var tracerTypeID = 1;

    if (typeof reportTracerTypeID !== 'undefined' && reportTracerTypeID != null)
        tracerTypeID = reportTracerTypeID;
    //cat mulitselect update
    $.ajax({
        type: "Post",
        url: TracersCategoriesUpdate,
        data: {
            selectedsiteid: siteID,
            selectedsitename: siteName,
            tracerTypeID: tracerTypeID
        },
        success: function (response) {
            $("#tracercategory").html(response);
        }
    });
}

//on tracer category change 
function onCatChange(e) {
    //on categories chagne update the tracers list multiselect .
    if (TracersListForComplianceUpdate == null)
        // Update list of Tracers when Tracer Categories change.
        if (TracersListForObservationStatus == null)
            tracerlistupdate();
        else
            UpdateTracerListForObservationStatus();
    else
        UpdateTracerListForCompliance();

}
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

function tracerlistComplianceQuestionupdate() {
    $.ajax({
        type: "Post",
        url: TracersListUpdate,
        data: {
            selectedsiteid: $('#UserSite').val(),
            selectedsitename: $('#UserSiteName').val(),
            TracerCategoryIDs: ""
        },
        success: function (response) {
            $("#tracerList").html(response);
        }
    });
}

function tracerlistupdate() {
    var tracerTypeID = 1;

    if (typeof reportTracerTypeID !== 'undefined' && reportTracerTypeID != null)
        tracerTypeID = reportTracerTypeID;

    $.ajax({
        type: "Post",
        url: TracersListUpdate,
        async: false,
        data: {
            selectedsiteid: $('#UserSite').val(),
            selectedsitename: $('#UserSiteName').val(),
            TracerCategoryIDs: $("#TracersCategory").data("kendoMultiSelect").value().toString(),
            tracerTypeID: tracerTypeID
        },
        success: function (response) {
            $("#tracerList").html(response);
        }
    });
}

function tracerSectionlistupdate() {
    var tracerTypeID = 1;

    if (typeof reportTracerTypeID !== 'undefined' && reportTracerTypeID != null)
        tracerTypeID = reportTracerTypeID;

    $.ajax({
        type: "Post",
        url: TracerSectionsListUpdate,
        async: false,
        data: {
            selectedsiteid: $('#UserSite').val(),
            selectedsitename: $('#UserSiteName').val(),
            TracerCustomIDs: $("#TracersList").data("kendoMultiSelect").value().toString(),
            tracerTypeID: tracerTypeID
        },
        success: function (response) {
            $("#tracerSelectionList").html(response);
        }
    });
}

function UpdateTracerListForQuestions() {
    var tracerTypeID = 1;

    if (typeof reportTracerTypeID !== 'undefined' && reportTracerTypeID != null)
        tracerTypeID = reportTracerTypeID;

    $.ajax({
        type: "Post",
        url: TracersListUpdate,
        async: false,
        data: {
            selectedsiteid: $('#UserSite').val(),
            selectedsitename: $('#UserSiteName').val(),
            TracerCategoryIDs: '-1',
            tracerTypeID: tracerTypeID
        },
        success: function (response) {
            if (updateSelectedQuestions === true)
                setTimeout(SetSelectedQuestions, 1000, true);
            $("#tracerList").html(response);
        }
    });
}

function UpdateTracerListForObservationStatus() {
    $.ajax({
        type: "Post",
        url: TracersListForObservationStatus,
        async: false,
        data: {
            selectedsiteid: $('#UserSite').val(),
            selectedsitename: $('#UserSiteName').val(),
            TracerCategoryIDs: $("#TracersCategory").data("kendoMultiSelect").value().toString(),
            observationStatus: $("#ObservationStatus").data("kendoDropDownList").value()
        },
        success: function (response) {
            $("#tracerList").html(response);
        }
    });
}

function UpdateTracerListForCompliance() {
    $.ajax({
        type: "Post",
        url: TracersListForComplianceUpdate,
        async: false,
        data: {
            selectedsiteid: $('#UserSite').val(),
            selectedsitename: $('#UserSiteName').val(),
            TracerCategoryIDs: $("#TracersCategory").data("kendoMultiSelect").value().toString()
        },
        success: function (response) {
            $("#tracerListForCompliance").html(response);

        }
    });
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

function tracersobsenteredbyupdate(searchinput) {

    $.ajax({
        type: "Post",
        url: TracersObsEnteredByUpdate,
        data: {
            selectedsiteid: $('#UserSite').val(),
            selectedsitename: $('#UserSiteName').val(),
            data: JSON.stringify({ search: searchinput }),
        },
        success: function (response) {
            $("#tracersobsenteredby").html(response);
        }
    });
}

function userassignedtoupdate(searchinput) {

    $("#UserAssignedTo").remove();
    $.ajax({
        type: "Post",
        url: UserAssignedToUpdate,
        contentType: "application/json",
        data: JSON.stringify({ search: searchinput }),
        success: function (response) {
            $("#userassignedtodiv").html(response);
        }
    });
}
function taskstatusupdate(searchinput) {
    $("#TaskStatus").remove();
    $.ajax({
        type: "Post",
        url: TaskStatusUpdate,
        contentType: "application/json",
        data: JSON.stringify({ search: searchinput }),
        success: function (response) {
            $("#taskstatus").html(response);
        }
    });
}

//Converts the supplied datetime value to UTC using moment js and apply format
function ConvertDateTimeToUTC(dt) {
    return moment.utc(dt).format('MM/DD/YYYY')
}