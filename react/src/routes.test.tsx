import { render, waitFor } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { routerFuture, routes } from './routes';
import { SettingsProvider } from './settings/SettingsProvider';

function renderAt(path: string) {
  const router = createMemoryRouter(routes, { initialEntries: [path], future: routerFuture });
  render(
    <SettingsProvider>
      <RouterProvider router={router} future={{ v7_startTransition: true }} />
    </SettingsProvider>,
  );
  return router;
}

describe('routes', () => {
  it('redirects / to /news/1', () => {
    const router = renderAt('/');
    expect(router.state.location.pathname).toBe('/news/1');
  });

  it.each(['news', 'newest', 'show', 'ask', 'jobs'])('matches /%s/:page', (feed) => {
    const router = renderAt(`/${feed}/2`);
    expect(router.state.matches.at(-1)?.params).toEqual({ page: '2' });
  });

  it.each([
    ['/item/123', { id: '123' }],
    ['/user/pg', { id: 'pg' }],
  ])('lazy-loads %s', async (path, params) => {
    const router = renderAt(path);
    await waitFor(() => expect(router.state.matches.at(-1)?.params).toEqual(params));
  });
});
