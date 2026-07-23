import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import App from './App';
import { SettingsProvider } from './context/SettingsProvider';

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
  afterEach(() => {
    delete window.ga;
  });

  it('redirects / to /news/1', () => {
    renderApp(['/']);
    expect(screen.getByTestId('feed-page')).toHaveTextContent('news (page 1)');
  });

  it.each([
    ['/news/1', 'news (page 1)'],
    ['/newest/2', 'newest (page 2)'],
    ['/show/3', 'show (page 3)'],
    ['/ask/1', 'ask (page 1)'],
    ['/jobs/1', 'jobs (page 1)'],
  ])('renders the feed page for %s', (path, expected) => {
    renderApp([path]);
    expect(screen.getByTestId('feed-page')).toHaveTextContent(expected);
  });

  it('renders the item details route with its id', () => {
    renderApp(['/item/8863']);
    expect(screen.getByTestId('item-details-page')).toHaveTextContent('8863');
  });

  it('renders the user route with its id', () => {
    renderApp(['/user/pg']);
    expect(screen.getByTestId('user-page')).toHaveTextContent('pg');
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
    await userEvent.click(screen.getByRole('link', { name: 'jobs' }));
    expect(screen.getByTestId('feed-page')).toHaveTextContent('jobs (page 1)');
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
