import { useState } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router';
import { SettingsProvider } from './hooks/useSettings';
import { routes } from './routes/routes';

export type AppRouter = ReturnType<typeof createBrowserRouter>;

export interface AppProps {
  /** Injected in tests (e.g. `createMemoryRouter(routes)`); defaults to a browser router. */
  router?: AppRouter;
}

export function App({ router }: AppProps) {
  const [appRouter] = useState(() => router ?? createBrowserRouter(routes));
  return (
    <SettingsProvider>
      <RouterProvider router={appRouter} />
    </SettingsProvider>
  );
}
