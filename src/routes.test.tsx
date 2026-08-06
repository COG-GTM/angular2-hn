import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, useParams } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { SettingsProvider } from './context/SettingsContext';
import { FeedPageProps } from './pages/FeedPage';
import { AppRoutes, feedTypes } from './routes';
import { stubMatchMedia } from './testUtils/matchMedia';

vi.mock('./pages/FeedPage', () => {
    const FeedPage = ({ feedType }: FeedPageProps) => {
        const { page } = useParams();
        return <p>{`feed ${feedType} page ${page}`}</p>;
    };
    return { FeedPage, default: FeedPage };
});

vi.mock('./pages/ItemDetailsPage', () => {
    const ItemDetailsPage = () => {
        const { id } = useParams();
        return <p>{`item ${id}`}</p>;
    };
    return { ItemDetailsPage, default: ItemDetailsPage };
});

vi.mock('./pages/UserPage', () => {
    const UserPage = () => {
        const { id } = useParams();
        return <p>{`user ${id}`}</p>;
    };
    return { UserPage, default: UserPage };
});

function renderRoutes(initialEntry: string) {
    stubMatchMedia(false);
    vi.stubGlobal('scrollTo', vi.fn());

    return render(
        <SettingsProvider>
            <MemoryRouter initialEntries={[initialEntry]}>
                <AppRoutes />
            </MemoryRouter>
        </SettingsProvider>
    );
}

afterEach(() => {
    vi.unstubAllGlobals();
});

describe('routes', () => {
    it('redirects the root path to the first page of the news feed', () => {
        renderRoutes('/');

        expect(screen.getByText('feed news page 1')).toBeInTheDocument();
    });

    it.each(feedTypes)('renders the %s feed with its page parameter', (feedType) => {
        renderRoutes(`/${feedType}/3`);

        expect(screen.getByText(`feed ${feedType} page 3`)).toBeInTheDocument();
    });

    it('renders the item details page for /item/:id', () => {
        renderRoutes('/item/12345');

        expect(screen.getByText('item 12345')).toBeInTheDocument();
    });

    it('renders the user page for /user/:id', () => {
        renderRoutes('/user/pg');

        expect(screen.getByText('user pg')).toBeInTheDocument();
    });

    it.each([
        ['home', 'feed news page 1'],
        ['new', 'feed newest page 1'],
        ['show', 'feed show page 1'],
        ['ask', 'feed ask page 1'],
        ['jobs', 'feed jobs page 1'],
    ])('navigates to the right feed when the %s header link is clicked', async (linkName, expectedText) => {
        renderRoutes('/item/1');

        const link =
            linkName === 'home'
                ? screen.getByRole('img', { name: 'Logo' }).closest('a')!
                : screen.getByRole('link', { name: linkName });
        await userEvent.click(link);

        expect(screen.getByText(expectedText)).toBeInTheDocument();
    });
});
