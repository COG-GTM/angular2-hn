import { act, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { mockFetch, renderApp } from '../test/utils';

type ChangeListener = (event: MediaQueryListEvent) => void;

function stubColorScheme(dark: boolean) {
    const listeners: ChangeListener[] = [];
    vi.stubGlobal(
        'matchMedia',
        vi.fn((query: string) => ({
            matches: dark && query === '(prefers-color-scheme: dark)',
            media: query,
            addEventListener: (_: string, l: ChangeListener) => listeners.push(l),
            removeEventListener: (_: string, l: ChangeListener) => listeners.splice(listeners.indexOf(l), 1),
        }))
    );
    return (matches: boolean) => act(() => listeners.forEach((l) => l({ matches } as MediaQueryListEvent)));
}

function themeRoot(container: HTMLElement) {
    return container.firstElementChild as HTMLElement;
}

describe('AppLayout', () => {
    beforeEach(() => {
        mockFetch({ 'node-hnapi': [] });
    });

    it('renders the theme root, body cover and wrapper with header, page and footer', async () => {
        const { container } = renderApp({ route: '/news/1', settings: { theme: 'night' } });
        await screen.findByAltText('Settings');
        const root = themeRoot(container);
        expect(root).toHaveClass('night');
        expect(root.children[0]).toHaveClass('body-cover');
        const wrapper = root.children[1];
        expect(wrapper).toHaveClass('wrapper');
        expect(wrapper.firstElementChild!.matches('header')).toBe(true);
        expect(wrapper.querySelector(':scope > header > #header')).toBeInTheDocument();
        expect(wrapper.lastElementChild).toHaveAttribute('id', 'footer');
        expect(wrapper.children.length).toBeGreaterThan(2);
    });

    it('defaults to the default theme', async () => {
        stubColorScheme(false);
        const { container } = renderApp({ route: '/news/1' });
        await screen.findByAltText('Settings');
        expect(themeRoot(container).className).toBe('default');
    });

    it('uses night when the OS prefers dark and no theme is saved', async () => {
        stubColorScheme(true);
        const { container } = renderApp({ route: '/news/1' });
        await screen.findByAltText('Settings');
        expect(themeRoot(container).className).toBe('night');
    });

    it('prefers a saved theme over the OS preference', async () => {
        stubColorScheme(true);
        localStorage.setItem('theme', 'amoledblack');
        const { container } = renderApp({ route: '/news/1' });
        await screen.findByAltText('Settings');
        expect(themeRoot(container).className).toBe('amoledblack');
    });

    it('follows OS color scheme changes', async () => {
        const setDark = stubColorScheme(false);
        const { container } = renderApp({ route: '/news/1' });
        await screen.findByAltText('Settings');
        setDark(true);
        expect(themeRoot(container).className).toBe('night');
        expect(localStorage.getItem('theme')).toBe('night');
        setDark(false);
        expect(themeRoot(container).className).toBe('default');
    });

    it.each([
        ['Night', 'night'],
        ['Black (AMOLED)', 'amoledblack'],
        ['Default', 'default'],
    ])('applies the %s theme from settings and restores it after a reload', async (label, theme) => {
        const user = userEvent.setup();
        const first = renderApp({ route: '/news/1', settings: { theme: theme === 'default' ? 'night' : 'default' } });
        await user.click(await screen.findByAltText('Settings'));
        await user.click(screen.getByLabelText(label));
        expect(themeRoot(first.container).className).toBe(theme);
        first.unmount();

        const second = renderApp({ route: '/news/1' });
        await waitFor(() => expect(themeRoot(second.container).className).toBe(theme));
    });
});
