export declare class XPlayer {
    auth: Social;
    score: number;
    xuid: string;
    gamerTag: string;
    name: string;
    profilePictureURL: string;
    constructor(user: {
        id: string;
        settings: any[];
    }, auth: Social);
    getFriends(): Promise<XPlayer[]>;
}
export default class Social {
    auth: string;
    constructor(auth: string);
    getProfile(xuid?: string): Promise<XPlayer>;
    getFriends(xuid?: string): Promise<XPlayer[]>;
    xGet(endpoint: string, xuid?: string): Promise<any>;
}
