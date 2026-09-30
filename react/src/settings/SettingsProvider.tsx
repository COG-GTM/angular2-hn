// OWNER: Session 4 (theme system). Stub: in-memory state only.
// Session 4 adds localStorage persistence + prefers-color-scheme handling like SettingsService.
import { useMemo, useState, type ReactNode } from 'react';
import { SettingsContext } from './SettingsContext';
import { DEFAULT_SETTINGS, type Settings, type SettingsApi } from './types';

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);

  const api = useMemo<SettingsApi>(
    () => ({
      settings,
      toggleSettings: () => setSettings((s) => ({ ...s, showSettings: !s.showSettings })),
      toggleOpenLinksInNewTab: () => setSettings((s) => ({ ...s, openLinkInNewTab: !s.openLinkInNewTab })),
      setTheme: (theme) => setSettings((s) => ({ ...s, theme })),
      setFont: (titleFontSize) => setSettings((s) => ({ ...s, titleFontSize })),
      setSpacing: (listSpacing) => setSettings((s) => ({ ...s, listSpacing })),
    }),
    [settings],
  );

  return <SettingsContext.Provider value={api}>{children}</SettingsContext.Provider>;
}
