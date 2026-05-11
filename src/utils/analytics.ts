type GoogleAnalyticsCommand = 'set' | 'send' | 'create' | string;

interface GoogleAnalyticsFn {
  (command: GoogleAnalyticsCommand, ...args: unknown[]): void;
  q?: unknown[];
  l?: number;
}

declare global {
  interface Window {
    ga?: GoogleAnalyticsFn;
  }
}

export function trackPageView(url: string): void {
  if (typeof window === 'undefined') return;
  const ga = window.ga;
  if (typeof ga !== 'function') return;
  ga('set', 'page', url);
  ga('send', 'pageview');
}
