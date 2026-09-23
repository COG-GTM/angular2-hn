import { useContext } from 'react';

import { SettingsContext } from './context';
import type { SettingsContextValue } from './types';

export function useSettings(): SettingsContextValue {
    const value = useContext(SettingsContext);
    if (!value) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return value;
}
