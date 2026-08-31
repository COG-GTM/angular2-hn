import '../styles/settings.scss';
import { useSettings } from '../contexts/SettingsContext';

export default function Settings() {
    const { settings, toggleSettings, toggleOpenLinksInNewTab, setTheme, setFont, setSpacing } = useSettings();
    return (
        <div id="popup1" className="overlay">
            <div className="popup">
                <h1>Settings</h1><hr />
                <button type="button" className="close" onClick={toggleSettings} aria-label="Close settings">&times;</button>
                <div className="content">
                    <div className="control-section">
                        <h2>Links</h2>
                        <label><input type="checkbox" checked={settings.openLinkInNewTab} onChange={toggleOpenLinksInNewTab} /> Open links in a new tab</label>
                    </div>
                    <div className="theme-controls">
                        <div className="control-section">
                            <h2>Select a theme</h2>
                            {['default', 'night', 'amoledblack'].map((theme) => (
                                <div key={theme}><label><input name="theme" type="radio" value={theme} checked={settings.theme === theme} onChange={() => setTheme(theme)} /> {theme === 'amoledblack' ? 'Black (AMOLED)' : theme[0].toUpperCase() + theme.slice(1)}</label></div>
                            ))}
                        </div>
                        <div className="control-section">
                            <h2>Change Font</h2>
                            <label>Font size: <input min="1" value={settings.titleFontSize} name="titleFontSize" type="number" onChange={(event) => setFont(event.target.value)} /></label>
                            <label>List spacing: <input min="0" value={settings.listSpacing} name="listSpacing" type="number" onChange={(event) => setSpacing(event.target.value)} /></label>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
