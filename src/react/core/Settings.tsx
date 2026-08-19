import '../../app/core/settings/settings.component.scss';
import { content } from '../scope';
import { useSettings } from '../settings/SettingsContext';

const c = content('settings');

export function Settings() {
    const { settings, toggleSettings, toggleOpenLinksInNewTab, setTheme, setFont, setSpacing } = useSettings();

    return (
        <div id="popup1" className="overlay" {...c}>
            <div className="popup" {...c}>
                <h1 {...c}>Settings</h1>
                <hr {...c} />
                <span className="close" onClick={toggleSettings} {...c}>
                    &times;
                </span>
                <div className="content" {...c}>
                    <div className="control-section" {...c}>
                        <h2 {...c}>Links</h2>
                        <input
                            type="checkbox"
                            checked={settings.openLinkInNewTab}
                            onChange={toggleOpenLinksInNewTab}
                            {...c}
                        />
                        Open links in a new tab
                    </div>
                    <div className="theme-controls" {...c}>
                        <div className="control-section" {...c}>
                            <h2 {...c}>Select a theme</h2>
                            <div {...c}>
                                <label {...c}>
                                    <input
                                        name="theme"
                                        type="radio"
                                        value="default"
                                        checked={settings.theme === 'default'}
                                        onChange={() => setTheme('default')}
                                        {...c}
                                    />
                                    Default
                                </label>
                            </div>
                            <div {...c}>
                                <label {...c}>
                                    <input
                                        name="theme"
                                        type="radio"
                                        value="night"
                                        checked={settings.theme === 'night'}
                                        onChange={() => setTheme('night')}
                                        {...c}
                                    />
                                    Night
                                </label>
                            </div>
                            <div {...c}>
                                <label {...c}>
                                    <input
                                        name="theme"
                                        type="radio"
                                        value="amoledblack"
                                        checked={settings.theme === 'amoledblack'}
                                        onChange={() => setTheme('amoledblack')}
                                        {...c}
                                    />
                                    Black (AMOLED)
                                </label>
                            </div>
                        </div>
                        <div className="control-section" {...c}>
                            <h2 {...c}>Change Font</h2>
                            <div {...c}>
                                <label {...c}>
                                    Font size:
                                    <input
                                        min="1"
                                        defaultValue={settings.titleFontSize}
                                        name="theme"
                                        type="number"
                                        onKeyUp={event => setFont(event.currentTarget.value)}
                                        {...c}
                                    />
                                </label>
                            </div>
                            <div {...c}>
                                <label {...c}>
                                    List spacing:
                                    <input
                                        min="0"
                                        defaultValue={settings.listSpacing}
                                        name="theme"
                                        type="number"
                                        onKeyUp={event => setSpacing(event.currentTarget.value)}
                                        {...c}
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
