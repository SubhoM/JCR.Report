//set common variables at layout level to be used for email, etc.,
//set the below value to true if there is any data in rdlc or excel view to use on the emailform.
var hasRdlcData = false;
var hasExcelData = false;
var hasChart = false;
var hasExcel2Data = false;
var RdlcView = false;
var ExcelView = false;
var RdlcGenerated = false;
var ExcelGenerated = false;
var ReportGeneratedfromEmail = false;
var ExcelGridName = "";
var ExcelSecondGridName = "";
var hasExcelSecondGrid = false;
var Sliderarr = [];
var fromemail = false;
var PreserveSelectedList = false;
var deptselectedlist = [];
var campselectedlist = [];
var buildselectedlist = [];
var secondgridview = false;
var loadparameters = "";
var exportparameters = false;
var selectquestions = 340;
var showLoadingImage = false;
var saveRecurrenceScreen = "Criteria";
var dataLimitIssue = false;
var ProgramsUpdate = $('#ProgramsUpdate').val();
var PreferredProgramUpdate = $("#PreferredProgramUpdate").val();
var UpdateProgramsInSessionURL = $("#UpdateProgramsInSession").val();
var firstAttachmentType = "Excel";
var secondAttachmentType = "Excel";
var epScoringReportID = 27;
var taskAssignmentID = 28;
var epAssignmentScoringReportID = 32;
var cmsComplianceReportID = 34;
var EPsNotScoredinPeriod = 37;
var EPScoringReportFinalMockSurvey = 38;
var ComprehensiveScoringReport = 39;
var taskReportID = 42;
var SpinnerManual = false;
var ajaxCallCount = 0;
var displayloading;

var ScheduleAction = {
    Edit: "1",
    Generate: "2",
    Copy: "3",
    Delete: "4",
    Recurrence: "5"
};
var loadDataGridAtLoading = false;

var ShowLoader = function (ManuallyCalled) {

    if (!showLoadingImage)
        return;

    if (!SpinnerManual) {
        SpinnerManual = ManuallyCalled;
    }

    if (SpinnerManual != ManuallyCalled) {
        return;
    }
    
    if (ajaxCallCount >= 1) {
        ajaxCallCount += 1;
        return;
    }

    ajaxCallCount = 1;

    $('#displayloading').show();

    //blockElement('pageContent');
    //blockElement('topNavbar');

    ////$('#mainLayoutBody').addClass('setOpaque');
    //blockElement('mainLayoutBody');

    //$('#pageContent').addClass('setOpaque');
   
    
}

var HideLoader = function (ManuallyCalled) {

    if (!showLoadingImage)
        showLoadingImage = true;

    if (SpinnerManual != ManuallyCalled) {
        return;
    }

    

    if (ajaxCallCount > 1) {
        ajaxCallCount -= 1;
        return;
    }

    ajaxCallCount = 0;

    SpinnerManual = null;

    //unBlockElement('pageContent');
    //unBlockElement('topNavbar');

    ////$('#mainLayoutBody').removeClass('setOpaque');
    //unBlockElement('mainLayoutBody');
    
    setTimeout(function () { $('#displayloading').hide() }, 1000);

    //$('#pageContent').removeClass('setOpaque');
 

   

}


var blockElement = function(elementName) {
    SetLoadingImageVisibility(false);


    $('#' + elementName).block({
        message: displayloading,
        overlayCSS: { backgroundColor: '#FFFFFF' },
        centerY: 0,
        css: { border: '0px hidden #FFFFFF', width: '0%', top: '10px', left: '', right: '10px' }
    });
}

var blockElementByClassName = function(elementName) {

    //SetLoadingImageVisibility(false);

    displayloading = $('#displayloading');

    $('.' + elementName).block({
        message: displayloading,
        overlayCSS: { backgroundColor: '#FFFFFF' },
        centerY: 0,
        css: { border: '0px hidden #FFFFFF', width: '0%', top: '10px', left: '', right: '10px' }
    });
}

var unBlockElement = function(elementName) {

    $('#' + elementName).unblock();
    SetLoadingImageVisibility(true);
}

var unBlockElementByClassName =function(elementName) {

    $('.' + elementName).unblock();
    SetLoadingImageVisibility(true);
}

