import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';

import type { Settings } from '../types';
import { SettingsContext, type SettingsContextValue } from './settingsContext';

const DARK_COLOR_SCHEME_QUERY = '(prefers-color-scheme: dark)';

function initialSettings(): Settings {
    const openLinkInNewTab = localStorage.getItem('openLinkInNewTab');
    return {
        showSettings: false,
        openLinkInNewTab: openLinkInNewTab ? (JSON.parse(openLinkInNewTab) as boolean) : false,
        theme: localStorage.getItem('theme') ?? 'default',
        titleFontSize: localStorage.getItem('titleFontSize') ?? '16',
        listSpacing: localStorage.getItem('listSpacing') ?? '0',
    };
}

export function SettingsProvider({ children }: { children: ReactNode }) {
    const [settings, setSettings] = useState<Settings>(initialSettings);

    const setTheme = useCallback((theme: string) => {
        localStorage.setItem('theme', theme);
        setSettings((current) => ({ ...current, theme }));
    }, []);

    useEffect(() => {
        const media = window.matchMedia(DARK_COLOR_SCHEME_QUERY);
        const handleChange = (event: MediaQueryListEvent | MediaQueryList) => {
            setTheme(event.matches ? 'night' : 'default');
        };
        media.addEventListener('change', handleChange);
        if (!localStorage.getItem('theme')) {
            handleChange(media);
        }
        return () => media.removeEventListener('change', handleChange);
    }, [setTheme]);

    const value = useMemo<SettingsContextValue>(
        () => ({
            settings,
            toggleSettings: () => setSettings((current) => ({ ...current, showSettings: !current.showSettings })),
            toggleOpenLinksInNewTab: () =>
                setSettings((current) => {
                    const openLinkInNewTab = !current.openLinkInNewTab;
                    localStorage.setItem('openLinkInNewTab', JSON.stringify(openLinkInNewTab));
                    return { ...current, openLinkInNewTab };
                }),
            setTheme,
            setFont: (titleFontSize: string) => {
                localStorage.setItem('titleFontSize', titleFontSize);
                setSettings((current) => ({ ...current, titleFontSize }));
            },
            setSpacing: (listSpacing: string) => {
                localStorage.setItem('listSpacing', listSpacing);
                setSettings((current) => ({ ...current, listSpacing }));
            },
        }),
        [settings, setTheme]
    );

    return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}
