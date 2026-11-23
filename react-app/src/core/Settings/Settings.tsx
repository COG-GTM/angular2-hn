import { useSettings } from '../../settings/useSettings';
import type { Theme } from '../../settings/settings';
import './Settings.scss';

const THEMES: { value: Theme; label: string }[] = [
  { value: 'default', label: 'Default' },
  { value: 'night', label: 'Night' },
  { value: 'amoledblack', label: 'Black (AMOLED)' },
];

export function Settings() {
  const { theme, openLinkInNewTab, titleFontSize, listSpacing, toggleSettings, toggleOpenLinksInNewTab, setTheme, setFont, setSpacing } =
    useSettings();
  return (
    <div className="hn-settings">
      <div id="popup1" className="overlay">
        <div className="popup">
          <h1>Settings</h1>
          <hr />
          <span className="close" onClick={toggleSettings}>&times;</span>
          <div className="content">
            <div className="control-section">
              <h2>Links</h2>
              <input type="checkbox" checked={openLinkInNewTab} onChange={toggleOpenLinksInNewTab} /> Open links in a new tab
            </div>
            <div className="theme-controls">
              <div className="control-section">
                <h2>Select a theme</h2>
                {THEMES.map(({ value, label }) => (
                  <div key={value}>
                    <label>
                      <input name="theme" type="radio" value={value} checked={theme === value} onChange={() => setTheme(value)} /> {label}
                    </label>
                  </div>
                ))}
              </div>
              <div className="control-section">
                <h2>Change Font</h2>
                <div>
                  <label>
                    Font size:
                    <input min="1" value={titleFontSize} name="theme" type="number" onChange={(e) => setFont(e.target.value)} />
                  </label>
                </div>
                <div>
                  <label>
                    List spacing:
                    <input min="0" value={listSpacing} name="theme" type="number" onChange={(e) => setSpacing(e.target.value)} />
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
