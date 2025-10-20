import { Suspense } from 'react';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import { SettingsProvider } from './contexts/SettingsContext';
import { routes } from './routes';
import Loader from './components/shared/Loader';
import './App.css';

const router = createBrowserRouter(routes);

function App() {
  return (
    <SettingsProvider>
      <Suspense fallback={<Loader />}>
        <RouterProvider router={router} />
      </Suspense>
    </SettingsProvider>
  );
}

export default App;
