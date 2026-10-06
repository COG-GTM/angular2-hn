import { NavLink } from 'react-router-dom';
import { useSettings } from '../../shared/services/useSettings';
import { SettingsDialog } from '../SettingsDialog/SettingsDialog';
import { onActivateKey } from '../../shared/utils/a11y';
import './Header.scss';

const NAV_LINKS = [
    { to: '/newest/1', label: 'new' },
    { to: '/show/1', label: 'show' },
    { to: '/ask/1', label: 'ask' },
    { to: '/jobs/1', label: 'jobs' },
];

const ASSETS = `${import.meta.env.BASE_URL}assets/images`;

function scrollTop() {
    window.scrollTo(0, 0);
}

export function Header() {
    const { settings, toggleSettings } = useSettings();

    return (
        <header>
            <div id="header">
                <NavLink className="home-link" to="/news/1" onClick={scrollTop}>
                    <div className="logo-inner"></div>
                    <img className="logo" src={`${ASSETS}/logo.svg`} alt="Logo" />
                </NavLink>
                <div className="header-text">
                    <div className="left">
                        <nav className="header-nav">
                            {NAV_LINKS.map((link, i) => (
                                <span key={link.to}>
                                    {i > 0 && ' | '}
                                    <NavLink to={link.to} onClick={scrollTop}>
                                        {link.label}
                                    </NavLink>
                                </span>
                            ))}
                        </nav>
                    </div>
                </div>
                <div className="info">
                    <img
                        className="settings"
                        src={`${ASSETS}/cog.svg`}
                        alt="Settings"
                        role="button"
                        tabIndex={0}
                        onClick={toggleSettings}
                        onKeyDown={onActivateKey(toggleSettings)}
                    />
                </div>
            </div>
            {settings.showSettings && <SettingsDialog />}
        </header>
    );
}
