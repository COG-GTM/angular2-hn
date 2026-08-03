import { NavLink } from 'react-router-dom';
import { useSettings } from '../../context/settingsContext';
import { Settings } from '../Settings/Settings';
import './Header.scss';

const NAV_LINKS = [
    { path: '/newest/1', label: 'new' },
    { path: '/show/1', label: 'show' },
    { path: '/ask/1', label: 'ask' },
    { path: '/jobs/1', label: 'jobs' },
];

export function Header() {
    const { settings, toggleSettings } = useSettings();
    const scrollTop = () => window.scrollTo(0, 0);

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
                            {NAV_LINKS.map((link, index) => (
                                <span key={link.path}>
                                    {index > 0 && ' | '}
                                    <NavLink to={link.path} onClick={scrollTop}>
                                        {link.label}
                                    </NavLink>
                                </span>
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
    );
}
