import { NavLink } from 'react-router-dom';

import { useSettings } from '../context/useSettings';
import SettingsPanel from './SettingsPanel';
import './Header.scss';

const FEEDS = [
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
        <header>
            <div id="header">
                <NavLink
                    className={({ isActive }) => (isActive ? 'home-link active' : 'home-link')}
                    to="/news/1"
                    onClick={scrollTop}
                >
                    <div className="logo-inner" />
                    <img className="logo" src="/assets/images/logo.svg" alt="Logo" />
                </NavLink>
                <div className="header-text">
                    <div className="left">
                        <span className="header-nav">
                            {FEEDS.map(({ path, label }, index) => (
                                <span key={path}>
                                    {index > 0 && ' | '}
                                    <NavLink to={path} onClick={scrollTop}>
                                        {label}
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
            {settings.showSettings && <SettingsPanel />}
        </header>
    );
}
