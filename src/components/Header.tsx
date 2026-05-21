import { Link, NavLink } from 'react-router-dom';
import { useSettings } from '@/contexts/SettingsContext';
import { Settings } from './Settings';
import styles from './Header.module.scss';

export function Header() {
  const { settings, toggleSettings } = useSettings();

  const scrollTop = () => window.scrollTo(0, 0);

  return (
    <header>
      <div id="header">
        <Link to="/news/1" className={styles.homeLink} onClick={scrollTop}>
          <div className="logo-inner" />
          <img className={styles.logo} src="/assets/images/logo.svg" alt="Logo" />
        </Link>
        <div className={styles.headerText}>
          <div className={styles.left}>
            <span className={styles.headerNav}>
              <NavLink to="/newest/1" onClick={scrollTop}>
                new
              </NavLink>
              {' | '}
              <NavLink to="/show/1" onClick={scrollTop}>
                show
              </NavLink>
              {' | '}
              <NavLink to="/ask/1" onClick={scrollTop}>
                ask
              </NavLink>
              {' | '}
              <NavLink to="/jobs/1" onClick={scrollTop}>
                jobs
              </NavLink>
            </span>
          </div>
        </div>
        <div className={styles.info}>
          <img
            className={styles.settingsIcon}
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