$(document).ready(function () {

    displayloading = $('#displayloading');

    if (window.location.href.indexOf('/Corporate/') == -1)
        SetActiveTab();

    if (detectIE()) {
        setTimeout(function () {
            $(".focusButton").removeClass('k-button k-state-focused');
        }, 500);
    }

    //Check Report Description Field is available in report or not
    //if ($("#txtScheduledReportDesc").attr('type') != 'hidden')
    //    hasReportDesc = true;

    sessionStorage.setItem('searchsetsession', JSON.stringify(""));
    setposition();
    // for individual area layout document ready functions call
    OnDocumentReady();

    OnReportLoad();

    //Resets the filter criteria
    $("#resetfiltersbutton").click(function () {

        ResetAll();
        //Initialize the idle timer
        ResetTimer(TimeoutWarning);

        //Reset the date fields
        ResetCriteriaDates();
    })

    //Click event for the Generate Report button
    $(".primarySearchButton").click(function () {

        //create error element
        create_error_elem();
        create_email_error_elem();
        loadDataGridAtLoading = false;
        //ValidateData method is used to validate the observation start and end dates
        //If a report does not have these fields, add a placeholder method with the name "ValidateData" and return true to avoid Javascript error
        if (ValidateData(4000)) {
            GenerateReport(false);
            RecordReportGenerateEvent();
        }

        if (window.location.href.indexOf('/Corporate/') != -1) {
            PlaceFooter();
        }
        //Initialize the idle timer
        ResetTimer(TimeoutWarning);

    });

    //Initialize the idle timer
    ResetTimer(TimeoutWarning);
    function ValidateSavedReportName(screenName) {

        if (saveRecurrenceScreen === "Criteria")
            return ValidateScheduledReportName('txtScheduledReportName', "right");
        else
            return ValidateScheduledReportName('txtScheduledReportName1', "top")
    }


    $('.btnSaveReport').click(function () {



        //Displays a warning message for Excel view
        if (CheckIfExcelView())
            $('#divExcelViewWarning').show();
        else
            $('#divExcelViewWarning').hide();

        var IsValidReportName = ValidateSavedReportName(saveRecurrenceScreen);

        if (IsValidReportName && ValidateData(8000)) {
            var validator = $(".EmailForm").data("kendoValidator");
            if (validator.validate() && (typeof CheckWeekDaySelection === 'undefined' || CheckWeekDaySelection())
                && (typeof CheckRecurrenceDateSelection === 'undefined' || CheckRecurrenceDateSelection())) {
                SaveToMyReports(false);
            }
            else {
                //if Criteria screen, close email form and open criteria screen
                if (saveRecurrenceScreen === "Criteria") {
                    closeSlide("btnSearchCriteria", "slideSearch");
                    if ($('#slideEmail').length > 0) {
                        SetButtonClass("btnEmail", "btn-primary");
                        $('#slideEmail').slideDown(750);
                        if (typeof CheckWeekDaySelection !== 'undefined')
                            if (CheckWeekDaySelection()) {
                                if (typeof CheckRecurrenceDateSelection !== 'undefined')
                                    CheckRecurrenceDateSelection();
                            }
                    }
                    else {
                        SetButtonClass("btnRecurrence", "btn-primary");
                        $('#slideRecurrence').slideDown(750);
                        saveRecurrenceScreen = "Recurrence";

                        //Invoke the Tooltip logic again to fix the bootstrap tooltip positioning issue 
                        //for invisible elements while toggling between Recurrence and Criteria
                        if (typeof CheckWeekDaySelection !== 'undefined')
                            if (CheckWeekDaySelection()) {
                                if (typeof CheckRecurrenceDateSelection !== 'undefined')
                                    CheckRecurrenceDateSelection();
                            }
                    }
                    setposition();
                    //$(".loading").hide();
                }
            }
        }
        else {
            if (IsValidReportName && saveRecurrenceScreen !== "Criteria") {
                if ($('#slideEmail').length > 0) {
                    closeSlide("btnEmail", "slideEmail");
                }
                else {
                    closeSlide("btnRecurrence", "slideRecurrence");
                }

                SetButtonClass("btnSearchCriteria", "btn-primary")
                $('#slideSearch').slideDown(750);
                saveRecurrenceScreen = "Criteria";
                setposition();
                //$(".loading").hide();
            }
        }
    });


    //Close the timeout alert and reset the timeout value
    $("#btnContinueSession").click(function () {
        KeepAlive();
        $('#TimeOutAlert').modal('hide')
        $('body').removeClass('modal-open');
    });

    //Global Ajax Event Handlers - Show loading image
    $(document).ajaxStart(function (e) {

       
            ShowLoader();
       
      
    });

    //Global Ajax Event Handlers - Hide the loading image after Site Change or other ajax postbacks
    $(document).ajaxStop(function () {
        
            HideLoader();
        
    });




    $('#site-search').on('keyup', function () {
        if (this.value.length > 0) {

            $('#SitesUL li .AvailableSites').hide().filter(function () {

                return $(this).text().toLowerCase().indexOf($('#site-search').val().toLowerCase()) != -1;
            }).show();
        }
        else if (this.value.length === 0) {

            $('#SitesUL li .AvailableSites').show().filter(function () {

                return $(this).text();
            }).show();
        }
    }).hover(function () { }, function () {
        $(this).blur();
    }).click(function (e) {
        e.stopPropagation();
    });

    $('#program-search').on('keyup', function () {
        if (this.value.length > 0) {
            $('#ProgramsUL li .AvailablePrograms').hide().filter(function () {
                return $(this).text().toLowerCase().indexOf($('#program-search').val().toLowerCase()) != -1;
            }).show();
        }
        else if (this.value.length === 0) {
            $('#ProgramsUL li .AvailablePrograms').show().filter(function () {
                return $(this).text();
            }).show();
        }
    }).hover(function () { }, function () {
        $(this).blur();
    }).click(function (e) {
        e.stopPropagation();
    });

    IE8and9Placeholderissue();

    $('input[name*=txtObservationDate]').on("keydown", function (event) {
        if (event.shiftKey) event.preventDefault();
        else {
            var nKeyCode = event.keyCode;
            if (nKeyCode == 8 || nKeyCode == 9) return;
            if (nKeyCode < 95) {
                if (nKeyCode < 48 || nKeyCode > 57) event.preventDefault();
            } else {
                if (nKeyCode < 96 || nKeyCode > 105) event.preventDefault();
            }
        }
    });

    CheckUpdatesToApplicationValid();
});

function CheckUpdatesToApplicationValid() {
    
    if ($('#hdnIsUpdatedApplicationValid').val() == "0") {

        $.ajax({
            url: '/Shared/CheckUpdatesToApplicationValid',
            success: function (data) {

                if (data) {
                    $("#videoFrame").attr("src", "https://jcrinc-eproducts.net/interaction_content/10PPU/Index.html");

                    $('#UpdatesToApplication').modal({
                        keyboard: false,
                        backdrop: 'static'
                    }).show();

                    $("#UpdatesToApplication").on("hidden.bs.modal", function () {
                        $("#videoFrame").attr("src", "");
                    });
                }
            }
        });
    }

}

function OnReportLoad() {
    //Don't open the Criteria or sites panel while generating the saved report
    if ($('#hdnScheduleAction').val() != ScheduleAction.Generate) {
        var CheckSitesExists = document.getElementById("btnSites");

        if (CheckSitesExists != null && CheckSitesExists != undefined) {
            $('#slideSitesTree').slideDown(10);
        }
        else {
            $('#slideSearch').slideDown(10);
        }
    }
}

function RecordReportGenerateEvent() {
    try {
        $.ajax({
            type: "Post",
            url: $("#WebApiReportAcessActionUrl").val(),
            data: { reportID: $('#hdnReportActionID').val() }
        });
    }
    catch (Ex) {
        //alert(Ex);
    }
}

function RecordSiteChangeEvent(selectedSiteID) {
    try {
        $.ajax({
            type: "Post",
            url: $("#WebApiSiteChangeActionUrl").val(),
            data: { siteID: selectedSiteID }
        });
    }
    catch (Ex) {
        //alert(Ex);
    }
}

function IE8and9Placeholderissue() {

    if (navigator != undefined && navigator.appVersion != undefined && (navigator.appVersion.indexOf("MSIE 8") != -1 || navigator.appVersion.indexOf("MSIE 9") != -1)) {        //this is for only ie condition ( microsoft internet explore )
        $('input[type="text"][placeholder], textarea[placeholder]').each(function () {
            var obj = $(this);

            if (obj.attr('placeholder') != '') {
                obj.addClass('IePlaceHolder');

                if ($.trim(obj.val()) == '' && obj.attr('type') != 'password') {
                    obj.val(obj.attr('placeholder'));
                }
            }
        });

        $('.IePlaceHolder').focus(function () {
            var obj = $(this);
            if (obj.val() == obj.attr('placeholder')) {
                obj.val('');
            }
        });

        $('.IePlaceHolder').blur(function () {
            var obj = $(this);
            if ($.trim(obj.val()) == '') {
                obj.val(obj.attr('placeholder'));
            }
        });
    }


}
//only for rdlc GenfromSavedFilters is set to true only from email button
// get data from session if it is for email and rdlc
function SearchSetFilterData(GenfromSavedFilters, searchset) {
    if (GenfromSavedFilters != undefined) {
        if (GenfromSavedFilters) {

            return $.parseJSON(sessionStorage.getItem('searchsetsession'));
        }
        else {
            sessionStorage.setItem('searchsetsession', JSON.stringify(searchset));

            return searchset;
        }
    }
    else { return searchset; }
}

//Clears the search parameters
function ResetSearchParams(optiondivid) {
    optiondivid = (typeof optiondivid === 'undefined') ? 'slideSearch' : optiondivid;

    //Resets all the input fields
    $("#" + optiondivid).find(':input').each(function () {
        if (this.type == 'text' || this.tag == 'textarea') {
            if (this.id != 'txtScheduledReportName') //Don't clear the report name
                this.value = '';
            if (this.id != 'txtScheduledReportDesc') //Don't clear the report desc
                this.value = '';
        }
        else if (this.type == 'checkbox' || this.type == 'radio')
            this.checked = false;

    });

    // Dates reset.
    if ($("#ObsstartDate").data("kendoDatePicker")) {
        $("#ObsstartDate").data("kendoDatePicker").value("");
    }
    if ($("#ObsEndDate").data("kendoDatePicker")) {
        $("#ObsEndDate").data("kendoDatePicker").value("");
    }
    //Resets the Kendo Multiselect dropdowns
    $('div.k-multiselect select').each(function () {
        if (this.id !== "TracersListForCompliance")
            $(this).data("kendoMultiSelect").value(-1);

    });
}



