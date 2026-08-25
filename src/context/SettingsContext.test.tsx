import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { SettingsProvider, useSettings } from './SettingsContext';
import type { SettingsContextValue } from './SettingsContext';

let matchesDarkScheme = false;
const listeners = new Set<(event: MediaQueryListEvent) => void>();

function renderProvider(): { context: () => SettingsContextValue; unmount: () => void } {
    let latest: SettingsContextValue | null = null;

    function Probe() {
        latest = useSettings();
        return null;
    }

    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);

    act(() => {
        root.render(
            <SettingsProvider>
                <Probe />
            </SettingsProvider>
        );
    });

    return {
        context: () => {
            if (!latest) {
                throw new Error('Provider did not render');
            }
            return latest;
        },
        unmount: () => act(() => root.unmount()),
    };
}

beforeEach(() => {
    localStorage.clear();
    listeners.clear();
    matchesDarkScheme = false;

    vi.stubGlobal(
        'matchMedia',
        (media: string) =>
            ({
                media,
                matches: matchesDarkScheme,
                addEventListener: (_: string, listener: (event: MediaQueryListEvent) => void) =>
                    listeners.add(listener),
                removeEventListener: (_: string, listener: (event: MediaQueryListEvent) => void) =>
                    listeners.delete(listener),
            }) as unknown as MediaQueryList
    );
});

afterEach(() => {
    vi.unstubAllGlobals();
});

describe('SettingsProvider', () => {
    it('starts from the stored settings', () => {
        localStorage.setItem('openLinkInNewTab', 'true');
        localStorage.setItem('titleFontSize', '20');
        localStorage.setItem('listSpacing', '5');
        localStorage.setItem('theme', 'amoledblack');

        const { context, unmount } = renderProvider();

        expect(context().settings).toEqual({
            showSettings: false,
            openLinkInNewTab: true,
            theme: 'amoledblack',
            titleFontSize: '20',
            listSpacing: '5',
        });

        unmount();
    });

    it('falls back to defaults when nothing is stored', () => {
        const { context, unmount } = renderProvider();

        expect(context().settings).toEqual({
            showSettings: false,
            openLinkInNewTab: false,
            theme: 'default',
            titleFontSize: '16',
            listSpacing: '0',
        });

        unmount();
    });

    it('defaults the theme to night when the system prefers dark', () => {
        matchesDarkScheme = true;

        const { context, unmount } = renderProvider();

        expect(context().settings.theme).toBe('night');
        expect(localStorage.getItem('theme')).toBe('night');

        unmount();
    });

    it('keeps a stored theme instead of following the system preference', () => {
        matchesDarkScheme = true;
        localStorage.setItem('theme', 'default');

        const { context, unmount } = renderProvider();

        expect(context().settings.theme).toBe('default');

        unmount();
    });

    it('follows later system colour scheme changes', () => {
        const { context, unmount } = renderProvider();

        act(() => {
            listeners.forEach((listener) => listener({ matches: true } as MediaQueryListEvent));
        });

        expect(context().settings.theme).toBe('night');

        unmount();
    });

    it('unsubscribes from the colour scheme media query on unmount', () => {
        const { unmount } = renderProvider();

        expect(listeners.size).toBe(1);
        unmount();
        expect(listeners.size).toBe(0);
    });

    it('persists every setting except showSettings', () => {
        const { context, unmount } = renderProvider();

        act(() => context().toggleSettings());
        expect(context().settings.showSettings).toBe(true);
        expect(localStorage.getItem('showSettings')).toBeNull();

        act(() => context().toggleOpenLinksInNewTab());
        act(() => context().setFont('22'));
        act(() => context().setSpacing('4'));
        act(() => context().setTheme('amoledblack'));

        expect(context().settings).toMatchObject({
            openLinkInNewTab: true,
            titleFontSize: '22',
            listSpacing: '4',
            theme: 'amoledblack',
        });
        expect(localStorage.getItem('openLinkInNewTab')).toBe('true');
        expect(localStorage.getItem('titleFontSize')).toBe('22');
        expect(localStorage.getItem('listSpacing')).toBe('4');
        expect(localStorage.getItem('theme')).toBe('amoledblack');

        unmount();
    });

    it('throws when useSettings is used outside a provider', () => {
        function Orphan() {
            useSettings();
            return null;
        }

        const container = document.createElement('div');
        const root = createRoot(container);

        expect(() => act(() => root.render(<Orphan />))).toThrow(/SettingsProvider/);
    });
});
