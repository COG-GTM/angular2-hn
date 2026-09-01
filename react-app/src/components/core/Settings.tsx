import type { ChangeEvent } from 'react';

import { useSettings } from '../../context/SettingsContext';
import type { Theme } from '../../models/settings';
import styles from './Settings.module.scss';

const THEMES: { value: Theme; label: string }[] = [
    { value: 'default', label: 'Default' },
    { value: 'night', label: 'Night' },
    { value: 'amoledblack', label: 'Black (AMOLED)' },
];

export default function Settings() {
    const { settings, toggleSettings, toggleOpenLinksInNewTab, setTheme, setFont, setSpacing } = useSettings();

    return (
        <div id="popup1" className={styles.overlay}>
            <div className="popup">
                <h1>Settings</h1>
                <hr />
                <button type="button" className={styles.close} onClick={toggleSettings} aria-label="Close settings">
                    &times;
                </button>
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
                            {THEMES.map(({ value, label }) => (
                                <div key={value}>
                                    <label>
                                        <input
                                            name="theme"
                                            type="radio"
                                            value={value}
                                            checked={settings.theme === value}
                                            onChange={() => setTheme(value)}
                                        />
                                        {label}
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
                                        value={settings.titleFontSize}
                                        name="titleFontSize"
                                        type="number"
                                        onChange={(event: ChangeEvent<HTMLInputElement>) =>
                                            setFont(event.target.value)
                                        }
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
                                        onChange={(event: ChangeEvent<HTMLInputElement>) =>
                                            setSpacing(event.target.value)
                                        }
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
