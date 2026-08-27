import { useSettings } from '../context/SettingsContext';
import type { Theme } from '../types/models';

export function SettingsPanel() {
  const { settings, toggleSettings, toggleOpenLinksInNewTab, setTheme, setFont, setSpacing } = useSettings();
  const themes: Array<{ value: Theme; label: string }> = [
    { value: 'default', label: 'Default' },
    { value: 'night', label: 'Night' },
    { value: 'amoledblack', label: 'Black (AMOLED)' }
  ];
  return (
    <div id="popup1" className="overlay">
      <div className="popup">
        <h1>Settings</h1><hr /><button className="close" onClick={toggleSettings} aria-label="Close settings">&times;</button>
        <div className="content">
          <div className="control-section"><h2>Links</h2>
            <label><input type="checkbox" checked={settings.openLinkInNewTab} onChange={toggleOpenLinksInNewTab} /> Open links in a new tab</label>
          </div>
          <div className="theme-controls">
            <div className="control-section"><h2>Select a theme</h2>
              {themes.map((theme) => <div key={theme.value}><label><input name="theme" type="radio" value={theme.value} checked={settings.theme === theme.value} onChange={() => setTheme(theme.value)} /> {theme.label}</label></div>)}
            </div>
            <div className="control-section"><h2>Change Font</h2>
              <label>Font size: <input min="1" value={settings.titleFontSize} name="titleFont" type="number" onChange={(event) => setFont(event.target.value)} onKeyUp={(event) => setFont(event.currentTarget.value)} /></label>
              <label>List spacing: <input min="0" value={settings.listSpacing} name="listSpacing" type="number" onChange={(event) => setSpacing(event.target.value)} onKeyUp={(event) => setSpacing(event.currentTarget.value)} /></label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
