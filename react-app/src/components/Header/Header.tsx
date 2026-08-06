import { Link, useLocation } from 'react-router-dom';

import { useSettings } from '../../context/SettingsContext';
import Settings from '../Settings/Settings';
import './Header.scss';

function Header() {
  const { settings, toggleSettings } = useSettings();
  const location = useLocation();

  const scrollTop = () => {
    window.scrollTo(0, 0);
  };

  const sectionClass = (feedType: string, baseClass = '') => {
    const isActive =
      location.pathname === `/${feedType}` ||
      location.pathname.startsWith(`/${feedType}/`);
    return [baseClass, isActive ? 'active' : ''].filter(Boolean).join(' ');
  };

  return (
    <header>
      <div id="header">
        <Link className={sectionClass('news', 'home-link')} to="/news/1" onClick={scrollTop}>
          <div className="logo-inner"></div>
          <img className="logo" src="assets/images/logo.svg" alt="Logo" />
        </Link>
        <div className="header-text">
          <div className="left">
            <span className="header-nav">
              <Link className={sectionClass('newest')} to="/newest/1" onClick={scrollTop}>
                new
              </Link>
              |
              <Link className={sectionClass('show')} to="/show/1" onClick={scrollTop}>
                show
              </Link>
              |
              <Link className={sectionClass('ask')} to="/ask/1" onClick={scrollTop}>
                ask
              </Link>
              |
              <Link className={sectionClass('jobs')} to="/jobs/1" onClick={scrollTop}>
                jobs
              </Link>
            </span>
          </div>
        </div>
        <div className="info">
          <img
            className="settings"
            src="assets/images/cog.svg"
            alt="Settings"
            onClick={toggleSettings}
          />
        </div>
      </div>
      {settings.showSettings && <Settings />}
    </header>
  );
}

export default Header;