//Resets the input fields and the Search and Email panels slideUp/slideDown
function ResetAll() {
    PreserveSelectedList = false;
    ResetSearchParams();

    if (typeof ResetRecurrenceInputs == 'function')
        ResetRecurrenceInputs();

    $("#showerror_msg").hide();
    $("#loadrdlc").html("");

    //Clear the grids
    if (ExcelGenerated) {
        ExcelunBindData(ExcelGridName);
        ExcelGenerated = false;
        //second excel reset & tabs reset
        if (hasExcelSecondGrid & ExcelSecondGridName != "") {
            var tabStrip = $("#tabstripDept").data("kendoTabStrip");
            if (tabStrip != null)
                tabStrip.select(0);
            ChartUnBindData();
            ExcelSecondGridName = "";

            if ("tabtoggle" in window && tabtoggle != null && typeof (tabtoggle) === 'function')
                tabtoggle();

            secondgridview = false;
        }
    }
    RdlcGenerated = false;
    $('#slideSearch').slideDown(750);
    SetButtonClass("btnSearchCriteria", "btn-primary")
    closeSlide("btnEmail", "slideEmail");
    closeSlide("btnRecurrence", "slideRecurrence");
    setposition();
}

function setposition() {
    var elemRect = document.getElementById("btnSearchCriteria");

    if (elemRect != null && elemRect != undefined) {
        var rect = elemRect.getBoundingClientRect();
        var bodyRect = document.body.getBoundingClientRect();
        var offset = rect.bottom - bodyRect.top;
        var offsetleft = rect.left - bodyRect.left;
        if ($('#hdnTracerApp').length > 0)
            offset = 45;

        if (offset > 100 && offset < 160)
            offset = 167.5;

        $("#slideSearch").css({ "top": offset , "padding-left": "15px" });
    }
}

function CenterOnElement(elementName) {
    var $this = $("#" + elementName);
    var posY = $this.offset().top;
    var $thisHeight = $this.outerHeight();
    var windowHeight = $(window).height();
    var scrollPos = posY - windowHeight / 2 + $thisHeight / 2;
    $('html, body').animate({ scrollTop: scrollPos }, 200);
}

function closeSlideSearch(sender, e) {
    closeSlide("btnSearchCriteria", "slideSearch");
    closeSlide("btnEmail", "slideEmail");
}

function OnbtnSearchClick(sender, e) {

    OnBtnClick("btnSearchCriteria", "slideSearch");
    closeSlide('btnRecurrence', 'slideRecurrence');
    closeSlide("btnEmail", "slideEmail");

    //Initialize the idle timer
    ResetTimer(TimeoutWarning);

    saveRecurrenceScreen = "Criteria"; //Used to identify the save to reports trigger

}



function OnbtnEmailClick(sender, e) {
    if (ExcelGenerated && !hasExcelData) {
        ExcelGenerated = false;
    }

    if (RdlcGenerated && !hasRdlcData) {
        RdlcGenerated = false;
    }
    OnBtnClick("btnEmail", "slideEmail");
    closeSlide("btnSearchCriteria", "slideSearch");
    closeSlide("btnRecurrence", "slideRecurrence");

    //Initialize the idle timer
    ResetTimer(TimeoutWarning);

}

function OnbtnSitesClick(sender, e) {
    if (ERCriteriaLoaded) {
        ERSites.oldSites = ERSites.getSelectedSites();
    }


    var button = $("#btnSites");
    if (button.hasClass("btn-primary")) {
        $("#btnSites" + " .k-image").attr("src", "/Images/glyphicons-90-building.png");

    }
    else if (button.hasClass("btn-default")) {
        $("#btnSites" + " .k-image").attr("src", "/Images/glyphicons-90-alt-building.png");
    }

    ERCriteriaLoaded = false;
    OnBtnClick("btnSites", "slideSitesTree");
    closeSlide("btnSearchCriteria", "slideSearch");
    closeSlide("btnEmail", "slideEmail");

    ResetTimer(TimeoutWarning);
}


function OnbtnRecurrenceClick(sender, e) {
    btnRecurrenceClick();
}

function btnRecurrenceClick() {
    OnBtnClick("btnRecurrence", "slideRecurrence");
    closeSlide("btnSearchCriteria", "slideSearch");


    //Initialize the idle timer
    ResetTimer(TimeoutWarning);
    saveRecurrenceScreen = "Recurrence"; //Used to identify the save to reports trigger

}

function SetButtonClass(id, className) {
    var button = $("#" + id);
    if (button.hasClass("btn-primary")) button.removeClass("btn-primary");
    if (button.hasClass("btn-default")) button.removeClass("btn-default");

    button.addClass(className);
}

function SetButtonActiveClass(id) {
    var btnSearchCriteria = $('#btnSearchCriteria');
    var btnEmail = $('#btnEmail');
    var btnRecurrence = $('#btnRecurrence');
    var classActiveTab = "activeTab";

    btnSearchCriteria.removeClass(classActiveTab);
    btnEmail.removeClass(classActiveTab);
    btnRecurrence.removeClass(classActiveTab);

    switch (id) {
        case "btnSearchCriteria":
            btnSearchCriteria.addClass(classActiveTab);
            break;
        case "btnEmail":
            btnEmail.addClass(classActiveTab);
            break;
        case "btnRecurrence":
            btnRecurrence.addClass(classActiveTab);
            break;
    }
}



function closeEmailSlide(sender, e) {
    closeSlide("btnEmail", "slideEmail");
}


function OnBtnClick(btnID, slideID) {
    ChangeButtonClass(btnID, slideID);

    if (window.location.href.indexOf('/Tracer/') > -1)
        setsliderposition(btnID, slideID);
}

function ChangeButtonClass(btnID, slideID) {
    var button = $("#" + btnID);
    if (button.hasClass("btn-primary")) {
        button.removeClass("btn-primary");
        button.removeClass("activeTab");
        button.addClass("btn-default");
        $('#' + slideID).slideUp(750);
    }
    else if (button.hasClass("btn-default")) {
        button.removeClass("btn-default");
        button.addClass("btn-primary");
        button.addClass("activeTab");
        $('#' + slideID).slideDown(750);
    }

}

function setsliderposition(btnID, slideID) {
    var elemRect = document.getElementById(btnID);
    if (elemRect != null && elemRect != undefined) {
        var rect = elemRect.getBoundingClientRect();
        var bodyRect = document.body.getBoundingClientRect();
        var offset = rect.bottom - bodyRect.top;
        var offsetleft = rect.left - bodyRect.left;
        if ($('#hdnTracerApp').length > 0)
            offset = 45;
        $("#" + slideID).css({ top: offset });
    }
}
function openSlide(btnID, slideID) {
    $('#' + slideID).slideDown(750);
    var button = $("#" + btnID);
    if (button.hasClass("btn-default")) {
        button.removeClass("btn-default");
        button.addClass("btn-primary");
    }

}

