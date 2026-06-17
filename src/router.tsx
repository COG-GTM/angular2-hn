import { createBrowserRouter, Navigate } from 'react-router-dom';
import App from './components/App';

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <Navigate to="/news/1" replace /> },
      { path: 'news/:page', element: <div>Feed placeholder</div> },
      { path: 'newest/:page', element: <div>Feed placeholder</div> },
      { path: 'show/:page', element: <div>Feed placeholder</div> },
      { path: 'ask/:page', element: <div>Feed placeholder</div> },
      { path: 'jobs/:page', element: <div>Feed placeholder</div> },
      { path: 'item/:id', element: <div>Item details placeholder</div> },
      { path: 'user/:id', element: <div>User placeholder</div> },
    ],
  },
]);

export default router;
