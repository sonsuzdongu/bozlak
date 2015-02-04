process.on("uncaughtException", function(e) {
    if (window && window._showException) {
        window._showException(e);
    } else {
        console.log(e);
    }
});
