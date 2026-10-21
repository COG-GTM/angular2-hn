import { useEffect, useId, useRef, type KeyboardEvent } from 'react';

import { useSettings } from '../../shared/settings';
import './Settings.scss';

const THEME_OPTIONS = [
    { value: 'default', label: 'Default' },
    { value: 'night', label: 'Night' },
    { value: 'amoledblack', label: 'Black (AMOLED)' },
] as const;

const FOCUSABLE = 'a[href], button, input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])';

/**
 * Port of `core/settings`: full-screen `.overlay` with the settings popup. Only × (or Escape) closes it;
 * the overlay sits above the header, so a real second click on the cog lands on the overlay (Angular parity).
 */
export function Settings() {
    const { settings, toggleSettings, toggleOpenLinksInNewTab, setTheme, setFont, setSpacing } = useSettings();
    const popupRef = useRef<HTMLDivElement>(null);
    const closeRef = useRef<HTMLSpanElement>(null);
    const titleId = useId();

    useEffect(() => {
        closeRef.current?.focus();
    }, []);

    const focusables = () => {
        const nodes = popupRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? [];
        // Only the checked radio of a group is in the Tab order.
        return Array.from(nodes).filter(
            (el) => !(el instanceof HTMLInputElement && el.type === 'radio' && !el.checked)
        );
    };

    const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
        if (event.key === 'Escape') {
            event.preventDefault();
            toggleSettings();
            return;
        }
        if (event.key !== 'Tab') return;
        const items = focusables();
        if (items.length === 0) return;
        const first = items[0];
        const last = items[items.length - 1];
        const active = document.activeElement;
        const inside = active instanceof HTMLElement && items.includes(active);
        if (event.shiftKey && (active === first || !inside)) {
            event.preventDefault();
            last.focus();
        } else if (!event.shiftKey && (active === last || !inside)) {
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
        <div id="popup1" className="overlay" data-testid="settings" onKeyDown={onKeyDown}>
            <div ref={popupRef} className="popup" role="dialog" aria-modal="true" aria-labelledby={titleId}>
                <h1 id={titleId}>Settings</h1>
                <hr />
                <span
                    ref={closeRef}
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
                            type="checkbox"
                            aria-label="Open links in a new tab"
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
