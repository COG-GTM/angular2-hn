import { vi } from 'vitest';

export interface FakeMediaQueryList {
  matches: boolean;
  media: string;
  listeners: Set<(event: MediaQueryListEvent) => void>;
  emit(matches: boolean): void;
}

/** Installs a controllable window.matchMedia and returns the dark-color-scheme query it hands out. */
export function mockMatchMedia(prefersDark: boolean): FakeMediaQueryList {
  const mql: FakeMediaQueryList = {
    matches: prefersDark,
    media: '(prefers-color-scheme: dark)',
    listeners: new Set(),
    emit(matches) {
      mql.matches = matches;
      const event = { matches, media: mql.media } as MediaQueryListEvent;
      mql.listeners.forEach((listener) => listener(event));
    },
  };
  vi.stubGlobal(
    'matchMedia',
    vi.fn(() => ({
      get matches() {
        return mql.matches;
      },
      media: mql.media,
      addEventListener: (_type: string, listener: (event: MediaQueryListEvent) => void) => mql.listeners.add(listener),
      removeEventListener: (_type: string, listener: (event: MediaQueryListEvent) => void) =>
        mql.listeners.delete(listener),
    })),
  );
  return mql;
}
