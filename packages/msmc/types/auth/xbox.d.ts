import { Lexcodes } from "../assets.js";
import { Auth, MSAuthToken } from "./auth.js";
import Social from "./social.js";
import Minecraft from "./minecraft.js";
export interface MCAuthToken {
    username: string;
    roles: [];
    access_token: string;
    token_type: string;
    expires_in: number;
}
export interface XblAuthToken {
    IssueInstant?: string;
    NotAfter?: string;
    Token: string;
    DisplayClaims?: {
        xui: [{
            uhs: string;
        }];
    };
}
export default class Xbox {
    readonly parent: Auth;
    readonly msToken: MSAuthToken;
    readonly xblToken: XblAuthToken;
    readonly exp: number;
    constructor(parent: Auth, MStoken: MSAuthToken, xblToken: XblAuthToken);
    load(code: Lexcodes): void;
    xAuth(RelyingParty?: string): Promise<string>;
    refresh(force?: boolean): Promise<this>;
    getSocial(): Promise<Social>;
    getMinecraft(): Promise<Minecraft>;
    validate(): boolean;
    /**
     * Feed this into the refresh funtion in the auth object that generated it.
     * @returns The refresh token
     */
    save(): string;
}
