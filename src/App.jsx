import { createBrowserRouter, RouterProvider, Navigate, Outlet } from 'react-router-dom';
import { SettingsProvider, useSettings } from './context/SettingsContext';
import Header from './components/Header';
import Footer from './components/Footer';
import Feed from './components/Feed';

function Layout() {
  const { settings } = useSettings();

  return (
    <div className={settings.theme}>
      <div className="body-cover"></div>
      <div className="wrapper">
        <Header />
        <Outlet />
        <Footer />
      </div>
    </div>
  );
}

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        index: true,
        element: <Navigate to="/news/1" replace />
      },
      {
        path: 'news/:page',
        element: <Feed />
      },
      {
        path: 'newest/:page',
        element: <Feed />
      },
      {
        path: 'show/:page',
        element: <Feed />
      },
      {
        path: 'ask/:page',
        element: <Feed />
      },
      {
        path: 'jobs/:page',
        element: <Feed />
      },
      {
        path: 'item/:id',
        lazy: () => import('./components/ItemDetails').then(module => ({
          Component: module.ItemDetails
        }))
      },
      {
        path: 'user/:id',
        lazy: () => import('./components/User').then(module => ({
          Component: module.User
        }))
      }
    ]
  }
]);

function App() {
  return (
    <SettingsProvider>
      <RouterProvider router={router} />
    </SettingsProvider>
  );
}

export default App;
