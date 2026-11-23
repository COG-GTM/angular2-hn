import { render } from '@testing-library/react';
import type { ReactNode } from 'react';
import { createMemoryRouter, RouterProvider, type RouteObject } from 'react-router-dom';
import type { Story } from '../../api/types';
import { SettingsProvider } from '../../settings/SettingsContext';

export function story(overrides: Partial<Story> = {}): Story {
  return {
    id: 1,
    title: 'A story',
    points: 42,
    user: 'pg',
    time: 0,
    time_ago: '2 hours ago',
    type: 'link',
    url: 'https://example.com/a',
    domain: 'example.com',
    comments: [],
    comments_count: 3,
    ...overrides,
  };
}

export function renderRoutes(routes: RouteObject[], initialEntry: string, wrap = (el: ReactNode) => el) {
  vi.stubGlobal('matchMedia', (query: string) => ({
    matches: false,
    media: query,
    addEventListener: () => {},
    removeEventListener: () => {},
  }));
  const router = createMemoryRouter(routes, { initialEntries: [initialEntry] });
  const result = render(<SettingsProvider>{wrap(<RouterProvider router={router} />)}</SettingsProvider>);
  return { router, ...result };
}
