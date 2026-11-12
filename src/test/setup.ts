import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, beforeEach, vi } from 'vitest';

beforeEach(() => {
    window.scrollTo = vi.fn() as typeof window.scrollTo;
});

afterEach(() => {
    cleanup();
    localStorage.clear();
});
