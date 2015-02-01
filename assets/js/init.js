var gui = require('nw.gui');

var bozlak = bozlak || {};
bozlak.globals = {};
bozlak.dom = {};

bozlak.init = function () {
    var win = gui.Window.get();

    //set some globals
    bozlak.globals.win = win; //global win object
    bozlak.globals.currentTab = null; //variable to hold current open tabs' key
    bozlak.globals.pages = {}; //stack for loaded pages
    bozlak.globals.currentKey = 1; //initial page id. incremented on each newTab call

    bozlak.globals.homePage = "http://google.com";

    bozlak.dom.$tabs = $('.tabs');
    bozlak.dom.$addressForm = $('#address-form');
    bozlak.dom.$addressFormInput = bozlak.dom.$addressForm.find("input");

    //bind events
    bozlak.init.bindAddressBar();
    bozlak.init.bindTabEvents();
    bozlak.init.bindGlobalHandlers();
    bozlak.init.bindWindowButtons();
    bozlak.init.bindAddressBarButtons();


    //open google.com at start
    bozlak.init.newTab(bozlak.globals.homePage);
};

/**
 * bind new tab, close tab and select tab events
 */
bozlak.init.bindTabEvents = function () {
    bozlak.dom.$tabs.on('click', '.close', function (e) {
        e.preventDefault();
        e.stopPropagation();
        var id = $(this).parent().data("id");
        bozlak.init.removeTab(id);
    });

    bozlak.dom.$tabs.on('click', '.tab-item', function (e) {
        e.preventDefault();
        var id = $(this).data("id");
        bozlak.init.selectTab(id);
    });

    $("#addTab").click(function(e) {
        e.preventDefault();
        bozlak.init.newTab(bozlak.globals.homePage);
    });
};


/**
 * remove tab handler
 */
bozlak.init.removeTab = function (key) {
    var $iframe = bozlak.globals.pages[key];

    var $prev,
        $next;

    //if any open tabs, select it
    //if not, create a new one if current viewing tab is removed
    if (key == bozlak.globals.currentTab) {
        $prev = $iframe.$tab.prev();
        $next = $iframe.$tab.next();

        $iframe.remove();
        $iframe.$tab.remove();

        if ($prev.length) {
            bozlak.init.selectTab($prev.data("id"));
        } else if ($next.length) {
            bozlak.init.selectTab($next.data("id"));
        } else {
            bozlak.init.newTab(bozlak.globals.homePage);
        }
    } else {
        $iframe.remove();
        $iframe.$tab.remove();
    }
    
    delete bozlak.globals.pages[key];
};

/**
 * new tab handler
 */
bozlak.init.newTab = function (url) {
    //https://github.com/nwjs/nw.js/wiki/Mini-browser-in-iframe
    var attributes = {
        'nwdisable': true, 
        'nwfaketop': true, 
        'nwUserAgent': window.navigator.userAgent + " - Bozlak"
    };

    var $iframe = $("<iframe>").attr(attributes);
    $iframe.addClass("iframe-loading");

    $iframe.on("load", function (e) {
        var that = this;
        var contentWindow = that.contentWindow;

        //TODO: we should implement a timeout handler
        //is iframe loaded succesfully?
        var success = !!e.target.contentWindow.document.getElementsByTagName('body')[0].innerHTML.length;
        //TODO: show some "not found" page on !success

        $iframe.removeClass("iframe-loading");

        //bind contextmenu events
        contentWindow.addEventListener('contextmenu', function (e) {
            e.preventDefault();

            //get menu factory for given right clicked node
            var menu = new bozlak.contextMenus._factory(e.target.nodeName);
            menu.popup(e.x, e.y);
        });


        $iframe.$tab.find(".select").html(contentWindow.document.title);
        bozlak.globals.win.title = contentWindow.document.title + " - Bozlak";

        $iframe._url = contentWindow.location.href.toString();
        bozlak.dom.$addressFormInput.val($iframe._url);

        contentWindow.addEventListener('beforeunload', function () {
            $iframe.addClass("iframe-loading");
        });
    });

    $iframe.attr("src", url);
    bozlak.globals.currentKey++;

    var markup = '<div class="tab-item">' +
                    '<a href="#" class="select">' + 
                    'Tab ' + bozlak.globals.currentKey + 
                    '</a>' +
                    '<a href="#" class="close">x</a>' +
                 '</div>';

    var $newTab = $(markup).data("id", bozlak.globals.currentKey);
    $iframe.data("id", bozlak.globals.currentKey);

    $newTab.$iframe = $iframe;
    $iframe.$tab = $newTab;

    $iframe.contentWindow = function () {
        return $iframe.get(0).contentWindow;
    };

    bozlak.globals.pages[bozlak.globals.currentKey] = $iframe;

    $newTab.appendTo(bozlak.dom.$tabs);
    $('#bozlak-main').append($iframe);

    bozlak.init.selectTab(bozlak.globals.currentKey);
};

bozlak.init.selectTab = function (key) {
    var $iframe = bozlak.globals.pages[key];
    $(".tab-item").removeClass("selected");
    $('#bozlak-main iframe').hide();

    $iframe.$tab.addClass("selected");
    $iframe.show();

    bozlak.dom.$addressFormInput.val($iframe._url);
    bozlak.globals.currentTab = key;
};


bozlak.init.bindAddressBar = function () {
    var globals = bozlak.globals;

    bozlak.dom.$addressForm.submit(function (e) {
        e.preventDefault();
        globals.pages[globals.currentTab].contentWindow().location.href = $(this).find("input").val();
    });
};


bozlak.init.bindGlobalHandlers = function () {
    var globals = bozlak.globals;

    globals.win.on('enter-fullscreen', function() {
        $("body").addClass("full-screen");
    });

    globals.win.on('leave-fullscreen', function() {
        $("body").removeClass("full-screen");
    });
};


bozlak.init.bindWindowButtons = function () {
    var globals = bozlak.globals;

    $("#bozlak-fullscreen").click(function(e) {
        e.preventDefault();
        globals.win.toggleFullscreen();
    });

    $("#bozlak-close").click(function(e) {
        e.preventDefault();
        globals.win.close(true);
    });

    $("#bozlak-minimize").click(function(e) {
        e.preventDefault();
        globals.win.minimize();
    });
};

bozlak.init.bindAddressBarButtons = function () {
    var globals = bozlak.globals;

    //TODO: there's something wrong with this code
    //
    $("#bozlak-back").click(function(e) {
        e.preventDefault();
        globals.pages[globals.currentTab].contentWindow().history.back();
    });

    $("#bozlak-forward").click(function(e) {
        e.preventDefault();
        globals.pages[globals.currentTab].contentWindow().history.forward();
    });

    $("#bozlak-reload").click(function(e) {
        e.preventDefault();
        globals.pages[globals.currentTab].contentWindow().location.reload();
    });
};

bozlak.init();
