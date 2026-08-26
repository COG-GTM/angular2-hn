import { useSettings } from './context/SettingsContext';

export default function App() {
    const { settings } = useSettings();

    return (
        <main className={settings.theme}>
            <h1>Hacker News</h1>
        </main>
    );
}
