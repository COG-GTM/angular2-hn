import React from 'react';
import { NavLink } from 'react-router-dom';
import { useSettings } from '../context/SettingsContext';
import Settings from './Settings';
import './Header.scss';

const Header: React.FC = () => {
  const { settings, toggleSettings } = useSettings();

  const scrollTop = () => {
    window.scrollTo(0, 0);
  };

  return (
    <header>
      <div id="header">
        <NavLink className="home-link" to="/news/1" onClick={scrollTop}>
          <div className="logo-inner"></div>
          <img className="logo" src={process.env.PUBLIC_URL + '/assets/images/logo.svg'} alt="Logo" />
        </NavLink>
        <div className="header-text">
          <div className="left">
            <span className="header-nav">
              <NavLink to="/newest/1" onClick={scrollTop}>new</NavLink>
                |
              <NavLink to="/show/1" onClick={scrollTop}>show</NavLink>
                |
              <NavLink to="/ask/1" onClick={scrollTop}>ask</NavLink>
                |
              <NavLink to="/jobs/1" onClick={scrollTop}>jobs</NavLink>
            </span>
          </div>
        </div>
        <div className="info">
          <img
            className="settings"
            src={process.env.PUBLIC_URL + '/assets/images/cog.svg'}
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
