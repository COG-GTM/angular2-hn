import { NavLink } from 'react-router-dom';
import { useSettings } from '../context/SettingsContext';
import Settings from './Settings';
import './Header.scss';

const activeClass = ({ isActive }: { isActive: boolean }) => (isActive ? 'active' : undefined);

export default function Header() {
  const { settings, toggleSettings } = useSettings();

  const scrollTop = () => window.scrollTo(0, 0);

  return (
    <header>
      <div id="header">
        <NavLink className={(props) => `home-link ${activeClass(props) ?? ''}`} to="/news/1" onClick={scrollTop}>
          <div className="logo-inner"></div>
          <img className="logo" src="assets/images/logo.svg" alt="Logo" />
        </NavLink>
        <div className="header-text">
          <div className="left">
            <span className="header-nav">
              <NavLink className={activeClass} to="/newest/1" onClick={scrollTop}>
                new
              </NavLink>
              {' | '}
              <NavLink className={activeClass} to="/show/1" onClick={scrollTop}>
                show
              </NavLink>
              {' | '}
              <NavLink className={activeClass} to="/ask/1" onClick={scrollTop}>
                ask
              </NavLink>
              {' | '}
              <NavLink className={activeClass} to="/jobs/1" onClick={scrollTop}>
                jobs
              </NavLink>
            </span>
          </div>
        </div>
        <div className="info">
          <img className="settings" src="assets/images/cog.svg" alt="Settings" onClick={toggleSettings} />
        </div>
      </div>
      {settings.showSettings && <Settings />}
    </header>
  );
}
