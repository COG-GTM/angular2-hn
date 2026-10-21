import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { renderWithProviders } from '../../test/renderWithProviders';
import Header from './Header';

const renderAt = (route: string) => renderWithProviders(<Header />, { route, path: '/:feedType/:page' });

describe('Header', () => {
  it('renders the logo home link and the feed nav links to page 1', () => {
    renderAt('/news/1');
    expect(screen.getByAltText('Logo').closest('a')).toHaveAttribute('href', '/news/1');
    expect(screen.getByRole('link', { name: 'new' })).toHaveAttribute('href', '/newest/1');
    expect(screen.getByRole('link', { name: 'show' })).toHaveAttribute('href', '/show/1');
    expect(screen.getByRole('link', { name: 'ask' })).toHaveAttribute('href', '/ask/1');
    expect(screen.getByRole('link', { name: 'jobs' })).toHaveAttribute('href', '/jobs/1');
  });

  it('marks the home link active only on /news/1', () => {
    renderAt('/news/1');
    expect(screen.getByAltText('Logo').closest('a')).toHaveClass('home-link', 'active');
    expect(screen.getByRole('link', { name: 'new' })).not.toHaveClass('active');
  });

  it('marks a feed link active only on its exact page-1 path, like routerLinkActive', () => {
    const { unmount } = renderAt('/show/1');
    expect(screen.getByRole('link', { name: 'show' })).toHaveClass('active');
    expect(screen.getByRole('link', { name: 'ask' })).not.toHaveClass('active');
    expect(screen.getByAltText('Logo').closest('a')).not.toHaveClass('active');
    unmount();
    renderAt('/show/2');
    expect(screen.getByRole('link', { name: 'show' })).not.toHaveClass('active');
  });

  it('navigates and scrolls to the top when a nav link is clicked', async () => {
    renderAt('/news/1');
    await userEvent.click(screen.getByRole('link', { name: 'jobs' }));
    expect(screen.getByTestId('location')).toHaveTextContent('/jobs/1');
    expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
    expect(screen.getByRole('link', { name: 'jobs' })).toHaveClass('active');
  });

  it('opens settings with the cog and closes/reopens it from the keyboard', async () => {
    renderAt('/news/1');
    await userEvent.click(screen.getByRole('button', { name: 'Settings' }));
    screen.getByRole('button', { name: 'Close' }).focus();
    await userEvent.keyboard(' ');
    expect(screen.queryByRole('heading', { name: 'Settings' })).not.toBeInTheDocument();
    screen.getByRole('button', { name: 'Settings' }).focus();
    await userEvent.keyboard('{Enter}');
    expect(screen.getByRole('heading', { name: 'Settings' })).toBeInTheDocument();
  });
});
