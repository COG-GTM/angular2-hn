import { useEffect } from 'react';
import { THEMES, useSettings, type Theme } from '../../context';
import { FEED_NAMES, isFeedName } from '../../models';
import './Settings.scss';

const THEME_LABELS: Record<Theme, string> = {
    default: 'Default',
    night: 'Night',
    amoledblack: 'Black (AMOLED)',
};

export function Settings() {
    const { settings, toggleSettings, toggleOpenLinksInNewTab, setTheme, setFont, setSpacing, setDefaultFeed } =
        useSettings();

    useEffect(() => {
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                toggleSettings();
            }
        };
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [toggleSettings]);

    return (
        <div className="overlay">
            <div className="popup" role="dialog" aria-modal="true" aria-labelledby="settings-title">
                <h1 id="settings-title">Settings</h1>
                <button type="button" className="close" onClick={toggleSettings} aria-label="Close settings">
                    &times;
                </button>
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
                            {THEMES.map((theme) => (
                                <div key={theme}>
                                    <label>
                                        <input
                                            name="theme"
                                            type="radio"
                                            value={theme}
                                            checked={settings.theme === theme}
                                            onChange={() => setTheme(theme)}
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
                        <div className="control-section">
                            <h2>Default feed</h2>
                            <label>
                                Open on:{' '}
                                <select
                                    name="defaultFeed"
                                    value={settings.defaultFeed}
                                    onChange={(event) => {
                                        if (isFeedName(event.target.value)) {
                                            setDefaultFeed(event.target.value);
                                        }
                                    }}
                                >
                                    {FEED_NAMES.map((feed) => (
                                        <option key={feed} value={feed}>
                                            {feed}
                                        </option>
                                    ))}
                                </select>
                            </label>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
