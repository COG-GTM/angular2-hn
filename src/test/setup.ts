/**
 * jsdom does not implement `window.matchMedia`, which SettingsProvider uses to
 * follow the system colour scheme. Tests that care about the media query stub it
 * themselves; this default keeps every other test from crashing on mount.
 */
if (typeof window !== 'undefined' && !window.matchMedia) {
    window.matchMedia = (media: string) =>
        ({
            media,
            matches: false,
            onchange: null,
            addEventListener: () => {},
            removeEventListener: () => {},
            addListener: () => {},
            removeListener: () => {},
            dispatchEvent: () => false,
        }) as unknown as MediaQueryList;
}
