import { Link, NavLink } from 'react-router-dom';

import { useSettings } from '../../context/settingsContext';
import { Settings } from '../Settings/Settings';

import './Header.scss';

const FEEDS = [
    { path: 'newest', label: 'new' },
    { path: 'show', label: 'show' },
    { path: 'ask', label: 'ask' },
    { path: 'jobs', label: 'jobs' },
];

function scrollTop() {
    window.scrollTo(0, 0);
}

export function Header() {
    const { settings, toggleSettings } = useSettings();

    return (
        <header className="app-header">
            <div id="header">
                <Link className="home-link" to="/news/1" onClick={scrollTop}>
                    <div className="logo-inner" />
                    <img className="logo" src="/assets/images/logo.svg" alt="Logo" />
                </Link>
                <div className="header-text">
                    <div className="left">
                        <span className="header-nav">
                            {FEEDS.map((feed, index) => (
                                <span key={feed.path}>
                                    {index > 0 && ' | '}
                                    <NavLink to={`/${feed.path}/1`} onClick={scrollTop}>
                                        {feed.label}
                                    </NavLink>
                                </span>
                            ))}
                        </span>
                    </div>
                </div>
                <div className="info">
                    <img className="settings" src="/assets/images/cog.svg" alt="Settings" onClick={toggleSettings} />
                </div>
            </div>
            {settings.showSettings && <Settings />}
        </header>
    );
}
