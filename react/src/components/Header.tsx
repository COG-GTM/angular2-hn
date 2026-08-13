import { Link, useLocation } from 'react-router-dom';

import { useSettings } from '../context/SettingsContext';
import { Settings } from './Settings';

const NAV_LINKS: { feed: string; label: string }[] = [
  { feed: 'newest', label: 'new' },
  { feed: 'show', label: 'show' },
  { feed: 'ask', label: 'ask' },
  { feed: 'jobs', label: 'jobs' },
];

function scrollTop() {
  window.scrollTo(0, 0);
}

export function Header() {
  const { settings, toggleSettings } = useSettings();
  const location = useLocation();
  const currentFeed = location.pathname.split('/')[1];

  return (
    <header>
      <div id="header">
        <Link className={currentFeed === 'news' ? 'home-link active' : 'home-link'} to="/news/1" onClick={scrollTop}>
          <div className="logo-inner"></div>
          <img className="logo" src="/images/logo.svg" alt="Logo" />
        </Link>
        <div className="header-text">
          <div className="left">
            <span className="header-nav">
              {NAV_LINKS.map(({ feed, label }, index) => (
                <span key={feed}>
                  {index > 0 ? ' | ' : null}
                  <Link className={currentFeed === feed ? 'active' : undefined} to={`/${feed}/1`} onClick={scrollTop}>
                    {label}
                  </Link>
                </span>
              ))}
            </span>
          </div>
        </div>
        <div className="info">
          <img
            className="settings"
            src="/images/cog.svg"
            alt="Settings"
            role="button"
            tabIndex={0}
            onClick={toggleSettings}
          />
        </div>
      </div>
      {settings.showSettings ? <Settings /> : null}
    </header>
  );
}
