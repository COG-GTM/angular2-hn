import { THEMES } from '../../shared/models';
import { useSettings } from '../../shared/settings';

/** PLACEHOLDER (Phase 2 · Core shell). Settings popup; rendered by Header when `showSettings`. */
export function Settings() {
    const { settings, setTheme, toggleSettings } = useSettings();
    return (
        <div id="popup1" data-testid="settings-placeholder">
            <p>
                Settings placeholder — theme: <strong data-testid="settings-theme">{settings.theme}</strong>
            </p>
            {THEMES.map((theme) => (
                <button key={theme} type="button" onClick={() => setTheme(theme)}>
                    {theme}
                </button>
            ))}{' '}
            <button type="button" onClick={toggleSettings}>
                close
            </button>
        </div>
    );
}
