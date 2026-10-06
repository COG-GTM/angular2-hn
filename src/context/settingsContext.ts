import { createContext, useContext } from 'react';
import type { FeedName, Settings } from '../models';

export const THEMES = ['default', 'night', 'amoledblack'] as const;
export type Theme = (typeof THEMES)[number];

export interface AppSettings extends Settings {
    theme: Theme;
    defaultFeed: FeedName;
}

export interface SettingsContextValue {
    settings: AppSettings;
    toggleSettings: () => void;
    toggleOpenLinksInNewTab: () => void;
    setTheme: (theme: Theme) => void;
    setFont: (fontSize: string) => void;
    setSpacing: (listSpacing: string) => void;
    setDefaultFeed: (feed: FeedName) => void;
}

export const SettingsContext = createContext<SettingsContextValue | null>(null);

export function useSettings(): SettingsContextValue {
    const ctx = useContext(SettingsContext);
    if (!ctx) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return ctx;
}
