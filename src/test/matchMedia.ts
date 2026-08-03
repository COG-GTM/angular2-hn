type Listener = (event: MediaQueryListEvent) => void;

const listeners = new Set<Listener>();
let prefersDark = false;

function createMediaQueryList(query: string): MediaQueryList {
  return {
    media: query,
    get matches() {
      return prefersDark;
    },
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: (_type: string, listener: Listener) => listeners.add(listener),
    removeEventListener: (_type: string, listener: Listener) => listeners.delete(listener),
    dispatchEvent: () => true,
  } as unknown as MediaQueryList;
}

window.matchMedia = createMediaQueryList;

/** Sets the value `matchMedia('(prefers-color-scheme: dark)').matches` reports. */
export function setPrefersDarkColorScheme(matches: boolean) {
  prefersDark = matches;
  listeners.clear();
}

/** Emits a color scheme change to every subscribed listener. */
export function emitColorSchemeChange(matches: boolean) {
  prefersDark = matches;
  listeners.forEach((listener) => listener({ matches } as MediaQueryListEvent));
}
