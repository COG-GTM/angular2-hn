import type { Theme } from '../../shared/models/settings';
import { useSettings } from '../../shared/settings/settingsContext';
import './Settings.scss';

const THEME_OPTIONS: { value: Theme; label: string }[] = [
  { value: 'default', label: 'Default' },
  { value: 'night', label: 'Night' },
  { value: 'amoledblack', label: 'Black (AMOLED)' },
];

export function Settings() {
  const { settings, toggleSettings, toggleOpenLinksInNewTab, setTheme, setFont, setSpacing } = useSettings();

  return (
    <div className="settings-component">
      <div id="popup1" className="overlay">
        <div className="popup" role="dialog" aria-label="Settings">
          <h1>Settings</h1>
          <hr />
          <span className="close" aria-label="Close settings" onClick={toggleSettings}>
            &times;
          </span>
          <div className="content">
            <div className="control-section">
              <h2>Links</h2>
              <label>
                <input type="checkbox" checked={settings.openLinkInNewTab} onChange={toggleOpenLinksInNewTab} /> Open
                links in a new tab
              </label>
            </div>
            <div className="theme-controls">
              <div className="control-section">
                <h2>Select a theme</h2>
                {THEME_OPTIONS.map((option) => (
                  <div key={option.value}>
                    <label>
                      <input
                        name="theme"
                        type="radio"
                        value={option.value}
                        checked={settings.theme === option.value}
                        onChange={() => setTheme(option.value)}
                      />{' '}
                      {option.label}
                    </label>
                  </div>
                ))}
              </div>
              <div className="control-section">
                <h2>Change Font</h2>
                <div>
                  <label>
                    Font size:
                    <input
                      min="1"
                      value={settings.titleFontSize}
                      name="titleFontSize"
                      type="number"
                      onChange={(event) => setFont(event.target.value)}
                    />
                  </label>
                </div>
                <div>
                  <label>
                    List spacing:
                    <input
                      min="0"
                      value={settings.listSpacing}
                      name="listSpacing"
                      type="number"
                      onChange={(event) => setSpacing(event.target.value)}
                    />
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
