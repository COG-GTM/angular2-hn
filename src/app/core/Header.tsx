import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useSettings } from '../shared/context/SettingsContext';
import Settings from './Settings';
import './header/header.component.scss';

const Header: React.FC = () => {
    const { settings, toggleSettings } = useSettings();

    const scrollTop = () => {
        window.scrollTo(0, 0);
    };

    const navigate = useNavigate();

    const handleHomeClick = (e: React.MouseEvent) => {
        e.preventDefault();
        scrollTop();
        navigate('/news/1');
    };

    return (
        <header>
            <div id="header">
                <a className="home-link" href="/news/1" onClick={handleHomeClick}>
                    <div className="logo-inner"></div>
                    <img className="logo" src="/assets/images/logo.svg" alt="Logo" />
                </a>
                <div className="header-text">
                    <div className="left">
                        <span className="header-nav">
                            <NavLink to="/newest/1" className={({ isActive }) => (isActive ? 'active' : '')} onClick={scrollTop}>
                                new
                            </NavLink>
                            {' | '}
                            <NavLink to="/show/1" className={({ isActive }) => (isActive ? 'active' : '')} onClick={scrollTop}>
                                show
                            </NavLink>
                            {' | '}
                            <NavLink to="/ask/1" className={({ isActive }) => (isActive ? 'active' : '')} onClick={scrollTop}>
                                ask
                            </NavLink>
                            {' | '}
                            <NavLink to="/jobs/1" className={({ isActive }) => (isActive ? 'active' : '')} onClick={scrollTop}>
                                jobs
                            </NavLink>
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
};

export default Header;
