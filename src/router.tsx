import { createBrowserRouter, Navigate } from 'react-router-dom';
import App from './components/App';
import Feed from './pages/Feed';
import ItemDetails from './pages/ItemDetails';
import User from './pages/User';

const router = createBrowserRouter([
    {
        path: '/',
        element: <App />,
        children: [
            { index: true, element: <Navigate to="/news/1" replace /> },
            { path: 'news/:page', element: <Feed feedType="news" /> },
            { path: 'newest/:page', element: <Feed feedType="newest" /> },
            { path: 'show/:page', element: <Feed feedType="show" /> },
            { path: 'ask/:page', element: <Feed feedType="ask" /> },
            { path: 'jobs/:page', element: <Feed feedType="jobs" /> },
            { path: 'item/:id', element: <ItemDetails /> },
            { path: 'user/:id', element: <User /> },
        ],
    },
]);

export default router;
