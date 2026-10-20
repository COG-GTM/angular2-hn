import { vi, type Mock } from 'vitest';

/** What a responder may produce: a `Response` is used as-is, anything else is sent as HTTP 200 JSON. */
export type MockResponseValue = Response | unknown;

/**
 * A static value, or a function called per request. Function results are awaited, so returning a
 * pending promise (e.g. `deferred().promise`) holds the request — and the query — open.
 */
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
    /** Add or replace responders after setup. */
    set: (url: string, responder: MockResponder) => void;
    restore: () => void;
}

export function jsonResponse(body: unknown, status = 200): Response {
    return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
}

export function textResponse(text: string, status = 200): Response {
    return new Response(text, { status, headers: { 'Content-Type': 'text/plain' } });
}

/** A promise you settle later — return `d.promise` from a responder to hold a request open. */
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

function abortError(): DOMException {
    return new DOMException('The operation was aborted.', 'AbortError');
}

/**
 * Stubs global `fetch` with responders keyed by exact URL (build keys with `apiUrls`). Unknown URLs get
 * 404 `Unmocked URL`. Honors `init.signal` (rejects with AbortError). Undone by `restore()` or by the
 * shared setup's `vi.unstubAllGlobals()` after each test.
 */
export function mockFetch(routes: Record<string, MockResponder> = {}): MockFetchHandle {
    const table = new Map<string, MockResponder>(Object.entries(routes));
    const calls: MockFetchCall[] = [];
    const unmatched: string[] = [];

    const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
        const url = toUrl(input);
        calls.push({ url, init });
        const signal = init?.signal;
        if (signal?.aborted) throw abortError();
        if (!table.has(url)) {
            unmatched.push(url);
            return textResponse('Unmocked URL', 404);
        }
        const responder = table.get(url);
        const pending = Promise.resolve(typeof responder === 'function' ? responder(url, init) : responder);
        const value = signal
            ? await Promise.race([
                  pending,
                  new Promise<never>((_, reject) =>
                      signal.addEventListener('abort', () => reject(abortError()), { once: true })
                  ),
              ])
            : await pending;
        if (value instanceof Response) return value.clone();
        return jsonResponse(value);
    });

    vi.stubGlobal('fetch', fetchMock);

    return {
        fetch: fetchMock,
        calls,
        unmatched,
        callsTo: (url) => calls.filter((call) => call.url === url),
        set: (url, responder) => void table.set(url, responder),
        restore: () => vi.unstubAllGlobals(),
    };
}
