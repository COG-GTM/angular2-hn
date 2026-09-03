import { NavLink } from 'react-router-dom';

import { useSettings } from '../../context/SettingsContext';
import { Settings } from './Settings';
import styles from './Header.module.scss';

const NAV_LINKS = [
    { to: '/newest/1', label: 'new' },
    { to: '/show/1', label: 'show' },
    { to: '/ask/1', label: 'ask' },
    { to: '/jobs/1', label: 'jobs' },
];

function scrollTop() {
    window.scrollTo(0, 0);
}

export function Header() {
    const { settings, toggleSettings } = useSettings();

    return (
        <header>
            <div id="header" className={styles.header}>
                <NavLink to="/news/1" className={styles.homeLink} onClick={scrollTop}>
                    <div className={`logo-inner ${styles.logoInner}`}></div>
                    <img className={styles.logo} src="/assets/images/logo.svg" alt="Logo" />
                </NavLink>
                <div className={styles.headerText}>
                    <div className={styles.left}>
                        <span className={`nav ${styles.headerNav}`}>
                            {NAV_LINKS.map((link, index) => (
                                <span key={link.to}>
                                    {index > 0 && ' | '}
                                    <NavLink to={link.to} onClick={scrollTop}>
                                        {link.label}
                                    </NavLink>
                                </span>
                            ))}
                        </span>
                    </div>
                </div>
                <div className={styles.info}>
                    <img
                        src="/assets/images/cog.svg"
                        alt="Settings"
                        role="button"
                        tabIndex={0}
                        onClick={toggleSettings}
                    />
                </div>
            </div>
            {settings.showSettings && <Settings />}
        </header>
    );
}
