import Auth from "./auth/auth.js";
import * as assets from "./assets.js";
import { wrapError, lst } from "./assets.js";
import Social from "./auth/social.js";
import type Xbox from "./auth/xbox.js";
import type Minecraft from "./auth/minecraft.js";
import { fromToken, fromMclcToken, validate, MCToken } from "./auth/minecraft.js";
export { Social, Auth, assets, wrapError, lst };
export declare const mcTokenToolbox: {
    fromToken: typeof fromToken;
    fromMclcToken: typeof fromMclcToken;
    validate: typeof validate;
};
export type { Xbox, Minecraft, MCToken };
