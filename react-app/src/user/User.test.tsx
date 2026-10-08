import { fireEvent, screen } from '@testing-library/react';
import { Link } from 'react-router';
import { describe, expect, it, vi } from 'vitest';

import { USER_API_BASE_URL } from '../shared/services/hackernews-api';
import { makeUser } from '../test/fixtures';
import { mockFetch, renderApp, renderRoutes, renderWithProviders } from '../test/utils';
import { User } from './User';

const USER_URL = `${USER_API_BASE_URL}/user/`;

function renderUser(id = 'pg') {
    return renderWithProviders(<User />, { path: '/user/:id', route: `/user/${id}` });
}

describe('User', () => {
    it('shows the loader until the user loads, then renders the profile', async () => {
        let release!: () => void;
        const gate = new Promise<void>((resolve) => (release = resolve));
        const inner = mockFetch({ [USER_URL]: makeUser() });
        vi.stubGlobal(
            'fetch',
            vi.fn(async (input: RequestInfo | URL) => {
                await gate;
                return inner(input);
            })
        );

        const { container } = renderUser();
        expect(container.querySelector('.loading-section')).toBeInTheDocument();
        expect(container.querySelector('.profile')).not.toBeInTheDocument();

        release();
        expect(await screen.findByText('Profile: pg')).toBeInTheDocument();
        expect(container.querySelector('.loading-section')).not.toBeInTheDocument();
        expect(container.querySelector('.main-details .name')).toHaveTextContent('pg');
        expect(container.querySelector('.main-details .right')).toHaveTextContent('155000 ★');
        expect(container.querySelector('.main-details .age')).toHaveTextContent('Created 18 years ago');
        expect(container.querySelector('.mobile.item-header > p.title-block > span.back-button')).toBeInTheDocument();
        expect(container.querySelector('.other-details p')).toHaveTextContent('Bug fixer.');
    });

    it('requests the HNPWA user endpoint for the route id', async () => {
        const fetchMock = mockFetch({ [USER_URL]: makeUser({ id: 'dang' }) });
        renderUser('dang');
        expect(await screen.findByText('Profile: dang')).toBeInTheDocument();
        expect(fetchMock.mock.calls[0][0]).toBe(`${USER_API_BASE_URL}/user/dang.json`);
    });

    it('hides other-details when about is empty', async () => {
        mockFetch({ [USER_URL]: makeUser({ about: '' }) });
        const { container } = renderUser();
        await screen.findByText('Profile: pg');
        expect(container.querySelector('.other-details')).not.toBeInTheDocument();
    });

    it('sanitizes the about HTML but keeps links and formatting', async () => {
        mockFetch({
            [USER_URL]: makeUser({
                about: 'Hi <i>there</i> <a href="https://example.com">site</a><img src=x onerror="alert(1)"><script>alert(2)</script><a href="javascript:alert(3)">bad</a>',
            }),
        });
        const { container } = renderUser();
        await screen.findByText('Profile: pg');
        const about = container.querySelector('.other-details p')!;
        expect(about.querySelector('i')).toHaveTextContent('there');
        expect(about.querySelector('a[href="https://example.com"]')).toHaveTextContent('site');
        expect(about.querySelector('script')).toBeNull();
        expect(about.querySelector('[onerror]')).toBeNull();
        expect(about.innerHTML).not.toContain('javascript:');
        expect(about.innerHTML).not.toContain('onerror');
    });

    it.each([
        ['a null body', null],
        ['a non-JSON body', "Cannot read property 'apply' of undefined"],
    ])('shows the error message for an unknown user returning %s', async (_label, body) => {
        mockFetch({ [USER_URL]: { status: 200, body } });
        const { container } = renderUser('zzzz_no_such_user_123');
        expect(await screen.findByText('Could not load user zzzz_no_such_user_123.')).toBeInTheDocument();
        expect(container.querySelector('.loading-section')).not.toBeInTheDocument();
        expect(container.querySelector('.profile')).not.toBeInTheDocument();
    });

    it('shows the error message on an HTTP error', async () => {
        mockFetch({ [USER_URL]: { status: 404, body: 'Not found' } });
        renderUser('nobody');
        expect(await screen.findByText('Could not load user nobody.')).toBeInTheDocument();
    });

    it('goes back to the previous page from the back button', async () => {
        mockFetch({ [USER_URL]: makeUser() });
        const { router } = renderRoutes([
            { path: '/', element: <Link to="/user/pg">to profile</Link> },
            { path: '/user/:id', element: <User /> },
        ]);
        fireEvent.click(screen.getByText('to profile'));
        await screen.findByText('Profile: pg');

        fireEvent.click(screen.getByRole('button', { name: 'Back' }));
        expect(await screen.findByText('to profile')).toBeInTheDocument();
        expect(router.state.location.pathname).toBe('/');
    });

    it('is lazy-loaded by the /user/:id route', async () => {
        mockFetch({ [USER_URL]: makeUser(), 'node-hnapi': [] });
        renderApp({ route: '/user/pg' });
        expect(await screen.findByText('Profile: pg')).toBeInTheDocument();
    });
});
