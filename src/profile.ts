export interface VKProfile {
    id: string | number;
    username?: string;
    displayName?: string;
    name: {
        familyName: string;
        givenName: string;
        middleName?: string;
    };
    gender?: "male" | "female";
    profileUrl?: string;
    photos: { value: string; type: string }[];
    city?: string;
    birthday?: string;
}

export interface VKApiResponse {
    id: string | number;
    screen_name?: string;
    first_name: string;
    last_name: string;
    nickname?: string;
    sex?: number;
    city?: { title: string };
    bdate?: string;
    [key: string]: any; // для динамических photo_*
}

export function parse(json: VKApiResponse | string): VKProfile {
    if (typeof json === "string") {
        json = JSON.parse(json)  as VKApiResponse;
    }

    const profile: VKProfile = {
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

    if (json.sex === 1) profile.gender = "female";
    else if (json.sex === 2) profile.gender = "male";

    profile.profileUrl = json.screen_name ? `http://vk.com/${json.screen_name}` : undefined;

    // собираем все поля, начинающиеся с "photo"
    for (const key in json) {
        if (!key.startsWith("photo")) continue;
        const value = json[key];
        if (value) {
            profile.photos.push({ value, type: key });
        }
    }

    if (json.city?.title) {
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
