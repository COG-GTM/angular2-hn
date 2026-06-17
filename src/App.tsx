import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SettingsProvider, useSettings } from './contexts/SettingsContext';
import { Header } from './components/Header/Header';
import { Footer } from './components/Footer/Footer';
import { Loader } from './components/Loader/Loader';
import './scss/styles.scss';

const Feed = lazy(() => import('./pages/Feed/Feed').then((m) => ({ default: m.Feed })));
const ItemDetails = lazy(() => import('./pages/ItemDetails/ItemDetails').then((m) => ({ default: m.ItemDetails })));
const UserPage = lazy(() => import('./pages/User/User').then((m) => ({ default: m.UserPage })));

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 1000 * 60 * 2,
            retry: 1,
        },
    },
});

function AppShell() {
    const { settings } = useSettings();

    return (
        <div className={settings.theme}>
            <div className="body-cover"></div>
            <div className="wrapper">
                <Header />
                <Suspense fallback={<div className="main-content"><Loader /></div>}>
                    <Routes>
                        <Route path="/" element={<Navigate to="/news/1" replace />} />
                        <Route path="/news/:page" element={<Feed />} />
                        <Route path="/newest/:page" element={<Feed />} />
                        <Route path="/show/:page" element={<Feed />} />
                        <Route path="/ask/:page" element={<Feed />} />
                        <Route path="/jobs/:page" element={<Feed />} />
                        <Route path="/item/:id" element={<ItemDetails />} />
                        <Route path="/user/:id" element={<UserPage />} />
                    </Routes>
                </Suspense>
                <Footer />
            </div>
        </div>
    );
}

export function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <SettingsProvider>
                <BrowserRouter>
                    <AppShell />
                </BrowserRouter>
            </SettingsProvider>
        </QueryClientProvider>
    );
}
