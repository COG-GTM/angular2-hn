import { useSettings } from '../../settings';
import './Settings.scss';

export function Settings() {
  const { settings, toggleSettings, toggleOpenLinksInNewTab, setTheme, setFont, setSpacing } = useSettings();
  return <div id="popup1" className="overlay" role="dialog" aria-modal="true" aria-labelledby="settings-title">
    <div className="popup">
      <h1 id="settings-title">Settings</h1><hr />
      <span className="close" role="button" tabIndex={0} aria-label="Close settings" onClick={toggleSettings}
        onKeyDown={event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); toggleSettings(); } }}>×</span>
      <div className="content">
        <div className="control-section"><h2>Links</h2>
          <label><input type="checkbox" checked={settings.openLinkInNewTab} onChange={toggleOpenLinksInNewTab} /> Open links in a new tab</label>
        </div>
        <div className="theme-controls">
          <div className="control-section"><h2>Select a theme</h2>
            {([['default', 'Default'], ['night', 'Night'], ['amoled', 'Black (AMOLED)']] as const).map(([theme, label]) =>
              <div key={theme}><label><input name="theme" type="radio" value={theme} checked={settings.theme === theme} onChange={() => setTheme(theme)} /> {label}</label></div>)}
          </div>
          <div className="control-section"><h2>Change Font</h2>
            <div><label>Font size:<input min="1" value={settings.titleFontSize} type="number" onChange={event => setFont(event.target.value)} /></label></div>
            <div><label>List spacing:<input min="0" value={settings.listSpacing} type="number" onChange={event => setSpacing(event.target.value)} /></label></div>
          </div>
        </div>
      </div>
    </div>
  </div>;
}
