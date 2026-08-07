import { registerSW } from 'virtual:pwa-register';

export type UpdateServiceWorker = (reloadPage?: boolean) => Promise<void>;

// The Angular app registered ngsw-worker.js only when environment.production was true.
export function registerServiceWorker(isProduction: boolean): UpdateServiceWorker | null {
    if (!isProduction) {
        return null;
    }

    return registerSW({ immediate: true });
}
