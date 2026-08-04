import { NavLink } from 'react-router-dom';

import Settings from '../settings/Settings';
import { useSettings } from '../../shared/services/settings-context';

import './Header.scss';

function activeClassName(baseClassName?: string) {
    return ({ isActive }: { isActive: boolean }) =>
        [baseClassName, isActive ? 'active' : undefined].filter(Boolean).join(' ') || undefined;
}

function scrollTop() {
    window.scrollTo(0, 0);
}

export default function Header() {
    const { showSettings, toggleSettings } = useSettings();

    return (
        <header>
            <div id="header">
                <NavLink className={activeClassName('home-link')} to="/news/1" onClick={scrollTop}>
                    <div className="logo-inner"></div>
                    <img className="logo" src="/assets/images/logo.svg" alt="Logo" />
                </NavLink>
                <div className="header-text">
                    <div className="left">
                        <span className="header-nav">
                            <NavLink className={activeClassName()} to="/newest/1" onClick={scrollTop}>
                                new
                            </NavLink>
                            {' | '}
                            <NavLink className={activeClassName()} to="/show/1" onClick={scrollTop}>
                                show
                            </NavLink>
                            {' | '}
                            <NavLink className={activeClassName()} to="/ask/1" onClick={scrollTop}>
                                ask
                            </NavLink>
                            {' | '}
                            <NavLink className={activeClassName()} to="/jobs/1" onClick={scrollTop}>
                                jobs
                            </NavLink>
                        </span>
                    </div>
                </div>
                <div className="info">
                    <img className="settings" src="/assets/images/cog.svg" alt="Settings" onClick={toggleSettings} />
                </div>
            </div>
            {showSettings && <Settings />}
        </header>
    );
}
