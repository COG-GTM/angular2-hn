import { NavLink } from 'react-router-dom';

import { useSettings } from '../../shared/context/useSettings';
import { Settings } from '../settings/Settings';
import './Header.scss';

const FEED_LINKS = [
  { to: '/newest/1', label: 'new' },
  { to: '/show/1', label: 'show' },
  { to: '/ask/1', label: 'ask' },
  { to: '/jobs/1', label: 'jobs' },
];

const activeClassName = ({ isActive }: { isActive: boolean }) => (isActive ? 'active' : undefined);

function scrollTop() {
  window.scrollTo(0, 0);
}

export function Header() {
  const { settings, toggleSettings } = useSettings();

  return (
    <header className="header-view">
      <div id="header">
        <NavLink
          className={({ isActive }) => `home-link${isActive ? ' active' : ''}`}
          to="/news/1"
          onClick={scrollTop}
        >
          <div className="logo-inner"></div>
          <img className="logo" src="assets/images/logo.svg" alt="Logo" />
        </NavLink>
        <div className="header-text">
          <div className="left">
            <span className="header-nav">
              {FEED_LINKS.map((link, index) => (
                <span key={link.to}>
                  {index > 0 && ' | '}
                  <NavLink className={activeClassName} to={link.to} onClick={scrollTop}>
                    {link.label}
                  </NavLink>
                </span>
              ))}
            </span>
          </div>
        </div>
        <div className="info">
          <img className="settings" src="assets/images/cog.svg" alt="Settings" onClick={toggleSettings} />
        </div>
      </div>
      {settings.showSettings && <Settings />}
    </header>
  );
}
