import { screen, within } from '@testing-library/react';
import { Route, Routes, useLocation } from 'react-router';

import { makeStory } from './test/fixtures';
import { mockFetch, renderWithProviders } from './test/utils';
import { App } from './App';

function LocationProbe() {
    return <div data-testid="location">{useLocation().pathname}</div>;
}

function renderApp(route: string) {
    return renderWithProviders(
        <>
            <App />
            <Routes>
                <Route path="*" element={<LocationProbe />} />
            </Routes>
        </>,
        { route }
    );
}

const fullPage = Array.from({ length: 30 }, (_, i) => makeStory({ id: i + 1, title: `Story ${i + 1}` }));

describe('routing', () => {
    it('redirects / to /news/1', async () => {
        mockFetch(() => fullPage);
        renderApp('/');
        expect(await screen.findByText('Story 1')).toBeInTheDocument();
        expect(screen.getByTestId('location')).toHaveTextContent('/news/1');
    });

    it.each(['news', 'newest', 'show', 'ask', 'jobs'])('renders the %s feed for its page param', async (feed) => {
        const fetchSpy = mockFetch(() => fullPage);
        renderApp(`/${feed}/3`);
        const list = await screen.findByRole('list');
        expect(list).toHaveAttribute('start', '61');
        expect(fetchSpy.mock.calls[0][0]).toBe(`https://node-hnapi.herokuapp.com/${feed}?page=3`);
        expect(screen.getByRole('link', { name: '‹ Prev' })).toHaveAttribute('href', `/${feed}/2`);
        expect(screen.getByRole('link', { name: 'More ›' })).toHaveAttribute('href', `/${feed}/4`);
        expect(screen.queryByText(/jobs at startups/) !== null).toBe(feed === 'jobs');
    });

    it('hides Prev on page 1 and More on a short page', async () => {
        mockFetch(() => fullPage.slice(0, 5));
        renderApp('/news/1');
        await screen.findByText('Story 1');
        expect(screen.queryByText('‹ Prev')).not.toBeInTheDocument();
        expect(screen.queryByText('More ›')).not.toBeInTheDocument();
    });

    it('shows an error message when a feed fails to load', async () => {
        mockFetch(() => new Error('down'));
        renderApp('/show/1');
        expect(await screen.findByText('Could not load show stories.')).toBeInTheDocument();
    });

    it('lazy-loads the item details page', async () => {
        mockFetch(() =>
            makeStory({
                id: 8863,
                title: 'Dropbox',
                content: '<p>Body text</p>',
                comments: [
                    {
                        id: 9,
                        level: 0,
                        user: 'bob',
                        time: 0,
                        time_ago: 'now',
                        content: 'Nice',
                        deleted: false,
                        comments: [],
                    },
                ],
            })
        );
        renderApp('/item/8863');
        expect((await screen.findAllByText('Dropbox')).length).toBeGreaterThan(0);
        expect(screen.getByText('Body text')).toBeInTheDocument();
        expect(screen.getByText('Nice')).toBeInTheDocument();
    });

    it('lazy-loads the user page', async () => {
        mockFetch(() => ({ id: 'pg', karma: 157316, created: '20 years ago', about: 'Bug fixer.' }));
        renderApp('/user/pg');
        expect(await screen.findByText('157316 ★')).toBeInTheDocument();
        expect(screen.getByText('Created 20 years ago')).toBeInTheDocument();
        expect(screen.getByText('Bug fixer.')).toBeInTheDocument();
    });

    it('shows an error when the user cannot be loaded', async () => {
        mockFetch(() => new Error('missing'));
        renderApp('/user/nobody');
        expect(await screen.findByText('Could not load user nobody.')).toBeInTheDocument();
    });

    it('opens the settings popup and applies the selected theme', async () => {
        mockFetch(() => fullPage);
        const { container } = renderApp('/news/1');
        await screen.findByText('Story 1');
        screen.getByAltText('Settings').click();
        const dialog = await screen.findByRole('dialog', { name: 'Settings' });
        within(dialog).getByLabelText('Black (AMOLED)').click();
        expect(container.firstElementChild).toHaveClass('amoledblack');
        expect(localStorage.getItem('theme')).toBe('amoledblack');
    });
});
