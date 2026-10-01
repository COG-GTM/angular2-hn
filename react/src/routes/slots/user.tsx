/*
 * ROUTE SLOT — owned by T5 (User profile).
 * Mounted at `/user/:id`; the page is code-split into its own chunk.
 */
import { lazy, Suspense } from 'react';
import { Loader } from '../../components/Loader';

const UserPage = lazy(() => import('../../pages/UserPage'));

export function UserSlot() {
  return (
    <Suspense fallback={<Loader />}>
      <UserPage />
    </Suspense>
  );
}
