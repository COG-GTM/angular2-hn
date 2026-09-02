import { NavLink } from 'react-router-dom';

import { useSettings } from '../settings';
import { Settings } from './Settings';
import './header.scss';

function navClass({ isActive }: { isActive: boolean }): string | undefined {
    return isActive ? 'active' : undefined;
}

function homeLinkClass({ isActive }: { isActive: boolean }): string {
    return isActive ? 'home-link active' : 'home-link';
}

export function Header() {
    const { settings, toggleSettings } = useSettings();

    const scrollTop = () => {
        window.scrollTo(0, 0);
    };

    return (
        <header>
            <div id="header">
                <NavLink className={homeLinkClass} to="/news/1" onClick={scrollTop}>
                    <div className="logo-inner"></div>
                    <img className="logo" src="assets/images/logo.svg" alt="Logo" />
                </NavLink>
                <div className="header-text">
                    <div className="left">
                        <span className="header-nav">
                            <NavLink to="/newest/1" className={navClass} onClick={scrollTop}>
                                new
                            </NavLink>{' '}
                            |{' '}
                            <NavLink to="/show/1" className={navClass} onClick={scrollTop}>
                                show
                            </NavLink>{' '}
                            |{' '}
                            <NavLink to="/ask/1" className={navClass} onClick={scrollTop}>
                                ask
                            </NavLink>{' '}
                            |{' '}
                            <NavLink to="/jobs/1" className={navClass} onClick={scrollTop}>
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
