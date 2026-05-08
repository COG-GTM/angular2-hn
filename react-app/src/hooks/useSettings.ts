import { useContext } from 'react';
import { SettingsContext, SettingsContextType } from '../contexts/settingsContextDef';

export function useSettings(): SettingsContextType {
  const ctx = useContext(SettingsContext);
  if (!ctx) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return ctx;
}
