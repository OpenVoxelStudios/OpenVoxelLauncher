"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.XPlayer = void 0;
const tslib_1 = require("tslib");
const node_fetch_1 = tslib_1.__importDefault(require("node-fetch"));
class XPlayer {
    auth;
    score;
    xuid;
    gamerTag;
    name;
    profilePictureURL;
    constructor(user, auth) {
        this.xuid = user.id;
        this.gamerTag = user.settings.find((s) => s.id == "Gamertag")?.value;
        this.name = user.settings.find((s) => s.id == "GameDisplayName")?.value;
        this.profilePictureURL = user.settings.find((s) => s.id == "GameDisplayPicRaw").value;
        this.score = user.settings.find((s) => s.id == "Gamerscore").value;
        this.auth = auth;
    }
    getFriends() {
        return this.auth.getFriends(this.xuid);
    }
}
exports.XPlayer = XPlayer;
class Social {
    auth;
    constructor(auth) {
        this.auth = auth;
    }
    async getProfile(xuid) {
        const profile = await this.xGet("/profile/settings?settings=GameDisplayName,GameDisplayPicRaw,Gamerscore,Gamertag", xuid);
        return new XPlayer(profile.profileUsers[0], this);
    }
    async getFriends(xuid) {
        const friends = await this.xGet("/profile/settings/people/people?settings=GameDisplayName,GameDisplayPicRaw,Gamerscore,Gamertag", xuid);
        let R = [];
        friends.profileUsers.forEach((element) => {
            R.push(new XPlayer(element, this));
        });
        return R;
    }
    async xGet(endpoint, xuid) {
        const target = xuid ? `xuid(${xuid})` : "me";
        let profileRaw = await (0, node_fetch_1.default)(`https://profile.xboxlive.com/users/${target}/${endpoint}`, {
            headers: {
                "Content-Type": "application/json",
                "x-xbl-contract-version": "2",
                Authorization: this.auth,
            },
        });
        return await profileRaw.json();
    }
}
exports.default = Social;
