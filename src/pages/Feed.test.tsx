import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { http, HttpResponse } from 'msw';
import { SettingsProvider } from '../context/SettingsContext';
import { server } from '../test/server';
import { BASE_URL } from '../api/hackernews';
import { makeStoryList } from '../test/fixtures';
import { mockMatchMedia } from '../test/setup';
import Feed from './Feed';

function renderFeed(route: string) {
    return render(
        <SettingsProvider>
            <MemoryRouter initialEntries={[route]}>
                <Routes>
                    <Route path="/:feedType/:page" element={<Feed />} />
                </Routes>
            </MemoryRouter>
        </SettingsProvider>
    );
}

beforeEach(() => {
    localStorage.clear();
    mockMatchMedia(false);
});

describe('Feed', () => {
    it('shows the loader before data arrives', () => {
        const { container } = renderFeed('/news/1');
        expect(container.querySelector('.loading-section')).toBeInTheDocument();
    });

    it('renders a 30-item list', async () => {
        const { container } = renderFeed('/news/1');
        await waitFor(() => expect(container.querySelectorAll('li.post')).toHaveLength(30));
    });

    it('computes listStart as ((page-1)*30)+1', async () => {
        const { container } = renderFeed('/news/2');
        await waitFor(() => expect(container.querySelector('ol')).toHaveAttribute('start', '31'));
    });

    it('hides Prev on page 1 and shows More when there are 30 items', async () => {
        renderFeed('/news/1');
        await screen.findByText('More ›');
        expect(screen.queryByText('‹ Prev')).not.toBeInTheDocument();
    });

    it('shows Prev on pages after the first', async () => {
        renderFeed('/news/2');
        expect(await screen.findByText('‹ Prev')).toBeInTheDocument();
    });

    it('hides More when there are fewer than 30 items', async () => {
        server.use(http.get(`${BASE_URL}/:feedType`, () => HttpResponse.json(makeStoryList(10))));
        const { container } = renderFeed('/news/1');
        await waitFor(() => expect(container.querySelectorAll('li.post')).toHaveLength(10));
        expect(screen.queryByText('More ›')).not.toBeInTheDocument();
    });

    it('shows an error message when the fetch fails', async () => {
        server.use(http.get(`${BASE_URL}/:feedType`, () => HttpResponse.error()));
        renderFeed('/news/1');
        expect(await screen.findByText('Could not load news stories.')).toBeInTheDocument();
    });

    it('renders the jobs header for the jobs feed', async () => {
        renderFeed('/jobs/1');
        expect(await screen.findByText(/These are jobs at startups/)).toBeInTheDocument();
    });

    it('refetches when navigating to the next page', async () => {
        const { container } = renderFeed('/news/1');
        await waitFor(() => expect(container.querySelector('ol')).toHaveAttribute('start', '1'));
        await userEvent.click(screen.getByText('More ›'));
        await waitFor(() => expect(container.querySelector('ol')).toHaveAttribute('start', '31'));
    });
});
