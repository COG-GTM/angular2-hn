import type { ReactElement } from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { vi } from 'vitest';
import { SettingsProvider } from '../settings/SettingsContext';
import { ROUTER_FUTURE } from '../AppRoutes';

/** Renders `ui` at `route` matched against `path` (so useParams works), inside SettingsProvider + MemoryRouter. */
export function renderWithProviders(ui: ReactElement, { route = '/', path = '*' }: { route?: string; path?: string } = {}) {
  return render(
    <SettingsProvider>
      <MemoryRouter initialEntries={[route]} future={ROUTER_FUTURE}>
        <Routes>
          <Route path={path} element={ui} />
          <Route path="*" element={<div data-testid="other-route" />} />
        </Routes>
      </MemoryRouter>
    </SettingsProvider>
  );
}

type Responder = unknown | ((url: string) => unknown);

/**
 * Stubs global fetch. Keys are URL substrings (first match wins); values are JSON bodies or functions returning one.
 * Unmatched URLs and `Error` values reject; `{ __status: 500 }` responds with that HTTP status.
 */
export function mockFetch(routes: Record<string, Responder>) {
  const fn = vi.fn(async (input: RequestInfo | URL) => {
    const url = String(input);
    const key = Object.keys(routes).find((k) => url.includes(k));
    if (key === undefined) throw new TypeError(`Unmocked fetch: ${url}`);
    const r = routes[key];
    const body = typeof r === 'function' ? (r as (u: string) => unknown)(url) : r;
    if (body instanceof Error) throw body;
    const status = (body as { __status?: number } | null)?.__status ?? 200;
    return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
  });
  vi.stubGlobal('fetch', fn);
  return fn;
}
