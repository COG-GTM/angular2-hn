import { Fragment } from 'react';
import { NavLink } from 'react-router-dom';
import { useSettings } from '../../settings/useSettings';
import { Settings } from '../Settings/Settings';
import './Header.scss';

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
  const { showSettings, toggleSettings } = useSettings();
  return (
    <header className="hn-header">
      <div id="header">
        <NavLink className="home-link" to="/news/1" onClick={scrollTop}>
          <div className="logo-inner"></div>
          <img className="logo" src="/assets/images/logo.svg" alt="Logo" />
        </NavLink>
        <div className="header-text">
          <div className="left">
            <span className="header-nav">
              {NAV_LINKS.map(({ to, label }, i) => (
                <Fragment key={to}>
                  {i > 0 && ' | '}
                  <NavLink to={to} onClick={scrollTop}>{label}</NavLink>
                </Fragment>
              ))}
            </span>
          </div>
        </div>
        <div className="info">
          <img className="settings" src="/assets/images/cog.svg" alt="Settings" onClick={toggleSettings} />
        </div>
      </div>
      {showSettings && <Settings />}
    </header>
  );
}
