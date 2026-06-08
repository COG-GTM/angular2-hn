import { createBrowserRouter, Navigate } from 'react-router-dom';
import App from './App';
import Feed from './components/feeds/Feed';
import ItemDetails from './components/item-details/ItemDetails';
import UserProfile from './components/user/UserProfile';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <Navigate to="/news/1" replace /> },
      { path: ':feedType/:page', element: <Feed /> },
      { path: 'item/:id', element: <ItemDetails /> },
      { path: 'user/:id', element: <UserProfile /> },
    ],
  },
]);
