export class VkontakteTokenError extends Error {
    code: number | string;
    status: number;

    constructor(message: string, code: number | string = "api_error", status = 500) {
        super(message);
        this.name = "VkontakteTokenError";
        this.code = code;
        this.status = status;
        Error.captureStackTrace?.(this, VkontakteTokenError);
    }
}
