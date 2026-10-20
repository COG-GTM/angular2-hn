import type { RegisterSWOptions } from 'virtual:pwa-register';

import { isRuntimeCachedUrl } from './runtimeCache';

export type RegisterSW = (options?: RegisterSWOptions) => (reloadPage?: boolean) => Promise<void>;

export const UPDATE_CHECK_INTERVAL_MS = 60 * 60 * 1000;
/** How long after a controller change in-flight API requests are still re-requested through the SW. */
export const IN_FLIGHT_WINDOW_MS = 60 * 1000;

export interface SetupOptions {
    updateCheckIntervalMs?: number;
    logger?: Pick<Console, 'info' | 'error'>;
}

/**
 * Re-requests runtime-cached API URLs so they go through the SW's cache. A URL stays in `warmed` while in flight
 * and after a successful response; failed or non-2xx warm-ups are removed so a later call retries them.
 */
export function warmRuntimeCache(
    entries: PerformanceEntryList,
    fetchFn: typeof fetch = fetch,
    warmed = new Set<string>()
): Promise<PromiseSettledResult<Response>[]> {
    const urls = [...new Set(entries.map((entry) => entry.name))].filter(
        (url) => isRuntimeCachedUrl(url) && !warmed.has(url)
    );
    urls.forEach((url) => warmed.add(url));
    return Promise.allSettled(
        urls.map(async (url) => {
            try {
                const response = await fetchFn(url);
                if (!response.ok) warmed.delete(url);
                return response;
            } catch (error) {
                warmed.delete(url);
                throw error;
            }
        })
    );
}

/**
 * The first visit's API requests start before the SW controls the page, so they never reach its runtime
 * cache and the landing page would fail offline. On every controller change, request them again through
 * the SW — including requests still in flight at that moment (PerformanceObserver).
 */
function warmRuntimeCacheOnControllerChange(container: ServiceWorkerContainer): void {
    const warmed = new Set<string>();
    container.addEventListener('controllerchange', () => {
        const controlledAt = performance.now();
        const startedBeforeControl = (entries: PerformanceEntryList) =>
            entries.filter((entry) => entry.startTime < controlledAt);

        void warmRuntimeCache(startedBeforeControl(performance.getEntriesByType('resource')), fetch, warmed);
        if (typeof PerformanceObserver === 'undefined') return;
        const observer = new PerformanceObserver(
            (list) => void warmRuntimeCache(startedBeforeControl(list.getEntries()), fetch, warmed)
        );
        observer.observe({ type: 'resource' });
        setTimeout(() => observer.disconnect(), IN_FLIGHT_WINDOW_MS);
    });
}

/**
 * Registers the generated service worker. It auto-updates (skipWaiting + clientsClaim in the Workbox
 * config); long-lived tabs also poll for a new version while online.
 */
export function setupServiceWorker(
    register: RegisterSW,
    { updateCheckIntervalMs = UPDATE_CHECK_INTERVAL_MS, logger = console }: SetupOptions = {}
): ((reloadPage?: boolean) => Promise<void>) | undefined {
    if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return undefined;

    warmRuntimeCacheOnControllerChange(navigator.serviceWorker);

    return register({
        immediate: true,
        onRegisteredSW(_swUrl, registration) {
            if (!registration) return;
            setInterval(() => {
                if (registration.installing || !navigator.onLine) return;
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
