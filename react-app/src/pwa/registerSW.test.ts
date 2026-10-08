import type { RegisterSWOptions } from 'virtual:pwa-register';

import { registerServiceWorker, type RegisterSW } from './registerSW';

function setup({ serviceWorker = true, onLine = true } = {}) {
    if (serviceWorker) {
        Object.defineProperty(navigator, 'serviceWorker', { configurable: true, value: {} });
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
    return { register, updateSW, logger, result, options: () => options };
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
