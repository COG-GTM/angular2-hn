declare global {
    interface Window {
        ga?: (...args: unknown[]) => void;
    }
}

export {};
