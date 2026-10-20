import { render, screen } from '@testing-library/react';
import { QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import { AppRoutes } from './routes';
import { SettingsProvider } from './shared/settings';
import { createTestQueryClient, ROUTER_FUTURE_FLAGS } from './shared/test-utils';

function LocationProbe() {
    return <div data-testid="location">{useLocation().pathname}</div>;
}

function renderAt(route: string) {
    return render(
        <QueryClientProvider client={createTestQueryClient()}>
            <SettingsProvider>
                <MemoryRouter initialEntries={[route]} future={ROUTER_FUTURE_FLAGS}>
                    <AppRoutes />
                    <LocationProbe />
                </MemoryRouter>
            </SettingsProvider>
        </QueryClientProvider>
    );
}

describe('AppRoutes', () => {
    it('redirects / to /news/1', () => {
        renderAt('/');
        expect(screen.getByTestId('location')).toHaveTextContent('/news/1');
        expect(screen.getByTestId('feed-type')).toHaveTextContent('news');
        expect(screen.getByTestId('feed-page')).toHaveTextContent('1');
    });

    it.each(['news', 'newest', 'show', 'ask', 'jobs'])('maps /%s/:page to FeedList', (feedType) => {
        renderAt(`/${feedType}/2`);
        expect(screen.getByTestId('feed-type')).toHaveTextContent(feedType);
        expect(screen.getByTestId('feed-page')).toHaveTextContent('2');
        expect(screen.getByTestId('header-placeholder')).toBeInTheDocument();
        expect(screen.getByTestId('footer-placeholder')).toBeInTheDocument();
    });

    it('maps /item/:id and /user/:id inside the shell', () => {
        renderAt('/item/123');
        expect(screen.getByTestId('item-id')).toHaveTextContent('123');
        expect(screen.getByTestId('header-placeholder')).toBeInTheDocument();
    });

    it('maps /user/:id', () => {
        renderAt('/user/pg');
        expect(screen.getByTestId('user-id')).toHaveTextContent('pg');
    });
});
