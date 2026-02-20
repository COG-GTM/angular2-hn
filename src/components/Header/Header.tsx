import { NavLink, useNavigate } from 'react-router-dom';
import { useSettings } from '../../contexts/SettingsContext';
import SettingsPanel from '../Settings/Settings';
import logoSvg from '../../assets/images/logo.svg';
import cogSvg from '../../assets/images/cog.svg';
import './Header.scss';

function Header() {
  const { settings, toggleSettings } = useSettings();
  const navigate = useNavigate();

  const scrollTopAndNavigate = (path: string) => {
    navigate(path);
    window.scrollTo(0, 0);
  };

  return (
    <header>
      <div className="header">
        <a className="home-link" onClick={() => scrollTopAndNavigate('/news/1')}>
          <div className="logo-inner"></div>
          <img className="logo" src={logoSvg} alt="Logo" />
        </a>
        <div className="header-text">
          <div className="left">
            <span className="header-nav">
              <NavLink to="/newest/1" onClick={() => window.scrollTo(0, 0)}>new</NavLink>
                |
              <NavLink to="/show/1" onClick={() => window.scrollTo(0, 0)}>show</NavLink>
                |
              <NavLink to="/ask/1" onClick={() => window.scrollTo(0, 0)}>ask</NavLink>
                |
              <NavLink to="/jobs/1" onClick={() => window.scrollTo(0, 0)}>jobs</NavLink>
            </span>
          </div>
        </div>
        <div className="info">
          <img className="settings-icon" src={cogSvg} alt="Settings" onClick={toggleSettings} />
        </div>
      </div>
      {settings.showSettings && <SettingsPanel />}
    </header>
  );
}

export default Header;
