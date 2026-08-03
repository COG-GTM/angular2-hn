type Listener = (event: MediaQueryListEvent) => void;

const listenersByQuery = new Map<string, Set<Listener>>();
const matchesByQuery = new Map<string, boolean>();

/**
 * jsdom does not implement `window.matchMedia`; this stub records listeners so tests can drive
 * media query changes with `setMediaQueryMatches`.
 */
export function installMatchMediaStub(): void {
    listenersByQuery.clear();
    matchesByQuery.clear();

    window.matchMedia = (query: string): MediaQueryList => {
        const list = {
            media: query,
            get matches() {
                return matchesByQuery.get(query) ?? false;
            },
            onchange: null,
            addEventListener: (_type: string, listener: Listener) => {
                const listeners = listenersByQuery.get(query) ?? new Set<Listener>();
                listeners.add(listener);
                listenersByQuery.set(query, listeners);
            },
            removeEventListener: (_type: string, listener: Listener) => {
                listenersByQuery.get(query)?.delete(listener);
            },
            addListener: () => {},
            removeListener: () => {},
            dispatchEvent: () => false,
        };
        return list as unknown as MediaQueryList;
    };
}

export function setMediaQueryMatches(query: string, matches: boolean): void {
    matchesByQuery.set(query, matches);
    listenersByQuery.get(query)?.forEach((listener) => {
        listener({ matches, media: query } as MediaQueryListEvent);
    });
}

export const DARK_COLOR_SCHEME_QUERY = '(prefers-color-scheme: dark)';

export function setPrefersDarkColorScheme(matches: boolean): void {
    setMediaQueryMatches(DARK_COLOR_SCHEME_QUERY, matches);
}
