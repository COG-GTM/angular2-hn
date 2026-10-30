import { useEffect, useMemo, useReducer, type ReactNode } from 'react';

import { SettingsContext, type SettingsContextValue } from './settings-context';
import { STORAGE_KEYS, getDarkColorSchemeMedia, loadSettings, settingsReducer, systemTheme } from './settings-store';

export function SettingsProvider({ children }: { children: ReactNode }) {
    const [settings, dispatch] = useReducer(settingsReducer, undefined, loadSettings);

    useEffect(() => {
        const media = getDarkColorSchemeMedia();
        if (!media) {
            return;
        }
        const handleChange = (event: MediaQueryListEvent) =>
            dispatch({ type: 'setTheme', theme: systemTheme(event.matches) });
        media.addEventListener('change', handleChange);
        return () => media.removeEventListener('change', handleChange);
    }, []);

    useEffect(() => {
        localStorage.setItem(STORAGE_KEYS.openLinkInNewTab, JSON.stringify(settings.openLinkInNewTab));
    }, [settings.openLinkInNewTab]);

    useEffect(() => {
        localStorage.setItem(STORAGE_KEYS.theme, settings.theme);
    }, [settings.theme]);

    useEffect(() => {
        localStorage.setItem(STORAGE_KEYS.titleFontSize, settings.titleFontSize);
    }, [settings.titleFontSize]);

    useEffect(() => {
        localStorage.setItem(STORAGE_KEYS.listSpacing, settings.listSpacing);
    }, [settings.listSpacing]);

    const value = useMemo<SettingsContextValue>(
        () => ({
            settings,
            toggleSettings: () => dispatch({ type: 'toggleSettings' }),
            toggleOpenLinksInNewTab: () => dispatch({ type: 'toggleOpenLinksInNewTab' }),
            setTheme: (theme) => dispatch({ type: 'setTheme', theme }),
            setFont: (fontSize) => dispatch({ type: 'setFont', fontSize }),
            setSpacing: (listSpace) => dispatch({ type: 'setSpacing', listSpace }),
        }),
        [settings]
    );

    return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}
