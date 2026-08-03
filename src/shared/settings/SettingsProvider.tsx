import { useEffect, useMemo, type ReactNode } from 'react';

import { SettingsContext } from './settings-context';
import { createSettingsStore, type SettingsStore } from './settings-store';

interface SettingsProviderProps {
    children: ReactNode;
    store?: SettingsStore;
}

export function SettingsProvider({ children, store }: SettingsProviderProps) {
    const settingsStore = useMemo(() => store ?? createSettingsStore(), [store]);

    useEffect(() => {
        return () => {
            if (!store) {
                settingsStore.destroy();
            }
        };
    }, [settingsStore, store]);

    return <SettingsContext.Provider value={settingsStore}>{children}</SettingsContext.Provider>;
}
