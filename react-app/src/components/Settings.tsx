import { useEffect, useRef, type KeyboardEvent } from 'react';

import { useSettings } from '../context/SettingsContext';
import { THEME_LABELS, THEMES } from '../types';
import './Settings.scss';

const FOCUSABLE = 'input:not([disabled]), [tabindex]:not([tabindex="-1"])';

/** Port of src/app/core/settings: full-screen overlay with the settings dialog. */
export function Settings() {
    const { settings, toggleSettings, toggleOpenLinksInNewTab, setTheme, setFont, setSpacing } = useSettings();
    const dialogRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        dialogRef.current?.focus();
    }, []);

    const onDialogKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
        if (event.key === 'Escape') {
            event.preventDefault();
            toggleSettings();
            return;
        }
        if (event.key !== 'Tab' || !dialogRef.current) return;
        const focusable = Array.from(dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE));
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        const active = document.activeElement;
        if (event.shiftKey && (active === first || active === dialogRef.current)) {
            event.preventDefault();
            last.focus();
        } else if (!event.shiftKey && active === last) {
            event.preventDefault();
            first.focus();
        }
    };

    const onCloseKeyDown = (event: KeyboardEvent<HTMLSpanElement>) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            toggleSettings();
        }
    };

    return (
        <div id="popup1" className="overlay">
            <div
                ref={dialogRef}
                className="popup"
                role="dialog"
                aria-modal="true"
                aria-labelledby="settings-title"
                tabIndex={-1}
                onKeyDown={onDialogKeyDown}
            >
                <h1 id="settings-title">Settings</h1>
                <hr />
                <span
                    className="close"
                    role="button"
                    tabIndex={0}
                    aria-label="Close settings"
                    onClick={toggleSettings}
                    onKeyDown={onCloseKeyDown}
                >
                    &times;
                </span>
                <div className="content">
                    <div className="control-section">
                        <h2>Links</h2>
                        <input
                            id="settings-open-link-in-new-tab"
                            type="checkbox"
                            checked={settings.openLinkInNewTab}
                            onChange={toggleOpenLinksInNewTab}
                        />{' '}
                        <label htmlFor="settings-open-link-in-new-tab">Open links in a new tab</label>
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
                                        value={settings.titleFontSize}
                                        name="titleFontSize"
                                        type="number"
                                        onChange={(event) => setFont(event.target.value)}
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
                                        onChange={(event) => setSpacing(event.target.value)}
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
