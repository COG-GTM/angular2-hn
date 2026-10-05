import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { mockFetch, renderApp, renderWithProviders } from '../../test/render';
import { Header } from './Header';

describe('Header', () => {
  beforeEach(() => {
    mockFetch(() => []);
  });

  it('renders the logo home link and the feed nav links', () => {
    renderWithProviders(<Header />, { route: '/news/1' });
    expect(screen.getByAltText('Logo')).toHaveAttribute('src', 'assets/images/logo.svg');
    expect(screen.getByAltText('Logo').closest('a')).toHaveAttribute('href', '/news/1');
    expect(screen.getByAltText('Logo').closest('a')).toHaveClass('home-link');

    const nav = document.querySelector('.header-nav') as HTMLElement;
    const links = within(nav).getAllByRole('link');
    expect(links.map((link) => [link.textContent, link.getAttribute('href')])).toEqual([
      ['new', '/newest/1'],
      ['show', '/show/1'],
      ['ask', '/ask/1'],
      ['jobs', '/jobs/1'],
    ]);
    expect(nav).toHaveTextContent('new | show | ask | jobs');
  });

  it('marks the home link active on /news/1', () => {
    renderWithProviders(<Header />, { route: '/news/1' });
    expect(screen.getByAltText('Logo').closest('a')).toHaveClass('active');
    for (const label of ['new', 'show', 'ask', 'jobs']) {
      expect(screen.getByRole('link', { name: label })).not.toHaveClass('active');
    }
  });

  it.each([
    ['/newest/1', 'new'],
    ['/show/1', 'show'],
    ['/ask/1', 'ask'],
    ['/jobs/1', 'jobs'],
  ])('marks only the matching nav link active on %s', (route, label) => {
    renderWithProviders(<Header />, { route });
    expect(screen.getByRole('link', { name: label })).toHaveClass('active');
    expect(screen.getByAltText('Logo').closest('a')).not.toHaveClass('active');
    const others = ['new', 'show', 'ask', 'jobs'].filter((other) => other !== label);
    for (const other of others) {
      expect(screen.getByRole('link', { name: other })).not.toHaveClass('active');
    }
  });

  it('navigates between feeds, scrolls to top and updates the active link', async () => {
    const user = userEvent.setup();
    renderApp({ route: '/news/1' });

    await user.click(screen.getByRole('link', { name: 'show' }));
    expect(screen.getByTestId('location')).toHaveTextContent('/show/1');
    expect(screen.getByRole('link', { name: 'show' })).toHaveClass('active');
    expect(window.scrollTo).toHaveBeenCalledWith(0, 0);

    await user.click(screen.getByRole('link', { name: 'jobs' }));
    expect(screen.getByTestId('location')).toHaveTextContent('/jobs/1');
    expect(screen.getByRole('link', { name: 'show' })).not.toHaveClass('active');

    await user.click(screen.getByAltText('Logo'));
    expect(screen.getByTestId('location')).toHaveTextContent('/news/1');
    expect(screen.getByAltText('Logo').closest('a')).toHaveClass('active');
  });

  it('toggles the settings panel with the cog', async () => {
    const user = userEvent.setup();
    renderWithProviders(<Header />, { route: '/news/1' });
    expect(screen.queryByRole('dialog', { name: 'Settings' })).not.toBeInTheDocument();

    const cog = screen.getByAltText('Settings');
    expect(cog).toHaveAttribute('src', 'assets/images/cog.svg');
    await user.click(cog);
    expect(screen.getByRole('dialog', { name: 'Settings' })).toBeInTheDocument();

    await user.click(cog);
    expect(screen.queryByRole('dialog', { name: 'Settings' })).not.toBeInTheDocument();
  });

  it('opens and closes the settings panel from the keyboard', async () => {
    const user = userEvent.setup();
    renderWithProviders(<Header />, { route: '/news/1' });
    const cog = screen.getByRole('button', { name: 'Settings' });
    cog.focus();
    await user.keyboard('{Enter}');
    expect(screen.getByRole('dialog', { name: 'Settings' })).toBeInTheDocument();

    screen.getByRole('button', { name: 'Close settings' }).focus();
    await user.keyboard(' ');
    expect(screen.queryByRole('dialog', { name: 'Settings' })).not.toBeInTheDocument();
  });

  it('renders the settings panel when settings.showSettings is true', () => {
    renderWithProviders(<Header />, { settings: { showSettings: true } });
    expect(screen.getByRole('dialog', { name: 'Settings' })).toBeInTheDocument();
  });
});
