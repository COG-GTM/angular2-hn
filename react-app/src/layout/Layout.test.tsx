import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Layout } from './Layout';
import { renderWithProviders } from '../test/render';

function renderLayout(route = '/news/1') {
  return renderWithProviders(<Layout />, { route, path: '/:feed/:page' });
}

describe('Layout shell (header, settings, footer)', () => {
  beforeEach(() => localStorage.clear());

  it('renders the logo home link, feed nav and footer', () => {
    renderLayout();
    expect(screen.getByRole('link', { name: 'Hacker News home' })).toHaveAttribute('href', '/news/1');
    const nav = screen.getByRole('navigation');
    expect(within(nav).getAllByRole('link').map((a) => [a.textContent, a.getAttribute('href')])).toEqual([
      ['new', '/newest/1'],
      ['show', '/show/1'],
      ['ask', '/ask/1'],
      ['jobs', '/jobs/1'],
    ]);
    expect(screen.getByRole('link', { name: 'GitHub' })).toHaveAttribute('target', '_blank');
  });

  it('marks the current feed link active', () => {
    renderLayout('/show/1');
    expect(screen.getByRole('link', { name: 'show' })).toHaveClass('active');
    expect(screen.getByRole('link', { name: 'new' })).not.toHaveClass('active');
  });

  it('opens and closes the settings popup from the cog, close button and Escape', async () => {
    const user = userEvent.setup();
    renderLayout();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Settings' }));
    expect(screen.getByRole('dialog', { name: 'Settings' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Close settings' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Settings' }));
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('switches theme on the root element and persists it', async () => {
    const user = userEvent.setup();
    renderLayout();
    await user.click(screen.getByRole('button', { name: 'Settings' }));
    expect(screen.getByRole('radio', { name: 'Default' })).toBeChecked();
    await user.click(screen.getByRole('radio', { name: 'Night' }));
    expect(screen.getByTestId('theme-root')).toHaveClass('night');
    await user.click(screen.getByRole('radio', { name: 'Black (AMOLED)' }));
    expect(screen.getByTestId('theme-root')).toHaveClass('amoledblack');
    expect(localStorage.getItem('theme')).toBe('amoledblack');
  });

  it('persists new-tab, font size and list spacing settings', async () => {
    const user = userEvent.setup();
    renderLayout();
    await user.click(screen.getByRole('button', { name: 'Settings' }));
    await user.click(screen.getByRole('checkbox', { name: /open links in a new tab/i }));
    expect(localStorage.getItem('openLinkInNewTab')).toBe('true');
    const font = screen.getByRole('spinbutton', { name: /font size/i });
    await user.clear(font);
    await user.type(font, '20');
    expect(localStorage.getItem('titleFontSize')).toBe('20');
    const spacing = screen.getByRole('spinbutton', { name: /list spacing/i });
    await user.clear(spacing);
    await user.type(spacing, '8');
    expect(localStorage.getItem('listSpacing')).toBe('8');
  });
});
