import { NavLink } from 'react-router-dom';

import { useSettings, useSettingsStore } from '../shared/settings/useSettings';
import Settings from './Settings';
import './Header.scss';

const feedLinks = [
    { to: '/newest/1', label: 'new' },
    { to: '/show/1', label: 'show' },
    { to: '/ask/1', label: 'ask' },
    { to: '/jobs/1', label: 'jobs' },
];

const activeClassName = ({ isActive }: { isActive: boolean }) => (isActive ? 'active' : undefined);

function scrollTop() {
    window.scrollTo(0, 0);
}

export default function Header() {
    const settings = useSettings();
    const store = useSettingsStore();

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
                            {feedLinks.map(({ to, label }, index) => (
                                <span key={to}>
                                    {index > 0 && ' | '}
                                    <NavLink to={to} className={activeClassName} onClick={scrollTop}>
                                        {label}
                                    </NavLink>
                                </span>
                            ))}
                        </span>
                    </div>
                </div>
                <div className="info">
                    <img
                        className="settings"
                        src="/assets/images/cog.svg"
                        alt="Settings"
                        onClick={() => store.toggleSettings()}
                    />
                </div>
            </div>
            {settings.showSettings && <Settings />}
        </header>
    );
}
