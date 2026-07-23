import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import App from './App';
import { SettingsProvider } from './context/SettingsProvider';
import { BASE_URL } from './services/hackerNewsApi';
import { server } from './test/mocks/server';

let lastFeedUrl = '';

function renderApp(initialEntries: string[]) {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <SettingsProvider>
        <App />
      </SettingsProvider>
    </MemoryRouter>
  );
}

describe('App shell + routing', () => {
  beforeEach(() => {
    lastFeedUrl = '';
    server.use(
      http.get(`${BASE_URL}/:feedType`, ({ request }) => {
        lastFeedUrl = request.url;
        return HttpResponse.json([]);
      })
    );
  });

  afterEach(() => {
    delete window.ga;
  });

  it('redirects / to /news/1', async () => {
    renderApp(['/']);
    await waitFor(() => expect(lastFeedUrl).not.toBe(''));
    const url = new URL(lastFeedUrl);
    expect(url.pathname).toBe('/news');
    expect(url.searchParams.get('page')).toBe('1');
  });

  it.each([
    ['/news/1', '/news', '1'],
    ['/newest/2', '/newest', '2'],
    ['/show/3', '/show', '3'],
    ['/ask/1', '/ask', '1'],
    ['/jobs/1', '/jobs', '1'],
  ])('routes %s to the right feed request', async (path, pathname, page) => {
    renderApp([path]);
    await waitFor(() => expect(lastFeedUrl).not.toBe(''));
    const url = new URL(lastFeedUrl);
    expect(url.pathname).toBe(pathname);
    expect(url.searchParams.get('page')).toBe(page);
  });

  it('renders the item details route for the requested id', async () => {
    server.use(
      http.get(`${BASE_URL}/item/8863`, () =>
        HttpResponse.json({ id: 8863, type: 'story', title: 'Deep item', url: '', comments: [] })
      )
    );
    renderApp(['/item/8863']);
    expect((await screen.findAllByText('Deep item')).length).toBeGreaterThan(0);
  });

  it('renders the user route for the requested id', async () => {
    server.use(
      http.get(`${BASE_URL}/user/pg`, () =>
        HttpResponse.json({ id: 'pg', karma: 155000, created: 'long ago', about: '' })
      )
    );
    renderApp(['/user/pg']);
    expect((await screen.findAllByText('pg')).length).toBeGreaterThan(0);
  });

  it('renders header navigation links and footer', () => {
    renderApp(['/news/1']);
    expect(screen.getByRole('link', { name: 'new' })).toHaveAttribute('href', '/newest/1');
    expect(screen.getByRole('link', { name: 'show' })).toHaveAttribute('href', '/show/1');
    expect(screen.getByRole('link', { name: 'ask' })).toHaveAttribute('href', '/ask/1');
    expect(screen.getByRole('link', { name: 'jobs' })).toHaveAttribute('href', '/jobs/1');
    expect(screen.getByRole('link', { name: 'GitHub' })).toBeInTheDocument();
  });

  it('applies the current theme class on the root wrapper', () => {
    localStorage.setItem('theme', 'amoledblack');
    const { container } = renderApp(['/news/1']);
    expect(container.querySelector('.amoledblack')).not.toBeNull();
  });

  it('navigates when a nav link is clicked', async () => {
    renderApp(['/news/1']);
    await waitFor(() => expect(new URL(lastFeedUrl).pathname).toBe('/news'));
    await userEvent.click(screen.getByRole('link', { name: 'jobs' }));
    await waitFor(() => expect(new URL(lastFeedUrl).pathname).toBe('/jobs'));
  });

  describe('settings modal', () => {
    it('opens and closes the settings modal from the header cog', async () => {
      renderApp(['/news/1']);
      expect(screen.queryByRole('heading', { name: 'Settings' })).not.toBeInTheDocument();

      await userEvent.click(screen.getByAltText('Settings'));
      expect(screen.getByRole('heading', { name: 'Settings' })).toBeInTheDocument();

      await userEvent.click(screen.getByText('×'));
      expect(screen.queryByRole('heading', { name: 'Settings' })).not.toBeInTheDocument();
    });
  });

  describe('Google Analytics pageviews', () => {
    it('fires a pageview on initial load and on navigation', async () => {
      const ga = vi.fn();
      window.ga = ga;
      renderApp(['/news/1']);
      expect(ga).toHaveBeenCalledWith('set', 'page', '/news/1');
      expect(ga).toHaveBeenCalledWith('send', 'pageview');

      ga.mockClear();
      await userEvent.click(screen.getByRole('link', { name: 'ask' }));
      expect(ga).toHaveBeenCalledWith('set', 'page', '/ask/1');
      expect(ga).toHaveBeenCalledWith('send', 'pageview');
    });
  });
});
