import { lazy, Suspense } from 'react';
import { BrowserRouter, Navigate, Outlet, Route, Routes } from 'react-router-dom';

import { Footer, Header, Loader, Settings } from './components';
import { SettingsProvider, useSettings } from './context/SettingsContext';
import { FeedPage } from './pages/feeds';
import { FEED_TYPES } from './types';
import { usePageViews } from './utils/analytics';
import './styles/app.scss';

// Angular lazy-loaded the item and user modules (loadChildren).
const ItemDetailsPage = lazy(() => import('./pages/item').then((m) => ({ default: m.ItemDetailsPage })));
const UserPage = lazy(() => import('./pages/user').then((m) => ({ default: m.UserPage })));

/** Port of src/app/app.component.html: theme class wrapper, body cover, header, outlet, footer. */
export function Layout() {
    const { settings } = useSettings();
    usePageViews();
    return (
        <div className={settings.theme}>
            <div className="body-cover"></div>
            <div className="wrapper">
                <Header />
                {settings.showSettings && <Settings />}
                <Outlet />
                <Footer />
            </div>
        </div>
    );
}

/** Port of src/app/app.routes.ts. */
export function AppRoutes() {
    return (
        <Routes>
            <Route path="/" element={<Navigate to="/news/1" replace />} />
            <Route element={<Layout />}>
                {FEED_TYPES.map((feedType) => (
                    <Route
                        key={feedType}
                        path={`/${feedType}/:page`}
                        element={<FeedPage key={feedType} feedType={feedType} />}
                    />
                ))}
                <Route
                    path="/item/:id"
                    element={
                        <Suspense fallback={<Loader />}>
                            <ItemDetailsPage />
                        </Suspense>
                    }
                />
                <Route
                    path="/user/:id"
                    element={
                        <Suspense fallback={<Loader />}>
                            <UserPage />
                        </Suspense>
                    }
                />
                {/* Angular has no wildcard route: unknown URLs render the shell with an empty outlet. */}
                <Route path="*" element={null} />
            </Route>
        </Routes>
    );
}

export default function App() {
    return (
        <SettingsProvider>
            <BrowserRouter>
                <AppRoutes />
            </BrowserRouter>
        </SettingsProvider>
    );
}
