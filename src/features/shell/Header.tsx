import { Fragment, useEffect, useRef, type KeyboardEvent } from 'react';
import { NavLink } from 'react-router';

import { useSettings } from '../../shared/settings';
import { Settings } from './Settings';
import './Header.scss';

const NAV_LINKS = [
    { to: '/newest/1', label: 'new' },
    { to: '/show/1', label: 'show' },
    { to: '/ask/1', label: 'ask' },
    { to: '/jobs/1', label: 'jobs' },
] as const;

function scrollTop() {
    window.scrollTo(0, 0);
}

/** Port of `core/header`: logo + feed nav (scroll to top on click), settings cog and the Settings popup. */
export function Header() {
    const { settings, toggleSettings } = useSettings();
    const cogRef = useRef<HTMLImageElement>(null);
    const wasOpen = useRef(settings.showSettings);

    // Return focus to the cog when the popup closes.
    useEffect(() => {
        if (wasOpen.current && !settings.showSettings) cogRef.current?.focus();
        wasOpen.current = settings.showSettings;
    }, [settings.showSettings]);

    const onCogKeyDown = (event: KeyboardEvent<HTMLImageElement>) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            toggleSettings();
        }
    };

    return (
        <header data-testid="header">
            <div id="header">
                <NavLink className="home-link" to="/news/1" onClick={scrollTop}>
                    <div className="logo-inner"></div>
                    <img className="logo" src="/assets/images/logo.svg" alt="Logo" />
                </NavLink>
                <div className="header-text">
                    <div className="left">
                        <span className="header-nav">
                            {NAV_LINKS.map(({ to, label }, index) => (
                                <Fragment key={to}>
                                    {index > 0 && ' | '}
                                    <NavLink to={to} onClick={scrollTop}>
                                        {label}
                                    </NavLink>
                                </Fragment>
                            ))}
                        </span>
                    </div>
                </div>
                <div className="info">
                    <img
                        ref={cogRef}
                        className="settings"
                        src="/assets/images/cog.svg"
                        alt="Settings"
                        role="button"
                        tabIndex={0}
                        aria-label="Settings"
                        aria-haspopup="dialog"
                        aria-expanded={settings.showSettings}
                        onClick={toggleSettings}
                        onKeyDown={onCogKeyDown}
                    />
                </div>
            </div>
            {settings.showSettings && <Settings />}
        </header>
    );
}
