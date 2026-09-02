import { AppRoutes } from './routes';
import { SettingsProvider, useSettings } from './settings';

function ThemedShell() {
    const { settings } = useSettings();
    return (
        <div className={settings.theme}>
            <div className="body-cover"></div>
            <div className="wrapper">
                <AppRoutes />
            </div>
        </div>
    );
}

export default function App() {
    return (
        <SettingsProvider>
            <ThemedShell />
        </SettingsProvider>
    );
}
