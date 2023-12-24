"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assets_js_1 = require("../assets.js");
const dynReq = (typeof __webpack_require__ === "function" ? __non_webpack_require__ : require);
const BrowserWindow = dynReq("electron").BrowserWindow;
if (!BrowserWindow) {
    (0, assets_js_1.err)("error.state.invalid.electron");
}
exports.default = (auth, Windowproperties = (0, assets_js_1.getDefaultWinProperties)()) => {
    return new Promise((resolve, reject) => {
        var redirect = auth.createLink();
        const mainWindow = new BrowserWindow(Windowproperties);
        mainWindow.setMenu(null);
        mainWindow.loadURL(redirect);
        const contents = mainWindow.webContents;
        var loading = false;
        mainWindow.on("close", () => {
            if (!loading) {
                reject("error.gui.closed");
            }
        });
        contents.on("did-finish-load", () => {
            const loc = contents.getURL();
            if (loc.startsWith(auth.token.redirect)) {
                const urlParams = new URLSearchParams(loc.substr(loc.indexOf("?") + 1)).get("code");
                if (urlParams) {
                    resolve(urlParams);
                    loading = true;
                }
                try {
                    mainWindow.close();
                }
                catch {
                    require('../../../../libs/logger.js').error('file', "[MSMC]: Failed to close window!");
                }
            }
        });
    });
};
