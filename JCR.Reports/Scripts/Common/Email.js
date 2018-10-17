function resetEmailInputs(sender, e) {
    create_email_error_elem();

    $(".EmailCCMaskedTextbox").val("");
    $(".EmailBCCMaskedTextbox").val("");
    $(".EmailCommentMaskedTextbox").val("");

    SetEmailSubject();

    var resetvalidator = $(".EmailForm").kendoValidator().data("kendoValidator");
    resetvalidator.hideMessages();
}

var excelgeneratedfromEmailview = false;


function SetEmailSubject() {
    if ($("#UserProgramName").length > 0)
        $(".EmailSubjectMaskedTextbox").val("Tracers: " + $("#ReportTitle").html() + " - " + $("#UserProgramName").val());
    else
        $(".EmailSubjectMaskedTextbox").val("Tracers: " + $("#ReportTitle").html());
}

/******************************AUTO COMPLETE EMAIL ADDRESSES*************************************************START*/
$(function () {

    function acSource(request, response) {
        SetLoadingImageVisibility(false); //Disables the loading image in Layout.cshtml
        $.ajax({
            type: "POST",
            data: { search: ExtractLast(request.term) },
            url: '/Email/GetEmailList',
            success: function (data) {
                response(data);
                SetLoadingImageVisibility(true); //Enables the loading image in Layout.cshtml
            }
        });
    }

    function acSearch(val) {
        var term = ExtractLast(val);
        if (term.length < 3) {
            return false;
        }
    }

    function acSelect(el, event, ui, id) {
        var terms = SplitSemiColon(el.value);
        terms.pop();
        terms.push(ui.item.value);
        terms.push("");
        el.value = terms.join("; ");
        MoveCursorToEnd('.' + id);
        return false;
    }

    function SplitSemiColon(val) {
        return val.split(/;\s*/);
    }

    function ExtractLast(term) {
        return SplitSemiColon(term).pop();
    }

    function MoveCursorToEnd(el) {
        if (typeof el.selectionStart == "number") {
            el.selectionStart = el.selectionEnd = el.value.length;
        }
        else if (typeof el.createTextRange != "undefined") {
            el.focus();
            var range = el.createTextRange();
            range.collapse(false);
            range.select();
        }
    }

    $(".EmailToMaskedTextbox")
    .autocomplete({
        minLength: 3,
        source: function (request, response) {
            acSource(request, response);
        },
        search: function () {
            return acSearch(this.value);
        },
        focus: function () {
            return false;
        },
        select: function (event, ui) {
            return acSelect(this, event, ui, "EmailToMaskedTextbox");
        }
    });
    $(".EmailCCMaskedTextbox")
    .autocomplete({
        minLength: 3,
        source: function (request, response) {
            acSource(request, response);
        },
        search: function () {
            return acSearch(this.value);
        },
        focus: function () {
            return false;
        },
        select: function (event, ui) {
            return acSelect(this, event, ui, "EmailCCMaskedTextbox");
        }
    });
    $(".EmailBCCMaskedTextbox")
    .autocomplete({
        minLength: 3,
        source: function (request, response) {
            acSource(request, response);
        },
        search: function () {
            return acSearch(this.value);
        },
        focus: function () {
            return false;
        },
        select: function (event, ui) {
            return acSelect(this, event, ui, "EmailBCCMaskedTextbox");
        }
    });

});
/******************************AUTO COMPLETE EMAIL ADDRESSES*************************************************END*/

//Shows the Email status message
function ShowEmailStatus(response, status) {
    var divErrorMain = "#email_error_msg", divErrorChild = "#emailerror_msg", divErrorMessage = "#email_msg";

    if (status === 'success')
        $(divErrorChild).removeClass("alert-danger").addClass("alert-info");
    else
        $(divErrorChild).removeClass("alert-info").addClass("alert-danger");

    $(divErrorMain).css("display", "block");
    $(divErrorChild).slideDown('slow');
    $(divErrorMessage).html(response);
    $(divErrorChild).delay(5000).slideUp('slow');
}