import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import './Header.scss';

const Header: React.FC = () => {
    const [showSettings, setShowSettings] = useState(false);

    const scrollTop = () => {
        window.scrollTo(0, 0);
    };

    const toggleSettings = () => {
        setShowSettings((prev) => !prev);
    };

    return (
        <header>
            <div id="header">
                <NavLink className="home-link" to="/news/1" onClick={scrollTop}>
                    <div className="logo-inner"></div>
                    <img className="logo" src="assets/images/logo.svg" alt="Logo" />
                </NavLink>
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
                    <img className="settings" src="assets/images/cog.svg" alt="Settings" onClick={toggleSettings} />
                </div>
            </div>
            {showSettings && <div className="app-settings">{/* Settings component placeholder */}</div>}
        </header>
    );
};

export default Header;
