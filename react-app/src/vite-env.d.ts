/// <reference types="vite/client" />

declare global {
    interface Window {
        ga?: (...args: unknown[]) => void;
    }
}

export {};
