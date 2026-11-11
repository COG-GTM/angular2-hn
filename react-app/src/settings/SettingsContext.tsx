import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { THEMES, type Settings, type Theme } from '../models';
import { SettingsContext } from './settingsContextValue';

const DARK_SCHEME_QUERY = '(prefers-color-scheme: dark)';

function isTheme(value: string | null): value is Theme {
    return value !== null && (THEMES as readonly string[]).includes(value);
}

function prefersDark(): boolean {
    return typeof window.matchMedia === 'function' && window.matchMedia(DARK_SCHEME_QUERY).matches;
}

// Mirrors SettingsService: a saved theme wins; otherwise the system scheme is applied and saved.
function initialTheme(): Theme {
    const saved = localStorage.getItem('theme');
    if (isTheme(saved)) {
        return saved;
    }
    const theme: Theme = prefersDark() ? 'night' : 'default';
    localStorage.setItem('theme', theme);
    return theme;
}

function readSettings(): Settings {
    const openLinkInNewTab = localStorage.getItem('openLinkInNewTab');
    return {
        showSettings: false,
        openLinkInNewTab: openLinkInNewTab ? JSON.parse(openLinkInNewTab) === true : false,
        theme: initialTheme(),
        titleFontSize: localStorage.getItem('titleFontSize') || '16',
        listSpacing: localStorage.getItem('listSpacing') || '0',
    };
}

export function SettingsProvider({ children }: { children: ReactNode }) {
    const [settings, setSettings] = useState<Settings>(readSettings);

    const setTheme = useCallback((theme: Theme) => {
        localStorage.setItem('theme', theme);
        setSettings((s) => ({ ...s, theme }));
    }, []);

    useEffect(() => {
        if (typeof window.matchMedia !== 'function') {
            return;
        }
        const media = window.matchMedia(DARK_SCHEME_QUERY);
        const onChange = (event: MediaQueryListEvent) => setTheme(event.matches ? 'night' : 'default');
        media.addEventListener('change', onChange);
        return () => media.removeEventListener('change', onChange);
    }, [setTheme]);

    const toggleSettings = useCallback(() => setSettings((s) => ({ ...s, showSettings: !s.showSettings })), []);

    const toggleOpenLinksInNewTab = useCallback(() => {
        setSettings((s) => {
            const openLinkInNewTab = !s.openLinkInNewTab;
            localStorage.setItem('openLinkInNewTab', JSON.stringify(openLinkInNewTab));
            return { ...s, openLinkInNewTab };
        });
    }, []);

    const setFont = useCallback((titleFontSize: string) => {
        localStorage.setItem('titleFontSize', titleFontSize);
        setSettings((s) => ({ ...s, titleFontSize }));
    }, []);

    const setSpacing = useCallback((listSpacing: string) => {
        localStorage.setItem('listSpacing', listSpacing);
        setSettings((s) => ({ ...s, listSpacing }));
    }, []);

    const value = useMemo(
        () => ({ settings, toggleSettings, toggleOpenLinksInNewTab, setTheme, setFont, setSpacing }),
        [settings, toggleSettings, toggleOpenLinksInNewTab, setTheme, setFont, setSpacing]
    );

    return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}
