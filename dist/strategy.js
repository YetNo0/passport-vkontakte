"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VKStrategy = void 0;
const profile_1 = require("./profile");
const passport_oauth2_1 = require("passport-oauth2");
const vkontakte_token_error_1 = require("./errors/vkontakte-token-error");
const vkontakte_api_error_1 = require("./errors/vkontakte-api-error");
class VKStrategy extends passport_oauth2_1.Strategy {
    constructor(options, verify) {
        options = options || {};
        options.authorizationURL = options.authorizationURL || 'https://oauth.vk.ru/authorize';
        options.tokenURL = options.tokenURL || 'https://oauth.vk.ru/access_token';
        options.scopeSeparator = options.scopeSeparator || ',';
        options.passReqToCallback = undefined;
        super(options, verifyWrapper(options, verify));
        this.name = 'vkontakte';
        this._profileURL = '';
        this._profileFields = [];
        this._apiVersion = '5.110';
        this.lang = 'en';
        this.photoSize = 200;
        this.lang = options.lang || 'en';
        this.photoSize = options.photoSize || 200;
        this._profileURL = options.profileURL || 'https://api.vk.ru/method/users.get';
        this._profileFields = options.profileFields || [];
        delete options.lang;
        delete options.photoSize;
    }
    authorizationParams(options) {
        const params = {};
        if (options.display) {
            params.display = options.display;
        }
        return params;
    }
    userProfile(accessToken, done) {
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
            if (!fields.includes(f))
                fields.push(f);
        });
        url += `?fields=${fields.join(',')}&v=${this._apiVersion}&https=1`;
        if (this.lang)
            url += `&lang=${this.lang}`;
        this._oauth2.getProtectedResource(url, accessToken, (err, body) => {
            if (err)
                return done(new passport_oauth2_1.InternalOAuthError('failed to fetch user profile', err));
            try {
                let json = JSON.parse(body);
                if (json.error)
                    throw new vkontakte_api_error_1.VkontakteAPIError(json.error.error_msg, json.error.error_code);
                json = json.response[0];
                const profile = (0, profile_1.parse)(json);
                profile.provider = 'vkontakte';
                profile._raw = body;
                profile._json = json;
                done(null, profile);
            }
            catch (e) {
                done(e);
            }
        });
    }
    parseErrorResponse(body, status) {
        const json = JSON.parse(body);
        if (json.error && typeof json.error === 'object') {
            return new vkontakte_token_error_1.VkontakteTokenError(json.error.error_msg, json.error.error_code);
        }
        return super.parseErrorResponse(body, status);
    }
}
exports.VKStrategy = VKStrategy;
function verifyWrapper(options, verify) {
    // @ts-ignore
    return function passportVerify(req, accessToken, refreshToken, params, profile, verified) {
        if (params && params.email) {
            profile.emails = [{ value: params.email }];
        }
        const arity = verify.length;
        if (arity === 6) {
            verify(req, accessToken, refreshToken, params, profile, verified);
        }
        else if (arity === 5) {
            verify(accessToken, refreshToken, params, profile, verified);
        }
        else if (arity === 4) {
            verify(accessToken, refreshToken, profile, verified);
        }
        else {
            throw new Error('VKontakteStrategy: verify callback must take 4, 5, or 6 parameters');
        }
    };
}
