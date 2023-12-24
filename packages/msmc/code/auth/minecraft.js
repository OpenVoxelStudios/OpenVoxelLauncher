"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fromMclcToken = exports.fromToken = exports.validate = void 0;
const tslib_1 = require("tslib");
const node_fetch_1 = tslib_1.__importDefault(require("node-fetch"));
const assets_js_1 = require("../assets.js");
const auth_js_1 = require("./auth.js");
function validate(token) {
    if ("exp" in token)
        return typeof token.exp == "number" && token.exp > Date.now();
    else if ("meta" in token && "exp" in token.meta)
        return typeof token.meta.exp == "number" && token.meta.exp > Date.now();
    return false;
}
exports.validate = validate;
function fromToken(auth, token, refresh) {
    if (validate(token) && refresh)
        return new Promise(async (done) => {
            const xbl = await auth.refresh(token.refresh);
            done(await xbl.getMinecraft());
        });
    let mc = new Minecraft(token.mcToken, token.profile, auth, token.refresh, token.exp);
    return mc;
}
exports.fromToken = fromToken;
function fromMclcToken(auth, token, refresh) {
    return fromToken(auth, {
        mcToken: token.access_token,
        refresh: token.meta?.refresh,
        exp: token.meta?.exp,
        profile: { id: token.uuid, name: token.name },
        xuid: token.meta?.xuid,
    }, refresh);
}
exports.fromMclcToken = fromMclcToken;
class Minecraft {
    mcToken;
    profile;
    parent;
    xuid;
    exp;
    refreshTkn;
    getToken(full) {
        return {
            refresh: this.parent instanceof auth_js_1.Auth ? this.refreshTkn : this.parent?.msToken?.refresh_token,
            mcToken: this.mcToken,
            profile: full ? this.profile : { name: this.profile.name, id: this.profile.id, demo: this.profile.demo },
            xuid: this.xuid,
            exp: this.exp,
        };
    }
    constructor(mcToken, profile, parent, refreshTkn, exp = new Date().getTime() + 1000 * 60 * 60 * 23) {
        this.parent = parent;
        this.mcToken = mcToken;
        this.profile = profile;
        this.xuid = this._parseLoginToken().xuid;
        this.exp = exp;
        this.refreshTkn = refreshTkn;
    }
    async entitlements() {
        var r998 = await (0, node_fetch_1.default)("https://api.minecraftservices.com/minecraft/profile", {
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
                Authorization: `Bearer ${this.mcToken}`,
            },
        });
        (0, assets_js_1.errResponse)(r998, "error.auth.minecraft.entitlements");
        const json = (await r998.json());
        const r = [];
        json.items.forEach((e) => {
            r.push(e.name);
        });
        return r;
    }
    isDemo() {
        return this.profile.demo;
    }
    mclc(refreshable) {
        return {
            access_token: this.mcToken,
            client_token: getUUID(),
            uuid: this.profile.id,
            name: this.profile.name,
            meta: {
                xuid: this.xuid,
                type: "msa",
                demo: this.profile.demo,
                exp: this.exp,
                refresh: refreshable ? (this.parent instanceof auth_js_1.Auth ? this.refreshTkn : this.parent.msToken.refresh_token) : undefined,
            },
            user_properties: {},
        };
    }
    gmll() {
        return {
            profile: {
                id: this.profile.id,
                name: this.profile.name,
                xuid: this.xuid,
                type: "msa",
                demo: this.profile.demo,
            },
            access_token: this.mcToken,
        };
    }
    async refresh(force) {
        this.parent = this.parent instanceof auth_js_1.Auth ? await this.parent.refresh(this.refreshTkn) : await this.parent.refresh(force);
        if (this.validate() && !force)
            return this;
        let tkn = await this.parent.getMinecraft();
        Object.keys(tkn).forEach((e) => {
            this[e] = tkn[e];
        });
        return this;
    }
    validate() {
        return validate(this);
    }
    _parseLoginToken() {
        var base64Url = this.mcToken.split(".")[1];
        var base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
        var jsonPayload = decodeURIComponent(Buffer.from(base64, "base64")
            .toString("utf8")
            .split("")
            .map(function (c) {
            return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
        })
            .join(""));
        return JSON.parse(jsonPayload);
    }
}
exports.default = Minecraft;
function getUUID() {
    var result = "";
    for (var i = 0; i <= 4; i++) {
        result += (Math.floor(Math.random() * 16777216) + 1048576).toString(16);
        if (i < 4)
            result += "-";
    }
    return result;
}
