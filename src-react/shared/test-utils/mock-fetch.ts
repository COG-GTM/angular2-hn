import { vi, type Mock } from 'vitest';

/** What a responder may produce: a `Response` is used as-is, anything else is sent as HTTP 200 JSON. */
export type MockResponseValue = Response | unknown;

export type MockResponder =
    MockResponseValue | ((url: string, init?: RequestInit) => MockResponseValue | Promise<MockResponseValue>);

export interface MockFetchCall {
    url: string;
    init?: RequestInit;
}

export interface MockFetchHandle {
    fetch: Mock<(input: RequestInfo | URL, init?: RequestInit) => Promise<Response>>;
    /** Every request, in order. */
    calls: MockFetchCall[];
    /** URLs that had no responder (answered with 404 `Unmocked URL`). */
    unmatched: string[];
    callsTo: (url: string) => MockFetchCall[];
    restore: () => void;
}

export function jsonResponse(body: unknown, status = 200): Response {
    return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
}

export function textResponse(text: string, status = 200): Response {
    return new Response(text, { status, headers: { 'Content-Type': 'text/plain' } });
}

/** A promise you resolve later — return `d.promise` from a responder to hold a request open. */
export function deferred<T = unknown>() {
    let resolve!: (value: T) => void;
    let reject!: (reason?: unknown) => void;
    const promise = new Promise<T>((res, rej) => {
        resolve = res;
        reject = rej;
    });
    return { promise, resolve, reject };
}

function toUrl(input: RequestInfo | URL): string {
    if (typeof input === 'string') return input;
    if (input instanceof URL) return input.href;
    return input.url;
}

/**
 * Stubs global `fetch` with responders keyed by exact URL (see `apiUrls`). Function responders are
 * awaited, so returning a pending promise keeps the request (and the query) pending.
 * Call `restore()` or rely on `vi.unstubAllGlobals()` (done in the shared test setup).
 */
export function mockFetch(routes: Record<string, MockResponder>): MockFetchHandle {
    const calls: MockFetchCall[] = [];
    const unmatched: string[] = [];

    const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
        const url = toUrl(input);
        calls.push({ url, init });
        if (!Object.prototype.hasOwnProperty.call(routes, url)) {
            unmatched.push(url);
            return textResponse('Unmocked URL', 404);
        }
        const responder = routes[url];
        const value = typeof responder === 'function' ? await responder(url, init) : responder;
        if (value instanceof Response) return value.clone();
        return jsonResponse(value);
    });

    vi.stubGlobal('fetch', fetchMock);

    return {
        fetch: fetchMock,
        calls,
        unmatched,
        callsTo: (url) => calls.filter((call) => call.url === url),
        restore: () => vi.unstubAllGlobals(),
    };
}
