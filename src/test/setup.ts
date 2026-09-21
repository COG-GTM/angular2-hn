import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

// jsdom does not implement matchMedia, which the settings context uses for prefers-color-scheme.
if (!window.matchMedia) {
    window.matchMedia = (media: string) =>
        ({
            media,
            matches: false,
            onchange: null,
            addListener: () => {},
            removeListener: () => {},
            addEventListener: () => {},
            removeEventListener: () => {},
            dispatchEvent: () => false,
        }) as MediaQueryList;
}

afterEach(() => {
    cleanup();
});
