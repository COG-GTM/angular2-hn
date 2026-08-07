import { NavLink } from 'react-router-dom';

import Settings from '../Settings/Settings';
import { useSettings } from '../../context/SettingsContext';
import './Header.scss';

function scrollTop() {
    window.scrollTo(0, 0);
}

function navLinkClassName({ isActive }: { isActive: boolean }) {
    return isActive ? 'active' : undefined;
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
                    <div className="logo-inner"></div>
                    <img className="logo" src="assets/images/logo.svg" alt="Logo" />
                </NavLink>
                <div className="header-text">
                    <div className="left">
                        <span className="header-nav">
                            <NavLink className={navLinkClassName} to="/newest/1" onClick={scrollTop}>
                                new
                            </NavLink>
                            {' | '}
                            <NavLink className={navLinkClassName} to="/show/1" onClick={scrollTop}>
                                show
                            </NavLink>
                            {' | '}
                            <NavLink className={navLinkClassName} to="/ask/1" onClick={scrollTop}>
                                ask
                            </NavLink>
                            {' | '}
                            <NavLink className={navLinkClassName} to="/jobs/1" onClick={scrollTop}>
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
