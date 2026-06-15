import { Link, NavLink } from 'react-router-dom';
import { useSettings } from '../contexts/SettingsContext';
import { Settings } from './Settings';
import styles from './Header.module.scss';

function scrollTop() {
    window.scrollTo(0, 0);
}

export function Header() {
    const settings = useSettings();

    return (
        <header>
            <div id="header" className={styles.header}>
                <Link className={styles['home-link']} to="/news/1" onClick={scrollTop}>
                    <div className={`logo-inner ${styles['logo-inner']}`}></div>
                    <img className={styles.logo} src="assets/images/logo.svg" alt="Logo" />
                </Link>
                <div className={styles['header-text']}>
                    <div className={styles.left}>
                        <span className={styles['header-nav']}>
                            <NavLink to="/newest/1" onClick={scrollTop}>new</NavLink>
                              |
                            <NavLink to="/show/1" onClick={scrollTop}>show</NavLink>
                              |
                            <NavLink to="/ask/1" onClick={scrollTop}>ask</NavLink>
                              |
                            <NavLink to="/jobs/1" onClick={scrollTop}>jobs</NavLink>
                        </span>
                    </div>
                </div>
                <div className={styles.info}>
                    <img
                        className={styles.settings}
                        src="assets/images/cog.svg"
                        alt="Settings"
                        onClick={settings.toggleSettings}
                    />
                </div>
            </div>
            {settings.showSettings && <Settings />}
        </header>
    );
}
