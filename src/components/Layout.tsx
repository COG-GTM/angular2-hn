import React from 'react';
import { Outlet } from 'react-router-dom';
import { useSettings } from '../contexts/SettingsContext';

const Layout: React.FC = () => {
    const { settings } = useSettings();

    return (
        <div className={`body-cover ${settings.theme}`}>
            <div className="wrapper">
                <header id="header">
                    <div className="logo-inner">
                        <h1>Hacker News</h1>
                    </div>
                    <nav className="nav">
                        <a href="/news/1">news</a>
                        <a href="/newest/1">newest</a>
                        <a href="/show/1">show</a>
                        <a href="/ask/1">ask</a>
                        <a href="/jobs/1">jobs</a>
                    </nav>
                </header>
                
                <main>
                    <Outlet />
                </main>
                
                <footer id="footer">
                    <p>Built with React + Vite</p>
                </footer>
            </div>
        </div>
    );
};

export default Layout;
