const registerSW = vi.fn();

vi.mock('virtual:pwa-register', () => ({ registerSW }));

describe('registerServiceWorker', () => {
    beforeEach(() => {
        vi.resetModules();
        registerSW.mockReset();
    });

    afterEach(() => {
        vi.unstubAllGlobals();
        vi.restoreAllMocks();
    });

    it('does nothing when the browser has no service worker support', async () => {
        vi.stubGlobal('navigator', {});
        const { registerServiceWorker } = await import('./pwa');

        registerServiceWorker();

        expect(registerSW).not.toHaveBeenCalled();
    });

    it('registers the worker immediately when service workers are supported', async () => {
        vi.stubGlobal('navigator', { serviceWorker: {} });
        const { registerServiceWorker } = await import('./pwa');

        registerServiceWorker();

        expect(registerSW).toHaveBeenCalledTimes(1);
        expect(registerSW).toHaveBeenCalledWith(expect.objectContaining({ immediate: true }));
    });

    it('logs offline-ready and registration errors', async () => {
        vi.stubGlobal('navigator', { serviceWorker: {} });
        const info = vi.spyOn(console, 'info').mockImplementation(() => {});
        const error = vi.spyOn(console, 'error').mockImplementation(() => {});
        const { registerServiceWorker } = await import('./pwa');

        registerServiceWorker();
        const options = registerSW.mock.calls[0][0];
        options.onOfflineReady();
        options.onRegisterError(new Error('boom'));

        expect(info).toHaveBeenCalledWith(expect.stringContaining('offline'));
        expect(error).toHaveBeenCalledWith(expect.stringContaining('registration failed'), expect.any(Error));
    });
});
