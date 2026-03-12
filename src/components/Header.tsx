import { Link, useLocation } from 'react-router-dom';
import { useSettings } from '../context/SettingsContext';
import Settings from './Settings';
import styles from './Header.module.scss';

function scrollTop() {
  window.scrollTo(0, 0);
}

export default function Header() {
  const { settings, toggleSettings } = useSettings();
  const location = useLocation();

  const isActive = (path: string) => location.pathname.startsWith(path);

  return (
    <header>
      <div id="header">
        <Link className={styles.homeLink} to="/news/1" onClick={scrollTop}>
          <div className={`logo-inner ${styles.logoInner}`}></div>
          <img className={styles.logo} src="assets/images/logo.svg" alt="Logo" />
        </Link>
        <div className={styles.headerText}>
          <div className={styles.left}>
            <span className={styles.headerNav}>
              <Link to="/newest/1" className={isActive('/newest') ? styles.active : ''} onClick={scrollTop}>new</Link>
                {' | '}
              <Link to="/show/1" className={isActive('/show') ? styles.active : ''} onClick={scrollTop}>show</Link>
                {' | '}
              <Link to="/ask/1" className={isActive('/ask') ? styles.active : ''} onClick={scrollTop}>ask</Link>
                {' | '}
              <Link to="/jobs/1" className={isActive('/jobs') ? styles.active : ''} onClick={scrollTop}>jobs</Link>
            </span>
          </div>
        </div>
        <div className={styles.info}>
          <img className="settings" src="assets/images/cog.svg" alt="Settings" onClick={toggleSettings} />
        </div>
      </div>
      {settings.showSettings && <Settings />}
    </header>
  );
}
