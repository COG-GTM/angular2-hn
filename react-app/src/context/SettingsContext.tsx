import {
    useState,
    useEffect,
    useRef,
    useCallback,
    type ReactNode,
} from 'react';
import type { Settings } from '../types';
import { SettingsContext } from './settings-context';

function getInitialSettings(): Settings {
    const openLinkInNewTab = localStorage.getItem('openLinkInNewTab')
        ? JSON.parse(localStorage.getItem('openLinkInNewTab') as string)
        : false;
    const titleFontSize = localStorage.getItem('titleFontSize')
        ? (localStorage.getItem('titleFontSize') as string)
        : '16';
    const listSpacing = localStorage.getItem('listSpacing')
        ? (localStorage.getItem('listSpacing') as string)
        : '0';

    const savedTheme = localStorage.getItem('theme');
    const theme = savedTheme
        ? savedTheme
        : window.matchMedia('(prefers-color-scheme: dark)').matches
          ? 'night'
          : 'default';

    return {
        showSettings: false,
        openLinkInNewTab,
        theme,
        titleFontSize,
        listSpacing,
    };
}

export function SettingsProvider({ children }: { children: ReactNode }) {
    const [settings, setSettings] = useState<Settings>(getInitialSettings);
    const darkColorSchemeMedia = useRef(
        window.matchMedia('(prefers-color-scheme: dark)')
    );

    const setTheme = useCallback((theme: string) => {
        setSettings((prev) => ({ ...prev, theme }));
        localStorage.setItem('theme', theme);
    }, []);

    // Subscribe to the system preferred color scheme changes.
    useEffect(() => {
        const media = darkColorSchemeMedia.current;

        const handleSystemPreferredColorSchemeChange = (
            event: MediaQueryListEvent
        ) => {
            setTheme(event.matches ? 'night' : 'default');
        };

        media.addEventListener('change', handleSystemPreferredColorSchemeChange);

        return () => {
            media.removeEventListener(
                'change',
                handleSystemPreferredColorSchemeChange
            );
        };
    }, [setTheme]);

    const toggleSettings = useCallback(() => {
        setSettings((prev) => ({ ...prev, showSettings: !prev.showSettings }));
    }, []);

    const toggleOpenLinksInNewTab = useCallback(() => {
        setSettings((prev) => {
            const openLinkInNewTab = !prev.openLinkInNewTab;
            localStorage.setItem(
                'openLinkInNewTab',
                JSON.stringify(openLinkInNewTab)
            );
            return { ...prev, openLinkInNewTab };
        });
    }, []);

    const setFont = useCallback((fontSize: string) => {
        setSettings((prev) => ({ ...prev, titleFontSize: fontSize }));
        localStorage.setItem('titleFontSize', fontSize);
    }, []);

    const setSpacing = useCallback((listSpace: string) => {
        setSettings((prev) => ({ ...prev, listSpacing: listSpace }));
        localStorage.setItem('listSpacing', listSpace);
    }, []);

    return (
        <SettingsContext.Provider
            value={{
                settings,
                toggleSettings,
                toggleOpenLinksInNewTab,
                setTheme,
                setFont,
                setSpacing,
            }}
        >
            {children}
        </SettingsContext.Provider>
    );
}
