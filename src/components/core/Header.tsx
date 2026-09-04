import { NavLink } from 'react-router-dom';

import { useSettings } from '../../context/SettingsContext';
import Settings from './Settings';
import './Header.scss';

function scrollTop() {
    window.scrollTo(0, 0);
}

const navLinkClass = ({ isActive }: { isActive: boolean }) => (isActive ? 'active' : '');

export default function Header() {
    const { settings, toggleSettings } = useSettings();

    return (
        <header className="c-header">
            <div id="header">
                <NavLink
                    className={({ isActive }) => `home-link${isActive ? ' active' : ''}`}
                    to="/news/1"
                    onClick={scrollTop}
                >
                    <div className="logo-inner"></div>
                    <img className="logo" src="assets/images/logo.svg" alt="Logo" />
                </NavLink>
                <div className="header-text">
                    <div className="left">
                        <span className="header-nav">
                            <NavLink className={navLinkClass} to="/newest/1" onClick={scrollTop}>
                                new
                            </NavLink>
                            {' | '}
                            <NavLink className={navLinkClass} to="/show/1" onClick={scrollTop}>
                                show
                            </NavLink>
                            {' | '}
                            <NavLink className={navLinkClass} to="/ask/1" onClick={scrollTop}>
                                ask
                            </NavLink>
                            {' | '}
                            <NavLink className={navLinkClass} to="/jobs/1" onClick={scrollTop}>
                                jobs
                            </NavLink>
                        </span>
                    </div>
                </div>
                <div className="info">
                    <img className="settings" src="assets/images/cog.svg" alt="Settings" onClick={toggleSettings} />
                </div>
            </div>
            {settings.showSettings && <Settings />}
        </header>
    );
}
