"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parse = void 0;
function parse(json) {
    var _a;
    if (typeof json === "string") {
        json = JSON.parse(json);
    }
    const profile = {
        id: json.id,
        username: json.screen_name,
        displayName: `${json.first_name} ${json.last_name}`,
        name: {
            familyName: json.last_name,
            givenName: json.first_name,
        },
        photos: [],
    };
    if (json.nickname) {
        profile.name.middleName = json.nickname;
    }
    if (json.sex === 1)
        profile.gender = "female";
    else if (json.sex === 2)
        profile.gender = "male";
    profile.profileUrl = json.screen_name ? `http://vk.com/${json.screen_name}` : undefined;
    // собираем все поля, начинающиеся с "photo"
    for (const key in json) {
        if (!key.startsWith("photo"))
            continue;
        const value = json[key];
        if (value) {
            profile.photos.push({ value, type: key });
        }
    }
    if ((_a = json.city) === null || _a === void 0 ? void 0 : _a.title) {
        profile.city = json.city.title;
    }
    if (json.bdate) {
        const bdate = /^(\d+)\.(\d+)\.(\d+)$/.exec(json.bdate);
        if (bdate) {
            const day = bdate[1].padStart(2, "0");
            const month = bdate[2].padStart(2, "0");
            const year = bdate[3];
            profile.birthday = `${year}-${month}-${day}`;
        }
    }
    return profile;
}
exports.parse = parse;
