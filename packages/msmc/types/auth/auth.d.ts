/// <reference types="node" />
/// <reference types="node" />
import EventEmitter from "events";
import { Lexcodes, WindowProperties } from "../assets.js";
import type Xbox from "./xbox.js";
import type { Server } from "http";
/**
 * This library's supported gui frameworks.
 * (Raw requires no extra dependencies, use it if you're using some unknown framework!)
 */
export declare type Framework = "electron" | "nwjs" | "raw";
/**
 * For more information. Check out Microsoft's support page: https://docs.microsoft.com/en-us/azure/active-directory/develop/v2-oauth2-auth-code-flow#request-an-authorization-code <br>
 *
 * Basically this is the prompt value in the request sent to Microsoft. This should only be important if you're using either the fastLaunch or launch functions under either Electron or NW.js
 */
export declare type Prompt = "login" | "none" | "consent" | "select_account";
/**
 * The Oauth2 details needed to log you in.
 *
 * Resources
 * 1) https://docs.microsoft.com/en-us/graph/auth-register-app-v2
 * 2) https://docs.microsoft.com/en-us/graph/auth-v2-user#1-register-your-app
 * 3) https://portal.azure.com/#blade/Microsoft_AAD_IAM/ActiveDirectoryMenuBlade/RegisteredApps
 *
 */
export interface MSToken {
    client_id: string;
    redirect: string;
    clientSecret?: string;
    prompt?: Prompt;
}
export interface MSAuthToken {
    token_type: string;
    expires_in: number;
    scope: string;
    access_token: string;
    refresh_token: string;
    user_id: string;
    foci: string;
}
export declare class Loader {
    auth: Auth;
    constructor(auth: Auth);
    load(code: Lexcodes): void;
}
export declare interface Auth extends EventEmitter {
    on(event: "load", listener: (asset: Lexcodes, message: string) => void): this;
    once(event: "load", listener: (asset: Lexcodes, message: string) => void): this;
    emit(event: "load", asset: Lexcodes): boolean;
}
export declare class Auth extends EventEmitter {
    token: MSToken;
    private app;
    constructor(prompt?: Prompt);
    constructor(token: MSToken);
    createLink(redirect?: string): string;
    load(code: Lexcodes): void;
    login(code: string, redirect?: string): Promise<Xbox>;
    refresh(MS: MSAuthToken): Promise<Xbox>;
    refresh(refreshToken: string): Promise<Xbox>;
    launch(framework: Framework, windowProperties?: WindowProperties): Promise<Xbox>;
    /**
     * Used for a console like login experience.
     * @param callback
     * @param port
     * @returns
     */
    setServer(callback: (xbox: Xbox) => void, redirect?: string, port?: number): Promise<{
        link: string;
        port: number;
        server: Server;
        auth: Auth;
    }>;
    private _get;
}
export default Auth;
