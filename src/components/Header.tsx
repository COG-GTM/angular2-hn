import { useSettings } from '../context/SettingsContext';
import { Settings } from './Settings';

export function Header() {
    const { settings } = useSettings();

    return (
        <>
            <div>Header</div>
            {settings.showSettings && <Settings />}
        </>
    );
}
