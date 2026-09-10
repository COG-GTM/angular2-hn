import '@testing-library/jest-dom/vitest';

if (!window.matchMedia) {
    window.matchMedia = (media: string) =>
        ({
            matches: false,
            media,
            onchange: null,
            addEventListener: () => {},
            removeEventListener: () => {},
            addListener: () => {},
            removeListener: () => {},
            dispatchEvent: () => true,
        }) as unknown as MediaQueryList;
}
