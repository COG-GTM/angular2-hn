import { NavLink } from 'react-router-dom';
import { useSettings } from '../../context/SettingsContext';
import { Settings } from '../Settings/Settings';
import './Header.scss';

const links = [
    ['newest', 'new'],
    ['show', 'show'],
    ['ask', 'ask'],
    ['jobs', 'jobs'],
] as const;

export function Header() {
    const { settings, toggleSettings } = useSettings();
    const scrollTop = () => window.scrollTo(0, 0);
    return (
        <header>
            <div id="header">
                <NavLink className="home-link" to="/news/1" onClick={scrollTop}>
                    <div className="logo-inner" />
                    <img className="logo" src="/assets/images/logo.svg" alt="Logo" />
                </NavLink>
                <div className="header-text">
                    <div className="left">
                        <span className="header-nav">
                            {links.map(([path, label], index) => (
                                <span key={path}>
                                    {index > 0 && ' | '}
                                    <NavLink
                                        to={`/${path}/1`}
                                        className={({ isActive }) => (isActive ? 'active' : undefined)}
                                        onClick={scrollTop}
                                    >
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
            {settings.showSettings && <Settings />}
        </header>
    );
}
