import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSettings } from '../contexts/SettingsContext';
import Settings from './Settings';
import '../styles/Header.scss';

export const Header: React.FC = () => {
  const { settings, toggleSettings } = useSettings();
  const location = useLocation();

  const scrollTop = () => {
    window.scrollTo(0, 0);
  };

  const isActive = (path: string) => {
    return location.pathname.startsWith(path);
  };

  return (
    <header>
      <div id="header">
        <Link className="home-link" to="/news/1" onClick={scrollTop}>
          <div className="logo-inner"></div>
          <img className="logo" src="/logo.svg" alt="Logo" />
        </Link>
        <div className="header-text">
          <div className="left">
            <span className="header-nav">
              <Link
                to="/newest/1"
                className={isActive('/newest') ? 'active' : ''}
                onClick={scrollTop}
              >
                new
              </Link>
              {' | '}
              <Link
                to="/show/1"
                className={isActive('/show') ? 'active' : ''}
                onClick={scrollTop}
              >
                show
              </Link>
              {' | '}
              <Link
                to="/ask/1"
                className={isActive('/ask') ? 'active' : ''}
                onClick={scrollTop}
              >
                ask
              </Link>
              {' | '}
              <Link
                to="/jobs/1"
                className={isActive('/jobs') ? 'active' : ''}
                onClick={scrollTop}
              >
                jobs
              </Link>
            </span>
          </div>
        </div>
        <div className="info">
          <img
            className="settings"
            src="/cog.svg"
            alt="Settings"
            onClick={toggleSettings}
          />
        </div>
      </div>
      {settings.showSettings && <Settings />}
    </header>
  );
};

export default Header;
