/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

declare global {
    interface Window {
        ga?: (...args: unknown[]) => void;
    }
}

export {};
