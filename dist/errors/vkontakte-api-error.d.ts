export declare class VkontakteAPIError extends Error {
    code: number | string;
    status: number;
    constructor(message: string, code?: number | string, status?: number);
}
