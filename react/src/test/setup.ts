import '@testing-library/jest-dom/vitest';

if (!window.matchMedia) {
    Object.defineProperty(window, 'matchMedia', {
        configurable: true,
        value: (query: string) =>
            ({
                matches: false,
                media: query,
                addEventListener: () => undefined,
                removeEventListener: () => undefined,
            }) as unknown as MediaQueryList,
    });
}
