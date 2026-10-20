import { ApiError } from './errors';

/**
 * Fetches a URL and resolves with its JSON body. Unlike Angular's `lazyFetch` it rejects with an
 * `ApiError` when the response is not ok, the body is not JSON, the body is `null`, or the body is an
 * object with an `error` field (node-hnapi answers unknown items with HTTP 200 `{"error": "..."}`).
 */
export async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
    let res: Response;
    try {
        res = await fetch(url, init);
    } catch (cause) {
        if (cause instanceof DOMException && cause.name === 'AbortError') throw cause;
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
        if (cause instanceof DOMException && cause.name === 'AbortError') throw cause;
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

/** Parses a route param (or number) into a positive integer, or `NaN` when invalid. */
export function toPositiveInt(value: number | string | null | undefined): number {
    if (typeof value === 'number') return Number.isInteger(value) && value > 0 ? value : NaN;
    if (typeof value !== 'string' || !/^\d+$/.test(value.trim())) return NaN;
    const n = Number(value.trim());
    return Number.isSafeInteger(n) && n > 0 ? n : NaN;
}
