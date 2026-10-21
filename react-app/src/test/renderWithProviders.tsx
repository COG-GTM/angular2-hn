import { render } from '@testing-library/react';
import type { ReactElement } from 'react';
import { createMemoryRouter, RouterProvider, useLocation } from 'react-router-dom';

import { SettingsProvider } from '../settings';

function LocationDisplay() {
  const { pathname, search } = useLocation();
  return <div data-testid="location">{pathname + search}</div>;
}

export interface RenderOptions {
  /** Initial URL, e.g. `/item/123`. */
  route?: string;
  /** Route pattern the element is mounted at, e.g. `/item/:id`. Defaults to `route`. */
  path?: string;
}

/**
 * Renders `ui` inside SettingsProvider and a memory router.
 * The current URL is always rendered in `data-testid="location"`, so tests can assert navigation.
 */
export function renderWithProviders(ui: ReactElement, { route = '/', path = route }: RenderOptions = {}) {
  const router = createMemoryRouter(
    [
      {
        path,
        element: (
          <>
            {ui}
            <LocationDisplay />
          </>
        ),
      },
      { path: '*', element: <LocationDisplay /> },
    ],
    { initialEntries: [route] }
  );
  return {
    router,
    ...render(
      <SettingsProvider>
        <RouterProvider router={router} />
      </SettingsProvider>
    ),
  };
}
