import { NavLink } from 'react-router-dom';

import { useSettings } from '../../shared/settings/useSettings';
import { Settings } from '../Settings/Settings';
import './Header.scss';

function scrollTop(): void {
    window.scrollTo(0, 0);
}

function activeClassName({ isActive }: { isActive: boolean }): string | undefined {
    return isActive ? 'active' : undefined;
}

export function Header() {
    const { settings, toggleSettings } = useSettings();

    return (
        <header>
            <div id="header">
                <NavLink
                    to="/news/1"
                    className={({ isActive }) => (isActive ? 'home-link active' : 'home-link')}
                    onClick={scrollTop}
                >
                    <div className="logo-inner"></div>
                    <img className="logo" src="/assets/images/logo.svg" alt="Logo" />
                </NavLink>
                <div className="header-text">
                    <div className="left">
                        <span className="header-nav">
                            <NavLink to="/newest/1" className={activeClassName} onClick={scrollTop}>
                                new
                            </NavLink>
                            {' | '}
                            <NavLink to="/show/1" className={activeClassName} onClick={scrollTop}>
                                show
                            </NavLink>
                            {' | '}
                            <NavLink to="/ask/1" className={activeClassName} onClick={scrollTop}>
                                ask
                            </NavLink>
                            {' | '}
                            <NavLink to="/jobs/1" className={activeClassName} onClick={scrollTop}>
                                jobs
                            </NavLink>
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
