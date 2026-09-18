import '@testing-library/jest-dom/vitest';
import { afterEach, vi } from 'vitest';

class LocalStorageMock implements Storage {
  private store = new Map<string, string>();

  get length(): number {
    return this.store.size;
  }

  clear(): void {
    this.store.clear();
  }

  getItem(key: string): string | null {
    return this.store.has(key) ? (this.store.get(key) as string) : null;
  }

  key(index: number): string | null {
    return Array.from(this.store.keys())[index] ?? null;
  }

  removeItem(key: string): void {
    this.store.delete(key);
  }

  setItem(key: string, value: string): void {
    this.store.set(key, String(value));
  }
}

Object.defineProperty(window, 'localStorage', { value: new LocalStorageMock(), writable: true });

export interface MatchMediaMock extends MediaQueryList {
  listeners: Array<(event: MediaQueryListEvent) => void>;
  emit: (matches: boolean) => void;
}

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn((query: string) => {
    const listeners: Array<(event: MediaQueryListEvent) => void> = [];
    const mock = {
      matches: false,
      media: query,
      onchange: null,
      listeners,
      addEventListener: (_type: string, listener: (event: MediaQueryListEvent) => void) => {
        listeners.push(listener);
      },
      removeEventListener: (_type: string, listener: (event: MediaQueryListEvent) => void) => {
        const index = listeners.indexOf(listener);
        if (index >= 0) {
          listeners.splice(index, 1);
        }
      },
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
      emit(matches: boolean) {
        mock.matches = matches;
        listeners.forEach((listener) => listener({ matches, media: query } as MediaQueryListEvent));
      },
    };
    return mock as unknown as MatchMediaMock;
  }),
});

globalThis.fetch = vi.fn();

afterEach(() => {
  window.localStorage.clear();
  vi.clearAllMocks();
});
