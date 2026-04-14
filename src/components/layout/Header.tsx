import { NavLink } from 'react-router-dom';
import { useSettings } from '../../context/SettingsContext';
import './Header.scss';

export default function Header() {
  const { dispatch } = useSettings();

  const scrollTop = () => {
    window.scrollTo(0, 0);
  };

  const toggleSettings = () => {
    dispatch({ type: 'TOGGLE_SETTINGS' });
  };

  return (
    <header className="header">
      <div className="header-container">
        <NavLink to="/news/1" className="logo" onClick={scrollTop}>
          <span className="header-logo">HN</span>
        </NavLink>
        <nav className="header-nav">
          <NavLink
            to="/news/1"
            className={({ isActive }) => isActive ? 'header-nav-item active' : 'header-nav-item'}
            onClick={scrollTop}
          >
            new
          </NavLink>
          <NavLink
            to="/show/1"
            className={({ isActive }) => isActive ? 'header-nav-item active' : 'header-nav-item'}
            onClick={scrollTop}
          >
            show
          </NavLink>
          <NavLink
            to="/ask/1"
            className={({ isActive }) => isActive ? 'header-nav-item active' : 'header-nav-item'}
            onClick={scrollTop}
          >
            ask
          </NavLink>
          <NavLink
            to="/jobs/1"
            className={({ isActive }) => isActive ? 'header-nav-item active' : 'header-nav-item'}
            onClick={scrollTop}
          >
            jobs
          </NavLink>
        </nav>
        <button className="settings-icon" onClick={toggleSettings} aria-label="Settings">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3"></circle>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
          </svg>
        </button>
      </div>
    </header>
  );
}
