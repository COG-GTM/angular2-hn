import { Outlet } from 'react-router-dom';

import { Footer } from './Footer';
import { Header } from './Header';

/**
 * Layout route (mirrors `app.component.html`). The theme class lives on <html> (SettingsProvider),
 * so the wrapper needs no theme class. Phase 2 · Core shell may restyle but keep this structure.
 */
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
