import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { App } from './App';
import { SettingsProvider } from './context/SettingsContext';
import { stubMatchMedia } from './testUtils/matchMedia';

function renderApp(initialEntry = '/news/1') {
    vi.stubGlobal('scrollTo', vi.fn());

    return render(
        <SettingsProvider>
            <MemoryRouter initialEntries={[initialEntry]}>
                <Routes>
                    <Route path="/" element={<App />}>
                        <Route path="news/:page" element={<p>news feed</p>} />
                        <Route path="show/:page" element={<p>show feed</p>} />
                    </Route>
                </Routes>
            </MemoryRouter>
        </SettingsProvider>
    );
}

afterEach(() => {
    vi.unstubAllGlobals();
});

describe('App', () => {
    it('renders the themed shell with the header, the routed page and the footer', () => {
        stubMatchMedia(false);

        const { container } = renderApp();

        expect(container.querySelector('.default .body-cover')).not.toBeNull();
        expect(screen.getByText('news feed').parentElement).toHaveClass('wrapper');
        expect(container.querySelector('.wrapper #header')).not.toBeNull();
        expect(container.querySelector('.wrapper #footer')).not.toBeNull();
    });

    it('applies the theme coming from the settings', () => {
        localStorage.setItem('theme', 'amoledblack');
        stubMatchMedia(false);

        const { container } = renderApp();

        expect(container.querySelector('.amoledblack')).not.toBeNull();
    });

    it('sends a Google Analytics pageview on the initial render and on every navigation', async () => {
        stubMatchMedia(false);
        const ga = vi.fn();
        vi.stubGlobal('ga', ga);

        renderApp();

        expect(ga.mock.calls).toEqual([
            ['set', 'page', '/news/1'],
            ['send', 'pageview'],
        ]);

        ga.mockClear();
        await userEvent.click(screen.getByRole('link', { name: 'show' }));

        expect(screen.getByText('show feed')).toBeInTheDocument();
        expect(ga.mock.calls).toEqual([
            ['set', 'page', '/show/1'],
            ['send', 'pageview'],
        ]);
    });

    it('does not throw when Google Analytics is not loaded', () => {
        stubMatchMedia(false);
        vi.stubGlobal('ga', undefined);

        expect(() => renderApp()).not.toThrow();
        expect(screen.getByText('news feed')).toBeInTheDocument();
    });
});
