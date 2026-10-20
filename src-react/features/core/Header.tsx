import { Fragment, useEffect, useRef, type KeyboardEvent } from 'react';
import { NavLink } from 'react-router-dom';

import { useSettings } from '../../shared/settings';
import './Header.scss';
import { Settings } from './Settings';

const NAV_LINKS = [
    { to: '/newest/1', label: 'new' },
    { to: '/show/1', label: 'show' },
    { to: '/ask/1', label: 'ask' },
    { to: '/jobs/1', label: 'jobs' },
] as const;

const navClass = ({ isActive }: { isActive: boolean }) => (isActive ? 'active' : undefined);
const homeClass = ({ isActive }: { isActive: boolean }) => (isActive ? 'home-link active' : 'home-link');

function scrollTop() {
    window.scrollTo(0, 0);
}

/** Port of `header.component`. */
export function Header() {
    const { settings, toggleSettings } = useSettings();
    const cogRef = useRef<HTMLImageElement>(null);
    const wasOpen = useRef(settings.showSettings);

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
        <header data-testid="header-placeholder">
            <div id="header">
                <NavLink className={homeClass} to="/news/1" onClick={scrollTop}>
                    <div className="logo-inner"></div>
                    <img className="logo" src="/assets/images/logo.svg" alt="Logo" />
                </NavLink>
                <div className="header-text">
                    <div className="left">
                        <span className="header-nav">
                            {NAV_LINKS.map(({ to, label }, index) => (
                                <Fragment key={to}>
                                    {index > 0 && ' | '}
                                    <NavLink to={to} className={navClass} onClick={scrollTop}>
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
