import { useContext } from 'react';
import { SettingsContext } from '../context/settingsContextValue';
import type { SettingsContextValue } from '../context/settingsContextValue';

export function useSettings(): SettingsContextValue {
  const ctx = useContext(SettingsContext);
  if (!ctx) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return ctx;
}
