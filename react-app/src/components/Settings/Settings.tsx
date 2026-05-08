import { useSettings } from '../../contexts/SettingsContext';
import './Settings.scss';

export function Settings() {
  const { settings, toggleSettings, toggleOpenLinksInNewTab, setTheme, setFont, setSpacing } = useSettings();

  return (
    <div className="overlay" onClick={toggleSettings}>
      <div className="popup" onClick={(e) => e.stopPropagation()}>
        <span className="close" onClick={toggleSettings}>&times;</span>
        <h1>Settings</h1>
        <hr />
        <div className="content">
          <div className="control-section">
            <h2>Links</h2>
            <input
              type="checkbox"
              checked={settings.openLinkInNewTab}
              onChange={toggleOpenLinksInNewTab}
            />
            {' '}Open links in a new tab
          </div>
          <div className="theme-controls">
            <div className="control-section">
              <h2>Select a theme</h2>
              <div>
                <label>
                  <input
                    type="radio"
                    name="theme"
                    value="default"
                    checked={settings.theme === 'default'}
                    onChange={() => setTheme('default')}
                  />
                  {' '}Default
                </label>
              </div>
              <div>
                <label>
                  <input
                    type="radio"
                    name="theme"
                    value="night"
                    checked={settings.theme === 'night'}
                    onChange={() => setTheme('night')}
                  />
                  {' '}Night
                </label>
              </div>
              <div>
                <label>
                  <input
                    type="radio"
                    name="theme"
                    value="amoledblack"
                    checked={settings.theme === 'amoledblack'}
                    onChange={() => setTheme('amoledblack')}
                  />
                  {' '}Black (AMOLED)
                </label>
              </div>
            </div>
            <div className="control-section">
              <h2>Change Font</h2>
              <div>
                <label>
                  Font size:
                  <input
                    type="number"
                    min="1"
                    value={settings.titleFontSize}
                    onChange={(e) => setFont(e.target.value)}
                  />
                </label>
              </div>
              <div>
                <label>
                  List spacing:
                  <input
                    type="number"
                    min="0"
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
