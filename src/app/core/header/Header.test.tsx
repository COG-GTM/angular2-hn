import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { renderWithProviders } from '../../../test/renderWithProviders';
import { Header } from './Header';

describe('Header', () => {
  it('links to every feed', () => {
    renderWithProviders(<Header />, { route: '/news/1' });

    expect(screen.getByRole('link', { name: 'Logo' })).toHaveAttribute('href', '/news/1');
    expect(screen.getByRole('link', { name: 'new' })).toHaveAttribute('href', '/newest/1');
    expect(screen.getByRole('link', { name: 'show' })).toHaveAttribute('href', '/show/1');
    expect(screen.getByRole('link', { name: 'ask' })).toHaveAttribute('href', '/ask/1');
    expect(screen.getByRole('link', { name: 'jobs' })).toHaveAttribute('href', '/jobs/1');
  });

  it('marks the current feed as active', () => {
    renderWithProviders(<Header />, { route: '/show/1' });

    expect(screen.getByRole('link', { name: 'show' })).toHaveClass('active');
    expect(screen.getByRole('link', { name: 'ask' })).not.toHaveClass('active');
  });

  it('opens and closes the settings panel', async () => {
    const user = userEvent.setup();
    renderWithProviders(<Header />, { route: '/news/1' });

    expect(screen.queryByRole('heading', { name: 'Settings' })).toBeNull();

    await user.click(screen.getByAltText('Settings'));
    expect(screen.getByRole('heading', { name: 'Settings' })).toBeInTheDocument();

    await user.click(screen.getByText('×'));
    expect(screen.queryByRole('heading', { name: 'Settings' })).toBeNull();
  });
});
