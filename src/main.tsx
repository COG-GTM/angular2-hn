import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

import { App } from './App';
import { Feed } from './components/feeds/Feed';
import { SettingsProvider } from './context/SettingsContext';
import './styles/global.scss';

const FEED_TYPES = ['news', 'newest', 'show', 'ask', 'jobs'];

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <React.StrictMode>
        <SettingsProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<App />}>
                        <Route index element={<Navigate to="/news/1" replace />} />
                        {FEED_TYPES.map((feedType) => (
                            <Route
                                key={feedType}
                                path={`${feedType}/:page`}
                                element={<Feed feedType={feedType} />}
                            />
                        ))}
                    </Route>
                </Routes>
            </BrowserRouter>
        </SettingsProvider>
    </React.StrictMode>
);
