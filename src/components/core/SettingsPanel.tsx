import { useSettings } from '../../context/SettingsContext';
import './SettingsPanel.scss';

const THEMES: Array<{ value: string; label: string }> = [
    { value: 'default', label: 'Default' },
    { value: 'night', label: 'Night' },
    { value: 'amoledblack', label: 'Black (AMOLED)' },
];

export function SettingsPanel() {
    const { settings, toggleSettings, toggleOpenLinksInNewTab, setTheme, setFont, setSpacing } = useSettings();

    return (
        <div id="popup1" className="overlay">
            <div className="popup">
                <h1>Settings</h1>
                <hr />
                <span className="close" onClick={toggleSettings}>
                    &times;
                </span>
                <div className="content">
                    <div className="control-section">
                        <h2>Links</h2>
                        <input type="checkbox" checked={settings.openLinkInNewTab} onChange={toggleOpenLinksInNewTab} />
                        Open links in a new tab
                    </div>
                    <div className="theme-controls">
                        <div className="control-section">
                            <h2>Select a theme</h2>
                            {THEMES.map((theme) => (
                                <div key={theme.value}>
                                    <label>
                                        <input
                                            name="theme"
                                            type="radio"
                                            value={theme.value}
                                            checked={settings.theme === theme.value}
                                            onChange={() => setTheme(theme.value)}
                                        />
                                        {theme.label}
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
                                        name="titleFontSize"
                                        type="number"
                                        value={settings.titleFontSize}
                                        onChange={(event) => setFont(event.target.value)}
                                    />
                                </label>
                            </div>
                            <div>
                                <label>
                                    List spacing:
                                    <input
                                        min="0"
                                        name="listSpacing"
                                        type="number"
                                        value={settings.listSpacing}
                                        onChange={(event) => setSpacing(event.target.value)}
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
