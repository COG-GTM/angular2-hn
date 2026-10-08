import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';

import type { Settings } from '../models';
import {
    DARK_COLOR_SCHEME_QUERY,
    loadSettings,
    saveListSpacing,
    saveOpenLinkInNewTab,
    saveTheme,
    saveTitleFontSize,
} from '../services/settings';
import { SettingsContext, type SettingsContextValue } from './settings-context';

export function SettingsProvider({ children, initial }: { children: ReactNode; initial?: Partial<Settings> }) {
    const [settings, setSettings] = useState<Settings>(() => ({ ...loadSettings(), ...initial }));

    const setTheme = useCallback((theme: string) => {
        saveTheme(theme);
        setSettings((s) => ({ ...s, theme }));
    }, []);

    // Mirrors SettingsService.subscribeToSystemPreferredColorScheme: an OS-level change wins.
    useEffect(() => {
        if (typeof window.matchMedia !== 'function') return;
        const media = window.matchMedia(DARK_COLOR_SCHEME_QUERY);
        const onChange = (event: MediaQueryListEvent) => setTheme(event.matches ? 'night' : 'default');
        media.addEventListener('change', onChange);
        return () => media.removeEventListener('change', onChange);
    }, [setTheme]);

    const value = useMemo<SettingsContextValue>(
        () => ({
            settings,
            toggleSettings: () => setSettings((s) => ({ ...s, showSettings: !s.showSettings })),
            closeSettings: () => setSettings((s) => ({ ...s, showSettings: false })),
            toggleOpenLinksInNewTab: () =>
                setSettings((s) => {
                    const openLinkInNewTab = !s.openLinkInNewTab;
                    saveOpenLinkInNewTab(openLinkInNewTab);
                    return { ...s, openLinkInNewTab };
                }),
            setTheme,
            setFont: (titleFontSize: string) => {
                saveTitleFontSize(titleFontSize);
                setSettings((s) => ({ ...s, titleFontSize }));
            },
            setSpacing: (listSpacing: string) => {
                saveListSpacing(listSpacing);
                setSettings((s) => ({ ...s, listSpacing }));
            },
        }),
        [settings, setTheme]
    );

    return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}
