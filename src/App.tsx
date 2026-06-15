import { lazy, Suspense, useEffect } from 'react';
import { createBrowserRouter, RouterProvider, Navigate, Outlet, useLocation } from 'react-router-dom';
import { SettingsProvider, useSettings } from './contexts/SettingsContext';
import { Header } from './core/Header';
import { Footer } from './core/Footer';
import { Loader } from './components/Loader';
import { FeedPage } from './features/feed/FeedPage';
import styles from './App.module.scss';

const ItemDetailsPage = lazy(() =>
    import('./features/item-details/ItemDetailsPage').then((m) => ({
        default: m.ItemDetailsPage,
    }))
);

const UserPage = lazy(() =>
    import('./features/user/UserPage').then((m) => ({
        default: m.UserPage,
    }))
);

declare function ga(...args: string[]): void;

function AnalyticsTracker() {
    const location = useLocation();

    useEffect(() => {
        if (typeof ga === 'function') {
            ga('set', 'page', location.pathname);
            ga('send', 'pageview');
        }
    }, [location]);

    return null;
}

function AppLayout() {
    const settings = useSettings();

    return (
        <div className={settings.theme}>
            <div className={`body-cover ${styles['body-cover']}`}></div>
            <div className={`wrapper ${styles.wrapper}`}>
                <Header />
                <AnalyticsTracker />
                <Suspense fallback={<Loader />}>
                    <Outlet />
                </Suspense>
                <Footer />
            </div>
        </div>
    );
}

const router = createBrowserRouter([
    {
        element: <AppLayout />,
        children: [
            { path: '/', element: <Navigate to="/news/1" replace /> },
            { path: '/:feedType/:page', element: <FeedPage /> },
            { path: '/item/:id', element: <ItemDetailsPage /> },
            { path: '/user/:id', element: <UserPage /> },
        ],
    },
]);

function App() {
    return (
        <SettingsProvider>
            <RouterProvider router={router} />
        </SettingsProvider>
    );
}

export default App;
