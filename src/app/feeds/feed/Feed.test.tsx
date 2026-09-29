import { screen } from '@testing-library/react';

import { makeFeed } from '../../../test/fixtures';
import { mockFetch, renderWithProviders } from '../../../test/utils';
import { API_BASE_URL } from '../../shared/services/hackernewsApi';
import { Feed } from './Feed';

describe('Feed', () => {
  it('renders the first page with a More link and no Prev link', async () => {
    mockFetch({ [`${API_BASE_URL}/news?page=1`]: makeFeed(30) });
    renderWithProviders(<Feed feedType="news" />, { route: '/news/1', path: '/news/:page' });

    expect(screen.getByText('Loading...')).toBeInTheDocument();
    expect(await screen.findByText('Story 1')).toBeInTheDocument();
    expect(screen.getAllByRole('listitem')).toHaveLength(30);
    expect(screen.getByRole('list')).toHaveAttribute('start', '1');
    expect(screen.getByRole('list')).toHaveClass('list-margin');
    expect(screen.getByRole('link', { name: 'More ›' })).toHaveAttribute('href', '/news/2');
    expect(screen.queryByRole('link', { name: '‹ Prev' })).not.toBeInTheDocument();
  });

  it('numbers later pages and links back to the previous page', async () => {
    mockFetch({ [`${API_BASE_URL}/newest?page=3`]: makeFeed(12) });
    renderWithProviders(<Feed feedType="newest" />, { route: '/newest/3', path: '/newest/:page' });

    expect(await screen.findByText('Story 1')).toBeInTheDocument();
    expect(screen.getByRole('list')).toHaveAttribute('start', '61');
    expect(screen.getByRole('link', { name: '‹ Prev' })).toHaveAttribute('href', '/newest/2');
    expect(screen.queryByRole('link', { name: 'More ›' })).not.toBeInTheDocument();
  });

  it('shows the jobs header on the jobs feed', async () => {
    mockFetch({ [`${API_BASE_URL}/jobs?page=1`]: makeFeed(2, { type: 'job' }) });
    renderWithProviders(<Feed feedType="jobs" />, { route: '/jobs/1', path: '/jobs/:page' });

    expect(await screen.findByText(/jobs at startups that were funded by Y Combinator/)).toBeInTheDocument();
    expect(screen.getByRole('list')).not.toHaveClass('list-margin');
  });

  it('shows an error when the feed cannot be loaded', async () => {
    mockFetch({});
    renderWithProviders(<Feed feedType="ask" />, { route: '/ask/1', path: '/ask/:page' });

    expect(await screen.findByText('Could not load ask stories.')).toBeInTheDocument();
    expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
  });
});
