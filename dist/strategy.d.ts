import { Strategy as OAuth2Strategy } from 'passport-oauth2';
export interface VKOptions {
    clientID: string;
    clientSecret: string;
    callbackURL: string;
    scope?: string[];
    profileFields?: string[];
    apiVersion?: string;
    lang?: string;
    authorizationURL?: string;
    tokenURL?: string;
    scopeSeparator?: string;
    profileURL?: string;
    photoSize?: number;
    passReqToCallback?: boolean;
}
export interface VKProfile {
    provider: 'vkontakte';
    id: string;
    displayName: string;
    name: {
        familyName: string;
        givenName: string;
    };
    photos?: {
        value: string;
    }[];
    profileUrl?: string;
    _raw?: string | ArrayBuffer | Uint8Array;
    _json: any;
    emails?: {
        value: string;
    }[];
}
type VerifyFunction = (reqOrAccessToken: any, accessTokenOrRefreshToken: string, refreshTokenOrParams?: any, paramsOrProfile?: any, profileOrVerified?: VKProfile | ((err?: Error | null, user?: any, info?: any) => void), verified?: (err?: Error | null, user?: any, info?: any) => void) => void;
export declare class VKStrategy extends OAuth2Strategy {
    name: string;
    private readonly _profileURL;
    private _profileFields;
    private _apiVersion;
    private readonly lang;
    private readonly photoSize;
    constructor(options: VKOptions, verify: VerifyFunction);
    tokenParams(options: Record<string, any>): Record<string, string>;
    authorizationParams(options: Record<string, any>): Record<string, string>;
    userProfile(accessToken: string, done: (err: any, profile?: VKProfile) => void): void;
    parseErrorResponse(body: string, status: number): Error | null;
}
export {};
