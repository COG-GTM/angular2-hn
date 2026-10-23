export type ApiErrorKind = 'network' | 'http' | 'not-found' | 'parse' | 'empty' | 'invalid-param';

/** Every rejection from `hnApi` (except an `AbortError` from cancellation) is an `ApiError`. */
export class ApiError extends Error {
    readonly kind: ApiErrorKind;
    readonly status?: number;
    readonly url?: string;

    constructor(message: string, kind: ApiErrorKind, options: { status?: number; url?: string; cause?: unknown } = {}) {
        super(message, { cause: options.cause });
        this.name = 'ApiError';
        this.kind = kind;
        this.status = options.status;
        this.url = options.url;
    }
}

export function isAbortError(error: unknown): boolean {
    return error instanceof DOMException && error.name === 'AbortError';
}
