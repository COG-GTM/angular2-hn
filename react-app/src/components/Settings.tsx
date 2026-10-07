import { useSettings } from '../hooks/useSettings'
import './Settings.scss'

export default function Settings() {
  const settings = useSettings()

  return (
    <div className="app-settings">
      <div id="popup1" className="overlay">
        <div className="popup">
          <h1>Settings</h1>
          <hr />
          <span className="close" onClick={settings.toggleSettings}>&times;</span>
          <div className="content">
            <div className="control-section">
              <h2>Links</h2>
              <label>
                <input
                  type="checkbox"
                  checked={settings.openLinkInNewTab}
                  onChange={settings.toggleOpenLinksInNewTab}
                />
                {' '}
                Open links in a new tab
              </label>
            </div>
            <div className="theme-controls">
              <div className="control-section">
                <h2>Select a theme</h2>
                {[
                  ['default', 'Default'],
                  ['night', 'Night'],
                  ['amoledblack', 'Black (AMOLED)'],
                ].map(([theme, label]) => (
                  <div key={theme}>
                    <label>
                      <input
                        name="theme"
                        type="radio"
                        value={theme}
                        checked={settings.theme === theme}
                        onChange={() => settings.setTheme(theme)}
                      />
                      {' '}
                      {label}
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
                      onChange={(event) => settings.setFont(event.target.value)}
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
                      onChange={(event) => settings.setSpacing(event.target.value)}
                    />
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
