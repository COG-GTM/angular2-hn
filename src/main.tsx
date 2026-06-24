import React, { lazy, Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom';
import { SettingsProvider } from './context/SettingsContext';
import App from './App';
import Feed from './components/Feed';
import Loader from './components/Loader';

import './app/app.component.scss';
import './app/shared/scss/_themes.scss';

const ItemDetails = lazy(() => import('./components/ItemDetails'));
const User = lazy(() => import('./components/User'));

const router = createBrowserRouter([
    {
        path: '/',
        element: <App />,
        children: [
            { index: true, element: <Navigate to="/news/1" replace /> },
            { path: 'news/:page', element: <Feed feedType="news" /> },
            { path: 'newest/:page', element: <Feed feedType="newest" /> },
            { path: 'show/:page', element: <Feed feedType="show" /> },
            { path: 'ask/:page', element: <Feed feedType="ask" /> },
            { path: 'jobs/:page', element: <Feed feedType="jobs" /> },
            {
                path: 'item/:id',
                element: (
                    <Suspense fallback={<Loader />}>
                        <ItemDetails />
                    </Suspense>
                ),
            },
            {
                path: 'user/:id',
                element: (
                    <Suspense fallback={<Loader />}>
                        <User />
                    </Suspense>
                ),
            },
        ],
    },
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <SettingsProvider>
            <RouterProvider router={router} />
        </SettingsProvider>
    </React.StrictMode>
);
