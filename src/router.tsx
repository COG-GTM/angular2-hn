import { createBrowserRouter, Navigate } from 'react-router-dom';
import App from './components/App';
import FeedPage from './pages/FeedPage';

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <Navigate to="/news/1" replace /> },
      { path: 'news/:page', element: <FeedPage feedType="news" /> },
      { path: 'newest/:page', element: <FeedPage feedType="newest" /> },
      { path: 'show/:page', element: <FeedPage feedType="show" /> },
      { path: 'ask/:page', element: <FeedPage feedType="ask" /> },
      { path: 'jobs/:page', element: <FeedPage feedType="jobs" /> },
      { path: 'item/:id', element: <div>Item details placeholder</div> },
      { path: 'user/:id', element: <div>User placeholder</div> },
    ],
  },
]);

export default router;
