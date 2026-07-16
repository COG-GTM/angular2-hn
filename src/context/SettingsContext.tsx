import { createContext, useCallback, useContext, useEffect, useReducer, ReactNode } from 'react';
import { Settings } from '../models/settings';

type Action =
    | { type: 'SET_THEME'; theme: string }
    | { type: 'SET_FONT'; fontSize: string }
    | { type: 'SET_SPACING'; listSpacing: string }
    | { type: 'TOGGLE_SETTINGS' }
    | { type: 'SET_OPEN_LINK_IN_NEW_TAB'; value: boolean };

function getInitialSettings(): Settings {
    const storedNewTab = localStorage.getItem('openLinkInNewTab');
    return {
        showSettings: false,
        openLinkInNewTab: storedNewTab ? (JSON.parse(storedNewTab) as boolean) : false,
        theme: 'default',
        titleFontSize: localStorage.getItem('titleFontSize') || '16',
        listSpacing: localStorage.getItem('listSpacing') || '0',
    };
}

function reducer(state: Settings, action: Action): Settings {
    switch (action.type) {
        case 'SET_THEME':
            return { ...state, theme: action.theme };
        case 'SET_FONT':
            return { ...state, titleFontSize: action.fontSize };
        case 'SET_SPACING':
            return { ...state, listSpacing: action.listSpacing };
        case 'TOGGLE_SETTINGS':
            return { ...state, showSettings: !state.showSettings };
        case 'SET_OPEN_LINK_IN_NEW_TAB':
            return { ...state, openLinkInNewTab: action.value };
        default:
            return state;
    }
}

export interface SettingsContextValue {
    settings: Settings;
    setTheme: (theme: string) => void;
    setFont: (fontSize: string) => void;
    setSpacing: (listSpacing: string) => void;
    toggleSettings: () => void;
    toggleOpenLinksInNewTab: () => void;
}

const SettingsContext = createContext<SettingsContextValue | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
    const [settings, dispatch] = useReducer(reducer, undefined, getInitialSettings);

    const setTheme = useCallback((theme: string) => {
        localStorage.setItem('theme', theme);
        dispatch({ type: 'SET_THEME', theme });
    }, []);

    const setFont = useCallback((fontSize: string) => {
        localStorage.setItem('titleFontSize', fontSize);
        dispatch({ type: 'SET_FONT', fontSize });
    }, []);

    const setSpacing = useCallback((listSpacing: string) => {
        localStorage.setItem('listSpacing', listSpacing);
        dispatch({ type: 'SET_SPACING', listSpacing });
    }, []);

    const toggleSettings = useCallback(() => {
        dispatch({ type: 'TOGGLE_SETTINGS' });
    }, []);

    const toggleOpenLinksInNewTab = () => {
        const value = !settings.openLinkInNewTab;
        localStorage.setItem('openLinkInNewTab', JSON.stringify(value));
        dispatch({ type: 'SET_OPEN_LINK_IN_NEW_TAB', value });
    };

    useEffect(() => {
        const media = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = (event: MediaQueryListEvent) => {
            setTheme(event.matches ? 'night' : 'default');
        };
        media.addEventListener('change', handleChange);

        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
            dispatch({ type: 'SET_THEME', theme: savedTheme });
        } else {
            handleChange({ matches: media.matches } as MediaQueryListEvent);
        }

        return () => {
            media.removeEventListener('change', handleChange);
        };
    }, [setTheme]);

    return (
        <SettingsContext.Provider
            value={{ settings, setTheme, setFont, setSpacing, toggleSettings, toggleOpenLinksInNewTab }}
        >
            {children}
        </SettingsContext.Provider>
    );
}

export function useSettings(): SettingsContextValue {
    const context = useContext(SettingsContext);
    if (!context) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return context;
}
