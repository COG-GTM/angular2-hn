import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { http, HttpResponse } from 'msw';
import { SettingsProvider } from '../context/SettingsContext';
import { server } from '../test/server';
import { BASE_URL } from '../api/hackernews';
import { mockMatchMedia } from '../test/setup';
import User from './User';

function renderUser(id: string, extraEntries: string[] = []) {
    const entries = [...extraEntries, `/user/${id}`];
    return render(
        <SettingsProvider>
            <MemoryRouter initialEntries={entries} initialIndex={entries.length - 1}>
                <Routes>
                    <Route path="/:feedType/:page" element={<div>FEED PAGE</div>} />
                    <Route path="/user/:id" element={<User />} />
                </Routes>
            </MemoryRouter>
        </SettingsProvider>
    );
}

beforeEach(() => {
    localStorage.clear();
    mockMatchMedia(false);
});

describe('User', () => {
    it('renders the user fields', async () => {
        renderUser('alice');
        expect(await screen.findByText('Created September 1, 2017')).toBeInTheDocument();
        expect(screen.getByText('1234 ★')).toBeInTheDocument();
        expect(screen.getByText('Hello, I am alice')).toBeInTheDocument();
    });

    it('shows an error message on failure', async () => {
        server.use(http.get(`${BASE_URL}/user/:id`, () => HttpResponse.error()));
        renderUser('nobody');
        expect(await screen.findByText('Could not load user nobody.')).toBeInTheDocument();
    });

    it('goes back in history when the back button is clicked', async () => {
        const { container } = renderUser('alice', ['/news/1']);
        await screen.findByText('Created September 1, 2017');
        const backButton = container.querySelector('.back-button') as HTMLElement;
        await userEvent.click(backButton);
        expect(await screen.findByText('FEED PAGE')).toBeInTheDocument();
    });
});
