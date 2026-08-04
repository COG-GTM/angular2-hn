import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, type ReactNode } from 'react';

import { Settings } from '../models';

const DARK_COLOR_SCHEME_QUERY = '(prefers-color-scheme: dark)';

type SettingsAction =
    | { type: 'toggleSettings' }
    | { type: 'toggleOpenLinksInNewTab' }
    | { type: 'setTheme'; theme: string }
    | { type: 'setFont'; titleFontSize: string }
    | { type: 'setSpacing'; listSpacing: string };

export interface SettingsContextValue extends Settings {
    toggleSettings: () => void;
    toggleOpenLinksInNewTab: () => void;
    setTheme: (theme: string) => void;
    setFont: (fontSize: string) => void;
    setSpacing: (listSpacing: string) => void;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

function readStorage(key: string): string | null {
    try {
        return typeof localStorage === 'undefined' ? null : localStorage.getItem(key);
    } catch {
        return null;
    }
}

function writeStorage(key: string, value: string): void {
    try {
        if (typeof localStorage !== 'undefined') {
            localStorage.setItem(key, value);
        }
    } catch {
        // storage may be unavailable (private mode, jsdom without storage)
    }
}

function getDarkColorSchemeMedia(): MediaQueryList | null {
    return typeof window !== 'undefined' && typeof window.matchMedia === 'function'
        ? window.matchMedia(DARK_COLOR_SCHEME_QUERY)
        : null;
}

function initSettings(): Settings {
    const openLinkInNewTab = readStorage('openLinkInNewTab');
    const savedTheme = readStorage('theme');
    const darkColorSchemeMedia = getDarkColorSchemeMedia();

    return {
        showSettings: false,
        openLinkInNewTab: openLinkInNewTab ? (JSON.parse(openLinkInNewTab) as boolean) : false,
        theme: savedTheme ? savedTheme : darkColorSchemeMedia?.matches ? 'night' : 'default',
        titleFontSize: readStorage('titleFontSize') ?? '16',
        listSpacing: readStorage('listSpacing') ?? '0',
    };
}

function settingsReducer(state: Settings, action: SettingsAction): Settings {
    switch (action.type) {
        case 'toggleSettings':
            return { ...state, showSettings: !state.showSettings };
        case 'toggleOpenLinksInNewTab':
            return { ...state, openLinkInNewTab: !state.openLinkInNewTab };
        case 'setTheme':
            return { ...state, theme: action.theme };
        case 'setFont':
            return { ...state, titleFontSize: action.titleFontSize };
        case 'setSpacing':
            return { ...state, listSpacing: action.listSpacing };
    }
}

export function SettingsProvider({ children }: { children: ReactNode }) {
    const [settings, dispatch] = useReducer(settingsReducer, undefined, initSettings);

    const toggleSettings = useCallback(() => dispatch({ type: 'toggleSettings' }), []);

    const toggleOpenLinksInNewTab = useCallback(() => {
        writeStorage('openLinkInNewTab', JSON.stringify(!settings.openLinkInNewTab));
        dispatch({ type: 'toggleOpenLinksInNewTab' });
    }, [settings.openLinkInNewTab]);

    const setTheme = useCallback((theme: string) => {
        writeStorage('theme', theme);
        dispatch({ type: 'setTheme', theme });
    }, []);

    const setFont = useCallback((fontSize: string) => {
        writeStorage('titleFontSize', fontSize);
        dispatch({ type: 'setFont', titleFontSize: fontSize });
    }, []);

    const setSpacing = useCallback((listSpacing: string) => {
        writeStorage('listSpacing', listSpacing);
        dispatch({ type: 'setSpacing', listSpacing });
    }, []);

    useEffect(() => {
        const darkColorSchemeMedia = getDarkColorSchemeMedia();
        if (!darkColorSchemeMedia) {
            return;
        }
        const handleChange = (event: MediaQueryListEvent) => setTheme(event.matches ? 'night' : 'default');
        darkColorSchemeMedia.addEventListener('change', handleChange);
        return () => darkColorSchemeMedia.removeEventListener('change', handleChange);
    }, [setTheme]);

    const value = useMemo<SettingsContextValue>(
        () => ({
            ...settings,
            toggleSettings,
            toggleOpenLinksInNewTab,
            setTheme,
            setFont,
            setSpacing,
        }),
        [settings, toggleSettings, toggleOpenLinksInNewTab, setTheme, setFont, setSpacing]
    );

    return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings(): SettingsContextValue {
    const context = useContext(SettingsContext);
    if (!context) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return context;
}
