/*
 * ROUTE SLOT — owned by T5 (User profile).
 * Mounted at `/user/:id`. T5 replaces the placeholder with a `React.lazy`
 * page wrapped in `<Suspense>`; keep the `UserSlot` export name.
 */
export function UserSlot() {
  return <p className="slot-placeholder">User profile coming soon.</p>;
}
