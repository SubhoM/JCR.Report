
function OnDocumentReady() {
    // Get data from DBMEdition01.dbo.UserMenuState table, then render horizontal and vertical menus.
    IntegratedMenu.CommonCode.init($('#hdnUserID').val(), $('#hdnAuthToken').val(), $('#hdnWebApiUrl').val(), $('#hdnPageID').val(), 'reports', 'cbp-hrmenu', 'ddl-setup');
}

onload = function () {
    var e = document.getElementById("refreshed");
    if (e.value == "no") e.value = "yes";
    else { e.value = "no"; location.reload(); }
}

function updateTracerUserInfo() {
    //$.ajax({
    //    url: urlInfo,
    //    data: dataInfo,
    //    async: false,
    //    type: "POST",
    //    contentType: "application/json; charset=utf-8",
    //    dataType: "json",
    //    error: function (error) {
    //        errorFunction(error);
    //    },
    //    success: function (data) {
    //        $('#spUserName').html(data.userName);
    //        $('#spRole').html(data.role);
    //    }
    //});
    window.location.reload();
}

function userDetailSuccessFunction(data) {
   
}
function onMenuItemSelect(e) {

    if ($(e.item).children(".k-link")[0].getAttribute("href") == "skip") {
        e.preventDefault();
        return false;
    }
}

function HighlightTopMenu(index) {
    var menu = $('#menu').kendoMenu().data("kendoMenu");
    $(menu.element[0].childNodes[index]).addClass("k-state-selected");
}

function ResetTracerList() {
    //on categories chagne update the tracers list multiselect .
    if (typeof TracersListForComplianceUpdate === "undefined" || TracersListForComplianceUpdate === null)
        // Update list of Tracers when Tracer Categories change.
        if (typeof TracersListForObservationStatus === "undefined" || TracersListForObservationStatus === null) {
            if (typeof tracerlistupdate === 'function')
                tracerlistupdate();
        }
        else {
            if (typeof UpdateTracerListForObservationStatus === 'function')
                UpdateTracerListForObservationStatus();
        }
    else {
        if (typeof UpdateTracerListForCompliance === 'function')
            UpdateTracerListForCompliance();
    }
}

function ClearGrids() {
    $('#loadAview').html('');

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