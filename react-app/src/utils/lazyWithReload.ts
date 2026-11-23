import { lazy, type ComponentType } from 'react';

const RELOADED_KEY = 'chunkReloadedAt';
const RETRY_WINDOW_MS = 10_000;

/**
 * `React.lazy` that reloads the page when a route chunk fails to load, e.g. a tab opened before a deploy
 * asks for a chunk the new deployment no longer serves. A failure within 10 s of such a reload is rethrown.
 */
export function lazyWithReload<T extends ComponentType>(load: () => Promise<{ default: T }>) {
  return lazy(() =>
    load().then(
      (module) => {
        sessionStorage.removeItem(RELOADED_KEY);
        return module;
      },
      (error) => {
        if (Date.now() - Number(sessionStorage.getItem(RELOADED_KEY)) < RETRY_WINDOW_MS) throw error;
        sessionStorage.setItem(RELOADED_KEY, String(Date.now()));
        window.location.reload();
        return new Promise<never>(() => {});
      }
    )
  );
}
