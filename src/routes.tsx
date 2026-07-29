import { Navigate, createBrowserRouter } from 'react-router-dom';
import App from './App';
import { FEED_NAMES } from './shared/models';
import FeedPage from './feeds/FeedPage';
import ItemDetailsPage from './item-details/ItemDetailsPage';
import UserPage from './user/UserPage';

export const router = createBrowserRouter([
    {
        path: '/',
        element: <App />,
        children: [
            { index: true, element: <Navigate to="/news/1" replace /> },
            ...FEED_NAMES.map((feedType) => ({
                path: feedType,
                children: [
                    { index: true, element: <Navigate to={`/${feedType}/1`} replace /> },
                    { path: ':page', element: <FeedPage feedType={feedType} /> },
                ],
            })),
            { path: 'item/:id', element: <ItemDetailsPage /> },
            { path: 'user/:id', element: <UserPage /> },
            { path: '*', element: <Navigate to="/news/1" replace /> },
        ],
    },
]);
