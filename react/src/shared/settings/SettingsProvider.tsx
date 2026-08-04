import { ReactNode, useCallback, useEffect, useMemo, useState } from 'react';

import { Settings } from '../models';
import { SettingsContext, SettingsContextValue } from './settingsContext';
import { getDarkColorSchemeMedia, readStoredValue, writeStoredValue } from './storage';

function createInitialSettings(): Settings {
    const openLinkInNewTab = readStoredValue('openLinkInNewTab');

    return {
        showSettings: false,
        openLinkInNewTab: openLinkInNewTab ? JSON.parse(openLinkInNewTab) : false,
        theme: 'default',
        titleFontSize: readStoredValue('titleFontSize') ?? '16',
        listSpacing: readStoredValue('listSpacing') ?? '0',
    };
}

interface SettingsProviderProps {
    children: ReactNode;
}

export function SettingsProvider({ children }: SettingsProviderProps) {
    const [settings, setSettings] = useState<Settings>(createInitialSettings);

    const toggleSettings = useCallback(() => {
        setSettings((current) => ({ ...current, showSettings: !current.showSettings }));
    }, []);

    const toggleOpenLinksInNewTab = useCallback(() => {
        setSettings((current) => {
            const openLinkInNewTab = !current.openLinkInNewTab;
            writeStoredValue('openLinkInNewTab', JSON.stringify(openLinkInNewTab));
            return { ...current, openLinkInNewTab };
        });
    }, []);

    const setTheme = useCallback((theme: string) => {
        writeStoredValue('theme', theme);
        setSettings((current) => ({ ...current, theme }));
    }, []);

    const setFont = useCallback((titleFontSize: string) => {
        writeStoredValue('titleFontSize', titleFontSize);
        setSettings((current) => ({ ...current, titleFontSize }));
    }, []);

    const setSpacing = useCallback((listSpacing: string) => {
        writeStoredValue('listSpacing', listSpacing);
        setSettings((current) => ({ ...current, listSpacing }));
    }, []);

    useEffect(() => {
        const darkColorSchemeMedia = getDarkColorSchemeMedia();
        const handleSystemPreferredColorSchemeChange = (matches: boolean) => setTheme(matches ? 'night' : 'default');
        const handleChange = (event: MediaQueryListEvent) => handleSystemPreferredColorSchemeChange(event.matches);

        darkColorSchemeMedia?.addEventListener('change', handleChange);

        const savedTheme = readStoredValue('theme');
        if (savedTheme) {
            setSettings((current) => ({ ...current, theme: savedTheme }));
        } else if (darkColorSchemeMedia) {
            handleSystemPreferredColorSchemeChange(darkColorSchemeMedia.matches);
        }

        return () => darkColorSchemeMedia?.removeEventListener('change', handleChange);
    }, [setTheme]);

    const value = useMemo<SettingsContextValue>(
        () => ({ settings, toggleSettings, toggleOpenLinksInNewTab, setTheme, setFont, setSpacing }),
        [settings, toggleSettings, toggleOpenLinksInNewTab, setTheme, setFont, setSpacing]
    );

    return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}
