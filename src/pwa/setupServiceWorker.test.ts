import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { RegisterSWOptions } from 'virtual:pwa-register';

import { IN_FLIGHT_WINDOW_MS, setupServiceWorker, warmRuntimeCache, type RegisterSW } from './setupServiceWorker';

const FEED = 'https://node-hnapi.herokuapp.com/news?page=1';
const entry = (name: string, startTime = 0) => ({ name, startTime }) as PerformanceEntry;

function stubPerformanceObserver() {
    const observer = {
        callback: undefined as PerformanceObserverCallback | undefined,
        observe: vi.fn(),
        disconnect: vi.fn(),
    };
    vi.stubGlobal(
        'PerformanceObserver',
        class {
            observe = observer.observe;
            disconnect = observer.disconnect;
            constructor(callback: PerformanceObserverCallback) {
                observer.callback = callback;
            }
        }
    );
    const emit = (entries: PerformanceEntry[]) =>
        observer.callback?.({ getEntries: () => entries } as PerformanceObserverEntryList, {} as PerformanceObserver);
    return { observer, emit };
}

function setup({ serviceWorker = true, onLine = true } = {}) {
    const listeners: Array<() => void> = [];
    const addEventListener = vi.fn((_type: string, listener: () => void) => listeners.push(listener));
    if (serviceWorker) {
        Object.defineProperty(navigator, 'serviceWorker', {
            configurable: true,
            value: { controller: null, addEventListener },
        });
    }
    vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(onLine);
    let options: RegisterSWOptions = {};
    const updateSW = vi.fn();
    const register = vi.fn<RegisterSW>((opts = {}) => {
        options = opts;
        return updateSW;
    });
    const logger = { info: vi.fn(), error: vi.fn() };
    const result = setupServiceWorker(register, { updateCheckIntervalMs: 1000, logger });
    const controllerChange = () => listeners.forEach((listener) => listener());
    return { register, updateSW, logger, result, addEventListener, controllerChange, options: () => options };
}

function fakeRegistration(overrides: Partial<ServiceWorkerRegistration> = {}) {
    return {
        installing: null,
        update: vi.fn().mockResolvedValue(undefined),
        ...overrides,
    } as unknown as ServiceWorkerRegistration;
}

