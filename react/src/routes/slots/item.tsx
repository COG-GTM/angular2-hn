/*
 * ROUTE SLOT — owned by T4 (Item details).
 * Mounted at `/item/:id`. T4 replaces the placeholder with a `React.lazy`
 * page wrapped in `<Suspense>`; keep the `ItemSlot` export name.
 */
export function ItemSlot() {
  return <p className="slot-placeholder">Item details coming soon.</p>;
}
