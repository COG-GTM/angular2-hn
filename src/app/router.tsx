import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { App } from './App';
import { FeedPage } from './feeds/FeedPage';
import { ItemDetailsPage } from './item-details/ItemDetailsPage';
import { UserPage } from './user/UserPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        path: '',
        element: <Navigate to="/news/1" replace />
      },
      {
        path: 'news/:page',
        element: <FeedPage feedType="news" />
      },
      {
        path: 'newest/:page',
        element: <FeedPage feedType="newest" />
      },
      {
        path: 'show/:page',
        element: <FeedPage feedType="show" />
      },
      {
        path: 'ask/:page',
        element: <FeedPage feedType="ask" />
      },
      {
        path: 'jobs/:page',
        element: <FeedPage feedType="jobs" />
      },
      {
        path: 'item/:id',
        element: <ItemDetailsPage />
      },
      {
        path: 'user/:id',
        element: <UserPage />
      }
    ]
  }
]);
