import React, { useCallback, ChangeEvent } from 'react';
import { useSettings } from '../../../contexts/SettingsContext';
import { Settings as SettingsType } from '../../../types';
import './Settings.css';

export const Settings: React.FC = () => {
  const { settings, toggleSettings, toggleOpenLinksInNewTab, setTheme, setFont, setSpacing } =
    useSettings();

  const handleClose = useCallback(() => {
    toggleSettings();
  }, [toggleSettings]);

  const handleOpenLinksChange = useCallback(() => {
    toggleOpenLinksInNewTab();
  }, [toggleOpenLinksInNewTab]);

  const handleThemeChange = useCallback(
    (theme: SettingsType['theme']) => {
      setTheme(theme);
    },
    [setTheme]
  );

  const handleFontChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      setFont(e.target.value);
    },
    [setFont]
  );

  const handleSpacingChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      setSpacing(e.target.value);
    },
    [setSpacing]
  );

  return (
    <div id="popup1" className="overlay">
      <div className="popup">
        <h1>Settings</h1>
        <hr />
        <span className="close" onClick={handleClose}>
          &times;
        </span>
        <div className="content">
          <div className="control-section">
            <h2>Links</h2>
            <label>
              <input
                type="checkbox"
                checked={settings.openLinkInNewTab}
                onChange={handleOpenLinksChange}
              />
              Open links in a new tab
            </label>
          </div>
          <div className="theme-controls">
            <div className="control-section">
              <h2>Select a theme</h2>
              <div>
                <label>
                  <input
                    name="theme"
                    type="radio"
                    value="default"
                    checked={settings.theme === 'default'}
                    onChange={() => handleThemeChange('default')}
                  />
                  Default
                </label>
              </div>
              <div>
                <label>
                  <input
                    name="theme"
                    type="radio"
                    value="night"
                    checked={settings.theme === 'night'}
                    onChange={() => handleThemeChange('night')}
                  />
                  Night
                </label>
              </div>
              <div>
                <label>
                  <input
                    name="theme"
                    type="radio"
                    value="amoledblack"
                    checked={settings.theme === 'amoledblack'}
                    onChange={() => handleThemeChange('amoledblack')}
                  />
                  Black (AMOLED)
                </label>
              </div>
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
                    onChange={handleFontChange}
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
                    onChange={handleSpacingChange}
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
