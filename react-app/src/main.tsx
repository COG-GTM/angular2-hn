import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
// Global styles first, like Angular's styles.css <link>, so component styles win specificity ties.
import './styles/styles.scss';
import { SettingsProvider } from './settings/SettingsContext';
import { routes } from './routes';

const router = createBrowserRouter(routes);

// Caches left by the old Angular service worker (see public/ngsw-worker.js).
if ('caches' in window) {
  caches.keys().then((keys) => keys.filter((key) => key.startsWith('ngsw:')).forEach((key) => caches.delete(key)));
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SettingsProvider>
      <RouterProvider router={router} />
    </SettingsProvider>
  </StrictMode>
);
