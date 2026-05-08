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
            <h2>Theme</h2>
            <label>
              <input
                type="radio"
                name="theme"
                checked={settings.theme === 'default'}
                onChange={() => setTheme('default')}
              />
              {' '}Default
            </label>
            <br />
            <label>
              <input
                type="radio"
                name="theme"
                checked={settings.theme === 'night'}
                onChange={() => setTheme('night')}
              />
              {' '}Night
            </label>
            <br />
            <label>
              <input
                type="radio"
                name="theme"
                checked={settings.theme === 'amoledblack'}
                onChange={() => setTheme('amoledblack')}
              />
              {' '}Black (AMOLED)
            </label>
          </div>
          <div className="control-section">
            <h2>Title Font Size</h2>
            <input
              type="number"
              value={settings.titleFontSize}
              onChange={(e) => setFont(e.target.value)}
            />
          </div>
          <div className="control-section">
            <h2>List Spacing</h2>
            <input
              type="number"
              value={settings.listSpacing}
              onChange={(e) => setSpacing(e.target.value)}
            />
          </div>
          <div>
            <label>
              <input
                type="checkbox"
                checked={settings.openLinkInNewTab}
                onChange={toggleOpenLinksInNewTab}
              />
              {' '}Open Links in New Tab
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
