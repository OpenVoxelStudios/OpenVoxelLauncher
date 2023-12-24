import type { Response } from "node-fetch";
/**
 * A copy of the user object mclc uses
 */
export declare type MclcUser = {
    access_token: string;
    client_token?: string;
    uuid: string;
    name?: string;
    meta?: {
        refresh: string;
        exp?: number;
        type: "mojang" | "msa" | "legacy";
        xuid?: string;
        demo?: boolean;
    };
    user_properties?: Partial<any>;
};
/**
 * If the exact code isn't founnd. The lexicon string is split up and shaved down till it finds a description for the code.
 *
 * For example; error.auth.microsoft will be shortend to error.auth if error.auth.microsoft isn't found
 */
export declare let lexicon: {
    error: string;
    "error.auth": string;
    "error.auth.microsoft": string;
    "error.auth.xboxLive": string;
    "error.auth.xsts": string;
    "error.auth.xsts.userNotFound": string;
    "error.auth.xsts.bannedCountry": string;
    "error.auth.xsts.child": string;
    "error.auth.xsts.child.SK": string;
    "error.auth.minecraft": string;
    "error.auth.minecraft.login": string;
    "error.auth.minecraft.profile": string;
    "error.auth.minecraft.entitlements": string;
    "error.gui": string;
    "error.gui.closed": string;
    "error.gui.raw.noBrowser": string;
    "error.state.invalid": string;
    "error.state.invalid.http": string;
    "error.state.invalid.gui": string;
    "error.state.invalid.redirect": string;
    "error.state.invalid.electron": string;
    load: string;
    "load.auth": string;
    "load.auth.microsoft": string;
    "load.auth.xboxLive": string;
    "load.auth.xboxLive.1": string;
    "load.auth.xboxLive.2": string;
    "load.auth.xsts": string;
    "load.auth.minecraft": string;
    "load.auth.minecraft.login": string;
    "load.auth.minecraft.profile": string;
    "load.auth.minecraft.gamepass": string;
    gui: string;
    "gui.title": string;
    "gui.market": string;
};
export declare type Lexcodes = keyof typeof lexicon;
export declare function lst(lexcodes: Lexcodes): any;
export interface ExptOpts {
    ts: Lexcodes;
    response: Response;
}
export declare function err(ts: Lexcodes): void;
export declare function errResponse(response: Response, ts: Lexcodes): void;
export declare function wrapError(code: string | ExptOpts | any): {
    name: "error" | "error.auth" | "error.auth.microsoft" | "error.auth.xboxLive" | "error.auth.xsts" | "error.auth.xsts.userNotFound" | "error.auth.xsts.bannedCountry" | "error.auth.xsts.child" | "error.auth.xsts.child.SK" | "error.auth.minecraft" | "error.auth.minecraft.login" | "error.auth.minecraft.profile" | "error.auth.minecraft.entitlements" | "error.gui" | "error.gui.closed" | "error.gui.raw.noBrowser" | "error.state.invalid" | "error.state.invalid.http" | "error.state.invalid.gui" | "error.state.invalid.redirect" | "error.state.invalid.electron" | "load" | "load.auth" | "load.auth.microsoft" | "load.auth.xboxLive" | "load.auth.xboxLive.1" | "load.auth.xboxLive.2" | "load.auth.xsts" | "load.auth.minecraft" | "load.auth.minecraft.login" | "load.auth.minecraft.profile" | "load.auth.minecraft.gamepass" | "gui" | "gui.title" | "gui.market";
    opt: ExptOpts;
    message: any;
};
/**
 * Used by graphical Electron and NW.js integrations to set the properties of the generated pop-up
 */
export interface WindowProperties {
    width: number;
    height: number;
    /**Raw ignores this property!*/
    resizable?: boolean;
    /**Raw only: Stops MSMC from passing through the browser console log*/
    suppress?: boolean;
    [key: string]: any;
}
export interface MCProfile {
    id: string;
    name: string;
    skins?: Array<{
        id: string;
        state: "ACTIVE";
        url: string;
        variant: "SLIM" | "CLASSIC";
    }>;
    capes?: Array<{
        id: string;
        state: "ACTIVE";
        url: string;
        alias: string;
    }>;
    demo?: boolean;
}
export interface GmllUser {
    profile: {
        id: string;
        name: string;
        xuid?: string;
        type?: "mojang" | "msa" | "legacy";
        demo?: boolean;
        properties?: {
            twitch_access_token: string;
        };
    };
    access_token?: string;
}
export declare function getDefaultWinProperties(): WindowProperties;
export declare function loadLexiPack(...file: string[]): typeof lexicon;
