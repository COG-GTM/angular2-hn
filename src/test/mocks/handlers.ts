import type { RequestHandler } from 'msw';

// Per-feature MSW request handlers are added in later migration PRs
// (e.g. the Hacker News API service). The array is intentionally empty
// for the scaffolding smoke test.
export const handlers: RequestHandler[] = [];
