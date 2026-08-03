import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import AppRoutes from './AppRoutes';

function renderAt(path: string) {
    return render(
        <MemoryRouter initialEntries={[path]}>
            <AppRoutes />
        </MemoryRouter>
    );
}

describe('AppRoutes', () => {
    it('redirects the root path to the first news page', () => {
        renderAt('/');

        expect(screen.getByTestId('feed-page')).toHaveAttribute('data-feed-type', 'news');
    });

    it.each([
        ['/news/2', 'news'],
        ['/newest/1', 'newest'],
        ['/show/3', 'show'],
        ['/ask/1', 'ask'],
        ['/jobs/1', 'jobs'],
    ])('renders the feed page for %s with its feed type', (path, feedType) => {
        renderAt(path);

        expect(screen.getByTestId('feed-page')).toHaveAttribute('data-feed-type', feedType);
    });

    it('renders the item details page with the item id', () => {
        renderAt('/item/8863');

        expect(screen.getByTestId('item-details-page')).toHaveAttribute('data-item-id', '8863');
    });

    it('renders the user page with the user id', () => {
        renderAt('/user/pg');

        expect(screen.getByTestId('user-page')).toHaveAttribute('data-user-id', 'pg');
    });
});
