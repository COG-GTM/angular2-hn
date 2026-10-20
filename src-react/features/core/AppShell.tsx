import { Outlet } from 'react-router-dom';

import './AppShell.scss';
import { Footer } from './Footer';
import { Header } from './Header';

/** Layout route (port of `app.component.html`). The theme class lives on <html> (SettingsProvider). */
export function AppShell() {
    return (
        <>
            <div className="body-cover"></div>
            <div className="wrapper">
                <Header />
                <Outlet />
                <Footer />
            </div>
        </>
    );
}
