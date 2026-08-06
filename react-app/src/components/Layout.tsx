import { NavLink, Outlet } from 'react-router-dom';
import { feeds } from '../routes';

export default function Layout() {
    return (
        <div className="layout">
            <header className="layout-header">
                <span className="layout-logo">Angular HNPWA &rarr; React</span>
                <nav className="layout-nav">
                    {feeds.map((feedType) => (
                        <NavLink key={feedType} to={`/${feedType}/1`}>
                            {feedType}
                        </NavLink>
                    ))}
                </nav>
            </header>
            <main className="layout-main">
                <Outlet />
            </main>
            <footer className="layout-footer">
                React migration skeleton &mdash; feature components coming soon.
            </footer>
        </div>
    );
}
