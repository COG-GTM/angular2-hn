import { screen, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { deferred, mockFetch, renderWithProviders, textResponse } from '../test-utils';
import { apiUrls, useFeed, useItem, useUser } from './index';

function ItemProbe({ id }: { id: string | number | undefined }) {
    const { status, data, error } = useItem(id);
    return (
        <div data-testid="state">
            {status === 'success' ? `success:${data.title}` : `${status}:${error?.message ?? ''}`}
        </div>
    );
}

function UserProbe({ id }: { id: string }) {
    const { status, data } = useUser(id);
    return <div data-testid="state">{status === 'success' ? `success:${data.id}` : status}</div>;
}

function FeedProbe({ page }: { page: string }) {
    const { status, data } = useFeed('news', page);
    return <div data-testid="state">{status === 'success' ? `success:${data.length}` : status}</div>;
}

describe('query hooks', () => {
    it('useItem: pending while the request is open, then success', async () => {
        const gate = deferred<unknown>();
        mockFetch({ [apiUrls.item(1)]: () => gate.promise });
        renderWithProviders(<ItemProbe id="1" />);
        expect(screen.getByTestId('state')).toHaveTextContent('pending');
        gate.resolve({ id: 1, title: 'Hi', type: 'link', comments: [] });
        await waitFor(() => expect(screen.getByTestId('state')).toHaveTextContent('success:Hi'));
    });

    it.each([['abc'], [NaN], [undefined]])('useItem(%j) ends in an error state, not a pending one', async (id) => {
        mockFetch({});
        renderWithProviders(<ItemProbe id={id} />);
        await waitFor(() => expect(screen.getByTestId('state')).toHaveTextContent(/^error:Invalid item id/));
    });

    it('useItem: switching between two invalid ids re-validates the new id', async () => {
        mockFetch({});
        const { rerender } = renderWithProviders(<ItemProbe id="abc" />);
        await waitFor(() => expect(screen.getByTestId('state')).toHaveTextContent('error:Invalid item id: abc'));
        rerender(<ItemProbe id="def" />);
        await waitFor(() => expect(screen.getByTestId('state')).toHaveTextContent('error:Invalid item id: def'));
    });

    it('useItem: unknown item → error', async () => {
        mockFetch({ [apiUrls.item(9)]: { error: 'Item 9 not found' } });
        renderWithProviders(<ItemProbe id={9} />);
        await waitFor(() => expect(screen.getByTestId('state')).toHaveTextContent('error:Item 9 not found'));
    });

    it('useUser: null and plain-text bodies → error', async () => {
        mockFetch({ [apiUrls.user('ghost')]: textResponse('null') });
        renderWithProviders(<UserProbe id="ghost" />);
        await waitFor(() => expect(screen.getByTestId('state')).toHaveTextContent('error'));
    });

    it('useFeed: invalid page → error; valid page → data', async () => {
        mockFetch({ [apiUrls.feed('news', 2)]: [{ id: 1 }, { id: 2 }] });
        const { unmount } = renderWithProviders(<FeedProbe page="x" />);
        await waitFor(() => expect(screen.getByTestId('state')).toHaveTextContent('error'));
        unmount();
        renderWithProviders(<FeedProbe page="2" />);
        await waitFor(() => expect(screen.getByTestId('state')).toHaveTextContent('success:2'));
    });
});