describe('setupServiceWorker', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
        Reflect.deleteProperty(navigator, 'serviceWorker');
    });

    it('does nothing when service workers are unsupported', () => {
        const { register, result } = setup({ serviceWorker: false });
        expect(register).not.toHaveBeenCalled();
        expect(result).toBeUndefined();
    });

    it('registers immediately and returns the update function', () => {
        const { register, updateSW, result, options } = setup();
        expect(register).toHaveBeenCalledTimes(1);
        expect(options().immediate).toBe(true);
        expect(result).toBe(updateSW);
    });

    it('re-requests API responses that started before the SW took control, including in-flight ones', () => {
        const fetchMock = vi.fn().mockResolvedValue(new Response('[]'));
        vi.stubGlobal('fetch', fetchMock);
        vi.spyOn(performance, 'now').mockReturnValue(100);
        vi.spyOn(performance, 'getEntriesByType').mockReturnValue([
            entry(FEED, 10),
            entry('http://localhost:4173/assets/index.js', 5),
        ]);
        const { observer, emit } = stubPerformanceObserver();
        const { addEventListener, controllerChange } = setup();

        expect(addEventListener).toHaveBeenCalledWith('controllerchange', expect.any(Function));
        expect(fetchMock).not.toHaveBeenCalled();

        controllerChange();
        expect(fetchMock.mock.calls.map(([url]) => url)).toEqual([FEED]);
        expect(observer.observe).toHaveBeenCalledWith({ type: 'resource' });

        // In flight at control time → re-requested; started after control → already went through the SW.
        emit([entry(FEED, 10), entry('https://node-hnapi.herokuapp.com/item/1', 50), entry('https://x.test/a', 60)]);
        emit([entry('https://node-hnapi.herokuapp.com/item/2', 150)]);
        expect(fetchMock.mock.calls.map(([url]) => url)).toEqual([FEED, 'https://node-hnapi.herokuapp.com/item/1']);

        vi.advanceTimersByTime(IN_FLIGHT_WINDOW_MS);
        expect(observer.disconnect).toHaveBeenCalled();
    });

    it('warms again on a later controller change (SW update) without repeating URLs', () => {
        const fetchMock = vi.fn().mockResolvedValue(new Response('[]'));
        vi.stubGlobal('fetch', fetchMock);
        vi.stubGlobal('PerformanceObserver', undefined);
        vi.spyOn(performance, 'now').mockReturnValue(100);
        const entries = vi.spyOn(performance, 'getEntriesByType').mockReturnValue([entry(FEED)]);
        const { controllerChange } = setup();

        controllerChange();
        entries.mockReturnValue([entry(FEED), entry('https://api.hnpwa.com/v0/user/pg.json')]);
        controllerChange();
        expect(fetchMock.mock.calls.map(([url]) => url)).toEqual([FEED, 'https://api.hnpwa.com/v0/user/pg.json']);
    });

    it('polls for a new service worker while online', async () => {
        const { options } = setup();
        const registration = fakeRegistration();
        options().onRegisteredSW?.('/sw.js', registration);

        expect(registration.update).not.toHaveBeenCalled();
        await vi.advanceTimersByTimeAsync(1000);
        expect(registration.update).toHaveBeenCalledTimes(1);
        await vi.advanceTimersByTimeAsync(1000);
        expect(registration.update).toHaveBeenCalledTimes(2);
    });

    it('skips update checks while offline or while a worker is installing', async () => {
        const offline = setup({ onLine: false });
        const registration = fakeRegistration();
        offline.options().onRegisteredSW?.('/sw.js', registration);
        await vi.advanceTimersByTimeAsync(1000);
        expect(registration.update).not.toHaveBeenCalled();

        vi.clearAllTimers();
        const installing = setup();
        const busy = fakeRegistration({ installing: {} as ServiceWorker });
        installing.options().onRegisteredSW?.('/sw.js', busy);
        await vi.advanceTimersByTimeAsync(1000);
        expect(busy.update).not.toHaveBeenCalled();
    });

    it('does not poll without a registration', () => {
        const { options } = setup();
        expect(() => options().onRegisteredSW?.('/sw.js', undefined)).not.toThrow();
        expect(vi.getTimerCount()).toBe(0);
    });

    it('logs failed update checks instead of throwing', async () => {
        const { options, logger } = setup();
        const error = new Error('network');
        options().onRegisteredSW?.('/sw.js', fakeRegistration({ update: vi.fn().mockRejectedValue(error) }));
        await vi.advanceTimersByTimeAsync(1000);
        expect(logger.error).toHaveBeenCalledWith('Service worker update failed', error);
    });

    it('logs offline-ready and registration errors', () => {
        const { options, logger } = setup();
        options().onOfflineReady?.();
        expect(logger.info).toHaveBeenCalledWith('App is ready to work offline.');
        const error = new Error('blocked');
        options().onRegisterError?.(error);
        expect(logger.error).toHaveBeenCalledWith('Service worker registration failed', error);
    });
});

describe('warmRuntimeCache', () => {
    it('fetches each runtime-cached API URL once and ignores other resources', async () => {
        const entries = [
            FEED,
            FEED,
            'https://api.hnpwa.com/v0/user/pg.json',
            'http://localhost:4200/assets/index.js',
            'https://node-hnapi.herokuapp.com.evil.test/news',
        ].map((name) => entry(name));
        const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(new Response('{}'));
        const warmed = new Set<string>();

        await warmRuntimeCache(entries, fetchMock, warmed);
        await warmRuntimeCache(entries, fetchMock, warmed);

        expect(fetchMock.mock.calls.map(([url]) => url)).toEqual([FEED, 'https://api.hnpwa.com/v0/user/pg.json']);
    });

    it('settles when a request fails', async () => {
        const fetchMock = vi.fn<typeof fetch>().mockRejectedValue(new TypeError('offline'));
        await expect(warmRuntimeCache([entry(FEED)], fetchMock)).resolves.toEqual([
            { status: 'rejected', reason: expect.any(TypeError) },
        ]);
    });
});
