import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { SettingsProvider } from './hooks/useSettings';
import App from './components/App';
import Feed from './components/Feed';
import './styles/global.scss';

const ItemDetails = React.lazy(() => import('./components/ItemDetails'));
const UserProfile = React.lazy(() => import('./components/UserProfile'));

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <Navigate to="/news/1" replace /> },
      { path: 'news/:page', element: <Feed /> },
      { path: 'newest/:page', element: <Feed /> },
      { path: 'show/:page', element: <Feed /> },
      { path: 'ask/:page', element: <Feed /> },
      { path: 'jobs/:page', element: <Feed /> },
      { path: 'item/:id', element: <ItemDetails /> },
      { path: 'user/:id', element: <UserProfile /> },
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
