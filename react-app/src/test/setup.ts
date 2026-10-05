import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, beforeEach, vi } from 'vitest';

type Listener = (event: MediaQueryListEvent) => void;

/** Controllable `window.matchMedia` stub; use `setPrefersDark()` in tests to simulate system theme changes. */
const mediaListeners = new Set<Listener>();
let prefersDark = false;

export function setPrefersDark(value: boolean) {
  prefersDark = value;
  mediaListeners.forEach((listener) => listener({ matches: value } as MediaQueryListEvent));
}

beforeEach(() => {
  prefersDark = false;
  mediaListeners.clear();
  localStorage.clear();
  vi.stubGlobal(
    'matchMedia',
    vi.fn((query: string) => ({
      get matches() {
        return query.includes('dark') ? prefersDark : false;
      },
      media: query,
      onchange: null,
      addEventListener: (_: string, listener: Listener) => mediaListeners.add(listener),
      removeEventListener: (_: string, listener: Listener) => mediaListeners.delete(listener),
      addListener: (listener: Listener) => mediaListeners.add(listener),
      removeListener: (listener: Listener) => mediaListeners.delete(listener),
      dispatchEvent: () => true,
    }))
  );
  vi.stubGlobal('scrollTo', vi.fn());
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});
