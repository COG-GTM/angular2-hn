import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

// React Router's data routers build a Node `Request` with jsdom's `AbortSignal`, which Node 24's fetch
// rejects; tests don't need router request cancellation, so drop the signal.
const NodeRequest = globalThis.Request;
globalThis.Request = class extends NodeRequest {
  constructor(input: RequestInfo | URL, init?: RequestInit) {
    super(input, init && { ...init, signal: undefined });
  }
} as typeof Request;

afterEach(() => {
  cleanup();
  localStorage.clear();
});
