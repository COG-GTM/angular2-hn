// Ported from src/app/core/settings
import { useEffect } from 'react';
import { THEMES, useSettings } from '../settings/SettingsContext';
import './Settings.scss';

export function Settings() {
  const { settings, toggleSettings, toggleOpenLinksInNewTab, setTheme, setFont, setSpacing } = useSettings();

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') toggleSettings();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [toggleSettings]);

  return (
    <div id="popup1" className="overlay">
      <div className="popup" role="dialog" aria-modal="true" aria-labelledby="settings-title">
        <h1 id="settings-title">Settings</h1>
        <hr />
        <button type="button" className="close" onClick={toggleSettings} aria-label="Close settings">
          &times;
        </button>
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
              {THEMES.map((theme) => (
                <div key={theme.value}>
                  <label>
                    <input
                      name="theme"
                      type="radio"
                      value={theme.value}
                      checked={settings.theme === theme.value}
                      onChange={() => setTheme(theme.value)}
                    />{' '}
                    {theme.label}
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
                    type="number"
                    value={settings.titleFontSize}
                    onChange={(e) => setFont(e.target.value)}
                  />
                </label>
              </div>
              <div>
                <label>
                  List spacing:
                  <input
                    min="0"
                    type="number"
                    value={settings.listSpacing}
                    onChange={(e) => setSpacing(e.target.value)}
                  />
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
