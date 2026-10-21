import { registerSW } from 'virtual:pwa-register';

import { setupServiceWorker } from './setupServiceWorker';

/** Registers the vite-plugin-pwa service worker (auto-update). Called once from main.tsx. */
export function registerServiceWorker(): void {
    setupServiceWorker(registerSW);
}
