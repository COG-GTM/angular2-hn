import { act, screen, waitFor } from '@testing-library/react';
import { useNavigate } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

import { apiUrls } from '../../shared/api';
import type { User } from '../../shared/models';
import { createTestQueryClient, deferred, mockFetch, renderWithProviders, textResponse } from '../../shared/test-utils';
import { UserProfile } from './index';

const pg: User = {
    id: 'pg',
    created_time: 1160418092,
    created: '20 years ago',
    karma: 157316,
    about: 'Bug fixer.',
};
const dang: User = {
    id: 'dang',
    created_time: 1191291270,
    created: '19 years ago',
    karma: 51234,
    about: '<i>Conflict</i> is essential<p>Second paragraph',
};

const renderUser = (route: string, ui = <UserProfile />) => renderWithProviders(ui, { route, path: '/user/:id' });

function NavButtons() {
    const navigate = useNavigate();
    return (
        <>
            <button onClick={() => navigate('/user/pg')}>to pg</button>
            <button onClick={() => navigate('/user/dang')}>to dang</button>
        </>
    );
}

const withNav = (
    <>
        <UserProfile />
        <NavButtons />
    </>
);

describe('UserProfile', () => {
    it('shows the loader while the user is loading', async () => {
        const pending = deferred();
        mockFetch({ [apiUrls.user('pg')]: () => pending.promise });
        renderUser('/user/pg');

        expect(screen.getByRole('status')).toHaveTextContent('Loading...');
        expect(document.querySelector('.profile')).toBeNull();

        await act(async () => pending.resolve(pg));
        expect(await screen.findByText('Profile: pg')).toBeInTheDocument();
        expect(screen.queryByRole('status')).toBeNull();
    });

    it('renders name, karma, created and about like the Angular template', async () => {
        const fetchMock = mockFetch({ [apiUrls.user('pg')]: pg });
        const { container } = renderUser('/user/pg');

        expect(await screen.findByText('Profile: pg')).toBeInTheDocument();
        expect(container.querySelector('.user-profile .profile .main-details .name')).toHaveTextContent(/^pg$/);
        expect(container.querySelector('.main-details .right')).toHaveTextContent('157316 ★');
        expect(container.querySelector('.main-details .age')).toHaveTextContent('Created 20 years ago');
        expect(container.querySelector('.other-details p')).toHaveTextContent('Bug fixer.');
        expect(container.querySelector('.mobile.item-header .title-block .back-button')).not.toBeNull();
        expect(fetchMock.callsTo(apiUrls.user('pg'))).toHaveLength(1);
        expect(fetchMock.unmatched).toEqual([]);
    });

    it('omits the about section when about is empty or missing', async () => {
        mockFetch({ [apiUrls.user('test')]: { ...pg, id: 'test', about: '' } });
        const { container } = renderUser('/user/test');

        expect(await screen.findByText('Profile: test')).toBeInTheDocument();
        expect(container.querySelector('.other-details')).toBeNull();
    });

    it('shows the Angular error message for an unknown user (null body)', async () => {
        mockFetch({ [apiUrls.user('nobody')]: null });
        renderUser('/user/nobody');

        expect(await screen.findByRole('alert')).toHaveTextContent('Could not load user nobody.');
        expect(screen.queryByRole('status')).toBeNull();
    });

    it('shows the error message when HNPWA answers with plain text', async () => {
        mockFetch({ [apiUrls.user('ghost')]: textResponse("Cannot read property 'apply' of undefined") });
        renderUser('/user/ghost');

        expect(await screen.findByRole('alert')).toHaveTextContent('Could not load user ghost.');
    });

    it('shows the error message on a network failure', async () => {
        mockFetch({
            [apiUrls.user('pg')]: () => {
                throw new TypeError('Failed to fetch');
            },
        });
        renderUser('/user/pg');

        expect(await screen.findByRole('alert')).toHaveTextContent('Could not load user pg.');
    });

    it('sanitizes the about HTML and keeps allowed formatting', async () => {
        mockFetch({
            [apiUrls.user('evil')]: {
                ...pg,
                id: 'evil',
                about:
                    '<i>hi</i><script>window.__pwned = true</script><img src=x onerror="alert(1)">' +
                    '<a href="javascript:alert(1)">bad</a> <a href="https://example.com" onclick="x()">good</a>',
            },
        });
        const { container } = renderUser('/user/evil');

        await screen.findByText('Profile: evil');
        const about = container.querySelector('.other-details p') as HTMLElement;
        expect(about.querySelector('i')).toHaveTextContent('hi');
        expect(about.querySelector('script, img')).toBeNull();
        expect(about.innerHTML).not.toMatch(/onerror|onclick|javascript:/);
        const good = screen.getByRole('link', { name: 'good' });
        expect(good).toHaveAttribute('href', 'https://example.com');
        expect(good).toHaveAttribute('rel', 'nofollow noopener noreferrer');
        expect(screen.getByText('bad')).not.toHaveAttribute('href');
        expect((window as unknown as { __pwned?: boolean }).__pwned).toBeUndefined();
    });

    it('never shows the previous user while the next one is pending (a → b → a)', async () => {
        const dangRequest = deferred();
        const pgResponses = [deferred(), deferred()];
        let pgCalls = 0;
        mockFetch({
            [apiUrls.user('pg')]: () => pgResponses[pgCalls++].promise,
            [apiUrls.user('dang')]: () => dangRequest.promise,
        });
        const queryClient = createTestQueryClient();
        queryClient.setDefaultOptions({ queries: { ...queryClient.getDefaultOptions().queries, gcTime: 0 } });
        const { user, container } = renderWithProviders(withNav, { route: '/user/pg', path: '/user/:id', queryClient });

        await act(async () => pgResponses[0].resolve(pg));
        expect(await screen.findByText('Profile: pg')).toBeInTheDocument();

        await user.click(screen.getByRole('button', { name: 'to dang' }));
        expect(screen.getByRole('status')).toBeInTheDocument();
        expect(screen.queryByText('Profile: pg')).toBeNull();
        expect(container.querySelector('.profile')).toBeNull();

        await act(async () => dangRequest.resolve(dang));
        expect(await screen.findByText('Profile: dang')).toBeInTheDocument();
        expect(container.querySelector('.other-details i')).toHaveTextContent('Conflict');

        // pg's cache entry was garbage-collected (gcTime 0), so going back must load it again.
        await waitFor(() => expect(queryClient.getQueryCache().find({ queryKey: ['hn', 'user', 'pg'] })).toBeFalsy());
        await user.click(screen.getByRole('button', { name: 'to pg' }));
        expect(screen.getByRole('status')).toBeInTheDocument();
        expect(screen.queryByText('Profile: dang')).toBeNull();

        await act(async () => pgResponses[1].resolve(pg));
        expect(await screen.findByText('Profile: pg')).toBeInTheDocument();
        expect(screen.queryByText('Profile: dang')).toBeNull();
    });

    it('shows a cached user immediately when switching back, and only that user', async () => {
        const fetchMock = mockFetch({ [apiUrls.user('pg')]: pg, [apiUrls.user('dang')]: dang });
        const { user } = renderUser('/user/pg', withNav);

        expect(await screen.findByText('Profile: pg')).toBeInTheDocument();
        await user.click(screen.getByRole('button', { name: 'to dang' }));
        expect(await screen.findByText('Profile: dang')).toBeInTheDocument();
        await user.click(screen.getByRole('button', { name: 'to pg' }));
        expect(screen.getByText('Profile: pg')).toBeInTheDocument();
        expect(screen.queryByText('Profile: dang')).toBeNull();
        expect(fetchMock.callsTo(apiUrls.user('dang'))).toHaveLength(1);
    });

    it('replaces an error with the next user when switching', async () => {
        mockFetch({ [apiUrls.user('nobody')]: null, [apiUrls.user('pg')]: pg });
        const { user } = renderUser('/user/nobody', withNav);

        expect(await screen.findByRole('alert')).toHaveTextContent('Could not load user nobody.');
        await user.click(screen.getByRole('button', { name: 'to pg' }));
        expect(await screen.findByText('Profile: pg')).toBeInTheDocument();
        expect(screen.queryByRole('alert')).toBeNull();
    });

    it('scrolls to the top on mount and whenever :id changes', async () => {
        mockFetch({ [apiUrls.user('pg')]: pg, [apiUrls.user('dang')]: dang });
        const { user } = renderUser('/user/pg', withNav);
        await screen.findByText('Profile: pg');
        const scrollTo = vi.mocked(window.scrollTo);
        const before = scrollTo.mock.calls.length;
        expect(before).toBeGreaterThan(0);

        await user.click(screen.getByRole('button', { name: 'to dang' }));
        await screen.findByText('Profile: dang');
        expect(scrollTo.mock.calls.length).toBeGreaterThan(before);
        expect(scrollTo).toHaveBeenLastCalledWith(0, 0);
    });

    it('back button goes back in history by click, Enter and Space', async () => {
        mockFetch({ [apiUrls.user('pg')]: pg, [apiUrls.user('dang')]: dang });
        const { user } = renderUser('/user/pg', withNav);
        await screen.findByText('Profile: pg');

        const back = () => screen.getByRole('button', { name: 'Go back' });
        expect(back()).toHaveClass('back-button');
        expect(back().tagName).toBe('SPAN');
        expect(back()).toHaveAttribute('tabindex', '0');

        await user.click(screen.getByRole('button', { name: 'to dang' }));
        await screen.findByText('Profile: dang');
        await user.click(back());
        expect(await screen.findByText('Profile: pg')).toBeInTheDocument();

        await user.click(screen.getByRole('button', { name: 'to dang' }));
        await screen.findByText('Profile: dang');
        back().focus();
        await user.keyboard('{Enter}');
        expect(await screen.findByText('Profile: pg')).toBeInTheDocument();

        await user.click(screen.getByRole('button', { name: 'to dang' }));
        await screen.findByText('Profile: dang');
        back().focus();
        await user.keyboard(' ');
        expect(await screen.findByText('Profile: pg')).toBeInTheDocument();
    });
});
