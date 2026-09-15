/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

interface Window {
    ga?: (...args: unknown[]) => void;
}
