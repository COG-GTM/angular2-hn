import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { axe } from 'vitest-axe';
import { describe, it, expect, beforeEach } from 'vitest';
import { Header } from '../Header';
import { SettingsProvider } from '@/contexts/SettingsContext';

function renderHeader(initialRoute = '/news/1') {
  return render(
    <MemoryRouter initialEntries={[initialRoute]}>
      <SettingsProvider>
        <Header />
      </SettingsProvider>
    </MemoryRouter>
  );
}

describe('Header', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders the logo image with alt text', () => {
    renderHeader();
    const logo = screen.getByAltText('Logo');
    expect(logo).toBeInTheDocument();
    expect(logo).toHaveAttribute('src', '/assets/images/logo.svg');
  });

  it('renders navigation links: new, show, ask, jobs', () => {
    renderHeader();
    expect(screen.getByRole('link', { name: 'new' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'show' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'ask' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'jobs' })).toBeInTheDocument();
  });

  it('links point to the correct routes', () => {
    renderHeader();
    expect(screen.getByRole('link', { name: 'new' })).toHaveAttribute('href', '/newest/1');
    expect(screen.getByRole('link', { name: 'show' })).toHaveAttribute('href', '/show/1');
    expect(screen.getByRole('link', { name: 'ask' })).toHaveAttribute('href', '/ask/1');
    expect(screen.getByRole('link', { name: 'jobs' })).toHaveAttribute('href', '/jobs/1');
  });

  it('renders the settings icon', () => {
    renderHeader();
    const settingsIcon = screen.getByAltText('Settings');
    expect(settingsIcon).toBeInTheDocument();
    expect(settingsIcon).toHaveAttribute('src', '/assets/images/cog.svg');
  });

  it('does not show Settings panel by default', () => {
    renderHeader();
    expect(screen.queryByText('Select a theme')).not.toBeInTheDocument();
  });

  it('toggles Settings panel when settings icon is clicked', async () => {
    const user = userEvent.setup();
    renderHeader();

    const settingsIcon = screen.getByAltText('Settings');
    await user.click(settingsIcon);
    expect(screen.getByText('Select a theme')).toBeInTheDocument();

    await user.click(settingsIcon);
    expect(screen.queryByText('Select a theme')).not.toBeInTheDocument();
  });

  it('renders the home link pointing to /news/1', () => {
    renderHeader();
    const homeLinks = screen.getAllByRole('link');
    const homeLink = homeLinks.find((link) => link.getAttribute('href') === '/news/1');
    expect(homeLink).toBeDefined();
  });

  it('passes accessibility checks', async () => {
    const { container } = renderHeader();
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
