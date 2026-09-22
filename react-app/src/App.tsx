import { useSettings } from './context/SettingsContext';

// Placeholder shell; routing and the real App shell land in the routing phase.
export function App() {
    const { theme } = useSettings();

    return (
        <div className={theme}>
            <div className="body-cover"></div>
            <div className="wrapper"></div>
        </div>
    );
}

export default App;
