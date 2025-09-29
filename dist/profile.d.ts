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
    photos: {
        value: string;
        type: string;
    }[];
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
    city?: {
        title: string;
    };
    bdate?: string;
    [key: string]: any;
}
export declare function parse(json: VKApiResponse | string): VKProfile;
