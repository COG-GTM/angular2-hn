import { useSettings } from '../../context/SettingsContext';
import './Settings.scss';

const themeOptions = [
  { value: 'default', label: 'Default' },
  { value: 'night', label: 'Night' },
  { value: 'amoledblack', label: 'Black (AMOLED)' },
] as const;

export default function Settings() {
  const {
    settings,
    toggleSettings,
    toggleOpenLinksInNewTab,
    setTheme,
    setFont,
    setSpacing,
  } = useSettings();

  return (
    <div id="popup1" className="overlay">
      <div className="popup">
        <h1>Settings</h1>
        <hr />
        <span className="close" onClick={() => toggleSettings()}>
          &times;
        </span>
        <div className="content">
          <div className="control-section">
            <h2>Links</h2>
            <input
              type="checkbox"
              checked={settings.openLinkInNewTab}
              onChange={() => toggleOpenLinksInNewTab()}
            />{' '}
            Open links in a new tab
          </div>
          <div className="theme-controls">
            <div className="control-section">
              <h2>Select a theme</h2>
              {themeOptions.map(({ value, label }) => (
                <div key={value}>
                  <label>
                    <input
                      name="theme"
                      type="radio"
                      value={value}
                      checked={settings.theme === value}
                      onClick={() => setTheme(value)}
                      onChange={() => setTheme(value)}
                    />{' '}
                    {label}
                  </label>
                </div>
              ))}
            </div>
            <div className="control-section">
              <h2>Change Font</h2>
              <div>
                <label>
                  Font size:{' '}
                  <input
                    min="1"
                    value={settings.titleFontSize}
                    name="theme"
                    type="number"
                    onChange={(e) => setFont(e.target.value)}
                  />
                </label>
              </div>
              <div>
                <label>
                  List spacing:{' '}
                  <input
                    min="0"
                    value={settings.listSpacing}
                    name="theme"
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
