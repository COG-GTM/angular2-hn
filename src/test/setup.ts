import '@testing-library/jest-dom/vitest';
import { afterAll, afterEach, beforeAll, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import { server } from './server';

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));

afterEach(() => {
    cleanup();
    server.resetHandlers();
    localStorage.clear();
});

afterAll(() => server.close());

// jsdom does not implement scrollTo
window.scrollTo = vi.fn();

// Provide a default matchMedia mock; individual tests can override.
export function mockMatchMedia(matches: boolean) {
    const listeners = new Set<(e: { matches: boolean }) => void>();
    const media = {
        matches,
        media: '(prefers-color-scheme: dark)',
        onchange: null,
        addEventListener: (_type: string, cb: (e: { matches: boolean }) => void) => listeners.add(cb),
        removeEventListener: (_type: string, cb: (e: { matches: boolean }) => void) => listeners.delete(cb),
        addListener: vi.fn(),
        removeListener: vi.fn(),
        dispatchEvent: (event: { matches: boolean }) => {
            listeners.forEach((cb) => cb(event));
            return true;
        },
    };
    window.matchMedia = vi.fn().mockImplementation(() => media);
    return media;
}

mockMatchMedia(false);
