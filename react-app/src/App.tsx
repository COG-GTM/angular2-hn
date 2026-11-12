import { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import { Loader } from './components/Loader/Loader';
import { useSettings } from './settings';
import './styles/app.scss';

export default function App() {
    const { settings } = useSettings();
    return (
        <div className={settings.theme}>
            <div className="body-cover"></div>
            <div className="wrapper">
                <Suspense fallback={<Loader />}>
                    <Outlet />
                </Suspense>
            </div>
        </div>
    );
}
