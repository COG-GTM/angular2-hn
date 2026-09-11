import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { Footer } from './components/Footer/Footer';
import { Header } from './components/Header/Header';
import { Loader } from './components/Loader/Loader';
import { SettingsProvider, useSettings } from './context/SettingsContext';
import { FeedPage } from './pages/FeedPage';
import type { FeedName } from './types';
import './styles/global.scss';

const LazyItemDetailsPage = lazy(() => import('./pages/ItemDetailsPage').then((module) => ({ default: module.ItemDetailsPage })));
const LazyUserPage = lazy(() => import('./pages/UserPage').then((module) => ({ default: module.UserPage })));
const feedNames: FeedName[] = ['news', 'newest', 'show', 'ask', 'jobs'];

function Analytics() {
    const { pathname } = useLocation();
    useEffect(() => {
        window.ga?.('set', 'page', pathname);
        window.ga?.('send', 'pageview');
    }, [pathname]);
    return null;
}

export function AppRoutes() {
    return <Routes>
        <Route path="/" element={<Navigate to="/news/1" replace />} />
        {feedNames.map((feed) => <Route key={feed} path={`/${feed}`}><Route index element={<Navigate to={`/${feed}/1`} replace />} /><Route path=":page" element={<FeedPage feedType={feed} />} /></Route>)}
        <Route path="/item/:id" element={<Suspense fallback={<Loader />}><LazyItemDetailsPage /></Suspense>} />
        <Route path="/user/:id" element={<Suspense fallback={<Loader />}><LazyUserPage /></Suspense>} />
    </Routes>;
}

export function AppShell() {
    const { settings } = useSettings();
    return <div className={settings.theme}><div className="body-cover" /><div className="wrapper"><Header /><AppRoutes /><Footer /></div><Analytics /></div>;
}

export default function App() {
    return <SettingsProvider><BrowserRouter><AppShell /></BrowserRouter></SettingsProvider>;
}
