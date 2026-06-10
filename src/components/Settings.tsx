import { useSettings } from '../context/SettingsContext';

export default function Settings() {
    const {
        openLinkInNewTab,
        theme,
        titleFontSize,
        listSpacing,
        toggleSettings,
        toggleOpenLinksInNewTab,
        setTheme,
        setTitleFontSize,
        setListSpacing,
    } = useSettings();

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
                        <input
                            type="checkbox"
                            checked={openLinkInNewTab}
                            onChange={toggleOpenLinksInNewTab}
                        />{' '}
                        Open links in a new tab
                    </div>
                    <div className="theme-controls">
                        <div className="control-section">
                            <h2>Select a theme</h2>
                            <div>
                                <label>
                                    <input
                                        name="theme"
                                        type="radio"
                                        value="default"
                                        checked={theme === 'default'}
                                        onChange={() => setTheme('default')}
                                    />
                                    Default
                                </label>
                            </div>
                            <div>
                                <label>
                                    <input
                                        name="theme"
                                        type="radio"
                                        value="night"
                                        checked={theme === 'night'}
                                        onChange={() => setTheme('night')}
                                    />
                                    Night
                                </label>
                            </div>
                            <div>
                                <label>
                                    <input
                                        name="theme"
                                        type="radio"
                                        value="amoledblack"
                                        checked={theme === 'amoledblack'}
                                        onChange={() => setTheme('amoledblack')}
                                    />
                                    Black (AMOLED)
                                </label>
                            </div>
                        </div>
                        <div className="control-section">
                            <h2>Change Font</h2>
                            <div>
                                <label>
                                    Font size:
                                    <input
                                        min="1"
                                        value={titleFontSize}
                                        name="titleFontSize"
                                        type="number"
                                        onChange={(e) => setTitleFontSize(e.target.value)}
                                    />
                                </label>
                            </div>
                            <div>
                                <label>
                                    List spacing:
                                    <input
                                        min="0"
                                        value={listSpacing}
                                        name="listSpacing"
                                        type="number"
                                        onChange={(e) => setListSpacing(e.target.value)}
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
