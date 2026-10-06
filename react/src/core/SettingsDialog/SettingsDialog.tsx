import { useSettings } from '../../shared/services/useSettings';
import { THEMES } from '../../shared/services/settings';
import { onActivateKey } from '../../shared/utils/a11y';
import './SettingsDialog.scss';

export function SettingsDialog() {
    const { settings, toggleSettings, toggleOpenLinksInNewTab, setTheme, setFont, setSpacing } = useSettings();

    return (
        <div id="popup1" className="overlay">
            <div className="popup" role="dialog" aria-modal="true" aria-labelledby="settings-title">
                <h1 id="settings-title">Settings</h1>
                <hr />
                <span
                    className="close"
                    role="button"
                    tabIndex={0}
                    aria-label="Close settings"
                    onClick={toggleSettings}
                    onKeyDown={onActivateKey(toggleSettings)}
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
                                onChange={toggleOpenLinksInNewTab}
                            />{' '}
                            Open links in a new tab
                        </label>
                    </div>
                    <div className="theme-controls">
                        <div className="control-section">
                            <h2>Select a theme</h2>
                            {THEMES.map(({ value, label }) => (
                                <div key={value}>
                                    <label>
                                        <input
                                            name="theme"
                                            type="radio"
                                            value={value}
                                            checked={settings.theme === value}
                                            onChange={() => setTheme(value)}
                                        />{' '}
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
                                        name="titleFontSize"
                                        type="number"
                                        min="1"
                                        value={settings.titleFontSize}
                                        onChange={(e) => setFont(e.target.value)}
                                    />
                                </label>
                            </div>
                            <div>
                                <label>
                                    List spacing:
                                    <input
                                        name="listSpacing"
                                        type="number"
                                        min="0"
                                        value={settings.listSpacing}
                                        onChange={(e) => setSpacing(e.target.value)}
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
