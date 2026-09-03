import { useSettings } from '../../context/SettingsContext';
import styles from './Settings.module.scss';

const THEMES = [
    { value: 'default', label: 'Default' },
    { value: 'night', label: 'Night' },
    { value: 'amoledblack', label: 'Black (AMOLED)' },
];

export function Settings() {
    const { settings, toggleSettings, toggleOpenLinksInNewTab, setTheme, setFont, setSpacing } = useSettings();

    return (
        <div className={styles.overlay}>
            <div className={`popup ${styles.popup}`}>
                <h1>Settings</h1>
                <hr />
                <span className={styles.close} role="button" tabIndex={0} onClick={toggleSettings}>
                    &times;
                </span>
                <div className={styles.content}>
                    <div className={styles.controlSection}>
                        <h2>Links</h2>
                        <label>
                            <input
                                type="checkbox"
                                checked={settings.openLinkInNewTab}
                                onChange={toggleOpenLinksInNewTab}
                            />
                            Open links in a new tab
                        </label>
                    </div>
                    <div>
                        <div className={styles.controlSection}>
                            <h2>Select a theme</h2>
                            {THEMES.map(theme => (
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
                        <div className={styles.controlSection}>
                            <h2>Change Font</h2>
                            <div>
                                <label>
                                    Font size:
                                    <input
                                        min="1"
                                        type="number"
                                        value={settings.titleFontSize}
                                        onChange={event => setFont(event.target.value)}
                                    />
                                </label>
                            </div>
                            <div>
                                <label>
                                    List spacing:
                                    <input
                                        min="0"
                                        type="number"
                                        value={settings.listSpacing}
                                        onChange={event => setSpacing(event.target.value)}
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
