import type { RegisterSWOptions } from 'virtual:pwa-register';

export type RegisterSW = (options?: RegisterSWOptions) => (reloadPage?: boolean) => Promise<void>;

export const UPDATE_CHECK_INTERVAL_MS = 60 * 60 * 1000;

interface Options {
    updateCheckIntervalMs?: number;
    logger?: Pick<Console, 'info' | 'error'>;
}

// The SW auto-updates (skipWaiting + clientsClaim); a long-lived tab also polls for a new SW.
export function registerServiceWorker(
    register: RegisterSW,
    { updateCheckIntervalMs = UPDATE_CHECK_INTERVAL_MS, logger = console }: Options = {}
) {
    if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) {
        return undefined;
    }
    return register({
        immediate: true,
        onRegisteredSW(_swUrl, registration) {
            if (!registration) {
                return;
            }
            setInterval(() => {
                if (registration.installing || !navigator.onLine) {
                    return;
                }
                registration.update().catch((error: unknown) => logger.error('Service worker update failed', error));
            }, updateCheckIntervalMs);
        },
        onOfflineReady() {
            logger.info('App is ready to work offline.');
        },
        onRegisterError(error: unknown) {
            logger.error('Service worker registration failed', error);
        },
    });
}
