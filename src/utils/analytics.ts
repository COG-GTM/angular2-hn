type GoogleAnalytics = (...args: unknown[]) => void;

declare global {
    interface Window {
        ga?: GoogleAnalytics;
    }
}

export function trackPageView(page: string): void {
    if (typeof window.ga !== 'function') {
        return;
    }
    window.ga('set', 'page', page);
    window.ga('send', 'pageview');
}
