// PLACEHOLDER — to be implemented in the migration child session for the Header.
// Parity target: src/app/core/header/header.component.{ts,html,scss} on the `master` branch.
import { Link } from 'react-router-dom';

import { useSettings } from '../context/SettingsContext';
import { SettingsPanel } from './SettingsPanel';

export function Header() {
    const { settings, toggleSettings } = useSettings();
    return (
        <header>
            <div id="header">
                <Link className="home-link" to="/news/1">
                    Angular 2 HN
                </Link>
                <button type="button" onClick={toggleSettings}>
                    settings
                </button>
            </div>
            {settings.showSettings && <SettingsPanel />}
        </header>
    );
}
