if (!window.matchMedia) {
    window.matchMedia = (media: string): MediaQueryList =>
        ({
            media,
            matches: false,
            onchange: null,
            addEventListener: () => undefined,
            removeEventListener: () => undefined,
            addListener: () => undefined,
            removeListener: () => undefined,
            dispatchEvent: () => false,
        }) as MediaQueryList;
}
