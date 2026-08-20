import '@testing-library/jest-dom/vitest';

if (!window.matchMedia) {
    window.matchMedia = (query: string) =>
        ({
            media: query,
            matches: false,
            onchange: null,
            addEventListener: () => {},
            removeEventListener: () => {},
            addListener: () => {},
            removeListener: () => {},
            dispatchEvent: () => false,
        }) as unknown as MediaQueryList;
}
