import { Link, NavLink } from 'react-router-dom';
import { useSettings } from '../contexts/SettingsContext';
import Settings from './Settings';
import '../styles/header.scss';

const scrollTop = () => window.scrollTo(0, 0);

export default function Header() {
    const { settings, toggleSettings } = useSettings();
    const link = (to: string, label: string) => <><NavLink to={to} onClick={scrollTop}>{label}</NavLink>{label !== 'jobs' && ' | '}</>;
    return (
        <header>
            <div id="header">
                <Link className="home-link" to="/news/1" onClick={scrollTop}><div className="logo-inner" /><img className="logo" src="/assets/images/logo.svg" alt="Logo" /></Link>
                <div className="header-text"><div className="left"><span className="header-nav">{link('/newest/1', 'new')}{link('/show/1', 'show')}{link('/ask/1', 'ask')}{link('/jobs/1', 'jobs')}</span></div></div>
                <div className="info"><button type="button" className="settings-button" onClick={toggleSettings}><img className="settings" src="/assets/images/cog.svg" alt="Settings" /></button></div>
            </div>
            {settings.showSettings && <Settings />}
        </header>
    );
}
