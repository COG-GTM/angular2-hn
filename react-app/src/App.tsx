import { Outlet } from 'react-router-dom';
import { useSettings } from './shared/context';
import './App.scss';

export default function App() {
    const { settings } = useSettings();

    return (
        <div className={settings.theme}>
            <div className="body-cover"></div>
            <div className="wrapper">
                <Outlet />
            </div>
        </div>
    );
}
