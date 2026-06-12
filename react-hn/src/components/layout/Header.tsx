import { NavLink, useNavigate } from 'react-router-dom';
import { useSettings } from '../../context/useSettings';
import { SettingsPanel } from './SettingsPanel';
import '../../styles/Header.scss';

export function Header() {
  const { settings, toggleSettings } = useSettings();
  const navigate = useNavigate();

  const scrollTopAndNavigate = (path: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    window.scrollTo(0, 0);
    navigate(path);
  };

  return (
    <header>
      <div id="header">
        <a className="home-link" href="/news/1" onClick={scrollTopAndNavigate('/news/1')}>
          <div className="logo-inner"></div>
          <img className="logo" src="/assets/images/logo.svg" alt="Logo" />
        </a>
        <div className="header-text">
          <div className="left">
            <span className="header-nav">
              <NavLink to="/newest/1" onClick={() => window.scrollTo(0, 0)}>new</NavLink>
              {' | '}
              <NavLink to="/show/1" onClick={() => window.scrollTo(0, 0)}>show</NavLink>
              {' | '}
              <NavLink to="/ask/1" onClick={() => window.scrollTo(0, 0)}>ask</NavLink>
              {' | '}
              <NavLink to="/jobs/1" onClick={() => window.scrollTo(0, 0)}>jobs</NavLink>
            </span>
          </div>
        </div>
        <div className="info">
          <img className="settings" src="/assets/images/cog.svg" alt="Settings" onClick={toggleSettings} />
        </div>
      </div>
      {settings.showSettings && <SettingsPanel />}
    </header>
  );
}
