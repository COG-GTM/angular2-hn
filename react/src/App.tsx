import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

import Layout from './components/Layout';
import { SettingsProvider } from './context/SettingsContext';
import FeedPage from './pages/FeedPage';
import ItemPage from './pages/ItemPage';
import UserPage from './pages/UserPage';

const queryClient = new QueryClient();

export default function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <SettingsProvider>
                <BrowserRouter>
                    <Routes>
                        <Route element={<Layout />}>
                            <Route path="/" element={<Navigate to="/news/1" replace />} />
                            <Route path="/:feedType/:page" element={<FeedPage />} />
                            <Route path="/item/:id" element={<ItemPage />} />
                            <Route path="/user/:id" element={<UserPage />} />
                            <Route path="*" element={<Navigate to="/news/1" replace />} />
                        </Route>
                    </Routes>
                </BrowserRouter>
            </SettingsProvider>
        </QueryClientProvider>
    );
}
