import { Link, NavLink } from 'react-router-dom';
import { useSettings } from '../context/SettingsContext';
import { SettingsPanel } from './SettingsPanel';

export function Header() {
  const { settings, toggleSettings } = useSettings();
  const scrollTop = () => window.scrollTo(0, 0);
  return (
    <header>
      <div id="header">
        <Link className="home-link" to="/news/1" onClick={scrollTop}><div className="logo-inner" /><img className="logo" src="/assets/images/logo.svg" alt="Logo" /></Link>
        <div className="header-text"><div className="left"><span className="header-nav">
          {[
            ['/newest/1', 'new'],
            ['/show/1', 'show'],
            ['/ask/1', 'ask'],
            ['/jobs/1', 'jobs']
          ].map(([to, label], index) => <span key={to}><NavLink to={to} onClick={scrollTop}>{label}</NavLink>{index < 3 ? ' | ' : ''}</span>)}
        </span></div></div>
        <div className="info"><button className="settings-button" onClick={toggleSettings} aria-label="Settings"><img className="settings" src="/assets/images/cog.svg" alt="Settings" /></button></div>
      </div>
      {settings.showSettings && <SettingsPanel />}
    </header>
  );
}
