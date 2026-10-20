import type { ChangeEvent } from 'react';

import { THEMES, type Theme } from '../shared/models';
import { useSettingsStore } from '../shared/store/settings';
import './Settings.scss';

const THEME_LABELS: Record<Theme, string> = {
    default: 'Default',
    night: 'Night',
    amoledblack: 'Black (AMOLED)',
};

export function Settings() {
    const settings = useSettingsStore();

    const onFontChange = (event: ChangeEvent<HTMLInputElement>) => settings.setFont(event.target.value);
    const onSpacingChange = (event: ChangeEvent<HTMLInputElement>) => settings.setSpacing(event.target.value);

    return (
        <div className="app-settings">
            <div id="popup1" className="overlay">
                <div className="popup">
                    <h1>Settings</h1>
                    <hr />
                    <span className="close" role="button" aria-label="Close settings" onClick={settings.toggleSettings}>
                        &times;
                    </span>
                    <div className="content">
                        <div className="control-section">
                            <h2>Links</h2>
                            <label>
                                <input
                                    type="checkbox"
                                    checked={settings.openLinkInNewTab}
                                    onChange={settings.toggleOpenLinksInNewTab}
                                />{' '}
                                Open links in a new tab
                            </label>
                        </div>
                        <div className="theme-controls">
                            <div className="control-section">
                                <h2>Select a theme</h2>
                                {THEMES.map((theme) => (
                                    <div key={theme}>
                                        <label>
                                            <input
                                                name="theme"
                                                type="radio"
                                                value={theme}
                                                checked={settings.theme === theme}
                                                onChange={() => settings.setTheme(theme)}
                                            />{' '}
                                            {THEME_LABELS[theme]}
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
                                            onChange={onFontChange}
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
                                            onChange={onSpacingChange}
                                        />
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
