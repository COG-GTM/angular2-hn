declare global {
  interface Window {
    ga?: (...args: unknown[]) => void;
  }
}

// Mirrors AppComponent's NavigationEnd handler: report a pageview to Google
// Analytics whenever the route changes. No-op if the `ga` snippet is absent.
export function trackPageview(path: string): void {
  if (typeof window.ga === 'function') {
    window.ga('set', 'page', path);
    window.ga('send', 'pageview');
  }
}
