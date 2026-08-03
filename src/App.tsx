import { SettingsProvider } from './context/SettingsContext';
import { useSettings } from './context/settingsContext';

import './App.scss';

function AppShell() {
    const { settings } = useSettings();

    return (
        <div className={settings.theme}>
            <div className="body-cover" />
            <div className="wrapper" />
        </div>
    );
}

export default function App() {
    return (
        <SettingsProvider>
            <AppShell />
        </SettingsProvider>
    );
}
