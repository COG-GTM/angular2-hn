declare global {
    interface Window {
        ga?: (...args: unknown[]) => void;
    }
}

export function trackPageview(page: string): void {
    if (typeof window.ga !== 'function') {
        return;
    }

    window.ga('set', 'page', page);
    window.ga('send', 'pageview');
}
