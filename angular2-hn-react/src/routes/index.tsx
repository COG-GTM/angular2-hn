import { createBrowserRouter } from 'react-router-dom';
import App from '../App';

export const router = createBrowserRouter([
    {
        path: '/',
        element: <App />,
        children: [
            {
                index: true,
                lazy: async () => {
                    const { FeedPage } = await import('../pages/FeedPage');
                    return { Component: FeedPage };
                },
            },
            {
                path: 'news/:page?',
                lazy: async () => {
                    const { FeedPage } = await import('../pages/FeedPage');
                    return { Component: FeedPage };
                },
            },
            {
                path: 'newest/:page?',
                lazy: async () => {
                    const { FeedPage } = await import('../pages/FeedPage');
                    return { Component: FeedPage };
                },
            },
            {
                path: 'ask/:page?',
                lazy: async () => {
                    const { FeedPage } = await import('../pages/FeedPage');
                    return { Component: FeedPage };
                },
            },
            {
                path: 'show/:page?',
                lazy: async () => {
                    const { FeedPage } = await import('../pages/FeedPage');
                    return { Component: FeedPage };
                },
            },
            {
                path: 'jobs/:page?',
                lazy: async () => {
                    const { FeedPage } = await import('../pages/FeedPage');
                    return { Component: FeedPage };
                },
            },
            {
                path: 'item/:id',
                lazy: async () => {
                    const { ItemPage } = await import('../pages/ItemPage');
                    return { Component: ItemPage };
                },
            },
            {
                path: 'user/:id',
                lazy: async () => {
                    const { UserPage } = await import('../pages/UserPage');
                    return { Component: UserPage };
                },
            },
        ],
    },
]);
