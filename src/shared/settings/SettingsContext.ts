import { createContext } from 'react';
import type { Settings } from '../models';

export interface SettingsContextValue {
    settings: Settings;
    toggleSettings: () => void;
    toggleOpenLinksInNewTab: () => void;
    setTheme: (theme: string) => void;
    setFont: (titleFontSize: string) => void;
    setSpacing: (listSpacing: string) => void;
}

export const SettingsContext = createContext<SettingsContextValue | null>(null);
