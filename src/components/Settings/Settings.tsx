import React from 'react';
import { useSettings } from './useSettings';
import './Settings.css';

const Settings: React.FC = () => {
  const {
    settings,
    toggleSettings,
    toggleOpenLinksInNewTab,
    selectTheme,
    changeTitleFont,
    changeSpacing,
  } = useSettings();

  if (!settings.showSettings) return null;

  return (
    <div className="settings-overlay">
      <div className="settings-popup">
        <h1>Settings</h1>
        <hr />
        <span className="settings-close" onClick={toggleSettings}>
          &times;
        </span>
        <div className="settings-content">
          <div className="control-section">
            <h2>Links</h2>
            <label>
              <input
                type="checkbox"
                checked={settings.openLinkInNewTab}
                onChange={toggleOpenLinksInNewTab}
              />
              Open links in a new tab
            </label>
          </div>

          <div className="theme-controls">
            <div className="control-section">
              <h2>Select a theme</h2>
              {['default', 'night', 'amoledblack'].map((theme) => (
                <div key={theme}>
                  <label>
                    <input
                      name="theme"
                      type="radio"
                      value={theme}
                      checked={settings.theme === theme}
                      onChange={() => selectTheme(theme)}
                    />
                    {theme === 'amoledblack'
                      ? 'Black (AMOLED)'
                      : theme.charAt(0).toUpperCase() + theme.slice(1)}
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
                    type="number"
                    min={1}
                    value={settings.titleFontSize}
                    onChange={(e) => changeTitleFont(e.target.value)}
                  />
                </label>
              </div>
              <div>
                <label>
                  List spacing:
                  <input
                    type="number"
                    min={0}
                    value={settings.listSpacing}
                    onChange={(e) => changeSpacing(e.target.value)}
                  />
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
