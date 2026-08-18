import { NavLink } from 'react-router-dom';

import Settings from '../Settings/Settings';
import { useSettings } from '../../context/SettingsContext';
import './Header.scss';

const FEEDS = [
    { path: '/newest/1', label: 'new' },
    { path: '/show/1', label: 'show' },
    { path: '/ask/1', label: 'ask' },
    { path: '/jobs/1', label: 'jobs' },
];

const scrollTop = () => window.scrollTo(0, 0);

const navClass = ({ isActive }: { isActive: boolean }) => (isActive ? 'active' : '');

export default function Header() {
    const { settings, toggleSettings } = useSettings();

    return (
        <header>
            <div id="header">
                <NavLink className="home-link" to="/news/1" onClick={scrollTop}>
                    <div className="logo-inner"></div>
                    <img className="logo" src="/assets/images/logo.svg" alt="Logo" />
                </NavLink>
                <div className="header-text">
                    <div className="left">
                        <span className="header-nav">
                            {FEEDS.map((feed, index) => (
                                <span key={feed.path}>
                                    {index > 0 && ' | '}
                                    <NavLink to={feed.path} className={navClass} onClick={scrollTop}>
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
