export const API_HOSTS = ['node-hnapi.herokuapp.com', 'api.hnpwa.com'];

function apiResourceUrls(): string[] {
  const urls = performance
    .getEntriesByType('resource')
    .map((entry) => entry.name)
    .filter((url) => API_HOSTS.includes(new URL(url).hostname));
  return [...new Set(urls)];
}

// API requests made before the service worker takes control bypass its runtime cache,
// so on first install re-request them once through the worker to make them available offline.
export function warmApiCacheOnFirstControl(): void {
  if (!('serviceWorker' in navigator) || navigator.serviceWorker.controller) return;
  navigator.serviceWorker.addEventListener(
    'controllerchange',
    () => {
      for (const url of apiResourceUrls()) fetch(url).catch(() => undefined);
    },
    { once: true }
  );
}
