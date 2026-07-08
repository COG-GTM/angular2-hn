import { useContext } from 'react';

import { SettingsContext } from '../context/settingsContext';
import type { SettingsContextValue } from '../context/settingsContext';

export function useSettings(): SettingsContextValue {
    const ctx = useContext(SettingsContext);
    if (!ctx) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return ctx;
}
