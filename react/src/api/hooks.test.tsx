import { render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { useFeed, useItem, useUser } from './hooks';

afterEach(() => {
    vi.unstubAllGlobals();
});

function stubFetch(result: unknown, ok = true) {
    vi.stubGlobal(
        'fetch',
        vi.fn(async () => ({ ok, status: ok ? 200 : 500, json: async () => result }))
    );
}

function FeedProbe() {
    const { data, error, loading, listStart } = useFeed('news', 2);
    return (
        <div>
            <span data-testid="state">{loading ? 'loading' : error || `${data?.length} stories`}</span>
            <span data-testid="list-start">{listStart}</span>
        </div>
    );
}

function ItemProbe() {
    const { error } = useItem(42);
    return <span data-testid="state">{error}</span>;
}

function UserProbe() {
    const { error } = useUser('pg');
    return <span data-testid="state">{error}</span>;
}

describe('data hooks', () => {
    it('exposes the feed and the page rank offset', async () => {
        stubFetch([{ id: 1 }, { id: 2 }]);
        render(<FeedProbe />);
        expect(screen.getByTestId('list-start')).toHaveTextContent('31');
        await waitFor(() => expect(screen.getByTestId('state')).toHaveTextContent('2 stories'));
    });

    it('reports the same error copy as the Angular components', async () => {
        stubFetch({}, false);
        const { unmount } = render(<FeedProbe />);
        await waitFor(() => expect(screen.getByTestId('state')).toHaveTextContent('Could not load news stories.'));
        unmount();

        const item = render(<ItemProbe />);
        await waitFor(() => expect(screen.getByTestId('state')).toHaveTextContent('Could not load item comments.'));
        item.unmount();

        render(<UserProbe />);
        await waitFor(() => expect(screen.getByTestId('state')).toHaveTextContent('Could not load user pg.'));
    });
});
