import { Fragment } from 'react';
import { NavLink } from 'react-router-dom';

import { useSettings } from '../context/settings-context';
import Settings from './Settings';

const navLinks = [
    { path: '/newest/1', label: 'new' },
    { path: '/show/1', label: 'show' },
    { path: '/ask/1', label: 'ask' },
    { path: '/jobs/1', label: 'jobs' },
];

function scrollTop() {
    window.scrollTo(0, 0);
}

export default function Header() {
    const { settings, toggleSettings } = useSettings();

    return (
        <app-header>
            <header>
                <div id="header">
                    <NavLink
                        className={({ isActive }) => (isActive ? 'home-link active' : 'home-link')}
                        to="/news/1"
                        onClick={scrollTop}
                    >
                        <div className="logo-inner"></div>
                        <img className="logo" src="assets/images/logo.svg" alt="Logo" />
                    </NavLink>
                    <div className="header-text">
                        <div className="left">
                            <span className="header-nav">
                                {navLinks.map(({ path, label }, index) => (
                                    <Fragment key={path}>
                                        {index > 0 && ' | '}
                                        <NavLink
                                            className={({ isActive }) => (isActive ? 'active' : undefined)}
                                            to={path}
                                            onClick={scrollTop}
                                        >
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
                            onClick={toggleSettings}
                        />
                    </div>
                </div>
                {settings.showSettings && <Settings />}
            </header>
        </app-header>
    );
}
