import { registerSW } from 'virtual:pwa-register';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { registerServiceWorker } from './pwa';

vi.mock('virtual:pwa-register', () => ({
    registerSW: vi.fn(() => vi.fn()),
}));

const registerSWMock = vi.mocked(registerSW);

describe('registerServiceWorker', () => {
    beforeEach(() => {
        registerSWMock.mockClear();
    });

    it('registers the Workbox service worker in production', () => {
        const updateServiceWorker = registerServiceWorker(true);

        expect(registerSWMock).toHaveBeenCalledWith({ immediate: true });
        expect(updateServiceWorker).toBeTypeOf('function');
    });

    it('does not register anything outside production', () => {
        expect(registerServiceWorker(false)).toBeNull();
        expect(registerSWMock).not.toHaveBeenCalled();
    });
});
