// Ported from src/app/core/header
import { Link, useLocation } from 'react-router-dom';
import { useSettings } from '../settings/SettingsContext';
import { Settings } from './Settings';
import './Header.scss';

const NAV_FEEDS = [
  { feed: 'newest', label: 'new' },
  { feed: 'show', label: 'show' },
  { feed: 'ask', label: 'ask' },
  { feed: 'jobs', label: 'jobs' },
];

const scrollTop = () => window.scrollTo(0, 0);

export function Header() {
  const { settings, toggleSettings } = useSettings();
  const currentFeed = useLocation().pathname.split('/')[1];
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
              {NAV_FEEDS.map(({ feed, label }, i) => {
                const active = feed === currentFeed;
                return (
                  <span key={feed}>
                    {i > 0 && ' | '}
                    <Link
                      to={`/${feed}/1`}
                      onClick={scrollTop}
                      className={active ? 'active' : undefined}
                      aria-current={active ? 'page' : undefined}
                    >
                      {label}
                    </Link>
                  </span>
                );
              })}
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
