import { NavLink } from 'react-router';

import { useSettings } from '../shared/settings/useSettings';
import { scrollTop } from '../shared/utils/scroll';
import { Settings } from './Settings';
import './Header.scss';

export function Header() {
    const { settings, toggleSettings } = useSettings();

    return (
        <>
            <header className="app-header">
            <div id="header">
                <NavLink className="home-link" to="/news/1" onClick={scrollTop}>
                    <div className="logo-inner"></div>
                    <img className="logo" src="/assets/images/logo.svg" alt="Logo" />
                </NavLink>
                <div className="header-text">
                    <div className="left">
                        <span className="header-nav">
                            <NavLink to="/newest/1" onClick={scrollTop}>
                                new
                            </NavLink>{' '}
                            |{' '}
                            <NavLink to="/show/1" onClick={scrollTop}>
                                show
                            </NavLink>{' '}
                            |{' '}
                            <NavLink to="/ask/1" onClick={scrollTop}>
                                ask
                            </NavLink>{' '}
                            |{' '}
                            <NavLink to="/jobs/1" onClick={scrollTop}>
                                jobs
                            </NavLink>
                        </span>
                    </div>
                </div>
                <div className="info">
                    <img className="settings" src="/assets/images/cog.svg" alt="Settings" onClick={toggleSettings} />
                </div>
            </div>
            </header>
            {settings.showSettings && <Settings />}
        </>
    );
}
