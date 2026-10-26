import { Suspense } from 'react';
import { Outlet } from 'react-router-dom';

import { Footer } from './core/Footer/Footer';
import { Header } from './core/Header/Header';
import { usePageTracking } from './shared/analytics';
import { Loader } from './shared/components/Loader/Loader';
import { useSettings } from './shared/settings/settings-context';
import './App.scss';

export function App() {
    const { settings } = useSettings();
    usePageTracking();

    return (
        <div className={settings.theme}>
            <div className="body-cover"></div>
            <div className="wrapper">
                <Header />
                <Suspense fallback={<Loader />}>
                    <Outlet />
                </Suspense>
                <Footer />
            </div>
        </div>
    );
}
