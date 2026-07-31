import { createBrowserRouter, Navigate } from 'react-router-dom';

import { App } from './App';

export const router = createBrowserRouter([
    {
        path: '/',
        element: <App />,
        children: [{ index: true, element: <Navigate to="/news/1" replace /> }],
    },
]);
