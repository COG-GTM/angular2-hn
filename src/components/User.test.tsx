import { screen, waitFor } from '@testing-library/react';
import { Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { User } from './User';
import type { User as UserModel } from '../models';
import { mockMatchMedia, renderWithProviders } from '../test/utils';

const userProfile: UserModel = {
    id: 'alice',
    crated_time: 1500000000,
    created: 'July 14, 2017',
    karma: 1234,
    avg: 3,
    about: '<p>Hello <b>world</b></p>',
};

function renderUser(route = '/user/alice') {
    return renderWithProviders(
        <Routes>
            <Route path="/user/:id" element={<User />} />
        </Routes>,
        { route }
    );
}

beforeEach(() => {
    localStorage.clear();
    mockMatchMedia(false);
});

afterEach(() => {
    vi.restoreAllMocks();
});

describe('User', () => {
    it('shows the loader while fetching', () => {
        vi.spyOn(globalThis, 'fetch').mockReturnValue(new Promise(() => {}) as Promise<Response>);

        const { container } = renderUser();

        expect(container.querySelector('.loader')).toBeInTheDocument();
    });

    it('renders karma, creation date and the about section as HTML', async () => {
        vi.spyOn(globalThis, 'fetch').mockResolvedValue({
            json: async () => userProfile,
        } as Response);

        const { container } = renderUser();

        expect(await screen.findByText('alice')).toBeInTheDocument();
        expect(screen.getByText('1234 ★')).toBeInTheDocument();
        expect(screen.getByText('Created July 14, 2017')).toBeInTheDocument();
        expect(container.querySelector('.other-details b')).toHaveTextContent('world');
    });

    it('omits the about section when the user has none', async () => {
        vi.spyOn(globalThis, 'fetch').mockResolvedValue({
            json: async () => ({ ...userProfile, about: '' }),
        } as Response);

        const { container } = renderUser();

        expect(await screen.findByText('alice')).toBeInTheDocument();
        expect(container.querySelector('.other-details')).toBeNull();
    });

    it('shows the error message when the request fails', async () => {
        vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('offline'));

        renderUser('/user/bob');

        await waitFor(() => expect(screen.getByText('Could not load user bob.')).toBeInTheDocument());
    });

    it('navigates back through browser history', async () => {
        vi.spyOn(globalThis, 'fetch').mockResolvedValue({
            json: async () => userProfile,
        } as Response);
        const back = vi.spyOn(window.history, 'back').mockImplementation(() => {});

        const { container } = renderUser();

        await screen.findByText('alice');
        (container.querySelector('.back-button') as HTMLElement).click();

        expect(back).toHaveBeenCalled();
    });
});
