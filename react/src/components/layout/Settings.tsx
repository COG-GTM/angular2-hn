import { useSettings } from '../../context/SettingsContext';

export function Settings() {
  const { settings } = useSettings();
  return settings.showSettings ? <div className="settings" /> : null;
}

export default Settings;
