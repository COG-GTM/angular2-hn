import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import { AppRoutes } from './AppRoutes';
import { FEED_ROUTES } from './feed-routes';
import type { FeedPageProps } from './placeholders';

function renderAt(path: string, props = {}) {
    return render(
        <MemoryRouter initialEntries={[path]}>
            <AppRoutes {...props} />
        </MemoryRouter>
    );
}

describe('AppRoutes', () => {
    it('redirects / to /news/1', async () => {
        renderAt('/');
        const page = await screen.findByTestId('feed-page');
        expect(page).toHaveAttribute('data-feed-type', 'news');
        expect(page).toHaveAttribute('data-page', '1');
    });

    it.each(FEED_ROUTES.map((r) => [r.path, r.feedType] as const))(
        'associates /%s/:page with feedType %s',
        async (path, feedType) => {
            renderAt(`/${path}/3`);
            const page = await screen.findByTestId('feed-page');
            expect(page).toHaveAttribute('data-feed-type', feedType);
            expect(page).toHaveAttribute('data-page', '3');
        }
    );

    it('lazily renders the item route with its id', async () => {
        renderAt('/item/8863');
        expect(await screen.findByTestId('item-page')).toHaveTextContent('item 8863');
    });

    it('lazily renders the user route with its id', async () => {
        renderAt('/user/pg');
        expect(await screen.findByTestId('user-page')).toHaveTextContent('user pg');
    });

    it('accepts injected page components', async () => {
        const FeedPage = ({ feedType }: FeedPageProps) => <div>custom feed {feedType}</div>;
        const ItemPage = () => <div>custom item</div>;
        const UserPage = () => <div>custom user</div>;

        const { unmount } = renderAt('/show/1', { feedPage: FeedPage, itemPage: ItemPage, userPage: UserPage });
        expect(await screen.findByText('custom feed show')).toBeInTheDocument();
        unmount();

        renderAt('/item/1', { feedPage: FeedPage, itemPage: ItemPage, userPage: UserPage });
        expect(await screen.findByText('custom item')).toBeInTheDocument();
    });
});
