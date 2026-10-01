/*
 * ROUTE SLOT — owned by T4 (Item details).
 * Mounted at `/item/:id`; the page is code-split into its own chunk.
 */
import { lazy, Suspense } from 'react';
import { Loader } from '../../components/Loader';

const ItemPage = lazy(() => import('../../pages/ItemPage'));

export function ItemSlot() {
  return (
    <Suspense fallback={<Loader />}>
      <ItemPage />
    </Suspense>
  );
}
