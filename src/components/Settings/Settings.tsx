import React from 'react'
import { useSettings } from '../../contexts/SettingsContext'
import './Settings.scss'

const Settings: React.FC = () => {
  const { settings, toggleSettings, toggleOpenLinksInNewTab, setTheme, setFont, setSpacing } = useSettings()

  if (!settings.showSettings) return null

  return (
    <div className="settings-overlay">
      <div className="settings-panel">
        <div className="settings-header">
          <h3>Settings</h3>
          <button onClick={toggleSettings} className="close-btn">×</button>
        </div>
        
        <div className="settings-content">
          <div className="setting-group">
            <label>
              <input
                type="checkbox"
                checked={settings.openLinkInNewTab}
                onChange={toggleOpenLinksInNewTab}
              />
              Open links in new tab
            </label>
          </div>

          <div className="setting-group">
            <label>Theme:</label>
            <select value={settings.theme} onChange={(e) => setTheme(e.target.value)}>
              <option value="default">Default</option>
              <option value="night">Night</option>
            </select>
          </div>

          <div className="setting-group">
            <label>Title font size:</label>
            <select value={settings.titleFontSize} onChange={(e) => setFont(e.target.value)}>
              <option value="14">14px</option>
              <option value="16">16px</option>
              <option value="18">18px</option>
              <option value="20">20px</option>
            </select>
          </div>

          <div className="setting-group">
            <label>List spacing:</label>
            <select value={settings.listSpacing} onChange={(e) => setSpacing(e.target.value)}>
              <option value="0">Compact</option>
              <option value="5">Normal</option>
              <option value="10">Comfortable</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Settings
