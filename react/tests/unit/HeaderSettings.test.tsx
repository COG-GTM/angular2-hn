import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderApp } from './testUtils';

describe('Header + Settings', () => {
  it('renders the navigation links', async () => {
    renderApp({ route: '/news/1' });
    expect(screen.getByText('new')).toBeInTheDocument();
    expect(screen.getByText('show')).toBeInTheDocument();
    expect(screen.getByText('ask')).toBeInTheDocument();
    expect(screen.getByText('jobs')).toBeInTheDocument();
  });

  it('opens the settings modal when the cog is clicked', async () => {
    renderApp({ route: '/news/1' });
    expect(screen.queryByText('Settings')).toBeNull();
    await userEvent.click(screen.getByAltText('Settings'));
    expect(screen.getByText('Settings')).toBeInTheDocument();
    expect(screen.getByText('Open links in a new tab')).toBeInTheDocument();
  });

  it('changes the theme and persists it, updating the wrapper class', async () => {
    localStorage.clear();
    const { container } = renderApp({ route: '/news/1' });
    await userEvent.click(screen.getByAltText('Settings'));
    const nightRadio = screen.getByDisplayValue('night');
    await userEvent.click(nightRadio);
    expect(localStorage.getItem('theme')).toBe('night');
    expect(container.querySelector('div.night')).not.toBeNull();
  });

  it('persists the open-links-in-new-tab preference', async () => {
    localStorage.clear();
    renderApp({ route: '/news/1' });
    await userEvent.click(screen.getByAltText('Settings'));
    const checkbox = screen.getByRole('checkbox');
    await userEvent.click(checkbox);
    expect(localStorage.getItem('openLinkInNewTab')).toBe('true');
  });
});
