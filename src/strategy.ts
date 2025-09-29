import { parse } from './profile';
import util from 'util';
import { Strategy as OAuth2Strategy, InternalOAuthError } from 'passport-oauth2';
import { VkontakteAuthorizationError } from './errors/vkontakte-authorization-error';
import { VkontakteTokenError } from './errors/vkontakte-token-error';
import { VkontakteAPIError } from './errors/vkontakte-api-error';

export interface VKOptions {
    clientID: string;
    clientSecret: string;
    callbackURL: string;
    scope?: string[];
    profileFields?: string[];
    apiVersion?: string;
    lang?: string;
    authorizationURL: string;
    tokenURL: string;
    scopeSeparator?: string;
    profileURL?: string;
    photoSize?: number;
    passReqToCallback?: false;
}

export interface VKProfile {
    provider: 'vkontakte';
    id: string;
    displayName: string;
    name: {
        familyName: string;
        givenName: string;
    };
    photos?: { value: string }[];
    profileUrl?: string;
    _raw?: string | ArrayBuffer | Uint8Array;
    _json: any;
    emails?: { value: string }[];
}

type VerifyFunction = (
    reqOrAccessToken: any,
    accessTokenOrRefreshToken: string,
    refreshTokenOrParams?: any,
    paramsOrProfile?: any,
    profileOrVerified?: VKProfile | ((err?: Error | null, user?: any, info?: any)  => void),
    verified?: (err?: Error | null, user?: any, info?: any) => void
) => void;

export class VKStrategy extends OAuth2Strategy {
    name = 'vkontakte';
    private readonly _profileURL: string = '';
    private _profileFields: string[] = [];
    private _apiVersion: string = '5.110';
    private readonly lang: string = 'en';
    private readonly photoSize: number = 200;

    constructor(options: VKOptions, verify: VerifyFunction) {
        options = options || {};
        options.authorizationURL = options.authorizationURL || 'https://oauth.vk.ru/authorize';
        options.tokenURL = options.tokenURL || 'https://oauth.vk.ru/access_token';
        options.scopeSeparator = options.scopeSeparator || ',';
        options.passReqToCallback = undefined;

        super(options, verifyWrapper(options, verify));

        this.lang = options.lang || 'en';
        this.photoSize = options.photoSize || 200;
        this._profileURL = options.profileURL || 'https://api.vk.ru/method/users.get';
        this._profileFields = options.profileFields || [];

        delete (options as any).lang;
        delete (options as any).photoSize;
    }

    authorizationParams(options: Record<string, any>) {
        const params: Record<string, string> = {};
        if (options.display) {
            params.display = options.display;
        }
        return params;
    }

    userProfile(accessToken: string, done: (err: any, profile?: VKProfile) => void) {
        let url = this._profileURL;

        const fields = [
            'uid',
            'first_name',
            'last_name',
            'screen_name',
            'sex',
            `photo_${this.photoSize}`,
        ];

        this._profileFields.forEach(f => {
            if (!fields.includes(f)) fields.push(f);
        });

        url += `?fields=${fields.join(',')}&v=${this._apiVersion}&https=1`;
        if (this.lang) url += `&lang=${this.lang}`;

        this._oauth2.getProtectedResource(url, accessToken, (err: any, body?: string | ArrayBuffer | Uint8Array ) => {
            if (err) return done(new InternalOAuthError('failed to fetch user profile', err));

            try {
                let json = JSON.parse(body as string);
                if (json.error) throw new VkontakteAPIError(json.error.error_msg, json.error.error_code);
                json = json.response[0];

                const profile = parse(json) as unknown as VKProfile;
                profile.provider = 'vkontakte';
                profile._raw = body;
                profile._json = json;

                done(null, profile);
            } catch (e) {
                done(e);
            }
        });
    }

    parseErrorResponse(body: string, status: number) {
        const json = JSON.parse(body);
        if (json.error && typeof json.error === 'object') {
            return new VkontakteTokenError(json.error.error_msg, json.error.error_code);
        }
        return super.parseErrorResponse(body, status);
    }
}

function verifyWrapper(options: VKOptions, verify: VerifyFunction): VerifyFunction {
    // @ts-ignore
    return function passportVerify(
        req: any,
        accessToken: string,
        refreshToken: string,
        params: any,
        profile: VKProfile,
        verified: (err?: Error | null, user?: any, info?: any) => void
    ) {
        if (params && params.email) {
            profile.emails = [{ value: params.email }];
        }

        const arity = verify.length;
        if (arity === 6) {
            verify(req, accessToken, refreshToken, params, profile, verified);
        } else if (arity === 5) {
            verify(accessToken, refreshToken, params, profile, verified);
        } else if (arity === 4) {
            verify(accessToken, refreshToken, profile, verified);
        } else {
            throw new Error(
                'VKontakteStrategy: verify callback must take 4, 5, or 6 parameters'
            );
        }
    };
}
