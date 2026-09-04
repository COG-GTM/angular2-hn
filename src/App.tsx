import { useSettings } from './context/SettingsContext';
import './App.scss';

export default function App() {
    const { settings } = useSettings();

    return (
        <div className={`c-app ${settings.theme}`}>
            <div className="body-cover"></div>
            <div className="wrapper"></div>
        </div>
    );
}
