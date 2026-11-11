import { NavLink } from 'react-router';
import { useSettings } from '../../settings';
import { Settings } from '../Settings/Settings';
import './Header.scss';

export function Header() {
  const { settings, toggleSettings } = useSettings();
  const scrollTop = () => window.scrollTo(0, 0);
  return <header className="app-header">
    <div id="header">
      <NavLink className={({ isActive }) => `home-link${isActive ? ' active' : ''}`} to="/news/1" onClick={scrollTop}>
        <div className="logo-inner" />
        <img className="logo" src="/assets/images/logo.svg" alt="Logo" />
      </NavLink>
      <div className="header-text"><div className="left"><span className="header-nav">
        <NavLink to="/newest/1" onClick={scrollTop}>new</NavLink> |{' '}
        <NavLink to="/show/1" onClick={scrollTop}>show</NavLink> |{' '}
        <NavLink to="/ask/1" onClick={scrollTop}>ask</NavLink> |{' '}
        <NavLink to="/jobs/1" onClick={scrollTop}>jobs</NavLink>
      </span></div></div>
      <div className="info">
        <img className="settings" src="/assets/images/cog.svg" alt="Settings" role="button" tabIndex={0}
          aria-expanded={settings.showSettings} aria-controls="popup1" onClick={toggleSettings}
          onKeyDown={event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); toggleSettings(); } }} />
      </div>
    </div>
    {settings.showSettings && <Settings />}
  </header>;
}
