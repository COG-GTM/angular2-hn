import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Link, MemoryRouter, Route, Routes } from 'react-router-dom';

import { SettingsProvider } from '../settings';
import { mockMatchMedia } from '../test/matchMedia';
import { AppLayout } from './AppLayout';

function renderLayout(initialPath = '/news/1') {
    return render(
        <MemoryRouter initialEntries={[initialPath]}>
            <SettingsProvider>
                <AppLayout>
                    <Routes>
                        <Route path="/news/1" element={<Link to="/ask/1">go to ask</Link>} />
                        <Route path="/ask/1" element={<p>ask page</p>} />
                    </Routes>
                </AppLayout>
            </SettingsProvider>
        </MemoryRouter>
    );
}

describe('AppLayout', () => {
    beforeEach(() => {
        localStorage.clear();
        mockMatchMedia(false);
        delete window.ga;
    });

    it('wraps header, children and footer in the theme container', () => {
        localStorage.setItem('theme', 'night');
        const { container } = renderLayout();
        const themed = container.firstElementChild;
        expect(themed).toHaveClass('night');
        expect(themed?.querySelector('.body-cover')).not.toBeNull();

        const wrapper = themed?.querySelector('.wrapper');
        expect(wrapper).not.toBeNull();
        const children = Array.from(wrapper?.children ?? []);
        expect(children[0].tagName).toBe('HEADER');
        expect(children[1]).toHaveTextContent('go to ask');
        expect(children[2]).toHaveAttribute('id', 'footer');
    });

    it('uses the default theme when nothing is persisted', () => {
        const { container } = renderLayout();
        expect(container.firstElementChild).toHaveClass('default');
    });

    it('follows theme changes from the settings panel', async () => {
        const user = userEvent.setup();
        const { container } = renderLayout();
        await user.click(screen.getByAltText('Settings'));
        await user.click(screen.getByRole('radio', { name: 'Night' }));
        expect(container.firstElementChild).toHaveClass('night');
    });

    it('sends a pageview to ga on mount and on every route change', async () => {
        const user = userEvent.setup();
        const ga = vi.fn();
        window.ga = ga;
        renderLayout();
        expect(ga).toHaveBeenCalledWith('set', 'page', '/news/1');
        expect(ga).toHaveBeenCalledWith('send', 'pageview');
        expect(ga).toHaveBeenCalledTimes(2);

        await user.click(screen.getByRole('link', { name: 'go to ask' }));
        expect(screen.getByText('ask page')).toBeInTheDocument();
        expect(ga).toHaveBeenCalledWith('set', 'page', '/ask/1');
        expect(ga).toHaveBeenCalledTimes(4);
    });

    it('does not fail when window.ga is undefined', async () => {
        const user = userEvent.setup();
        renderLayout();
        expect(window.ga).toBeUndefined();
        await user.click(screen.getByRole('link', { name: 'go to ask' }));
        expect(screen.getByText('ask page')).toBeInTheDocument();
    });
});
