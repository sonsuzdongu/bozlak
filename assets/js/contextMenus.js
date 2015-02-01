var gui = require('nw.gui');
var bozlak = bozlak || {};

bozlak.contextMenus = {};

bozlak.contextMenus._factory = function (nodeName) {
    nodeName = nodeName || "";
    nodeName = nodeName.toLowerCase();

    if (bozlak.contextMenus[nodeName]) {
        return bozlak.contextMenus.input();
    } else {
        return bozlak.contextMenus._default();
    }
};

bozlak.contextMenus.input = function () {
    var menu = new gui.Menu();

    var cut = new gui.MenuItem({
        label: "Deneme",
        click: function() {
            bozlak.globals.iframes[bozlak.globals.currentTab].iframe.contentDocument.execCommand("cut");
        }
    });

    var copy = new gui.MenuItem({
        label: "Copy",
        click: function() {
            bozlak.globals.iframes[bozlak.globals.currentTab].iframe.contentDocument.execCommand("copy");
        }
    });

    var paste = new gui.MenuItem({
        label: "Paste",
        click: function() {
            bozlak.globals.iframes[bozlak.globals.currentTab].iframe.contentDocument.execCommand("paste");
        }
    });

    /*
       var openInNewTab = new gui.MenuItem({
       label: openInNewTab || "Open in a new tab",
       click: function() {
       if (contextEvent && contextEvent.target && contextEvent.target.nodeName === 'A') {
       OpenTab(contextEvent.target.href);
       }
       }
       });
       */

    menu.append(cut);
    menu.append(copy);
    menu.append(paste);
    //menu.append(openInNewTab);

    return menu;


};

bozlak.contextMenus._default = function () {
    var menu = new gui.Menu();

    var cut = new gui.MenuItem({
        label: "Cut",
        click: function() {
            bozlak.globals.iframes[bozlak.globals.currentTab].iframe.contentDocument.execCommand("cut");
        }
    });

    var copy = new gui.MenuItem({
        label: "Copy",
        click: function() {
            bozlak.globals.iframes[bozlak.globals.currentTab].iframe.contentDocument.execCommand("copy");
        }
    });

    var paste = new gui.MenuItem({
        label: "Paste",
        click: function() {
            bozlak.globals.iframes[bozlak.globals.currentTab].iframe.contentDocument.execCommand("paste");
        }
    });

    /*
       var openInNewTab = new gui.MenuItem({
       label: openInNewTab || "Open in a new tab",
       click: function() {
       if (contextEvent && contextEvent.target && contextEvent.target.nodeName === 'A') {
       OpenTab(contextEvent.target.href);
       }
       }
       });
       */

    menu.append(cut);
    menu.append(copy);
    menu.append(paste);
    //menu.append(openInNewTab);

    return menu;
};

