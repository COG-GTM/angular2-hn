import '@testing-library/jest-dom/vitest';

// jsdom has no layout, so scrollTo is unimplemented and logs on every call.
window.scrollTo = () => {};

if (!window.matchMedia) {
    window.matchMedia = ((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addEventListener: () => {},
        removeEventListener: () => {},
        addListener: () => {},
        removeListener: () => {},
        dispatchEvent: () => false,
    })) as typeof window.matchMedia;
}
