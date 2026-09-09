(function () {
    "use strict";

    var spinner = document.getElementById("calendar-spinner");
    var iframe = document.getElementById("calendar-iframe");

    if (iframe && spinner) {
        iframe.addEventListener("load", function () {
            spinner.hidden = true;
        });
    }
})();
