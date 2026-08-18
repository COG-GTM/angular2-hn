import { Suspense, lazy } from 'react';
import { Navigate, Outlet, Route, Routes } from 'react-router-dom';

import { Footer } from './components/Footer';
import { Header } from './components/Header';
import { Loader } from './components/Loader';
import { SettingsProvider } from './context/SettingsProvider';
import { usePageViews } from './hooks/usePageViews';
import { useSettings } from './hooks/useSettings';
import { FeedPage } from './pages/FeedPage';

const ItemDetailsPage = lazy(() =>
    import('./pages/ItemDetailsPage').then((module) => ({ default: module.ItemDetailsPage }))
);
const UserPage = lazy(() =>
    import('./pages/UserPage').then((module) => ({ default: module.UserPage }))
);

const FEEDS = ['news', 'newest', 'show', 'ask', 'jobs'];

function Layout() {
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

export function App() {
    return (
        <SettingsProvider>
            <Routes>
                <Route element={<Layout />}>
                    <Route path="/" element={<Navigate to="/news/1" replace />} />
                    {FEEDS.map((feed) => (
                        <Route key={feed} path={feed}>
                            <Route path=":page" element={<FeedPage feedType={feed} />} />
                        </Route>
                    ))}
                    <Route path="item/:id" element={<ItemDetailsPage />} />
                    <Route path="user/:id" element={<UserPage />} />
                </Route>
            </Routes>
        </SettingsProvider>
    );
}
