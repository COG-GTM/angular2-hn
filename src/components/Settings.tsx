import React from 'react';
import { useSettingsStore } from '../stores/settings';

export const Settings: React.FC = () => {
  const {
    showSettings,
    openLinkInNewTab,
    theme,
    titleFontSize,
    listSpacing,
    toggleSettings,
    toggleOpenLinksInNewTab,
    setTheme,
    setFont,
    setSpacing
  } = useSettingsStore();

  if (!showSettings) return null;

  return (
    <div className="settings-overlay">
      <div className="settings-panel">
        <div className="settings-header">
          <h2>Settings</h2>
          <button className="close-button" onClick={toggleSettings}>
            ×
          </button>
        </div>
        
        <div className="settings-content">
          <div className="setting-group">
            <label>
              <input
                type="checkbox"
                checked={openLinkInNewTab}
                onChange={toggleOpenLinksInNewTab}
              />
              Open links in new tab
            </label>
          </div>

          <div className="setting-group">
            <label>Theme:</label>
            <select value={theme} onChange={(e) => setTheme(e.target.value as any)}>
              <option value="default">Default</option>
              <option value="night">Night</option>
              <option value="black">Black (AMOLED)</option>
            </select>
          </div>

          <div className="setting-group">
            <label>Title Font Size:</label>
            <select value={titleFontSize} onChange={(e) => setFont(e.target.value)}>
              <option value="14">Small</option>
              <option value="16">Medium</option>
              <option value="18">Large</option>
              <option value="20">Extra Large</option>
            </select>
          </div>

          <div className="setting-group">
            <label>List Spacing:</label>
            <select value={listSpacing} onChange={(e) => setSpacing(e.target.value)}>
              <option value="0">Compact</option>
              <option value="5">Normal</option>
              <option value="10">Comfortable</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};
