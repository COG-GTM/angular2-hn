import React, { Suspense, lazy } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

import { App } from './App';
import { Feed } from './components/feeds/Feed';
import { Loader } from './components/shared/Loader';
import { SettingsProvider } from './context/SettingsContext';
import './styles/global.scss';

const ItemDetails = lazy(() =>
    import('./components/item-details/ItemDetails').then((module) => ({ default: module.ItemDetails }))
);
const UserProfile = lazy(() =>
    import('./components/user/UserProfile').then((module) => ({ default: module.UserProfile }))
);

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
                        <Route
                            path="item/:id"
                            element={
                                <Suspense fallback={<Loader />}>
                                    <ItemDetails />
                                </Suspense>
                            }
                        />
                        <Route
                            path="user/:id"
                            element={
                                <Suspense fallback={<Loader />}>
                                    <UserProfile />
                                </Suspense>
                            }
                        />
                    </Route>
                </Routes>
            </BrowserRouter>
        </SettingsProvider>
    </React.StrictMode>
);
