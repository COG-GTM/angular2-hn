import { useState, type KeyboardEvent } from 'react';

import { useSettings } from '../shared/hooks';
import './Settings.scss';

const THEME_OPTIONS = [
    { value: 'default', label: 'Default' },
    { value: 'night', label: 'Night' },
    { value: 'amoledblack', label: 'Black (AMOLED)' },
] as const;

export function Settings() {
    const { settings, closeSettings, toggleOpenLinksInNewTab, setTheme, setFont, setSpacing } = useSettings();
    const [titleFontSize, setTitleFontSize] = useState(settings.titleFontSize);
    const [listSpacing, setListSpacing] = useState(settings.listSpacing);

    return (
        <div id="popup1" className="overlay">
            <div className="popup">
                <h1>Settings</h1>
                <hr />
                <span className="close" onClick={closeSettings}>
                    &times;
                </span>
                <div className="content">
                    <div className="control-section">
                        <h2>Links</h2>
                        <input
                            type="checkbox"
                            checked={settings.openLinkInNewTab}
                            onChange={toggleOpenLinksInNewTab}
                        />{' '}
                        Open links in a new tab
                    </div>
                    <div className="theme-controls">
                        <div className="control-section">
                            <h2>Select a theme</h2>
                            {THEME_OPTIONS.map(({ value, label }) => (
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
                                        min="1"
                                        value={titleFontSize}
                                        name="theme"
                                        type="number"
                                        onChange={(e) => setTitleFontSize(e.target.value)}
                                        onKeyUp={(e: KeyboardEvent<HTMLInputElement>) => setFont(e.currentTarget.value)}
                                    />
                                </label>
                            </div>
                            <div>
                                <label>
                                    List spacing:
                                    <input
                                        min="0"
                                        value={listSpacing}
                                        name="theme"
                                        type="number"
                                        onChange={(e) => setListSpacing(e.target.value)}
                                        onKeyUp={(e: KeyboardEvent<HTMLInputElement>) =>
                                            setSpacing(e.currentTarget.value)
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
