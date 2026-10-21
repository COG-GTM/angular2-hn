import { act, fireEvent, screen, waitFor } from '@testing-library/react';
import { Link, useNavigate, useParams } from 'react-router';
import { describe, expect, it } from 'vitest';

import { deferred, mockFetch, renderWithProviders } from '../test-utils';
import { apiUrls, queryKeys, useFeed, useItem, useUser } from './index';

function Status({ q }: { q: { isPending: boolean; isError: boolean; data?: unknown; error: Error | null } }) {
    if (q.isPending) return <p>loading</p>;
    if (q.isError) return <p>error: {q.error?.message}</p>;
    return <p>data: {JSON.stringify(q.data)}</p>;
}

function FeedProbe() {
    const { page } = useParams();
    return <Status q={useFeed('news', page)} />;
}
function ItemProbe() {
    const { id } = useParams();
    return <Status q={useItem(id)} />;
}
function UserProbe() {
    const { id } = useParams();
    const q = useUser(id);
    const navigate = useNavigate();
    return (
        <>
            <Status q={q} />
            <Link to="/user/a">to a</Link>
            <Link to="/user/b">to b</Link>
            <button onClick={() => navigate(-1)}>back</button>
        </>
    );
}

describe('query hooks', () => {
    it('useFeed loads a page', async () => {
        mockFetch({ [apiUrls.feed('news', 2)]: [{ id: 1 }] });
        renderWithProviders(<FeedProbe />, { route: '/news/2', path: '/news/:page' });
        expect(screen.getByText('loading')).toBeInTheDocument();
        expect(await screen.findByText('data: [{"id":1}]')).toBeInTheDocument();
    });

    it('useFeed with an invalid page is an error, not a disabled query', async () => {
        const handle = mockFetch();
        renderWithProviders(<FeedProbe />, { route: '/news/abc', path: '/news/:page' });
        expect(await screen.findByText(/error: Invalid page: abc/)).toBeInTheDocument();
        expect(handle.calls).toHaveLength(0);
    });

    it('useItem: NaN ids and node-hnapi error bodies are errors', async () => {
        mockFetch({ [apiUrls.item(9)]: { error: 'Item 9 not found' } });
        renderWithProviders(<ItemProbe />, { route: '/item/NaN', path: '/item/:id' });
        expect(await screen.findByText(/error: Invalid item id/)).toBeInTheDocument();
        renderWithProviders(<ItemProbe />, { route: '/item/9', path: '/item/:id' });
        expect(await screen.findByText('error: Item 9 not found')).toBeInTheDocument();
    });

    it('useUser: unknown HNPWA user (null body) is an error', async () => {
        mockFetch({ [apiUrls.user('ghost')]: null });
        renderWithProviders(<UserProbe />, { route: '/user/ghost', path: '/user/:id' });
        expect(await screen.findByText(/error: Empty response/)).toBeInTheDocument();
    });

    it('never shows a previous resource as current: a → b → a refetches and shows the loader', async () => {
        const secondA = deferred<unknown>();
        let aCalls = 0;
        const handle = mockFetch({
            [apiUrls.user('a')]: () => (++aCalls === 1 ? { id: 'a' } : secondA.promise),
            [apiUrls.user('b')]: { id: 'b' },
        });
        const { user } = renderWithProviders(<UserProbe />, { route: '/user/a', path: '/user/:id' });
        expect(await screen.findByText('data: {"id":"a"}')).toBeInTheDocument();
        await user.click(screen.getByText('to b'));
        expect(await screen.findByText('data: {"id":"b"}')).toBeInTheDocument();
        await user.click(screen.getByText('to a'));
        expect(screen.getByText('loading')).toBeInTheDocument();
        await act(async () => secondA.resolve({ id: 'a', karma: 2 }));
        expect(await screen.findByText('data: {"id":"a","karma":2}')).toBeInTheDocument();
        expect(handle.callsTo(apiUrls.user('a'))).toHaveLength(2);
    });

    it('Back within staleTime refetches and shows the loader (no cached resource)', async () => {
        const secondA = deferred<unknown>();
        let aCalls = 0;
        const handle = mockFetch({
            [apiUrls.user('a')]: () => (++aCalls === 1 ? { id: 'a' } : secondA.promise),
            [apiUrls.user('b')]: { id: 'b' },
        });
        const { user } = renderWithProviders(<UserProbe />, { route: '/user/a', path: '/user/:id' });
        expect(await screen.findByText('data: {"id":"a"}')).toBeInTheDocument();
        await user.click(screen.getByText('to b'));
        expect(await screen.findByText('data: {"id":"b"}')).toBeInTheDocument();
        await user.click(screen.getByText('back'));
        expect(screen.getByText('loading')).toBeInTheDocument();
        await act(async () => secondA.resolve({ id: 'a', karma: 3 }));
        expect(await screen.findByText('data: {"id":"a","karma":3}')).toBeInTheDocument();
        expect(handle.callsTo(apiUrls.user('a'))).toHaveLength(2);
    });

    it('rapid Back (before the old query is garbage-collected) still refetches and shows the loader', async () => {
        const secondA = deferred<unknown>();
        let aCalls = 0;
        const handle = mockFetch({
            [apiUrls.user('a')]: () => (++aCalls === 1 ? { id: 'a' } : secondA.promise),
            [apiUrls.user('b')]: { id: 'b' },
        });
        renderWithProviders(<UserProbe />, { route: '/user/a', path: '/user/:id' });
        expect(await screen.findByText('data: {"id":"a"}')).toBeInTheDocument();
        fireEvent.click(screen.getByText('to b'));
        fireEvent.click(screen.getByText('back'));
        expect(screen.getByText('loading')).toBeInTheDocument();
        await act(async () => secondA.resolve({ id: 'a', karma: 4 }));
        expect(await screen.findByText('data: {"id":"a","karma":4}')).toBeInTheDocument();
        expect(handle.callsTo(apiUrls.user('a'))).toHaveLength(2);
    });

    it('query keys are prefixed with the queryKeys factory', async () => {
        mockFetch({ [apiUrls.item(1)]: { id: 1, comments: [] } });
        const { queryClient } = renderWithProviders(<ItemProbe />, { route: '/item/1', path: '/item/:id' });
        await waitFor(() =>
            expect(queryClient.getQueryCache().findAll({ queryKey: queryKeys.item(1) })).toHaveLength(1)
        );
    });
});
