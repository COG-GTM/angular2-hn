import { NavLink } from 'react-router-dom';
import { useSettings } from '../../shared/context/SettingsContext';
import { Settings } from '../settings/Settings';
import './header.scss';

const activeClass = ({ isActive }: { isActive: boolean }): string => (isActive ? 'active' : '');

const scrollTop = (): void => window.scrollTo(0, 0);

export function Header(): JSX.Element {
    const { settings, toggleSettings } = useSettings();

    return (
        <app-header>
            <header>
                <div id="header">
                    <NavLink
                        to="/news/1"
                        className={({ isActive }) => `home-link${isActive ? ' active' : ''}`}
                        onClick={scrollTop}
                    >
                        <div className="logo-inner"></div>
                        <img className="logo" src="assets/images/logo.svg" alt="Logo" />
                    </NavLink>
                    <div className="header-text">
                        <div className="left">
                            <span className="header-nav">
                                <NavLink to="/newest/1" className={activeClass} onClick={scrollTop}>
                                    new
                                </NavLink>
                                {' | '}
                                <NavLink to="/show/1" className={activeClass} onClick={scrollTop}>
                                    show
                                </NavLink>
                                {' | '}
                                <NavLink to="/ask/1" className={activeClass} onClick={scrollTop}>
                                    ask
                                </NavLink>
                                {' | '}
                                <NavLink to="/jobs/1" className={activeClass} onClick={scrollTop}>
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
        </app-header>
    );
}
