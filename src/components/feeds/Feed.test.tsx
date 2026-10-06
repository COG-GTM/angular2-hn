import { screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fetchFeed } from '../../api/hnApi';
import { makeStories } from '../../test/fixtures';
import { renderWithProviders } from '../../test/render';
import { Feed } from './Feed';

vi.mock('../../api/hnApi');

const mockFetchFeed = vi.mocked(fetchFeed);

beforeEach(() => {
    localStorage.clear();
    mockFetchFeed.mockReset();
    vi.mocked(window.scrollTo).mockClear();
});

describe('Feed', () => {
    it('shows the loader while loading', () => {
        mockFetchFeed.mockReturnValue(new Promise(() => {}));
        renderWithProviders(<Feed feedType="news" page={1} />);
        expect(screen.getByRole('status', { name: 'Loading' })).toBeInTheDocument();
        expect(mockFetchFeed).toHaveBeenCalledWith('news', 1, expect.any(AbortSignal));
    });

    it('renders the list starting at the right number and scrolls to top', async () => {
        mockFetchFeed.mockResolvedValue(makeStories(30));
        const { container } = renderWithProviders(<Feed feedType="newest" page={2} />);
        await screen.findByText('Story 1');
        const ol = container.querySelector('ol')!;
        expect(ol).toHaveAttribute('start', '31');
        expect(ol).toHaveClass('list-margin');
        expect(container.querySelectorAll('li.post')).toHaveLength(30);
        expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
    });

    it('hides prev on page 1 and shows more when 30 items are returned', async () => {
        mockFetchFeed.mockResolvedValue(makeStories(30));
        renderWithProviders(<Feed feedType="news" page={1} />);
        expect(await screen.findByRole('link', { name: 'More ›' })).toHaveAttribute('href', '/news/2');
        expect(screen.queryByRole('link', { name: '‹ Prev' })).not.toBeInTheDocument();
    });

    it('shows prev on page 2 and hides more when fewer than 30 items are returned', async () => {
        mockFetchFeed.mockResolvedValue(makeStories(12));
        renderWithProviders(<Feed feedType="show" page={2} />);
        expect(await screen.findByRole('link', { name: '‹ Prev' })).toHaveAttribute('href', '/show/1');
        expect(screen.queryByRole('link', { name: 'More ›' })).not.toBeInTheDocument();
    });

    it('renders the jobs header without list margin', async () => {
        mockFetchFeed.mockResolvedValue(makeStories(5, { type: 'job' }));
        const { container } = renderWithProviders(<Feed feedType="jobs" page={1} />);
        expect(await screen.findByText(/jobs at startups that were funded by Y Combinator/)).toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'Triplebyte' })).toHaveAttribute(
            'href',
            'https://triplebyte.com/?ref=yc_jobs'
        );
        expect(container.querySelector('ol')).not.toHaveClass('list-margin');
    });

    it('does not render the jobs header for other feeds', async () => {
        mockFetchFeed.mockResolvedValue(makeStories(5));
        renderWithProviders(<Feed feedType="ask" page={1} />);
        await screen.findByText('Story 1');
        expect(screen.queryByText(/funded by Y Combinator/)).not.toBeInTheDocument();
    });

    it('shows an error message when the request fails', async () => {
        mockFetchFeed.mockRejectedValue(new Error('boom'));
        renderWithProviders(<Feed feedType="ask" page={1} />);
        expect(await screen.findByRole('alert')).toHaveTextContent('Could not load ask stories.');
    });
});
