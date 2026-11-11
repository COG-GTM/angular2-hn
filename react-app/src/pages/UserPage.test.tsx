import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { routes } from '../routes';
import { SettingsProvider } from '../settings';

const PG = 'https://api.hnpwa.com/v0/user/pg.json';

function stubApi(byUrl: Record<string, unknown>) {
    const fn = vi.fn(async (url: string) =>
        url in byUrl ? Response.json(byUrl[url]) : new Response('nope', { status: 404 })
    );
    vi.stubGlobal('fetch', fn);
    return fn;
}

function renderAt(path: string) {
    const router = createMemoryRouter(routes, { initialEntries: ['/news/1', path], initialIndex: 1 });
    render(
        <SettingsProvider>
            <RouterProvider router={router} />
        </SettingsProvider>
    );
    return router;
}

afterEach(() => vi.unstubAllGlobals());

describe('UserPage', () => {
    it('renders the profile with karma, age and sanitized about HTML', async () => {
        stubApi({
            [PG]: {
                id: 'pg',
                karma: 157236,
                created: '19 years ago',
                created_time: 1160418092,
                about: '<p>Bug fixer.</p><img src="x" onerror="alert(1)">',
            },
        });
        renderAt('/user/pg');
        expect(await screen.findByText('157236 ★')).toBeInTheDocument();
        expect(screen.getByText('Created 19 years ago')).toBeInTheDocument();
        expect(screen.getByText('Profile: pg')).toBeInTheDocument();
        expect(screen.getByText('Bug fixer.')).toBeInTheDocument();
        expect(screen.getByTestId('user-page').innerHTML).not.toContain('onerror');
    });

    it('omits the about section when empty', async () => {
        stubApi({ [PG]: { id: 'pg', karma: 1, created: 'today', created_time: 0 } });
        renderAt('/user/pg');
        await screen.findByText('1 ★');
        expect(document.querySelector('.other-details')).toBeNull();
    });

    it('goes back from the mobile back button', async () => {
        stubApi({
            [PG]: { id: 'pg', karma: 1, created: 'today', created_time: 0 },
            'https://node-hnapi.herokuapp.com/news?page=1': [],
        });
        const router = renderAt('/user/pg');
        await userEvent.click(await screen.findByRole('button', { name: 'Back' }));
        expect(router.state.location.pathname).toBe('/news/1');
    });

    it('goes back from the keyboard', async () => {
        stubApi({
            [PG]: { id: 'pg', karma: 1, created: 'today', created_time: 0 },
            'https://node-hnapi.herokuapp.com/news?page=1': [],
        });
        const router = renderAt('/user/pg');
        (await screen.findByRole('button', { name: 'Back' })).focus();
        await userEvent.keyboard('{Enter}');
        expect(router.state.location.pathname).toBe('/news/1');
    });

    it('shows an error for an unknown user', async () => {
        stubApi({});
        renderAt('/user/nobody');
        expect(await screen.findByText(/Could not load user nobody\./)).toBeInTheDocument();
    });
});
