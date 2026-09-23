import { Outlet } from 'react-router-dom';

/**
 * Placeholder shell: header, footer and settings are ported in their own PRs
 * (see docs/MIGRATION.md).
 */
export function AppShell() {
    return (
        <div className="app-shell">
            <main>
                <Outlet />
            </main>
        </div>
    );
}
