import { Fragment } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useSettings } from '../context/SettingsContext';
import { FeedName } from '../models/feed-name.type';
import Settings from './Settings';
import './Header.scss';

const feedLinks: Array<{ feedName: FeedName; path: string; label: string }> = [
    { feedName: 'newest', path: '/newest/1', label: 'new' },
    { feedName: 'show', path: '/show/1', label: 'show' },
    { feedName: 'ask', path: '/ask/1', label: 'ask' },
    { feedName: 'jobs', path: '/jobs/1', label: 'jobs' },
];

function isFeedActive(pathname: string, feedName: FeedName): boolean {
    return pathname.split('/')[1] === feedName;
}

function scrollTop(): void {
    window.scrollTo(0, 0);
}

export default function Header() {
    const { pathname } = useLocation();
    const { settings, toggleSettings } = useSettings();

    return (
        <header>
            <div id="header">
                <NavLink
                    to="/news/1"
                    className={({ isActive }) =>
                        isActive || isFeedActive(pathname, 'news') ? 'home-link active' : 'home-link'
                    }
                    onClick={scrollTop}
                >
                    <div className="logo-inner"></div>
                    <img className="logo" src="/assets/images/logo.svg" alt="Logo" />
                </NavLink>
                <div className="header-text">
                    <div className="left">
                        <span className="header-nav">
                            {feedLinks.map((link, index) => (
                                <Fragment key={link.feedName}>
                                    {index > 0 && ' | '}
                                    <NavLink
                                        to={link.path}
                                        className={({ isActive }) =>
                                            isActive || isFeedActive(pathname, link.feedName) ? 'active' : ''
                                        }
                                        onClick={scrollTop}
                                    >
                                        {link.label}
                                    </NavLink>
                                </Fragment>
                            ))}
                        </span>
                    </div>
                </div>
                <div className="info">
                    <img
                        className="settings"
                        src="/assets/images/cog.svg"
                        alt="Settings"
                        onClick={toggleSettings}
                    />
                </div>
            </div>
            {settings.showSettings && <Settings />}
        </header>
    );
}
