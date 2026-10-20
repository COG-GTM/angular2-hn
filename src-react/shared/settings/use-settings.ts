import { useContext } from 'react';

import { SettingsContext, type SettingsContextValue } from './settings-context';

/** Settings state + actions. Must be used inside `<SettingsProvider>`. Signature is frozen. */
export function useSettings(): SettingsContextValue {
    const value = useContext(SettingsContext);
    if (!value) throw new Error('useSettings must be used within a <SettingsProvider>');
    return value;
}
