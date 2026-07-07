import '@testing-library/jest-dom/vitest';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

// jsdom does not implement matchMedia; provide a light default so components
// depending on SettingsContext render. This is a plain function (not a vi mock)
// so `vi.resetAllMocks()` in individual tests does not clobber it. Tests that
// need to drive color-scheme changes override it with `vi.stubGlobal`.
window.matchMedia = (query: string): MediaQueryList =>
  ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  }) as unknown as MediaQueryList;

// jsdom's scrollTo throws "Not implemented"; replace with a no-op.
window.scrollTo = () => {};

afterEach(() => {
  cleanup();
});
