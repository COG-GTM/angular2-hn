import { Fragment, type KeyboardEvent } from 'react';
import { NavLink } from 'react-router';

import { useSettings } from '../shared/hooks';
import { Settings } from './Settings';
import './Header.scss';

const FEED_LINKS = [
    { to: '/newest/1', label: 'new' },
    { to: '/show/1', label: 'show' },
    { to: '/ask/1', label: 'ask' },
    { to: '/jobs/1', label: 'jobs' },
] as const;

function scrollTop() {
    window.scrollTo(0, 0);
}

// Keyboard activation for the image/span controls kept from the Angular markup.
function onActivateKey(action: () => void) {
    return (event: KeyboardEvent) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            action();
        }
    };
}

export function Header() {
    const { settings, toggleSettings } = useSettings();
    return (
        <header>
            <div id="header">
                <NavLink className="home-link" to="/news/1" onClick={scrollTop}>
                    <div className="logo-inner"></div>
                    <img className="logo" src="assets/images/logo.svg" alt="Logo" />
                </NavLink>
                <div className="header-text">
                    <div className="left">
                        <span className="header-nav">
                            {FEED_LINKS.map(({ to, label }, i) => (
                                <Fragment key={to}>
                                    {i > 0 && ' | '}
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
                        className="settings"
                        src="assets/images/cog.svg"
                        alt="Settings"
                        role="button"
                        tabIndex={0}
                        aria-expanded={settings.showSettings}
                        onClick={toggleSettings}
                        onKeyDown={onActivateKey(toggleSettings)}
                    />
                </div>
            </div>
            {settings.showSettings && <Settings />}
        </header>
    );
}
