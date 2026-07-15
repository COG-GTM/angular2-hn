import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { http, HttpResponse } from 'msw';
import { SettingsProvider } from '../context/SettingsContext';
import { server } from '../test/server';
import { BASE_URL } from '../api/hackernews';
import { mockMatchMedia } from '../test/setup';
import ItemDetails from './ItemDetails';

function renderItem(id: number, extraEntries: string[] = []) {
    const entries = [...extraEntries, `/item/${id}`];
    return render(
        <SettingsProvider>
            <MemoryRouter initialEntries={entries} initialIndex={entries.length - 1}>
                <Routes>
                    <Route path="/:feedType/:page" element={<div>FEED PAGE</div>} />
                    <Route path="/item/:id" element={<ItemDetails />} />
                </Routes>
            </MemoryRouter>
        </SettingsProvider>
    );
}

beforeEach(() => {
    localStorage.clear();
    mockMatchMedia(false);
});

describe('ItemDetails', () => {
    it('renders the story content HTML', async () => {
        renderItem(500);
        expect(await screen.findByText('Story body content')).toBeInTheDocument();
    });

    it('renders the comment list including nested and deleted comments', async () => {
        renderItem(500);
        expect(await screen.findByText('Parent comment')).toBeInTheDocument();
        expect(screen.getByText('Nested child comment')).toBeInTheDocument();
        expect(screen.getByText(/Comment Deleted/)).toBeInTheDocument();
    });

    it('renders poll bars with width proportional to the vote count', async () => {
        const { container } = renderItem(600);
        await waitFor(() => expect(container.querySelectorAll('.pollBar')).toHaveLength(2));
        const bars = container.querySelectorAll<HTMLElement>('.pollBar');
        expect(bars[0].style.width).toBe('75%');
        expect(bars[1].style.width).toBe('25%');
        expect(screen.getByText('30 points')).toBeInTheDocument();
    });

    it('scrolls to the top on load', async () => {
        const scrollSpy = vi.spyOn(window, 'scrollTo');
        renderItem(500);
        await screen.findByText('Story body content');
        expect(scrollSpy).toHaveBeenCalledWith(0, 0);
    });

    it('goes back in history when the back button is clicked', async () => {
        const { container } = renderItem(500, ['/news/1']);
        await screen.findByText('Story body content');
        const backButton = container.querySelector('.back-button') as HTMLElement;
        await userEvent.click(backButton);
        expect(await screen.findByText('FEED PAGE')).toBeInTheDocument();
    });

    it('shows an error message when the fetch fails', async () => {
        server.use(http.get(`${BASE_URL}/item/:id`, () => HttpResponse.error()));
        renderItem(999);
        expect(await screen.findByText('Could not load item comments.')).toBeInTheDocument();
    });
});
