import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Settings } from '../models';
import { SettingsContext, type SettingsContextValue } from './context';

const DARK_SCHEME_QUERY = '(prefers-color-scheme: dark)';

function initialSettings(): Settings {
    const openLinkInNewTab = localStorage.getItem('openLinkInNewTab');
    return {
        showSettings: false,
        openLinkInNewTab: openLinkInNewTab ? (JSON.parse(openLinkInNewTab) as boolean) : false,
        theme: localStorage.getItem('theme') ?? (window.matchMedia(DARK_SCHEME_QUERY).matches ? 'night' : 'default'),
        titleFontSize: localStorage.getItem('titleFontSize') || '16',
        listSpacing: localStorage.getItem('listSpacing') || '0',
    };
}

export function SettingsProvider({ children }: { children: ReactNode }) {
    const [settings, setSettings] = useState<Settings>(initialSettings);

    const setTheme = useCallback((theme: string) => {
        localStorage.setItem('theme', theme);
        setSettings((s) => ({ ...s, theme }));
    }, []);

    useEffect(() => {
        const media = window.matchMedia(DARK_SCHEME_QUERY);
        if (!localStorage.getItem('theme')) {
            localStorage.setItem('theme', media.matches ? 'night' : 'default');
        }
        const onChange = (event: MediaQueryListEvent) => setTheme(event.matches ? 'night' : 'default');
        media.addEventListener('change', onChange);
        return () => media.removeEventListener('change', onChange);
    }, [setTheme]);

    const value = useMemo<SettingsContextValue>(
        () => ({
            settings,
            setTheme,
            toggleSettings: () => setSettings((s) => ({ ...s, showSettings: !s.showSettings })),
            toggleOpenLinksInNewTab: () =>
                setSettings((s) => {
                    const openLinkInNewTab = !s.openLinkInNewTab;
                    localStorage.setItem('openLinkInNewTab', JSON.stringify(openLinkInNewTab));
                    return { ...s, openLinkInNewTab };
                }),
            setFont: (titleFontSize: string) => {
                localStorage.setItem('titleFontSize', titleFontSize);
                setSettings((s) => ({ ...s, titleFontSize }));
            },
            setSpacing: (listSpacing: string) => {
                localStorage.setItem('listSpacing', listSpacing);
                setSettings((s) => ({ ...s, listSpacing }));
            },
        }),
        [settings, setTheme]
    );

    return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}