function closeSlide(btnID, slideID) {
    $('#' + slideID).slideUp(750);
    var button = $("#" + btnID);
    if (button.hasClass("btn-primary")) {
        button.removeClass("btn-primary");
        button.removeClass("activeTab");
        button.addClass("btn-default");
    }

    button.hide();
    button.show();
}
//All Excel view common code  start
//Excel setting common code 




function ExcelBindData(GridName) {
    var grid = $("#" + GridName).data("kendoGrid");
    if (grid != null && grid.dataSource != null) {
        //get data for excel view
        grid.dataSource.bind("error", error_handler);
        //grid.dataSource.bind("requestStart", OnRequestStart);
        grid.dataSource.bind("requestEnd", OnRequestEnd);

        grid.dataSource.read();
        $("#" + GridName).css("display", "block");
        return true;
    }
    else
        return false;
}

function ChartBindData(ChartName) {
    var chart = $("#" + ChartName).data("kendoChart");
    if (chart != null && chart.dataSource != null) {
        //get data for excel view
        chart.dataSource.bind("error", error_handlerChart);
        chart.dataSource.bind("requestStart", OnRequestStart);
        chart.dataSource.bind("requestEnd", OnRequestEnd);

        chart.dataSource.read();
        $("#" + ChartName).css("display", "block");
        return true;
    }
    else
        return false;
}

function ChartUnBindData() {
    var chartView = $("#loadChartView");
    var rptRadio = $('#rptTypeRadio');
    if (chartView != null && chartView != undefined)
        $("#loadChartView").html('');
    if (rptRadio != null && rptRadio != undefined)
        $('#rptTypeRadio').hide();
}

function ExcelunBindData(GridName) {
    //un bind for excel view
    $("#" + GridName).hide();

}

//on excel view error 
function error_handlerChart(e) {
    //ExcelGridName
    ChartUnBindData();
}


//on excel view error 
function error_handler(e) {
    hasExcelData = false;

    //ExcelGridName
    ExcelunBindData(ExcelGridName);
}

//On kendo grid's request start
function OnRequestStart(e) {
    //Show the loading animation
    //$('.loading').show();

    //blockElement('body')

    ShowLoader(true);
}

function OnLimitissue() {
    SaveToMyReports(true);
}

//on excel view request end
function OnRequestEnd(e) {
    if (e.response != null) {
        if (e.response.Errors === null || e.response.Errors === undefined)//NO errors{
        {
            closeSlide("btnSearchCriteria", "slideSearch");
            hasExcelData = true;
        }
        else {

            if (!fromemail) {
                closeSlide("btnEmail", "slideEmail");
                openSlide("btnSearchCriteria", "slideSearch");
            }
            hasExcelData = false;

            if (hasChart)
                ChartUnBindData();

            if (e.response.Errors.indexOf("limit") >= 0) {
                dataLimitIssue = true;
                OnLimitissue();
            }
            else {

                $('#error_msg').html('<div id="showerror_msg" class="alert alert-info alert-dismissible" role="alert" style="display:none;">      <button type="button" class="close" data-dismiss="alert">            <span aria-hidden="true">&times;</span><span class="sr-only">Close</span>        </button>        <div id="show_msg"></div>    </div>')
                $('#showerror_msg').removeClass("alert-info").addClass("alert-danger");
                $('#showerror_msg').css("display", "block");
                $('#show_msg').html(e.response.Errors);

            }


        }
    }
    //Hide the loading animation
    //$('.loading').hide();

    HideLoader(true);
}

