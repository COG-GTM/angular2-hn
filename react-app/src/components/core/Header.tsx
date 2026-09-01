import { NavLink } from 'react-router-dom';

import { useSettings } from '../../context/SettingsContext';
import Settings from './Settings';
import styles from './Header.module.scss';

const NAV_LINKS = [
    { to: '/newest/1', label: 'new' },
    { to: '/show/1', label: 'show' },
    { to: '/ask/1', label: 'ask' },
    { to: '/jobs/1', label: 'jobs' },
];

function activeClassName({ isActive }: { isActive: boolean }): string | undefined {
    return isActive ? 'active' : undefined;
}

export default function Header() {
    const { settings, toggleSettings } = useSettings();

    const scrollTop = () => window.scrollTo(0, 0);

    return (
        <header>
            <div id="header">
                <NavLink to="/news/1" className={`${styles.homeLink} home-link`} onClick={scrollTop}>
                    <div className="logo-inner" />
                    <img className={styles.logo} src="/assets/images/logo.svg" alt="Logo" />
                </NavLink>
                <div className={styles.headerText}>
                    <div className={styles.left}>
                        <span className={`${styles.headerNav} nav`}>
                            {NAV_LINKS.map(({ to, label }, index) => (
                                <span key={to}>
                                    {index > 0 && ' | '}
                                    <NavLink to={to} className={activeClassName} onClick={scrollTop}>
                                        {label}
                                    </NavLink>
                                </span>
                            ))}
                        </span>
                    </div>
                </div>
                <div className={`${styles.info} info`}>
                    <button
                        type="button"
                        className={styles.settingsButton}
                        onClick={toggleSettings}
                        aria-label="Settings"
                    >
                        <img className="settings" src="/assets/images/cog.svg" alt="Settings" />
                    </button>
                </div>
            </div>
            {settings.showSettings && <Settings />}
        </header>
    );
}
