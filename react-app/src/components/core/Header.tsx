import { Fragment } from 'react';
import { NavLink, useLocation } from 'react-router-dom';

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

function scrollTop() {
  window.scrollTo(0, 0);
}

/** Port of src/app/core/header. */
export default function Header() {
  const { settings, toggleSettings } = useSettings();
  const feed = useLocation().pathname.split('/')[1];
  // Like routerLinkActive in Angular, a link is active for any page of its feed.
  const activeFor = (feedType: FeedType) => (feed === feedType ? 'active' : '');

  return (
    <header>
      <div id="header">
        <NavLink to="/news/1" className={() => `home-link ${activeFor('news')}`.trim()} onClick={scrollTop}>
          <div className="logo-inner"></div>
          <img className="logo" src="/assets/images/logo.svg" alt="Logo" />
        </NavLink>
        <div className="header-text">
          <div className="left">
            <span className="header-nav">
              {NAV_FEEDS.map(({ feedType, label }, i) => (
                <Fragment key={feedType}>
                  {i > 0 && ' | '}
                  <NavLink to={`/${feedType}/1`} className={() => activeFor(feedType)} onClick={scrollTop}>
                    {label}
                  </NavLink>
                </Fragment>
              ))}
            </span>
          </div>
        </div>
        <div className="info">
          <img className="settings" src="/assets/images/cog.svg" alt="Settings" onClick={toggleSettings} />
        </div>
      </div>
      {settings.showSettings && <Settings />}
    </header>
  );
}
