import { NavLink, useLocation } from 'react-router-dom';
import { useSettings } from '../../context';
import type { FeedName } from '../../models';
import { Settings } from './Settings';
import './Header.scss';

const NAV_LINKS: { feed: FeedName; label: string }[] = [
    { feed: 'newest', label: 'new' },
    { feed: 'show', label: 'show' },
    { feed: 'ask', label: 'ask' },
    { feed: 'jobs', label: 'jobs' },
];

function scrollTop() {
    window.scrollTo(0, 0);
}

export function Header() {
    const { settings, toggleSettings } = useSettings();
    const { pathname } = useLocation();
    const isFeedActive = (feed: FeedName) => pathname === `/${feed}` || pathname.startsWith(`/${feed}/`);

    return (
        <header>
            <div id="header">
                <NavLink
                    to="/news/1"
                    className={() => `home-link${isFeedActive('news') ? ' active' : ''}`}
                    onClick={scrollTop}
                    aria-label="Home"
                >
                    <div className="logo-inner"></div>
                    <img className="logo" src="/assets/images/logo.svg" alt="Logo" />
                </NavLink>
                <div className="header-text">
                    <div className="left">
                        <nav className="header-nav">
                            {NAV_LINKS.map(({ feed, label }, index) => (
                                <span key={feed}>
                                    {index > 0 && ' | '}
                                    <NavLink
                                        to={`/${feed}/1`}
                                        className={() => (isFeedActive(feed) ? 'active' : '')}
                                        onClick={scrollTop}
                                    >
                                        {label}
                                    </NavLink>
                                </span>
                            ))}
                        </nav>
                    </div>
                </div>
                <div className="info">
                    <button
                        type="button"
                        className="settings-button"
                        onClick={toggleSettings}
                        aria-label="Settings"
                        aria-expanded={settings.showSettings}
                    >
                        <img className="settings" src="/assets/images/cog.svg" alt="" />
                    </button>
                </div>
            </div>
            {settings.showSettings && <Settings />}
        </header>
    );
}
