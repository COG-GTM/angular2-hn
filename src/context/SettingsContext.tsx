import { createContext, useContext, type ReactNode } from 'react';

interface SettingsContextValue {
    settings: Record<string, unknown>;
}

const SettingsContext = createContext<SettingsContextValue | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
    return (
        <SettingsContext.Provider value={{ settings: {} }}>
            {children}
        </SettingsContext.Provider>
    );
}

export function useSettings(): SettingsContextValue {
    const ctx = useContext(SettingsContext);
    if (!ctx) throw new Error('useSettings must be used within a SettingsProvider');
    return ctx;
}
