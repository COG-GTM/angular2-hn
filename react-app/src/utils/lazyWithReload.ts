import { lazy, type ComponentType } from 'react';

const RELOADED_KEY = 'chunkReloaded';

/**
 * `React.lazy` that reloads the page once when a route chunk fails to load, e.g. a tab opened before a
 * deploy asks for a chunk the new deployment no longer serves. A second failure in a row is rethrown.
 */
export function lazyWithReload<T extends ComponentType>(load: () => Promise<{ default: T }>) {
  return lazy(() =>
    load().then(
      (module) => {
        sessionStorage.removeItem(RELOADED_KEY);
        return module;
      },
      (error) => {
        if (sessionStorage.getItem(RELOADED_KEY)) throw error;
        sessionStorage.setItem(RELOADED_KEY, '1');
        window.location.reload();
        return new Promise<never>(() => {});
      }
    )
  );
}
