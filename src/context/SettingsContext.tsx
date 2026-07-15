import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useRef,
    useState,
} from 'react';
import { Settings } from '../models';

export interface SettingsContextValue {
    settings: Settings;
    toggleSettings(): void;
    toggleOpenLinksInNewTab(): void;
    setTheme(theme: string): void; // 'default' | 'night' | 'amoledblack'
    setFont(fontSize: string): void; // titleFontSize
    setSpacing(listSpacing: string): void;
}

// localStorage keys (verbatim from settings.service.ts).
const OPEN_LINK_KEY = 'openLinkInNewTab';
const THEME_KEY = 'theme';
const TITLE_FONT_SIZE_KEY = 'titleFontSize';
const LIST_SPACING_KEY = 'listSpacing';

const DARK_SCHEME_QUERY = '(prefers-color-scheme: dark)';

// Mirrors the initial `settings` object in settings.service.ts: reads from
// localStorage using the same truthiness checks; theme starts as 'default'
// (initTheme adjusts it afterwards).
function getInitialSettings(): Settings {
    const ls = typeof localStorage !== 'undefined' ? localStorage : undefined;
    const openLinkRaw = ls ? ls.getItem(OPEN_LINK_KEY) : null;

    return {
        showSettings: false,
        openLinkInNewTab: openLinkRaw ? JSON.parse(openLinkRaw) : false,
        theme: 'default',
        titleFontSize: (ls && ls.getItem(TITLE_FONT_SIZE_KEY)) || '16',
        listSpacing: (ls && ls.getItem(LIST_SPACING_KEY)) || '0',
    };
}

const SettingsContext = createContext<SettingsContextValue | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [settings, setSettings] = useState<Settings>(getInitialSettings);

    // Keep a ref to the current settings so setters read fresh values without
    // performing side effects inside state updaters (StrictMode-safe).
    const settingsRef = useRef(settings);
    settingsRef.current = settings;

    const setTheme = useCallback((theme: string) => {
        setSettings((s) => ({ ...s, theme }));
        if (typeof localStorage !== 'undefined') {
            localStorage.setItem(THEME_KEY, theme);
        }
    }, []);

    const setFont = useCallback((fontSize: string) => {
        setSettings((s) => ({ ...s, titleFontSize: fontSize }));
        if (typeof localStorage !== 'undefined') {
            localStorage.setItem(TITLE_FONT_SIZE_KEY, fontSize);
        }
    }, []);

    const setSpacing = useCallback((listSpacing: string) => {
        setSettings((s) => ({ ...s, listSpacing }));
        if (typeof localStorage !== 'undefined') {
            localStorage.setItem(LIST_SPACING_KEY, listSpacing);
        }
    }, []);

    const toggleSettings = useCallback(() => {
        const next = !settingsRef.current.showSettings;
        setSettings((s) => ({ ...s, showSettings: next }));
    }, []);

    const toggleOpenLinksInNewTab = useCallback(() => {
        const next = !settingsRef.current.openLinkInNewTab;
        setSettings((s) => ({ ...s, openLinkInNewTab: next }));
        if (typeof localStorage !== 'undefined') {
            localStorage.setItem(OPEN_LINK_KEY, JSON.stringify(next));
        }
    }, []);

    // Subscribe to the system color scheme and initialize the theme, mirroring
    // subscribeToSystemPreferredColorScheme() + initTheme().
    useEffect(() => {
        if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
            return;
        }

        const mql = window.matchMedia(DARK_SCHEME_QUERY);

        const handleChange = (event: MediaQueryListEvent) => {
            setTheme(event.matches ? 'night' : 'default');
        };

        const savedTheme = typeof localStorage !== 'undefined' ? localStorage.getItem(THEME_KEY) : null;
        if (savedTheme) {
            setSettings((s) => ({ ...s, theme: savedTheme }));
        } else {
            setTheme(mql.matches ? 'night' : 'default');
        }

        mql.addEventListener('change', handleChange);
        return () => mql.removeEventListener('change', handleChange);
    }, [setTheme]);

    // Apply the theme class to the document root, reproducing
    // `<div class="{{ settings.theme }}">` from app.component.html so the SCSS
    // theme selectors (.default / .night / .amoledblack) take effect.
    const appliedThemeClass = useRef<string | null>(null);
    useEffect(() => {
        if (typeof document === 'undefined') {
            return;
        }
        const root = document.documentElement;
        if (appliedThemeClass.current) {
            root.classList.remove(appliedThemeClass.current);
        }
        if (settings.theme) {
            root.classList.add(settings.theme);
        }
        appliedThemeClass.current = settings.theme;
    }, [settings.theme]);

    const value: SettingsContextValue = {
        settings,
        toggleSettings,
        toggleOpenLinksInNewTab,
        setTheme,
        setFont,
        setSpacing,
    };

    return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
};

export function useSettings(): SettingsContextValue {
    const ctx = useContext(SettingsContext);
    if (!ctx) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return ctx;
}
