import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { routerFuture, routes } from './routes';
import { SettingsProvider } from './settings/SettingsProvider';
import './styles/global.scss';

const router = createBrowserRouter(routes, { future: routerFuture });

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SettingsProvider>
      <RouterProvider router={router} future={{ v7_startTransition: true }} />
    </SettingsProvider>
  </StrictMode>,
);
