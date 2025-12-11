import { Link, useLocation } from 'react-router-dom';
import { useSettings } from '../../context';
import { Settings } from './Settings';
import './Header.scss';

export function Header() {
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
        <Link
          to="/news/1"
          className={`home-link ${isActive('/news') ? 'active' : ''}`}
          onClick={scrollTop}
        >
          <div className="logo-inner"></div>
          <img className="logo" src="/assets/images/logo.svg" alt="Logo" />
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
              <Link to="/show/1" className={isActive('/show') ? 'active' : ''} onClick={scrollTop}>
                show
              </Link>
              {' | '}
              <Link to="/ask/1" className={isActive('/ask') ? 'active' : ''} onClick={scrollTop}>
                ask
              </Link>
              {' | '}
              <Link to="/jobs/1" className={isActive('/jobs') ? 'active' : ''} onClick={scrollTop}>
                jobs
              </Link>
            </span>
          </div>
        </div>
        <div className="info">
          <img
            className="settings"
            src="/assets/images/cog.svg"
            alt="Settings"
            onClick={toggleSettings}
          />
        </div>
      </div>
      {settings.showSettings && <Settings />}
    </header>
  );
}
