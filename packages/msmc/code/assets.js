"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadLexiPack = exports.getDefaultWinProperties = exports.wrapError = exports.errResponse = exports.err = exports.lst = exports.lexicon = void 0;
const fs_1 = require("fs");
const path_1 = require("path");
exports.lexicon = {
    error: "An unknown error has occurred",
    "error.auth": "An unknown authentication error has occurred",
    "error.auth.microsoft": "Failed to login to Microsoft account",
    "error.auth.xboxLive": "Failed to login to Xbox Live",
    "error.auth.xsts": "Unknown error occurred when attempting to optain an Xbox Live Security Token",
    "error.auth.xsts.userNotFound": "The given Microsoft account doesn't have an Xbox account",
    "error.auth.xsts.bannedCountry": "The given Microsoft account is from a country where Xbox live is not available",
    "error.auth.xsts.child": "The account is a child (under 18) and cannot proceed unless the account is added to a Family account by an adult",
    "error.auth.xsts.child.SK": "South Korean law: Go to the Xbox page and grant parental rights to continue logging in.",
    "error.auth.minecraft": "Unknown error occurred when attempting to login to Minecraft",
    "error.auth.minecraft.login": "Failed to authenticate with Mojang with given Xbox account",
    "error.auth.minecraft.profile": "Failed to fetch minecraft profile",
    "error.auth.minecraft.entitlements": "Failed to fetch player entitlements",
    "error.gui": "An unknown gui framework error has occurred",
    "error.gui.closed": "Gui closed by user",
    "error.gui.raw.noBrowser": "no chromium browser was set, cannot continue!",
    "error.state.invalid": "[Internal]: Method not implemented.",
    "error.state.invalid.http": "[Internal]: Http server support not present in current environment.",
    "error.state.invalid.gui": "[Internal]: Invalid gui framework.",
    "error.state.invalid.redirect": "[Internal]: The token must have a redirect starting with 'http://localhost/' for this function to work!",
    "error.state.invalid.electron": "[Internal]: It seems you're attempting to load electron on the frontend. A critical function is missing!",
    load: "Generic load event",
    "load.auth": "Generic authentication load event",
    "load.auth.microsoft": "Logging into Microsoft account",
    "load.auth.xboxLive": "Logging into Xbox Live",
    "load.auth.xboxLive.1": "Logging into Xbox Live",
    "load.auth.xboxLive.2": "Authenticating with xbox live",
    "load.auth.xsts": "Generating Xbox Live Security Token",
    "load.auth.minecraft": "Generic Minecraft login flow event",
    "load.auth.minecraft.login": "Authenticating with Mojang's servers",
    "load.auth.minecraft.profile": "Fetching player profile",
    "load.auth.minecraft.gamepass": "[experimental!] Checking if a user has gamepass",
    gui: "Gui component",
    "gui.title": "Sign in to your account",
    "gui.market": "en-US",
};
function lst(lexcodes) {
    const lex = lexcodes.split(".");
    do {
        const l = lex.join(".");
        if (l in exports.lexicon) {
            return exports.lexicon[l];
        }
        lex.pop();
    } while (lex.length > 0);
    return lexcodes;
}
exports.lst = lst;
function err(ts) {
    require('../../../libs/logger').log('file', ts)
    throw ts;
}
exports.err = err;
function errResponse(response, ts) {
    if (!response.ok)
        throw { response, ts };
}
exports.errResponse = errResponse;
function wrapError(code) {
    let name;
    let opt;
    if (typeof code == "string") {
        name = code;
    }
    else {
        opt = code;
        name = opt.ts;
    }
    let message = lst(name || "error");
    return { name, opt, message };
}
exports.wrapError = wrapError;
function getDefaultWinProperties() {
    return {
        width: 500,
        height: 650,
        resizable: false,
        title: lst("gui.title"),
    };
}
exports.getDefaultWinProperties = getDefaultWinProperties;
function loadLexiPack(...file) {
    const pack = JSON.parse((0, fs_1.readFileSync)((0, path_1.join)(...file)).toString());
    exports.lexicon = pack;
    return pack;
}
exports.loadLexiPack = loadLexiPack;
