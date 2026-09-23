import { Outlet } from 'react-router-dom';

import { Footer } from './components/Footer';

/**
 * Placeholder shell: header and settings are ported in their own PRs
 * (see docs/MIGRATION.md).
 */
export function AppShell() {
    return (
        <div className="app-shell">
            <main>
                <Outlet />
            </main>
            <Footer />
        </div>
    );
}
