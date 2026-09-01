import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import { AppRoutes } from './routes';
import { FeedPlaceholder, ItemDetailsPlaceholder, UserPlaceholder } from './placeholders';
import { FeedRoute, FEED_ROUTES } from '../shared/models';

function renderRoutes(path: string) {
    return render(
        <MemoryRouter initialEntries={[path]}>
            <AppRoutes Feed={FeedPlaceholder} ItemDetails={ItemDetailsPlaceholder} User={UserPlaceholder} />
        </MemoryRouter>
    );
}

describe('AppRoutes', () => {
    it('redirects the root route to the first news page', () => {
        renderRoutes('/');

        expect(screen.getByText('news feed page 1')).toBeInTheDocument();
    });

    it.each(FEED_ROUTES)('renders the %s feed at page 2', (feedType: FeedRoute) => {
        renderRoutes(`/${feedType}/2`);

        expect(screen.getByText(`${feedType} feed page 2`)).toBeInTheDocument();
    });

    it('renders item details', () => {
        renderRoutes('/item/123');

        expect(screen.getByText('item 123')).toBeInTheDocument();
    });

    it('renders a user', () => {
        renderRoutes('/user/pg');

        expect(screen.getByText('user pg')).toBeInTheDocument();
    });
});
