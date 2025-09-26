import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { SettingsProvider } from './contexts/SettingsContext';
import Feed from './components/Feed';
import ItemDetails from './components/ItemDetails';
import User from './components/User';

const queryClient = new QueryClient();

function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <SettingsProvider>
                <Router>
                    <div className="App">
                        <Routes>
                            <Route path="/" element={<Navigate to="/news/1" replace />} />
                            <Route path="/news/:page" element={<Feed feedType="news" />} />
                            <Route path="/newest/:page" element={<Feed feedType="newest" />} />
                            <Route path="/show/:page" element={<Feed feedType="show" />} />
                            <Route path="/ask/:page" element={<Feed feedType="ask" />} />
                            <Route path="/jobs/:page" element={<Feed feedType="jobs" />} />
                            <Route path="/item/:id" element={<ItemDetails />} />
                            <Route path="/user/:id" element={<User />} />
                        </Routes>
                    </div>
                </Router>
            </SettingsProvider>
            <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
    );
}

export default App;
