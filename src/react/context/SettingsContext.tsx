import * as React from 'react';
import { createContext, useContext, ReactNode } from 'react';

import { Settings } from '../../app/shared/models/settings';

export const defaultSettings: Settings = {
    showSettings: false,
    openLinkInNewTab: localStorage.getItem('openLinkInNewTab')
        ? JSON.parse(localStorage.getItem('openLinkInNewTab') as string)
        : false,
    theme: 'default',
    titleFontSize: localStorage.getItem('titleFontSize') || '16',
    listSpacing: localStorage.getItem('listSpacing') || '0',
};

const SettingsContext = createContext<Settings>(defaultSettings);

interface SettingsProviderProps {
    settings?: Settings;
    children: ReactNode;
}

// TODO: mirrors only the read path of SettingsService. The writer methods (toggleOpenLinksInNewTab, setTheme,
// setFont, setSpacing) and the prefers-color-scheme subscription move here when SettingsComponent is migrated;
// until then `defaultSettings` is a localStorage snapshot taken at module load, so consumers only pick up
// settings changes through a `settings` prop on the provider (or a remount), not from a live store.
export const SettingsProvider = ({ settings = defaultSettings, children }: SettingsProviderProps) => {
    return <SettingsContext.Provider value={settings}>{children}</SettingsContext.Provider>;
};

export const useSettings = (): Settings => useContext(SettingsContext);
