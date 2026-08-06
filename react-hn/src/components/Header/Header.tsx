import React from 'react';
import { NavLink } from 'react-router-dom';

import { useSettings } from '../../contexts/SettingsContext';
import Settings from '../Settings/Settings';

import styles from './Header.module.scss';

const scrollTop = () => window.scrollTo(0, 0);

const navLinkClass = ({ isActive }: { isActive: boolean }) => (isActive ? 'active' : '');

const Header: React.FC = () => {
  const { settings, toggleSettings } = useSettings();

  return (
    <header>
      <div className={styles.host}>
        <div id="header">
          <NavLink className={({ isActive }) => `home-link${isActive ? ' active' : ''}`} to="/news/1" onClick={scrollTop}>
            <div className="logo-inner" />
            <img className="logo" src="/assets/images/logo.svg" alt="Logo" />
          </NavLink>
          <div className="header-text">
            <div className="left">
              <span className="header-nav">
                <NavLink to="/newest/1" className={navLinkClass} onClick={scrollTop}>new</NavLink>
                {' | '}
                <NavLink to="/show/1" className={navLinkClass} onClick={scrollTop}>show</NavLink>
                {' | '}
                <NavLink to="/ask/1" className={navLinkClass} onClick={scrollTop}>ask</NavLink>
                {' | '}
                <NavLink to="/jobs/1" className={navLinkClass} onClick={scrollTop}>jobs</NavLink>
              </span>
            </div>
          </div>
          <div className="info">
            <img className="settings" src="/assets/images/cog.svg" alt="Settings" onClick={toggleSettings} />
          </div>
        </div>
      </div>
      {settings.showSettings && <Settings />}
    </header>
  );
};

export default Header;
