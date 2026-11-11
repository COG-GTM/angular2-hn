import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, beforeEach, vi } from 'vitest';

// Default to empty API responses so pages that fetch on mount never hit the network.
beforeEach(() => {
    vi.stubGlobal(
        'fetch',
        vi.fn(async () => new Response('[]'))
    );
});

afterEach(() => {
    cleanup();
    localStorage.clear();
    vi.unstubAllGlobals();
});
