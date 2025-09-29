export declare class VkontakteAuthorizationError extends Error {
    type?: string;
    code: string;
    status: number;
    constructor(message: string, type?: string, code?: string, status?: number);
}
