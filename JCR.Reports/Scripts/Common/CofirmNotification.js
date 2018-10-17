modalConfirm = function () {

    var callback = null;

    var target;

    function OpenModal(methodName, title, header) {

        if (!callback) {
            $("#modal-btn-yes").on("click", function () {
                $("#mi-modal").modal('hide').data('bs.modal', null);;
                callback(true);

                //target(true);
            });

            $("#modal-btn-no").on("click", function () {
                $("#mi-modal").modal('hide').data('bs.modal', null);
                callback(false);
            });

            $("#closeModalButton").on("click", function () {
                $("#mi-modal").modal('hide').data('bs.modal', null);
                callback(false);
            });

        }
              

        callback = methodName;

        target = event;

        $("#myModalLabel").html(title);

        $("#myModalHeader").html(header);

        $("#mi-modal").modal({ backdrop: "static", keyboard: false, show: true });

        return true;

    }


    return {
        OpenModal: OpenModal
    }

}();