import { NavLink, useNavigate } from 'react-router-dom';
import { useSettings } from '../../hooks/useSettings';
import { SettingsPanel } from './SettingsPanel';
import styles from './Header.module.scss';

export function Header() {
  const { settings, toggleSettings } = useSettings();
  const navigate = useNavigate();

  const scrollTop = () => {
    window.scrollTo(0, 0);
  };

  return (
    <header>
      <div id="header" className={styles.header}>
        <NavLink className={styles['home-link']} to="/news/1" onClick={scrollTop}>
          <div className={styles['logo-inner']}></div>
          <img className={styles.logo} src="/assets/images/logo.svg" alt="Logo" />
        </NavLink>
        <div className={styles['header-text']}>
          <div className={styles.left}>
            <span className={styles['header-nav']}>
              <NavLink to="/newest/1" className={({ isActive }) => isActive ? styles.active : ''} onClick={() => { scrollTop(); navigate('/newest/1'); }}>new</NavLink>
                {' | '}
              <NavLink to="/show/1" className={({ isActive }) => isActive ? styles.active : ''} onClick={scrollTop}>show</NavLink>
                {' | '}
              <NavLink to="/ask/1" className={({ isActive }) => isActive ? styles.active : ''} onClick={scrollTop}>ask</NavLink>
                {' | '}
              <NavLink to="/jobs/1" className={({ isActive }) => isActive ? styles.active : ''} onClick={scrollTop}>jobs</NavLink>
            </span>
          </div>
        </div>
        <div className={styles.info}>
          <img className={styles.settings} src="/assets/images/cog.svg" alt="Settings" onClick={toggleSettings} />
        </div>
      </div>
      {settings.showSettings && <SettingsPanel />}
    </header>
  );
}
