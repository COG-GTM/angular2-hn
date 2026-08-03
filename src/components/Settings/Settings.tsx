import { useSettings } from '../../context/settingsContext';
import './Settings.scss';

const THEMES = [
    { value: 'default', label: 'Default' },
    { value: 'night', label: 'Night' },
    { value: 'amoledblack', label: 'Black (AMOLED)' },
];

export function Settings() {
    const { settings, toggleSettings, toggleOpenLinksInNewTab, setTheme, setFont, setSpacing } = useSettings();

    return (
        <div id="popup1" className="overlay">
            <div className="popup">
                <h1>Settings</h1>
                <hr />
                <span className="close" onClick={toggleSettings} role="button" aria-label="Close settings">
                    &times;
                </span>
                <div className="content">
                    <div className="control-section">
                        <h2>Links</h2>
                        <input
                            type="checkbox"
                            checked={settings.openLinkInNewTab}
                            onChange={toggleOpenLinksInNewTab}
                            aria-label="Open links in a new tab"
                        />
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
                                        value={settings.titleFontSize}
                                        name="titleFontSize"
                                        type="number"
                                        onChange={(event) => setFont(event.target.value)}
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
