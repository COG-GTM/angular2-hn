import { createBrowserRouter, Navigate } from 'react-router';

import { App } from './App';

export const router = createBrowserRouter([
    {
        path: '/',
        element: <App />,
        children: [{ index: true, element: <Navigate to="/news/1" replace /> }],
    },
]);
