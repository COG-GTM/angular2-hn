import React from 'react';
import { useSettings } from '../contexts/SettingsContext';

const SettingsDemo: React.FC = () => {
  const { 
    settings, 
    toggleSettings, 
    toggleOpenLinksInNewTab, 
    setTheme, 
    setFont, 
    setSpacing 
  } = useSettings();

  const themes = ['default', 'night', 'amoled'];
  const fontSizes = ['14', '16', '18', '20', '22'];
  const spacings = ['0', '5', '10', '15', '20'];

  return (
    <div className="settings-demo" data-theme={settings.theme}>
      <h2>Settings Demo</h2>
      
      <div className="settings-panel">
        <div className="setting-group">
          <h3>Settings Panel</h3>
          <button onClick={toggleSettings}>
            {settings.showSettings ? 'Hide Settings' : 'Show Settings'}
          </button>
          <p>Settings panel is: {settings.showSettings ? 'visible' : 'hidden'}</p>
        </div>

        <div className="setting-group">
          <h3>Link Behavior</h3>
          <label>
            <input 
              type="checkbox" 
              checked={settings.openLinkInNewTab}
              onChange={toggleOpenLinksInNewTab}
            />
            Open links in new tab
          </label>
          <p>Current setting: {settings.openLinkInNewTab ? 'New tab' : 'Same tab'}</p>
        </div>

        <div className="setting-group">
          <h3>Theme</h3>
          <div>
            {themes.map(theme => (
              <label key={theme}>
                <input 
                  type="radio" 
                  name="theme"
                  value={theme}
                  checked={settings.theme === theme}
                  onChange={(e) => setTheme(e.target.value)}
                />
                {theme}
              </label>
            ))}
          </div>
          <p>Current theme: {settings.theme}</p>
        </div>

        <div className="setting-group">
          <h3>Font Size</h3>
          <select value={settings.titleFontSize} onChange={(e) => setFont(e.target.value)}>
            {fontSizes.map(size => (
              <option key={size} value={size}>{size}px</option>
            ))}
          </select>
          <p>Current font size: {settings.titleFontSize}px</p>
        </div>

        <div className="setting-group">
          <h3>List Spacing</h3>
          <select value={settings.listSpacing} onChange={(e) => setSpacing(e.target.value)}>
            {spacings.map(spacing => (
              <option key={spacing} value={spacing}>{spacing}px</option>
            ))}
          </select>
          <p>Current spacing: {settings.listSpacing}px</p>
        </div>
      </div>

      <div className="settings-preview">
        <h3>Settings Preview</h3>
        <div 
          className="preview-content"
          style={{
            fontSize: `${settings.titleFontSize}px`,
            padding: `${settings.listSpacing}px`,
            backgroundColor: settings.theme === 'night' ? '#1a1a1a' : settings.theme === 'amoled' ? '#000' : '#fff',
            color: settings.theme === 'night' || settings.theme === 'amoled' ? '#fff' : '#000'
          }}
        >
          <p>This text demonstrates the current font size and theme.</p>
          <p>The padding around this content shows the list spacing setting.</p>
          <a 
            href="#" 
            target={settings.openLinkInNewTab ? '_blank' : '_self'}
            onClick={(e) => e.preventDefault()}
          >
            This link would open in {settings.openLinkInNewTab ? 'a new tab' : 'the same tab'}
          </a>
        </div>
      </div>

      <div className="localStorage-info">
        <h3>LocalStorage Values</h3>
        <pre>
          {JSON.stringify({
            theme: localStorage.getItem('theme'),
            titleFontSize: localStorage.getItem('titleFontSize'),
            listSpacing: localStorage.getItem('listSpacing'),
            openLinkInNewTab: localStorage.getItem('openLinkInNewTab')
          }, null, 2)}
        </pre>
      </div>
    </div>
  );
};

export default SettingsDemo;
