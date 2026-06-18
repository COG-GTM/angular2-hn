import { NavLink } from 'react-router-dom';

import { useSettings } from '../../shared/context/SettingsContext';
import styles from '../../styles/Header.module.css';
import Settings from './Settings';

export default function Header() {
  const { settings, toggleSettings } = useSettings();

  return (
    <header>
      <div className={styles.header}>
        <NavLink
          to="/news/1"
          className={({ isActive }) =>
            isActive
              ? `${styles['home-link']} ${styles.active}`
              : styles['home-link']
          }
          onClick={() => window.scrollTo(0, 0)}
        >
          <div className={styles['logo-inner']}></div>
          <img className={styles.logo} src="/assets/images/logo.svg" alt="Logo" />
        </NavLink>
        <div className={styles['header-text']}>
          <div className={styles.left}>
            <span className={styles['header-nav']}>
              <NavLink
                to="/newest/1"
                className={({ isActive }) => (isActive ? styles.active : undefined)}
                onClick={() => window.scrollTo(0, 0)}
              >
                new
              </NavLink>
              {' | '}
              <NavLink
                to="/show/1"
                className={({ isActive }) => (isActive ? styles.active : undefined)}
                onClick={() => window.scrollTo(0, 0)}
              >
                show
              </NavLink>
              {' | '}
              <NavLink
                to="/ask/1"
                className={({ isActive }) => (isActive ? styles.active : undefined)}
                onClick={() => window.scrollTo(0, 0)}
              >
                ask
              </NavLink>
              {' | '}
              <NavLink
                to="/jobs/1"
                className={({ isActive }) => (isActive ? styles.active : undefined)}
                onClick={() => window.scrollTo(0, 0)}
              >
                jobs
              </NavLink>
            </span>
          </div>
        </div>
        <div className={styles.info}>
          <img
            src="/assets/images/cog.svg"
            alt="Settings"
            onClick={toggleSettings}
          />
        </div>
      </div>
      {settings.showSettings && <Settings />}
    </header>
  );
}
