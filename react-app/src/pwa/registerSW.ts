import type { RegisterSWOptions } from 'virtual:pwa-register';

import { isRuntimeCachedUrl } from './runtime-cache';

export type RegisterSW = (options?: RegisterSWOptions) => (reloadPage?: boolean) => Promise<void>;

export const UPDATE_CHECK_INTERVAL_MS = 60 * 60 * 1000;

interface Options {
    updateCheckIntervalMs?: number;
    logger?: Pick<Console, 'info' | 'error'>;
}

export const IN_FLIGHT_WINDOW_MS = 60 * 1000;

export function warmRuntimeCache(
    entries: PerformanceEntryList,
    fetchFn: typeof fetch = fetch,
    warmed = new Set<string>()
) {
    const urls = entries.map((entry) => entry.name).filter((url) => isRuntimeCachedUrl(url) && !warmed.has(url));
    const unique = [...new Set(urls)];
    unique.forEach((url) => warmed.add(url));
    return Promise.allSettled(unique.map((url) => fetchFn(url)));
}

// On the first visit the API requests start before the SW takes control, so they never reach its
// runtime cache. Once it controls the page, request them again through the SW, including requests
// that were still in flight at that moment.
function warmRuntimeCacheOnFirstControl() {
    navigator.serviceWorker.addEventListener(
        'controllerchange',
        () => {
            const controlledAt = performance.now();
            const warmed = new Set<string>();
            const startedBeforeControl = (entries: PerformanceEntryList) =>
                entries.filter((entry) => entry.startTime < controlledAt);

            void warmRuntimeCache(startedBeforeControl(performance.getEntriesByType('resource')), fetch, warmed);
            if (typeof PerformanceObserver === 'undefined') {
                return;
            }
            const observer = new PerformanceObserver(
                (list) => void warmRuntimeCache(startedBeforeControl(list.getEntries()), fetch, warmed)
            );
            observer.observe({ type: 'resource' });
            setTimeout(() => observer.disconnect(), IN_FLIGHT_WINDOW_MS);
        },
        { once: true }
    );
}

// The SW auto-updates (skipWaiting + clientsClaim); a long-lived tab also polls for a new SW.
export function registerServiceWorker(
    register: RegisterSW,
    { updateCheckIntervalMs = UPDATE_CHECK_INTERVAL_MS, logger = console }: Options = {}
) {
    if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) {
        return undefined;
    }
    if (!navigator.serviceWorker.controller) {
        warmRuntimeCacheOnFirstControl();
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
