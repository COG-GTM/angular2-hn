import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { SettingsProvider } from './contexts/SettingsContext';
import Layout from './components/Layout';
import Feed from './components/Feed';
import './styles/themes.scss';

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 5 * 60 * 1000, // 5 minutes
            retry: 1,
        },
    },
});

const App: React.FC = () => {
    return (
        <QueryClientProvider client={queryClient}>
            <SettingsProvider>
                <Router>
                    <Routes>
                        <Route path="/" element={<Navigate to="/news/1" replace />} />
                        <Route path="/" element={<Layout />}>
                            <Route path="news/:page" element={<Feed feedType="news" />} />
                            <Route path="newest/:page" element={<Feed feedType="newest" />} />
                            <Route path="show/:page" element={<Feed feedType="show" />} />
                            <Route path="ask/:page" element={<Feed feedType="ask" />} />
                            <Route path="jobs/:page" element={<Feed feedType="jobs" />} />
                            <Route path="item/:id" element={<div>Item Details (TODO)</div>} />
                            <Route path="user/:id" element={<div>User Profile (TODO)</div>} />
                        </Route>
                    </Routes>
                </Router>
                <ReactQueryDevtools initialIsOpen={false} />
            </SettingsProvider>
        </QueryClientProvider>
    );
};

export default App;
