import React, { useCallback } from 'react';
import { NavLink } from 'react-router-dom';
import { useSettings } from '../../../contexts/SettingsContext';
import { Settings } from '../Settings';
import './Header.css';

export const Header: React.FC = () => {
  const { settings, toggleSettings } = useSettings();

  const scrollTop = useCallback(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleNavClick = useCallback(() => {
    scrollTop();
  }, [scrollTop]);

  const handleSettingsClick = useCallback(() => {
    toggleSettings();
  }, [toggleSettings]);

  return (
    <header>
      <div id="header">
        <NavLink className="home-link" to="/news/1" onClick={handleNavClick}>
          <div className="logo-inner"></div>
          <img className="logo" src="/assets/images/logo.svg" alt="Logo" />
        </NavLink>
        <div className="header-text">
          <div className="left">
            <span className="header-nav">
              <NavLink to="/newest/1" onClick={handleNavClick}>
                new
              </NavLink>
              {' | '}
              <NavLink to="/show/1" onClick={handleNavClick}>
                show
              </NavLink>
              {' | '}
              <NavLink to="/ask/1" onClick={handleNavClick}>
                ask
              </NavLink>
              {' | '}
              <NavLink to="/jobs/1" onClick={handleNavClick}>
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
            onClick={handleSettingsClick}
          />
        </div>
      </div>
      {settings.showSettings && <Settings />}
    </header>
  );
};

export default Header;
