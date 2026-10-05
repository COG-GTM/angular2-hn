import type { ReactElement, ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, type RenderOptions } from '@testing-library/react';
import { MemoryRouter, useLocation, useRoutes } from 'react-router-dom';

import { SettingsProvider } from '../context/settings';
import type { Settings } from '../models';
import { routes } from '../routes';

export function createTestQueryClient() {
  return new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: Infinity } } });
}

interface ProviderOptions {
  route?: string;
  settings?: Partial<Settings>;
  queryClient?: QueryClient;
}

function Providers({ children, settings, queryClient }: ProviderOptions & { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient ?? createTestQueryClient()}>
      <SettingsProvider initial={settings}>{children}</SettingsProvider>
    </QueryClientProvider>
  );
}

/** Render a component with QueryClient, SettingsProvider and a MemoryRouter at `route`. */
export function renderWithProviders(
  ui: ReactElement,
  { route = '/', settings, queryClient, ...options }: ProviderOptions & Omit<RenderOptions, 'wrapper'> = {}
) {
  return render(ui, {
    wrapper: ({ children }) => (
      <Providers settings={settings} queryClient={queryClient}>
        <MemoryRouter initialEntries={[route]}>{children}</MemoryRouter>
      </Providers>
    ),
    ...options,
  });
}

function AppRoutes() {
  return useRoutes(routes);
}

function LocationProbe() {
  const location = useLocation();
  return <output data-testid="location" hidden>{location.pathname + location.search}</output>;
}

/**
 * Render the full app route tree at `route` (theme root, header, footer and the matched page).
 * The current location is exposed as `getByTestId('location')`.
 */
export function renderApp({ route = '/', settings, queryClient }: ProviderOptions = {}) {
  return render(
    <Providers settings={settings} queryClient={queryClient}>
      <MemoryRouter initialEntries={[route]}>
        <AppRoutes />
        <LocationProbe />
      </MemoryRouter>
    </Providers>
  );
}

/** Stub `fetch` to resolve URLs via `handler`; return `undefined` from the handler for a 404. */
export function mockFetch(handler: (url: string) => unknown) {
  const fn = vi.fn(async (input: RequestInfo | URL) => {
    const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
    const body = handler(url);
    if (body === undefined) {
      return new Response('Not found', { status: 404 });
    }
    return new Response(JSON.stringify(body), { status: 200, headers: { 'Content-Type': 'application/json' } });
  });
  vi.stubGlobal('fetch', fn);
  return fn;
}
