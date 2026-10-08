import type { RegisterSWOptions } from 'virtual:pwa-register';

import { IN_FLIGHT_WINDOW_MS, registerServiceWorker, warmRuntimeCache, type RegisterSW } from './registerSW';

const entry = (name: string, startTime = 0) => ({ name, startTime }) as PerformanceEntry;

function stubResourceEntries(entries: PerformanceEntry[]) {
    vi.spyOn(performance, 'getEntriesByType').mockReturnValue(entries);
}

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
    return {
        observer,
        emit: (entries: PerformanceEntry[]) =>
            observer.callback?.(
                { getEntries: () => entries } as PerformanceObserverEntryList,
                {} as PerformanceObserver
            ),
    };
}

function setup({ serviceWorker = true, onLine = true, controller = null as ServiceWorker | null } = {}) {
    const addEventListener = vi.fn();
    if (serviceWorker) {
        Object.defineProperty(navigator, 'serviceWorker', {
            configurable: true,
            value: { controller, addEventListener },
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
    const result = registerServiceWorker(register, { updateCheckIntervalMs: 1000, logger });
    return { register, updateSW, logger, result, addEventListener, options: () => options };
}

function fakeRegistration(overrides: Partial<ServiceWorkerRegistration> = {}) {
    return {
        installing: null,
        update: vi.fn().mockResolvedValue(undefined),
        ...overrides,
    } as unknown as ServiceWorkerRegistration;
}

describe('registerServiceWorker', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
        vi.restoreAllMocks();
        vi.unstubAllGlobals();
        Reflect.deleteProperty(navigator, 'serviceWorker');
    });

    it('re-requests API responses that started before the SW took control on the first visit', () => {
        vi.useFakeTimers();
        const fetchMock = vi.fn().mockResolvedValue(new Response('[]'));
        vi.stubGlobal('fetch', fetchMock);
        vi.spyOn(performance, 'now').mockReturnValue(100);
        stubResourceEntries([entry('https://node-hnapi.herokuapp.com/news?page=1', 10)]);
        const { observer, emit } = stubPerformanceObserver();
        const { addEventListener } = setup();

        expect(addEventListener).toHaveBeenCalledWith('controllerchange', expect.any(Function), { once: true });
        expect(fetchMock).not.toHaveBeenCalled();
        addEventListener.mock.calls[0][1]();
        expect(fetchMock).toHaveBeenCalledWith('https://node-hnapi.herokuapp.com/news?page=1');
        expect(observer.observe).toHaveBeenCalledWith({ type: 'resource' });

        // A request in flight at control time is re-requested; one started afterwards went through the SW.
        emit([
            entry('https://node-hnapi.herokuapp.com/item/1', 50),
            entry('https://node-hnapi.herokuapp.com/item/2', 150),
        ]);
        expect(fetchMock.mock.calls.map(([url]) => url)).toEqual([
            'https://node-hnapi.herokuapp.com/news?page=1',
            'https://node-hnapi.herokuapp.com/item/1',
        ]);

        vi.advanceTimersByTime(IN_FLIGHT_WINDOW_MS);
        expect(observer.disconnect).toHaveBeenCalled();
    });

    it('does not warm the cache when a SW already controls the page', () => {
        const { addEventListener } = setup({ controller: {} as ServiceWorker });
        expect(addEventListener).not.toHaveBeenCalled();
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

    it('skips update checks while offline', async () => {
        const { options } = setup({ onLine: false });
        const registration = fakeRegistration();
        options().onRegisteredSW?.('/sw.js', registration);

        await vi.advanceTimersByTimeAsync(1000);
        expect(registration.update).not.toHaveBeenCalled();
    });

    it('skips update checks while a new worker is installing', async () => {
        const { options } = setup();
        const registration = fakeRegistration({ installing: {} as ServiceWorker });
        options().onRegisteredSW?.('/sw.js', registration);

        await vi.advanceTimersByTimeAsync(1000);
        expect(registration.update).not.toHaveBeenCalled();
    });

    it('does not poll when registration is missing', () => {
        const { options } = setup();
        expect(() => options().onRegisteredSW?.('/sw.js', undefined)).not.toThrow();
        expect(vi.getTimerCount()).toBe(0);
    });

    it('logs failed update checks instead of throwing', async () => {
        const { options, logger } = setup();
        const error = new Error('network');
        const registration = fakeRegistration({ update: vi.fn().mockRejectedValue(error) });
        options().onRegisteredSW?.('/sw.js', registration);

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
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('fetches each runtime-cached API URL once and ignores other resources', async () => {
        const entries = [
            'https://node-hnapi.herokuapp.com/news?page=1',
            'https://node-hnapi.herokuapp.com/news?page=1',
            'https://api.hnpwa.com/v0/user/pg.json',
            'http://localhost:4200/assets/index.js',
            'https://node-hnapi.herokuapp.com.evil.test/news',
        ].map((name) => entry(name));
        const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(new Response('{}'));

        await warmRuntimeCache(entries, fetchMock);

        expect(fetchMock.mock.calls.map(([url]) => url)).toEqual([
            'https://node-hnapi.herokuapp.com/news?page=1',
            'https://api.hnpwa.com/v0/user/pg.json',
        ]);
    });

    it('settles when a request fails', async () => {
        const fetchMock = vi.fn<typeof fetch>().mockRejectedValue(new TypeError('offline'));

        await expect(warmRuntimeCache([entry('https://node-hnapi.herokuapp.com/item/1')], fetchMock)).resolves.toEqual([
            { status: 'rejected', reason: expect.any(TypeError) },
        ]);
    });
});
