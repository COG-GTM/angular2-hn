import { Fragment } from 'react';
import { NavLink } from 'react-router-dom';

import type { FeedType } from '../../models';
import { useSettings } from '../../settings';
import Settings from './Settings';
import './Header.scss';

const NAV_FEEDS: { feedType: FeedType; label: string }[] = [
  { feedType: 'newest', label: 'new' },
  { feedType: 'show', label: 'show' },
  { feedType: 'ask', label: 'ask' },
  { feedType: 'jobs', label: 'jobs' },
];

// Like routerLinkActive, a link is active only on its exact page-1 path.
const activeClass = ({ isActive }: { isActive: boolean }) => (isActive ? 'active' : '');

function scrollTop() {
  window.scrollTo(0, 0);
}

/** Port of src/app/core/header. */
export default function Header() {
  const { settings, toggleSettings } = useSettings();

  return (
    <header>
      <div id="header">
        <NavLink to="/news/1" end className={(s) => `home-link ${activeClass(s)}`.trim()} onClick={scrollTop}>
          <div className="logo-inner"></div>
          <img className="logo" src="/assets/images/logo.svg" alt="Logo" />
        </NavLink>
        <div className="header-text">
          <div className="left">
            <span className="header-nav">
              {NAV_FEEDS.map(({ feedType, label }, i) => (
                <Fragment key={feedType}>
                  {i > 0 && ' | '}
                  <NavLink to={`/${feedType}/1`} end className={activeClass} onClick={scrollTop}>
                    {label}
                  </NavLink>
                </Fragment>
              ))}
            </span>
          </div>
        </div>
        <div className="info">
          <img
            className="settings"
            src="/assets/images/cog.svg"
            alt="Settings"
            role="button"
            tabIndex={0}
            onClick={toggleSettings}
            onKeyDown={(e) => ['Enter', ' '].includes(e.key) && (e.preventDefault(), toggleSettings())}
          />
        </div>
      </div>
      {settings.showSettings && <Settings />}
    </header>
  );
}
