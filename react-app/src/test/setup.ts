import '@testing-library/jest-dom/vitest';
import { afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

class MediaQueryListMock implements Partial<MediaQueryList> {
    matches = false;
    media = '';
    addEventListener = vi.fn();
    removeEventListener = vi.fn();
}

Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn((media: string) => Object.assign(new MediaQueryListMock(), { media })),
});

window.scrollTo = vi.fn();

afterEach(() => {
    cleanup();
    localStorage.clear();
    vi.clearAllMocks();
});
