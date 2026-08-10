import { NavLink } from 'react-router-dom';

import Settings from '../settings/settings.component';
import { useSettings } from '../../shared/services/settings-context';
import './header.component.scss';

const navLinkClass = ({ isActive }: { isActive: boolean }) => (isActive ? 'active' : undefined);

export default function Header() {
    const { settings, toggleSettings } = useSettings();

    const scrollTop = () => window.scrollTo(0, 0);

    return (
        <header>
            <div id="header">
                <NavLink
                    className={({ isActive }) => (isActive ? 'home-link active' : 'home-link')}
                    to="/news/1"
                    onClick={scrollTop}
                >
                    <div className="logo-inner"></div>
                    <img className="logo" src="/assets/images/logo.svg" alt="Logo" />
                </NavLink>
                <div className="header-text">
                    <div className="left">
                        <span className="header-nav">
                            <NavLink className={navLinkClass} to="/newest/1" onClick={scrollTop}>
                                new
                            </NavLink>
                            &nbsp;|&nbsp;
                            <NavLink className={navLinkClass} to="/show/1" onClick={scrollTop}>
                                show
                            </NavLink>
                            &nbsp;|&nbsp;
                            <NavLink className={navLinkClass} to="/ask/1" onClick={scrollTop}>
                                ask
                            </NavLink>
                            &nbsp;|&nbsp;
                            <NavLink className={navLinkClass} to="/jobs/1" onClick={scrollTop}>
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
