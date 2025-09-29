export class VkontakteAuthorizationError extends Error {
    type?: string;
    code: string;
    status: number;

    constructor( message: string, type?: string, code: string = "server_error", status: number = 500) {
        super(message);
        this.name = "VkontakteAuthorizationError";
        this.type = type;
        this.code = code;
        this.status = status;
        Error.captureStackTrace?.(this, VkontakteAuthorizationError);
    }
}
