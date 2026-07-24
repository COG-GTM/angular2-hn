// @vitest-environment jsdom
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { Story } from '../models';
import { SettingsProvider } from '../context/SettingsContext';
import FrontPage from './FrontPage';

vi.mock('../api/algolia', () => ({
    fetchFrontPageForDate: vi.fn(),
}));

import { fetchFrontPageForDate } from '../api/algolia';

const mockedFetch = vi.mocked(fetchFrontPageForDate);

function makeStory(id: number, points = 1): Story {
    return {
        id,
        title: `Story ${id}`,
        points,
        user: 'user',
        time: 0,
        time_ago: 'Jun 15, 2020',
        comments_count: 3,
        type: 'story',
        url: `https://example.com/${id}`,
        domain: 'example.com',
        comments: [],
        poll: [],
        poll_votes_count: 0,
        dead: false,
        deleted: false,
    } as Story;
}

function renderFrontPage(path: string) {
    return render(
        <SettingsProvider>
            <MemoryRouter initialEntries={[path]}>
                <Routes>
                    <Route path='/front-page' element={<FrontPage />} />
                    <Route path='/front-page/:date' element={<FrontPage />} />
                </Routes>
            </MemoryRouter>
        </SettingsProvider>
    );
}

describe('FrontPage', () => {
    beforeEach(() => {
        window.scrollTo = vi.fn();
        window.matchMedia = vi.fn().mockImplementation((query: string) => ({
            matches: false,
            media: query,
            addEventListener: vi.fn(),
            removeEventListener: vi.fn(),
        }));
    });

    afterEach(() => {
        cleanup();
        vi.clearAllMocks();
    });

    it('shows a loader while stories are loading', () => {
        mockedFetch.mockReturnValue(new Promise(() => {}));
        const { container } = renderFrontPage('/front-page/2020-06-15');
        expect(container.querySelector('.loader')).not.toBeNull();
    });

    it('fetches stories for the date in the route and renders them', async () => {
        mockedFetch.mockResolvedValue([makeStory(1), makeStory(2)]);
        renderFrontPage('/front-page/2020-06-15');

        await waitFor(() => {
            expect(screen.getByText('Story 1')).not.toBeNull();
        });
        const requestedDate = mockedFetch.mock.calls[0][0];
        expect(requestedDate.getFullYear()).toBe(2020);
        expect(requestedDate.getMonth()).toBe(5);
        expect(requestedDate.getDate()).toBe(15);
        expect(screen.getByText(/Front page on/)).not.toBeNull();
    });

    it('defaults to today when no date is in the route', async () => {
        mockedFetch.mockResolvedValue([]);
        renderFrontPage('/front-page');

        await waitFor(() => {
            expect(mockedFetch).toHaveBeenCalled();
        });
        const requestedDate = mockedFetch.mock.calls[0][0];
        const today = new Date();
        expect(requestedDate.getFullYear()).toBe(today.getFullYear());
        expect(requestedDate.getMonth()).toBe(today.getMonth());
        expect(requestedDate.getDate()).toBe(today.getDate());
    });

    it('falls back to today for well-formed but invalid dates', async () => {
        mockedFetch.mockResolvedValue([]);
        renderFrontPage('/front-page/2020-13-45');

        await waitFor(() => {
            expect(mockedFetch).toHaveBeenCalled();
        });
        const requestedDate = mockedFetch.mock.calls[0][0];
        const today = new Date();
        expect(requestedDate.getFullYear()).toBe(today.getFullYear());
        expect(requestedDate.getMonth()).toBe(today.getMonth());
        expect(requestedDate.getDate()).toBe(today.getDate());
    });

    it('shows an empty state when no stories are returned', async () => {
        mockedFetch.mockResolvedValue([]);
        renderFrontPage('/front-page/2010-01-01');

        await waitFor(() => {
            expect(screen.getByText('No stories found for this day.')).not.toBeNull();
        });
    });

    it('shows an error message when the request fails', async () => {
        mockedFetch.mockRejectedValue(new Error('boom'));
        renderFrontPage('/front-page/2020-06-15');

        await waitFor(() => {
            expect(screen.getByText('Could not load stories for 2020-06-15.')).not.toBeNull();
        });
    });

    it('renders previous-year links and disables Next day/Today on today', async () => {
        mockedFetch.mockResolvedValue([makeStory(1)]);
        renderFrontPage('/front-page');

        await waitFor(() => {
            expect(screen.getByText('Story 1')).not.toBeNull();
        });
        const currentYear = new Date().getFullYear();
        const link = screen.getByText(String(currentYear - 1));
        expect(link.getAttribute('href')).toContain('/front-page/');
        expect((screen.getByText('Next day ›') as HTMLButtonElement).disabled).toBe(true);
        expect((screen.getByText('Today') as HTMLButtonElement).disabled).toBe(true);
    });
});
