import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

import { makeFeed, makeStory, user } from '../test/fixtures';
import { mockFetch, mockMatchMedia } from '../test/utils';
import { App } from './App';
import { API_BASE_URL, USER_API_BASE_URL } from './shared/services/hackernewsApi';
import { SettingsProvider } from './shared/settings/SettingsProvider';

function renderApp(route: string) {
  return render(
    <SettingsProvider>
      <MemoryRouter initialEntries={[route]}>
        <App />
      </MemoryRouter>
    </SettingsProvider>
  );
}

describe('App', () => {
  beforeEach(() => {
    mockMatchMedia(false);
    mockFetch({
      [`${API_BASE_URL}/news?page=1`]: makeFeed(30),
      [`${API_BASE_URL}/show?page=1`]: makeFeed(3, { title: 'Show HN: thing' }),
      [`${API_BASE_URL}/item/1`]: makeStory({ content: 'Item body' }),
      [`${USER_API_BASE_URL}/user/pg.json`]: user,
    });
  });

  it('redirects the root route to the first news page', async () => {
    renderApp('/');
    expect(await screen.findByText('Story 1')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'More ›' })).toHaveAttribute('href', '/news/2');
  });

  it('navigates between feeds from the header', async () => {
    const events = userEvent.setup();
    renderApp('/news/1');
    await screen.findByText('Story 1');

    await events.click(screen.getByRole('link', { name: 'show' }));
    expect(await screen.findAllByText('Show HN: thing')).toHaveLength(3);
    expect(screen.getByRole('link', { name: 'show' })).toHaveClass('active');
  });

  it('lazily loads item pages', async () => {
    renderApp('/item/1');
    expect(await screen.findByText('Item body')).toBeInTheDocument();
  });

  it('lazily loads user pages', async () => {
    renderApp('/user/pg');
    expect(await screen.findByText('Profile: pg')).toBeInTheDocument();
  });

  it('opens settings and applies theme, font size and link preferences', async () => {
    const events = userEvent.setup();
    const { container } = renderApp('/news/1');
    await screen.findByText('Story 1');

    expect(container.firstElementChild).toHaveClass('default');
    await events.click(screen.getByAltText('Settings'));
    const dialog = screen.getByRole('dialog', { name: 'Settings' });

    await events.click(within(dialog).getByLabelText('Night'));
    expect(container.firstElementChild).toHaveClass('night');
    await events.click(within(dialog).getByLabelText('Black (AMOLED)'));
    expect(container.firstElementChild).toHaveClass('amoledblack');
    expect(localStorage.getItem('theme')).toBe('amoledblack');

    const fontSize = within(dialog).getByLabelText('Font size:');
    await events.clear(fontSize);
    await events.type(fontSize, '20');
    expect(screen.getByRole('link', { name: 'Story 1' })).toHaveStyle({ fontSize: '20px' });

    await events.click(within(dialog).getByLabelText(/Open links in a new tab/));
    expect(screen.getByRole('link', { name: 'Story 1' })).toHaveAttribute('target', '_blank');

    await events.click(within(dialog).getByLabelText('Close settings'));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
