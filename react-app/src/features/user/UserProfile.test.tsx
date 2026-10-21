import { screen, waitFor } from '@testing-library/react';
import { useNavigate } from 'react-router';
import { describe, expect, it } from 'vitest';

import { apiUrls } from '../../shared/api';
import type { User } from '../../shared/models';
import { deferred, mockFetch, renderWithProviders, textResponse } from '../../shared/test-utils';
import { UserProfile } from './UserProfile';

function hnUser(overrides: Partial<User> = {}): User {
    return {
        id: 'pg',
        created_time: 1160418092,
        created: '18 years ago',
        karma: 157316,
        about: 'Bug fixer.',
        ...overrides,
    };
}

function renderUser(id = 'pg') {
    return renderWithProviders(<UserProfile />, { route: `/user/${id}`, path: '/user/:id' });
}

describe('UserProfile', () => {
    it('shows the loader while loading, then the profile', async () => {
        const pending = deferred<unknown>();
        mockFetch({ [apiUrls.user('pg')]: () => pending.promise });
        const { container } = renderUser();
        expect(screen.getByRole('status')).toHaveTextContent('Loading...');
        expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
        pending.resolve(hnUser());
        expect(await screen.findByText('Profile: pg')).toBeInTheDocument();
        expect(screen.queryByRole('status')).toBeNull();
        expect(container.querySelector('.user-profile > .profile')).toBeInTheDocument();
    });

    it('renders id, karma, created and about like Angular', async () => {
        const { container } = (mockFetch({ [apiUrls.user('pg')]: hnUser() }), renderUser());
        await screen.findByText('Profile: pg');
        expect(container.querySelector('.main-details .name')).toHaveTextContent('pg');
        expect(container.querySelector('.main-details .right')!.textContent).toBe('157316 ★');
        expect(container.querySelector('.main-details p.age')!.textContent).toBe('Created 18 years ago');
        expect(container.querySelector('.other-details > p')).toHaveTextContent('Bug fixer.');
        expect(container.querySelector('.mobile.item-header .title-block')!.textContent).toBe('Profile: pg');
    });

    it('sanitizes about HTML and makes HN-relative links absolute', async () => {
        mockFetch({
            [apiUrls.user('pg')]: hnUser({
                about: 'See <a href="item?id=1" target="_blank" onclick="x()">this</a> and <a href="javascript:alert(1)">that</a><script>bad()</script><p><i>more</i></p>',
            }),
        });
        const { container } = renderUser();
        await screen.findByText('Profile: pg');
        const about = container.querySelector('.other-details')!;
        expect(about.querySelector('script, [onclick], [target]')).toBeNull();
        const [hnLink, jsLink] = Array.from(about.querySelectorAll('a'));
        expect(hnLink).toHaveAttribute('href', 'https://news.ycombinator.com/item?id=1');
        expect(hnLink).toHaveAttribute('rel', 'nofollow noopener noreferrer');
        expect(jsLink).not.toHaveAttribute('href');
        expect(about.querySelector('i')).toHaveTextContent('more');
    });

    it('omits the about block when the user has none', async () => {
        mockFetch({ [apiUrls.user('test')]: hnUser({ id: 'test', about: '' }) });
        const { container } = renderUser('test');
        await screen.findByText('Profile: test');
        expect(container.querySelector('.other-details')).toBeNull();
    });

    it.each([
        ['200 + null', textResponse('null')],
        ['200 + plain text', textResponse("Cannot read property 'apply' of undefined")],
        ['404', textResponse('Not found', 404)],
    ])('shows Angular’s error for an unknown user (HNPWA %s), never an endless loader', async (_name, response) => {
        mockFetch({ [apiUrls.user('nobody_xyz')]: response });
        renderUser('nobody_xyz');
        expect(await screen.findByRole('alert')).toHaveTextContent('Could not load user nobody_xyz.');
        expect(screen.queryByRole('status')).toBeNull();
    });

    it('goes back with the back button (click, Enter and Space)', async () => {
        mockFetch({ [apiUrls.user('pg')]: hnUser() });
        function Start() {
            const navigate = useNavigate();
            return (
                <button type="button" onClick={() => void navigate('/user/pg')}>
                    open
                </button>
            );
        }
        const { user } = renderWithProviders(<Start />, {
            route: '/start',
            path: '/start',
            otherRoutes: { '/user/:id': <UserProfile /> },
        });
        const openProfile = async () => {
            await user.click(screen.getByRole('button', { name: 'open' }));
            return screen.findByRole('button', { name: 'Back' });
        };

        const back = await openProfile();
        expect(back).toHaveClass('back-button');
        expect(back).toHaveAttribute('tabindex', '0');
        await user.click(back);
        await waitFor(() => expect(screen.getByRole('button', { name: 'open' })).toBeInTheDocument());

        (await openProfile()).focus();
        await user.keyboard('{Enter}');
        await waitFor(() => expect(screen.getByRole('button', { name: 'open' })).toBeInTheDocument());

        (await openProfile()).focus();
        await user.keyboard(' ');
        await waitFor(() => expect(screen.getByRole('button', { name: 'open' })).toBeInTheDocument());
    });
});
