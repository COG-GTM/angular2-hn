import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

import { AppRoutes } from './App';
import { SettingsProvider } from './context/SettingsContext';

// Routing only: feature folders are stubbed so this test is independent of what Phases 2-5 ship.
vi.mock('./pages/feeds', async () => {
    const { useParams } = await import('react-router-dom');
    return {
        FeedPage: ({ feedType }: { feedType: string }) => <p>{`feed ${feedType} ${useParams().page}`}</p>,
    };
});
vi.mock('./pages/item', async () => {
    const { useParams } = await import('react-router-dom');
    return { ItemDetailsPage: () => <p>{`item ${useParams().id}`}</p> };
});
vi.mock('./pages/user', async () => {
    const { useParams } = await import('react-router-dom');
    return { UserPage: () => <p>{`user ${useParams().id}`}</p> };
});
vi.mock('./components', () => ({
    Header: () => <header>header</header>,
    Footer: () => <footer>footer</footer>,
    Settings: () => <div>settings panel</div>,
    Loader: () => <div>loading</div>,
}));

function renderAt(url: string) {
    return render(
        <SettingsProvider>
            <MemoryRouter initialEntries={[url]}>
                <AppRoutes />
            </MemoryRouter>
        </SettingsProvider>
    );
}

describe('AppRoutes', () => {
    it('redirects / to /news/1', async () => {
        renderAt('/');
        expect(await screen.findByText('feed news 1')).toBeInTheDocument();
    });

    it.each(['news', 'newest', 'show', 'ask', 'jobs'])(
        '/%s/:page renders the feed with that feedType',
        async (feed) => {
            renderAt(`/${feed}/3`);
            expect(await screen.findByText(`feed ${feed} 3`)).toBeInTheDocument();
            expect(screen.getByText('header')).toBeInTheDocument();
            expect(screen.getByText('footer')).toBeInTheDocument();
        }
    );

    it('lazy-loads /item/:id and /user/:id', async () => {
        renderAt('/item/42');
        expect(await screen.findByText('item 42')).toBeInTheDocument();
        renderAt('/user/pg');
        expect(await screen.findByText('user pg')).toBeInTheDocument();
    });

    it('wraps the app in the theme class like Angular', async () => {
        localStorage.setItem('theme', 'night');
        const { container } = renderAt('/news/1');
        await screen.findByText('feed news 1');
        expect(container.firstElementChild).toHaveClass('night');
        expect(container.querySelector('.night > .body-cover + .wrapper')).not.toBeNull();
    });

    it('unknown URLs render the shell with an empty outlet', () => {
        renderAt('/nope');
        expect(screen.getByText('header')).toBeInTheDocument();
        expect(screen.queryByText(/^feed/)).toBeNull();
    });
});
