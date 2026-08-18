import '@testing-library/jest-dom/vitest';
import { afterAll, afterEach, beforeAll, beforeEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import { server } from './server';

export function mockMatchMedia(matches: boolean) {
    const listeners = new Set<(event: MediaQueryListEvent) => void>();
    const media: MediaQueryList = {
        matches,
        media: '(prefers-color-scheme: dark)',
        onchange: null,
        addListener: () => undefined,
        removeListener: () => undefined,
        addEventListener: (_type: string, listener: EventListenerOrEventListenerObject) =>
            listeners.add(listener as (event: MediaQueryListEvent) => void),
        removeEventListener: (_type: string, listener: EventListenerOrEventListenerObject) =>
            listeners.delete(listener as (event: MediaQueryListEvent) => void),
        dispatchEvent: (event: Event) => {
            listeners.forEach((listener) => listener(event as MediaQueryListEvent));
            return true;
        },
    };
    window.matchMedia = () => media;
    return media;
}

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));

beforeEach(() => {
    mockMatchMedia(false);
    window.scrollTo = () => undefined;
});

afterEach(() => {
    cleanup();
    server.resetHandlers();
    localStorage.clear();
});

afterAll(() => server.close());
