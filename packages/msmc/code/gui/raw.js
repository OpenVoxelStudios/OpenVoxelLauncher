"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const path_1 = tslib_1.__importDefault(require("path"));
const fs_1 = tslib_1.__importDefault(require("fs"));
const os_1 = tslib_1.__importDefault(require("os"));
const temp = path_1.default.join(os_1.default.tmpdir(), "msmc");
const child_process_1 = require("child_process");
const assets_js_1 = require("../assets.js");
const node_fetch_1 = tslib_1.__importDefault(require("node-fetch"));
var firefox = false;
var start;
require('../../../../libs/logger.js').log('file', "[MSMC]: OS Type => " + os_1.default.type());
switch (os_1.default.type()) {
    case "Windows_NT":
        const pathsW = ["HKEY_LOCAL_MACHINE", "HKEY_CURRENT_USER"];
        const compatibleW = ["chrome.exe", "vivaldi.exe", "brave.exe", "blisk.exe", "msedge.exe"];
        WE: {
            for (var i2 = 0; i2 < compatibleW.length; i2++) {
                for (var i = 0; i < pathsW.length; i++) {
                    const locW = pathsW[i] + "\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\App Paths\\";
                    try {
                        require('../../../../libs/logger.js').log('file', 'reg query "' + locW + compatibleW[i2] + '"');
                        var out = (0, child_process_1.execSync)('"C:\\Windows\\System32\\reg.exe" query "' + locW + compatibleW[i2] + '"').toString();
                        if (!out.startsWith("ERROR")) {
                            out = out.substring(out.indexOf("REG_SZ") + "REG_SZ".length).trim();
                            if (out.indexOf("\n") > 0)
                                out = out.substring(0, out.indexOf("\n") - 1);
                            if (fs_1.default.existsSync(out)) {
                                start = out;
                                break WE;
                            }
                            else require('../../../../libs/logger.js').log('file', "[MSMC]: cannot find " + out);
                        }
                    }
                    catch { }
                }
            }
            require('../../../../libs/logger.js').error('file', "[MSMC]: No Chromium browser was found");
        }
        break;
    case "Darwin":
        const locD = "/Applications/{0}.app/Contents/MacOS/{0}";
        const compatibleD = [
            "Google\\ Chrome",
            "Google Chrome",
            "Microsoft\\ Edge",
            "Microsoft Edge",
            "Vivaldi",
            "Blisk",
            "Brave\\ Browser",
            "Brave Browser",
            "Yandex",
        ];
        for (var i2 = 0; i2 < compatibleD.length; i2++) {
            const s = locD.replace(/\{0\}/g, compatibleD[i2]);
            if (fs_1.default.existsSync(s)) {
                start = s;
                break;
            }
        }
        if (start)
            break;
    case "Linux":
    default:
        const pathsL = process.env.PATH.split(":");
        const edd = ["", "-stable", "-beta", "-dev", "-g4", "-browser"];
        const compatibleL = [
            "chromium",
            "google-chrome",
            "microsoft-edge",
            "vivaldi",
            "brave-browser",
            "blisk-browser",
            "yandex-browser",
            "waterfox",
            "firefox",
        ];
        const ffox = ["firefox", "waterfox"];
        LE: {
            for (var i2 = 0; i2 < compatibleL.length; i2++) {
                for (var i3 = 0; i3 < edd.length; i3++) {
                    for (var i = 0; i < pathsL.length; i++) {
                        const s = path_1.default.join(pathsL[i], compatibleL[i2] + edd[i3]);
                        if (fs_1.default.existsSync(s)) {
                            start = s;
                            firefox = ffox.includes(compatibleL[i2]);
                            break LE;
                        }
                    }
                }
            }
            require('../../../../libs/logger.js').error('file', "[MSMC]: No compatible browser was found");
        }
}
function browserLoop(auth, port, browser) {
    return new Promise((resolve, error) => {
        const call = () => {
            try {
                clearInterval(f3);
                process.removeListener("exit", call);
                if (os_1.default.type() == "Windows_NT") {
                    (0, child_process_1.execSync)("taskkill /pid " + browser.pid);
                }
                else {
                    browser.kill();
                }
            }
            catch {
                require('../../../../libs/logger.js').error('file', "[MSMC]: Failed to close window!");
            }
        };
        process.on("exit", call);
        const f3 = setInterval(() => {
            (0, node_fetch_1.default)("http://127.0.0.1:" + port + "/json/list")
                .then((r) => r.json())
                .then((out) => {
                for (var i = 0; i < out.length; i++) {
                    const loc = out[i].url;
                    if (loc && loc.startsWith(auth.token.redirect)) {
                        const urlParams = new URLSearchParams(loc.substr(loc.indexOf("?") + 1)).get("code");
                        if (urlParams)
                            resolve(urlParams);
                        else
                            error("error.gui.closed");
                        call();
                    }
                }
            })
                .catch((err) => {
                call();
                require('../../../../libs/logger.js').error('file', "[MSMC]: " + err);
                error("error.gui.closed");
            });
        }, 500);
    });
}
exports.default = (auth, Windowproperties = (0, assets_js_1.getDefaultWinProperties)()) => {
    const cmd = Windowproperties.browserCMD ? Windowproperties.browserCMD : start;
    if (!cmd) {
        (0, assets_js_1.err)("error.gui.raw.noBrowser");
    }
    require('../../../../libs/logger.js').log('file', '[MSMC]: Using "' + cmd + '"');
    var redirect = auth.createLink();
    return new Promise((resolve, error) => {
        var browser;
        if (firefox || Windowproperties.firefox) {
            require('../../../../libs/logger.js').log('file', "[MSMC]: Using firefox fallback {Linux only!}");
            if (fs_1.default.existsSync(temp))
                (0, child_process_1.execSync)("rm -R " + temp);
            fs_1.default.mkdirSync(temp);
            browser = (0, child_process_1.spawn)(cmd, ["--profile", temp, "-kiosk", redirect, "--remote-debugging-port=0", "--new-instance"]);
        }
        else
            browser = (0, child_process_1.spawn)(cmd, [
                "--disable-restore-session-state",
                "--disable-first-run-ui",
                "--disable-component-extensions-with-background-pages",
                "--no-first-run",
                "--disable-extensions",
                "--window-size=" + Windowproperties.width + "," + Windowproperties.height,
                "--remote-debugging-port=0",
                "--no-default-browser-check",
                "--user-data-dir=" + temp,
                "--force-app-mode",
                "--app=" + redirect,
            ]);
        var firstrun = true;
        const ouput = (out) => {
            const cout = String(out.toString()).toLocaleLowerCase().trim();
            require('../../../../libs/logger.js').log('file', "[MSMC][Browser]: " + cout);
            if (firstrun && cout.startsWith("devtools listening on ws://")) {
                firstrun = false;
                var data = cout.substring("devtools listening on ws://".length);
                const n = data.indexOf(":") + 1;
                const port = data.substring(n, data.indexOf("/"));
                require('../../../../libs/logger.js').log('file', "[MSMC]: Debug hook => http://127.0.0.1:" + port);
                browserLoop(auth, port, browser).then(resolve).catch(error);
            }
        };
        if (!Windowproperties.suppress) {
            browser.stdout.on("data", ouput);
            browser.stderr.on("data", ouput);
        }
    });
};
