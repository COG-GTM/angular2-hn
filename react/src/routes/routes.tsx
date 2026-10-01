/*
 * ROUTE TABLE — owned by T1 (App shell).
 * Only this file registers paths. Feature pages plug in through the slot
 * components in ./slots/ (feeds → T3, item → T4, user → T5); feature tasks
 * edit their slot file, never this table.
 */
import { Navigate, Outlet, type RouteObject } from 'react-router';
import { FeedSlot } from './slots/feeds';

export const routes: RouteObject[] = [
  {
    path: '/',
    element: <Outlet />,
    children: [
      { index: true, element: <Navigate to="/news" replace /> },
      { path: 'news', element: <FeedSlot feed="news" /> },
    ],
  },
];
