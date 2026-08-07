import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { SettingsProvider } from './context/SettingsContext';
import { routes } from './routes';

function renderApp(initialEntry: string) {
    const router = createMemoryRouter(routes, { initialEntries: [initialEntry] });

    return {
        router,
        ...render(
            <SettingsProvider>
                <RouterProvider router={router} />
            </SettingsProvider>
        ),
    };
}

describe('routing', () => {
    beforeEach(() => {
        localStorage.clear();
        vi.stubGlobal(
            'matchMedia',
            vi.fn(() => ({
                matches: false,
                media: '(prefers-color-scheme: dark)',
                addEventListener: vi.fn(),
                removeEventListener: vi.fn(),
            }))
        );
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it('redirects the index route to news/1', async () => {
        const { router } = renderApp('/');

        await waitFor(() => expect(router.state.location.pathname).toBe('/news/1'));
    });

    it.each(['news', 'newest', 'show', 'ask', 'jobs'])('renders the %s feed for its path', (feedType) => {
        const { container } = renderApp(`/${feedType}/1`);

        expect(container.querySelector('[data-feed-type]')).toHaveAttribute('data-feed-type', feedType);
    });

    it('renders the lazily loaded item route', async () => {
        const { container } = renderApp('/item/123');

        await waitFor(() => expect(container.querySelector('.main-content')).toBeInTheDocument());
    });

    it('renders the lazily loaded user route', async () => {
        const { container } = renderApp('/user/pg');

        await waitFor(() => expect(container.querySelector('.profile')).toBeInTheDocument());
    });

    it('navigates between feeds through the header links', async () => {
        const { router } = renderApp('/news/1');

        await userEvent.click(screen.getByRole('link', { name: 'ask' }));

        expect(router.state.location.pathname).toBe('/ask/1');
    });
});

describe('Layout', () => {
    beforeEach(() => {
        localStorage.clear();
        vi.stubGlobal(
            'matchMedia',
            vi.fn(() => ({
                matches: false,
                media: '(prefers-color-scheme: dark)',
                addEventListener: vi.fn(),
                removeEventListener: vi.fn(),
            }))
        );
    });

    afterEach(() => {
        vi.unstubAllGlobals();
        delete window.ga;
    });

    it('applies the current theme as the root class name', () => {
        localStorage.setItem('theme', 'amoledblack');

        const { container } = renderApp('/news/1');

        expect(container.firstElementChild).toHaveClass('amoledblack');
        expect(container.querySelector('.amoledblack > .body-cover')).toBeInTheDocument();
        expect(container.querySelector('.wrapper #header')).toBeInTheDocument();
        expect(container.querySelector('.wrapper #footer')).toBeInTheDocument();
    });

    it('sends a Google Analytics pageview on load and on every navigation', async () => {
        const ga = vi.fn();
        window.ga = ga;

        renderApp('/news/1');

        expect(ga).toHaveBeenCalledWith('set', 'page', '/news/1');
        expect(ga).toHaveBeenCalledWith('send', 'pageview');

        ga.mockClear();
        await userEvent.click(screen.getByRole('link', { name: 'show' }));

        await waitFor(() => expect(ga).toHaveBeenCalledWith('set', 'page', '/show/1'));
        expect(ga).toHaveBeenCalledWith('send', 'pageview');
    });

    it('does not blow up when Google Analytics is unavailable', () => {
        expect(() => renderApp('/news/1')).not.toThrow();
    });
});

describe('Settings panel', () => {
    beforeEach(() => {
        localStorage.clear();
        vi.stubGlobal(
            'matchMedia',
            vi.fn(() => ({
                matches: false,
                media: '(prefers-color-scheme: dark)',
                addEventListener: vi.fn(),
                removeEventListener: vi.fn(),
            }))
        );
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    async function openSettings() {
        renderApp('/news/1');
        await userEvent.click(screen.getByAltText('Settings'));
    }

    it('is hidden until the cog is clicked and closes again through the × button', async () => {
        renderApp('/news/1');
        expect(screen.queryByRole('heading', { name: 'Settings' })).not.toBeInTheDocument();

        await userEvent.click(screen.getByAltText('Settings'));
        expect(screen.getByRole('heading', { name: 'Settings' })).toBeInTheDocument();

        await userEvent.click(screen.getByText('×'));
        expect(screen.queryByRole('heading', { name: 'Settings' })).not.toBeInTheDocument();
    });

    it('applies the selected theme to the root wrapper', async () => {
        await openSettings();

        await userEvent.click(screen.getByRole('radio', { name: 'Night' }));

        expect(document.querySelector('.night')).toBeInTheDocument();
        expect(localStorage.getItem('theme')).toBe('night');
    });

    it('updates the font size and list spacing', async () => {
        await openSettings();

        const fontSize = screen.getByLabelText(/Font size:/);
        await userEvent.clear(fontSize);
        await userEvent.type(fontSize, '20');
        expect(localStorage.getItem('titleFontSize')).toBe('20');

        const listSpacing = screen.getByLabelText(/List spacing:/);
        await userEvent.clear(listSpacing);
        await userEvent.type(listSpacing, '5');
        expect(localStorage.getItem('listSpacing')).toBe('5');
    });

    it('toggles the open-links-in-a-new-tab preference', async () => {
        await openSettings();

        const checkbox = screen.getByRole('checkbox');
        expect(checkbox).not.toBeChecked();

        await userEvent.click(checkbox);

        expect(checkbox).toBeChecked();
        expect(localStorage.getItem('openLinkInNewTab')).toBe('true');
    });
});
