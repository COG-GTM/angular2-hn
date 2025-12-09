import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSettings } from '../../../hooks/useSettings';
import './Header.css';

export const Header: React.FC = () => {
    const { toggleSettings } = useSettings();
    const location = useLocation();

    const scrollTop = () => {
        window.scrollTo(0, 0);
    };

    const isActive = (path: string) => {
        return location.pathname.startsWith(path);
    };

    return (
        <header className="main-header">
            <div className="header-content">
                <Link to="/news/1" className="home-link" onClick={scrollTop}>
                    <div className="logo">
                        <span className="logo-text">HN</span>
                    </div>
                </Link>
                <nav className="header-nav">
                    <Link
                        to="/news/1"
                        className={isActive('/news') ? 'active' : ''}
                        onClick={scrollTop}
                    >
                        top
                    </Link>
                    <span className="separator">|</span>
                    <Link
                        to="/newest/1"
                        className={isActive('/newest') ? 'active' : ''}
                        onClick={scrollTop}
                    >
                        new
                    </Link>
                    <span className="separator">|</span>
                    <Link
                        to="/show/1"
                        className={isActive('/show') ? 'active' : ''}
                        onClick={scrollTop}
                    >
                        show
                    </Link>
                    <span className="separator">|</span>
                    <Link
                        to="/ask/1"
                        className={isActive('/ask') ? 'active' : ''}
                        onClick={scrollTop}
                    >
                        ask
                    </Link>
                    <span className="separator">|</span>
                    <Link
                        to="/jobs/1"
                        className={isActive('/jobs') ? 'active' : ''}
                        onClick={scrollTop}
                    >
                        jobs
                    </Link>
                </nav>
                <button className="settings-button" onClick={toggleSettings}>
                    <span className="settings-icon">&#9881;</span>
                </button>
            </div>
        </header>
    );
};
