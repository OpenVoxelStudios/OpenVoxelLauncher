"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Auth = exports.Loader = void 0;
const tslib_1 = require("tslib");
const events_1 = tslib_1.__importDefault(require("events"));
const node_fetch_1 = tslib_1.__importDefault(require("node-fetch"));
const assets_js_1 = require("../assets.js");
function mojangAuthToken(prompt) {
    const token = {
        client_id: require('../../../../config.js').MicrosoftClientId,
        redirect: "https://login.live.com/oauth20_desktop.srf",
        prompt: prompt,
    };
    return token;
}
class Loader {
    auth;
    constructor(auth) {
        this.auth = auth;
    }
    load(code) {
        this.auth.emit("load", code);
    }
}
exports.Loader = Loader;
class Auth extends events_1.default {
    token;
    app;
    constructor(token) {
        super();
        if (!token) require('../../../../libs/logger.js').warn('file', "[MSMC]: Just a note. No prompt variable was specified. Assuming value to be 'login' to remain consistent with older releases")
        this.token = !token || typeof token == "string" ? mojangAuthToken(token || "login") : token;
    }
    createLink(redirect) {
        return ("https://login.live.com/oauth20_authorize.srf" +
            "?client_id=" +
            this.token.client_id +
            "&response_type=code" +
            "&redirect_uri=" +
            encodeURIComponent(redirect ? redirect : this.token.redirect) +
            "&scope=XboxLive.signin%20offline_access" +
            (this.token.prompt ? "&prompt=" + this.token.prompt : "") +
            "&mkt=" +
            (0, assets_js_1.lst)("gui.market"));
    }
    emit(eventName, ...args) {
        return super.emit(eventName, args[0], (0, assets_js_1.lst)(args[0]));
    }
    load(code) {
        this.emit("load", code);
    }
    login(code, redirect) {
        const body = "client_id=" +
            this.token.client_id +
            "&client_secret=" + require('../../../../config.js').MicrosoftClientSecret +
            "&code=" +
            code +
            "&grant_type=authorization_code" +
            "&redirect_uri=" +
            encodeURIComponent(redirect ? redirect : this.token.redirect);

        return this._get(body);
    }
    refresh(MS) {
        const refresh = typeof MS == "string" ? MS : MS.refresh_token;
        const body = "client_id=" +
            this.token.client_id +
            "&client_secret=" + require('../../../../config.js').MicrosoftClientSecret +
            "&refresh_token=" + encodeURIComponent(refresh) +
            "&grant_type=refresh_token";
        return this._get(body);
    }
    async launch(framework, windowProperties) {
        switch (framework) {
            case "raw":
                return await this.login(await require("../gui/raw.js").default(this, windowProperties));
            case "nwjs":
                return await this.login(await require("../gui/nwjs.js").default(this, windowProperties));
            case "electron":
                return await this.login(await require("../gui/electron.js").default(this, windowProperties));
            default:
                (0, assets_js_1.err)("error.state.invalid.gui");
        }
    }
    setServer(callback, redirect = "Thank you!", port = 0) {
        if (typeof redirect == "number")
            port = redirect;
        return new Promise(async (suc, err) => {
            let http;
            try {
                http = await Promise.resolve().then(() => tslib_1.__importStar(require("http")));
            }
            catch (er) {
                err("error.state.invalid.http");
            }
            if (this.token.redirect.startsWith("http://localhost/"))
                err("error.state.invalid.redirect");
            try {
                if (this.app) {
                    this.app.close();
                }
            }
            catch {
            }
            this.app = http.createServer(async (req, res) => {
                const lnk = `http://localhost:${req.socket.localPort}`;
                if (req.url.startsWith(`/link`)) {
                    res.writeHead(302, {
                        Location: this.createLink(lnk),
                    });
                    return res.end();
                }
                if (typeof redirect == "string" && redirect.startsWith("http")) {
                    res.writeHead(302, { Location: redirect });
                    res.end();
                }
                else {
                    res.writeHead(200, { "Content-Type": "text/plain" });
                    res.end("Thank you!");
                }
                if (req.url.includes("?")) {
                    const code = new URLSearchParams(req.url.substr(req.url.indexOf("?") + 1)).get("code");
                    try {
                        callback(await this.login(code, lnk));
                    }
                    catch (e) {
                        require('../../../../libs/logger.js').error('file', e)
                    }
                }
            });
            this.app.on("listening", () => {
                let f = this.app.address();
                if (typeof f == "string")
                    f = { port };
                suc({ link: `http://localhost:${f.port || port}/link`, port: f.port || port, server: this.app, auth: this });
            });
            this.app.listen(port);
        });
    }
    async _get(body) {
        this.load("load.auth.microsoft");
        var MS_Raw = await (0, node_fetch_1.default)("https://login.live.com/oauth20_token.srf", {
            method: "POST",
            body: body,
            headers: { "Content-Type": "application/x-www-form-urlencoded" }
        });
        
        (0, assets_js_1.errResponse)(MS_Raw, "error.auth.microsoft");
        var MS = await MS_Raw.json();
        this.load("load.auth.xboxLive.1");
        var rxboxlive = await (0, node_fetch_1.default)("https://user.auth.xboxlive.com/user/authenticate", {
            method: "post",
            body: JSON.stringify({
                Properties: {
                    AuthMethod: "RPS",
                    SiteName: "user.auth.xboxlive.com",
                    RpsTicket: `d=${MS.access_token}`,
                },
                RelyingParty: "http://auth.xboxlive.com",
                TokenType: "JWT",
            }),
            headers: { "Content-Type": "application/json", Accept: "application/json" },
        });
        (0, assets_js_1.errResponse)(rxboxlive, "error.auth.xboxLive");
    
        var token = await rxboxlive.json();
        return new (require("./xbox.js").default)(this, MS, token);
    }
}
exports.Auth = Auth;
exports.default = Auth;
