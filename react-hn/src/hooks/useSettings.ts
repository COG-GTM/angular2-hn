import { useContext } from 'react';
import { SettingsContext, type SettingsContextValue } from '../contexts/settingsContextDef';

export function useSettings(): SettingsContextValue {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
