import { lazy, Suspense, ReactNode } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';

const FeedPage = lazy(() => import('./pages/Feed'));
const ItemDetailsPage = lazy(() => import('./pages/ItemDetails'));
const UserPage = lazy(() => import('./pages/User'));

const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="text-lg">Loading...</div>
  </div>
);

const SuspenseWrapper = ({ children }: { children: ReactNode }) => (
  <Suspense fallback={<LoadingFallback />}>
    {children}
  </Suspense>
);

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/news/1" replace />
  },
  {
    path: '/news/:page',
    element: (
      <SuspenseWrapper>
        <FeedPage feedType="news" />
      </SuspenseWrapper>
    )
  },
  {
    path: '/newest/:page',
    element: (
      <SuspenseWrapper>
        <FeedPage feedType="newest" />
      </SuspenseWrapper>
    )
  },
  {
    path: '/show/:page',
    element: (
      <SuspenseWrapper>
        <FeedPage feedType="show" />
      </SuspenseWrapper>
    )
  },
  {
    path: '/ask/:page',
    element: (
      <SuspenseWrapper>
        <FeedPage feedType="ask" />
      </SuspenseWrapper>
    )
  },
  {
    path: '/jobs/:page',
    element: (
      <SuspenseWrapper>
        <FeedPage feedType="jobs" />
      </SuspenseWrapper>
    )
  },
  {
    path: '/item',
    element: (
      <SuspenseWrapper>
        <ItemDetailsPage />
      </SuspenseWrapper>
    )
  },
  {
    path: '/user',
    element: (
      <SuspenseWrapper>
        <UserPage />
      </SuspenseWrapper>
    )
  }
]);