function excelExportIE8(e) {
    e.preventDefault();
    if (fromemail) {
        if (hasExcelData) {

            $.ajax({
                type: "Post",
                url: "/Export/CreateSessionCriteria",
                contentType: "application/json",
                data: JSON.stringify({ search: SearchSetFilterData(true) })

            }).done(function (e) {
                $(function () {
                    $.post('/Email/SendExcelEmailIE8',
                        { ExcelGridName: ExcelGridName, email: $.parseJSON(sessionStorage.getItem('searchsetemailsession')) }, function (data) {
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
        else {
            fromemail = false;
            if (dataLimitIssue === false) {
                $('#emailerror_msg').removeClass("alert-info").addClass("alert-danger");
                $('#emailerror_msg').css("display", "block");
                $('#email_msg').html("No data found matching your Criteria. Change Criteria and try again.");
            }
            else { closeSlide("btnSearchCriteria", "slideSearch"); }
        }

    } else {
        //   e.preventDefault();
        if (dataLimitIssue === false) {
            if (hasExcelData) {

                var excelgridname = ExcelGridName;
                var excelfilename = $("#ReportTitle").html();
                if (excelfilename == "Department Comparative Analysis Report") {
                    excelfilename = "Department Comparative Analysis Report Data";
                }
                if (secondgridview) { excelgridname = ExcelSecondGridName; excelfilename = "Department Comparative Analysis Report Details"; }


                $.ajax({
                    type: "Post",
                    url: "/Export/CreateSessionCriteria",
                    contentType: "application/json",
                    data: JSON.stringify({ search: SearchSetFilterData(true) })

                }).done(function (e) {
                    // Download the spreadsheet.
                    // Create the spreadsheet.

                    window.location = kendo.format("{0}?fileName={1}&ExcelGridName={2}",
                        "/Export/CreateExcelFile",
                        excelfilename,
                        excelgridname);
                });
            }
        } else {
            closeSlide("btnSearchCriteria", "slideSearch");
        }
        //

    }
}

function rdlcExport(excelGridName) {
    var dataSortBy = "";
    var dataSortOrder = "";
    if (fromemail) {
        if (hasExcelData) {
            $.ajax({
                type: "Post",
                url: "/Export/CreateSessionCriteria",
                contentType: "application/json",
                data: JSON.stringify({ search: SearchSetFilterData(true) })

            }).done(function (e) {
                $(function () {
                    $.post('/Email/SendPDFEmail',
                        { ExcelGridName: excelGridName, email: $.parseJSON(sessionStorage.getItem('searchsetemailsession')), SortBy: dataSortBy, SortOrder: dataSortOrder }, function (data) {
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
}


function excelExport(e) {
    
    //  ExcelGridName = "test export";
    e.preventDefault();
    if (fromemail) {
        if (hasExcelData) {
            if (navigator != undefined && navigator.appVersion != undefined && navigator.appVersion.indexOf("MSIE 8") != -1) {

                //  e.preventDefault();
                $.ajax({
                    type: "Post",
                    url: "/Export/CreateSessionCriteria",
                    contentType: "application/json",
                    data: JSON.stringify({ search: SearchSetFilterData(true) })

                }).done(function (e) {
                    $(function () {
                        $.post('/Email/SendExcelEmailIE8',
                            { ExcelGridName: ExcelGridName, email: $.parseJSON(sessionStorage.getItem('searchsetemailsession')) }, function (data) {
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
            else {
                // e.preventDefault();

                var sheets = [
                    e.workbook.sheets[0], addparametersbyreporttoexcel(ExcelGridName)

                ];
                sheets[0].title = "Report";
                sheets[1].title = "Report Selections";
                var workbook = new kendo.ooxml.Workbook({
                    sheets: sheets
                });

                var dataURL = workbook.toDataURL();
                dataURL = dataURL.split(";base64,")[1];
                $(function () {

                    $.post('/Email/SendExcelEmail',
                        { base64: dataURL, email: $.parseJSON(sessionStorage.getItem('searchsetemailsession')) }, function (data) {

                            if (data != "Preping Second Attachment") {
                                fromemail = false;
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
            }
        }
        else {
            fromemail = false;
            if (dataLimitIssue === false) {
                $('#emailerror_msg').removeClass("alert-info").addClass("alert-danger");
                $('#emailerror_msg').css("display", "block");
                $('#email_msg').html("No data found matching your Criteria. Change Criteria and try again.test 2");
            }
        }



    } else {

        if (dataLimitIssue === false) {
            if (navigator != undefined && navigator.appVersion != undefined && navigator.appVersion.indexOf("MSIE 8") != -1) {

                //   e.preventDefault();
                if (hasExcelData) {

                    var excelgridname = ExcelGridName;
                    var excelfilename = $("#ReportTitle").html();


                    $.ajax({
                        type: "Post",
                        url: "/Export/CreateSessionCriteria",
                        contentType: "application/json",
                        data: JSON.stringify({ search: SearchSetFilterData(true) })

                    }).done(function (e) {

                        window.location = kendo.format("{0}?fileName={1}&ExcelGridName={2}",
                            "/Export/CreateExcelFile",
                            excelfilename,
                            excelgridname);
                    });
                }
            }
            else {
                //   e.preventDefault();


                // create a new workbook using the sheets of the products and orders workbooks
                var sheets = [
                    e.workbook.sheets[0], addparametersbyreporttoexcel(ExcelGridName)

                ];
                sheets[0].title = "Report";
                sheets[1].title = "Report Selections";

                var rows = e.workbook.sheets[0].rows;
                var workbook = new kendo.ooxml.Workbook({
                    sheets: sheets
                });




                kendo.saveAs({
                    dataURI: workbook.toDataURL(),
                    fileName: $("#ReportTitle").html() + ".xlsx",
                    forceProxy: false,
                    proxyURL: '/Export/Excel_Export_Save'
                })

            }
        }
        else {
            // e.preventDefault();
            closeSlide("btnSearchCriteria", "slideSearch");
        }

    }



}

function stripHTML(html) {
    var tmp = document.createElement("DIV");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
}
function AddExportParameters() {
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
            }

        ]
    }
    return stringvalue;

}

function addparametersbyreporttoexcel(ExcelName) {

    var ExcelSelectedParameters = "";
    ExcelSelectedParameters = AddExportParameters();
    return ExcelSelectedParameters;



}
var NumeratorTotalValue;
var DenominatorTotalValue;
var NumeratorTotalValue = [];
var DenominatorTotalValue = [];
var ObservationTotalValue = [];
function calculateAggregate(field, value) {
    input = (field / value) * 100;
    if (isNaN(input))
        input = 0.0;
    return input;
}
function setNumeratorTotal(data, index) {
    if (index === null || index === undefined) {
        NumeratorTotalValue = data;
        return NumeratorTotalValue;
    }
    else {
        NumeratorTotalValue[index] = data;
        return NumeratorTotalValue[index];

    }

}

function setObservationTotal(data, index) {
    if (index === null || index === undefined) {
        ObservationTotalValue = data;
        return ObservationTotalValue;
    }
    else {
        ObservationTotalValue[index] = data;
        return ObservationTotalValue[index];

    }

}

function setDenominatorTotal(data, index) {
    if (index === null || index === undefined) {
        DenominatorTotalValue = data;
        return DenominatorTotalValue;
    }
    else {
        DenominatorTotalValue[index] = data;
        return DenominatorTotalValue[index];

    }

}
//All Excel view common code  END

function setsessionvariable(key, value) {

    $(function () {
        $.post('/Email/SetVariable',
            {
                key: key, value: value
            }, function (data) {

            });
    });
}

function ConvertToAllOrCSV(target) {
    if (target === null || target === undefined) {
        return "All";
    } else {
        if (target.toString().length === 0) {
            return "All";
        } else {
            return target.join(", ");
        }
    }
}

function ConvertToAllWithSpecialOrCSV(target) {
    if (target === null || target === undefined) {
        return "All";
    } else {
        if (target.toString().length === 0) {
            return "All";
        } else {
            return target.join("€ ");
        }
    }
}

/* Idle timeout logic - Start */
var showTimeoutWarningMinutes = $('#hdnTimeOutWarningMinutes').val();
var idleSeconds = showTimeoutWarningMinutes * 60;
var idleTimer;
var timerCountdown = 120;

function ResetTimer(f) {
    clearInterval(idleTimer);
    idleTimer = setInterval(f, idleSeconds * 1000);
}

function TimeoutWarning() {
    //Alert message for idle session timeout
    $('#TimeOutAlert').modal({
        keyboard: false,
        backdrop: 'static'
    }).show();

    idleSeconds = 1;
    ResetTimer(TimerCountdown);
}

function TimerCountdown() {
    timerCountdown--;
    if (timerCountdown == 0) {
        clearInterval(idleTimer);
        window.location.href = $('#hdnRedirectToPortal').val();
    }
    $("#lblTimerCountdown").text(timerCountdown.toString());
}

function KeepAlive() {
    timerCountdown = 120;
    idleSeconds = showTimeoutWarningMinutes * 60;
    ResetTimer(TimeoutWarning);
}
/* Idle timeout logic - End */

function detectIE() {
    var ua = window.navigator.userAgent;

    var msie = ua.indexOf('MSIE ');
    if (msie > 0) {
        // IE 10 or older => return version number

        return true;
    }


    // other browser
    return false;
}

/* multiselect common code*/

function removedeleteoption(multiselectname) {

    if ($("#" + multiselectname).data("kendoMultiSelect").value().toString() === "-1") {
        var selectedTCtext = $("#" + multiselectname + " option[value='-1']").text()

        if (selectedTCtext === "All") {
            $('#' + multiselectname + '_taglist .k-button').html("<span unselectable='on'>All</span><span>&nbsp;</span>");
        }
    }

}

function addarrowtomultiselect(multiselectname) {
    //$('#' + multiselectname + '_taglist').parent("div").append("<span class='k-select' unselectable='on'><span class='k-icon k-i-arrow-s' unselectable='on'></span></span>");
    $('#' + multiselectname + '_taglist').parent("div").append("<span class='k-select' unselectable='on'><span class='k-icon k-i-arrow-60-down' unselectable='on'></span></span>");

}


function create_error_elem() {
    $('#error_msg').html('<div id="showerror_msg" class="alert alert-info alert-dismissible" role="alert" style="display:none;">      <button type="button" class="close" data-dismiss="alert">            <span aria-hidden="true">&times;</span><span class="sr-only">Close</span>        </button>        <div id="show_msg"></div>    </div>')
}
function create_email_error_elem() {
    $('.email_error_msg').html('<div id="emailerror_msg" class="alert alert-info alert-dismissible emailerror_msg" role="alert" style="display:none;">      <button type="button" class="close" data-dismiss="alert">            <span aria-hidden="true">&times;</span><span class="sr-only">Close</span>        </button>        <div id="email_msg" class="email_msg"></div>    </div>')
}
function create_sites_error_elem() {
    $('#sites_error_msg').html('<div id="siteserror_msg" class="alert alert-info alert-dismissible" role="alert" style="display:none;">      <button type="button" class="close" data-dismiss="alert">            <span aria-hidden="true">&times;</span><span class="sr-only">Close</span>        </button>        <div id="sites_msg"></div>    </div>')
}
function create_recurrence_error_elem() {
    $('#recurrence_error_msg').html('<div id="recurrenceerror_msg" class="alert alert-info alert-dismissible emailerror_msg" role="alert" style="display:none;">      <button type="button" class="close" data-dismiss="alert">            <span aria-hidden="true">&times;</span><span class="sr-only">Close</span>        </button>        <div id="recurrence_msg" class="email_msg"></div>    </div>')
}

// talk to anabayan.
if (typeof String.prototype.trim !== 'function') {
    String.prototype.trim = function () {
        return this.replace(/^\s+|\s+$/g, '');
    }
}

var siteID, siteName, isAMPAccess, isTracersAccess, programID, programName, eventname, advCertListTypeID;

function onSiteChange(_siteID, _siteName, _isAMPAccess, _isTracersAccess) {



    if ($('#UserSite').val() === siteID)
        return;

    eventname = 'onSiteChange';
    siteID = _siteID;
    siteName = _siteName;
    isAMPAccess = _isAMPAccess;
    isTracersAccess = _isTracersAccess;

    if (isTracersAccess == 0) {
        confirmModal();
        return;
    }

    ConfirmSiteNavigation();

}

var confirmModal = function (callback) {

    var header = 'Confirm Navigation';
    var title = "Tracer access not enabled for this site/program. Do you want to continue?";


    if (callback == undefined) {
        modalConfirm.OpenModal(confirmModal, title,header);
        return;
    }

    if (callback) {

        switch (eventname) {
            case 'onSiteChange':
                ConfirmSiteNavigation(true);
                break;
            case 'onProgramChange':
                ConfirmProgramNavigation(true);
                break;
            default:
                break;

        }



    }

    if (callback == false) {
        return;
    }

}

function ConfirmSiteNavigation(RedirectoHome) {

    if (RedirectoHome){
        UpdatePrograms(siteID, siteName, true);
        return;
    }

    var loadAllParams = IsHomePage();
    ResetAll();

    //Reset the date fields
    if (typeof ResetCriteriaDates == 'function') {
        ResetCriteriaDates();
    }

    if (typeof SetDefaults == 'function') {
        SetDefaults();
    }

    if (typeof createMenu == 'function') {
        createMenu();
    }

    $("#UserSite").val(siteID);
    $("#UserSiteName").val(siteName);
    $("#litSelectedSite").html(siteName);
    $("#lblHeaderSiteName").html(siteName);

    if (typeof UpdatePrograms === 'function') {
        UpdatePrograms(siteID, siteName, false);

        $("#lblHeaderProgramName").html($("#UserProgramName").val());

        UpdateProgramsInSession($("#UserProgram").val(), $("#UserProgramName").val(), false);

        //Change the Email subject text when the site is changed
        if (loadAllParams)
            $(".EmailSubjectMaskedTextbox").val("Tracers: " + $("#ReportTitle").html() + " - " + $("#UserProgramName").val());

        if (typeof UpdateReportID === 'function')
            UpdateReportID(true);

        if (loadparameters == "TracerByCMS") {
            $('#ProgramsUL li .AvailablePrograms').hide().filter(function () {
                return $(this).text().toLowerCase().indexOf('hospital') != -1;
            }).show();
            $('#programsearchli').css("display", "none");
        }
    }

    if (loadAllParams) {
        switch (loadparameters) {
            case "MonthlyQuestionBreakdown":
            case "ComplianceQuestion":
                ComplianceQuestionparameters(siteID, siteName);
                break;
            case "MonthlyTracerBreakdown":
            case "TracerDepartmentAssignment":
                TracerDepartmentparameters(siteID, siteName);
                break;
            default:
                loadrespectiveparameters(siteID, siteName);
        }
    } else {
        if ($("#UserProgram").val() == 2 || $("#UserProgram").val() == 69) {
            $("#divreport10").css("display", "block");

        }
        else {
            $("#divreport10").css("display", "none");
        }
    }

    RecordSiteChangeEvent(siteID);
    if (typeof updateTracerUserInfo === 'function') {

        updateTracerUserInfo();
    }


}

function onProgramChange(_siteID, _siteName, _programID, _programName, _isTracersAccess, _advCertListTypeID) {



    if ($('#UserProgram').val() === _programID && $('#UserCertificationItemID').val()===_advCertListTypeID)
        return;

    eventname = 'onProgramChange';
    programID = _programID;
    programName = _programName;
    advCertListTypeID = _advCertListTypeID;

    if (_isTracersAccess==0) {
        confirmModal();
        return;
    }

    ConfirmProgramNavigation();



}

function SearchInputKeyPress(e) {

    if (!e) { var e = window.event; }

    // e.preventDefault(); // sometimes useful

    // Enter is pressed
    if (e.keyCode == 13) { SearchStandard(); }

}

function SearchStandard() {

    var searchText = $("#txtSearch").val();

    if (searchText.length <= 3)
        return;

    window.location.href = "/Transfer/RedirectToWebApp?webApp=" + 'Amp' + "&pageID=" + 49 + "&searchString=" + searchText;

}

function ConfirmProgramNavigation(RedirectoHome) {

    if (RedirectoHome) {
        UpdateProgramsInSession(programID, programName, true, advCertListTypeID);
        return;
    }

    var loadAllParams = IsHomePage();

    ResetAll();

    //Reset the date fields
    if (typeof ResetCriteriaDates == 'function') {
        ResetCriteriaDates();
    }

    if (typeof SetDefaults == 'function') {
        SetDefaults();
    }

    if (typeof UpdateReportID === 'function')
        UpdateReportID(true);

    if (typeof createMenu == 'function') {
        createMenu();
    }

    $("#UserProgram").val(programID);
    $("#UserProgramName").val(programName);
    $("#litSelectedProgram").html(programName);
    $('#lblHeaderProgramName').html(programName);

    UpdateProgramsInSession(programID, programName, false, advCertListTypeID);

    if (loadAllParams) {
        //Change the Email subject text when the program is changed
        $("#EmailSubjectMaskedTextbox").val("Tracers: " + $("#ReportTitle").html() + " - " + $("#UserProgramName").val());

        switch (loadparameters) {
            case "MonthlyQuestionBreakdown":
            case "ComplianceQuestion":
                ComplianceQuestionparameters(siteID, siteName);
                break;
            case "MonthlyTracerBreakdown":
            case "TracerDepartmentAssignment":
                TracerDepartmentparameters(siteID, siteName);
                break;
            default:
                loadrespectiveparameters(siteID, siteName);
        }
    }
    else {

        if (programID == 2 || programID == 69) {
            $("#divreport10").css("display", "block");

        }
        else {
            $("#divreport10").css("display", "none");
        }
    }


    //Update the preferred program with the selected program
    //UpdatePreferredProgram(siteID, programID);

    if (typeof updateTracerUserInfo === 'function') {

        updateTracerUserInfo();
    }
}

function UpdatePrograms(siteID, siteName, redirectToHome) {
    $.ajax({
        type: "POST",
        url: ProgramsUpdate,
        data: {
            selectedsiteid: siteID,
            selectedsitename: siteName,
            allPrograms: true,
            redirectToHome: redirectToHome
        },
        success: function (response) {
            if (redirectToHome) {
                window.location.href = "/Transfer/RedirectToWebApp?webapp=amp&pageId=31";
                return;
            }

            $("#divPrograms").html(response);
        },
        //Default program has to be set based on user preference, so set the program session variables first with a synchronous ajax call before updating other search parameters
        async: false
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

//Updates the selected program in session
function UpdateProgramsInSession(programId, programName, redirectToHome, advCertListTypeID) {
    $.ajax({
        async: false,
        type: "POST",
        url: UpdateProgramsInSessionURL,
        data: {
            selectedProgramId: programId,
            selectedProgramName: programName,
            redirectToHome: redirectToHome,
            advCertListTypeID: advCertListTypeID
        },
        success: function (response) {
            if (redirectToHome) {
                window.location.href = "/Transfer/RedirectToWebApp?webapp=amp&pageId=31";
                return;
            }
        }
    });
}

function SetLoadingImageVisibility(visible) {
    showLoadingImage = visible;
}

function IsHomePage() {
    var url = window.location.href;
    var returnvalue = false;
    if (url != null) {
        if (url.toLowerCase().indexOf("/home") < 0) {
            returnvalue = true;
        }
        else {
            if (url.toLowerCase().indexOf("/myreports") > 0) {
                returnvalue = true;
            }
            else if (url.toLowerCase().indexOf("/searchreports") > 0) {
                returnvalue = true;
            }
            else {
                returnvalue = false;
            }
        }


    }



    return returnvalue;
}
function SetActiveTab() {
    var valActiveTab = $('#hdnActiveTab').val();
    $("#tabstrip").find(".active").removeClass("active");

    if (valActiveTab != null && valActiveTab != '')
        $('#' + valActiveTab).parent().addClass("active");
    else
        $('#lnkReportsHome').parent().addClass("active");
}

/* Date validations - START*/

//Allow only numbers and "/"
function AllowNumericOnly(e) {
    if (e.keyCode == '9' || e.keyCode == '16') {
        return;
    }
    var code;
    if (e.keyCode) code = e.keyCode;
    else if (e.which) code = e.which;
    if (e.which == 46)
        return false;

    if (code != 47 && (code < 48 || code > 57))
        return false;
}

//function ValidateRecurrenceRangeTxt(evt)
//{
//    {
//        var iKeyCode = (evt.which) ? evt.which : evt.keyCode
//        if (iKeyCode != 46 && iKeyCode > 31 && (iKeyCode < 48 || iKeyCode > 57))
//            return false;

//        return true;
//         }
//}

//Validate the clipboard data while pasting
function ValidateClipboardText() {
    return DateValidator(window.clipboardData.getData("Text"));
}

//Validate Date (With leap year check)

// Declaring valid date character, minimum year and maximum year
var dtCh = "/";
var minYear = 1900;
var maxYear = 2100;

function isInteger(s) {
    var i;
    for (i = 0; i < s.length; i++) {
        // Check that current character is number.
        var c = s.charAt(i);
        if (((c < "0") || (c > "9"))) return false;
    }
    // All characters are numbers.
    return true;
}

function stripCharsInBag(s, bag) {
    var i;
    var returnString = "";
    // Search through string's characters one by one.
    // If character is not in bag, append to returnString.
    for (i = 0; i < s.length; i++) {
        var c = s.charAt(i);
        if (bag.indexOf(c) == -1) returnString += c;
    }
    return returnString;
}

function daysInFebruary(year) {
    // February has 29 days in any year evenly divisible by four,
    // EXCEPT for centurial years which are not also divisible by 400.
    return (((year % 4 == 0) && ((!(year % 100 == 0)) || (year % 400 == 0))) ? 29 : 28);
}
function DaysArray(n) {
    for (var i = 1; i <= n; i++) {
        this[i] = 31
        if (i == 4 || i == 6 || i == 9 || i == 11) { this[i] = 30 }
        if (i == 2) { this[i] = 29 }
    }
    return this
}

function DateValidator(dtStr) {

    var daysInMonth = DaysArray(12)
    var pos1 = dtStr.indexOf(dtCh)
    var pos2 = dtStr.indexOf(dtCh, pos1 + 1)
    var strMonth = dtStr.substring(0, pos1)
    var strDay = dtStr.substring(pos1 + 1, pos2)
    var strYear = dtStr.substring(pos2 + 1)

    if (strYear.length == 2)
        strYear = "20" + strYear;

    strYr = strYear
    if (strDay.charAt(0) == "0" && strDay.length > 1) strDay = strDay.substring(1)
    if (strMonth.charAt(0) == "0" && strMonth.length > 1) strMonth = strMonth.substring(1)
    for (var i = 1; i <= 3; i++) {
        if (strYr.charAt(0) == "0" && strYr.length > 1) strYr = strYr.substring(1)
    }
    month = parseInt(strMonth)
    day = parseInt(strDay)
    year = parseInt(strYr)


    if (pos1 == -1 || pos2 == -1) {
        return false
    }
    if (strMonth.length < 1 || month < 1 || month > 12) {
        return false
    }
    if (strDay.length < 1 || day < 1 || day > 31 || (month == 2 && day > daysInFebruary(year)) || day > daysInMonth[month]) {

        return false
    }
    if (strYear.length != 4 || year == 0 || year < minYear || year > maxYear) {

        return false
    }
    if (dtStr.indexOf(dtCh, pos2 + 1) != -1 || isInteger(stripCharsInBag(dtStr, dtCh)) == false) {

        return false
    }
    return true
}

/* Date validations - END*/

//Shows the tooltip for the selected control
function ShowToolTip(ctrl, errorMessage, placement, timeout) {
    $(ctrl).tooltip({ title: errorMessage, "placement": placement, "trigger": "manual" }).tooltip('show').focus();
    var myVar = setTimeout(function () {
        $(ctrl).tooltip('destroy');
        clearTimeout(myVar);
    }, timeout);
}




//Check if the selected report view is Excel view
function CheckIfExcelView() {
    if ($('input[name=ReportTypeExcel]').length > 0 ||
        $('input[name=ReportType]:checked').val() === "ExcelView" ||
        $('input[name=ReportTypeSumDet]:checked').val() === "ExcelView" ||
        loadparameters === "MonthlyQuestionBreakdown" || loadparameters === "MonthlyTracerBreakdown"
        || loadparameters === "TracerDepartmentAsignment") {
        return true;
    }

    return false;
}


function ScrollToTopCall() {
    $('html, body').animate({ scrollTop: 0 }, 'fast');
}

function GetReportDateAdder() {
    return moment().tz('America/Chicago').format('_MM-DD-YYYY_HHmmssSSS_A');
}




function GetReportHeaderUserNameFormat(userName, includeInactiveTag) {
    includeInactiveTag = includeInactiveTag || false;
    var userNameArray = userName.split(',');
    userName = userNameArray[0];

    if (userNameArray.length > 1) {
        userName += ' ' + userNameArray[1].toString().trim().substring(0, 1);

        if (includeInactiveTag == true && userNameArray[1].indexOf('(Inactive)') > -1)
            userName += ' (Inactive)';
    }
    return userName;
}

function lastNameSort(a, b) {
    return a.toLowerCase().localeCompare(b.toLowerCase());
}

/*
Overwriting Kendo MultiSelect value function, so as to prevent the bug which is caused after upgrading to Kendo v2017.1.223
Bug:- After filter applied in Multiselect, the value selected from the drilldown is not getting selected properly.
*/
kendo.ui.MultiSelect.prototype.value = function (value) {
    var that = this;
    var oldValue = that.listView.value().slice();
    var maxSelectedItems = that.options.maxSelectedItems;

    if (value === undefined) {
        return oldValue;
    }

    value = that._normalizeValues(value);

    if (maxSelectedItems !== null && value.length > maxSelectedItems) {
        value = value.slice(0, maxSelectedItems);
    }

    that.listView.value(value);

    that._old = value;

    that._fetchData();
};

function showValidationAlert(message) {

    if ($('#showerror_msg').length == 0)
        create_error_elem();

    $('#showerror_msg').removeClass("alert-info").addClass("alert-danger");
    $('#showerror_msg').css("display", "block");
    $('#show_msg').html(message);

}

function hextoColorName(color){
    var colours = {
        "#ff0000" : "Red","#000000" : "Black","#808080" : "Gray","#c0c0c0" : "Silver","#ffffff" : "White",
        "#800000" : "Maroon","#808000" : "Olive","#ffff00" : "Yellow","#008000" : "Green",
        "#00ff00" : "Lime","#008080" : "Teal","#00ffff" : "Aqua","#000080" : "Navy",
        "#0000ff" : "Blue", "#800080" : "Purple", "#ff00ff" : "Funchsia", "#ff3333" : "Red", "#add8e6" : "Light Blue",
        "#ffa500": "Orange", "#ffc0cb": "Pink", "#d3d3d3": "LightGray"
    };

    if (typeof colours[color.toLowerCase()] != 'undefined')
        return colours[color];

    return false;
}

function includeHavingComplianceColor(includeCheck, HavingComplianceOperator, HavingComplianceValue, HavingComplianceColorValue) {
    $('#havingcompValuebox').prop('checked', includeCheck);

    $('#HavingComplianceQuestions').data("kendoDropDownList").value(HavingComplianceOperator);
    $('#HavingComplianceQuestions').data("kendoDropDownList").enable(true);

    $('#havcompvalue').data("kendoNumericTextBox").value(HavingComplianceValue);
    $('#havcompvalue').data("kendoNumericTextBox").enable(true);

    $("#colorpicker").data("kendoColorPicker").value(HavingComplianceColorValue);
}

function setTotalCompletedObsColor(includeCheck, TotalCompletedObsOperator, TotalCompletedObsValue) {
    $('#totalcompletedobsValuebox').prop('checked', includeCheck);

    $('#SetTotalCompletedObs').data("kendoDropDownList").value(TotalCompletedObsOperator);
    $('#SetTotalCompletedObs').data("kendoDropDownList").enable(includeCheck);

    $('#totalcompletedobsvalue').data("kendoNumericTextBox").value(TotalCompletedObsValue);
    $('#totalcompletedobsvalue').data("kendoNumericTextBox").enable(includeCheck);
}

function setTotalCompletedObsRange(includeGreaterCheck, includeBetweenCheck, includeLessCheck, TotalCompletedObsGreaterValue, TotalCompletedObsBetweenLowValue, TotalCompletedObsBetweenHighValue, TotalCompletedObsLessValue) {
    $('#tracerCompGreaterChecked').prop('checked', includeGreaterCheck);
    $('#tracerCompBetweenChecked').prop('checked', includeBetweenCheck);
    $('#tracerCompLessChecked').prop('checked', includeLessCheck);
    $("#tracerCompGreaterValue").data("kendoNumericTextBox").value(TotalCompletedObsGreaterValue);
    $("#tracerCompBetweeLowValue").data("kendoNumericTextBox").value(TotalCompletedObsBetweenLowValue);
    $("#tracerCompBetweeHighValue").data("kendoNumericTextBox").value(TotalCompletedObsBetweenHighValue);
    $("#tracerCompLessValue").data("kendoNumericTextBox").value(TotalCompletedObsLessValue);
}

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
function getCompliance1ExcelExportParameter(paramsearchset) {
    var stringselected = [];
    if (paramsearchset.TracerCompGreaterChecked === true) {
        var stringValue = (paramsearchset.TracerCompGreaterChecked == true ? "True" : "False") + (", Green, Greater than or equal to, ") +
            (paramsearchset.TracerCompGreater.toString()) + ("%");
        stringselected = {
            cells: [
                { value: "Graph Criteria Compliance 1" },
                { value: stringValue }
            ]
        }
    }
    else {
        stringselected = {
            cells: [
                { value: "Graph Criteria Compliance 1" },
                { value: "False" }
            ]
        }
    }
    return stringselected;
}

function getCompliance2ExcelExportParameter(paramsearchset) {
    var stringselected = [];
    if (paramsearchset.TracerCompBetweenChecked === true) {
        var stringValue = (paramsearchset.TracerCompBetweenChecked == true ? "True" : "False") + (", Yellow, Between, ") +
            (paramsearchset.TracerCompBetweenLow.toString()) + (" and ") + (paramsearchset.TracerCompBetweenHigh.toString()) + ("%");
        stringselected = {
            cells: [
                { value: "Graph Criteria Compliance 2" },
                { value: stringValue }
            ]
        }
    }
    else {
        stringselected = {
            cells: [
                { value: "Graph Criteria Compliance 2" },
                { value: "False" }
            ]
        }
    }
    return stringselected;
}

function getCompliance3ExcelExportParameter(paramsearchset) {
    var stringselected = [];
    if (paramsearchset.TracerCompLessChecked === true) {
        var stringValue = (paramsearchset.TracerCompLessChecked == true ? "True" : "False") + (", Red, Less than or equal to, ") +
            (paramsearchset.TracerCompLess.toString()) + ("%");
        stringselected = {
            cells: [
                { value: "Graph Criteria Compliance 3" },
                { value: stringValue }
            ]
        }
    }
    else {
        stringselected = {
            cells: [
                { value: "Graph Criteria Compliance 3" },
                { value: "False" }
            ]
        }
    }
    return stringselected;
}

function getTotalCompletedObsExcelExportParameter(paramsearchset) {
    var stringselected = [];
    if (paramsearchset.IncludeTotalComObsValue === true) {
        var stringValue = (paramsearchset.IncludeTotalComObsValue == true ? "True" : "False") + (", LightBlue, ") +
            (paramsearchset.TotalCompletedObsOperator == 'lt' ? "Less than" : "Greater Than") + (", ") +
            (paramsearchset.TotalCompletedObsValue.toString());
        stringselected = {
            cells: [
                { value: "Graph Criteria Total Completed Observation" },
                { value: stringValue }
            ]
        }
    }
    else {
        stringselected = {
            cells: [
                { value: "Graph Criteria Total Completed Observation" },
                { value: "False" }
            ]
        }
    }
    return stringselected;
}

function getMinimumTracerComplianceExcelExportParameter(paramsearchset) {
    var  stringselected = {
        cells: [
        { value: "Only Include less than % compliance" },
        { value: paramsearchset.MinimumComplianceValue.toString() }
        ]
    }
    return stringselected;
}