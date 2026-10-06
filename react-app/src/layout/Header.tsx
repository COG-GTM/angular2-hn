// Ported from src/app/core/header
import { Link, NavLink } from 'react-router-dom';
import { useSettings } from '../settings/SettingsContext';
import { Settings } from './Settings';
import './Header.scss';

const NAV_FEEDS = [
  { to: '/newest/1', label: 'new' },
  { to: '/show/1', label: 'show' },
  { to: '/ask/1', label: 'ask' },
  { to: '/jobs/1', label: 'jobs' },
];

const scrollTop = () => window.scrollTo(0, 0);

export function Header() {
  const { settings, toggleSettings } = useSettings();
  return (
    <header>
      <div id="header">
        <Link className="home-link" to="/news/1" onClick={scrollTop} aria-label="Hacker News home">
          <div className="logo-inner"></div>
          <img className="logo" src="/assets/images/logo.svg" alt="Logo" />
        </Link>
        <div className="header-text">
          <div className="left">
            <nav className="header-nav">
              {NAV_FEEDS.map((feed, i) => (
                <span key={feed.to}>
                  {i > 0 && ' | '}
                  <NavLink to={feed.to} onClick={scrollTop} end={false}>
                    {feed.label}
                  </NavLink>
                </span>
              ))}
            </nav>
          </div>
        </div>
        <div className="info">
          <button type="button" className="settings-button" onClick={toggleSettings} aria-label="Settings">
            <img className="settings" src="/assets/images/cog.svg" alt="Settings" />
          </button>
        </div>
      </div>
      {settings.showSettings && <Settings />}
    </header>
  );
}
