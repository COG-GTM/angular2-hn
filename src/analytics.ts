declare global {
    interface Window {
        ga?: (...args: unknown[]) => void;
    }
}

export function sendPageView(url: string): void {
    if (typeof window.ga === 'function') {
        window.ga('set', 'page', url);
        window.ga('send', 'pageview');
    }
}
