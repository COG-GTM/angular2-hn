import { Fragment } from 'react';
import { NavLink } from 'react-router';
import { useSettings } from '../hooks/useSettings';
import { Settings } from './Settings';
import './Header.css';

const NAV_LINKS = [
  { to: '/newest', label: 'new' },
  { to: '/show', label: 'show' },
  { to: '/ask', label: 'ask' },
  { to: '/jobs', label: 'jobs' },
] as const;

function scrollTop() {
  window.scrollTo(0, 0);
}

export function Header() {
  const { settings, toggleSettings } = useSettings();

  return (
    <header>
      <div id="header">
        <NavLink className="home-link" to="/news" onClick={scrollTop} aria-label="Home">
          <div className="logo-inner" />
          <img className="logo" src="/assets/images/logo.svg" alt="Logo" />
        </NavLink>
        <div className="header-text">
          <div className="left">
            <nav className="header-nav">
              {NAV_LINKS.map(({ to, label }, i) => (
                <Fragment key={to}>
                  {i > 0 && ' | '}
                  <NavLink to={to} onClick={scrollTop}>
                    {label}
                  </NavLink>
                </Fragment>
              ))}
            </nav>
          </div>
        </div>
        <div className="info">
          <button type="button" onClick={toggleSettings} aria-label="Settings" aria-expanded={settings.showSettings}>
            <img className="settings" src="/assets/images/cog.svg" alt="" />
          </button>
        </div>
      </div>
      {settings.showSettings && <Settings />}
    </header>
  );
}
