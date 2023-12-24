import { GmllUser, MclcUser, MCProfile } from "../assets.js";
import Xbox from "./xbox.js";
import { Auth } from "./auth.js";
export interface MCJWTDecoded {
    xuid: string;
    agg: string;
    sub: string;
    nbf: number;
    auth: string;
    roles: [];
    iss: string;
    exp: number;
    iat: number;
    platform: string;
    yuid: string;
}
export declare type Entitlements = "game_minecraft" | "game_minecraft_bedrock" | "game_dungeons" | "product_minecraft" | "product_minecraft_bedrock" | "product_dungeons";
export interface MCToken {
    refresh?: string;
    mcToken: string;
    profile: MCProfile;
    xuid: string;
    exp: number;
}
/**Validates MC tokens to check if they're valid. */
export declare function validate(token: MCToken | Minecraft | MclcUser): boolean;
/**
 * Gets a minecraft token from a saved mcToken.
 * @param auth A new instance of the auth object
 * @param token The mcToken
 * @param refresh Set to true if we should try refreshing the token
 * @returns A newly serialized minecraft Token.
 *
 * @warning The xbox object may not be restored using this method!
 */
export declare function fromToken(auth: Auth, token: MCToken): null | Minecraft;
export declare function fromToken(auth: Auth, token: MCToken, refresh?: boolean): Promise<Minecraft>;
/**
 * Gets a minecraft token from a saved mcToken.
 * @param auth A new instance of the auth object
 * @param token The mcToken
 * @returns A newly serialized minecraft Token.
 *
 * @warning The xbox object may not be restored using this method!
 */
export declare function fromMclcToken(auth: Auth, token: MclcUser, refresh?: boolean): null | Minecraft | Promise<Minecraft>;
export default class Minecraft {
    readonly mcToken: string;
    readonly profile: MCProfile | undefined;
    readonly parent: Xbox | Auth;
    readonly xuid: string;
    readonly exp: number;
    refreshTkn: string;
    getToken(full: boolean): MCToken;
    constructor(mcToken: string, profile: MCProfile, parent: Xbox);
    constructor(mcToken: string, profile: MCProfile, parent: Auth, refreshTkn: string, exp: number);
    entitlements(): Promise<Entitlements[]>;
    isDemo(): boolean;
    /**
     * A MCLC user object for launching minecraft
     * @param refreshable Should we embed some metadata for refreshable tokens?
     * @returns returns an MCLC user token
     *
     */
    mclc(refreshable?: boolean): MclcUser;
    gmll(): GmllUser;
    refresh(force?: boolean): Promise<this>;
    validate(): boolean;
    _parseLoginToken(): MCJWTDecoded;
}
