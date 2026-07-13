import { NavLink } from 'react-router-dom';

import { Settings } from '../settings/Settings';
import { useSettings } from '../../services/settings-context';
import './Header.scss';

const withActive =
    (base: string) =>
    ({ isActive }: { isActive: boolean }) =>
        isActive ? `${base} active`.trim() : base;

export const Header = () => {
    const { settings, toggleSettings } = useSettings();

    const scrollTop = () => {
        window.scrollTo(0, 0);
    };

    return (
        <header className="header-view">
            <div id="header">
                <NavLink className={withActive('home-link')} to="/news/1" onClick={scrollTop}>
                    <div className="logo-inner"></div>
                    <img className="logo" src="/assets/images/logo.svg" alt="Logo" />
                </NavLink>
                <div className="header-text">
                    <div className="left">
                        <span className="header-nav">
                            <NavLink className={withActive('')} to="/newest/1" onClick={scrollTop}>
                                new
                            </NavLink>
                            {' | '}
                            <NavLink className={withActive('')} to="/show/1" onClick={scrollTop}>
                                show
                            </NavLink>
                            {' | '}
                            <NavLink className={withActive('')} to="/ask/1" onClick={scrollTop}>
                                ask
                            </NavLink>
                            {' | '}
                            <NavLink className={withActive('')} to="/jobs/1" onClick={scrollTop}>
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
            {settings.showSettings && <Settings />}
        </header>
    );
};
