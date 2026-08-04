import { createContext } from 'react';

import { Settings } from '../models';

export interface SettingsContextValue {
    settings: Settings;
    toggleSettings: () => void;
    toggleOpenLinksInNewTab: () => void;
    setTheme: (theme: string) => void;
    setFont: (fontSize: string) => void;
    setSpacing: (listSpacing: string) => void;
}

export const SettingsContext = createContext<SettingsContextValue | null>(null);
