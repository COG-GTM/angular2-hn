import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { SettingsProvider } from './contexts/SettingsContext';
import App from './App';
import FeedPage from './pages/FeedPage/FeedPage';
import ItemDetailsPage from './pages/ItemDetailsPage/ItemDetailsPage';
import UserPage from './pages/UserPage/UserPage';

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        index: true,
        element: <Navigate to="/news/1" replace />,
      },
      {
        path: ':feedType/:page',
        element: <FeedPage />,
      },
      {
        path: 'item/:id',
        element: <ItemDetailsPage />,
      },
      {
        path: 'user/:id',
        element: <UserPage />,
      },
    ],
  },
]);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SettingsProvider>
      <RouterProvider router={router} />
    </SettingsProvider>
  </StrictMode>
);
