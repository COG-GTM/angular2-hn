import { Navigate, createBrowserRouter } from 'react-router-dom'
import { Layout } from './components/Layout'
import { Feed } from './pages/Feed'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        index: true,
        element: <Navigate to="/news/1" replace />,
      },
      {
        path: 'news/:page',
        element: <Feed feedType="news" />,
      },
      {
        path: 'newest/:page',
        element: <Feed feedType="newest" />,
      },
      {
        path: 'show/:page',
        element: <Feed feedType="show" />,
      },
      {
        path: 'ask/:page',
        element: <Feed feedType="ask" />,
      },
      {
        path: 'jobs/:page',
        element: <Feed feedType="jobs" />,
      },
    ],
  },
])
