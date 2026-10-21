import { Outlet } from 'react-router';

import { Footer } from './Footer';
import { Header } from './Header';

/**
 * Port of `app.component.html` layout. The theme class is applied to `<html>` by SettingsProvider, so
 * the shell only renders `.body-cover` + `.wrapper` (styled in shared/scss/styles.scss and _themes.scss).
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
