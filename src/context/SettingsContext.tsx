import React, { createContext, useContext, useState } from 'react';
import { Settings } from '../models';

export interface SettingsContextValue {
    settings: Settings;
    toggleSettings(): void;
    toggleOpenLinksInNewTab(): void;
    setTheme(theme: string): void; // 'default' | 'night' | 'amoledblack'
    setFont(fontSize: string): void; // titleFontSize
    setSpacing(listSpacing: string): void;
}

// STUB (Task 0): default state matches settings.service.ts initial values.
// Full media-query/localStorage wiring lands in the settings task.
const defaultSettings: Settings = {
    showSettings: false,
    openLinkInNewTab: false,
    theme: 'default',
    titleFontSize: '16',
    listSpacing: '0',
};

const SettingsContext = createContext<SettingsContextValue | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [settings, setSettings] = useState<Settings>(defaultSettings);

    const toggleSettings = () =>
        setSettings((s) => ({ ...s, showSettings: !s.showSettings }));

    const toggleOpenLinksInNewTab = () =>
        setSettings((s) => ({ ...s, openLinkInNewTab: !s.openLinkInNewTab }));

    const setTheme = (theme: string) => setSettings((s) => ({ ...s, theme }));

    const setFont = (fontSize: string) =>
        setSettings((s) => ({ ...s, titleFontSize: fontSize }));

    const setSpacing = (listSpacing: string) =>
        setSettings((s) => ({ ...s, listSpacing }));

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
