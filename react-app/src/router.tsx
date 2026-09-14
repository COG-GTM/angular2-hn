import { createBrowserRouter, Navigate } from 'react-router-dom'
import App from './App'
import Feed from './pages/Feed'
import ItemDetails from './pages/ItemDetails'
import User from './pages/User'
import type { FeedName } from './services/hackerNewsApi'

export const FEED_NAMES: FeedName[] = ['news', 'newest', 'show', 'ask', 'jobs']

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <Navigate to="/news/1" replace /> },
      ...FEED_NAMES.map((feedType) => ({
        path: `${feedType}/:page`,
        element: <Feed feedType={feedType} />,
      })),
      { path: 'item/:id', element: <ItemDetails /> },
      { path: 'user/:id', element: <User /> },
    ],
  },
])
