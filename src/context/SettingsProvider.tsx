import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { Settings } from '../models';
import { SettingsContext } from './settingsContext';
import type { SettingsContextValue } from './settingsContext';

const DARK_COLOR_SCHEME_QUERY = '(prefers-color-scheme: dark)';

function systemTheme(): string {
    return typeof window.matchMedia === 'function' && window.matchMedia(DARK_COLOR_SCHEME_QUERY).matches
        ? 'night'
        : 'default';
}

function storedOpenLinkInNewTab(): boolean {
    const stored = localStorage.getItem('openLinkInNewTab');
    if (!stored) {
        return false;
    }
    try {
        return JSON.parse(stored) === true;
    } catch {
        return false;
    }
}

export function initialSettings(): Settings {
    return {
        showSettings: false,
        openLinkInNewTab: storedOpenLinkInNewTab(),
        theme: localStorage.getItem('theme') ?? systemTheme(),
        titleFontSize: localStorage.getItem('titleFontSize') ?? '16',
        listSpacing: localStorage.getItem('listSpacing') ?? '0',
    };
}

export function SettingsProvider({ children }: { children: ReactNode }) {
    const [settings, setSettings] = useState<Settings>(initialSettings);

    useEffect(() => {
        const media = window.matchMedia(DARK_COLOR_SCHEME_QUERY);

        const applySystemScheme = (matches: boolean) => {
            const theme = matches ? 'night' : 'default';
            setSettings((current) => ({ ...current, theme }));
            localStorage.setItem('theme', theme);
        };

        const handleChange = (event: MediaQueryListEvent) => applySystemScheme(event.matches);

        media.addEventListener('change', handleChange);

        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
            setSettings((current) => ({ ...current, theme: savedTheme }));
        } else {
            applySystemScheme(media.matches);
        }

        return () => media.removeEventListener('change', handleChange);
    }, []);

    const toggleSettings = useCallback(() => {
        setSettings((current) => ({ ...current, showSettings: !current.showSettings }));
    }, []);

    const toggleOpenLinksInNewTab = useCallback(() => {
        setSettings((current) => {
            const openLinkInNewTab = !current.openLinkInNewTab;
            localStorage.setItem('openLinkInNewTab', JSON.stringify(openLinkInNewTab));
            return { ...current, openLinkInNewTab };
        });
    }, []);

    const setTheme = useCallback((theme: string) => {
        localStorage.setItem('theme', theme);
        setSettings((current) => ({ ...current, theme }));
    }, []);

    const setFont = useCallback((titleFontSize: string) => {
        localStorage.setItem('titleFontSize', titleFontSize);
        setSettings((current) => ({ ...current, titleFontSize }));
    }, []);

    const setSpacing = useCallback((listSpacing: string) => {
        localStorage.setItem('listSpacing', listSpacing);
        setSettings((current) => ({ ...current, listSpacing }));
    }, []);

    const value = useMemo<SettingsContextValue>(
        () => ({ settings, toggleSettings, toggleOpenLinksInNewTab, setTheme, setFont, setSpacing }),
        [settings, toggleSettings, toggleOpenLinksInNewTab, setTheme, setFont, setSpacing]
    );

    return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}
