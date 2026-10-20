import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { renderWithProviders } from '../shared/test-utils';
import type { Comment as CommentModel, Story } from '../shared/models';
import { FeedItem, FeedList } from './feeds';
import { Comment, ItemDetails } from './item-details';
import { AppShell, Footer, Header, Settings } from './shell';
import { UserProfile } from './user';

describe('feature placeholders', () => {
    it('FeedList reads :page', () => {
        renderWithProviders(<FeedList feedType="show" />, { route: '/show/3', path: '/show/:page' });
        expect(screen.getByTestId('feed-list')).toHaveTextContent('show page 3');
    });

    it('FeedItem takes an item', () => {
        renderWithProviders(<FeedItem item={{ id: 1, title: 'Hello' } as Story} />);
        expect(screen.getByTestId('feed-item')).toHaveTextContent('Hello');
    });

    it('ItemDetails reads :id', () => {
        renderWithProviders(<ItemDetails />, { route: '/item/42', path: '/item/:id' });
        expect(screen.getByTestId('item-details')).toHaveTextContent('item 42');
    });

    it('Comment takes a comment', () => {
        renderWithProviders(<Comment comment={{ id: 1, user: 'pg', comments: [] } as unknown as CommentModel} />);
        expect(screen.getByTestId('comment')).toHaveTextContent('pg');
    });

    it('UserProfile reads :id', () => {
        renderWithProviders(<UserProfile />, { route: '/user/pg', path: '/user/:id' });
        expect(screen.getByTestId('user-profile')).toHaveTextContent('user pg');
    });

    it('Header, Footer and Settings render', () => {
        renderWithProviders(
            <>
                <Header />
                <Footer />
                <Settings />
            </>
        );
        expect(screen.getByTestId('header')).toBeInTheDocument();
        expect(screen.getByTestId('footer')).toBeInTheDocument();
        expect(screen.getByTestId('settings')).toBeInTheDocument();
    });

    it('AppShell renders .body-cover and .wrapper with header, outlet, footer', () => {
        const { container } = renderWithProviders(<AppShell />);
        expect(container.querySelector('.body-cover')).toBeInTheDocument();
        const wrapper = container.querySelector('.wrapper');
        expect(wrapper?.firstElementChild).toHaveAttribute('data-testid', 'header');
        expect(wrapper?.lastElementChild).toHaveAttribute('data-testid', 'footer');
    });
});
