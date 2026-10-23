import { ApiError, isAbortError } from './ApiError';

/**
 * `fetch` + `.json()` replacing Angular's RxJS `lazyFetch`. Cancellation goes through `init.signal`
 * (AbortController) and rejects with the original `AbortError`. Unlike `lazyFetch`, API quirks reject with an
 * `ApiError` instead of being emitted as data: network failure, `!res.ok`, a non-JSON body (HNPWA answers
 * unknown users with plain text), a `null` body, or node-hnapi's HTTP 200 `{"error": "... not found"}`.
 */
export async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
    let res: Response;
    try {
        res = await fetch(url, init);
    } catch (cause) {
        if (isAbortError(cause)) throw cause;
        throw new ApiError(`Network request failed: ${url}`, 'network', { url, cause });
    }

    if (!res.ok) {
        throw new ApiError(
            `Request failed with status ${res.status}: ${url}`,
            res.status === 404 ? 'not-found' : 'http',
            {
                status: res.status,
                url,
            }
        );
    }

    let text: string;
    try {
        text = await res.text();
    } catch (cause) {
        if (isAbortError(cause)) throw cause;
        throw new ApiError(`Network request failed: ${url}`, 'network', { status: res.status, url, cause });
    }

    let body: unknown;
    try {
        body = JSON.parse(text);
    } catch (cause) {
        throw new ApiError(`Response is not valid JSON: ${url}`, 'parse', { status: res.status, url, cause });
    }

    if (body === null || body === undefined) {
        throw new ApiError(`Empty response: ${url}`, 'empty', { status: res.status, url });
    }

    if (typeof body === 'object' && !Array.isArray(body) && 'error' in body && body.error) {
        const message = typeof body.error === 'string' ? body.error : `API error: ${url}`;
        throw new ApiError(message, /not found/i.test(message) ? 'not-found' : 'http', { status: res.status, url });
    }

    return body as T;
}

/** Parses a route param into a positive safe integer; anything else → `NaN`. */
export function toPositiveInt(value: number | string | null | undefined): number {
    if (typeof value === 'number') return Number.isSafeInteger(value) && value > 0 ? value : NaN;
    if (typeof value !== 'string' || !/^\d+$/.test(value.trim())) return NaN;
    const n = Number(value.trim());
    return Number.isSafeInteger(n) && n > 0 ? n : NaN;
}
