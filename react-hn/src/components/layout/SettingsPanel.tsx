import { useSettings } from '../../context/useSettings';
import type { Theme } from '../../models/types';
import '../../styles/Settings.scss';

export function SettingsPanel() {
  const { settings, toggleSettings, toggleOpenLinksInNewTab, setTheme, setFont, setSpacing } = useSettings();

  return (
    <div id="popup1" className="overlay">
      <div className="popup">
        <h1>Settings</h1>
        <hr />
        <span className="close" onClick={toggleSettings}>&times;</span>
        <div className="content">
          <div className="control-section">
            <h2>Links</h2>
            <label>
              <input
                type="checkbox"
                checked={settings.openLinkInNewTab}
                onChange={toggleOpenLinksInNewTab}
              />
              {' '}Open links in a new tab
            </label>
          </div>
          <div className="theme-controls">
            <div className="control-section">
              <h2>Select a theme</h2>
              {(['default', 'night', 'amoledblack'] as Theme[]).map(theme => (
                <div key={theme}>
                  <label>
                    <input
                      name="theme"
                      type="radio"
                      value={theme}
                      checked={settings.theme === theme}
                      onChange={() => setTheme(theme)}
                    />
                    {' '}{theme === 'amoledblack' ? 'Black (AMOLED)' : theme.charAt(0).toUpperCase() + theme.slice(1)}
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
                    name="titleFont"
                    type="number"
                    onChange={(e) => setFont(e.target.value)}
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
