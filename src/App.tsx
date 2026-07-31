import { useSettings } from './context/settingsContext';

import './App.scss';

export function App() {
    const { settings } = useSettings();

    return (
        <div className={settings.theme}>
            <div className="body-cover" />
            <div className="wrapper" />
        </div>
    );
}
