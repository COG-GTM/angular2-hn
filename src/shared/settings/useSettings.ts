import { useContext, useSyncExternalStore } from 'react';

import type { Settings } from '../models/settings';
import { SettingsContext } from './settings-context';
import type { SettingsStore } from './settings-store';

export function useSettingsStore(): SettingsStore {
    const store = useContext(SettingsContext);
    if (!store) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return store;
}

export function useSettings(): Settings {
    const store = useSettingsStore();
    return useSyncExternalStore(store.subscribe, store.getSettings, store.getSettings);
}
