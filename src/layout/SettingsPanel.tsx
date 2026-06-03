// PLACEHOLDER — to be implemented in the migration child session for the Settings panel.
// Parity target: src/app/core/settings/settings.component.{ts,html,scss} on the `master` branch.
import { useSettings } from '../context/SettingsContext';

export function SettingsPanel() {
    const { toggleSettings } = useSettings();
    return (
        <div id="popup1" className="overlay">
            <div className="popup">
                <h1>Settings</h1>
                <button type="button" className="close" onClick={toggleSettings}>
                    ×
                </button>
            </div>
        </div>
    );
}
