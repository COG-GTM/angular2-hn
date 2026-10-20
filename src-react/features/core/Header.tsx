import { Link } from 'react-router-dom';

import { useSettings } from '../../shared/settings';
import { Settings } from './Settings';

/** PLACEHOLDER (Phase 2 · Core shell). */
export function Header() {
    const { settings, toggleSettings } = useSettings();
    return (
        <header data-testid="header-placeholder">
            <div id="header">
                <strong>Header placeholder</strong>{' '}
                <nav className="header-nav">
                    <Link to="/news/1">news</Link> | <Link to="/newest/1">new</Link> | <Link to="/show/1">show</Link> |{' '}
                    <Link to="/ask/1">ask</Link> | <Link to="/jobs/1">jobs</Link> | <Link to="/item/8863">item</Link> |{' '}
                    <Link to="/user/pg">user</Link>
                </nav>{' '}
                <button type="button" onClick={toggleSettings}>
                    settings
                </button>
            </div>
            {settings.showSettings && <Settings />}
        </header>
    );
}
