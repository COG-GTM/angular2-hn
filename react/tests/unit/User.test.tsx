import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';
import { renderApp } from './testUtils';

describe('User', () => {
  it('renders the user id, karma, created date and about', async () => {
    const { container } = renderApp({ route: '/user/user1' });
    await screen.findByText('Created 5 years ago');
    expect(screen.getAllByText('user1').length).toBeGreaterThan(0);
    expect(screen.getByText(/1234/)).toBeInTheDocument();
    expect(container.querySelector('.other-details p')?.innerHTML).toContain('<i>user1</i>');
  });

  it('renders an error message when the user fails to load', async () => {
    renderApp({ route: '/user/ghost' });
    await screen.findByText('Could not load user ghost.');
  });
});
