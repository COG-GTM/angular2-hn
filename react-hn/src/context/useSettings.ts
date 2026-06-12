import { useContext } from 'react';
import { SettingsContext } from './settingsContextDef';
import type { SettingsContextValue } from './settingsContextDef';

export type { SettingsContextValue };

export function useSettings(): SettingsContextValue {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used within a SettingsProvider');
  return ctx;
}
