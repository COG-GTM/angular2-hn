// PLACEHOLDER (Phase 1 scaffold) - replaced by the Phase 2D port.
import { useSettings } from '../../context/SettingsContext';

export default function Settings() {
    const { settings } = useSettings();
    return <div id="popup1" className="overlay" hidden={!settings.showSettings} />;
}
