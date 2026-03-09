import { NavLink, useNavigate } from 'react-router-dom';
import { useSettings } from '../../shared/services/settings.service';
import { SettingsPanel } from '../settings/Settings';
import './header.scss';

export function Header() {
    const { settings, toggleSettings } = useSettings();
    const navigate = useNavigate();

    const scrollTop = () => {
        window.scrollTo(0, 0);
    };

    const handleNavClick = (path: string) => {
        scrollTop();
        navigate(path);
    };

    return (
        <header>
            <div id="header">
                <a className="home-link" href="/news/1" onClick={(e) => { e.preventDefault(); handleNavClick('/news/1'); }}>
                    <div className="logo-inner"></div>
                    <img className="logo" src="/assets/images/logo.svg" alt="Logo" />
                </a>
                <div className="header-text">
                    <div className="left">
                        <span className="header-nav">
                            <NavLink to="/newest/1" className={({ isActive }) => isActive ? 'active' : ''} onClick={scrollTop}>
                                new
                            </NavLink>
                            {' | '}
                            <NavLink to="/show/1" className={({ isActive }) => isActive ? 'active' : ''} onClick={scrollTop}>
                                show
                            </NavLink>
                            {' | '}
                            <NavLink to="/ask/1" className={({ isActive }) => isActive ? 'active' : ''} onClick={scrollTop}>
                                ask
                            </NavLink>
                            {' | '}
                            <NavLink to="/jobs/1" className={({ isActive }) => isActive ? 'active' : ''} onClick={scrollTop}>
                                jobs
                            </NavLink>
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
            {settings.showSettings && <SettingsPanel />}
        </header>
    );
}
