/*
 * ROUTE TABLE — owned by T1 (App shell).
 * Only this file registers paths. Feature pages plug in through the slot
 * components in ./slots/ (feeds → T3, item → T4, user → T5); feature tasks
 * edit their slot file, never this table.
 */
import { Navigate, type RouteObject } from 'react-router';
import { FEED_NAMES } from '../api/types';
import { Layout } from '../components/Layout';
import { NotFoundPage } from '../pages/NotFoundPage';
import { FeedSlot } from './slots/feeds';
import { ItemSlot } from './slots/item';
import { UserSlot } from './slots/user';

export const routes: RouteObject[] = [
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <Navigate to="/news" replace /> },

      // ── SLOT: feeds (T3) ── /news /newest /show /ask /jobs, page via ?page=n
      ...FEED_NAMES.map((feed) => ({ path: feed, element: <FeedSlot key={feed} feed={feed} /> })),

      // ── SLOT: item details (T4) ──
      { path: 'item/:id', element: <ItemSlot /> },

      // ── SLOT: user profile (T5) ──
      { path: 'user/:id', element: <UserSlot /> },

      { path: '*', element: <NotFoundPage /> },
    ],
  },
];
