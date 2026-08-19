import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { Settings } from '../models';
import { SettingsContext } from './settings-context';

const darkColorSchemeQuery = '(prefers-color-scheme: dark)';

function initialSettings(): Settings {
    const openLinkInNewTab = localStorage.getItem('openLinkInNewTab');

    if (!localStorage.getItem('theme')) {
        localStorage.setItem('theme', window.matchMedia(darkColorSchemeQuery).matches ? 'night' : 'default');
    }

    return {
        showSettings: false,
        openLinkInNewTab: openLinkInNewTab ? (JSON.parse(openLinkInNewTab) as boolean) : false,
        theme: localStorage.getItem('theme') ?? (window.matchMedia(darkColorSchemeQuery).matches ? 'night' : 'default'),
        titleFontSize: localStorage.getItem('titleFontSize') ?? '16',
        listSpacing: localStorage.getItem('listSpacing') ?? '0',
    };
}

export function SettingsProvider({ children }: { children: ReactNode }) {
    const [settings, setSettings] = useState<Settings>(initialSettings);

    const setTheme = useCallback((theme: string) => {
        localStorage.setItem('theme', theme);
        setSettings(current => ({ ...current, theme }));
    }, []);

    useEffect(() => {
        const media = window.matchMedia(darkColorSchemeQuery);
        const onChange = (event: MediaQueryListEvent) => setTheme(event.matches ? 'night' : 'default');
        media.addEventListener('change', onChange);
        return () => media.removeEventListener('change', onChange);
    }, [setTheme]);

    const value = useMemo(
        () => ({
            settings,
            setTheme,
            toggleSettings: () => setSettings(current => ({ ...current, showSettings: !current.showSettings })),
            toggleOpenLinksInNewTab: () =>
                setSettings(current => {
                    const openLinkInNewTab = !current.openLinkInNewTab;
                    localStorage.setItem('openLinkInNewTab', JSON.stringify(openLinkInNewTab));
                    return { ...current, openLinkInNewTab };
                }),
            setFont: (titleFontSize: string) => {
                localStorage.setItem('titleFontSize', titleFontSize);
                setSettings(current => ({ ...current, titleFontSize }));
            },
            setSpacing: (listSpacing: string) => {
                localStorage.setItem('listSpacing', listSpacing);
                setSettings(current => ({ ...current, listSpacing }));
            },
        }),
        [settings, setTheme]
    );

    return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}
