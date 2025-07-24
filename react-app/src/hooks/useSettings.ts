import { useEffect, useState } from 'react';
import { settingsService } from '../services/SettingsService';
import { Settings } from '../models/Settings';

export const useSettings = () => {
  const [settings, setSettings] = useState<Settings>(settingsService.currentSettings);

  useEffect(() => {
    const subscription = settingsService.settings$.subscribe(setSettings);
    return () => subscription.unsubscribe();
  }, []);

  return {
    settings,
    toggleSettings: () => settingsService.toggleSettings(),
    toggleOpenLinksInNewTab: () => settingsService.toggleOpenLinksInNewTab(),
    setTheme: (theme: string) => settingsService.setTheme(theme),
    setFont: (fontSize: string) => settingsService.setFont(fontSize),
    setSpacing: (listSpace: string) => settingsService.setSpacing(listSpace),
  };
};
