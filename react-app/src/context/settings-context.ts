import { createContext } from 'react';
import type { Settings } from '../types';

export interface SettingsContextValue {
    settings: Settings;
    toggleSettings: () => void;
    toggleOpenLinksInNewTab: () => void;
    setTheme: (theme: string) => void;
    setFont: (fontSize: string) => void;
    setSpacing: (listSpace: string) => void;
}

export const SettingsContext = createContext<SettingsContextValue | undefined>(
    undefined
);
