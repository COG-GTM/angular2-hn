import { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import { usePageViews } from './analytics/usePageViews';
import { Footer } from './components/Footer/Footer';
import { Header } from './components/Header/Header';
import { Loader } from './components/Loader/Loader';
import { useSettings } from './settings';
import './styles/app.scss';

export default function App() {
    const { settings } = useSettings();
    usePageViews();
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
