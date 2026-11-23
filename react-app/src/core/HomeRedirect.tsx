import { Navigate, useLocation } from 'react-router-dom';

/** Like Angular's `redirectTo`, keeps the query string (e.g. the manifest's `utm_source=web_app_manifest`). */
export function HomeRedirect() {
  return <Navigate to={{ pathname: '/news/1', search: useLocation().search }} replace />;
}
