import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, beforeEach, vi } from 'vitest';

type ChangeListener = (event: MediaQueryListEvent) => void;

class MediaQueryListMock {
    matches = false;
    media = '(prefers-color-scheme: dark)';
    private listeners = new Set<ChangeListener>();

    addEventListener(_type: string, listener: ChangeListener) {
        this.listeners.add(listener);
    }

    removeEventListener(_type: string, listener: ChangeListener) {
        this.listeners.delete(listener);
    }

    /** Simulates the OS switching between light and dark color schemes. */
    emitChange(matches: boolean) {
        this.matches = matches;
        this.listeners.forEach((listener) => listener({ matches, media: this.media } as MediaQueryListEvent));
    }
}

declare global {
    // eslint-disable-next-line no-var
    var mediaQueryListMock: MediaQueryListMock;
}

beforeEach(() => {
    localStorage.clear();
    globalThis.mediaQueryListMock = new MediaQueryListMock();
    vi.stubGlobal(
        'matchMedia',
        vi.fn((media: string) => {
            globalThis.mediaQueryListMock.media = media;
            return globalThis.mediaQueryListMock;
        })
    );
    vi.stubGlobal('scrollTo', vi.fn());
});

afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
});
