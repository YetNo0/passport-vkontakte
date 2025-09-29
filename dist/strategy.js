"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VKStrategy = void 0;
const profile_1 = require("./profile");
const passport_oauth2_1 = require("passport-oauth2");
const vkontakte_token_error_1 = require("./errors/vkontakte-token-error");
const vkontakte_api_error_1 = require("./errors/vkontakte-api-error");
const crypto = __importStar(require("node:crypto"));
const PKCEStore = {};
class VKStrategy extends passport_oauth2_1.Strategy {
    constructor(options, verify) {
        options = options || {};
        options.authorizationURL = options.authorizationURL || 'https://id.vk.ru/authorize';
        options.tokenURL = options.tokenURL || 'https://id.vk.ru/oauth2/auth';
        options.scopeSeparator = options.scopeSeparator || ',';
        options.passReqToCallback = true;
        // @ts-ignore
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
    tokenParams(req) {
        const params = {};
        const state = req.query.state; // берём state из query редиректа
        if (!state)
            throw new Error('Missing state for PKCE token request');
        const code_verifier = PKCEStore[state];
        if (!code_verifier)
            throw new Error('Missing code_verifier for this state');
        delete PKCEStore[state];
        params.grant_type = 'authorization_code';
        params.code_verifier = code_verifier;
        return params;
    }
    authorizationParams(options) {
        const params = {};
        if (options.display) {
            params.display = options.display;
        }
        const code_verifier = crypto.randomBytes(64).toString('hex');
        const state = crypto.randomBytes(16).toString('hex');
        PKCEStore[state] = code_verifier;
        const hash = crypto.createHash('sha256').update(code_verifier).digest();
        const code_challenge = hash.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
        params.code_challenge = code_challenge;
        params.code_challenge_method = 'S256';
        params.state = state;
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
