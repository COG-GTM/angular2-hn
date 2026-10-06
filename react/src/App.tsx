import { lazy, Suspense } from 'react';
import { BrowserRouter, Navigate, Outlet, Route, Routes } from 'react-router-dom';
import { Header } from './core/Header/Header';
import { Footer } from './core/Footer/Footer';
import { Loader } from './shared/components/Loader/Loader';
import { FEED_NAMES } from './shared/models/feed-type';
import { SettingsProvider } from './shared/services/SettingsProvider';
import { useSettings } from './shared/services/useSettings';
import { usePageViews } from './shared/hooks/usePageViews';
import Feed from './feeds/Feed';
import './App.scss';

const ItemDetails = lazy(() => import('./item-details/ItemDetails'));
const UserProfile = lazy(() => import('./user/UserProfile'));

export function AppLayout() {
    const { settings } = useSettings();
    usePageViews();

    return (
        <div className={settings.theme} data-testid="theme-root">
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

/** Mirrors src/app/app.routes.ts (plus the lazy item/user child routes). */
export function AppRoutes() {
    return (
        <Routes>
            <Route element={<AppLayout />}>
                <Route index element={<Navigate to="/news/1" replace />} />
                {FEED_NAMES.map((feedType) => (
                    <Route
                        key={feedType}
                        path={`${feedType}/:page`}
                        element={<Feed key={feedType} feedType={feedType} />}
                    />
                ))}
                <Route path="item/:id" element={<ItemDetails />} />
                <Route path="user/:id" element={<UserProfile />} />
                {/* Angular has no wildcard route: unknown URLs keep the shell with an empty outlet. */}
                <Route path="*" element={null} />
            </Route>
        </Routes>
    );
}

function App() {
    return (
        <BrowserRouter>
            <SettingsProvider>
                <AppRoutes />
            </SettingsProvider>
        </BrowserRouter>
    );
}

export default App;
