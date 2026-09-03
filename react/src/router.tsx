import { lazy, Suspense } from 'react'
import { Navigate, createBrowserRouter } from 'react-router-dom'
import { Layout } from './components/Layout'
import { Loader } from './components/Loader'
import { Feed } from './pages/Feed'

const ItemDetails = lazy(() => import('./pages/ItemDetails'))

function LazyItemDetails() {
  return (
    <Suspense fallback={<Loader />}>
      <ItemDetails />
    </Suspense>
  )
}

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
      {
        path: 'item/:id',
        element: <LazyItemDetails />,
      },
      {
        path: '*',
        element: <Navigate to="/news/1" replace />,
      },
    ],
  },
])
