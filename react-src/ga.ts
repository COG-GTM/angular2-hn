declare global {
    interface Window {
        ga?: (...args: unknown[]) => void;
    }
}

export function trackPageView(page: string) {
    if (typeof window.ga === 'function') {
        window.ga('set', 'page', page);
        window.ga('send', 'pageview');
    }
}
