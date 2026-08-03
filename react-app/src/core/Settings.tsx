import { useSettings, useSettingsStore } from '../shared/settings/useSettings';
import './Settings.scss';

const themes = [
    { value: 'default', label: 'Default' },
    { value: 'night', label: 'Night' },
    { value: 'amoledblack', label: 'Black (AMOLED)' },
];

export default function Settings() {
    const settings = useSettings();
    const store = useSettingsStore();

    return (
        <div id="popup1" className="overlay">
            <div className="popup">
                <h1>Settings</h1>
                <hr />
                <span
                    className="close"
                    role="button"
                    aria-label="Close settings"
                    onClick={() => store.toggleSettings()}
                >
                    &times;
                </span>
                <div className="content">
                    <div className="control-section">
                        <h2>Links</h2>
                        <label>
                            <input
                                type="checkbox"
                                checked={settings.openLinkInNewTab}
                                onChange={() => store.toggleOpenLinksInNewTab()}
                            />
                            Open links in a new tab
                        </label>
                    </div>
                    <div className="theme-controls">
                        <div className="control-section">
                            <h2>Select a theme</h2>
                            {themes.map(({ value, label }) => (
                                <div key={value}>
                                    <label>
                                        <input
                                            name="theme"
                                            type="radio"
                                            value={value}
                                            checked={settings.theme === value}
                                            onChange={() => store.setTheme(value)}
                                        />
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
                                        name="titleFontSize"
                                        type="number"
                                        value={settings.titleFontSize}
                                        onChange={(event) => store.setFont(event.target.value)}
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
                                        onChange={(event) => store.setSpacing(event.target.value)}
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
