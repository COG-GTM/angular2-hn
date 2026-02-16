import React, { createContext, useContext, useState, ReactNode } from 'react';

interface Settings {
    itemsPerPage: number;
}

interface SettingsContextType {
    settings: Settings;
    updateSettings: (newSettings: Partial<Settings>) => void;
}

const defaultSettings: Settings = {
    itemsPerPage: 30,
};

const SettingsContext = createContext<SettingsContextType>({
    settings: defaultSettings,
    updateSettings: () => {},
});

export function SettingsProvider({ children }: { children: ReactNode }) {
    const [settings, setSettings] = useState<Settings>(defaultSettings);

    const updateSettings = (newSettings: Partial<Settings>) => {
        setSettings((prev) => ({ ...prev, ...newSettings }));
    };

    return <SettingsContext.Provider value={{ settings, updateSettings }}>{children}</SettingsContext.Provider>;
}

export function useSettings(): SettingsContextType {
    return useContext(SettingsContext);
}
