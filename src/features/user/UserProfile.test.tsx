import { act, screen, waitFor } from '@testing-library/react';
import { useNavigate } from 'react-router';
import { describe, expect, it } from 'vitest';

import { apiUrls } from '../../shared/api';
import type { User } from '../../shared/models';
import { deferred, mockFetch, renderWithProviders, textResponse } from '../../shared/test-utils';
import { UserProfile } from './UserProfile';

const pg: User = {
    id: 'pg',
    created_time: 1160418092,
    created: '18 years ago',
    karma: 155111,
    about: 'Bug fixer. <a href="http://paulgraham.com">paulgraham.com</a>',
};
const dang: User = { id: 'dang', created_time: 1191291292, created: '17 years ago', karma: 50000, about: '<i>mod</i>' };
const noAbout: User = { id: 'quiet', created_time: 1300000000, created: '13 years ago', karma: 1 };

function renderUser(id: string, extra: Partial<Parameters<typeof renderWithProviders>[1]> = {}) {
    return renderWithProviders(<UserProfile />, { route: `/user/${id}`, path: '/user/:id', ...extra });
}

async function findProfile() {
    return (await screen.findByText(/Created/)).closest('.profile') as HTMLElement;
}

describe('UserProfile', () => {
    it('keeps the user-profile test id (used by e2e) on its root', () => {
        mockFetch({ [apiUrls.user('pg')]: deferred().promise });
        renderUser('pg');
        expect(screen.getByTestId('user-profile')).toHaveClass('user-page');
    });

    it('shows the loader while the user is loading', () => {
        mockFetch({ [apiUrls.user('pg')]: () => deferred().promise });
        renderUser('pg');
        expect(screen.getByRole('status')).toBeInTheDocument();
        expect(screen.queryByText(/Created/)).not.toBeInTheDocument();
    });

    it('renders name, karma, created and the mobile "Profile:" header', async () => {
        mockFetch({ [apiUrls.user('pg')]: pg });
        const { container } = renderUser('pg');
        const profile = await findProfile();
        expect(screen.queryByRole('status')).not.toBeInTheDocument();
        expect(profile.querySelector('.main-details .name')).toHaveTextContent(/^pg$/);
        expect(profile.querySelector('.main-details .right')).toHaveTextContent('155111 ★');
        expect(profile.querySelector('.main-details .age')).toHaveTextContent('Created 18 years ago');
        expect(container.querySelector('.mobile.item-header .title-block')).toHaveTextContent('Profile: pg');
    });

    it('renders `about` as sanitized HTML', async () => {
        mockFetch({ [apiUrls.user('pg')]: pg });
        renderUser('pg');
        const link = await screen.findByRole('link', { name: 'paulgraham.com' });
        expect(link).toHaveAttribute('href', 'http://paulgraham.com');
        expect(link).toHaveAttribute('rel', 'nofollow noopener noreferrer');
        expect(link.closest('.other-details')).toHaveTextContent('Bug fixer. paulgraham.com');
    });

    it('strips scripts and javascript: links from `about`', async () => {
        const evil: User = {
            ...pg,
            about: '<p>hi</p><script>window.__pwned = 1</script><a href="javascript:alert(1)" onclick="x()">x</a><img src=x onerror="alert(1)">',
        };
        mockFetch({ [apiUrls.user('pg')]: evil });
        const { container } = renderUser('pg');
        await findProfile();
        const about = container.querySelector('.other-details') as HTMLElement;
        expect(about).toHaveTextContent('hi');
        expect(about.querySelector('script, img, [onclick], [onerror]')).toBeNull();
        expect(about.querySelector('a')?.getAttribute('href') ?? '').not.toMatch(/javascript:/i);
    });

    it('does not render the about block when `about` is missing or empty', async () => {
        mockFetch({
            [apiUrls.user('quiet')]: noAbout,
            [apiUrls.user('blank')]: { ...noAbout, id: 'blank', about: '' },
        });
        const { container, unmount } = renderUser('quiet');
        await findProfile();
        expect(container.querySelector('.other-details')).toBeNull();
        unmount();
        const second = renderUser('blank');
        await findProfile();
        expect(second.container.querySelector('.other-details')).toBeNull();
    });

    it.each([
        ['null body (HNPWA unknown user)', () => null],
        ['plain-text body (HNPWA unknown user)', () => textResponse("Cannot read property 'apply' of undefined")],
        ['HTTP 404', () => textResponse('Not found', 404)],
        ['HTTP 500', () => textResponse('boom', 500)],
    ])("shows Angular's error message for %s", async (_label, responder) => {
        mockFetch({ [apiUrls.user('nobody')]: responder });
        renderUser('nobody');
        const alert = await screen.findByRole('alert');
        expect(alert).toHaveTextContent('Could not load user nobody.');
        expect(screen.queryByRole('status')).not.toBeInTheDocument();
        expect(screen.queryByText(/Created/)).not.toBeInTheDocument();
    });

    it('shows the error message for a blank id instead of an endless loader', async () => {
        const handle = mockFetch({});
        renderUser('%20');
        expect(await screen.findByRole('alert')).toHaveTextContent(/Could not load user\s*\./);
        expect(handle.calls).toHaveLength(0);
    });

    it('scrolls to the top on mount and when the id changes', async () => {
        mockFetch({ [apiUrls.user('pg')]: pg, [apiUrls.user('dang')]: dang });
        let go: ReturnType<typeof useNavigate> | undefined;
        function Nav() {
            go = useNavigate();
            return <UserProfile />;
        }
        renderWithProviders(<Nav />, { route: '/user/pg', path: '/user/:id' });
        await findProfile();
        expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
        const before = (window.scrollTo as unknown as { mock: { calls: unknown[] } }).mock.calls.length;
        await act(async () => {
            await go!('/user/dang');
        });
        await screen.findByText('17 years ago', { exact: false });
        expect((window.scrollTo as unknown as { mock: { calls: unknown[] } }).mock.calls.length).toBeGreaterThan(
            before
        );
    });

    it('never shows a previous user as current: /user/a → /user/b → /user/a refetches with a loader', async () => {
        const pending = {
            pg: [] as ReturnType<typeof deferred<User>>[],
            dang: [] as ReturnType<typeof deferred<User>>[],
        };
        const handle = mockFetch({
            [apiUrls.user('pg')]: () => {
                const d = deferred<User>();
                pending.pg.push(d);
                return d.promise;
            },
            [apiUrls.user('dang')]: () => {
                const d = deferred<User>();
                pending.dang.push(d);
                return d.promise;
            },
        });
        let go: ReturnType<typeof useNavigate> | undefined;
        function Nav() {
            go = useNavigate();
            return <UserProfile />;
        }
        renderWithProviders(<Nav />, { route: '/user/pg', path: '/user/:id' });
        await waitFor(() => expect(pending.pg).toHaveLength(1));
        await act(async () => pending.pg[0].resolve(pg));
        expect(await screen.findByText('Profile: pg')).toBeInTheDocument();

        await act(async () => {
            await go!('/user/dang');
        });
        expect(screen.getByRole('status')).toBeInTheDocument();
        expect(screen.queryByText('Profile: pg')).not.toBeInTheDocument();
        await waitFor(() => expect(pending.dang).toHaveLength(1));
        await act(async () => pending.dang[0].resolve(dang));
        expect(await screen.findByText('Profile: dang')).toBeInTheDocument();

        await act(async () => {
            await go!('/user/pg');
        });
        expect(screen.getByRole('status')).toBeInTheDocument();
        expect(screen.queryByText('Profile: pg')).not.toBeInTheDocument();
        expect(screen.queryByText('Profile: dang')).not.toBeInTheDocument();
        await waitFor(() => expect(pending.pg).toHaveLength(2));
        await act(async () => pending.pg[1].resolve({ ...pg, karma: 1 }));
        expect(await screen.findByText('1 ★')).toBeInTheDocument();
        expect(handle.callsTo(apiUrls.user('pg'))).toHaveLength(2);
    });

    describe('back button', () => {
        async function renderFromFeed() {
            mockFetch({ [apiUrls.user('pg')]: pg });
            let go: ReturnType<typeof useNavigate> | undefined;
            function Feed() {
                go = useNavigate();
                return <p>feed page</p>;
            }
            const result = renderWithProviders(<Feed />, {
                route: '/news/1',
                path: '/news/:page',
                otherRoutes: { '/user/:id': <UserProfile /> },
            });
            await act(async () => {
                await go!('/user/pg');
            });
            await findProfile();
            return result;
        }

        it('is a keyboard-operable button labelled "Go back"', async () => {
            await renderFromFeed();
            const back = screen.getByRole('button', { name: 'Go back' });
            expect(back.tagName).toBe('SPAN');
            expect(back).toHaveClass('back-button');
            expect(back).toHaveAttribute('tabindex', '0');
        });

        it('goes back in history on click', async () => {
            const { user } = await renderFromFeed();
            await user.click(screen.getByRole('button', { name: 'Go back' }));
            expect(await screen.findByText('feed page')).toBeInTheDocument();
        });

        it.each(['{Enter}', ' '])('goes back on %s', async (key) => {
            const { user } = await renderFromFeed();
            screen.getByRole('button', { name: 'Go back' }).focus();
            await user.keyboard(key);
            expect(await screen.findByText('feed page')).toBeInTheDocument();
        });
    });
});
