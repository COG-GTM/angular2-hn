import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

afterEach(() => {
  cleanup();
  localStorage.clear();
});

if (!window.matchMedia) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    configurable: true,
    value: (query: string): MediaQueryList => {
      const listeners = new Set<EventListenerOrEventListenerObject>();
      return {
        matches: false,
        media: query,
        onchange: null,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: (_type: string, listener: EventListenerOrEventListenerObject) => listeners.add(listener),
        removeEventListener: (_type: string, listener: EventListenerOrEventListenerObject) =>
          listeners.delete(listener),
        dispatchEvent: () => true,
      } as MediaQueryList;
    },
  });
}

window.scrollTo = () => {};
