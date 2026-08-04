import { Suspense } from 'react';
import { Outlet } from 'react-router-dom';

import Footer from './core/footer/Footer';
import Header from './core/header/Header';
import Loader from './shared/components/loader/Loader';
import { usePageviewTracking } from './shared/helpers/use-analytics';
import { useSettings } from './shared/services/settings-context';

import './App.scss';

export default function App() {
    const { theme } = useSettings();

    usePageviewTracking();

    return (
        <div className={theme}>
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
