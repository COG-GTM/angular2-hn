import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import * as api from '../api/hackernews';
import { UserPage } from './UserPage';
import type { User } from '../models';

function makeUser(overrides: Partial<User> = {}): User {
    return {
        id: 'pg',
        crated_time: 0,
        created: 'April 3, 2006',
        karma: 155000,
        avg: 0,
        about: '<p>Bug fixer.</p>',
        ...overrides,
    };
}

function renderPage(path = '/user/pg') {
    return render(
        <MemoryRouter initialEntries={['/news/1', path]} initialIndex={1}>
            <Routes>
                <Route path="/news/:page" element={<div>feed page</div>} />
                <Route path="/user/:id" element={<UserPage />} />
            </Routes>
        </MemoryRouter>
    );
}

beforeEach(() => {
    localStorage.clear();
});

afterEach(() => {
    vi.restoreAllMocks();
});

describe('UserPage', () => {
    it('shows the loader until the user resolves', () => {
        vi.spyOn(api, 'fetchUser').mockReturnValue(new Promise(() => {}));

        const { container } = renderPage();

        expect(container.querySelector('.loading-section')).toBeInTheDocument();
    });

    it('renders the routed user profile', async () => {
        vi.spyOn(api, 'fetchUser').mockResolvedValue(makeUser());

        renderPage('/user/pg');

        expect(await screen.findByText('Profile: pg')).toBeInTheDocument();
        expect(api.fetchUser).toHaveBeenCalledWith('pg', expect.any(AbortSignal));
        expect(screen.getByText('155000 ★')).toBeInTheDocument();
        expect(screen.getByText('Created April 3, 2006')).toBeInTheDocument();
        expect(screen.getByText('Bug fixer.')).toBeInTheDocument();
    });

    it('omits the about block when the user has no bio', async () => {
        vi.spyOn(api, 'fetchUser').mockResolvedValue(makeUser({ about: '' }));

        const { container } = renderPage();

        await screen.findByText('Profile: pg');
        expect(container.querySelector('.other-details')).not.toBeInTheDocument();
    });

    it('shows the user specific error message when the request fails', async () => {
        vi.spyOn(api, 'fetchUser').mockRejectedValue(new Error('nope'));

        renderPage('/user/nobody');

        expect(await screen.findByText('Could not load user nobody.')).toBeInTheDocument();
    });

    it('navigates back when the back button is clicked', async () => {
        vi.spyOn(api, 'fetchUser').mockResolvedValue(makeUser());

        const { container } = renderPage();

        await screen.findByText('Profile: pg');
        fireEvent.click(container.querySelector('.back-button') as HTMLElement);

        await waitFor(() => expect(screen.getByText('feed page')).toBeInTheDocument());
    });
});
