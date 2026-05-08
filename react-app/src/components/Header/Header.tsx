import { NavLink } from 'react-router-dom';
import { useSettings } from '../../contexts/SettingsContext';
import { Settings } from '../Settings/Settings';
import './Header.scss';

export function Header() {
  const { settings, toggleSettings } = useSettings();

  const scrollTop = () => {
    window.scrollTo(0, 0);
  };

  return (
    <div id="header">
      <NavLink to="/news/1" className="home-link" onClick={scrollTop}>
        <div className="logo-inner"></div>
        <img className="logo" src="/assets/images/logo.svg" alt="logo" />
      </NavLink>
      <div className="left">
        <h1>
          <NavLink to="/news/1" className="name" onClick={scrollTop}>
            Angular 2 HN
          </NavLink>
        </h1>
        <span className="header-nav">
          <NavLink to="/newest/1" className={({ isActive }) => isActive ? 'active' : ''}>
            new
          </NavLink>
          <span className="divider-pipe"> | </span>
          <NavLink to="/show/1" className={({ isActive }) => isActive ? 'active' : ''}>
            show
          </NavLink>
          <span className="divider-pipe"> | </span>
          <NavLink to="/ask/1" className={({ isActive }) => isActive ? 'active' : ''}>
            ask
          </NavLink>
          <span className="divider-pipe"> | </span>
          <NavLink to="/jobs/1" className={({ isActive }) => isActive ? 'active' : ''}>
            jobs
          </NavLink>
        </span>
      </div>
      <span className="info">
        <img
          className="settings"
          src="/assets/images/cog.svg"
          alt="settings"
          onClick={toggleSettings}
        />
      </span>
      {settings.showSettings && <Settings />}
    </div>
  );
}
