"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assets_js_1 = require("../assets.js");
exports.default = (auth, Windowproperties = (0, assets_js_1.getDefaultWinProperties)()) => {
    return new Promise((resolve, rejects) => {
        var redirect = auth.createLink();
        nw.Window.open(redirect, Windowproperties, function (new_win) {
            new_win.on("close", function () {
                rejects("error.gui.closed");
                new_win.close(true);
            });
            new_win.on("loaded", function () {
                const loc = new_win.window.location.href;
                if (loc.startsWith(auth.token.redirect)) {
                    const urlParams = new URLSearchParams(loc.substr(loc.indexOf("?") + 1)).get("code");
                    if (urlParams) {
                        resolve(urlParams);
                    }
                    else {
                        rejects("error.gui.closed");
                    }
                    try {
                        new_win.close(true);
                    }
                    catch {
                        require('../../../../libs/logger.js').error('file', "[MSMC]: Failed to close window!");
                    }
                    return true;
                }
                return false;
            });
        });
    });
};
