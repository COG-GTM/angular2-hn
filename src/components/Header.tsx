import { Link, NavLink } from 'react-router-dom';

import { useSettings } from '../context/SettingsContext';
import Settings from './Settings';
import '../styles/header.scss';

const scrollTop = () => window.scrollTo(0, 0);

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  isActive ? 'active' : undefined;

export default function Header() {
  const { settings, toggleSettings } = useSettings();

  return (
    <header>
      <div id="header">
        <Link className="home-link" to="/news/1" onClick={scrollTop}>
          <div className="logo-inner"></div>
          <img className="logo" src="/assets/images/logo.svg" alt="Logo" />
        </Link>
        <div className="header-text">
          <div className="left">
            <span className="header-nav">
              <NavLink to="/newest/1" className={navLinkClass} onClick={scrollTop}>
                new
              </NavLink>
              {' '}|{' '}
              <NavLink to="/show/1" className={navLinkClass} onClick={scrollTop}>
                show
              </NavLink>
              {' '}|{' '}
              <NavLink to="/ask/1" className={navLinkClass} onClick={scrollTop}>
                ask
              </NavLink>
              {' '}|{' '}
              <NavLink to="/jobs/1" className={navLinkClass} onClick={scrollTop}>
                jobs
              </NavLink>
            </span>
          </div>
        </div>
        <div className="info">
          <img
            className="settings"
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
