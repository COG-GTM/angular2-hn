import React from 'react';
import { useSettings } from '../../../hooks/useSettings';
import './Settings.css';

export const Settings: React.FC = () => {
    const { settings, toggleSettings, setTheme, setFont, setSpacing, setOpenLinkInNewTab } = useSettings();

    if (!settings.showSettings) return null;

    return (
        <div className="settings-overlay" onClick={toggleSettings}>
            <div className="settings-popup" onClick={(e) => e.stopPropagation()}>
                <h1>Settings</h1>
                <hr />
                <button className="close-button" onClick={toggleSettings}>
                    &times;
                </button>
                <div className="settings-content">
                    <div className="control-section">
                        <h2>Links</h2>
                        <label className="checkbox-label">
                            <input
                                type="checkbox"
                                checked={settings.openLinkInNewTab}
                                onChange={(e) => setOpenLinkInNewTab(e.target.checked)}
                            />
                            Open links in a new tab
                        </label>
                    </div>

                    <div className="control-section">
                        <h2>Select a theme</h2>
                        <div className="radio-group">
                            <label>
                                <input
                                    type="radio"
                                    name="theme"
                                    value="default"
                                    checked={settings.theme === 'default'}
                                    onChange={() => setTheme('default')}
                                />
                                Default
                            </label>
                            <label>
                                <input
                                    type="radio"
                                    name="theme"
                                    value="night"
                                    checked={settings.theme === 'night'}
                                    onChange={() => setTheme('night')}
                                />
                                Night
                            </label>
                            <label>
                                <input
                                    type="radio"
                                    name="theme"
                                    value="amoledblack"
                                    checked={settings.theme === 'amoledblack'}
                                    onChange={() => setTheme('amoledblack')}
                                />
                                Black (AMOLED)
                            </label>
                        </div>
                    </div>

                    <div className="control-section">
                        <h2>Change Font</h2>
                        <div className="input-group">
                            <label>
                                Font size:
                                <input
                                    type="number"
                                    min="12"
                                    max="24"
                                    value={settings.titleFontSize}
                                    onChange={(e) => setFont(e.target.value)}
                                />
                            </label>
                        </div>
                        <div className="input-group">
                            <label>
                                List spacing:
                                <input
                                    type="number"
                                    min="0"
                                    max="30"
                                    value={settings.listSpacing}
                                    onChange={(e) => setSpacing(e.target.value)}
                                />
                            </label>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
