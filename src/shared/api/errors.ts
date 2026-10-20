export type ApiErrorKind = 'http' | 'parse' | 'empty' | 'not-found' | 'invalid-param' | 'network';

/** Every rejection from the shared API layer (except AbortError) is an `ApiError`. */
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

    /** Only network failures, 5xx and 429 are worth retrying; bad input, 4xx and bad bodies are not. */
    get retryable(): boolean {
        if (this.kind === 'network') return true;
        if (this.kind === 'http') return this.status === undefined || this.status >= 500 || this.status === 429;
        return false;
    }
}

export function isApiError(error: unknown): error is ApiError {
    return error instanceof ApiError;
}
